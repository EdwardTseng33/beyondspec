/**
 * 退款 / chargeback → 重新鎖 — 單元測試（逆向漏財防線）
 * ------------------------------------------------------------------
 * 對應 trust spec §232 退費三件綁定（本模組負責第③件降級）+ Edward 親點逆向情境 3。
 * 跑法：node test/refund.test.mjs   退出碼：全過=0 / fail=1
 *
 * 證明的事：
 *   1. 退款 → 任何狀態都 re-lock 成 locked（降 free / 唯讀殼）。
 *   2. chargeback → re-lock + 高等級告警（chargeback_relocked）。
 *   3. idempotent — 同一退款事件重觸發只鎖一次、refunds[] 不重複。
 *   4. webhook 退款通知（handleRefundNotify）→ 驗章 + re-lock；偽造被擋。
 *   5. 與 authority 整合：re-lock 後 entitlement 降 free、走唯讀殼（同試用到期殼）。
 *   6. 退費三件綁定提醒（bindingTodo）—— 不可只做降級。
 *   測試金鑰 = 綠界官方公開範例值，非真金鑰。不打網路、不碰真錢。
 */

import {
  REFUND_KINDS, applyRefundLock, refundEventId, handleManualRefund, handleRefundNotify,
} from '../src/refund.js';
import { genCheckMacValue } from '../src/checkmac.js';
import { InMemoryStore } from '../src/store.js';
import { isSubscriptionActive, resolveReadOnlyState, resolveEntitlement } from '../src/authority.js';

let passed = 0, failed = 0;
const failures = [];
function eq(name, a, b) {
  if (a === b) { passed++; console.log('  ✓ ' + name); }
  else { failed++; failures.push(name); console.log('  ✗ ' + name + '\n     exp: ' + JSON.stringify(b) + '\n     got: ' + JSON.stringify(a)); }
}
function ok(name, c) { eq(name, !!c, true); }

const T0 = Date.UTC(2026, 5, 25, 0, 0, 0);
const ENV = {
  ECPAY_HASH_KEY: 'pwFHCqoQZGmho4w6',
  ECPAY_HASH_IV: 'EkRm7iFT261dpevs',
};

function activeBilling(over) {
  return Object.assign({ plan: 'pro', billingStatus: 'active', merchantTradeNo: 'BS_sub_1', amount: 499 }, over || {});
}

/** 簽一個合法的綠界退款通知。 */
async function signedRefundNotify(over) {
  const base = {
    MerchantID: '3502366',
    MerchantTradeNo: 'BS_sub_1',
    TradeNo: '2406251200999',
    RtnCode: '1',
    RtnMsg: 'refund ok',
    RefundAmount: '499',
    RefundId: 'RF_001',
    CustomField1: 'u_alice',
  };
  const p = Object.assign({}, base, over || {});
  p.CheckMacValue = await genCheckMacValue(p, ENV.ECPAY_HASH_KEY, ENV.ECPAY_HASH_IV);
  return p;
}

async function run() {
  console.log('\n退款 / chargeback 重新鎖 · 單元測試\n');

  // ── 0. refundEventId ──
  console.log('[0] refundEventId — 優先 refundId，缺則 trade_refund_amount');
  eq('有 refundId', refundEventId({ refundId: 'RF9' }), 'RF9');
  eq('缺 refundId → trade_refund_amount', refundEventId({ merchantTradeNo: 'T1', amount: 499 }), 'T1_refund_499');

  // ── 1. applyRefundLock — active → locked ──
  console.log('\n[1] applyRefundLock — active 退款 → re-lock locked');
  {
    const out = applyRefundLock(activeBilling(), { refundId: 'RF1', kind: 'manual_refund', amount: 499, now: T0 });
    eq('transition = relocked', out.transition, 'relocked');
    eq('billingStatus → locked', out.patch.billingStatus, 'locked');
    eq('lockedReason = refund_manual_refund', out.patch.lockedReason, 'refund_manual_refund');
    ok('paymentIssue = true', out.patch.paymentIssue === true);
    ok('refunds[] 記 1 筆', out.patch.refunds.length === 1 && out.patch.refunds[0].refundId === 'RF1');
    ok('plan 不清空（保留供對帳）', activeBilling().plan === 'pro');
  }

  // ── 2. 任何狀態都能被退款鎖（past_due / cancelled） ──
  console.log('\n[2] past_due / cancelled 也能被退款 re-lock');
  {
    const o1 = applyRefundLock({ plan: 'pro', billingStatus: 'past_due', dunning: { failCount: 1 } }, { refundId: 'RF2', amount: 499, now: T0 });
    eq('past_due → locked', o1.patch.billingStatus, 'locked');
    const o2 = applyRefundLock({ plan: 'pro', billingStatus: 'cancelled', nextBillingAt: T0 + 30 * 86400000 }, { refundId: 'RF3', amount: 499, now: T0 });
    eq('cancelled → locked', o2.patch.billingStatus, 'locked');
  }

  // ── 3. idempotent — 同 refundId 重觸發只鎖一次 ──
  console.log('\n[3] idempotent — 同 refundId 不重複記/不重複鎖');
  {
    const b1 = activeBilling();
    const o1 = applyRefundLock(b1, { refundId: 'RF_DUP', amount: 499, now: T0 });
    const b2 = Object.assign({}, b1, o1.patch);
    const o2 = applyRefundLock(b2, { refundId: 'RF_DUP', amount: 499, now: T0 + 1000 });   // 同 refundId 重來
    eq('第 2 次 → idempotent', o2.transition, 'idempotent');
    ok('idempotent = true', o2.idempotent === true);
    ok('patch 空', Object.keys(o2.patch).length === 0);
    eq('refunds 仍只 1 筆', b2.refunds.length, 1);
  }

  // ── 4. handleManualRefund — 結合 store + 告警 + bindingTodo ──
  console.log('\n[4] handleManualRefund — 寫 store + refund_relocked 告警 + 退費三件綁定提醒');
  {
    const store = new InMemoryStore();
    await store.setBilling('u_a', activeBilling());
    const alerts = [], mails = [];
    const res = await handleManualRefund({
      store, uid: 'u_a',
      event: { refundId: 'RF10', kind: 'manual_refund', amount: 499, reason: '客訴退費' },
      mailer: async (m) => mails.push(m),
      lookupEmail: async () => 'u_a@example.com',
      onAlert: async (e) => alerts.push(e),
      opts: { now: T0 },
    });
    ok('ok:true', res.ok === true);
    eq('transition = relocked', res.transition, 'relocked');
    const b = await store.getBilling('u_a');
    eq('store billingStatus = locked', b.billingStatus, 'locked');
    ok('發 refund_relocked 告警', alerts.some((a) => a.type === 'refund_relocked'));
    ok('寄了退款通知信', mails.length === 1 && mails[0].kind === 'refund_locked');
    ok('回傳含 bindingTodo（①停扣 ②開折讓）', Array.isArray(res.bindingTodo) && res.bindingTodo.length === 2);
    ok('bindingTodo 提到停扣', res.bindingTodo.join(' ').indexOf('停扣') >= 0);
    ok('bindingTodo 提到折讓/作廢', res.bindingTodo.join(' ').indexOf('折讓') >= 0);
  }

  // ── 5. chargeback → 高等級告警 ──
  console.log('\n[5] chargeback → chargeback_relocked 告警（風險最高）');
  {
    const store = new InMemoryStore();
    await store.setBilling('u_b', activeBilling());
    const alerts = [];
    const res = await handleManualRefund({
      store, uid: 'u_b',
      event: { refundId: 'CB_1', kind: 'chargeback', amount: 499, reason: '發卡行爭議' },
      onAlert: async (e) => alerts.push(e),
      opts: { now: T0 },
    });
    eq('locked', (await store.getBilling('u_b')).billingStatus, 'locked');
    eq('lockedReason = refund_chargeback', (await store.getBilling('u_b')).lockedReason, 'refund_chargeback');
    ok('發 chargeback_relocked 告警（非一般 refund）', alerts.some((a) => a.type === 'chargeback_relocked'));
  }

  // ── 6. handleManualRefund idempotent（store 落盤後） ──
  console.log('\n[6] handleManualRefund idempotent — 同 refundId 重送不重複改 store');
  {
    const store = new InMemoryStore();
    await store.setBilling('u_c', activeBilling());
    const r1 = await handleManualRefund({ store, uid: 'u_c', event: { refundId: 'X1', amount: 499 }, opts: { now: T0 } });
    const r2 = await handleManualRefund({ store, uid: 'u_c', event: { refundId: 'X1', amount: 499 }, opts: { now: T0 + 1000 } });
    eq('第 1 次 relocked', r1.transition, 'relocked');
    eq('第 2 次 idempotent', r2.transition, 'idempotent');
    const b = await store.getBilling('u_c');
    eq('refunds 仍只 1 筆', b.refunds.length, 1);
  }

  // ── 7. handleRefundNotify — webhook 退款通知：驗章 + re-lock ──
  console.log('\n[7] handleRefundNotify — 合法退款通知 → 驗章過 + re-lock');
  {
    const store = new InMemoryStore();
    await store.setBilling('u_alice', activeBilling());
    const alerts = [];
    const p = await signedRefundNotify();
    const res = await handleRefundNotify({ body: p, env: ENV, store, onAlert: async (e) => alerts.push(e), opts: { now: T0 } });
    eq('回 1|OK', res.body, '1|OK');
    eq('_meta.result = relocked', res._meta.result, 'relocked');
    const b = await store.getBilling('u_alice');
    eq('store locked', b.billingStatus, 'locked');
    eq('refundId 記入', b.lastRefundId, 'RF_001');
  }

  // ── 8. handleRefundNotify — 偽造退款通知（改金額沒重簽）→ 擋 ──
  console.log('\n[8] handleRefundNotify — 偽造（改 RefundAmount 沒重簽）→ verify_failed、不鎖');
  {
    const store = new InMemoryStore();
    await store.setBilling('u_alice', activeBilling());
    const alerts = [];
    const p = await signedRefundNotify();
    p.RefundAmount = '1';   // 竄改但不重簽
    const res = await handleRefundNotify({ body: p, env: ENV, store, onAlert: async (e) => alerts.push(e), opts: { now: T0 } });
    eq('_meta.result = verify_failed', res._meta.result, 'verify_failed');
    ok('回非鎖（0|...）', res.body.indexOf('0|') === 0);
    eq('billing 仍 active（沒被偽造通知鎖）', (await store.getBilling('u_alice')).billingStatus, 'active');
    ok('發 refund_checkmac_failed 告警', alerts.some((a) => a.type === 'refund_checkmac_failed'));
  }

  // ── 9. handleRefundNotify — 非退款通知（RefundAmount=0）→ not_refund ──
  console.log('\n[9] handleRefundNotify — 非退款通知 → not_refund，不動 billing');
  {
    const store = new InMemoryStore();
    await store.setBilling('u_alice', activeBilling());
    const p = await signedRefundNotify({ RefundAmount: '0' });
    const res = await handleRefundNotify({ body: p, env: ENV, store, opts: { now: T0 } });
    eq('_meta.result = not_refund', res._meta.result, 'not_refund');
    eq('billing 不動', (await store.getBilling('u_alice')).billingStatus, 'active');
  }

  // ── 10. handleRefundNotify idempotent（同通知重送） ──
  console.log('\n[10] handleRefundNotify idempotent — 同退款通知重送只鎖一次');
  {
    const store = new InMemoryStore();
    await store.setBilling('u_alice', activeBilling());
    const p = await signedRefundNotify();
    const r1 = await handleRefundNotify({ body: p, env: ENV, store, opts: { now: T0 } });
    const r2 = await handleRefundNotify({ body: p, env: ENV, store, opts: { now: T0 + 1000 } });
    eq('第 1 次 relocked', r1._meta.result, 'relocked');
    eq('第 2 次 duplicate', r2._meta.result, 'duplicate');
    eq('refunds 仍 1 筆', (await store.getBilling('u_alice')).refunds.length, 1);
  }

  // ── 11. 整合 authority：re-lock 後降 free + 唯讀殼 ──
  console.log('\n[11] 整合 authority — re-lock 後 entitlement 降 free + 唯讀殼');
  {
    const store = new InMemoryStore();
    await store.setBilling('u_d', activeBilling());
    await handleManualRefund({ store, uid: 'u_d', event: { refundId: 'RZ', amount: 499 }, opts: { now: T0 } });
    const b = await store.getBilling('u_d');
    ok('isSubscriptionActive → false', isSubscriptionActive(b, T0) === false);
    eq('resolveEntitlement → free', resolveEntitlement(b, T0).plan, 'free');
    const ro = resolveReadOnlyState(b, T0);
    ok('唯讀殼 reason = locked（與試用到期同殼）', ro.readOnly === true && ro.reason === 'locked');
  }

  // ── 12. 防呆 ──
  console.log('\n[12] 防呆 — 缺 store / uid / 配置');
  {
    eq('缺 store', (await handleManualRefund({ uid: 'u', event: {} })).ok, false);
    eq('缺 uid', (await handleManualRefund({ store: new InMemoryStore(), event: {} })).ok, false);
    const noKey = await handleRefundNotify({ body: {}, env: {}, store: new InMemoryStore() });
    eq('缺金鑰 → config_error', noKey._meta.result, 'config_error');
  }

  // ── 結算 ──
  console.log('\n' + '='.repeat(52));
  console.log('結果： ' + passed + ' passed, ' + failed + ' failed');
  if (failed > 0) { console.log('FAIL: ' + failures.join(', ')); process.exit(1); }
  else { console.log('ALL GREEN ✓'); process.exit(0); }
}

run().catch((e) => { console.error('測試執行錯誤：', e); process.exit(1); });
