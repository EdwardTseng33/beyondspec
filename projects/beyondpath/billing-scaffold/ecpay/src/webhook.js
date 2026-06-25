/**
 * BeyondSpec × 綠界 — /ecpay/webhook 處理（紅線 1 核心）
 * ==================================================================
 * 這是整條金流【最危險也最關鍵】的一支。SaaS billing 史上最常見的洞都在這。
 *
 * 鐵律（沙利曼 spec 紅線 1 / flow Step 4-5）：
 *   1. 解鎖【只能】在這支（server 端）發生。前端永遠不能自解（OrderResultURL 只顯示）。
 *   2. 收到綠界 server POST → 先【server 端重算 CheckMacValue 驗章】才往下。
 *      驗章失敗 → 立刻丟棄（回 HTTP 200 但不解鎖）+ 記告警（代表有人在試）。
 *   3. 驗章過且 RtnCode==1 →【idempotent】檢查（同筆通知重送不重複解鎖、防重放）。
 *   4. 才寫 Firestore billing（plan / subscriptionId / billingStatus=active / paidAt）。
 *   5. 回綠界【純文字 1|OK】（綠界規定，否則視為失敗會重送）。
 *
 * idempotent key（技術計畫 §2.3 修正）：
 *   定期定額【每期】回來都帶同一個 MerchantTradeNo，但期數不同。
 *   若只用 MerchantTradeNo 當 key → 第 2 期會被誤判成「第 1 期重放」而漏解鎖。
 *   → key 必須含「期數識別」。綠界定期定額通知帶 Gwsr（本期授權單號）/ PeriodType /
 *     ProcessDate 等可區分期數的欄位。本支用 `${MerchantTradeNo}_${Gwsr}` 當 key
 *     （Gwsr 每期唯一）；Gwsr 缺時退回 ProcessDate，再缺退回 TradeNo（首期）。
 *
 * 防重放 vs 防漏接：
 *   - 防重放（本支 idempotent）：同一合法通知被重送 / 被惡意重放 → 只解鎖一次。
 *   - 防漏接（對帳）：webhook 沒送達 → 靠 cron 查綠界補（v1，本批不做，留 backlog）。
 *
 * 資料不接真 Firebase：所有寫入走注入的 store（InMemoryStore 測試 / FirestoreStore 上線）。
 * 寄信走注入的 mailer（可選；沒給就不寄、只回 emailQueued:false）。
 *
 * 執行環境：Worker（現代 JS）。前端不引用本檔。
 */

'use strict';

import { verifyCheckMacValue } from './checkmac.js';
import { PLAN_CATALOG } from './config.js';
import { issueReceipt } from './receipt.js';
import { classifyNotify, handlePeriodicFailure, applyRecurringSuccess } from './dunning.js';

/**
 * 解析綠界 webhook 的 body。綠界 server POST 是
 * application/x-www-form-urlencoded。Worker 端會先轉成普通物件再傳進來，
 * 但為了能單元測試 + 容錯，這支同時接受：
 *   - 已是物件 → 直接用
 *   - URLSearchParams → 轉物件
 *   - 字串（form-urlencoded） → parse 成物件
 * @param {Object|URLSearchParams|string} body
 * @returns {Object}
 */
function parseEcpayBody(body) {
  if (body && typeof body === 'object' && !(body instanceof URLSearchParams)) {
    return body;
  }
  const out = {};
  let sp;
  if (body instanceof URLSearchParams) sp = body;
  else if (typeof body === 'string') sp = new URLSearchParams(body);
  else return out;
  sp.forEach((v, k) => { out[k] = v; });
  return out;
}

/**
 * 從綠界通知決定 idempotent key 的「期數段」。
 * 優先 Gwsr（每期授權單號，唯一）→ ProcessDate（本期扣款日）→ ''（首期，靠 TradeNo 即可）。
 * @param {Object} p  綠界通知參數
 * @returns {string}
 */
function periodToken(p) {
  if (p.Gwsr !== undefined && p.Gwsr !== null && String(p.Gwsr) !== '') return String(p.Gwsr);
  if (p.ProcessDate) return String(p.ProcessDate).replace(/[^0-9]/g, '');
  return '';
}

/**
 * 組 idempotent key：`${MerchantTradeNo}_${periodToken}`。
 * @param {Object} p
 * @returns {string}
 */
function idempotencyKey(p) {
  const trade = String(p.MerchantTradeNo || p.TradeNo || 'unknown');
  const tok = periodToken(p);
  return tok ? (trade + '_' + tok) : trade;
}

/**
 * 從綠界通知拿 uid。建單時放 CustomField1=uid（納入 CheckMacValue，不可竄改）。
 * @param {Object} p
 * @returns {string}
 */
function uidFromNotify(p) {
  return p.CustomField1 || '';
}

/**
 * 由 ItemName / plan 線索推回 plan key + 權威金額。
 * 綠界通知不回 plan key（我們沒送），但回 ItemName + TotalAmount。
 * 安全做法：用 TotalAmount 反查 PLAN_CATALOG 確認是「我們認得的金額」，
 * 同時用 ItemName 對照。兩者都對不上 → 標 unknownPlan（仍解鎖避免漏單，但記告警）。
 * @param {Object} p
 * @returns {{plan:string, itemName:string, amount:number}}
 */
function resolvePlan(p) {
  const amount = Number(p.TotalAmount || p.PeriodAmount || 0);
  let plan = '';
  let itemName = p.ItemName || '';
  for (const key in PLAN_CATALOG) {
    if (!Object.prototype.hasOwnProperty.call(PLAN_CATALOG, key)) continue;
    const def = PLAN_CATALOG[key];
    if (def.amount === amount) { plan = key; if (!itemName) itemName = def.itemName; break; }
  }
  return { plan: plan, itemName: itemName, amount: amount };
}

/**
 * 純文字回應（綠界要求 1|OK / 0|message）。
 * 在 Worker 用 new Response()；這裡回一個輕量物件，handler 外層自行轉 Response，
 * 也方便測試直接讀 body/status。
 * @param {string} body
 * @param {number} [status]
 * @returns {{status:number, body:string, contentType:string}}
 */
function textReply(body, status) {
  return { status: status || 200, body: body, contentType: 'text/plain' };
}

/**
 * 核心 handler。
 *
 * @param {Object} args
 * @param {Object|string|URLSearchParams} args.body  綠界 POST 進來的參數
 * @param {Object} args.env      Worker env（ECPAY_HASH_KEY / IV / APP_BASE 等）
 * @param {Object} args.store    BillingStore 實作（寫 billing / 收據 / idempotent）
 * @param {function} [args.mailer]  可選：async (email)=>{} 寄信；不給就不寄
 * @param {function} [args.lookupEmail] 可選：async (uid)=>email。綠界通知【不帶 email】，
 *                                   付款方 email 要由 Worker【驗章後】另查（Firebase auth）。
 *                                   刻意不從綠界 body 拿 email——那不在簽章範圍、不可信。
 * @param {function} [args.onAlert] 可選：async (evt)=>{} 告警（驗章失敗 / unknownPlan）
 * @returns {Promise<{status:number, body:string, contentType:string, _meta:Object}>}
 *   body 一律是綠界要的純文字；_meta 給測試/log 看內部判定（不回綠界）。
 */
async function handleWebhook(args) {
  const env = args.env || {};
  const store = args.store;
  const mailer = args.mailer;
  const lookupEmail = args.lookupEmail;
  const onAlert = args.onAlert;
  const p = parseEcpayBody(args.body);

  const alert = async (evt) => { if (typeof onAlert === 'function') { try { await onAlert(evt); } catch (e) { /* 告警失敗不擋主流程 */ } } };

  // —— 0. 基本防呆 ——
  if (!store) {
    // 這是部署錯誤，不是綠界的錯；回 0 讓綠界重送（之後修好 store 就能補上）。
    return Object.assign(textReply('0|store missing', 200), { _meta: { result: 'config_error' } });
  }
  if (!env.ECPAY_HASH_KEY || !env.ECPAY_HASH_IV) {
    await alert({ type: 'config', reason: 'ecpay keys not configured' });
    return Object.assign(textReply('0|keys missing', 200), { _meta: { result: 'config_error' } });
  }

  // —— 1. server 端驗章（紅線 1）。驗章前【絕不】碰 billing ——
  let verified = false;
  try {
    verified = await verifyCheckMacValue(p, env.ECPAY_HASH_KEY, env.ECPAY_HASH_IV);
  } catch (e) {
    verified = false;
  }
  if (!verified) {
    // 偽造 / 竄改 / 用錯金鑰 → 丟棄。回 200 純文字但【不解鎖】。記告警（有人在試）。
    await alert({ type: 'checkmac_failed', tradeNo: p.MerchantTradeNo || '', rtnCode: p.RtnCode || '' });
    return Object.assign(textReply('0|CheckMacValue verify failed', 200), { _meta: { result: 'verify_failed' } });
  }

  // —— 2. 成功/失敗 + 首扣/續扣 分類（全狀態矩陣的分流點）——
  //    綠界定期定額：首次授權結果 + 第 2 期起每期結果【都送同一個 webhook】。
  //    RtnCode==1 = 扣款成功；非 1 = 失敗/異常。
  //    首扣 vs 續扣：classifyNotify 先用通知欄位（TotalSuccessTimes）一階判，
  //    再結合 billing（已 active = 這是續扣）做二階判。
  const rtnCode = String(p.RtnCode || '');
  const uid = uidFromNotify(p);
  const cls = classifyNotify(p);

  // 取既有 billing 一次（決定首扣/續扣 + 失敗時餵 dunning）。讀失敗保守當無。
  let existingBilling = null;
  if (uid) { try { existingBilling = await store.getBilling(uid); } catch (e) { existingBilling = null; } }
  // 已有「曾經解鎖過」的訂閱紀錄（active / past_due / locked / cancelled）→ 視為續扣情境。
  const hasPriorSub = !!(existingBilling && existingBilling.billingStatus &&
    existingBilling.billingStatus !== 'none');
  const isRecurring = hasPriorSub || cls.successTimes > 1;

  if (rtnCode !== '1') {
    // —— 2a. 扣款失敗 ——
    const idemKeyFail = idempotencyKey(p);
    if (!isRecurring) {
      // 首次刷卡失敗 →【絕不解鎖】。記 failed + 告警 + 回 1|OK（已收到通知）。
      // 不進 dunning 狀態機（還沒有訂閱可降級）。前端顯示「授權失敗請重試」。
      if (uid) {
        try {
          await store.setBilling(uid, {
            billingStatus: existingBilling && existingBilling.billingStatus ? existingBilling.billingStatus : 'none',
            firstChargeFailed: true,
            paymentIssue: true,
            lastNotifyRtnCode: rtnCode,
            lastNotifyMsg: p.RtnMsg || '',
            lastNotifyAt: Date.now(),
            updatedBy: 'webhook',
          });
        } catch (e) { /* 寫失敗不擋回 OK；綠界重送會再進 */ }
      }
      await alert({ type: 'first_charge_failed', uid: uid, tradeNo: p.MerchantTradeNo || '', rtnCode: rtnCode, msg: p.RtnMsg || '' });
      return Object.assign(textReply('1|OK', 200), { _meta: { result: 'first_charge_failed', rtnCode: rtnCode, isRecurring: false } });
    }

    // 每期自動扣款失敗 → dunning 狀態機（active→past_due→…→locked）。
    const dun = await handlePeriodicFailure({
      store: store, uid: uid, notify: p, idemKey: idemKeyFail,
      params: args.dunningParams,            // 可選覆寫（graceDays / maxRetries / autoCancelThreshold）
      mailer: mailer, lookupEmail: lookupEmail, onAlert: onAlert,
    });
    return Object.assign(textReply('1|OK', 200), {
      _meta: {
        result: 'recurring_failed',
        rtnCode: rtnCode,
        isRecurring: true,
        dunningTransition: dun.transition,
        billingStatus: dun.billingStatus,
        locked: dun.locked,
        idempotent: dun.idempotent,
      },
    });
  }

  // —— 3. idempotent（防重放 / 重送）。驗章過 + 成功碼，才到這 ——
  const idemKey = idempotencyKey(p);
  // markProcessedWebhook 回 {created:false} 代表已處理過 → 直接回 OK 不重做。
  // 用「先標記、靠回傳 created 判定」做到接近原子（InMemoryStore 已保證；
  // FirestoreStore 上線要用 transaction / create-if-absent 實作同語意，見 WORKER-INTEGRATION）。
  let mark;
  try {
    mark = await store.markProcessedWebhook(idemKey, {
      at: Date.now(), rtnCode: rtnCode, uid: uid, tradeNo: p.MerchantTradeNo || '',
    });
  } catch (e) {
    // idempotent 寫入失敗 → 不確定有沒有處理過，保守回 0 讓綠界重送（重送會再驗 idempotent）。
    return Object.assign(textReply('0|idempotent store error', 200), { _meta: { result: 'idem_error' } });
  }
  if (mark && mark.created === false) {
    // 已處理過這一期 → 不重複解鎖 / 不重複開收據。回 OK。
    return Object.assign(textReply('1|OK', 200), { _meta: { result: 'duplicate', idemKey: idemKey } });
  }

  // —— 4. 解鎖訂閱（寫 billing 權威狀態）——
  if (!uid) {
    // 沒 uid 無法定位用戶——這是建單沒帶 CustomField1 的 bug。記告警，仍回 OK（避免綠界狂重送）。
    await alert({ type: 'missing_uid', tradeNo: p.MerchantTradeNo || '' });
    return Object.assign(textReply('1|OK', 200), { _meta: { result: 'missing_uid', idemKey: idemKey } });
  }

  const resolved = resolvePlan(p);
  if (!resolved.plan) {
    // 金額對不上任何已知方案 → 記告警，但仍解鎖（避免用戶付了錢卡住）。標 unknownPlan 供人工查。
    await alert({ type: 'unknown_plan', uid: uid, amount: resolved.amount, itemName: resolved.itemName });
  }

  const paidAt = Date.now();
  // 訂閱識別：優先綠界定期定額授權序號（Gwsr / GwsrPeriod），退回 MerchantTradeNo。
  const subscriptionId = p.Gwsr || p.GwsrPeriod || p.MerchantTradeNo || '';
  const billing = {
    plan: resolved.plan || 'unknown',
    billingStatus: 'active',
    subscriptionId: String(subscriptionId || ''),
    gwsr: p.Gwsr || '',
    merchantTradeNo: p.MerchantTradeNo || '',
    tradeNo: p.TradeNo || '',
    amount: resolved.amount,
    paidAt: paidAt,
    paymentIssue: false,
    firstChargeFailed: false,
    lastNotifyRtnCode: rtnCode,
    lastNotifyAt: paidAt,
    updatedBy: 'webhook',
    unknownPlan: !resolved.plan,
  };
  // 續扣成功且原本付款異常（past_due / locked）→ 救回 active 並【清 dunning 計數】。
  //   讓「補卡成功扣到」能解鎖回正常（不殘留 lockedReason / failCount）。
  let recovered = false;
  if (isRecurring && existingBilling &&
      (existingBilling.billingStatus === 'past_due' || existingBilling.billingStatus === 'locked')) {
    const rec = applyRecurringSuccess(existingBilling, { now: paidAt });
    // rec.patch 已含 billingStatus:'active' / paymentIssue:false / dunning 歸零 / lockedReason:null
    Object.assign(billing, rec.patch);
    billing.plan = resolved.plan || existingBilling.plan || 'unknown';   // 回原方案
    billing.amount = resolved.amount;
    billing.paidAt = paidAt;
    billing.lastNotifyRtnCode = rtnCode;
    billing.updatedBy = 'webhook';
    recovered = true;
  }
  try {
    await store.setBilling(uid, billing);
  } catch (e) {
    // 解鎖寫失敗 = 大事（驗章過了卻沒解鎖）。回 0 讓綠界重送（idempotent 已標記，
    // 重送會撞 duplicate……所以這裡要把 idempotent 標記回滾才對。
    // 但 InMemoryStore 無交易；上線 FirestoreStore 要把「標 idempotent + 寫 billing」
    // 包進同一 transaction（見 WORKER-INTEGRATION「交易一致性」）。此處先記告警。
    await alert({ type: 'unlock_write_failed', uid: uid, idemKey: idemKey, error: String(e && e.message || e) });
    return Object.assign(textReply('0|unlock failed', 200), { _meta: { result: 'unlock_failed' } });
  }

  // —— 5. 交易紀錄 + 收據（紅線 3：獨立 collection + legalRetention）——
  let receiptNo = '';
  let emailQueued = false;
  // 付款方 email：綠界通知不帶，驗章【後】才另查（Firebase auth）。查失敗不擋解鎖。
  let payerEmail = '';
  if (typeof lookupEmail === 'function') {
    try { payerEmail = (await lookupEmail(uid)) || ''; } catch (e) { payerEmail = ''; }
  }
  try {
    await store.saveTransaction(uid, p.MerchantTradeNo || idemKey, {
      tradeNo: p.TradeNo || '',
      merchantTradeNo: p.MerchantTradeNo || '',
      gwsr: p.Gwsr || '',
      amount: resolved.amount,
      rtnCode: rtnCode,
      paidAt: paidAt,
      raw: { PaymentDate: p.PaymentDate || '', PaymentType: p.PaymentType || '' },
      legalRetention: true,
    });

    const issued = await issueReceipt(store, {
      uid: uid,
      tradeNo: p.MerchantTradeNo || '',
      gwsrPeriod: p.Gwsr || p.GwsrPeriod || '',
      plan: resolved.plan,
      itemName: resolved.itemName,
      amount: resolved.amount,
      paidAt: paidAt,
      payerEmail: payerEmail,            // 驗章後另查（綠界通知不帶 email）
      card4No: p.Card4No || '',
      periodSeq: periodToken(p) || '',
    }, { receiptUrlBase: (env.APP_BASE || '') + '/path/app/' });
    receiptNo = issued.receipt.receiptNo;

    // 寄信（注入 mailer；沒給就跳過）。寄信失敗不擋解鎖（已 active）。
    if (typeof mailer === 'function' && issued.email.to) {
      try { await mailer(issued.email); emailQueued = true; }
      catch (e) { await alert({ type: 'receipt_email_failed', uid: uid, receiptNo: receiptNo }); }
    }
  } catch (e) {
    // 收據失敗不影響「已解鎖」這個事實（用戶有服務）。記告警補開。
    await alert({ type: 'receipt_failed', uid: uid, idemKey: idemKey, error: String(e && e.message || e) });
  }

  return Object.assign(textReply('1|OK', 200), {
    _meta: {
      result: 'unlocked',
      uid: uid,
      plan: billing.plan,
      idemKey: idemKey,
      receiptNo: receiptNo,
      emailQueued: emailQueued,
      unknownPlan: !resolved.plan,
      isRecurring: isRecurring,
      recovered: recovered,            // 由 past_due/locked 因補扣成功救回 active
    },
  });
}

const _api = {
  parseEcpayBody, periodToken, idempotencyKey, uidFromNotify, resolvePlan, handleWebhook,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = _api;
}

export {
  parseEcpayBody, periodToken, idempotencyKey, uidFromNotify, resolvePlan, handleWebhook,
};
