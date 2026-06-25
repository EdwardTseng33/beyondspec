/**
 * 扣款失敗 dunning 狀態機 — 單元測試（漏財防線）
 * ------------------------------------------------------------------
 * 對應 sandbox D1（失敗→寬限不立刻斷）/ D2（連續失敗→上鎖降級）+ Edward 親點逆向情境 1/2。
 * 跑法：node test/dunning.test.mjs   退出碼：全過=0 / fail=1
 *
 * 證明的事：
 *   1. 每期失敗 → active 進 past_due（寬限中、仍可用、發提醒）。
 *   2. 寬限內再失敗 → failCount++、graceUntil 不重置（防無限續命）。
 *   3. 達 maxRetries / autoCancelThreshold（綠界 6 次）/ 寬限過 → locked（降級）。
 *   4. 補扣成功 → 清 dunning 救回 active。
 *   5. 每個轉換 idempotent（同 idemKey 重進不重算）。
 *   6. handler 結合 store：寫狀態 + 寄不同信（past_due / locked）+ 告警。
 *   全程純函式 / InMemoryStore，不打網路、不碰真錢。
 */

import {
  DUNNING_DEFAULTS, resolveParams, classifyNotify,
  applyRecurringFailure, applyRecurringSuccess, isGraceExpired,
  handlePeriodicFailure, buildDunningEmail,
} from '../src/dunning.js';
import { InMemoryStore } from '../src/store.js';
import { isSubscriptionActive, resolveReadOnlyState, resolveEntitlement } from '../src/authority.js';

let passed = 0, failed = 0;
const failures = [];
function eq(name, a, b) {
  if (a === b) { passed++; console.log('  ✓ ' + name); }
  else { failed++; failures.push(name); console.log('  ✗ ' + name + '\n     exp: ' + JSON.stringify(b) + '\n     got: ' + JSON.stringify(a)); }
}
function ok(name, c) { eq(name, !!c, true); }

const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.UTC(2026, 5, 25, 0, 0, 0);

/** 一個 active 的訂閱（已解鎖）。 */
function activeBilling(over) {
  return Object.assign({ plan: 'pro', billingStatus: 'active', merchantTradeNo: 'BS_sub_1', amount: 499 }, over || {});
}

async function run() {
  console.log('\n扣款失敗 dunning 狀態機 · 單元測試\n');

  // ── 0. 參數 + 分類 ──
  console.log('[0] 參數可調 + classifyNotify');
  eq('預設 graceDays 7', DUNNING_DEFAULTS.graceDays, 7);
  eq('預設 autoCancelThreshold 6（綠界門檻）', DUNNING_DEFAULTS.autoCancelThreshold, 6);
  eq('覆寫 graceDays', resolveParams({ graceDays: 3 }).graceDays, 3);
  eq('覆寫缺項回 default', resolveParams({ graceDays: 3 }).maxRetries, DUNNING_DEFAULTS.maxRetries);
  eq('成功通知 success=true', classifyNotify({ RtnCode: '1', TotalSuccessTimes: '1' }).success, true);
  eq('首次授權 isFirstAuth=true', classifyNotify({ RtnCode: '1', TotalSuccessTimes: '1' }).isFirstAuth, true);
  eq('第3期成功 isFirstAuth=false', classifyNotify({ RtnCode: '1', TotalSuccessTimes: '3' }).isFirstAuth, false);
  eq('失敗通知 success=false', classifyNotify({ RtnCode: '10100058' }).success, false);

  // ── 1. 首次失敗 → active 進 past_due（寬限） ──
  console.log('\n[1] 每期失敗 → active 進 past_due（寬限中、不立刻斷）');
  {
    const out = applyRecurringFailure(activeBilling(), { now: T0, idemKey: 'k1', rtnCode: '10100058', rtnMsg: '額度不足', params: { graceDays: 7, maxRetries: 3 } });
    eq('transition = entered_grace', out.transition, 'entered_grace');
    eq('billingStatus → past_due', out.patch.billingStatus, 'past_due');
    eq('failCount = 1', out.patch.dunning.failCount, 1);
    eq('graceUntil = T0 + 7天', out.patch.dunning.graceUntil, T0 + 7 * DAY);
    ok('paymentIssue = true', out.patch.paymentIssue === true);
    ok('未上鎖', out.locked === false);
  }

  // ── 2. 寬限內再失敗 → failCount++、graceUntil 不重置 ──
  console.log('\n[2] 寬限內再失敗 → failCount++ 但 graceUntil 不順延（防無限續命）');
  {
    const b1 = activeBilling();
    const o1 = applyRecurringFailure(b1, { now: T0, idemKey: 'a', rtnCode: 'x', params: { graceDays: 7, maxRetries: 9 } });
    const b2 = Object.assign({}, b1, o1.patch);
    // 第 2 次失敗發生在 2 天後
    const o2 = applyRecurringFailure(b2, { now: T0 + 2 * DAY, idemKey: 'b', rtnCode: 'x', params: { graceDays: 7, maxRetries: 9 } });
    eq('transition = grace_retry', o2.transition, 'grace_retry');
    eq('failCount = 2', o2.patch.dunning.failCount, 2);
    eq('graceUntil 仍 = 首次失敗 + 7天（不順延）', o2.patch.dunning.graceUntil, T0 + 7 * DAY);
    ok('仍 past_due', o2.patch.billingStatus === 'past_due');
  }

  // ── 3. 達 maxRetries → locked ──
  console.log('\n[3] 連續失敗達 maxRetries → locked（提早止血）');
  {
    let b = activeBilling();
    let last;
    for (let i = 1; i <= 3; i++) {
      last = applyRecurringFailure(b, { now: T0 + (i - 1) * 60000, idemKey: 'r' + i, rtnCode: 'x', params: { graceDays: 30, maxRetries: 3, autoCancelThreshold: 6 } });
      b = Object.assign({}, b, last.patch);
    }
    eq('第 3 次 → locked', last.transition, 'locked');
    eq('billingStatus = locked', b.billingStatus, 'locked');
    eq('lockedReason = max_retries', b.lockedReason, 'max_retries');
    ok('failCount = 3', b.dunning.failCount === 3);
    ok('locked = true', last.locked === true);
  }

  // ── 4. 達綠界 autoCancelThreshold（6 次）→ locked（即使 maxRetries 設很大） ──
  console.log('\n[4] 連續失敗達綠界門檻 6 → locked（綠界已自動取消，不能再服務）');
  {
    let b = activeBilling();
    let last;
    for (let i = 1; i <= 6; i++) {
      last = applyRecurringFailure(b, { now: T0 + (i - 1) * 60000, idemKey: 'g' + i, rtnCode: 'x', params: { graceDays: 365, maxRetries: 99, autoCancelThreshold: 6 } });
      b = Object.assign({}, b, last.patch);
    }
    eq('第 6 次 → locked', last.transition, 'locked');
    eq('lockedReason = auto_cancel_threshold', b.lockedReason, 'auto_cancel_threshold');
  }

  // ── 5. 寬限過（即使次數沒到）→ locked ──
  console.log('\n[5] 失敗通知在寬限期【過後】才到 → locked（grace_expired）');
  {
    const b1 = activeBilling();
    const o1 = applyRecurringFailure(b1, { now: T0, idemKey: 'e1', rtnCode: 'x', params: { graceDays: 7, maxRetries: 99, autoCancelThreshold: 99 } });
    const b2 = Object.assign({}, b1, o1.patch);   // past_due, graceUntil = T0+7d
    // 下一筆失敗在 T0 + 10 天（寬限已過）
    const o2 = applyRecurringFailure(b2, { now: T0 + 10 * DAY, idemKey: 'e2', rtnCode: 'x', params: { graceDays: 7, maxRetries: 99, autoCancelThreshold: 99 } });
    eq('transition = locked', o2.transition, 'locked');
    eq('lockedReason = grace_expired', o2.patch.lockedReason, 'grace_expired');
  }

  // ── 6. isGraceExpired — 讀取端判定（寬限過但狀態還寫 past_due） ──
  console.log('\n[6] isGraceExpired — 讀取端：寬限過即使狀態還 past_due 也視為失效');
  {
    const pastDue = { billingStatus: 'past_due', dunning: { graceUntil: T0 + 7 * DAY } };
    ok('寬限內 → 未過期', isGraceExpired(pastDue, T0 + 3 * DAY) === false);
    ok('寬限過 → 過期', isGraceExpired(pastDue, T0 + 8 * DAY) === true);
    ok('active 不適用', isGraceExpired({ billingStatus: 'active' }, T0 + 99 * DAY) === false);
  }

  // ── 7. 補扣成功 → 清 dunning 救回 active ──
  console.log('\n[7] 補扣成功 → applyRecurringSuccess 清 dunning 回 active');
  {
    const troubled = { plan: 'pro', billingStatus: 'past_due', dunning: { failCount: 2, firstFailedAt: T0, graceUntil: T0 + 7 * DAY, seenKeys: ['a', 'b'] }, paymentIssue: true };
    const out = applyRecurringSuccess(troubled, { now: T0 + DAY });
    eq('transition = recovered', out.transition, 'recovered');
    eq('billingStatus → active', out.patch.billingStatus, 'active');
    ok('paymentIssue 清掉', out.patch.paymentIssue === false);
    eq('failCount 歸零', out.patch.dunning.failCount, 0);
    eq('graceUntil 清空', out.patch.dunning.graceUntil, null);
    ok('recoveredAt 記錄', typeof out.patch.recoveredAt === 'number');
    eq('lockedReason 清空', out.patch.lockedReason, null);
  }
  {
    // locked 也能被補扣成功救回
    const locked = { plan: 'pro', billingStatus: 'locked', lockedReason: 'max_retries', dunning: { failCount: 3, seenKeys: [] } };
    const out = applyRecurringSuccess(locked, { now: T0 });
    eq('locked → active（補扣救回）', out.patch.billingStatus, 'active');
    eq('lockedReason 清', out.patch.lockedReason, null);
  }

  // ── 8. idempotent — 同 idemKey 重進不重算 ──
  console.log('\n[8] idempotent — 同一失敗通知重送不重複扣寬限/不重複 ++');
  {
    const b1 = activeBilling();
    const o1 = applyRecurringFailure(b1, { now: T0, idemKey: 'dup', rtnCode: 'x', params: { graceDays: 7, maxRetries: 9 } });
    const b2 = Object.assign({}, b1, o1.patch);
    const o2 = applyRecurringFailure(b2, { now: T0 + DAY, idemKey: 'dup', rtnCode: 'x', params: { graceDays: 7, maxRetries: 9 } });  // 同 key 重送
    eq('第 2 次同 key → idempotent', o2.transition, 'idempotent');
    ok('idempotent = true', o2.idempotent === true);
    ok('patch 空（不改）', Object.keys(o2.patch).length === 0);
    eq('failCount 仍 1（沒被重複 ++）', b2.dunning.failCount, 1);
  }
  {
    // 成功路徑也 idempotent
    const troubled = { billingStatus: 'past_due', dunning: { failCount: 1, seenKeys: ['s1'] } };
    const out = applyRecurringSuccess(troubled, { now: T0, idemKey: 's1' });
    eq('成功同 key → idempotent', out.transition, 'idempotent');
  }

  // ── 9. handler 結合 store：past_due 落盤 + 寄信 + 告警 ──
  console.log('\n[9] handlePeriodicFailure — 寫 store + 寄 past_due 信 + 告警');
  {
    const store = new InMemoryStore();
    await store.setBilling('u1', activeBilling());
    const mails = [], alerts = [];
    const res = await handlePeriodicFailure({
      store, uid: 'u1',
      notify: { RtnCode: '10100058', RtnMsg: '額度不足', MerchantTradeNo: 'BS_sub_1' },
      idemKey: 'h1',
      params: { graceDays: 7, maxRetries: 3 },
      mailer: async (m) => mails.push(m),
      lookupEmail: async () => 'u1@example.com',
      onAlert: async (e) => alerts.push(e),
      opts: { now: T0 },
    });
    eq('transition = entered_grace', res.transition, 'entered_grace');
    eq('billingStatus = past_due', res.billingStatus, 'past_due');
    const b = await store.getBilling('u1');
    eq('store 已寫 past_due', b.billingStatus, 'past_due');
    eq('store failCount = 1', b.dunning.failCount, 1);
    ok('寄了 past_due 信', mails.length === 1 && mails[0].kind === 'dunning_past_due');
    ok('信主旨提更新卡', mails[0].subject.indexOf('更新') >= 0);
    ok('email queued', res.emailQueued === true);
    ok('發 dunning_past_due 告警', alerts.some((a) => a.type === 'dunning_past_due'));
  }

  // ── 10. handler 上鎖 → 寄 locked 信 + dunning_locked 告警 ──
  console.log('\n[10] handlePeriodicFailure — 達門檻上鎖 → 寄 locked 信 + 告警');
  {
    const store = new InMemoryStore();
    await store.setBilling('u2', activeBilling());
    const mails = [], alerts = [];
    let last;
    for (let i = 1; i <= 3; i++) {
      last = await handlePeriodicFailure({
        store, uid: 'u2',
        notify: { RtnCode: 'x', MerchantTradeNo: 'BS_sub_1' },
        idemKey: 'L' + i,
        params: { graceDays: 365, maxRetries: 3, autoCancelThreshold: 6 },
        mailer: async (m) => mails.push(m),
        lookupEmail: async () => 'u2@example.com',
        onAlert: async (e) => alerts.push(e),
        opts: { now: T0 + i * 1000 },
      });
    }
    eq('最後 transition = locked', last.transition, 'locked');
    eq('locked = true', last.locked, true);
    const b = await store.getBilling('u2');
    eq('store billingStatus = locked', b.billingStatus, 'locked');
    ok('最後一封是 locked 信', mails[mails.length - 1].kind === 'dunning_locked');
    ok('發 dunning_locked 告警', alerts.some((a) => a.type === 'dunning_locked'));
  }

  // ── 11. handler idempotent（store 落盤後重送同 key 不再 ++） ──
  console.log('\n[11] handler idempotent — 同 idemKey 重送不重複改 store');
  {
    const store = new InMemoryStore();
    await store.setBilling('u3', activeBilling());
    const args = (n) => ({ store, uid: 'u3', notify: { RtnCode: 'x' }, idemKey: 'same', params: { graceDays: 7, maxRetries: 9 }, opts: { now: T0 + n } });
    const r1 = await handlePeriodicFailure(args(0));
    const r2 = await handlePeriodicFailure(args(1000));
    eq('第 1 次 entered_grace', r1.transition, 'entered_grace');
    eq('第 2 次 idempotent', r2.transition, 'idempotent');
    const b = await store.getBilling('u3');
    eq('failCount 仍 1（idempotent 生效）', b.dunning.failCount, 1);
  }

  // ── 12. 與 authority 整合：past_due 寬限內可用 / 寬限過失效 / locked 降 free ──
  console.log('\n[12] 整合 authority — past_due/locked 的 entitlement + 唯讀殼');
  {
    const grace = { plan: 'pro', billingStatus: 'past_due', dunning: { graceUntil: T0 + 7 * DAY } };
    ok('past_due 寬限內 → 仍 active（可用）', isSubscriptionActive(grace, T0 + 3 * DAY) === true);
    ok('past_due 寬限內 → pro 仍給', resolveEntitlement(grace, T0 + 3 * DAY).plan === 'pro');
    ok('past_due 寬限過 → 失效', isSubscriptionActive(grace, T0 + 8 * DAY) === false);
    ok('past_due 寬限過 → 降 free', resolveEntitlement(grace, T0 + 8 * DAY).plan === 'free');

    const ro1 = resolveReadOnlyState(grace, T0 + 3 * DAY);
    ok('past_due 寬限內 → 唯讀殼（付款異常提示）', ro1.readOnly === true && ro1.reason === 'past_due_grace');
    const ro2 = resolveReadOnlyState(grace, T0 + 8 * DAY);
    ok('past_due 寬限過 → 唯讀殼 past_due_expired', ro2.readOnly === true && ro2.reason === 'past_due_expired');

    const locked = { plan: 'pro', billingStatus: 'locked', lockedReason: 'max_retries' };
    ok('locked → 失效', isSubscriptionActive(locked, T0) === false);
    ok('locked → 降 free', resolveEntitlement(locked, T0).plan === 'free');
    const ro3 = resolveReadOnlyState(locked, T0);
    ok('locked → 唯讀殼 locked', ro3.readOnly === true && ro3.reason === 'locked');
  }

  // ── 13. buildDunningEmail — 文案分流 ──
  console.log('\n[13] buildDunningEmail — past_due / locked 文案不同');
  {
    const pastDue = buildDunningEmail('a@b.c', { locked: false, transition: 'entered_grace', patch: { dunning: { graceUntil: T0 + 5 * DAY } } }, { plan: 'pro' }, T0);
    ok('past_due 信含「寬限」天數', pastDue.text.indexOf('寬限') >= 0);
    eq('past_due kind', pastDue.kind, 'dunning_past_due');
    const locked = buildDunningEmail('a@b.c', { locked: true, transition: 'locked', patch: { dunning: {} } }, { plan: 'pro' }, T0);
    ok('locked 信含「暫停」', locked.text.indexOf('暫停') >= 0);
    eq('locked kind', locked.kind, 'dunning_locked');
  }

  // ── 結算 ──
  console.log('\n' + '='.repeat(52));
  console.log('結果： ' + passed + ' passed, ' + failed + ' failed');
  if (failed > 0) { console.log('FAIL: ' + failures.join(', ')); process.exit(1); }
  else { console.log('ALL GREEN ✓'); process.exit(0); }
}

run().catch((e) => { console.error('測試執行錯誤：', e); process.exit(1); });
