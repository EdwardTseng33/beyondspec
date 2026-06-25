/**
 * BeyondSpec × 綠界 — 定期定額建單模組（Worker /ecpay/create-order）
 * ------------------------------------------------------------------
 * 對應技術計畫 §1 流程 Step 1–3、安全 spec §4 Step 1–2 + 紅線 1.4。
 *
 * 職責：
 *   1. 收前端 { plan, uid }（前端【不送金額】）。
 *   2. 依 plan 從 PLAN_CATALOG 查【權威金額】（紅線 1 / B1：前端改金額無效）。
 *   3. 產唯一 MerchantTradeNo（uid 線索 + 毫秒時戳 + 隨機尾碼，≤20 字）。
 *   4. 組 AioCheckOut/V5 訂單（含定期定額欄位）→ 簽 CheckMacValue。
 *   5. 回前端「已簽章欄位 + action URL」，前端組 <form> auto-submit 到綠界。
 *
 * 安全：
 *   - HashKey/HashIV 由呼叫端（Worker）從 env 傳入，本檔不含值、不回前端。
 *   - action URL 從 config 端點表二選一，不由前端決定（防 open-redirect）。
 *   - 全程不碰卡號（PCI SAQ-A）：本檔只組「導去綠界」的表單。
 *
 * 執行環境：Cloudflare Worker（現代 JS）。前端不引用本檔。
 */

'use strict';

import { genCheckMacValue } from './checkmac.js';
import { MERCHANT_ID, PLAN_CATALOG, PERIOD_DEFAULTS, endpointsFor } from './config.js';

/**
 * 以台灣時間（UTC+8）格式化成綠界要求的 yyyy/MM/dd HH:mm:ss。
 * 明確用 UTC+8 計算，避免 Worker 所在時區造成 off-by-one（CLAUDE.md 既有教訓）。
 * @param {Date} d
 * @returns {string}
 */
function fmtEcpayDate(d) {
  // 取 UTC 毫秒 + 8 小時 → 得到「台灣牆上時間」的等價 UTC 表示，再用 getUTC* 取欄位。
  const tw = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  const p2 = (n) => String(n).padStart(2, '0');
  return (
    tw.getUTCFullYear() + '/' +
    p2(tw.getUTCMonth() + 1) + '/' +
    p2(tw.getUTCDate()) + ' ' +
    p2(tw.getUTCHours()) + ':' +
    p2(tw.getUTCMinutes()) + ':' +
    p2(tw.getUTCSeconds())
  );
}

/**
 * 產唯一 MerchantTradeNo（≤20 字、英數）。
 *   格式：BS + base36(毫秒時戳) + 4 碼隨機。長度約 2+9+4 = 15 字，安全在 20 內。
 *   uid 不直接塞進 TradeNo（uid 可能太長 / 含非英數）；uid 走 CustomField1 回傳定位。
 * @param {function} [nowFn] 注入時鐘（測試用）
 * @param {function} [randFn] 注入亂數（測試用）
 * @returns {string}
 */
function genMerchantTradeNo(nowFn, randFn) {
  const now = (nowFn || Date.now)();
  const rnd = (randFn || Math.random)();
  const ts = now.toString(36);
  const tail = rnd.toString(36).slice(2, 6).padEnd(4, '0');
  return ('BS' + ts + tail).slice(0, 20);
}

/**
 * 組定期定額訂單欄位（含簽章）。純函式（除了預設時鐘/亂數，可注入）。
 *
 * @param {Object} input
 * @param {string} input.plan         方案 key（'pro' | 'max'）
 * @param {string} input.uid          Firebase uid（回 webhook 定位用，進 CustomField1）
 * @param {Object} env                Worker env（含 secret + base url）
 * @param {string} env.ECPAY_ENV      'stage' | 'prod'
 * @param {string} env.ECPAY_HASH_KEY (secret)
 * @param {string} env.ECPAY_HASH_IV  (secret)
 * @param {string} env.WORKER_BASE    Worker 對外 base，如 https://path-ai-proxy.xxx.workers.dev
 * @param {string} env.APP_BASE       前端 base，如 https://beyondspec.tw
 * @param {Object} [opts]             測試注入 { now, rand }
 * @returns {Promise<{ok:true, action:string, fields:Object} | {ok:false, error:string, status:number}>}
 */
async function buildSubscriptionOrder(input, env, opts) {
  opts = opts || {};
  const plan = input && input.plan;
  const uid = input && input.uid;

  // — 防呆 / 權威金額 —
  const planDef = PLAN_CATALOG[plan];
  if (!planDef) {
    return { ok: false, error: 'unknown plan', status: 400 };
  }
  if (!uid || typeof uid !== 'string') {
    return { ok: false, error: 'missing uid', status: 400 };
  }
  if (!env || !env.ECPAY_HASH_KEY || !env.ECPAY_HASH_IV) {
    // 金鑰沒設 = 部署未完成，明確報錯，不要默默簽出錯誤章。
    return { ok: false, error: 'ecpay keys not configured', status: 500 };
  }

  const amount = planDef.amount;            // 權威金額（不信前端）
  const tradeNo = genMerchantTradeNo(opts.now, opts.rand);
  const ep = endpointsFor(env.ECPAY_ENV);
  const workerBase = (env.WORKER_BASE || '').replace(/\/$/, '');
  const appBase = (env.APP_BASE || '').replace(/\/$/, '');

  // — 組訂單參數（綠界 AioCheckOut/V5 + 定期定額欄位）—
  const params = {
    MerchantID: MERCHANT_ID,
    MerchantTradeNo: tradeNo,
    MerchantTradeDate: fmtEcpayDate(new Date((opts.now || Date.now)())),
    PaymentType: 'aio',
    TotalAmount: amount,
    TradeDesc: 'BeyondSpec Subscription',
    ItemName: planDef.itemName,
    ReturnURL: workerBase + '/ecpay/webhook',          // server-to-server，驗章解鎖（紅線1）
    OrderResultURL: appBase + '/path/app/#sub-pending', // 前端落地頁：只顯示處理中（不可自解）
    ChoosePayment: 'Credit',
    EncryptType: 1,                                     // 綠界建議 SHA256，固定 1
    // —— 定期定額專屬 ——
    PeriodAmount: amount,                               // 必須 = TotalAmount
    PeriodType: PERIOD_DEFAULTS.PeriodType,            // 'M'
    Frequency: PERIOD_DEFAULTS.Frequency,             // 1
    ExecTimes: PERIOD_DEFAULTS.ExecTimes,             // 12
    PeriodReturnURL: workerBase + '/ecpay/webhook',    // 每期扣款結果回這（同 webhook）
    // —— webhook 回來定位用戶（納入 CheckMacValue，不可竄改）——
    CustomField1: uid,
  };

  // — 簽章（最後一步；HashKey/HashIV 用完即丟，不進回傳）—
  params.CheckMacValue = await genCheckMacValue(params, env.ECPAY_HASH_KEY, env.ECPAY_HASH_IV);

  return { ok: true, action: ep.aioCheckout, fields: params };
}

const _api = { fmtEcpayDate, genMerchantTradeNo, buildSubscriptionOrder };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = _api;
}

export { fmtEcpayDate, genMerchantTradeNo, buildSubscriptionOrder };
