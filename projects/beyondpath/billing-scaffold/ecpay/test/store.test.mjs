/**
 * 資料層（InMemoryStore） — 單元測試
 * ------------------------------------------------------------------
 * 驗 store 介面語意：merge 寫入 / idempotent 原子性 / 收據與交易獨立 collection /
 *   clone 隔離（外部改不到內部狀態）。這支顧好，webhook/cancel 的 idempotent 才可信。
 * 跑法：node test/store.test.mjs   退出碼：全過=0 / fail=1
 */

import { InMemoryStore, BillingStore } from '../src/store.js';

let passed = 0, failed = 0;
const failures = [];
function eq(name, a, b) {
  if (a === b) { passed++; console.log('  ✓ ' + name); }
  else { failed++; failures.push(name); console.log('  ✗ ' + name + '\n     exp: ' + JSON.stringify(b) + '\n     got: ' + JSON.stringify(a)); }
}
function ok(name, c) { eq(name, !!c, true); }

async function run() {
  console.log('\n資料層 InMemoryStore · 單元測試\n');

  // ── 1. billing merge 寫入 ──
  console.log('[1] setBilling — merge（保留舊欄位）');
  {
    const s = new InMemoryStore();
    await s.setBilling('u', { plan: 'pro', billingStatus: 'active', amount: 499 });
    await s.setBilling('u', { billingStatus: 'cancelled', cancelledAt: 123 });
    const b = await s.getBilling('u');
    eq('plan 保留', b.plan, 'pro');           // merge：沒被第二次覆蓋掉
    eq('amount 保留', b.amount, 499);
    eq('billingStatus 更新', b.billingStatus, 'cancelled');
    eq('cancelledAt 新增', b.cancelledAt, 123);
    eq('不存在 uid → null', await s.getBilling('nope'), null);
  }

  // ── 2. idempotent 原子性（created 標記） ──
  console.log('\n[2] markProcessedWebhook — created 標記（idempotent 判定核心）');
  {
    const s = new InMemoryStore();
    const first = await s.markProcessedWebhook('K1', { at: 1 });
    const second = await s.markProcessedWebhook('K1', { at: 2 });
    eq('第 1 次 created:true', first.created, true);
    eq('第 2 次 created:false（已存在）', second.created, false);
    ok('回傳既有紀錄', second.existing && second.existing.at === 1);
    ok('getProcessedWebhook 拿得到', (await s.getProcessedWebhook('K1')).at === 1);
    eq('未處理的 key → null', await s.getProcessedWebhook('K2'), null);
  }

  // ── 3. 收據 / 交易：獨立 collection + 自動 legalRetention ──
  console.log('\n[3] saveReceipt / saveTransaction — 獨立 collection + legalRetention');
  {
    const s = new InMemoryStore();
    await s.saveReceipt('u', 'RC1', { amount: 499 });
    await s.saveTransaction('u', 'T1', { amount: 499 });
    const rec = await s.getReceipt('u', 'RC1');
    eq('收據自動標 legalRetention', rec.legalRetention, true);
    const dump = s._dump();
    eq('receipts 1 筆', Object.keys(dump.receipts).length, 1);
    eq('transactions 1 筆', Object.keys(dump.transactions).length, 1);
    eq('billing 0 筆（不互相污染）', Object.keys(dump.billing).length, 0);
  }

  // ── 4. clone 隔離：外部改回傳值不影響內部 ──
  console.log('\n[4] clone 隔離 — 外部改回傳物件不污染 store');
  {
    const s = new InMemoryStore();
    await s.setBilling('u', { plan: 'pro', nested: { x: 1 } });
    const b1 = await s.getBilling('u');
    b1.plan = 'HACKED';
    b1.nested.x = 999;
    const b2 = await s.getBilling('u');
    eq('plan 未被外部竄改', b2.plan, 'pro');
    eq('nested 深層也隔離', b2.nested.x, 1);
  }

  // ── 5. 抽象基底丟 not implemented ──
  console.log('\n[5] BillingStore 基底 — 未實作即丟錯');
  {
    const base = new BillingStore();
    let threw = false;
    try { await base.getBilling('u'); } catch (e) { threw = true; }
    ok('base.getBilling 丟 not implemented', threw);
  }

  // ── 結算 ──
  console.log('\n' + '='.repeat(52));
  console.log('結果： ' + passed + ' passed, ' + failed + ' failed');
  if (failed > 0) { console.log('FAIL: ' + failures.join(', ')); process.exit(1); }
  else { console.log('ALL GREEN ✓'); process.exit(0); }
}

run().catch((e) => { console.error('測試執行錯誤：', e); process.exit(1); });
