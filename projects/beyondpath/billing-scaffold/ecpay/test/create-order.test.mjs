/**
 * 定期定額建單模組 — 單元測試
 * ------------------------------------------------------------------
 * 對應 sandbox B1（金額 server 權威）/ B2（TradeNo 唯一）+ 紅線 1.4 + open-redirect 防護。
 * 跑法：node test/create-order.test.mjs   退出碼：全過=0 / fail=1
 *
 * 註：用【測試金鑰】（綠界官方範例那組 pwFHCqoQZGmho4w6 / EkRm7iFT261dpevs）
 *     模擬 env secret——這不是真金鑰、是公開文件值，可進測試。
 */

import { fmtEcpayDate, genMerchantTradeNo, buildSubscriptionOrder } from '../src/create-order.js';
import { verifyCheckMacValue } from '../src/checkmac.js';
import { MERCHANT_ID, PLAN_CATALOG } from '../src/config.js';

let passed = 0, failed = 0;
const failures = [];
function eq(name, a, b) {
  if (a === b) { passed++; console.log('  ✓ ' + name); }
  else { failed++; failures.push(name); console.log('  ✗ ' + name + '\n     exp: ' + JSON.stringify(b) + '\n     got: ' + JSON.stringify(a)); }
}
function ok(name, c) { eq(name, !!c, true); }

// 模擬 Worker env（測試金鑰 = 綠界官方公開範例值，非真金鑰）。
const ENV = {
  ECPAY_ENV: 'stage',
  ECPAY_HASH_KEY: 'pwFHCqoQZGmho4w6',
  ECPAY_HASH_IV: 'EkRm7iFT261dpevs',
  WORKER_BASE: 'https://path-ai-proxy.edwardt0303-281.workers.dev/',
  APP_BASE: 'https://beyondspec.tw',
};

async function run() {
  console.log('\n定期定額建單模組 · 單元測試\n');

  // ── 1. 日期格式（UTC+8） ──
  console.log('[1] fmtEcpayDate — yyyy/MM/dd HH:mm:ss（台灣時間）');
  // 2026-06-25 00:30:00 UTC → 台灣 08:30:00 同日
  const d1 = new Date(Date.UTC(2026, 5, 25, 0, 30, 0));
  eq('UTC 00:30 → 台灣 08:30 同日', fmtEcpayDate(d1), '2026/06/25 08:30:00');
  // 2026-06-25 17:00:00 UTC → 台灣 01:00:00 隔日（驗 off-by-one 不會錯日）
  const d2 = new Date(Date.UTC(2026, 5, 25, 17, 0, 0));
  eq('UTC 17:00 → 台灣 隔日 01:00（跨日正確）', fmtEcpayDate(d2), '2026/06/26 01:00:00');
  ok('格式符合 yyyy/MM/dd HH:mm:ss', /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/.test(fmtEcpayDate(new Date())));

  // ── 2. MerchantTradeNo（唯一 + ≤20 英數） ──
  console.log('\n[2] genMerchantTradeNo — 唯一性 + 長度 + 字元集');
  const seen = new Set();
  let dup = false, badChar = false, tooLong = false;
  let t = 0;
  for (let i = 0; i < 2000; i++) {
    const no = genMerchantTradeNo(() => 1700000000000 + i, () => Math.random());
    if (seen.has(no)) dup = true;
    seen.add(no);
    if (!/^[A-Za-z0-9]+$/.test(no)) badChar = true;
    if (no.length > 20) tooLong = true;
    t++;
  }
  ok('2000 筆無重複', !dup);
  ok('全英數（綠界要求）', !badChar);
  ok('長度 ≤ 20', !tooLong);

  // ── 3. 建單成功 + 權威金額（B1 核心） ──
  console.log('\n[3] buildSubscriptionOrder — 金額 server 端權威（B1）');
  const r = await buildSubscriptionOrder({ plan: 'pro', uid: 'firebaseUid_abc123' }, ENV);
  ok('回 ok:true', r.ok === true);
  eq('TotalAmount = PLAN_CATALOG.pro（499）', r.fields.TotalAmount, PLAN_CATALOG.pro.amount);
  eq('PeriodAmount === TotalAmount', r.fields.PeriodAmount, r.fields.TotalAmount);
  // 前端「假裝」送了金額 1 也沒用：buildSubscriptionOrder 根本不讀 input.amount
  const rTamper = await buildSubscriptionOrder({ plan: 'pro', uid: 'u1', amount: 1, TotalAmount: 1 }, ENV);
  eq('前端塞 amount:1 → 仍 499（前端金額被忽略）', rTamper.fields.TotalAmount, 499);

  // ── 4. 定期定額欄位正確 ──
  console.log('\n[4] 定期定額欄位');
  eq('ChoosePayment = Credit', r.fields.ChoosePayment, 'Credit');
  eq('PeriodType = M', r.fields.PeriodType, 'M');
  eq('Frequency = 1', r.fields.Frequency, 1);
  eq('ExecTimes = 12', r.fields.ExecTimes, 12);
  eq('PaymentType = aio', r.fields.PaymentType, 'aio');
  eq('MerchantID = 3502366', r.fields.MerchantID, MERCHANT_ID);
  eq('CustomField1 = uid（webhook 定位）', r.fields.CustomField1, 'firebaseUid_abc123');
  ok('PeriodReturnURL 指向 /ecpay/webhook', /\/ecpay\/webhook$/.test(r.fields.PeriodReturnURL));
  ok('ReturnURL 指向 /ecpay/webhook（server 驗章）', /\/ecpay\/webhook$/.test(r.fields.ReturnURL));
  ok('OrderResultURL 指向前端 #sub-pending（不自解）', /#sub-pending$/.test(r.fields.OrderResultURL));

  // ── 5. 簽章自洽（產出的單能被自己驗章通過） ──
  console.log('\n[5] CheckMacValue 自洽');
  ok('CheckMacValue 存在且 64 字大寫', /^[0-9A-F]{64}$/.test(r.fields.CheckMacValue));
  ok('產出的訂單能被 verifyCheckMacValue 驗過', await verifyCheckMacValue(r.fields, ENV.ECPAY_HASH_KEY, ENV.ECPAY_HASH_IV));
  // 竄改任一欄位後驗章必失敗
  const mutated = Object.assign({}, r.fields, { TotalAmount: 1 });
  ok('改 TotalAmount 後驗章失敗', !(await verifyCheckMacValue(mutated, ENV.ECPAY_HASH_KEY, ENV.ECPAY_HASH_IV)));

  // ── 6. open-redirect 防護：action 來自 config 端點，不由前端決定 ──
  console.log('\n[6] open-redirect 防護 — action 端點');
  eq('stage action = 綠界 stage AioCheckOut/V5', r.action, 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5');
  const rProd = await buildSubscriptionOrder({ plan: 'max', uid: 'u2' }, Object.assign({}, ENV, { ECPAY_ENV: 'prod' }));
  eq('prod action = 綠界 prod AioCheckOut/V5', rProd.action, 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5');
  eq('max 方案金額 = 999', rProd.fields.TotalAmount, 999);

  // ── 7. 防呆 ──
  console.log('\n[7] 防呆');
  eq('未知 plan → 400', (await buildSubscriptionOrder({ plan: 'enterprise_x', uid: 'u' }, ENV)).status, 400);
  eq('缺 uid → 400', (await buildSubscriptionOrder({ plan: 'pro' }, ENV)).status, 400);
  eq('缺金鑰 → 500', (await buildSubscriptionOrder({ plan: 'pro', uid: 'u' }, { ECPAY_ENV: 'stage' })).status, 500);

  // ── 結算 ──
  console.log('\n' + '='.repeat(52));
  console.log('結果： ' + passed + ' passed, ' + failed + ' failed');
  if (failed > 0) { console.log('FAIL: ' + failures.join(', ')); process.exit(1); }
  else { console.log('ALL GREEN ✓'); process.exit(0); }
}

run().catch((e) => { console.error('測試執行錯誤：', e); process.exit(1); });
