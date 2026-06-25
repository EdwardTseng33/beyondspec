/**
 * BeyondSpec × 綠界 — 扣款失敗 dunning 狀態機（漏財防線 · Edward 親點）
 * ==================================================================
 * 解決的問題（sandbox D1 / D2 · trust spec Step 7 · tech plan Step 7）：
 *   定期定額【每期】由綠界排程扣款，失敗（卡片過期 / 額度不足）時若我們
 *   「立刻斷服務」→ 用戶體驗差、流失；若「永遠不斷」→ 漏財（白吃服務）。
 *   正確做法 = dunning（催款）狀態機：失敗先進【寬限期】仍可用 + 寄信請補卡，
 *   連續失敗 / 寬限過 → 才上鎖降級。綠界本身「連 6 次失敗自動取消」是最終門檻。
 *
 * 狀態機（billingStatus 流轉）：
 *
 *      ┌──────── 每期扣款成功（RtnCode==1）─────────┐
 *      │                                            ▼
 *   active ──扣款失敗──▶ past_due（寬限中，仍可用，發提醒）
 *      ▲                    │  │
 *      │                    │  └─ 寬限內再失敗：failCount++（不重置寬限）
 *      └── 補卡成功扣到 ────┘  │
 *                              ▼
 *              連續失敗 ≥ autoCancelThreshold（綠界 6 次）
 *              或 寬限期過（now > graceUntil）
 *                              │
 *                              ▼
 *                          locked（唯讀殼，降 free，需更新付款/升級解鎖）
 *
 * 「鎖」= 重用既有軟鎖（同試用到期那個唯讀殼）：
 *   - past_due / locked 都讓前端走既有 `_isReadOnly`（資料看得到、不能動）。
 *   - past_due：仍 active 等級可用（寬限體貼），只是 UI 顯示「付款異常，請更新卡片」。
 *   - locked：降 free（讀得到、不能編輯付費模組），跟試用到期一致。
 *   實際 entitlement 判定在 authority.js（isSubscriptionActive / resolveEntitlement）——
 *   本檔只負責「把 billingStatus / dunning 欄位算對」，不自己決定 feature gate。
 *
 * 為什麼門檻 / 寬限做成可調參數：
 *   trust spec 寫「綠界連 6 次失敗自動取消」「寬限期不立刻斷」，但天數 / 重試次數
 *   是營運決策（Edward 可調）。寫死會綁手 → 收斂成 DUNNING_DEFAULTS，handler 可覆寫。
 *
 * idempotent（關鍵）：
 *   綠界同一期失敗通知可能重送。本檔每個轉換都【吃 idempotencyKey】：
 *   同一 key 重進 → 不重複 failCount++ / 不重排寬限。靠 billing.dunning.seenKeys 記。
 *   （webhook 外層也有 processedWebhooks 防重放；這裡是第二層保險 + 純函式可測。）
 *
 * 執行環境：Worker（現代 JS）。本檔【不寫 app.html】（Agent 防護規則 1）。
 *   transition 全做成純函式（applyRecurringFailure / applyRecurringSuccess），
 *   handler 段才碰 store / mailer，方便單元測試逐步驗。
 */

'use strict';

/**
 * dunning 可調參數（營運決策，Edward 可覆寫）。
 *   graceDays            付款失敗後的寬限天數（仍可用）。
 *   maxRetries           我方「在寬限內最多容忍幾次失敗才提早上鎖」。
 *                        注意：綠界自己也會重試/自動取消（autoCancelThreshold）。
 *                        兩者取「先到者」上鎖——對齊 trust spec「達自動取消門檻才降級」。
 *   autoCancelThreshold  綠界端「連續失敗自動取消後續扣款」的次數（官方 = 6）。
 *                        連續失敗達此數 = 綠界已停扣，我方必須上鎖（不能再給服務）。
 */
const DUNNING_DEFAULTS = {
  graceDays: 7,
  maxRetries: 3,
  autoCancelThreshold: 6,
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 合併使用者覆寫參數（缺項回 default）。
 * @param {Object} [over]
 * @returns {{graceDays:number, maxRetries:number, autoCancelThreshold:number}}
 */
function resolveParams(over) {
  const p = over || {};
  return {
    graceDays: typeof p.graceDays === 'number' ? p.graceDays : DUNNING_DEFAULTS.graceDays,
    maxRetries: typeof p.maxRetries === 'number' ? p.maxRetries : DUNNING_DEFAULTS.maxRetries,
    autoCancelThreshold:
      typeof p.autoCancelThreshold === 'number' ? p.autoCancelThreshold : DUNNING_DEFAULTS.autoCancelThreshold,
  };
}

/**
 * 從綠界通知判斷「這是首次授權還是每期扣款」+「成功還是失敗」。
 *
 * 綠界定期定額特性（trust spec §「ReturnURL vs PeriodReturnURL」+ tech plan Step 4/7）：
 *   - 首次授權結果 + 第 2 期起每期結果【都送到同一個 PeriodReturnURL / webhook】。
 *   - 區分線索：每期通知帶 `TotalSuccessTimes`（累計成功次數）。首次授權成功 = 1；
 *     第 N 期 = N。失敗通知 TotalSuccessTimes 不增。
 *   - 但「通知本身屬第幾期」不能只靠 TotalSuccessTimes（失敗時不變），所以也看
 *     是否已有既存訂閱（webhook 外層用 billing 是否已 active 來輔助判定）。
 *   本函式只用「通知欄位」做一階判定，第二階（首扣 vs 續扣失敗）由 handler 結合 billing。
 *
 * @param {Object} p 綠界通知參數
 * @returns {{success:boolean, rtnCode:string, isFirstAuth:boolean, successTimes:number}}
 */
function classifyNotify(p) {
  const rtnCode = String((p && p.RtnCode) || '');
  const success = rtnCode === '1';
  const successTimes = Number((p && (p.TotalSuccessTimes || p.PeriodSuccessTimes)) || 0);
  // 首次授權：成功且累計成功次數 ≤ 1（含未帶欄位的保守視為首次）。
  // 失敗通知無法單憑欄位斷定首扣/續扣 → 標 isFirstAuth=false，交 handler 結合 billing 再判。
  const isFirstAuth = success && successTimes <= 1;
  return { success: success, rtnCode: rtnCode, isFirstAuth: isFirstAuth, successTimes: successTimes };
}

/**
 * 確保 billing.dunning 結構存在（不破壞既有欄位）。回傳【新物件】（純函式，不改入參）。
 * @param {Object} billing
 * @returns {Object} dunning 子物件的 clone
 */
function ensureDunning(billing) {
  const d = (billing && billing.dunning) || {};
  return {
    failCount: typeof d.failCount === 'number' ? d.failCount : 0,
    firstFailedAt: typeof d.firstFailedAt === 'number' ? d.firstFailedAt : null,
    lastFailedAt: typeof d.lastFailedAt === 'number' ? d.lastFailedAt : null,
    graceUntil: typeof d.graceUntil === 'number' ? d.graceUntil : null,
    lastRtnMsg: d.lastRtnMsg || '',
    seenKeys: Array.isArray(d.seenKeys) ? d.seenKeys.slice() : [],
  };
}

/**
 * 【純函式】套用一次「每期扣款失敗」轉換，回傳要 merge 進 billing 的 patch。
 *   不直接寫 store——讓測試能逐步驗狀態機，也讓 handler 控制何時落盤。
 *
 * 行為：
 *   - active / 任何非 locked → 進 past_due，記寬限期（首次失敗起算 graceDays）。
 *   - 寬限內再失敗 → failCount++，【不重置】graceUntil（防無限續命）。
 *   - 觸發上鎖條件（任一）→ billingStatus='locked'：
 *       a) failCount ≥ autoCancelThreshold（綠界已自動取消，不能再服務）
 *       b) failCount ≥ maxRetries（我方提早止血，可設比 a 嚴）
 *       c) now > graceUntil（寬限過）
 *   - 已 locked → 維持 locked（idempotent，只更新 lastFailedAt / failCount）。
 *   - idempotent：同 idemKey 重進 → 回 { idempotent:true } 不改計數。
 *
 * @param {Object} billing  現有 billing（可能含 dunning）
 * @param {Object} opts     { now, params, idemKey, rtnCode, rtnMsg }
 * @returns {{patch:Object, transition:string, idempotent:boolean, locked:boolean}}
 *   patch = 要 setBilling 的欄位；transition ∈
 *     'entered_grace' | 'grace_retry' | 'locked' | 'noop_locked' | 'idempotent'
 */
function applyRecurringFailure(billing, opts) {
  opts = opts || {};
  const now = typeof opts.now === 'number' ? opts.now : Date.now();
  const params = resolveParams(opts.params);
  const idemKey = opts.idemKey || '';
  const rtnCode = String(opts.rtnCode || '');
  const rtnMsg = opts.rtnMsg || '';
  const status = billing && billing.billingStatus;

  const d = ensureDunning(billing);

  // —— idempotent：這筆失敗通知（idemKey）已算過 → 不重複扣寬限/不重複 ++ ——
  if (idemKey && d.seenKeys.indexOf(idemKey) >= 0) {
    return {
      patch: {},
      transition: 'idempotent',
      idempotent: true,
      locked: status === 'locked',
    };
  }
  if (idemKey) d.seenKeys.push(idemKey);

  // 記這次失敗
  d.failCount = d.failCount + 1;
  d.lastFailedAt = now;
  d.lastRtnMsg = rtnMsg;
  if (d.firstFailedAt === null) d.firstFailedAt = now;
  // 寬限期：首次失敗起算（不隨後續失敗順延 → 防無限續命）
  if (d.graceUntil === null) d.graceUntil = d.firstFailedAt + params.graceDays * DAY_MS;

  // 已經是 locked → 維持 locked，只累計（綠界可能還在重送失敗）
  if (status === 'locked') {
    return {
      patch: {
        dunning: d,
        paymentIssue: true,
        lastNotifyRtnCode: rtnCode,
        lastNotifyAt: now,
        updatedBy: 'dunning',
      },
      transition: 'noop_locked',
      idempotent: false,
      locked: true,
    };
  }

  // 上鎖條件（任一）
  const hitAutoCancel = d.failCount >= params.autoCancelThreshold;
  const hitMaxRetries = d.failCount >= params.maxRetries;
  const graceExpired = typeof d.graceUntil === 'number' && now > d.graceUntil;
  const shouldLock = hitAutoCancel || hitMaxRetries || graceExpired;

  if (shouldLock) {
    return {
      patch: {
        billingStatus: 'locked',
        // plan 不清空——保留「他原本買的方案」供補卡後快速復原 + 收據對帳；
        // 實際是否給服務看 authority.resolveEntitlement（locked → 降 free）。
        dunning: d,
        paymentIssue: true,
        lockedReason: hitAutoCancel
          ? 'auto_cancel_threshold'
          : hitMaxRetries
          ? 'max_retries'
          : 'grace_expired',
        lockedAt: now,
        lastNotifyRtnCode: rtnCode,
        lastNotifyAt: now,
        updatedBy: 'dunning',
      },
      transition: 'locked',
      idempotent: false,
      locked: true,
    };
  }

  // 進 / 留在寬限期
  const firstTime = status !== 'past_due';
  return {
    patch: {
      billingStatus: 'past_due',
      dunning: d,
      paymentIssue: true,
      lastNotifyRtnCode: rtnCode,
      lastNotifyAt: now,
      updatedBy: 'dunning',
    },
    transition: firstTime ? 'entered_grace' : 'grace_retry',
    idempotent: false,
    locked: false,
  };
}

/**
 * 【純函式】套用「每期扣款成功」轉換（補卡成功 / 正常續扣）→ 清 dunning 回 active。
 *   注意：本函式只算 dunning 復原欄位；webhook 成功路徑仍負責寫 plan/收據等。
 *   設計成「即使原本 past_due / locked，補扣成功就救回 active」。
 *
 * @param {Object} billing
 * @param {Object} [opts] { now, idemKey }
 * @returns {{patch:Object, transition:string, idempotent:boolean}}
 */
function applyRecurringSuccess(billing, opts) {
  opts = opts || {};
  const now = typeof opts.now === 'number' ? opts.now : Date.now();
  const idemKey = opts.idemKey || '';
  const d = ensureDunning(billing);

  if (idemKey && d.seenKeys.indexOf(idemKey) >= 0) {
    return { patch: {}, transition: 'idempotent', idempotent: true };
  }

  const wasTroubled = billing && (billing.billingStatus === 'past_due' || billing.billingStatus === 'locked');
  return {
    patch: {
      billingStatus: 'active',
      paymentIssue: false,
      // 清空 dunning 計數（保留 seenKeys 防重放，但歸零失敗統計）
      dunning: {
        failCount: 0,
        firstFailedAt: null,
        lastFailedAt: null,
        graceUntil: null,
        lastRtnMsg: '',
        seenKeys: idemKey ? d.seenKeys.concat([idemKey]) : d.seenKeys,
      },
      lockedReason: null,
      recoveredAt: wasTroubled ? now : (billing && billing.recoveredAt) || null,
      lastNotifyAt: now,
      updatedBy: 'dunning',
    },
    transition: wasTroubled ? 'recovered' : 'active',
    idempotent: false,
  };
}

/**
 * 【純函式 · 讀取時用】past_due 的寬限是否已過期。
 *   寫入端（applyRecurringFailure）只在「有新失敗通知進來」時上鎖；但若綠界
 *   後續【沒再送通知】（例如綠界端就停了），past_due 會卡著。讀取端（前端 gating /
 *   authority）用本函式判「寬限其實已過 → 視為 locked（唯讀降級）」。
 *
 * @param {Object} billing
 * @param {number} [nowMs]
 * @returns {boolean} true = 寬限已過（即使 billingStatus 還寫 past_due，也該當 locked）
 */
function isGraceExpired(billing, nowMs) {
  if (!billing || billing.billingStatus !== 'past_due') return false;
  const d = billing.dunning || {};
  if (typeof d.graceUntil !== 'number') return false;
  const now = typeof nowMs === 'number' ? nowMs : Date.now();
  return now > d.graceUntil;
}

/**
 * 【handler · webhook 失敗路徑呼叫】處理一筆「每期扣款失敗」通知。
 *   結合 store：讀 billing → 套 applyRecurringFailure → 寫回 → 寄信 + 告警。
 *   全程 idempotent（同 idemKey 重進不重算）。寫/寄失敗不擋（綠界會重送）。
 *
 * @param {Object} args
 * @param {Object} args.store    BillingStore
 * @param {string} args.uid
 * @param {Object} args.notify   綠界通知參數（含 RtnCode/RtnMsg/...）
 * @param {string} args.idemKey  webhook 算好的 idempotent key（含期數）
 * @param {Object} [args.params] dunning 參數覆寫
 * @param {function} [args.mailer]   async (email)=>{}；past_due/locked 各寄不同信
 * @param {function} [args.lookupEmail] async (uid)=>email
 * @param {function} [args.onAlert]  async (evt)=>{}
 * @param {Object} [args.opts]    { now }
 * @returns {Promise<{ok:boolean, transition:string, billingStatus:string, locked:boolean,
 *                     emailQueued:boolean, idempotent:boolean}>}
 */
async function handlePeriodicFailure(args) {
  const store = args.store;
  const uid = args.uid;
  const notify = args.notify || {};
  const idemKey = args.idemKey || '';
  const mailer = args.mailer;
  const lookupEmail = args.lookupEmail;
  const onAlert = args.onAlert;
  const opts = args.opts || {};
  const now = typeof opts.now === 'number' ? opts.now : Date.now();

  const alert = async (evt) => {
    if (typeof onAlert === 'function') { try { await onAlert(evt); } catch (e) { /* 告警失敗不擋 */ } }
  };

  if (!store) return { ok: false, transition: 'no_store', billingStatus: '', locked: false, emailQueued: false, idempotent: false };
  if (!uid) {
    await alert({ type: 'dunning_missing_uid', tradeNo: notify.MerchantTradeNo || '' });
    return { ok: false, transition: 'no_uid', billingStatus: '', locked: false, emailQueued: false, idempotent: false };
  }

  let billing = null;
  try { billing = await store.getBilling(uid); } catch (e) { billing = null; }

  const out = applyRecurringFailure(billing, {
    now: now,
    params: args.params,
    idemKey: idemKey,
    rtnCode: notify.RtnCode || '',
    rtnMsg: notify.RtnMsg || '',
  });

  if (out.idempotent) {
    return { ok: true, transition: 'idempotent', billingStatus: (billing && billing.billingStatus) || '', locked: out.locked, emailQueued: false, idempotent: true };
  }

  try {
    await store.setBilling(uid, out.patch);
  } catch (e) {
    await alert({ type: 'dunning_write_failed', uid: uid, idemKey: idemKey, error: String((e && e.message) || e) });
    // 寫失敗 → 回 ok:false 讓外層決定（webhook 仍回 1|OK，綠界重送會再進、idemKey 已記在記憶中
    // 但因沒落盤 seenKeys，重送會重算——可接受：保守重算頂多多寄一封信，不會少鎖）。
    return { ok: false, transition: out.transition, billingStatus: out.patch.billingStatus || (billing && billing.billingStatus) || '', locked: out.locked, emailQueued: false, idempotent: false };
  }

  // 寄信：past_due → 「付款失敗，請更新卡片（X 天寬限）」；locked → 「服務已暫停，更新付款恢復」
  let emailQueued = false;
  if (typeof mailer === 'function') {
    let to = '';
    if (typeof lookupEmail === 'function') {
      try { to = (await lookupEmail(uid)) || ''; } catch (e) { to = ''; }
    }
    if (to) {
      const email = buildDunningEmail(to, out, billing, now);
      try { await mailer(email); emailQueued = true; }
      catch (e) { await alert({ type: 'dunning_email_failed', uid: uid, transition: out.transition }); }
    }
  }

  // 告警：上鎖一定告警（要人看）；進寬限也記一筆（運營追蹤）
  if (out.locked) {
    await alert({ type: 'dunning_locked', uid: uid, reason: out.patch.lockedReason || '', failCount: (out.patch.dunning && out.patch.dunning.failCount) || 0, idemKey: idemKey });
  } else {
    await alert({ type: 'dunning_past_due', uid: uid, failCount: (out.patch.dunning && out.patch.dunning.failCount) || 0, graceUntil: (out.patch.dunning && out.patch.dunning.graceUntil) || null, idemKey: idemKey });
  }

  return {
    ok: true,
    transition: out.transition,
    billingStatus: out.patch.billingStatus || (billing && billing.billingStatus) || '',
    locked: out.locked,
    emailQueued: emailQueued,
    idempotent: false,
  };
}

/**
 * 組 dunning 通知信（純函式，方便測試）。past_due / locked 文案不同。
 * @param {string} to
 * @param {{transition:string, locked:boolean, patch:Object}} out
 * @param {Object} billing
 * @param {number} now
 * @returns {{to:string, subject:string, text:string, kind:string}}
 */
function buildDunningEmail(to, out, billing, now) {
  const plan = (billing && billing.plan) || '';
  const graceUntil = (out.patch.dunning && out.patch.dunning.graceUntil) || null;
  if (out.locked) {
    return {
      to: to,
      kind: 'dunning_locked',
      subject: 'BeyondSpec 訂閱已暫停 — 更新付款方式即可恢復',
      text:
        '您的 BeyondSpec ' + (plan ? plan.toUpperCase() + ' ' : '') +
        '訂閱因連續扣款失敗已暫停服務。您的資料仍安全保留（唯讀），更新付款方式後即可立即恢復編輯。',
    };
  }
  let graceStr = '';
  if (typeof graceUntil === 'number') {
    const days = Math.max(0, Math.ceil((graceUntil - now) / DAY_MS));
    graceStr = '（寬限約 ' + days + ' 天，期間服務不中斷）';
  }
  return {
    to: to,
    kind: 'dunning_past_due',
    subject: 'BeyondSpec 付款失敗 — 請更新您的信用卡',
    text:
      '我們這期向您的信用卡收款失敗，可能是卡片過期或額度不足。' +
      '請更新付款方式以免訂閱中斷' + graceStr + '。',
  };
}

const _api = {
  DUNNING_DEFAULTS,
  resolveParams,
  classifyNotify,
  ensureDunning,
  applyRecurringFailure,
  applyRecurringSuccess,
  isGraceExpired,
  handlePeriodicFailure,
  buildDunningEmail,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = _api;
}

export {
  DUNNING_DEFAULTS,
  resolveParams,
  classifyNotify,
  ensureDunning,
  applyRecurringFailure,
  applyRecurringSuccess,
  isGraceExpired,
  handlePeriodicFailure,
  buildDunningEmail,
};
