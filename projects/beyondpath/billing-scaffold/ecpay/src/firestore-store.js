/**
 * BeyondSpec × 綠界 — FirestoreStore（BillingStore 介面的「真記帳」實作）
 * ==================================================================
 * 這支把 store.js 的 InMemoryStore mock 換成【真 Firestore 寫入】，但：
 *   - webhook.js / cancel.js / receipt.js / authority.js 【一行不用改】——
 *     它們只認 BillingStore 的 7 個 method 介面，背後是 Map 還是 Firestore 不關它們的事。
 *   - 本批【不接真 Firebase / 不部署 / 零真金鑰】：服務帳號私鑰一律由 env 注入，
 *     單元測試用「假的 fetch + 假的 private key」跑（見 test/firestore-store.test.mjs）。
 *
 * 為什麼用 REST + 服務帳號 JWT，不用 firebase-admin（WORKER-INTEGRATION §3 路 A）：
 *   Cloudflare Worker 不是 Node 環境，跑不了 `firebase-admin`（Node-only、要 net/tls/fs）。
 *   標準做法：用服務帳號 private key 在 Worker 內【自己簽一個 JWT】→ 拿去 Google OAuth2
 *   token endpoint 換 access_token → 帶 Bearer 打 Firestore REST API。簽 JWT 用 Worker 原生
 *   WebCrypto（crypto.subtle，本批 checkmac.js 已在用 SHA-256），【不需任何 npm 套件】。
 *
 * 服務帳號私鑰 = 最高機密（沙利曼 §1 界線延伸，與 HashKey/HashIV 同級）：
 *   - 只從 env 注入（FIREBASE_SERVICE_ACCOUNT JSON 或 FIREBASE_CLIENT_EMAIL+FIREBASE_PRIVATE_KEY）。
 *   - 本檔【零金鑰字面】。永不落 git / prompt / log。
 *
 * 資料路徑（對齊 store.js 註解約定 / 沙利曼 spec）：
 *   users/{uid}/billing/state                       ← 訂閱權威狀態（單一 doc）
 *   users/{uid}/billing/receipts/{receiptNo}        ← 收據（legalRetention）
 *   users/{uid}/billing/transactions/{tradeNo}      ← 交易紀錄（legalRetention）
 *   processedWebhooks/{idempotencyKey}              ← 已處理通知（防重放）
 *
 * ⚠️ idempotent 原子性（WORKER-INTEGRATION §3「交易一致性」· 上線正確性命脈）：
 *   InMemoryStore 靠同步 Map「有/無」做原子。Firestore REST 沒有同步原子——get 後 set
 *   中間有空窗，高併發同筆 webhook 會雙解鎖。本實作用 Firestore【createDocument】
 *   （create-if-absent 語意）：對 processedWebhooks/{idemKey} 用 documentId 建檔，
 *   文件已存在 → Firestore 回 HTTP 409 → 我們接到 409 = 「已處理過」回 {created:false}。
 *   這是天然原子的 idempotent，不需 transaction（WORKER-INTEGRATION 建議的做法 1）。
 *
 * 執行環境：Cloudflare Worker（現代 JS + WebCrypto）。前端不引用本檔。
 *   為了能在 Node 跑 unit test（注入 fakeFetch），所有對外 I/O 都走注入的 fetchImpl，
 *   預設才 fallback 到 globalThis.fetch。
 */

'use strict';

import { BillingStore } from './store.js';

// Google OAuth2 token endpoint（換 access_token）。
const GOOGLE_TOKEN_URI = 'https://oauth2.googleapis.com/token';
// Firestore REST base（{proj} 由 projectId 代入）。
const FIRESTORE_BASE = 'https://firestore.googleapis.com/v1';
// 服務帳號要的 scope（Firestore 讀寫 = datastore scope）。
const FIRESTORE_SCOPE = 'https://www.googleapis.com/auth/datastore';
// access_token 提早多少毫秒過期（避免邊界用到剛好失效的 token）。
const TOKEN_SKEW_MS = 60 * 1000;

/* ──────────────────────────────────────────────────────────────────
 * 區段 A · base64url + PEM 解析 + JWT 簽章（WebCrypto RS256，無 npm）
 * ────────────────────────────────────────────────────────────────── */

/**
 * 標準 base64 → base64url（JWT 用：+→-、/→_、去尾 =）。
 * @param {string} b64
 * @returns {string}
 */
function b64ToB64url(b64) {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * 字串 → base64url。用 btoa（Worker 原生；Node ≥ 16 全域可用）。
 * 注意：JWT header/payload 是 UTF-8 JSON；先 encodeURIComponent→escape 兼容非 ASCII。
 * @param {string} str
 * @returns {string}
 */
function strToB64url(str) {
  // 把 UTF-8 字串轉成 binary string 再 btoa（處理中文等多位元組）。
  const utf8 = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < utf8.length; i++) bin += String.fromCharCode(utf8[i]);
  return b64ToB64url(btoa(bin));
}

/**
 * base64（標準）→ Uint8Array。用 atob（Worker 原生）。
 * @param {string} b64
 * @returns {Uint8Array}
 */
function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/**
 * 把服務帳號 PEM（PKCS#8「-----BEGIN PRIVATE KEY-----」）的 base64 內文抽出來。
 * 服務帳號 JSON 的 private_key 常含字面 "\n"（被 JSON 轉義），這裡一併還原成真換行。
 * @param {string} pem
 * @returns {Uint8Array} DER bytes（PKCS#8）
 */
function pemToDer(pem) {
  const clean = String(pem || '')
    .replace(/\\n/g, '\n')                       // JSON 轉義的 \n → 真換行
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '');                         // 去掉所有空白/換行 → 純 base64
  return b64ToBytes(clean);
}

/**
 * 匯入 PKCS#8 RSA private key 給 RS256 簽章用。
 * @param {string} pem  服務帳號 private_key（PEM）
 * @param {SubtleCrypto} subtle
 * @returns {Promise<CryptoKey>}
 */
async function importRsaPrivateKey(pem, subtle) {
  const der = pemToDer(pem);
  return subtle.importKey(
    'pkcs8',
    der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

/**
 * 用服務帳號簽一個 Google OAuth2 用的 JWT（RS256）。
 *   claim：iss/sub=client_email、aud=token endpoint、scope=datastore、exp=now+1h。
 * @param {Object} sa  { client_email, private_key }
 * @param {SubtleCrypto} subtle
 * @param {function} [nowFn]  注入時鐘（測試）→ 回毫秒
 * @returns {Promise<string>} 已簽章 JWT（header.payload.signature）
 */
async function signServiceAccountJwt(sa, subtle, nowFn) {
  const nowMs = (nowFn || Date.now)();
  const iat = Math.floor(nowMs / 1000);
  const exp = iat + 3600;                          // Google 上限 1h
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: sa.client_email,
    sub: sa.client_email,
    aud: GOOGLE_TOKEN_URI,
    scope: FIRESTORE_SCOPE,
    iat: iat,
    exp: exp,
  };
  const signingInput = strToB64url(JSON.stringify(header)) + '.' + strToB64url(JSON.stringify(claim));
  const key = await importRsaPrivateKey(sa.private_key, subtle);
  const sigBuf = await subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    new TextEncoder().encode(signingInput)
  );
  // ArrayBuffer → base64url
  const sigBytes = new Uint8Array(sigBuf);
  let bin = '';
  for (let i = 0; i < sigBytes.length; i++) bin += String.fromCharCode(sigBytes[i]);
  const sigB64url = b64ToB64url(btoa(bin));
  return signingInput + '.' + sigB64url;
}

/* ──────────────────────────────────────────────────────────────────
 * 區段 B · Firestore 值 <-> JS 值 轉換（REST 的 typed value 格式）
 * ────────────────────────────────────────────────────────────────── */

/**
 * JS 值 → Firestore REST「typed value」。
 *   string→stringValue、整數→integerValue（字串型，避免 JS 精度）、
 *   其他數→doubleValue、boolean→booleanValue、null→nullValue、
 *   array→arrayValue、object→mapValue。Date 以毫秒 integer 存（與 InMemoryStore 一致：
 *   原本 store 存的 paidAt 等就是 Date.now() 毫秒數字，故 timestamp 也走 integer）。
 * @param {*} v
 * @returns {Object}
 */
function toFsValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  const t = typeof v;
  if (t === 'boolean') return { booleanValue: v };
  if (t === 'number') {
    if (Number.isInteger(v)) return { integerValue: String(v) };
    return { doubleValue: v };
  }
  if (t === 'string') return { stringValue: v };
  if (Array.isArray(v)) {
    return { arrayValue: { values: v.map(toFsValue) } };
  }
  if (t === 'object') {
    const fields = {};
    for (const k in v) {
      if (Object.prototype.hasOwnProperty.call(v, k)) fields[k] = toFsValue(v[k]);
    }
    return { mapValue: { fields: fields } };
  }
  // 兜底（function/symbol 不該進來）→ 轉字串。
  return { stringValue: String(v) };
}

/**
 * 一個 JS 物件 → Firestore document 的 fields map。
 * @param {Object} obj
 * @returns {Object} { fieldName: typedValue, ... }
 */
function toFsFields(obj) {
  const fields = {};
  const o = obj || {};
  for (const k in o) {
    if (Object.prototype.hasOwnProperty.call(o, k)) fields[k] = toFsValue(o[k]);
  }
  return fields;
}

/**
 * Firestore REST「typed value」→ JS 值（反向）。
 * @param {Object} val
 * @returns {*}
 */
function fromFsValue(val) {
  if (!val || typeof val !== 'object') return undefined;
  if ('nullValue' in val) return null;
  if ('booleanValue' in val) return val.booleanValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return val.doubleValue;
  if ('stringValue' in val) return val.stringValue;
  if ('timestampValue' in val) return val.timestampValue;   // 若有人用真 timestamp 存
  if ('arrayValue' in val) {
    const vals = (val.arrayValue && val.arrayValue.values) || [];
    return vals.map(fromFsValue);
  }
  if ('mapValue' in val) {
    return fromFsFields((val.mapValue && val.mapValue.fields) || {});
  }
  return undefined;
}

/**
 * Firestore document.fields → JS 物件（反向）。
 * @param {Object} fields
 * @returns {Object}
 */
function fromFsFields(fields) {
  const out = {};
  const f = fields || {};
  for (const k in f) {
    if (Object.prototype.hasOwnProperty.call(f, k)) out[k] = fromFsValue(f[k]);
  }
  return out;
}

/* ──────────────────────────────────────────────────────────────────
 * 區段 C · FirestoreStore（實作 BillingStore 七法）
 * ────────────────────────────────────────────────────────────────── */

/**
 * 從 env 解析服務帳號（兩種注入法都收）：
 *   (A) env.FIREBASE_SERVICE_ACCOUNT = 整包 JSON 字串（建議；一個 secret 搞定）。
 *   (B) env.FIREBASE_CLIENT_EMAIL + env.FIREBASE_PRIVATE_KEY + env.FIREBASE_PROJECT_ID（分開三個）。
 * @param {Object} env
 * @returns {{client_email:string, private_key:string, project_id:string}}
 * @throws 若缺必要欄位（部署未設 secret）。
 */
function resolveServiceAccount(env) {
  env = env || {};
  let sa = null;
  if (env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      sa = typeof env.FIREBASE_SERVICE_ACCOUNT === 'string'
        ? JSON.parse(env.FIREBASE_SERVICE_ACCOUNT)
        : env.FIREBASE_SERVICE_ACCOUNT;
    } catch (e) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT not valid JSON');
    }
  } else if (env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
    sa = {
      client_email: env.FIREBASE_CLIENT_EMAIL,
      private_key: env.FIREBASE_PRIVATE_KEY,
      project_id: env.FIREBASE_PROJECT_ID || '',
    };
  }
  if (!sa || !sa.client_email || !sa.private_key) {
    throw new Error('firebase service account not configured');
  }
  // project_id 優先服務帳號內，再退 env，再退（最後 getter 會擋）。
  sa.project_id = sa.project_id || env.FIREBASE_PROJECT_ID || '';
  if (!sa.project_id) throw new Error('firebase project_id not configured');
  return sa;
}

class FirestoreStore extends BillingStore {
  /**
   * @param {Object} env  Worker env（含 FIREBASE_SERVICE_ACCOUNT 等 secret）
   * @param {Object} [deps]  測試/注入：
   *   @param {function} [deps.fetchImpl]  async (url, init) => Response-like
   *   @param {SubtleCrypto} [deps.subtle]  預設 globalThis.crypto.subtle
   *   @param {function} [deps.now]  毫秒時鐘
   */
  constructor(env, deps) {
    super();
    deps = deps || {};
    this._env = env || {};
    this._fetch = deps.fetchImpl || ((u, init) => fetch(u, init));
    this._subtle = deps.subtle || (globalThis.crypto && globalThis.crypto.subtle) || null;
    this._now = deps.now || Date.now;
    if (!this._subtle) throw new Error('WebCrypto subtle unavailable (need Worker / Node>=16)');
    // 服務帳號 + access_token 快取（lazily resolved；建構不簽章，避免每次都重簽）。
    this._sa = null;
    this._token = null;          // { value, expMs }
  }

  /** lazily 解析服務帳號（第一次用到才解，建構不報錯——方便沒設金鑰時仍能 new 起來測別的）。 */
  _serviceAccount() {
    if (!this._sa) this._sa = resolveServiceAccount(this._env);
    return this._sa;
  }

  /** project_id（document path 用）。 */
  _projectId() {
    return this._serviceAccount().project_id;
  }

  /**
   * 取一個有效的 access_token（快取 + 提早 60s 換新）。
   * 流程：簽服務帳號 JWT → POST Google token endpoint（grant_type=jwt-bearer）→ 拿 access_token。
   * @returns {Promise<string>}
   */
  async _accessToken() {
    const nowMs = this._now();
    if (this._token && this._token.value && this._token.expMs - TOKEN_SKEW_MS > nowMs) {
      return this._token.value;                    // 快取仍有效
    }
    const sa = this._serviceAccount();
    const jwt = await signServiceAccountJwt(sa, this._subtle, this._now);
    const body = new URLSearchParams();
    body.set('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
    body.set('assertion', jwt);

    const resp = await this._fetch(GOOGLE_TOKEN_URI, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const status = (resp && typeof resp.status === 'number') ? resp.status : 0;
    let data = {};
    try { data = resp && typeof resp.json === 'function' ? await resp.json() : {}; } catch (e) { data = {}; }
    if (status < 200 || status >= 300 || !data.access_token) {
      throw new Error('oauth token exchange failed: ' + status + ' ' + (data.error || ''));
    }
    const ttlMs = (Number(data.expires_in) || 3600) * 1000;
    this._token = { value: data.access_token, expMs: nowMs + ttlMs };
    return this._token.value;
  }

  /** 組 Firestore document REST URL。docPath 例：'users/u1/billing/state'。 */
  _docUrl(docPath) {
    return FIRESTORE_BASE + '/projects/' + encodeURIComponent(this._projectId()) +
      '/databases/(default)/documents/' + docPath;
  }

  /** 帶 Bearer 打 Firestore REST。回 { status, json }。 */
  async _fsFetch(url, init) {
    const token = await this._accessToken();
    const headers = Object.assign(
      { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      (init && init.headers) || {}
    );
    const resp = await this._fetch(url, Object.assign({}, init, { headers: headers }));
    const status = (resp && typeof resp.status === 'number') ? resp.status : 0;
    let json = null;
    try { json = resp && typeof resp.json === 'function' ? await resp.json() : null; } catch (e) { json = null; }
    return { status: status, json: json };
  }

  // ── BillingStore 介面實作（語意對齊 InMemoryStore / store.test.mjs）──

  /**
   * 讀訂閱權威狀態 doc。不存在 → null（Firestore GET 不存在回 404）。
   * @param {string} uid
   * @returns {Promise<Object|null>}
   */
  async getBilling(uid) {
    const url = this._docUrl('users/' + encodeURIComponent(uid) + '/billing/state');
    const r = await this._fsFetch(url, { method: 'GET' });
    if (r.status === 404) return null;
    if (r.status < 200 || r.status >= 300) {
      throw new Error('getBilling failed: ' + r.status);
    }
    return r.json && r.json.fields ? fromFsFields(r.json.fields) : null;
  }

  /**
   * merge 寫入訂閱狀態（模擬 Firestore set({merge:true})）。
   *   REST 做法：PATCH 文件 + updateMask.fieldPaths=要寫的欄位 → 只動這些欄位、不清其他。
   *   PATCH 不存在的文件會【自動建立】（Firestore REST 行為），等同 setBilling 首寫。
   *   回傳「合併後的完整狀態」（與 InMemoryStore 一致：回 next 全貌）→ 需先讀舊再覆。
   * @param {string} uid
   * @param {Object} data
   * @returns {Promise<Object>} 合併後完整 billing
   */
  async setBilling(uid, data) {
    const docPath = 'users/' + encodeURIComponent(uid) + '/billing/state';
    const fieldNames = Object.keys(data || {});
    // updateMask：只更新 data 帶的欄位（其餘保留）→ 真 merge。
    const maskQs = fieldNames
      .map((f) => 'updateMask.fieldPaths=' + encodeURIComponent(f))
      .join('&');
    const url = this._docUrl(docPath) + (maskQs ? ('?' + maskQs) : '');
    const r = await this._fsFetch(url, {
      method: 'PATCH',
      body: JSON.stringify({ fields: toFsFields(data) }),
    });
    if (r.status < 200 || r.status >= 300) {
      throw new Error('setBilling failed: ' + r.status);
    }
    // Firestore PATCH 回的是「該文件目前全貌」（含未在 mask 內的舊欄位）→ 直接轉回。
    return r.json && r.json.fields ? fromFsFields(r.json.fields) : (data || {});
  }

  /**
   * 讀已處理通知紀錄。不存在 → null。
   * @param {string} key  idempotency key
   * @returns {Promise<Object|null>}
   */
  async getProcessedWebhook(key) {
    const url = this._docUrl('processedWebhooks/' + encodeURIComponent(key));
    const r = await this._fsFetch(url, { method: 'GET' });
    if (r.status === 404) return null;
    if (r.status < 200 || r.status >= 300) {
      throw new Error('getProcessedWebhook failed: ' + r.status);
    }
    return r.json && r.json.fields ? fromFsFields(r.json.fields) : null;
  }

  /**
   * 記一筆「已處理」——【原子 idempotent 命脈】（WORKER-INTEGRATION §3 做法 1）。
   *   用 Firestore createDocument（documentId 指定）：
   *     POST .../processedWebhooks?documentId={key}
   *   文件不存在 → 建立成功（2xx）→ 回 { created:true }。
   *   文件已存在 → Firestore 回 HTTP 409 ALREADY_EXISTS → 回 { created:false, existing }。
   *   這是【天然原子】：併發兩個同 key create，只有一個 2xx、另一個必 409，
   *   故同筆 webhook 只會解鎖一次（不需 transaction）。
   * @param {string} key
   * @param {Object} meta
   * @returns {Promise<{created:boolean, existing?:Object}>}
   */
  async markProcessedWebhook(key, meta) {
    // createDocument：在 parent collection POST，用 query documentId 指定 doc id。
    const parent = FIRESTORE_BASE + '/projects/' + encodeURIComponent(this._projectId()) +
      '/databases/(default)/documents';
    const url = parent + '/processedWebhooks?documentId=' + encodeURIComponent(key);
    const r = await this._fsFetch(url, {
      method: 'POST',
      body: JSON.stringify({ fields: toFsFields(meta || {}) }),
    });
    if (r.status === 409) {
      // 已存在 = 已處理過（重放 / 重送）。撈既有紀錄回傳（與 InMemoryStore 一致提供 existing）。
      let existing = null;
      try { existing = await this.getProcessedWebhook(key); } catch (e) { existing = null; }
      return { created: false, existing: existing || {} };
    }
    if (r.status < 200 || r.status >= 300) {
      throw new Error('markProcessedWebhook failed: ' + r.status);
    }
    return { created: true };
  }

  /**
   * 寫收據（獨立 collection + 強制 legalRetention=true，與 InMemoryStore 一致）。
   *   用 createDocument（receiptNo 當 doc id）；收據不該被覆寫，create 語意正確
   *   （同 receiptNo 重開 → 409，視為已開過、回既有）。
   * @param {string} uid
   * @param {string} receiptNo
   * @param {Object} data
   * @returns {Promise<Object>} 已寫入的收據（含 legalRetention）
   */
  async saveReceipt(uid, receiptNo, data) {
    const rec = Object.assign({ legalRetention: true }, data || {});
    const parent = FIRESTORE_BASE + '/projects/' + encodeURIComponent(this._projectId()) +
      '/databases/(default)/documents/users/' + encodeURIComponent(uid) + '/billing/receipts';
    const url = parent + '?documentId=' + encodeURIComponent(receiptNo);
    const r = await this._fsFetch(url, {
      method: 'POST',
      body: JSON.stringify({ fields: toFsFields(rec) }),
    });
    if (r.status === 409) {
      // 同收據已存在 → 回既有（idempotent；不重複開）。
      let existing = null;
      try { existing = await this.getReceipt(uid, receiptNo); } catch (e) { existing = null; }
      return existing || rec;
    }
    if (r.status < 200 || r.status >= 300) {
      throw new Error('saveReceipt failed: ' + r.status);
    }
    return r.json && r.json.fields ? fromFsFields(r.json.fields) : rec;
  }

  /**
   * 讀收據。不存在 → null。
   * @param {string} uid
   * @param {string} receiptNo
   * @returns {Promise<Object|null>}
   */
  async getReceipt(uid, receiptNo) {
    const url = this._docUrl('users/' + encodeURIComponent(uid) + '/billing/receipts/' + encodeURIComponent(receiptNo));
    const r = await this._fsFetch(url, { method: 'GET' });
    if (r.status === 404) return null;
    if (r.status < 200 || r.status >= 300) {
      throw new Error('getReceipt failed: ' + r.status);
    }
    return r.json && r.json.fields ? fromFsFields(r.json.fields) : null;
  }

  /**
   * 寫交易紀錄（獨立 collection + 強制 legalRetention=true）。
   *   create 語意（tradeNo 當 doc id）；同筆交易重寫 → 409 視為已記、回既有。
   * @param {string} uid
   * @param {string} tradeNo
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async saveTransaction(uid, tradeNo, data) {
    const tx = Object.assign({ legalRetention: true }, data || {});
    const parent = FIRESTORE_BASE + '/projects/' + encodeURIComponent(this._projectId()) +
      '/databases/(default)/documents/users/' + encodeURIComponent(uid) + '/billing/transactions';
    const url = parent + '?documentId=' + encodeURIComponent(tradeNo);
    const r = await this._fsFetch(url, {
      method: 'POST',
      body: JSON.stringify({ fields: toFsFields(tx) }),
    });
    if (r.status === 409) {
      let existing = null;
      try {
        const gurl = this._docUrl('users/' + encodeURIComponent(uid) + '/billing/transactions/' + encodeURIComponent(tradeNo));
        const gr = await this._fsFetch(gurl, { method: 'GET' });
        existing = gr.json && gr.json.fields ? fromFsFields(gr.json.fields) : null;
      } catch (e) { existing = null; }
      return existing || tx;
    }
    if (r.status < 200 || r.status >= 300) {
      throw new Error('saveTransaction failed: ' + r.status);
    }
    return r.json && r.json.fields ? fromFsFields(r.json.fields) : tx;
  }
}

/**
 * 工廠：Worker 端 `makeFirestoreStore(env)`（WORKER-INTEGRATION §2 引用名）。
 * @param {Object} env
 * @param {Object} [deps]
 * @returns {FirestoreStore}
 */
function makeFirestoreStore(env, deps) {
  return new FirestoreStore(env, deps);
}

// 內部工具一併 export，方便單元測試逐段驗（base64url / typed value 轉換 / JWT）。
const _api = {
  FirestoreStore,
  makeFirestoreStore,
  resolveServiceAccount,
  // 低階工具（測試用）
  b64ToB64url,
  strToB64url,
  pemToDer,
  signServiceAccountJwt,
  importRsaPrivateKey,
  toFsValue,
  toFsFields,
  fromFsValue,
  fromFsFields,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = _api;
}

export {
  FirestoreStore,
  makeFirestoreStore,
  resolveServiceAccount,
  b64ToB64url,
  strToB64url,
  pemToDer,
  signServiceAccountJwt,
  importRsaPrivateKey,
  toFsValue,
  toFsFields,
  fromFsValue,
  fromFsFields,
};
