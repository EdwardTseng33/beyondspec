/**
 * 收據（非發票）模組 — 單元測試
 * ------------------------------------------------------------------
 * 對應技術計畫 §4：收據欄位 / HTML 收據頁 / email hook / 末四碼 / legalRetention。
 * 跑法：node test/receipt.test.mjs   退出碼：全過=0 / fail=1
 */

import { buildReceipt, renderReceiptHTML, buildReceiptEmail, issueReceipt, genReceiptNo, esc } from '../src/receipt.js';
import { InMemoryStore } from '../src/store.js';

let passed = 0, failed = 0;
const failures = [];
function eq(name, a, b) {
  if (a === b) { passed++; console.log('  ✓ ' + name); }
  else { failed++; failures.push(name); console.log('  ✗ ' + name + '\n     exp: ' + JSON.stringify(b) + '\n     got: ' + JSON.stringify(a)); }
}
function ok(name, c) { eq(name, !!c, true); }

// 固定付款時間：2026-06-25 12:00:00 UTC → 台灣 20:00:00 同日
const PAID_AT = Date.UTC(2026, 5, 25, 12, 0, 0);

function sampleInput(over) {
  return Object.assign({
    uid: 'u_alice',
    tradeNo: 'BS_abc_001',
    gwsrPeriod: 'gw12345',
    plan: 'pro',
    itemName: 'BeyondSpec PRO 訂閱',
    amount: 499,
    paidAt: PAID_AT,
    payerEmail: 'alice@example.com',
    payerName: 'Alice',
    card4No: '2222',
    periodSeq: 3,
  }, over || {});
}

async function run() {
  console.log('\n收據（非發票）模組 · 單元測試\n');

  // ── 1. genReceiptNo ──
  console.log('[1] genReceiptNo — RC + tradeNo(去非英數) + 期數');
  eq('含期數', genReceiptNo('BS_abc_001', 3), 'RCBSabc001-3');
  eq('無期數', genReceiptNo('BS_abc_001'), 'RCBSabc001');

  // ── 2. buildReceipt — 欄位齊 + 末四碼 + legalRetention ──
  console.log('\n[2] buildReceipt — 欄位 / 末四碼 / 法定保存標記');
  const r = buildReceipt(sampleInput());
  eq('receiptNo', r.receiptNo, 'RCBSabc001-3');
  eq('金額', r.amount, 499);
  eq('currency TWD', r.currency, 'TWD');
  eq('paymentMethod credit_card', r.paymentMethod, 'credit_card');
  eq('只存末四碼', r.card4No, '2222');
  eq('kind = receipt（非 invoice）', r.kind, 'receipt');
  eq('legalRetention = true（紅線3）', r.legalRetention, true);
  eq('issuer = Edward 個人', r.issuer, 'BeyondSpec（負責人：Edward Tseng）');
  ok('disclaimer 含「非統一發票」', r.disclaimer.indexOf('非統一發票') >= 0);
  eq('paidAtText = 台灣時間 20:00', r.paidAtText, '2026/06/25 20:00:00');
  eq('gwsrPeriod 帶入（內部對帳）', r.gwsrPeriod, 'gw12345');

  // ── 3. 末四碼防呆：給長字串只留最後 4 碼數字 ──
  console.log('\n[3] 末四碼防呆 — 萬一上游給長字串/全卡號');
  eq('給 16 碼只留末四', buildReceipt(sampleInput({ card4No: '4311952222222222' })).card4No, '2222');
  eq('給空 → 空字串', buildReceipt(sampleInput({ card4No: '' })).card4No, '');

  // ── 4. renderReceiptHTML — 可列印 HTML ──
  console.log('\n[4] renderReceiptHTML — 完整 HTML + 關鍵內容 + escape');
  const html = renderReceiptHTML(r);
  ok('是完整 HTML 文件', /^<!DOCTYPE html>/.test(html) && html.indexOf('</html>') > 0);
  ok('含收據編號', html.indexOf('RCBSabc001-3') >= 0);
  ok('含金額 NT$ 499', html.indexOf('NT$ 499') >= 0);
  ok('含末四碼提示', html.indexOf('2222') >= 0);
  ok('含付款時間', html.indexOf('2026/06/25 20:00:00') >= 0);
  ok('含「非統一發票」聲明', html.indexOf('非統一發票') >= 0);
  ok('品牌主色 #7C5CFC', html.indexOf('#7C5CFC') >= 0);
  // escape 防注入：把惡意 payerName 塞進去不應產生 <script>
  const evilHtml = renderReceiptHTML(buildReceipt(sampleInput({ payerName: '<script>alert(1)</script>', payerEmail: 'x@y.z' })));
  ok('XSS payload 被 escape（無裸 <script>）', evilHtml.indexOf('<script>alert(1)</script>') < 0);
  ok('escape 成 &lt;script&gt;', evilHtml.indexOf('&lt;script&gt;') >= 0);

  // ── 5. buildReceiptEmail — 主旨/內文/收件人 ──
  console.log('\n[5] buildReceiptEmail — 主旨 / 純文字 / HTML / 收件人');
  const mail = buildReceiptEmail(r, { receiptUrl: 'https://beyondspec.tw/path/app/#receipt=RCBSabc001-3' });
  eq('收件人 = 付款方 email', mail.to, 'alice@example.com');
  ok('主旨含收據編號', mail.subject.indexOf('RCBSabc001-3') >= 0);
  ok('主旨含金額', mail.subject.indexOf('NT$ 499') >= 0);
  ok('純文字含品項', mail.text.indexOf('BeyondSpec PRO 訂閱') >= 0);
  ok('純文字含收據連結', mail.text.indexOf('https://beyondspec.tw/path/app/#receipt=RCBSabc001-3') >= 0);
  ok('html 是收據頁', mail.html.indexOf('付款收據') >= 0);

  // ── 6. issueReceipt — 落 store（獨立 collection）+ 回 email ──
  console.log('\n[6] issueReceipt — 寫 store + 回 email payload');
  {
    const store = new InMemoryStore();
    const out = await issueReceipt(store, sampleInput(), { receiptUrlBase: 'https://beyondspec.tw/path/app/' });
    ok('回 receipt + email', !!out.receipt && !!out.email);
    const saved = await store.getReceipt('u_alice', out.receipt.receiptNo);
    ok('收據已落 store', !!saved);
    eq('store 內 legalRetention', saved.legalRetention, true);
    ok('email 連結用 receiptUrlBase 組出', out.email.text.indexOf('#receipt=RCBSabc001-3') >= 0);
    // 確認收據落在「收據 collection」，不是 billing state
    const dump = store._dump();
    eq('收據在 receipts collection', Object.keys(dump.receipts).length, 1);
    eq('沒污染 billing state', Object.keys(dump.billing).length, 0);
  }

  // ── 7. esc 工具 ──
  console.log('\n[7] esc — HTML escape');
  eq('& < > " 全 escape', esc('<a href="x">&'), '&lt;a href=&quot;x&quot;&gt;&amp;');
  eq('null → 空字串', esc(null), '');

  // ── 結算 ──
  console.log('\n' + '='.repeat(52));
  console.log('結果： ' + passed + ' passed, ' + failed + ' failed');
  if (failed > 0) { console.log('FAIL: ' + failures.join(', ')); process.exit(1); }
  else { console.log('ALL GREEN ✓'); process.exit(0); }
}

run().catch((e) => { console.error('測試執行錯誤：', e); process.exit(1); });
