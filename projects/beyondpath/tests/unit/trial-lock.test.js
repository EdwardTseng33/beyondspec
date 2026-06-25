// trial-lock.test.js — block ② v1.12.0「Starter 7 天試用到期硬鎖」決策邏輯單元測試
// 注意：下方 _trialDaysLimit / _isPaidAccount / _trialInfo / _enforceBilling 為 path/app/index.html
//       v1.12.0 同款邏輯之複本。改 app 那段時，這份要同步改，否則測試會失準。
'use strict';

var NOW = Date.parse('2026-06-25T00:00:00.000Z');
var _realNow = Date.now;
Date.now = function () { return NOW; };

var PLAN_CATALOG = { starter: { trialDays: 7 } };
var state = {};
function saveState() {}
var window = { bpStorage: null };

// ───── 與 app 同步的決策邏輯複本 ─────
function _trialDaysLimit() {
  try { return (PLAN_CATALOG.starter && PLAN_CATALOG.starter.trialDays) || 7; } catch (e) { return 7; }
}
function _isPaidAccount() {
  return !!(state.billingStatus === 'active' || state.paidAt || state.subscriptionId
            || state.plan === 'pro' || state.plan === 'enterprise');
}
function _trialInfo() {
  var startMs = state.trialStartedAt ? new Date(state.trialStartedAt).getTime() : 0;
  if (!startMs || isNaN(startMs)) return { started: false, daysLeft: _trialDaysLimit(), expired: false };
  var lim = _trialDaysLimit();
  var elapsed = (Date.now() - startMs) / 86400000;
  return { started: true, daysLeft: Math.max(0, Math.ceil(lim - elapsed)), expired: elapsed >= lim };
}
function _persistBilling() { try { saveState(); } catch (e) {} }
function _enforceBilling() {
  if (_isPaidAccount()) { if (state.lockReason) { state.lockReason = null; _persistBilling(); } return false; }
  if (!state.trialStartedAt) {
    state.plan = 'starter';
    state.trialStartedAt = new Date().toISOString();
    state.lockReason = null;
    _persistBilling();
    return false;
  }
  var t = _trialInfo();
  if (t.expired) {
    state.plan = 'free';
    state.lockReason = 'trial_expired';
    _persistBilling();
    return true;
  }
  if (state.plan !== 'starter') { state.plan = 'starter'; _persistBilling(); }
  return false;
}
// ───── /複本 ─────

function daysAgo(n) { return new Date(NOW - n * 86400000).toISOString(); }
var pass = 0, fail = 0;
function check(name, cond) { if (cond) { pass++; console.log('  PASS  ' + name); } else { fail++; console.log('  FAIL  ' + name); } }

// 1 新用戶（無 trial）→ 啟動 7 天試用、不鎖
state = { plan: 'free' };
var r = _enforceBilling();
check('新用戶 → 啟動試用、不鎖、plan=starter', r === false && state.plan === 'starter' && !!state.trialStartedAt);

// 2 試用第 3 天 → 不鎖
state = { plan: 'starter', trialStartedAt: daysAgo(3) };
r = _enforceBilling();
check('試用第 3 天 → 不鎖', r === false && state.plan === 'starter');

// 3 第 7 天整 → 鎖
state = { plan: 'starter', trialStartedAt: daysAgo(7) };
r = _enforceBilling();
check('第 7 天到期 → 鎖（plan=free, lockReason=trial_expired）', r === true && state.plan === 'free' && state.lockReason === 'trial_expired');

// 4 第 8 天 → 鎖
state = { plan: 'starter', trialStartedAt: daysAgo(8) };
r = _enforceBilling();
check('第 8 天 → 鎖', r === true && state.plan === 'free');

// 5 到期但 billingStatus=active → 不鎖（最重要：不能鎖到付費的人）
state = { plan: 'starter', trialStartedAt: daysAgo(30), billingStatus: 'active' };
r = _enforceBilling();
check('到期但已付費(active) → 不鎖', r === false);

// 6 到期但有 paidAt → 不鎖
state = { plan: 'starter', trialStartedAt: daysAgo(30), paidAt: daysAgo(1) };
r = _enforceBilling();
check('到期但有 paidAt → 不鎖', r === false);

// 7 PRO 用戶 → 永不鎖
state = { plan: 'pro', trialStartedAt: daysAgo(30) };
r = _enforceBilling();
check('PRO 付費用戶 → 不鎖', r === false && state.plan === 'pro');

// 8 MAX / dev-unlock(enterprise) → 永不鎖
state = { plan: 'enterprise', trialStartedAt: daysAgo(30) };
r = _enforceBilling();
check('MAX / dev-unlock(enterprise) → 不鎖', r === false && state.plan === 'enterprise');

// 9 已鎖用戶重新登入 → 維持鎖
state = { plan: 'free', lockReason: 'trial_expired', trialStartedAt: daysAgo(10) };
r = _enforceBilling();
check('已鎖用戶重登 → 維持鎖', r === true && state.plan === 'free');

// 10 付費後解鎖：原本鎖、現 active → 清鎖記號、不鎖
state = { plan: 'pro', lockReason: 'trial_expired', billingStatus: 'active', trialStartedAt: daysAgo(30) };
r = _enforceBilling();
check('付費後 → 清掉鎖記號、不鎖', r === false && !state.lockReason);

// 11 第 6 天 → daysLeft = 1、未到期
state = { plan: 'starter', trialStartedAt: daysAgo(6) };
var info = _trialInfo();
check('第 6 天 → daysLeft=1、未到期', info.daysLeft === 1 && info.expired === false);

Date.now = _realNow;
console.log('\n結果：' + pass + ' 過 / ' + fail + ' 失敗');
process.exit(fail > 0 ? 1 : 0);
