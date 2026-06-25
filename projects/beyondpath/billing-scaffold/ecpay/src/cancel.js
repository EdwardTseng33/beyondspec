/**
 * BeyondSpec × 綠界 — /ecpay/cancel 取消訂閱（紅線 2）
 * ==================================================================
 * 鐵律（沙利曼 spec 紅線 2 / flow Step 8）：
 *   取消訂閱【必須真呼叫綠界停扣】，不能只改自家 DB。
 *   綠界定期定額的扣款排程【在綠界端】——自家 Firestore 標 cancelled
 *   不會讓綠界停止扣款，下個月照扣 → chargeback + 消保 + 上新聞。
 *
 * 正確流程：
 *   1. 前端按「取消」→ 不直接改狀態 → 呼叫 Worker /ecpay/cancel { uid }。
 *   2. Worker 從 Firestore 讀該 uid 的 subscription（MerchantTradeNo）。
 *   3. Worker 簽章 + POST 綠界 CreditCardPeriodAction { Action:'Cancel' }（真呼叫）。
 *   4. 綠界回【確認停用成功】→ 才寫 Firestore billingStatus='cancelled' + cancelledAt。
 *   5. 綠界回失敗 → 【不可】標已取消 → 回前端「請聯絡客服」+ 告警。
 *   6. 降級時點：取消後服務用到當期帳期結束（plan 維持到 nextBillingAt），不立刻斷。
 *
 * 驗收（Gate 5 / sandbox C1）：要【綠界後台截圖確認該授權狀態=停用】，
 *   不接受「app 顯示已取消」當證據——這支只負責「真的去呼叫綠界」。
 *
 * CreditCardPeriodAction 參數（developers.ecpay.com.tw p=16618）：
 *   MerchantID / MerchantTradeNo / Action='Cancel' / TimeStamp / CheckMacValue。
 *   回應為 form-urlencoded：RtnCode（1=成功）/ RtnMsg / MerchantID / MerchantTradeNo。
 *
 * HTTP 注入：真呼叫綠界用 fetch；測試注入 fakeFetch，不打真網路（也不碰真錢）。
 * 執行環境：Worker（現代 JS）。前端不引用本檔。
 */

'use strict';

import { genCheckMacValue, verifyCheckMacValue } from './checkmac.js';
import { MERCHANT_ID, endpointsFor } from './config.js';

/**
 * 綠界 TimeStamp = Unix epoch 秒。
 * @param {number} [nowMs]
 * @returns {number}
 */
function ecpayTimeStamp(nowMs) {
  return Math.floor((nowMs || Date.now()) / 1000);
}

/**
 * 把綠界回應（form-urlencoded 字串或物件）parse 成物件。
 * @param {string|Object} resp
 * @returns {Object}
 */
function parseActionResponse(resp) {
  if (resp && typeof resp === 'object') return resp;
  const out = {};
  if (typeof resp === 'string') {
    new URLSearchParams(resp).forEach((v, k) => { out[k] = v; });
  }
  return out;
}

/**
 * 組「取消定期定額」的簽章請求參數（不送出，只組欄位）。純函式。
 * 抽出來讓測試能單獨驗「簽章正確 + 欄位齊」。
 *
 * @param {Object} input
 * @param {string} input.merchantTradeNo  要取消的訂閱單號
 * @param {Object} env  含 ECPAY_HASH_KEY / IV / ECPAY_ENV
 * @param {Object} [opts] { now } 注入時鐘（測試）
 * @returns {Promise<{action:string, fields:Object}>}
 */
async function buildCancelRequest(input, env, opts) {
  opts = opts || {};
  const merchantTradeNo = input && input.merchantTradeNo;
  if (!merchantTradeNo) throw new Error('buildCancelRequest: missing merchantTradeNo');
  if (!env || !env.ECPAY_HASH_KEY || !env.ECPAY_HASH_IV) {
    throw new Error('buildCancelRequest: ecpay keys not configured');
  }
  const ep = endpointsFor(env.ECPAY_ENV);
  const fields = {
    MerchantID: MERCHANT_ID,
    MerchantTradeNo: merchantTradeNo,
    Action: 'Cancel',
    TimeStamp: ecpayTimeStamp(opts.now),
  };
  fields.CheckMacValue = await genCheckMacValue(fields, env.ECPAY_HASH_KEY, env.ECPAY_HASH_IV);
  return { action: ep.periodAction, fields: fields };
}

/**
 * 把 fields 轉成 form-urlencoded body（綠界端要 form post）。
 * @param {Object} fields
 * @returns {string}
 */
function toFormBody(fields) {
  const sp = new URLSearchParams();
  for (const k in fields) {
    if (Object.prototype.hasOwnProperty.call(fields, k)) sp.append(k, String(fields[k]));
  }
  return sp.toString();
}

/**
 * 核心 handler：取消訂閱。
 *
 * @param {Object} args
 * @param {Object} args.input    { uid }（前端只送 uid，訂閱單號由 server 從 store 查）
 * @param {Object} args.env      Worker env
 * @param {Object} args.store    BillingStore（讀 subscription / 寫 cancelled）
 * @param {function} args.fetchImpl  async (url, {method,headers,body}) => { status, text() }
 *                                   真上線傳 globalThis.fetch；測試傳 fakeFetch。
 * @param {function} [args.onAlert]  async (evt)=>{} 告警（取消失敗）
 * @param {Object} [args.opts]    { now } 注入時鐘
 * @returns {Promise<{ok:boolean, status:number, error?:string, billing?:Object, ecpay?:Object}>}
 */
async function handleCancel(args) {
  const env = args.env || {};
  const store = args.store;
  const fetchImpl = args.fetchImpl;
  const onAlert = args.onAlert;
  const opts = args.opts || {};
  const uid = args.input && args.input.uid;

  const alert = async (evt) => { if (typeof onAlert === 'function') { try { await onAlert(evt); } catch (e) {} } };

  if (!store) return { ok: false, status: 500, error: 'store missing' };
  if (!uid) return { ok: false, status: 400, error: 'missing uid' };
  if (typeof fetchImpl !== 'function') return { ok: false, status: 500, error: 'fetch not provided' };
  if (!env.ECPAY_HASH_KEY || !env.ECPAY_HASH_IV) return { ok: false, status: 500, error: 'ecpay keys not configured' };

  // —— 1. 從 store 讀該用戶的訂閱單號 ——
  const billing = await store.getBilling(uid);
  if (!billing || !billing.merchantTradeNo) {
    return { ok: false, status: 404, error: 'no active subscription' };
  }
  if (billing.billingStatus === 'cancelled') {
    // 已取消過 → idempotent，直接回成功（不再打綠界）。
    return { ok: true, status: 200, billing: billing, ecpay: { alreadyCancelled: true } };
  }

  // —— 2. 組簽章請求 → 真呼叫綠界 CreditCardPeriodAction Cancel ——
  let req;
  try {
    req = await buildCancelRequest({ merchantTradeNo: billing.merchantTradeNo }, env, opts);
  } catch (e) {
    return { ok: false, status: 500, error: String(e && e.message || e) };
  }

  let respText = '';
  let httpStatus = 0;
  try {
    const resp = await fetchImpl(req.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: toFormBody(req.fields),
    });
    httpStatus = resp && typeof resp.status === 'number' ? resp.status : 0;
    respText = resp && typeof resp.text === 'function' ? await resp.text() : (resp && resp.body) || '';
  } catch (e) {
    // 網路 / 綠界不可達 →【不可】標已取消。回前端請聯絡客服 + 告警。
    await alert({ type: 'cancel_network_error', uid: uid, merchantTradeNo: billing.merchantTradeNo, error: String(e && e.message || e) });
    return { ok: false, status: 502, error: 'ecpay unreachable, not cancelled' };
  }

  const ecpayResp = parseActionResponse(respText);

  // —— 3. 綠界回應驗證：HTTP 2xx + RtnCode==1 才算真停用 ——
  //    （部分綠界 Action 回應也帶 CheckMacValue，可選驗章；缺則靠 RtnCode。）
  const rtn = String(ecpayResp.RtnCode || '');
  const httpOk = httpStatus >= 200 && httpStatus < 300;
  // 若回應帶 CheckMacValue，順手驗章（多一層防偽）；驗不過不直接 fail（綠界 Action 回應
  // 簽章欄位範圍偶有差異），但記下來。主判仍是 RtnCode。
  let respVerified = null;
  if (ecpayResp.CheckMacValue) {
    try { respVerified = await verifyCheckMacValue(ecpayResp, env.ECPAY_HASH_KEY, env.ECPAY_HASH_IV); }
    catch (e) { respVerified = false; }
  }

  if (!httpOk || rtn !== '1') {
    // 綠界沒確認停用 →【不可】標已取消（紅線 2 / sandbox C2）。
    await alert({ type: 'cancel_failed', uid: uid, merchantTradeNo: billing.merchantTradeNo, httpStatus: httpStatus, rtnCode: rtn, rtnMsg: ecpayResp.RtnMsg || '' });
    return { ok: false, status: 502, error: 'ecpay did not confirm cancel', ecpay: { httpStatus: httpStatus, rtnCode: rtn, rtnMsg: ecpayResp.RtnMsg || '', respVerified: respVerified } };
  }

  // —— 4. 綠界確認停用 → 才寫 Firestore cancelled ——
  //    降級時點：plan 維持到 nextBillingAt（已付當期），到期才降 free（紅線 2.5 / C3）。
  const cancelledAt = (opts.now || Date.now)();
  const next = await store.setBilling(uid, {
    billingStatus: 'cancelled',
    cancelledAt: cancelledAt,
    cancelEcpayRtnCode: rtn,
    updatedBy: 'cancel',
    // plan 故意【不動】——服務用到當期帳期結束。降級交給到期排程（backlog）。
  });

  return {
    ok: true,
    status: 200,
    billing: next,
    ecpay: { httpStatus: httpStatus, rtnCode: rtn, rtnMsg: ecpayResp.RtnMsg || '', respVerified: respVerified },
  };
}

const _api = {
  ecpayTimeStamp, parseActionResponse, buildCancelRequest, toFormBody, handleCancel,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = _api;
}

export {
  ecpayTimeStamp, parseActionResponse, buildCancelRequest, toFormBody, handleCancel,
};
