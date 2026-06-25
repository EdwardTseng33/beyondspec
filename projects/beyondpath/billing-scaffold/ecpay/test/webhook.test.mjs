/**
 * /ecpay/webhook 處理 — 單元測試
 * ------------------------------------------------------------------
 * 對應 sandbox A1（正常解鎖）/ A2（偽造 webhook 擋下）/ A4（idempotent 不重複解鎖）
 *   + 紅線 1（前端不自解、只認 server 驗章）+ 收據產出 + 失敗通知處理。
 * 跑法：node test/webhook.test.mjs   退出碼：全過=0 / fail=1
 *
 * 測試金鑰 = 綠界官方公開範例值（pwFHCqoQZGmho4w6 / EkRm7iFT261dpevs），非真金鑰。
 * 做法：用 genCheckMacValue 簽一個「合法綠界通知」（讓 verify 過），
 *       再蓄意竄改欄位驗「偽造被擋」。全程不打網路、不碰真錢。
 */

import { handleWebhook, idempotencyKey, resolvePlan, periodToken } from '../src/webhook.js';
import { genCheckMacValue } from '../src/checkmac.js';
import { InMemoryStore } from '../src/store.js';
import { PLAN_CATALOG } from '../src/config.js';

let passed = 0, failed = 0;
const failures = [];
function eq(name, a, b) {
  if (a === b) { passed++; console.log('  ✓ ' + name); }
  else { failed++; failures.push(name); console.log('  ✗ ' + name + '\n     exp: ' + JSON.stringify(b) + '\n     got: ' + JSON.stringify(a)); }
}
function ok(name, c) { eq(name, !!c, true); }

const ENV = {
  ECPAY_HASH_KEY: 'pwFHCqoQZGmho4w6',
  ECPAY_HASH_IV: 'EkRm7iFT261dpevs',
  APP_BASE: 'https://beyondspec.tw',
};

/** 產一個「合法、已簽章」的綠界定期定額成功通知。 */
async function signedNotify(over) {
  const base = {
    MerchantID: '3502366',
    MerchantTradeNo: 'BS_test_trade_01',
    TradeNo: '2406251200123456',
    RtnCode: '1',
    RtnMsg: '付款成功',
    TradeAmt: '499',
    TotalAmount: '499',
    PeriodAmount: '499',
    PeriodType: 'M',
    Frequency: '1',
    ExecTimes: '12',
    Gwsr: '11122233',
    ProcessDate: '2026/06/25 12:00:00',
    PaymentDate: '2026/06/25 12:00:00',
    PaymentType: 'Credit_CreditCard',
    ItemName: 'BeyondSpec PRO 訂閱',
    Card4No: '2222',
    CustomField1: 'firebaseUid_alice',
    CustomField2: '', CustomField3: '', CustomField4: '',
  };
  const p = Object.assign({}, base, over || {});
  p.CheckMacValue = await genCheckMacValue(p, ENV.ECPAY_HASH_KEY, ENV.ECPAY_HASH_IV);
  return p;
}

async function run() {
  console.log('\n/ecpay/webhook 處理 · 單元測試\n');

  // ── 1. idempotent key 組法 ──
  console.log('[1] idempotencyKey — 含期數，避免第 2 期被當重放');
  eq('有 Gwsr → trade_Gwsr', idempotencyKey({ MerchantTradeNo: 'T1', Gwsr: '999' }), 'T1_999');
  eq('無 Gwsr 有 ProcessDate → trade_日期數字', idempotencyKey({ MerchantTradeNo: 'T1', ProcessDate: '2026/06/25 12:00:00' }), 'T1_20260625120000');
  eq('皆無 → 只 trade（首期）', idempotencyKey({ MerchantTradeNo: 'T1' }), 'T1');
  ok('同單不同期 → 不同 key（第2期不會被當重放）',
    idempotencyKey({ MerchantTradeNo: 'T1', Gwsr: '111' }) !== idempotencyKey({ MerchantTradeNo: 'T1', Gwsr: '222' }));

  // ── 2. resolvePlan — 用金額反查方案 ──
  console.log('\n[2] resolvePlan — 金額反查 PLAN_CATALOG');
  eq('499 → pro', resolvePlan({ TotalAmount: '499' }).plan, 'pro');
  eq('999 → max', resolvePlan({ TotalAmount: '999' }).plan, 'max');
  eq('不認得的金額 → plan 空字串', resolvePlan({ TotalAmount: '123' }).plan, '');

  // ── 3. A1 正常授權 → 解鎖（紅線 1：解鎖只在 webhook 發生） ──
  console.log('\n[3] A1 正常授權 → 寫 billing active + 收據');
  {
    const store = new InMemoryStore();
    const alerts = [];
    const mails = [];
    // 綠界通知不帶 email；Worker 驗章後用 lookupEmail(uid) 另查（這裡模擬 Firebase auth 查詢）。
    const p = await signedNotify();
    const res = await handleWebhook({
      body: p, env: ENV, store,
      lookupEmail: async (uid) => (uid === 'firebaseUid_alice' ? 'alice@example.com' : ''),
      mailer: async (m) => { mails.push(m); },
      onAlert: async (e) => { alerts.push(e); },
    });
    eq('回綠界純文字 1|OK', res.body, '1|OK');
    eq('contentType text/plain', res.contentType, 'text/plain');
    eq('_meta.result = unlocked', res._meta.result, 'unlocked');
    const billing = await store.getBilling('firebaseUid_alice');
    ok('billing 已寫入', !!billing);
    eq('billingStatus = active', billing.billingStatus, 'active');
    eq('plan = pro', billing.plan, 'pro');
    eq('amount = 499', billing.amount, 499);
    eq('subscriptionId = Gwsr', billing.subscriptionId, '11122233');
    ok('paidAt 是數字', typeof billing.paidAt === 'number');
    eq('updatedBy = webhook', billing.updatedBy, 'webhook');
    // 收據（receiptNo = RC + tradeNo去非英數 + '-' + Gwsr）
    eq('收據編號 = RC+tradeNo+期數', res._meta.receiptNo, 'RCBStesttrade01-11122233');
    const rec = await store.getReceipt('firebaseUid_alice', res._meta.receiptNo);
    ok('收據已落獨立 collection', !!rec);
    eq('收據 legalRetention=true（紅線3）', rec.legalRetention, true);
    eq('收據 kind=receipt（非發票）', rec.kind, 'receipt');
    eq('收據只存末四碼', rec.card4No, '2222');
    ok('收據聲明含「非統一發票」', rec.disclaimer.indexOf('非統一發票') >= 0);
    // 交易紀錄
    const dump = store._dump();
    ok('交易紀錄已落（legalRetention）', Object.keys(dump.transactions).length === 1);
    // email（Worker 補了 payer email → mailer 應觸發）
    eq('email 已 queue（注入 mailer）', res._meta.emailQueued, true);
    eq('mailer 收到 1 封', mails.length, 1);
    eq('email 收件人 = 付款方', mails[0].to, 'alice@example.com');
    ok('email 主旨含收據編號', mails[0].subject.indexOf('RCBStesttrade01') >= 0);
    ok('email html 是收據頁', mails[0].html.indexOf('付款收據') >= 0);
    ok('無告警', alerts.length === 0);
  }

  // ── 3b. email 只信 lookupEmail，不信綠界 body 夾帶的 email（驗章邊界） ──
  console.log('\n[3b] email 來源 = lookupEmail，不信綠界 body 夾帶欄位');
  {
    const store = new InMemoryStore();
    const mails = [];
    // 攻擊者在通知裡夾 Email 欄位（即使被簽進去）→ webhook 仍只用 lookupEmail 的值
    const p = await signedNotify({ Email: 'attacker@evil.com', PayerEmail: 'attacker@evil.com' });
    await handleWebhook({
      body: p, env: ENV, store,
      lookupEmail: async () => 'trusted@beyondspec.tw',
      mailer: async (m) => { mails.push(m); },
    });
    eq('收件人來自 lookupEmail（非 body）', mails[0].to, 'trusted@beyondspec.tw');
    const rec = await store.getReceipt('firebaseUid_alice', 'RCBStesttrade01-11122233');
    eq('收據 payerEmail 來自 lookupEmail', rec.payerEmail, 'trusted@beyondspec.tw');
  }

  // ── 4. A2 偽造 webhook（改欄位、CheckMacValue 沒跟著改）→ 必擋 ──
  console.log('\n[4] A2 偽造 webhook → 丟棄、billing 不變、發告警（核心）');
  {
    const store = new InMemoryStore();
    const alerts = [];
    const p = await signedNotify();
    // 蓄意把金額改成 1（但不重簽 CheckMacValue）→ 模擬攻擊者竄改
    p.TotalAmount = '1';
    p.PeriodAmount = '1';
    const res = await handleWebhook({ body: p, env: ENV, store, onAlert: async (e) => { alerts.push(e); } });
    eq('_meta.result = verify_failed', res._meta.result, 'verify_failed');
    ok('回非解鎖（0|...）', res.body.indexOf('0|') === 0);
    const billing = await store.getBilling('firebaseUid_alice');
    eq('billing 完全沒寫（沒被解鎖）', billing, null);
    ok('有發 checkmac_failed 告警', alerts.some((a) => a.type === 'checkmac_failed'));
  }

  // ── 5. A2' 完全沒簽章 / 亂簽 → 擋 ──
  console.log('\n[5] 無 CheckMacValue / 亂填 → 擋');
  {
    const store = new InMemoryStore();
    const res1 = await handleWebhook({ body: { MerchantTradeNo: 'X', RtnCode: '1', CustomField1: 'u', TotalAmount: '499' }, env: ENV, store });
    eq('無簽章 → verify_failed', res1._meta.result, 'verify_failed');
    const res2 = await handleWebhook({ body: { MerchantTradeNo: 'X', RtnCode: '1', CustomField1: 'u', TotalAmount: '499', CheckMacValue: 'DEADBEEF' }, env: ENV, store });
    eq('亂簽 → verify_failed', res2._meta.result, 'verify_failed');
    eq('billing 仍空', await store.getBilling('u'), null);
  }

  // ── 6. A4 idempotent — 同一期通知重送，只解鎖一次、只開一張收據 ──
  console.log('\n[6] A4 idempotent — 同期重送不重複解鎖/收據');
  {
    const store = new InMemoryStore();
    const p = await signedNotify();
    const r1 = await handleWebhook({ body: p, env: ENV, store });
    const r2 = await handleWebhook({ body: p, env: ENV, store });  // 完全相同的合法通知再送一次
    eq('第 1 次 = unlocked', r1._meta.result, 'unlocked');
    eq('第 2 次 = duplicate（不重做）', r2._meta.result, 'duplicate');
    eq('兩次都回 1|OK（綠界不再重送）', r2.body, '1|OK');
    const dump = store._dump();
    eq('只 1 張收據', Object.keys(dump.receipts).length, 1);
    eq('只 1 筆交易', Object.keys(dump.transactions).length, 1);
    eq('processedWebhooks 只 1 筆', Object.keys(dump.processed).length, 1);
  }

  // ── 7. 第 2 期（不同 Gwsr）→ 應視為新一期、再次解鎖 + 新收據 ──
  console.log('\n[7] 第 2 期（不同 Gwsr）→ 新解鎖 + 新收據（不被當重放）');
  {
    const store = new InMemoryStore();
    const p1 = await signedNotify({ Gwsr: '111', ProcessDate: '2026/06/25 12:00:00' });
    const p2 = await signedNotify({ Gwsr: '222', ProcessDate: '2026/07/25 12:00:00' });
    const r1 = await handleWebhook({ body: p1, env: ENV, store });
    const r2 = await handleWebhook({ body: p2, env: ENV, store });
    eq('第 1 期 unlocked', r1._meta.result, 'unlocked');
    eq('第 2 期 unlocked（非 duplicate）', r2._meta.result, 'unlocked');
    const dump = store._dump();
    eq('2 張收據（每期一張）', Object.keys(dump.receipts).length, 2);
    eq('processedWebhooks 2 筆', Object.keys(dump.processed).length, 2);
  }

  // ── 8. 首次刷卡失敗（無既有訂閱、RtnCode != 1）→ 不解鎖、標 firstChargeFailed、回 1|OK ──
  console.log('\n[8] 首次刷卡失敗 → 絕不解鎖、標 firstChargeFailed');
  {
    const store = new InMemoryStore();
    const alerts = [];
    const p = await signedNotify({ RtnCode: '10100058', RtnMsg: '額度不足' });
    const res = await handleWebhook({ body: p, env: ENV, store, onAlert: async (e) => { alerts.push(e); } });
    eq('_meta.result = first_charge_failed', res._meta.result, 'first_charge_failed');
    eq('isRecurring = false（無既有訂閱）', res._meta.isRecurring, false);
    eq('回 1|OK（已收到通知）', res.body, '1|OK');
    const billing = await store.getBilling('firebaseUid_alice');
    ok('billing 標 firstChargeFailed', billing && billing.firstChargeFailed === true);
    ok('billing 標 paymentIssue', billing && billing.paymentIssue === true);
    ok('billing 絕不是 active（沒誤解鎖）', !billing || billing.billingStatus !== 'active');
    ok('發 first_charge_failed 告警', alerts.some((a) => a.type === 'first_charge_failed'));
  }

  // ── 9. 缺金鑰 / 缺 store → 安全回應（不 crash、不解鎖） ──
  console.log('\n[9] 設定缺失 → 安全降級');
  {
    const store = new InMemoryStore();
    const p = await signedNotify();
    const resNoKey = await handleWebhook({ body: p, env: { APP_BASE: 'x' }, store });
    eq('缺金鑰 → config_error', resNoKey._meta.result, 'config_error');
    const resNoStore = await handleWebhook({ body: p, env: ENV });
    eq('缺 store → config_error', resNoStore._meta.result, 'config_error');
  }

  // ── 10. unknownPlan（金額對不上）→ 仍解鎖但標記 + 告警 ──
  console.log('\n[10] 金額對不上方案 → 仍解鎖（避免漏單）+ 標 unknownPlan + 告警');
  {
    const store = new InMemoryStore();
    const alerts = [];
    const p = await signedNotify({ TotalAmount: '777', PeriodAmount: '777', ItemName: '某方案' });
    const res = await handleWebhook({ body: p, env: ENV, store, onAlert: async (e) => { alerts.push(e); } });
    eq('仍 unlocked', res._meta.result, 'unlocked');
    ok('_meta.unknownPlan = true', res._meta.unknownPlan === true);
    const billing = await store.getBilling('firebaseUid_alice');
    eq('plan 標 unknown', billing.plan, 'unknown');
    ok('發 unknown_plan 告警', alerts.some((a) => a.type === 'unknown_plan'));
  }

  // ── 11. 每期扣款失敗（已有 active 訂閱）→ 走 dunning（past_due），非首扣失敗 ──
  console.log('\n[11] 續扣失敗（已 active）→ webhook 路由進 dunning past_due');
  {
    const store = new InMemoryStore();
    // 先解鎖一期（建立 active 訂閱）
    await handleWebhook({ body: await signedNotify({ Gwsr: '111', ProcessDate: '2026/06/25 12:00:00' }), env: ENV, store });
    ok('前置：已 active', (await store.getBilling('firebaseUid_alice')).billingStatus === 'active');
    // 第 2 期扣款失敗
    const mails = [], alerts = [];
    const pFail = await signedNotify({ RtnCode: '10100058', RtnMsg: '額度不足', Gwsr: '222', ProcessDate: '2026/07/25 12:00:00' });
    const res = await handleWebhook({
      body: pFail, env: ENV, store,
      lookupEmail: async () => 'alice@example.com',
      mailer: async (m) => mails.push(m),
      onAlert: async (e) => alerts.push(e),
    });
    eq('_meta.result = recurring_failed', res._meta.result, 'recurring_failed');
    eq('isRecurring = true', res._meta.isRecurring, true);
    eq('dunningTransition = entered_grace', res._meta.dunningTransition, 'entered_grace');
    eq('回 1|OK', res.body, '1|OK');
    const b = await store.getBilling('firebaseUid_alice');
    eq('billingStatus = past_due（不立刻斷）', b.billingStatus, 'past_due');
    ok('failCount = 1', b.dunning && b.dunning.failCount === 1);
    ok('寄了 past_due 信', mails.some((m) => m.kind === 'dunning_past_due'));
    ok('發 dunning_past_due 告警', alerts.some((a) => a.type === 'dunning_past_due'));
  }

  // ── 12. 補扣成功 → webhook 把 past_due 救回 active（清 dunning） ──
  console.log('\n[12] 補扣成功 → past_due 救回 active（recovered）');
  {
    const store = new InMemoryStore();
    await handleWebhook({ body: await signedNotify({ Gwsr: '111', ProcessDate: '2026/06/25 12:00:00' }), env: ENV, store });
    // 失敗一次 → past_due
    await handleWebhook({ body: await signedNotify({ RtnCode: '10100058', Gwsr: '222', ProcessDate: '2026/07/25 12:00:00' }), env: ENV, store, onAlert: async () => {} });
    ok('前置：past_due', (await store.getBilling('firebaseUid_alice')).billingStatus === 'past_due');
    // 補扣成功（新期成功）
    const res = await handleWebhook({ body: await signedNotify({ Gwsr: '333', ProcessDate: '2026/08/25 12:00:00', TotalSuccessTimes: '2' }), env: ENV, store });
    eq('_meta.result = unlocked', res._meta.result, 'unlocked');
    ok('_meta.recovered = true', res._meta.recovered === true);
    const b = await store.getBilling('firebaseUid_alice');
    eq('billingStatus 回 active', b.billingStatus, 'active');
    ok('paymentIssue 清掉', b.paymentIssue === false);
    ok('dunning failCount 歸零', b.dunning && b.dunning.failCount === 0);
    ok('plan 回 pro', b.plan === 'pro');
  }

  // ── 13. 首扣失敗後又成功（重試刷卡）→ 正常解鎖（firstChargeFailed 清掉） ──
  console.log('\n[13] 首扣失敗→重試成功 → 正常解鎖、firstChargeFailed 清');
  {
    const store = new InMemoryStore();
    // 首扣失敗（無既有訂閱）
    await handleWebhook({ body: await signedNotify({ RtnCode: '10100058' }), env: ENV, store, onAlert: async () => {} });
    const b0 = await store.getBilling('firebaseUid_alice');
    ok('首扣失敗：firstChargeFailed=true 且非 active', b0.firstChargeFailed === true && b0.billingStatus !== 'active');
    // 重試刷卡成功
    const res = await handleWebhook({ body: await signedNotify({ Gwsr: '111' }), env: ENV, store });
    eq('重試 → unlocked', res._meta.result, 'unlocked');
    const b1 = await store.getBilling('firebaseUid_alice');
    eq('billingStatus = active', b1.billingStatus, 'active');
    ok('firstChargeFailed 清掉', b1.firstChargeFailed === false);
  }

  // ── 結算 ──
  console.log('\n' + '='.repeat(52));
  console.log('結果： ' + passed + ' passed, ' + failed + ' failed');
  if (failed > 0) { console.log('FAIL: ' + failures.join(', ')); process.exit(1); }
  else { console.log('ALL GREEN ✓'); process.exit(0); }
}

run().catch((e) => { console.error('測試執行錯誤：', e); process.exit(1); });
