/**
 * BeyondSpec × 綠界 — 退款 / 銀行退單(chargeback) → 重新鎖（逆向漏財防線）
 * ==================================================================
 * 解決的問題（trust spec §232「退費三件綁定」+ Edward 親點逆向情境 3）：
 *   退款 / chargeback = 錢被退回去了，但服務若還開著 = 漏財 + 帳實不符。
 *   必須【重新鎖】（降回 free / 唯讀殼），跟「試用到期」「扣款失敗上鎖」同一個殼。
 *
 * 綠界定期定額退款的現實（trust spec §232 + §10）：
 *   - 定期定額【沒有】乾淨的「線上一鍵退款」API——退費多為綠界【後台手動】操作。
 *   - chargeback（消費者向發卡行提爭議）走【爭議流程】，綠界事後通知 / 風控。
 *   - 所以本模組主力 = 【admin / 手動觸發 re-lock】（營運在綠界後台退完款後，
 *     在我方後台按一下「標記已退款並鎖定」）；
 *     若未來綠界有退款 webhook 通知，也接同一條 re-lock 邏輯（handleRefundNotify）。
 *
 * 退費三件綁定（trust spec 鐵則 · 本模組只負責第③件，①②留待辦/人工）：
 *   ① 綠界停扣（cancel.js Action=Cancel）——避免退完款下期又扣。
 *   ② 開折讓 / 作廢發票（綠界後台 / 發票 API，本批不做，留整合待辦）。
 *   ③ app 降級（本模組：billingStatus='locked' + 唯讀殼）。
 *   → 本模組在回傳 _meta.bindingTodo 明列①②尚未自動化，提醒不可只做③。
 *
 * idempotent：同一退款事件（refundId / tradeNo+amount）重觸發 → 只鎖一次、不重複記。
 *   靠 billing.refunds[] 記已處理的 refundId。
 *
 * 「鎖」一致性：與 dunning.js 的 locked 完全同一個 billingStatus='locked'，
 *   讓前端 _isReadOnly / authority.resolveReadOnlyState 一視同仁（不另造狀態）。
 *
 * 執行環境：Worker（現代 JS）。本檔【不寫 app.html】。
 *   核心 applyRefundLock 為純函式（可測）；handler 段才碰 store / mailer / 告警。
 */

'use strict';

import { verifyCheckMacValue } from './checkmac.js';

/**
 * 退款原因分類（影響文案 / 告警等級，不影響「都要鎖」這件事）。
 */
const REFUND_KINDS = {
  manual_refund: 'manual_refund',     // 營運主動退費（降級 / 客訴處理）
  chargeback: 'chargeback',           // 發卡行爭議退單（風險最高，必告警）
  dispute: 'dispute',                 // 爭議進行中（可能尚未定案，但先保守鎖）
};

/**
 * 確保 billing.refunds 結構（已處理的退款事件清單）。回傳 clone（純函式）。
 * @param {Object} billing
 * @returns {Array}
 */
function ensureRefunds(billing) {
  const r = (billing && billing.refunds) || [];
  return Array.isArray(r) ? r.slice() : [];
}

/**
 * 由退款事件決定 idempotent id。
 *   優先 refundId（綠界 / 我方產的退款流水）→ 退回 `${tradeNo}_refund_${amount}`。
 * @param {Object} evt { refundId, merchantTradeNo, tradeNo, amount }
 * @returns {string}
 */
function refundEventId(evt) {
  evt = evt || {};
  if (evt.refundId) return String(evt.refundId);
  const trade = String(evt.merchantTradeNo || evt.tradeNo || 'unknown');
  const amt = String(evt.amount || '0');
  return trade + '_refund_' + amt;
}

/**
 * 【純函式】套用「退款/退單 → 重新鎖」轉換，回 patch（不寫 store）。
 *   行為：
 *     - 任何狀態（active / past_due / cancelled / 甚至已 locked）→ billingStatus='locked'。
 *       理由：錢退了就是不能再給服務，不管原本什麼狀態。
 *     - 記一筆 refunds[]（含 refundId / kind / amount / at），供對帳 + idempotent。
 *     - idempotent：同 refundId 已在 refunds[] → 回 { idempotent:true } 不重鎖/不重記。
 *     - plan 不清空（保留原方案供對帳 / 客訴回溯）；實際 entitlement 由 authority
 *       因 locked 降 free。
 *
 * @param {Object} billing
 * @param {Object} evt   { refundId, kind, amount, merchantTradeNo, tradeNo, reason, now }
 * @returns {{patch:Object, transition:string, idempotent:boolean, refundId:string}}
 *   transition ∈ 'relocked' | 'already_locked_recorded' | 'idempotent'
 */
function applyRefundLock(billing, evt) {
  evt = evt || {};
  const now = typeof evt.now === 'number' ? evt.now : Date.now();
  const refundId = refundEventId(evt);
  const kind = REFUND_KINDS[evt.kind] || REFUND_KINDS.manual_refund;
  const refunds = ensureRefunds(billing);

  // idempotent：同一退款事件已處理過
  for (let i = 0; i < refunds.length; i++) {
    if (refunds[i] && String(refunds[i].refundId) === refundId) {
      return { patch: {}, transition: 'idempotent', idempotent: true, refundId: refundId };
    }
  }

  refunds.push({
    refundId: refundId,
    kind: kind,
    amount: Number(evt.amount || 0),
    reason: evt.reason || '',
    merchantTradeNo: evt.merchantTradeNo || (billing && billing.merchantTradeNo) || '',
    at: now,
  });

  const wasLocked = billing && billing.billingStatus === 'locked';
  return {
    patch: {
      billingStatus: 'locked',
      lockedReason: 'refund_' + kind,
      lockedAt: now,
      paymentIssue: true,
      refunds: refunds,
      lastRefundId: refundId,
      lastRefundAt: now,
      updatedBy: 'refund',
    },
    transition: wasLocked ? 'already_locked_recorded' : 'relocked',
    idempotent: false,
    refundId: refundId,
  };
}

/**
 * 【handler · admin/手動觸發】營運在綠界後台退完款 → 在我方後台按「標記退款並鎖定」。
 *   結合 store：讀 billing → applyRefundLock → 寫回 → 告警（chargeback 必告警）。
 *
 * @param {Object} args
 * @param {Object} args.store    BillingStore
 * @param {string} args.uid
 * @param {Object} args.event    { refundId?, kind, amount, merchantTradeNo?, reason? }
 * @param {function} [args.mailer]   async (email)=>{}
 * @param {function} [args.lookupEmail] async (uid)=>email
 * @param {function} [args.onAlert]  async (evt)=>{}
 * @param {Object} [args.opts]    { now }
 * @returns {Promise<{ok:boolean, transition:string, billingStatus:string, refundId:string,
 *                     idempotent:boolean, bindingTodo:string[]}>}
 */
async function handleManualRefund(args) {
  const store = args.store;
  const uid = args.uid;
  const event = args.event || {};
  const mailer = args.mailer;
  const lookupEmail = args.lookupEmail;
  const onAlert = args.onAlert;
  const opts = args.opts || {};
  const now = typeof opts.now === 'number' ? opts.now : Date.now();

  // 退費三件綁定提醒——本模組只做第③件（降級），①②不可漏。
  const bindingTodo = [
    '① 綠界停扣（CreditCardPeriodAction Cancel）——若尚未取消，避免下期又扣',
    '② 開折讓/作廢發票（綠界後台或發票 API）——跨月多為折讓，本批未自動化',
  ];

  const alert = async (e) => { if (typeof onAlert === 'function') { try { await onAlert(e); } catch (er) {} } };

  if (!store) return { ok: false, transition: 'no_store', billingStatus: '', refundId: '', idempotent: false, bindingTodo: bindingTodo };
  if (!uid) return { ok: false, transition: 'no_uid', billingStatus: '', refundId: '', idempotent: false, bindingTodo: bindingTodo };

  let billing = null;
  try { billing = await store.getBilling(uid); } catch (e) { billing = null; }

  const out = applyRefundLock(billing, {
    refundId: event.refundId,
    kind: event.kind,
    amount: event.amount,
    merchantTradeNo: event.merchantTradeNo,
    tradeNo: event.tradeNo,
    reason: event.reason,
    now: now,
  });

  if (out.idempotent) {
    return { ok: true, transition: 'idempotent', billingStatus: (billing && billing.billingStatus) || 'locked', refundId: out.refundId, idempotent: true, bindingTodo: bindingTodo };
  }

  try {
    await store.setBilling(uid, out.patch);
  } catch (e) {
    await alert({ type: 'refund_write_failed', uid: uid, refundId: out.refundId, error: String((e && e.message) || e) });
    return { ok: false, transition: out.transition, billingStatus: out.patch.billingStatus, refundId: out.refundId, idempotent: false, bindingTodo: bindingTodo };
  }

  // chargeback / dispute = 風險事件，一定告警（要人看）；manual_refund 也記一筆。
  const kind = REFUND_KINDS[event.kind] || REFUND_KINDS.manual_refund;
  await alert({
    type: kind === REFUND_KINDS.chargeback ? 'chargeback_relocked' : 'refund_relocked',
    uid: uid, refundId: out.refundId, kind: kind, amount: Number(event.amount || 0),
  });

  // 寄信（可選）：通知用戶服務已因退款暫停。
  let emailQueued = false;
  if (typeof mailer === 'function') {
    let to = '';
    if (typeof lookupEmail === 'function') { try { to = (await lookupEmail(uid)) || ''; } catch (e) { to = ''; } }
    if (to) {
      try {
        await mailer({
          to: to,
          kind: 'refund_locked',
          subject: 'BeyondSpec 訂閱已因退款暫停',
          text: '您的 BeyondSpec 訂閱已因退款 / 退單暫停服務，資料仍保留為唯讀。如有疑問請聯絡客服。',
        });
        emailQueued = true;
      } catch (e) { await alert({ type: 'refund_email_failed', uid: uid, refundId: out.refundId }); }
    }
  }

  return {
    ok: true,
    transition: out.transition,
    billingStatus: out.patch.billingStatus,
    refundId: out.refundId,
    idempotent: false,
    emailQueued: emailQueued,
    bindingTodo: bindingTodo,
  };
}

/**
 * 【handler · webhook 退款通知】若未來綠界有「退款 / 退單」server 通知打到 webhook，
 *   走這條（先驗章，再 re-lock）。目前綠界定期定額退款多為後台手動，本 handler 是
 *   「有通知就接得住」的前瞻接口——與 handleManualRefund 共用 applyRefundLock。
 *
 *   通知如何辨識為「退款」：依綠界退款 / 爭議通知欄位（如 RtnCode 退款碼 / TradeStatus）。
 *   本骨架用注入的 isRefundNotify(p) 判定（綠界實際欄位待 Edward 對齊文件後填），
 *   預設 fallback：p.RtnCode 為退款相關碼或 p.RefundAmount > 0。
 *
 * @param {Object} args
 * @param {Object|string|URLSearchParams} args.body  綠界 POST
 * @param {Object} args.env     含 ECPAY_HASH_KEY/IV
 * @param {Object} args.store   BillingStore
 * @param {function} [args.isRefundNotify] (p)=>boolean 判「這是退款通知」
 * @param {function} [args.uidFrom] (p)=>uid（預設讀 CustomField1）
 * @param {function} [args.onAlert]
 * @param {Object} [args.opts]   { now }
 * @returns {Promise<{status:number, body:string, contentType:string, _meta:Object}>}
 *   body 回綠界純文字（1|OK / 0|message）。
 */
async function handleRefundNotify(args) {
  const env = args.env || {};
  const store = args.store;
  const onAlert = args.onAlert;
  const opts = args.opts || {};
  const now = typeof opts.now === 'number' ? opts.now : Date.now();
  const isRefundNotify = typeof args.isRefundNotify === 'function'
    ? args.isRefundNotify
    : (p) => Number(p && (p.RefundAmount || p.refundAmount) || 0) > 0;
  const uidFrom = typeof args.uidFrom === 'function' ? args.uidFrom : (p) => (p && p.CustomField1) || '';

  const alert = async (e) => { if (typeof onAlert === 'function') { try { await onAlert(e); } catch (er) {} } };
  const textReply = (body, status) => ({ status: status || 200, body: body, contentType: 'text/plain' });

  // parse body
  let p = args.body;
  if (!(p && typeof p === 'object') || p instanceof URLSearchParams) {
    const out = {};
    let sp = null;
    if (p instanceof URLSearchParams) sp = p;
    else if (typeof p === 'string') sp = new URLSearchParams(p);
    if (sp) sp.forEach((v, k) => { out[k] = v; });
    p = out;
  }

  if (!store) return Object.assign(textReply('0|store missing', 200), { _meta: { result: 'config_error' } });
  if (!env.ECPAY_HASH_KEY || !env.ECPAY_HASH_IV) {
    await alert({ type: 'config', reason: 'ecpay keys not configured' });
    return Object.assign(textReply('0|keys missing', 200), { _meta: { result: 'config_error' } });
  }

  // 驗章（與一般 webhook 同等級，退款通知一樣不可信前端 / 偽造）
  let verified = false;
  try { verified = await verifyCheckMacValue(p, env.ECPAY_HASH_KEY, env.ECPAY_HASH_IV); }
  catch (e) { verified = false; }
  if (!verified) {
    await alert({ type: 'refund_checkmac_failed', tradeNo: p.MerchantTradeNo || '' });
    return Object.assign(textReply('0|CheckMacValue verify failed', 200), { _meta: { result: 'verify_failed' } });
  }

  if (!isRefundNotify(p)) {
    // 不是退款通知 → 不歸本 handler 管（外層路由應已分流；保險回 OK 不動）。
    return Object.assign(textReply('1|OK', 200), { _meta: { result: 'not_refund' } });
  }

  const uid = uidFrom(p);
  if (!uid) {
    await alert({ type: 'refund_missing_uid', tradeNo: p.MerchantTradeNo || '' });
    return Object.assign(textReply('1|OK', 200), { _meta: { result: 'missing_uid' } });
  }

  const res = await handleManualRefund({
    store: store,
    uid: uid,
    event: {
      refundId: p.RefundId || p.refundId || '',
      kind: REFUND_KINDS.manual_refund,   // 綠界退款通知歸 manual（後台發動）；chargeback 走另一通道
      amount: Number(p.RefundAmount || p.refundAmount || p.TradeAmt || 0),
      merchantTradeNo: p.MerchantTradeNo || '',
      reason: p.RtnMsg || 'ecpay refund notify',
    },
    onAlert: onAlert,
    opts: { now: now },
  });

  return Object.assign(textReply('1|OK', 200), {
    _meta: {
      result: res.idempotent ? 'duplicate' : 'relocked',
      uid: uid,
      refundId: res.refundId,
      billingStatus: res.billingStatus,
    },
  });
}

const _api = {
  REFUND_KINDS,
  ensureRefunds,
  refundEventId,
  applyRefundLock,
  handleManualRefund,
  handleRefundNotify,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = _api;
}

export {
  REFUND_KINDS,
  ensureRefunds,
  refundEventId,
  applyRefundLock,
  handleManualRefund,
  handleRefundNotify,
};
