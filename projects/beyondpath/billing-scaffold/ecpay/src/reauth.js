/**
 * BeyondSpec × 綠界 — 主動 ReAuth 重授權救援（dunning 漏財防線 · 對應紅線 1/2 邊界）
 * ==================================================================
 * 這支在做什麼：
 *   扣款失敗進入 dunning 後，與其【被動】等綠界下一期自動重扣 / 等用戶補卡，
 *   可以【主動】呼叫綠界 `CreditCardPeriodAction { Action:'ReAuth' }` 請綠界
 *   立刻對該訂閱「重新授權扣一次」——在綠界連 6 次失敗自動終止前主動救回。
 *   （綠界門檻：連 6 次失敗才自動取消後續扣款；中間每一次都還能 ReAuth 救。）
 *
 * ⚠️ 最關鍵的紅線（accepted ≠ charged）：
 *   ReAuth 的【同步回應】(RtnCode==1) 只代表「綠界**受理了**這次重扣請求」，
 *   【不是】「這次到底扣成功沒」。真正「扣成功 / 失敗」的結果是綠界【之後】
 *   非同步透過 webhook（`PeriodReturnURL` server-to-server POST + CheckMacValue）
 *   才回來的——那一條（webhook.js）才是金流真相、才會解鎖 / 救回 active。
 *
 *   所以這支 `handleReAuth` 的職責【嚴格限縮】為：
 *     ✅ 簽章 + POST 綠界、確認綠界【受理】了 ReAuth 請求。
 *     ❌ 【絕不】自己解鎖、❌【絕不】把 past_due/locked 改回 active、
 *        ❌【絕不】碰任何 billing 狀態、❌【絕不】清 dunning。
 *   回傳值用 `accepted`（受理）一個欄位明確表態，**故意不回任何 charged/unlocked**，
 *   讓呼叫端（Worker / 排程）不可能誤把「受理」當「扣成功」而提早解鎖
 *   ——那會變成「綠界其實沒扣到、我們卻解了鎖」＝白嫖漏洞（紅線 1 反例）。
 *
 * 對齊：
 *   - trust spec §3「取消 / ReAuth」：ReAuth 同 CreditCardPeriodAction 端點。
 *   - tech plan Step 7 / J：「扣款失敗 ReAuth + 寬限期寄信」，綠界連 6 次失敗才終止。
 *   - README「第三塊」整合待辦 #3：主動 ReAuth「可加在 cancel.js 同模式：
 *     buildReAuthRequest + fetch 注入」——本檔即此實作，結構與 cancel.js 一致。
 *
 * CreditCardPeriodAction 參數（developers.ecpay.com.tw p=16618）：
 *   MerchantID / MerchantTradeNo / Action='ReAuth' / TimeStamp / CheckMacValue。
 *   回應為 form-urlencoded：RtnCode（1=受理）/ RtnMsg / MerchantID / MerchantTradeNo。
 *
 * HTTP 注入：真呼叫綠界用 fetch；測試注入 fakeFetch，不打真網路（也不碰真錢）。
 * 執行環境：Worker（現代 JS）。前端不引用本檔（前端不可觸發 ReAuth）。
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
 * 組「主動重授權」的簽章請求參數（不送出，只組欄位）。純函式。
 * 抽出來讓測試能單獨驗「簽章正確 + 欄位齊 + Action=ReAuth」。
 *
 * 結構與 cancel.js buildCancelRequest 一致，唯一差別是 Action='ReAuth'。
 *
 * @param {Object} input
 * @param {string} input.merchantTradeNo  要重授權的訂閱單號
 * @param {Object} env  含 ECPAY_HASH_KEY / IV / ECPAY_ENV
 * @param {Object} [opts] { now } 注入時鐘（測試）
 * @returns {Promise<{action:string, fields:Object}>}
 */
async function buildReAuthRequest(input, env, opts) {
  opts = opts || {};
  const merchantTradeNo = input && input.merchantTradeNo;
  if (!merchantTradeNo) throw new Error('buildReAuthRequest: missing merchantTradeNo');
  if (!env || !env.ECPAY_HASH_KEY || !env.ECPAY_HASH_IV) {
    throw new Error('buildReAuthRequest: ecpay keys not configured');
  }
  const ep = endpointsFor(env.ECPAY_ENV);
  const fields = {
    MerchantID: MERCHANT_ID,
    MerchantTradeNo: merchantTradeNo,
    Action: 'ReAuth',
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
 * 核心 handler：主動向綠界發起 ReAuth 重授權。
 *
 * 【鐵律】只確認「綠界受理 ReAuth」，絕不解鎖、絕不碰 billing 狀態。
 *   真正扣成功與否由之後的 webhook（PeriodReturnURL）決定。
 *
 * 設計上故意【不接收 store】、也【不寫任何資料】——把「會不會改 billing」這件事
 *   從介面層就移除，杜絕誤用。呼叫端拿到 { accepted:true } 後該做的事只有：
 *   記一筆「已發過 ReAuth、等 webhook」、（可選）等寬限/webhook，**不是**解鎖。
 *
 * @param {Object} args
 * @param {Object} args.input    { merchantTradeNo }（要重授權的訂閱單號；由呼叫端從 store 查好帶入）
 * @param {Object} args.env      Worker env（含 ECPAY_HASH_KEY/IV/ENV）
 * @param {function} args.fetchImpl  async (url, {method,headers,body}) => { status, text() }
 *                                   真上線傳 globalThis.fetch；測試傳 fakeFetch。
 * @param {function} [args.onAlert]  async (evt)=>{} 告警（ReAuth 受理失敗 / 網路錯）
 * @param {Object} [args.opts]    { now } 注入時鐘
 * @returns {Promise<{
 *   ok:boolean,
 *   accepted:boolean,   // 綠界是否【受理】此次 ReAuth 請求（≠ 扣款成功）
 *   charged:false,      // 永遠 false：扣成功與否要等 webhook，這支不可能知道
 *   status:number,
 *   error?:string,
 *   rtnCode?:string, rtnMsg?:string,
 *   ecpay?:Object,
 * }>}
 */
async function handleReAuth(args) {
  args = args || {};
  const env = args.env || {};
  const fetchImpl = args.fetchImpl;
  const onAlert = args.onAlert;
  const opts = args.opts || {};
  const merchantTradeNo = args.input && args.input.merchantTradeNo;

  const alert = async (evt) => { if (typeof onAlert === 'function') { try { await onAlert(evt); } catch (e) {} } };

  // 防呆。注意：缺 merchantTradeNo / 金鑰 / fetch 一律「沒受理」（accepted:false），
  // 且永遠回 charged:false——任何路徑都不允許暗示扣款成功。
  if (!merchantTradeNo) return { ok: false, accepted: false, charged: false, status: 400, error: 'missing merchantTradeNo' };
  if (typeof fetchImpl !== 'function') return { ok: false, accepted: false, charged: false, status: 500, error: 'fetch not provided' };
  if (!env.ECPAY_HASH_KEY || !env.ECPAY_HASH_IV) return { ok: false, accepted: false, charged: false, status: 500, error: 'ecpay keys not configured' };

  // —— 1. 組簽章請求 → 真呼叫綠界 CreditCardPeriodAction ReAuth ——
  let req;
  try {
    req = await buildReAuthRequest({ merchantTradeNo: merchantTradeNo }, env, opts);
  } catch (e) {
    return { ok: false, accepted: false, charged: false, status: 500, error: String(e && e.message || e) };
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
    // 網路 / 綠界不可達 → 沒受理。告警，等下一期 / 下次再試。【不碰 billing】。
    await alert({ type: 'reauth_network_error', merchantTradeNo: merchantTradeNo, error: String(e && e.message || e) });
    return { ok: false, accepted: false, charged: false, status: 502, error: 'ecpay unreachable, reauth not accepted' };
  }

  const ecpayResp = parseActionResponse(respText);

  // —— 2. 綠界回應驗證：HTTP 2xx + RtnCode==1 才算「受理」（不是扣成功） ——
  //    （部分綠界 Action 回應也帶 CheckMacValue，可選驗章；缺則靠 RtnCode。）
  const rtn = String(ecpayResp.RtnCode || '');
  const httpOk = httpStatus >= 200 && httpStatus < 300;
  let respVerified = null;
  if (ecpayResp.CheckMacValue) {
    try { respVerified = await verifyCheckMacValue(ecpayResp, env.ECPAY_HASH_KEY, env.ECPAY_HASH_IV); }
    catch (e) { respVerified = false; }
  }

  if (!httpOk || rtn !== '1') {
    // 綠界沒受理這次 ReAuth → 告警；維持 dunning 既有狀態（這支本來就不碰 billing）。
    await alert({ type: 'reauth_rejected', merchantTradeNo: merchantTradeNo, httpStatus: httpStatus, rtnCode: rtn, rtnMsg: ecpayResp.RtnMsg || '' });
    return {
      ok: false, accepted: false, charged: false, status: 502,
      error: 'ecpay did not accept reauth',
      rtnCode: rtn, rtnMsg: ecpayResp.RtnMsg || '',
      ecpay: { httpStatus: httpStatus, rtnCode: rtn, rtnMsg: ecpayResp.RtnMsg || '', respVerified: respVerified },
    };
  }

  // —— 3. 綠界【受理】ReAuth ——
  //    到此為止。【不解鎖、不改 billing、不清 dunning】。
  //    真正扣成功會由綠界之後的 webhook（PeriodReturnURL）送來、走 webhook.js →
  //    dunning.applyRecurringSuccess 救回 active。這支只負責「請綠界重扣一次」。
  return {
    ok: true,
    accepted: true,       // 受理 ≠ 扣成功
    charged: false,       // 永遠 false：要等 webhook 才知道扣成功沒
    status: 200,
    rtnCode: rtn, rtnMsg: ecpayResp.RtnMsg || '',
    ecpay: { httpStatus: httpStatus, rtnCode: rtn, rtnMsg: ecpayResp.RtnMsg || '', respVerified: respVerified },
  };
}

const _api = {
  ecpayTimeStamp, parseActionResponse, buildReAuthRequest, toFormBody, handleReAuth,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = _api;
}

export {
  ecpayTimeStamp, parseActionResponse, buildReAuthRequest, toFormBody, handleReAuth,
};
