/**
 * BeyondSpec × 綠界 — CheckMacValue 驗章模組（產生 + 驗證）
 * ------------------------------------------------------------------
 * 性質：金流防偽核心。同一套演算法用於「送單簽章」與「驗證收到的通知」。
 * 安全前提（沙利曼 spec §1 / §3）：
 *   - 只在 Cloudflare Worker runtime 執行；HashKey / HashIV 來自 Worker secret。
 *   - 前端永遠不持有金鑰、永遠不跑這支。
 *   - 本檔【不含】任何金鑰值——金鑰由呼叫端（Worker）傳入。
 *
 * 演算法（綠界官方 + 沙利曼 spec §3，逐步）：
 *   1. 取所有參數（排除 CheckMacValue 本身），依【參數名 A→Z】排序。
 *   2. 組字串：HashKey=<key>&k1=v1&k2=v2&...&HashIV=<iv>
 *   3. 整串做 .NET 風格 URLEncode（HttpUtility.UrlEncode 行為）。
 *   4. 整串轉【全小寫】。
 *   5. SHA256。
 *   6. 結果轉【全大寫】= CheckMacValue。
 *
 * 最易錯處（沙利曼 §3 / 卡西法風險 #2）：
 *   JS encodeURIComponent 與 .NET HttpUtility.UrlEncode 對部分字元行為不同。
 *   本檔的 dotNetUrlEncode() 把 encodeURIComponent 的輸出校正成 .NET 行為，
 *   逐字對照綠界官方範例值（見 test/checkmac.test.js A1）釘死。
 *
 * 執行環境：Cloudflare Worker（WebCrypto / crypto.subtle 可用）。
 *   為了能在 Node 跑 unit test，sha256 同時相容 Node（globalThis.crypto.subtle，
 *   Node ≥ 16 的 webcrypto 已全域可用）。純函式、無外部相依。
 *
 * ES 等級：本檔屬 Worker 端，使用現代 JS（const/async）。
 *   （app.html 前端維持 ES5；前端不引用本檔。）
 */

'use strict';

/**
 * .NET HttpUtility.UrlEncode 風格編碼。
 *
 * 綠界官方 SDK 的做法：先用平台的 urlencode（JS 對應 encodeURIComponent），
 * 再把以下「.NET 不編碼、但 encodeURIComponent 會編碼」的字元【還原】，
 * 並把「.NET 編碼成小寫 hex」這件事靠步驟 4 整串 toLowerCase 一次處理。
 *
 * encodeURIComponent 不編碼的字元：  A-Z a-z 0-9 - _ . ! ~ * ' ( )
 * .NET HttpUtility.UrlEncode 不編碼： A-Z a-z 0-9 - _ . ! * ( )      （以及把空白編成 +）
 *
 * 差異 → 需要校正的點：
 *   (a) 空白：encodeURIComponent → %20；.NET → '+'           ⇒ %20 換成 +
 *   (b) '~'（波浪號）：encodeURIComponent 不編碼（留 ~）；.NET 會編成 %7e
 *                      ⇒ 把字面 '~' 換成 %7e（之後整串小寫，故用小寫即可）
 *   (c) '!' '*' '(' ')' '\''：兩邊都【不編碼】，留字面 ⇒ encodeURIComponent
 *                      預設就留字面，無需動作。
 *
 * 註：綠界文件列出的需保留字元集合為 -_.!*()，與上方一致。'~' 屬綠界要求
 *     編碼者（.NET 行為），故 (b) 必做；漏掉 (b) 會在值含 '~' 時驗章對不上。
 *
 * @param {string} str
 * @returns {string}
 */
function dotNetUrlEncode(str) {
  return encodeURIComponent(str)
    .replace(/%20/g, '+')   // (a) 空白：.NET 用 + 不用 %20
    .replace(/~/g, '%7e');  // (b) 波浪號：.NET 會編碼，encodeURIComponent 不會
  // (c) ! * ( ) ' 皆由 encodeURIComponent 留字面，與 .NET 一致，無需處理。
}

/**
 * SHA256 → 大寫 hex 字串。
 * 用 WebCrypto（Worker 原生；Node ≥ 16 webcrypto 全域可用）。
 * @param {string} message
 * @returns {Promise<string>} 64 字大寫 hex
 */
async function sha256Hex(message) {
  const subtle = (globalThis.crypto && globalThis.crypto.subtle) || null;
  if (!subtle) {
    throw new Error('WebCrypto subtle 不可用（Worker / Node>=16 才支援）');
  }
  const data = new TextEncoder().encode(message);
  const digest = await subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex.toUpperCase();
}

/**
 * 組「待雜湊字串」（步驟 1–4），回傳尚未 SHA256 的最終字串。
 * 抽出來是為了測試能單獨驗證「排序 + 組字串 + 編碼 + 小寫」這幾步，
 * 不必每次都跑 SHA256。
 *
 * @param {Object} params  參與計算的參數（不含 CheckMacValue）
 * @param {string} hashKey
 * @param {string} hashIV
 * @returns {string} 已 .NET URLEncode + 全小寫，待 SHA256 的字串
 */
function buildRawString(params, hashKey, hashIV) {
  // 步驟 1：排除 CheckMacValue，取 key 排序（A→Z，區分大小寫的 ASCII 排序）。
  //   綠界以「字母順序」排序，採大小寫不敏感（依官方範例，欄位首字母多為大寫）。
  //   實務上綠界欄位命名固定，使用 localeCompare 不穩定；改用大小寫不敏感比較
  //   以對齊 .NET 的 String 排序（OrdinalIgnoreCase）。
  const keys = Object.keys(params)
    .filter((k) => k !== 'CheckMacValue')
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .sort((a, b) => {
      const la = a.toLowerCase();
      const lb = b.toLowerCase();
      if (la < lb) return -1;
      if (la > lb) return 1;
      return 0;
    });

  // 步驟 2：HashKey=...&k=v&...&HashIV=...
  let raw = 'HashKey=' + hashKey;
  for (let i = 0; i < keys.length; i++) {
    raw += '&' + keys[i] + '=' + params[keys[i]];
  }
  raw += '&HashIV=' + hashIV;

  // 步驟 3：.NET URLEncode；步驟 4：全小寫。
  return dotNetUrlEncode(raw).toLowerCase();
}

/**
 * 產生 CheckMacValue（送單簽章用）。
 * @param {Object} params  訂單參數（不含 CheckMacValue；若含會被忽略）
 * @param {string} hashKey
 * @param {string} hashIV
 * @returns {Promise<string>} 64 字大寫 CheckMacValue
 */
async function genCheckMacValue(params, hashKey, hashIV) {
  if (!hashKey || !hashIV) {
    throw new Error('genCheckMacValue: 缺 HashKey / HashIV（應由 Worker secret 傳入）');
  }
  const raw = buildRawString(params, hashKey, hashIV);
  return sha256Hex(raw);
}

/**
 * 驗證收到的通知（webhook）。對 POST 進來的參數（除 CheckMacValue）重算，
 * 與綠界送來的 CheckMacValue【逐字、大小寫不敏感】比對。
 *
 * 比對採大小寫不敏感（綠界回傳一律大寫，但保險起見 normalize），
 * 並做長度先比 + 全等比較（非 timing-safe，但 SHA256 驗章對 timing attack
 * 不敏感——攻擊者無法用 timing 反推正確雜湊；真正的保護是不知道 HashKey/HashIV）。
 *
 * @param {Object} params  綠界 POST 進來的全部參數（含 CheckMacValue）
 * @param {string} hashKey
 * @param {string} hashIV
 * @returns {Promise<boolean>} true=驗章通過
 */
async function verifyCheckMacValue(params, hashKey, hashIV) {
  if (!params || typeof params !== 'object') return false;
  const received = params.CheckMacValue;
  if (!received || typeof received !== 'string') return false;

  const expected = await genCheckMacValue(params, hashKey, hashIV);
  return expected.toUpperCase() === received.toUpperCase();
}

// ── Exports（Worker 用 ES module；Node test 用 CJS require 也能拿到） ──
// 同時支援兩種載入：Worker（import）與 Node test runner（require）。
const _api = {
  dotNetUrlEncode,
  sha256Hex,
  buildRawString,
  genCheckMacValue,
  verifyCheckMacValue,
};

// CommonJS（Node test）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = _api;
}

// ES module named exports（Worker import）
export {
  dotNetUrlEncode,
  sha256Hex,
  buildRawString,
  genCheckMacValue,
  verifyCheckMacValue,
};
