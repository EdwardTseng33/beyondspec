/**
 * FirestoreStore — 單元測試（mock fetch · 零真 Firebase · 零真金鑰）
 * ------------------------------------------------------------------
 * 驗的事（對齊 store.test.mjs 既有 InMemoryStore 契約 + WORKER-INTEGRATION §3）：
 *   1. typed value 轉換往返（JS <-> Firestore REST value）。
 *   2. JWT 真的用 WebCrypto RS256 簽得出來（測試用「程式碼當場產的」RSA 金鑰，非 Edward 真金鑰）。
 *   3. access_token 換取 + 快取（不會每次呼叫都重打 token endpoint）。
 *   4. getBilling 404 → null；setBilling PATCH 帶 updateMask（merge）。
 *   5. ⭐ markProcessedWebhook：create 成功 → {created:true}；
 *      第二次同 key 撞 HTTP 409 → {created:false}（原子 idempotent 命脈）。
 *   6. saveReceipt / saveTransaction 自動 legalRetention + 走 createDocument。
 *   7. 缺服務帳號 → 用到時才丟「not configured」（不誤擋 new）。
 *
 * 跑法：node test/firestore-store.test.mjs   全過 exit 0 / fail exit 1
 *
 * ⚠️ 安全：本檔【不含任何真金鑰】。RSA 金鑰是 runtime 用 crypto.subtle.generateKey 產的，
 *    用完即丟、只活在這次測試行程記憶體；Firebase 完全沒被連（fetch 全 mock）。
 */

import {
  FirestoreStore,
  makeFirestoreStore,
  resolveServiceAccount,
  toFsValue,
  toFsFields,
  fromFsValue,
  fromFsFields,
  strToB64url,
  signServiceAccountJwt,
} from '../src/firestore-store.js';

let passed = 0, failed = 0;
const failures = [];
function eq(name, a, b) {
  if (a === b) { passed++; console.log('  ✓ ' + name); }
  else { failed++; failures.push(name); console.log('  ✗ ' + name + '\n     exp: ' + JSON.stringify(b) + '\n     got: ' + JSON.stringify(a)); }
}
function ok(name, c) { eq(name, !!c, true); }
function deepEq(name, a, b) { eq(name, JSON.stringify(a), JSON.stringify(b)); }

const subtle = globalThis.crypto.subtle;

/**
 * 產一組「測試用」RSA 金鑰，匯出成 PKCS#8 PEM（模擬服務帳號 private_key 的型態）。
 * 這不是 Edward 的真服務帳號——只為了讓 RS256 簽章路徑真的跑得起來。
 */
async function genTestServiceAccount() {
  const pair = await subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify']
  );
  const pkcs8 = await subtle.exportKey('pkcs8', pair.privateKey);
  const bytes = new Uint8Array(pkcs8);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = Buffer.from(bin, 'binary').toString('base64');
  const pem = '-----BEGIN PRIVATE KEY-----\n' + (b64.match(/.{1,64}/g).join('\n')) + '\n-----END PRIVATE KEY-----\n';
  return {
    sa: { client_email: 'test-bot@bs-test.iam.gserviceaccount.com', private_key: pem, project_id: 'bs-test-proj' },
    publicKey: pair.publicKey,
  };
}

/**
 * 建一個可程式化的 fake fetch：
 *   - 認得 Google token endpoint → 回固定 access_token（記錄被打幾次）。
 *   - 認得 Firestore REST → 交給 routes（依 method+url 決定 status/json）。
 * 回傳 { fetchImpl, calls, tokenHits }。
 */
function makeFakeFetch(routes) {
  const calls = [];
  let tokenHits = 0;
  const fetchImpl = async (url, init) => {
    init = init || {};
    calls.push({ url: url, method: init.method || 'GET', body: init.body, headers: init.headers });
    if (String(url).indexOf('oauth2.googleapis.com/token') !== -1) {
      tokenHits++;
      return { status: 200, json: async () => ({ access_token: 'fake-access-token-' + tokenHits, expires_in: 3600 }) };
    }
    const handler = routes(String(url), init);
    return handler;
  };
  return { fetchImpl: fetchImpl, calls: calls, get tokenHits() { return tokenHits; } };
}

/** 包一個 Firestore doc 回應（fields 由 JS 物件轉）。 */
function fsDocResponse(obj, status) {
  return { status: status || 200, json: async () => ({ name: 'doc', fields: toFsFields(obj) }) };
}
function fsStatus(status, json) {
  return { status: status, json: async () => (json || {}) };
}

async function run() {
  console.log('\nFirestoreStore · 單元測試（mock fetch · 零真金鑰）\n');

  const { sa, publicKey } = await genTestServiceAccount();
  const env = { FIREBASE_SERVICE_ACCOUNT: JSON.stringify(sa) };
  const fixedNow = () => 1_700_000_000_000;   // 固定時鐘

  // ── 1. typed value 往返 ──
  console.log('[1] Firestore typed value <-> JS 往返');
  {
    deepEq('string', toFsValue('hi'), { stringValue: 'hi' });
    deepEq('integer', toFsValue(499), { integerValue: '499' });
    deepEq('double', toFsValue(1.5), { doubleValue: 1.5 });
    deepEq('boolean', toFsValue(true), { booleanValue: true });
    deepEq('null', toFsValue(null), { nullValue: null });
    deepEq('array', toFsValue([1, 'a']), { arrayValue: { values: [{ integerValue: '1' }, { stringValue: 'a' }] } });
    // 巢狀物件 + 陣列往返
    const obj = { plan: 'pro', amount: 499, active: true, refunds: [{ id: 'r1', amt: 499 }], meta: null };
    const round = fromFsFields(toFsFields(obj));
    deepEq('物件深層往返一致', round, obj);
    eq('fromFsValue integer → number', fromFsValue({ integerValue: '12' }), 12);
  }

  // ── 2. JWT 真簽得出來（RS256 + 簽章可被對應公鑰驗證）──
  console.log('\n[2] JWT RS256 簽章（WebCrypto · 簽章可驗）');
  {
    const jwt = await signServiceAccountJwt(sa, subtle, fixedNow);
    const parts = jwt.split('.');
    eq('JWT 三段', parts.length, 3);
    // header decode
    const headerJson = JSON.parse(Buffer.from(parts[0].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    eq('alg=RS256', headerJson.alg, 'RS256');
    const claimJson = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    eq('aud=google token uri', claimJson.aud, 'https://oauth2.googleapis.com/token');
    eq('iss=client_email', claimJson.iss, sa.client_email);
    eq('scope=datastore', claimJson.scope, 'https://www.googleapis.com/auth/datastore');
    eq('exp = iat + 3600', claimJson.exp - claimJson.iat, 3600);
    // 用公鑰驗簽章（證明簽出來的東西是真的 RS256，不是亂湊）
    const signingInput = parts[0] + '.' + parts[1];
    const sigBytes = Uint8Array.from(Buffer.from(parts[2].replace(/-/g, '+').replace(/_/g, '/'), 'base64'));
    const verified = await subtle.verify(
      { name: 'RSASSA-PKCS1-v1_5' }, publicKey, sigBytes, new TextEncoder().encode(signingInput)
    );
    ok('簽章可被對應公鑰驗證通過', verified);
  }

  // ── 3. access_token 換取 + 快取 ──
  console.log('\n[3] access_token 換取 + 快取（不重複打 token endpoint）');
  {
    const fake = makeFakeFetch((url) => fsDocResponse({ plan: 'pro' }, 200));
    const store = new FirestoreStore(env, { fetchImpl: fake.fetchImpl, subtle: subtle, now: fixedNow });
    await store.getBilling('u1');
    await store.getBilling('u1');   // 第二次應重用快取 token，不再打 token endpoint
    eq('token endpoint 只打 1 次（快取）', fake.tokenHits, 1);
    // 確認有帶 Bearer
    const fsCall = fake.calls.find((c) => String(c.url).indexOf('firestore.googleapis.com') !== -1);
    ok('Firestore 請求帶 Bearer', fsCall && fsCall.headers && String(fsCall.headers.Authorization).indexOf('Bearer ') === 0);
  }

  // ── 4. getBilling 404 → null ──
  console.log('\n[4] getBilling — 文件不存在（404）→ null');
  {
    const fake = makeFakeFetch((url) => fsStatus(404, { error: { status: 'NOT_FOUND' } }));
    const store = new FirestoreStore(env, { fetchImpl: fake.fetchImpl, subtle: subtle, now: fixedNow });
    eq('不存在 → null', await store.getBilling('nope'), null);
  }

  // ── 5. setBilling — PATCH + updateMask（merge），回合併後全貌 ──
  console.log('\n[5] setBilling — PATCH 帶 updateMask（merge 語意）');
  {
    let lastBody = null;
    const fake = makeFakeFetch((url, init) => {
      if (init.method === 'PATCH') {
        lastBody = init.body;
        // 模擬 Firestore 回「合併後文件全貌」：舊有 plan/amount + 新寫 billingStatus
        return fsDocResponse({ plan: 'pro', amount: 499, billingStatus: 'cancelled', cancelledAt: 123 }, 200);
      }
      return fsStatus(500, {});
    });
    const store = new FirestoreStore(env, { fetchImpl: fake.fetchImpl, subtle: subtle, now: fixedNow });
    const out = await store.setBilling('u1', { billingStatus: 'cancelled', cancelledAt: 123 });
    // URL 帶 updateMask.fieldPaths（只更新這兩欄 → merge）
    const patchCall = fake.calls.find((c) => c.method === 'PATCH');
    ok('URL 含 updateMask.fieldPaths=billingStatus', String(patchCall.url).indexOf('updateMask.fieldPaths=billingStatus') !== -1);
    ok('URL 含 updateMask.fieldPaths=cancelledAt', String(patchCall.url).indexOf('updateMask.fieldPaths=cancelledAt') !== -1);
    ok('body 只送有寫的欄位（不含 plan）', lastBody.indexOf('"plan"') === -1);
    // 回傳是合併後全貌（含未送的舊 plan）
    eq('回傳保留舊 plan（merge）', out.plan, 'pro');
    eq('回傳 amount 保留', out.amount, 499);
    eq('回傳 billingStatus 更新', out.billingStatus, 'cancelled');
  }

  // ── 6. ⭐ markProcessedWebhook — create 成功 / 第二次 409（原子 idempotent）──
  console.log('\n[6] ⭐ markProcessedWebhook — createDocument 409 = 已處理（原子 idempotent）');
  {
    const docs = {};   // 模擬 processedWebhooks collection：key → meta
    const fake = makeFakeFetch((url, init) => {
      const m = String(url).match(/processedWebhooks\?documentId=([^&]+)/);
      if (init.method === 'POST' && m) {
        const key = decodeURIComponent(m[1]);
        if (Object.prototype.hasOwnProperty.call(docs, key)) {
          return fsStatus(409, { error: { status: 'ALREADY_EXISTS', message: 'document already exists' } });
        }
        docs[key] = init.body;
        return fsDocResponse({ ok: true }, 200);
      }
      // GET processedWebhooks/{key}（409 後撈既有）
      const gm = String(url).match(/processedWebhooks\/([^/?]+)$/);
      if (init.method === 'GET' && gm) {
        const key = decodeURIComponent(gm[1]);
        if (Object.prototype.hasOwnProperty.call(docs, key)) return fsDocResponse({ at: 1, uid: 'u1' }, 200);
        return fsStatus(404, {});
      }
      return fsStatus(500, {});
    });
    const store = new FirestoreStore(env, { fetchImpl: fake.fetchImpl, subtle: subtle, now: fixedNow });
    const first = await store.markProcessedWebhook('K1', { at: 1, uid: 'u1' });
    const second = await store.markProcessedWebhook('K1', { at: 2, uid: 'u1' });
    eq('第 1 次 created:true', first.created, true);
    eq('第 2 次 created:false（撞 409）', second.created, false);
    ok('第 2 次回 existing（撈得到舊紀錄）', second.existing && second.existing.at === 1);
    // create POST 用對 collection + documentId（找 Firestore 的 POST，跳過 OAuth token 的 POST）
    const postCall = fake.calls.find((c) => c.method === 'POST' && String(c.url).indexOf('firestore.googleapis.com') !== -1);
    ok('create 走 processedWebhooks?documentId=K1', String(postCall.url).indexOf('processedWebhooks?documentId=K1') !== -1);
  }

  // ── 7. saveReceipt / saveTransaction — 自動 legalRetention + createDocument ──
  console.log('\n[7] saveReceipt / saveTransaction — legalRetention + createDocument');
  {
    let receiptBody = null, txUrl = null;
    const fake = makeFakeFetch((url, init) => {
      if (init.method === 'POST' && String(url).indexOf('/billing/receipts?documentId=') !== -1) {
        receiptBody = init.body;
        return fsDocResponse(Object.assign({ legalRetention: true }, JSON.parse('{"amount":499}')), 200);
      }
      if (init.method === 'POST' && String(url).indexOf('/billing/transactions?documentId=') !== -1) {
        txUrl = String(url);
        return fsDocResponse({ legalRetention: true, amount: 499 }, 200);
      }
      return fsStatus(500, {});
    });
    const store = new FirestoreStore(env, { fetchImpl: fake.fetchImpl, subtle: subtle, now: fixedNow });
    const rec = await store.saveReceipt('u1', 'RC1', { amount: 499 });
    const tx = await store.saveTransaction('u1', 'T1', { amount: 499 });
    ok('收據 body 自動含 legalRetention', receiptBody.indexOf('legalRetention') !== -1);
    eq('收據回傳 legalRetention=true', rec.legalRetention, true);
    eq('交易回傳 legalRetention=true', tx.legalRetention, true);
    ok('交易走 transactions?documentId=T1', txUrl.indexOf('transactions?documentId=T1') !== -1);
  }

  // ── 8. saveReceipt 409 → 回既有（idempotent，不重複開收據）──
  console.log('\n[8] saveReceipt — 同收據已存在（409）→ 回既有');
  {
    const fake = makeFakeFetch((url, init) => {
      if (init.method === 'POST') return fsStatus(409, { error: { status: 'ALREADY_EXISTS' } });
      if (init.method === 'GET') return fsDocResponse({ legalRetention: true, amount: 499, receiptNo: 'RC1' }, 200);
      return fsStatus(500, {});
    });
    const store = new FirestoreStore(env, { fetchImpl: fake.fetchImpl, subtle: subtle, now: fixedNow });
    const rec = await store.saveReceipt('u1', 'RC1', { amount: 499 });
    eq('409 後回既有收據', rec.receiptNo, 'RC1');
    eq('既有收據 legalRetention', rec.legalRetention, true);
  }

  // ── 9. 缺服務帳號 → 用到時才丟（不誤擋 new）──
  console.log('\n[9] 缺服務帳號 secret — 用到才丟「not configured」');
  {
    let threwOnNew = false;
    let store;
    try { store = new FirestoreStore({}, { fetchImpl: async () => fsStatus(200, {}), subtle: subtle, now: fixedNow }); }
    catch (e) { threwOnNew = true; }
    ok('new 不因缺金鑰而炸（lazy）', !threwOnNew);
    let threwOnUse = false;
    try { await store.getBilling('u1'); } catch (e) { threwOnUse = String(e.message).indexOf('not configured') !== -1; }
    ok('實際用到才丟 not configured', threwOnUse);
    // resolveServiceAccount 兩種注入法
    const saA = resolveServiceAccount({ FIREBASE_SERVICE_ACCOUNT: JSON.stringify({ client_email: 'a@b', private_key: 'k', project_id: 'p' }) });
    eq('注入法 A（整包 JSON）', saA.project_id, 'p');
    const saB = resolveServiceAccount({ FIREBASE_CLIENT_EMAIL: 'a@b', FIREBASE_PRIVATE_KEY: 'k', FIREBASE_PROJECT_ID: 'p2' });
    eq('注入法 B（分開三 secret）', saB.client_email, 'a@b');
  }

  // ── 10. 介面相容：FirestoreStore 是 BillingStore，七法齊備 ──
  console.log('\n[10] 介面相容 — 七個 method 都在（webhook/cancel 才接得上）');
  {
    const store = makeFirestoreStore(env, { fetchImpl: async () => fsStatus(200, {}), subtle: subtle, now: fixedNow });
    const methods = ['getBilling', 'setBilling', 'getProcessedWebhook', 'markProcessedWebhook', 'saveReceipt', 'getReceipt', 'saveTransaction'];
    let allFns = true;
    for (const m of methods) { if (typeof store[m] !== 'function') { allFns = false; } }
    ok('七法皆為 function', allFns);
  }

  // ── 結算 ──
  console.log('\n' + '='.repeat(52));
  console.log('結果： ' + passed + ' passed, ' + failed + ' failed');
  if (failed > 0) { console.log('FAIL: ' + failures.join(', ')); process.exit(1); }
  else { console.log('ALL GREEN ✓'); process.exit(0); }
}

run().catch((e) => { console.error('測試執行錯誤：', e); process.exit(1); });
