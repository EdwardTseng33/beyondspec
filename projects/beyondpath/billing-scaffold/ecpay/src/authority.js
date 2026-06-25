/**
 * BeyondSpec × 綠界 — 訂閱後端權威化骨架（防清 localStorage 繞過）
 * ==================================================================
 * 對應技術計畫 §5 + 沙利曼 spec A3。
 *
 * 核心原則（一句話）：
 *   localStorage 改成 PRO 只會讓【UI 暫時亮起來】，但 Worker 端付費動作
 *   永遠查 Firestore → 點下去不會真的給服務。安全邊界在 Worker，不在前端。
 *
 * 兩層判斷：
 *   ┌ 前端 UI gating（隱藏/顯示模組）── 讀 localStorage 快取 → 反應快，
 *   │   但這【只是 UX、不是安全邊界】。用戶改 localStorage 能騙過 UI（無所謂）。
 *   └ 真正吃資源的動作（AI 呼叫等付費功能）── Worker 端【每次都查 Firestore】
 *       確認 plan，前端 localStorage 改了也沒用（Worker 不信前端傳的 plan）。
 *
 * 這支提供：
 *   A) Worker 端：assertEntitled(store, uid, feature) — 付費動作前的權威 gate。
 *   B) Worker 端：resolveEntitlement(billing) — 由 billing 算「現在能用什麼」。
 *   C) 前端用（純邏輯，可被 app.html ES5 參照其判斷）：
 *        cacheFromBilling(billing) — 把 Firestore billing 壓成 localStorage 快取 shape。
 *        isCacheUsableForUI(cache) — UI 該不該顯示 PRO（僅 UX，非安全）。
 *
 * 注意：本檔【不寫】app.html（Agent 防護規則 1：agent 不直接改 app.html）。
 *   只提供 Worker 端權威邏輯 + 前端可參照的純函式。實際接 app.html 由主對話 review 後做。
 *
 * 執行環境：Worker（現代 JS）。C 段純邏輯也可在前端複刻（無相依）。
 */

'use strict';

/**
 * 各 plan 能用的「付費 feature」白名單。
 * Worker 端 assertEntitled 用這張表判「這個 uid 的 plan 能不能用這個 feature」。
 * free = 試用/未付費；pro / max 逐級加。
 * （與 app.html 的模組 gating 對齊；此處先放骨架，實際 feature key 待對齊。）
 */
const ENTITLEMENTS = {
  free: { ai_call: false, advanced_modules: false },
  pro: { ai_call: true, advanced_modules: true },
  max: { ai_call: true, advanced_modules: true },
};

/**
 * 訂閱是否「目前有效」（= 能用付費 feature）。
 *   - active → 有效。
 *   - cancelled 但仍在當期（now < nextBillingAt）→ 仍有效（已付當期，紅線 2.5）。
 *   - cancelled 且已過期 → 失效（降 free）。
 *   - past_due（扣款失敗寬限中，dunning.js）→ 寬限【未過】仍有效（體貼，給補卡時間）；
 *           寬限【已過】→ 失效（即使 billingStatus 還沒被改成 locked，讀取端也視為失效）。
 *   - locked（連續失敗/退款/chargeback 上鎖）→ 失效（降 free，走唯讀殼）。
 *   - 其他/缺 → 失效。
 * @param {Object} billing  Firestore billing doc
 * @param {number} [nowMs]
 * @returns {boolean}
 */
function isSubscriptionActive(billing, nowMs) {
  if (!billing) return false;
  const now = nowMs || Date.now();
  if (billing.billingStatus === 'active') return true;
  if (billing.billingStatus === 'cancelled') {
    // 取消後用到當期結束。nextBillingAt 缺時保守視為已過期。
    return typeof billing.nextBillingAt === 'number' && now < billing.nextBillingAt;
  }
  if (billing.billingStatus === 'past_due') {
    // 寬限中仍可用，但寬限過 = 失效（防「綠界不再送通知時 past_due 卡著白吃服務」）。
    const d = billing.dunning || {};
    if (typeof d.graceUntil === 'number' && now > d.graceUntil) return false;
    return true;
  }
  // locked / 其他 → 失效
  return false;
}

/**
 * 訂閱目前是否該走【唯讀殼】（前端 _isReadOnly）。
 *   重用「試用到期軟鎖」同一個唯讀殼，不另造一套（chunk3 一致性要求）：
 *     - past_due（寬限中或已過）→ 唯讀提示「付款異常」，但寬限內 entitlement 仍給。
 *     - locked（連續失敗/退款/chargeback）→ 唯讀 + 降 free。
 *   active / cancelled-當期 → 非唯讀（正常可編輯）。
 *   注意：past_due 寬限【內】是「可用但提示」，UI 可顯示橫幅但不一定鎖編輯——
 *         是否在寬限內就軟鎖由前端產品決策；本函式回「是否進入付款異常狀態」。
 * @param {Object} billing
 * @param {number} [nowMs]
 * @returns {{readOnly:boolean, reason:string}}
 *   reason ∈ '' | 'past_due_grace' | 'past_due_expired' | 'locked'
 */
function resolveReadOnlyState(billing, nowMs) {
  if (!billing) return { readOnly: false, reason: '' };
  const now = nowMs || Date.now();
  const status = billing.billingStatus;
  if (status === 'locked') return { readOnly: true, reason: 'locked' };
  if (status === 'past_due') {
    const d = billing.dunning || {};
    const expired = typeof d.graceUntil === 'number' && now > d.graceUntil;
    return { readOnly: true, reason: expired ? 'past_due_expired' : 'past_due_grace' };
  }
  return { readOnly: false, reason: '' };
}

/**
 * 由 billing 算出「目前生效的 plan」與「能用的 feature 集合」。
 * 訂閱無效 → 一律降為 free（不管 billing.plan 寫什麼）。
 * @param {Object} billing
 * @param {number} [nowMs]
 * @returns {{plan:string, active:boolean, features:Object}}
 */
function resolveEntitlement(billing, nowMs) {
  const active = isSubscriptionActive(billing, nowMs);
  const plan = active && billing && ENTITLEMENTS[billing.plan] ? billing.plan : 'free';
  return {
    plan: plan,
    active: active,
    features: Object.assign({}, ENTITLEMENTS[plan] || ENTITLEMENTS.free),
  };
}

/**
 * 【Worker 端權威 gate】付費動作前必呼叫。
 *   每次都從 store（Firestore）讀 billing 重算，【不信前端傳來的 plan】。
 *
 * @param {Object} store    BillingStore
 * @param {string} uid
 * @param {string} feature  要用的付費 feature key（如 'ai_call'）
 * @param {number} [nowMs]
 * @returns {Promise<{allowed:boolean, plan:string, reason?:string}>}
 */
async function assertEntitled(store, uid, feature, nowMs) {
  if (!store) return { allowed: false, plan: 'free', reason: 'store missing' };
  if (!uid) return { allowed: false, plan: 'free', reason: 'missing uid' };
  let billing = null;
  try { billing = await store.getBilling(uid); }
  catch (e) { return { allowed: false, plan: 'free', reason: 'billing read error' }; }

  const ent = resolveEntitlement(billing, nowMs);
  const allowed = !!ent.features[feature];
  return {
    allowed: allowed,
    plan: ent.plan,
    reason: allowed ? undefined : 'plan ' + ent.plan + ' not entitled to ' + feature,
  };
}

/**
 * 【前端快取 shape】把 Firestore billing 壓成 localStorage 要存的最小物件。
 *   前端啟動時：onAuthStateChanged → 讀 Firestore billing → cacheFromBilling →
 *   寫進 bp_subscription（localStorage）當【唯讀快取】（離線/首屏快顯）。
 *   ⚠️ 這是顯示快取，不是真相。
 * @param {Object} billing
 * @param {number} [nowMs]
 * @returns {Object}
 */
function cacheFromBilling(billing, nowMs) {
  const ent = resolveEntitlement(billing, nowMs);
  const ro = resolveReadOnlyState(billing, nowMs);
  return {
    plan: ent.plan,
    active: ent.active,
    billingStatus: (billing && billing.billingStatus) || 'none',
    nextBillingAt: (billing && billing.nextBillingAt) || null,
    // 付款異常旗標：前端據此顯示「更新卡片」橫幅 + 走唯讀殼（與試用到期同一殼）。
    readOnly: ro.readOnly,
    readOnlyReason: ro.reason,
    paymentIssue: !!(billing && billing.paymentIssue),
    graceUntil: (billing && billing.dunning && billing.dunning.graceUntil) || null,
    cachedAt: nowMs || Date.now(),
    // 明確標註：這是快取、非權威。前端任何安全判斷都不能只信這個。
    _note: 'ui-cache-only; authoritative source is Firestore via Worker',
  };
}

/**
 * 【前端 UI 用】快取是否該讓 UI 顯示 PRO 功能。
 *   僅 UX：快取被竄改頂多 UI 亮起來，但 Worker 付費動作仍會擋。
 *   加一個 maxAgeMs：快取太舊就不信、要求重抓（預設 24h）。
 * @param {Object} cache  cacheFromBilling 輸出（從 localStorage 讀回）
 * @param {number} [maxAgeMs]
 * @param {number} [nowMs]
 * @returns {boolean}
 */
function isCacheUsableForUI(cache, maxAgeMs, nowMs) {
  if (!cache || !cache.active) return false;
  const now = nowMs || Date.now();
  const maxAge = typeof maxAgeMs === 'number' ? maxAgeMs : 24 * 60 * 60 * 1000;
  if (typeof cache.cachedAt !== 'number') return false;
  if (now - cache.cachedAt > maxAge) return false;  // 太舊 → 重抓
  return cache.plan === 'pro' || cache.plan === 'max';
}

const _api = {
  ENTITLEMENTS,
  isSubscriptionActive,
  resolveReadOnlyState,
  resolveEntitlement,
  assertEntitled,
  cacheFromBilling,
  isCacheUsableForUI,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = _api;
}

export {
  ENTITLEMENTS,
  isSubscriptionActive,
  resolveReadOnlyState,
  resolveEntitlement,
  assertEntitled,
  cacheFromBilling,
  isCacheUsableForUI,
};
