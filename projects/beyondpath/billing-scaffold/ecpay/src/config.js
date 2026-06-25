/**
 * BeyondSpec × 綠界 — 端點 / 方案 / 公開常數
 * ------------------------------------------------------------------
 * 安全分界（沙利曼 spec §1）：
 *   - 本檔【只放公開值】：端點 URL、MerchantID（3502366）、方案金額。
 *   - 【絕不放】HashKey / HashIV——那些只在 Worker secret（env），執行期才讀。
 *
 * 端點寫死成常數 = 防 open-redirect（沙利曼 §4 Step3 風險）：
 *   結帳域名不可由前端參數拼裝，只能從這張表二選一（stage / prod）。
 */

'use strict';

// 綠界商店代號（公開識別碼，可進 git / 前端 / 常數）。
// 沙利曼 §1：這不是秘密，真正要命的只有 HashKey/HashIV。
const MERCHANT_ID = '3502366';

// 端點（依 env 切換；ECPAY_ENV='stage'|'prod' 由 Worker secret 決定）。
const ENDPOINTS = {
  stage: {
    aioCheckout: 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5',
    periodAction: 'https://payment-stage.ecpay.com.tw/Cashier/CreditCardPeriodAction',
    periodQuery: 'https://payment-stage.ecpay.com.tw/Cashier/QueryCreditCardPeriodInfo',
  },
  prod: {
    aioCheckout: 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5',
    periodAction: 'https://payment.ecpay.com.tw/Cashier/CreditCardPeriodAction',
    periodQuery: 'https://payment.ecpay.com.tw/Cashier/QueryCreditCardPeriodInfo',
  },
};

/**
 * 方案金額（NTD 整數）— server 端權威來源（沙利曼紅線 1 / B1）。
 * 前端只送 plan key，金額永遠在這查；前端傳來的金額一律不信。
 * 必須與 app.html PLAN_CATALOG / billing-config.js 對齊（Edward 拍定價後同步）。
 *
 * 註：實際定價（Starter 7天硬鎖 / PRO 499 / MAX 999 / Team）見 MEMORY
 *     saas-billing-ecpay-plan.md。此處先放 PRO/MAX 兩檔可定期定額者；
 *     Starter 為試用不收卡、Team 走 seat（Q2 紅燈，先不自動化）。
 */
const PLAN_CATALOG = {
  pro: { amount: 499, label: 'BeyondSpec PRO', itemName: 'BeyondSpec PRO 訂閱' },
  max: { amount: 999, label: 'BeyondSpec MAX', itemName: 'BeyondSpec MAX 訂閱' },
};

// 定期定額預設週期（月訂閱）。ExecTimes 上限 D/M=999、Y=99（官方 p=2868 確認）。
// 12 期 = 先簽一年，到期前排程續簽 / 寄信續訂（卡西法風險 #3：ExecTimes 非無限）。
const PERIOD_DEFAULTS = {
  PeriodType: 'M',   // 月
  Frequency: 1,      // 每 1 個月
  ExecTimes: 12,     // 12 期（到期前須續簽，見 backlog）
};

/**
 * 取得目前環境的端點組。
 * @param {string} envName 'stage' | 'prod'
 * @returns {{aioCheckout:string, periodAction:string, periodQuery:string}}
 */
function endpointsFor(envName) {
  const key = envName === 'prod' ? 'prod' : 'stage'; // 預設 stage（安全預設：未明示 prod 不打正式）
  return ENDPOINTS[key];
}

const _api = { MERCHANT_ID, ENDPOINTS, PLAN_CATALOG, PERIOD_DEFAULTS, endpointsFor };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = _api;
}

export { MERCHANT_ID, ENDPOINTS, PLAN_CATALOG, PERIOD_DEFAULTS, endpointsFor };
