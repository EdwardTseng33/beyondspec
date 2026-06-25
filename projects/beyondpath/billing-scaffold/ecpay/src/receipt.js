/**
 * BeyondSpec × 綠界 — 收據（非發票）產生模組
 * ------------------------------------------------------------------
 * 背景（技術計畫 §4 + Edward 6/25 拍板）：
 *   Edward 個人身分、無統編、【不開統一發票】→ 付款成功只產「收據」。
 *   省掉電子發票字軌 / 財政部上傳 / 作廢折讓整套（沙利曼 spec §7 不適用本階段）。
 *   但仍要留收據 + 交易紀錄，供帳務憑證與消費者憑證（紅線 3：法定保存）。
 *
 * 這支做三件事：
 *   1. buildReceipt(...)   — 組收據資料物件（欄位最小集合，技術計畫 §4 表）。
 *   2. renderReceiptHTML() — 產可列印 HTML 收據頁（站內顯示 / 列印；PDF v1 再說）。
 *   3. buildReceiptEmail() — 組寄信內容（主旨 + 純文字 + HTML body），實際寄送
 *                            由呼叫端注入 mailer（本批不接真寄信通道，留 hook）。
 *
 * 安全 / 合規：
 *   - 信用卡只存末四碼（webhook 回傳 Card4No）；【絕不存全卡號 / CVV / 效期】（PCI §5）。
 *   - 收據寫【獨立 collection】+ legalRetention（紅線 3，store.saveReceipt 已標）。
 *   - 「本收據為信用卡訂閱付款憑證，非統一發票」聲明固定附上。
 *
 * 執行環境：Worker（現代 JS）。前端不引用本檔（前端只讀 Firestore 收據資料自行渲染）。
 */

'use strict';

/**
 * HTML escape——收據會把 email / 顯示名 / 品項塞進 HTML，必須 escape 防注入。
 * @param {*} v
 * @returns {string}
 */
function esc(v) {
  return String(v === undefined || v === null ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 以台灣時間把毫秒時戳格式化成 yyyy/MM/dd HH:mm:ss（顯示用）。
 * @param {number} ms
 * @returns {string}
 */
function fmtTW(ms) {
  const tw = new Date(ms + 8 * 60 * 60 * 1000);
  const p2 = (n) => String(n).padStart(2, '0');
  return (
    tw.getUTCFullYear() + '/' + p2(tw.getUTCMonth() + 1) + '/' + p2(tw.getUTCDate()) + ' ' +
    p2(tw.getUTCHours()) + ':' + p2(tw.getUTCMinutes()) + ':' + p2(tw.getUTCSeconds())
  );
}

/** 收據聲明（固定句，非發票）。 */
const RECEIPT_DISCLAIMER = '本收據為信用卡訂閱付款憑證，非統一發票。';
/** 開立方（Edward 個人 / 登記負責人；技術計畫 §4）。 */
const RECEIPT_ISSUER = 'BeyondSpec（負責人：Edward Tseng）';

/**
 * 產收據編號：RC + tradeNo（+ 期數，使每期收據不撞號）。
 * @param {string} tradeNo  綠界 MerchantTradeNo
 * @param {string|number} [periodSeq]  期數識別（定期定額每期不同）
 * @returns {string}
 */
function genReceiptNo(tradeNo, periodSeq) {
  const base = 'RC' + String(tradeNo || '').replace(/[^A-Za-z0-9]/g, '');
  return periodSeq ? base + '-' + String(periodSeq) : base;
}

/**
 * 組收據資料物件（最小欄位集合，對齊技術計畫 §4 表）。
 * 純函式：把 webhook 驗章過的資料 + 用戶資料整理成一筆收據 doc。
 *
 * @param {Object} input
 * @param {string} input.uid
 * @param {string} input.tradeNo        綠界 MerchantTradeNo
 * @param {string} input.gwsrPeriod     綠界定期定額授權序號（內部對帳）
 * @param {string} input.plan           'pro' | 'max'
 * @param {string} input.itemName       品項名（如 'BeyondSpec PRO 訂閱'）
 * @param {number} input.amount         金額（NTD 整數）
 * @param {number} input.paidAt         付款時間（毫秒）
 * @param {string} [input.payerEmail]   付款方 email（Firebase auth）
 * @param {string} [input.payerName]    付款方顯示名
 * @param {string} [input.card4No]      信用卡末四碼（只存末四碼）
 * @param {string|number} [input.periodSeq] 期數（如 3 = 第 3 期 / 'YYYY-MM'）
 * @returns {Object} receipt doc
 */
function buildReceipt(input) {
  const i = input || {};
  const receiptNo = genReceiptNo(i.tradeNo, i.periodSeq);
  // 末四碼防呆：萬一上游不小心給了長字串，只留最後 4 碼數字。
  let card4 = '';
  if (i.card4No !== undefined && i.card4No !== null) {
    card4 = String(i.card4No).replace(/\D/g, '').slice(-4);
  }
  return {
    receiptNo: receiptNo,
    issuer: RECEIPT_ISSUER,
    payerEmail: i.payerEmail || '',
    payerName: i.payerName || '',
    plan: i.plan || '',
    itemName: i.itemName || (i.plan ? 'BeyondSpec ' + String(i.plan).toUpperCase() + ' 訂閱' : 'BeyondSpec 訂閱'),
    periodSeq: i.periodSeq !== undefined ? i.periodSeq : '',
    amount: typeof i.amount === 'number' ? i.amount : Number(i.amount) || 0,
    currency: 'TWD',
    paymentMethod: 'credit_card',
    card4No: card4,                       // 只末四碼
    paidAt: typeof i.paidAt === 'number' ? i.paidAt : Date.now(),
    paidAtText: fmtTW(typeof i.paidAt === 'number' ? i.paidAt : Date.now()),
    tradeNo: i.tradeNo || '',
    gwsrPeriod: i.gwsrPeriod || '',       // 內部對帳，不一定對用戶顯示
    disclaimer: RECEIPT_DISCLAIMER,
    kind: 'receipt',                      // 非 invoice
    legalRetention: true,                 // 紅線 3：法定保存、90 天清資料跳過
    createdAt: Date.now(),
  };
}

/**
 * 把收據 doc 渲染成可列印 HTML 收據頁。
 * 自包含（inline style），可直接 new tab 開或列印；不依賴 app.html 樣式。
 * 主色用 #7C5CFC（BeyondSpec 品牌），符合封閉五色。
 *
 * @param {Object} receipt  buildReceipt 的輸出
 * @returns {string} 完整 HTML 字串
 */
function renderReceiptHTML(receipt) {
  const r = receipt || {};
  const amountText = 'NT$ ' + Number(r.amount || 0).toLocaleString('en-US');
  const cardLine = r.card4No ? '信用卡（末四碼 ' + esc(r.card4No) + '）' : '信用卡';
  const periodLine = (r.periodSeq !== '' && r.periodSeq !== undefined && r.periodSeq !== null)
    ? '<tr><td>期數</td><td>' + esc(r.periodSeq) + '</td></tr>' : '';
  const payerLine = r.payerEmail
    ? '<tr><td>付款方</td><td>' + esc(r.payerName ? r.payerName + '（' + r.payerEmail + '）' : r.payerEmail) + '</td></tr>'
    : '';

  return '<!DOCTYPE html>\n' +
'<html lang="zh-Hant">\n' +
'<head>\n' +
'<meta charset="utf-8">\n' +
'<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
'<title>付款收據 ' + esc(r.receiptNo) + '</title>\n' +
'<style>\n' +
'  *{box-sizing:border-box;margin:0;padding:0}\n' +
'  body{font-family:-apple-system,"Segoe UI","PingFang TC","Microsoft JhengHei",sans-serif;background:#F4F4F7;color:#1f2430;padding:24px;line-height:1.6}\n' +
'  .receipt{max-width:560px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(30,36,48,.08);overflow:hidden}\n' +
'  .receipt__head{background:#7C5CFC;color:#fff;padding:28px 32px}\n' +
'  .receipt__head h1{font-size:20px;font-weight:700;letter-spacing:-.3px}\n' +
'  .receipt__head .no{margin-top:6px;font-size:13px;opacity:.85}\n' +
'  .receipt__amount{padding:24px 32px;border-bottom:1px solid #ECECF2}\n' +
'  .receipt__amount .label{font-size:12px;color:#7a8194}\n' +
'  .receipt__amount .val{font-size:32px;font-weight:700;color:#1f2430;margin-top:2px}\n' +
'  table{width:100%;border-collapse:collapse;font-size:14px}\n' +
'  td{padding:11px 32px;vertical-align:top}\n' +
'  tr td:first-child{color:#7a8194;width:108px;white-space:nowrap}\n' +
'  tr:nth-child(even){background:#FAFAFC}\n' +
'  .receipt__foot{padding:18px 32px 26px;font-size:12px;color:#9aa0b0;border-top:1px solid #ECECF2}\n' +
'  .receipt__foot .disc{color:#7a8194;margin-bottom:6px}\n' +
'  @media print{body{background:#fff;padding:0}.receipt{box-shadow:none}}\n' +
'</style>\n' +
'</head>\n' +
'<body>\n' +
'  <div class="receipt">\n' +
'    <div class="receipt__head">\n' +
'      <h1>付款收據</h1>\n' +
'      <div class="no">收據編號　' + esc(r.receiptNo) + '</div>\n' +
'    </div>\n' +
'    <div class="receipt__amount">\n' +
'      <div class="label">付款金額</div>\n' +
'      <div class="val">' + esc(amountText) + '</div>\n' +
'    </div>\n' +
'    <table>\n' +
'      <tr><td>開立方</td><td>' + esc(r.issuer) + '</td></tr>\n' +
       payerLine +
'      <tr><td>品項</td><td>' + esc(r.itemName) + '</td></tr>\n' +
       periodLine +
'      <tr><td>付款方式</td><td>' + cardLine + '</td></tr>\n' +
'      <tr><td>付款時間</td><td>' + esc(r.paidAtText) + '</td></tr>\n' +
'      <tr><td>交易序號</td><td>' + esc(r.tradeNo) + '</td></tr>\n' +
'    </table>\n' +
'    <div class="receipt__foot">\n' +
'      <div class="disc">' + esc(r.disclaimer) + '</div>\n' +
'      <div>感謝您訂閱 BeyondSpec。如有疑問請來信客服。</div>\n' +
'    </div>\n' +
'  </div>\n' +
'</body>\n' +
'</html>';
}

/**
 * 組「付款成功 + 收據」email 內容。實際寄送由呼叫端注入 mailer（hook）。
 * 回傳 { to, subject, text, html }。html 直接用收據頁（可內嵌）。
 *
 * @param {Object} receipt  buildReceipt 輸出
 * @param {Object} [opts]
 * @param {string} [opts.receiptUrl]  站內收據連結（如 https://beyondspec.tw/path/app/#receipt=RCxxx）
 * @returns {{to:string, subject:string, text:string, html:string}}
 */
function buildReceiptEmail(receipt, opts) {
  const r = receipt || {};
  opts = opts || {};
  const amountText = 'NT$ ' + Number(r.amount || 0).toLocaleString('en-US');
  const subject = '【BeyondSpec】付款成功收據 ' + r.receiptNo + '（' + amountText + '）';
  const linkLine = opts.receiptUrl ? ('\n查看收據：' + opts.receiptUrl + '\n') : '\n';
  const text =
    '您好，\n\n' +
    '感謝您訂閱 BeyondSpec，以下為本次付款收據：\n\n' +
    '收據編號：' + r.receiptNo + '\n' +
    '品項：' + r.itemName + '\n' +
    '金額：' + amountText + '\n' +
    '付款時間：' + r.paidAtText + '\n' +
    '交易序號：' + r.tradeNo + '\n' +
    linkLine +
    '\n' + r.disclaimer + '\n\n' +
    'BeyondSpec';
  return {
    to: r.payerEmail || '',
    subject: subject,
    text: text,
    html: renderReceiptHTML(r),
  };
}

/**
 * 「處理一筆付款 → 產收據 + 落 store + 組信」一條龍（給 webhook 直接呼叫）。
 * 寄信不在這裡做（只回 email payload），由 webhook 拿到後決定要不要送（注入 mailer）。
 *
 * @param {Object} store    BillingStore 實作（InMemoryStore / FirestoreStore）
 * @param {Object} input    同 buildReceipt 的 input
 * @param {Object} [opts]   { receiptUrlBase } 用來組 email 連結
 * @returns {Promise<{receipt:Object, email:Object}>}
 */
async function issueReceipt(store, input, opts) {
  opts = opts || {};
  const receipt = buildReceipt(input);
  await store.saveReceipt(input.uid, receipt.receiptNo, receipt);
  const receiptUrl = opts.receiptUrlBase
    ? (String(opts.receiptUrlBase).replace(/\/$/, '') + '#receipt=' + receipt.receiptNo)
    : undefined;
  const email = buildReceiptEmail(receipt, { receiptUrl: receiptUrl });
  return { receipt: receipt, email: email };
}

const _api = {
  esc, fmtTW, genReceiptNo, buildReceipt, renderReceiptHTML, buildReceiptEmail, issueReceipt,
  RECEIPT_DISCLAIMER, RECEIPT_ISSUER,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = _api;
}

export {
  esc, fmtTW, genReceiptNo, buildReceipt, renderReceiptHTML, buildReceiptEmail, issueReceipt,
  RECEIPT_DISCLAIMER, RECEIPT_ISSUER,
};
