/**
 * 訂閱後端權威化 — 單元測試
 * ------------------------------------------------------------------
 * 對應技術計畫 §5 + 沙利曼 A3：Firestore 為真相、localStorage 唯讀快取、
 *   付費動作 Worker 端權威 gate（前端改 localStorage 無效）。
 * 跑法：node test/authority.test.mjs   退出碼：全過=0 / fail=1
 */

import {
  isSubscriptionActive, resolveEntitlement, assertEntitled, cacheFromBilling, isCacheUsableForUI,
} from '../src/authority.js';
import { InMemoryStore } from '../src/store.js';

let passed = 0, failed = 0;
const failures = [];
function eq(name, a, b) {
  if (a === b) { passed++; console.log('  ✓ ' + name); }
  else { failed++; failures.push(name); console.log('  ✗ ' + name + '\n     exp: ' + JSON.stringify(b) + '\n     got: ' + JSON.stringify(a)); }
}
function ok(name, c) { eq(name, !!c, true); }

const NOW = Date.UTC(2026, 5, 25, 0, 0, 0);
const DAY = 24 * 60 * 60 * 1000;

async function run() {
  console.log('\n訂閱後端權威化 · 單元測試\n');

  // ── 1. isSubscriptionActive ──
  console.log('[1] isSubscriptionActive — active / cancelled 當期 / 過期');
  eq('active → true', isSubscriptionActive({ billingStatus: 'active' }, NOW), true);
  eq('無 billing → false', isSubscriptionActive(null, NOW), false);
  eq('cancelled 但仍在當期 → true（C3）', isSubscriptionActive({ billingStatus: 'cancelled', nextBillingAt: NOW + DAY }, NOW), true);
  eq('cancelled 且已過期 → false', isSubscriptionActive({ billingStatus: 'cancelled', nextBillingAt: NOW - DAY }, NOW), false);
  eq('cancelled 無 nextBillingAt → false（保守）', isSubscriptionActive({ billingStatus: 'cancelled' }, NOW), false);
  eq('未知狀態 → false', isSubscriptionActive({ billingStatus: 'weird' }, NOW), false);

  // ── 2. resolveEntitlement — 無效一律降 free ──
  console.log('\n[2] resolveEntitlement — plan + features');
  eq('active pro → plan pro', resolveEntitlement({ billingStatus: 'active', plan: 'pro' }, NOW).plan, 'pro');
  ok('pro → ai_call 開', resolveEntitlement({ billingStatus: 'active', plan: 'pro' }, NOW).features.ai_call === true);
  eq('過期 cancelled → 降 free', resolveEntitlement({ billingStatus: 'cancelled', plan: 'pro', nextBillingAt: NOW - DAY }, NOW).plan, 'free');
  ok('free → ai_call 關', resolveEntitlement({ billingStatus: 'cancelled', plan: 'pro', nextBillingAt: NOW - DAY }, NOW).features.ai_call === false);
  // 即使 billing.plan 寫 pro，但狀態無效 → 不給 pro（防偽造 billing doc）
  eq('狀態無效即使 plan=max 也降 free', resolveEntitlement({ billingStatus: 'none', plan: 'max' }, NOW).plan, 'free');

  // ── 3. assertEntitled — Worker 端權威 gate（核心：不信前端） ──
  console.log('\n[3] assertEntitled — 付費動作 Worker 權威判定');
  {
    const store = new InMemoryStore();
    await store.setBilling('u_pro', { billingStatus: 'active', plan: 'pro' });
    await store.setBilling('u_free', { billingStatus: 'none', plan: 'free' });

    const aPro = await assertEntitled(store, 'u_pro', 'ai_call', NOW);
    ok('pro 用戶 ai_call → allowed', aPro.allowed === true);
    eq('回報 plan = pro', aPro.plan, 'pro');

    const aFree = await assertEntitled(store, 'u_free', 'ai_call', NOW);
    ok('free 用戶 ai_call → 擋', aFree.allowed === false);
    ok('附 reason', !!aFree.reason);

    // 核心：就算前端「聲稱」自己是 pro，Worker 只查 store → 仍以 store 為準
    const aGhost = await assertEntitled(store, 'u_ghost_claims_pro', 'ai_call', NOW);
    ok('store 無此人 → 擋（前端聲稱無效）', aGhost.allowed === false);
    eq('降 free', aGhost.plan, 'free');

    // 防呆
    eq('缺 store → 擋', (await assertEntitled(null, 'u', 'ai_call')).allowed, false);
    eq('缺 uid → 擋', (await assertEntitled(store, '', 'ai_call')).allowed, false);
  }

  // ── 4. assertEntitled 讀取錯誤 → 安全擋（fail closed） ──
  console.log('\n[4] store 讀取爆炸 → fail closed（擋，不放行）');
  {
    const brokenStore = { getBilling: async () => { throw new Error('firestore down'); } };
    const a = await assertEntitled(brokenStore, 'u', 'ai_call', NOW);
    ok('讀取錯誤 → 擋（不放行）', a.allowed === false);
  }

  // ── 5. cacheFromBilling — 前端快取 shape ──
  console.log('\n[5] cacheFromBilling — localStorage 快取 shape（含 _note 警示）');
  {
    const cache = cacheFromBilling({ billingStatus: 'active', plan: 'pro', nextBillingAt: NOW + 30 * DAY }, NOW);
    eq('plan pro', cache.plan, 'pro');
    eq('active true', cache.active, true);
    ok('cachedAt 記錄', cache.cachedAt === NOW);
    ok('_note 標明非權威', cache._note.indexOf('authoritative') >= 0);
  }

  // ── 6. isCacheUsableForUI — 僅 UX，太舊不信 ──
  console.log('\n[6] isCacheUsableForUI — UI gating（非安全）+ 過期重抓');
  {
    const fresh = cacheFromBilling({ billingStatus: 'active', plan: 'pro', nextBillingAt: NOW + 30 * DAY }, NOW);
    ok('新鮮 pro 快取 → UI 可顯示', isCacheUsableForUI(fresh, DAY, NOW) === true);
    ok('快取 25 小時前（超過 24h）→ 不信、要重抓', isCacheUsableForUI(fresh, DAY, NOW + 25 * 60 * 60 * 1000) === false);
    ok('free 快取 → UI 不顯示 pro', isCacheUsableForUI(cacheFromBilling({ billingStatus: 'none', plan: 'free' }, NOW), DAY, NOW) === false);
    ok('null 快取 → false', isCacheUsableForUI(null, DAY, NOW) === false);
  }

  // ── 結算 ──
  console.log('\n' + '='.repeat(52));
  console.log('結果： ' + passed + ' passed, ' + failed + ' failed');
  if (failed > 0) { console.log('FAIL: ' + failures.join(', ')); process.exit(1); }
  else { console.log('ALL GREEN ✓'); process.exit(0); }
}

run().catch((e) => { console.error('測試執行錯誤：', e); process.exit(1); });
