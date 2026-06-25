/**
 * /ecpay/cancel 取消訂閱 — 單元測試（紅線 2）
 * ------------------------------------------------------------------
 * 對應 sandbox C1（取消即停扣，真呼叫綠界）/ C2（取消失敗不可標已取消）/ C3（取消後當期續用）。
 * 跑法：node test/cancel.test.mjs   退出碼：全過=0 / fail=1
 *
 * 核心要證明的事：
 *   1. 取消【真的去呼叫綠界 CreditCardPeriodAction】（fakeFetch 記到被呼叫 + Action=Cancel + 簽章對）。
 *   2. 綠界回 RtnCode=1 → 才寫 cancelled。
 *   3. 綠界回失敗 / 網路錯 → 【絕不】寫 cancelled（紅線 2）。
 *   4. 取消後 plan 不動（當期續用，C3）。
 *
 * 測試金鑰 = 綠界官方公開範例值，非真金鑰。fakeFetch 不打真網路、不碰真錢。
 */

import { handleCancel, buildCancelRequest, toFormBody, parseActionResponse } from '../src/cancel.js';
import { verifyCheckMacValue } from '../src/checkmac.js';
import { InMemoryStore } from '../src/store.js';

let passed = 0, failed = 0;
const failures = [];
function eq(name, a, b) {
  if (a === b) { passed++; console.log('  ✓ ' + name); }
  else { failed++; failures.push(name); console.log('  ✗ ' + name + '\n     exp: ' + JSON.stringify(b) + '\n     got: ' + JSON.stringify(a)); }
}
function ok(name, c) { eq(name, !!c, true); }

const ENV = {
  ECPAY_ENV: 'stage',
  ECPAY_HASH_KEY: 'pwFHCqoQZGmho4w6',
  ECPAY_HASH_IV: 'EkRm7iFT261dpevs',
};

/** 建一個「已 active 的訂閱」進 store。 */
async function seedActive(store, uid, over) {
  await store.setBilling(uid, Object.assign({
    plan: 'pro',
    billingStatus: 'active',
    merchantTradeNo: 'BS_sub_001',
    subscriptionId: 'gw_999',
    amount: 499,
    paidAt: Date.now(),
  }, over || {}));
}

/** 可程式化的 fakeFetch：記錄呼叫 + 回指定回應。 */
function makeFakeFetch(handler) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, init });
    return handler(url, init, calls.length);
  };
  fn.calls = calls;
  return fn;
}

/** 綠界 Action 回應 form-urlencoded 字串。 */
function ecpayResp(fields) {
  const sp = new URLSearchParams();
  for (const k in fields) sp.append(k, String(fields[k]));
  return sp.toString();
}

async function run() {
  console.log('\n/ecpay/cancel 取消訂閱 · 單元測試\n');

  // ── 1. buildCancelRequest — 欄位 + 簽章 + 端點 ──
  console.log('[1] buildCancelRequest — Action=Cancel + 簽章正確 + 端點寫死');
  {
    const req = await buildCancelRequest({ merchantTradeNo: 'BS_sub_001' }, ENV, { now: 1750000000000 });
    eq('Action = Cancel', req.fields.Action, 'Cancel');
    eq('MerchantID = 3502366', req.fields.MerchantID, '3502366');
    eq('MerchantTradeNo 帶入', req.fields.MerchantTradeNo, 'BS_sub_001');
    eq('TimeStamp = epoch 秒', req.fields.TimeStamp, 1750000000);
    ok('CheckMacValue 64 字大寫', /^[0-9A-F]{64}$/.test(req.fields.CheckMacValue));
    ok('簽章自洽（能被 verify 過）', await verifyCheckMacValue(req.fields, ENV.ECPAY_HASH_KEY, ENV.ECPAY_HASH_IV));
    eq('端點 = 綠界 stage CreditCardPeriodAction', req.action, 'https://payment-stage.ecpay.com.tw/Cashier/CreditCardPeriodAction');
    const reqProd = await buildCancelRequest({ merchantTradeNo: 'X' }, Object.assign({}, ENV, { ECPAY_ENV: 'prod' }));
    eq('prod 端點正確', reqProd.action, 'https://payment.ecpay.com.tw/Cashier/CreditCardPeriodAction');
  }

  // ── 2. C1 取消成功（綠界回 RtnCode=1）→ 真呼叫 + 寫 cancelled ──
  console.log('\n[2] C1 取消成功 → 真呼叫綠界 + 寫 cancelled');
  {
    const store = new InMemoryStore();
    await seedActive(store, 'u_alice');
    const fakeFetch = makeFakeFetch(async () => ({ status: 200, text: async () => ecpayResp({ RtnCode: '1', RtnMsg: 'Success', MerchantTradeNo: 'BS_sub_001' }) }));
    const res = await handleCancel({ input: { uid: 'u_alice' }, env: ENV, store, fetchImpl: fakeFetch });

    ok('回 ok:true', res.ok === true);
    eq('真的呼叫了綠界 1 次', fakeFetch.calls.length, 1);
    eq('打的是 CreditCardPeriodAction 端點', fakeFetch.calls[0].url, 'https://payment-stage.ecpay.com.tw/Cashier/CreditCardPeriodAction');
    eq('method POST', fakeFetch.calls[0].init.method, 'POST');
    ok('body 含 Action=Cancel', fakeFetch.calls[0].init.body.indexOf('Action=Cancel') >= 0);
    ok('body 含簽章', fakeFetch.calls[0].init.body.indexOf('CheckMacValue=') >= 0);
    // 只有綠界確認後才寫 cancelled
    const billing = await store.getBilling('u_alice');
    eq('billingStatus = cancelled', billing.billingStatus, 'cancelled');
    ok('cancelledAt 是數字', typeof billing.cancelledAt === 'number');
    eq('updatedBy = cancel', billing.updatedBy, 'cancel');
    // C3：plan 不動（當期續用）
    eq('plan 仍 pro（當期續用，C3）', billing.plan, 'pro');
  }

  // ── 3. C2 綠界回失敗（RtnCode != 1）→ 絕不寫 cancelled ──
  console.log('\n[3] C2 綠界回失敗 → 不可標已取消（紅線 2）');
  {
    const store = new InMemoryStore();
    await seedActive(store, 'u_bob');
    const fakeFetch = makeFakeFetch(async () => ({ status: 200, text: async () => ecpayResp({ RtnCode: '0', RtnMsg: '查無此筆訂單' }) }));
    const res = await handleCancel({ input: { uid: 'u_bob' }, env: ENV, store, fetchImpl: fakeFetch });

    ok('回 ok:false', res.ok === false);
    eq('有試著呼叫綠界', fakeFetch.calls.length, 1);
    const billing = await store.getBilling('u_bob');
    eq('billingStatus 仍 active（沒被錯標）', billing.billingStatus, 'active');
    ok('沒有 cancelledAt', billing.cancelledAt === undefined);
  }

  // ── 4. 網路錯誤 / 綠界不可達 → 絕不寫 cancelled ──
  console.log('\n[4] 綠界不可達（fetch throw）→ 不可標已取消 + 502');
  {
    const store = new InMemoryStore();
    await seedActive(store, 'u_carol');
    const alerts = [];
    const fakeFetch = makeFakeFetch(async () => { throw new Error('network down'); });
    const res = await handleCancel({ input: { uid: 'u_carol' }, env: ENV, store, fetchImpl: fakeFetch, onAlert: async (e) => alerts.push(e) });

    ok('回 ok:false', res.ok === false);
    eq('status 502', res.status, 502);
    const billing = await store.getBilling('u_carol');
    eq('billingStatus 仍 active', billing.billingStatus, 'active');
    ok('發 cancel_network_error 告警', alerts.some((a) => a.type === 'cancel_network_error'));
  }

  // ── 5. HTTP 非 2xx → 不可標已取消 ──
  console.log('\n[5] 綠界 HTTP 500 → 不可標已取消');
  {
    const store = new InMemoryStore();
    await seedActive(store, 'u_dave');
    const fakeFetch = makeFakeFetch(async () => ({ status: 500, text: async () => 'Internal Error' }));
    const res = await handleCancel({ input: { uid: 'u_dave' }, env: ENV, store, fetchImpl: fakeFetch });
    ok('回 ok:false', res.ok === false);
    eq('billingStatus 仍 active', (await store.getBilling('u_dave')).billingStatus, 'active');
  }

  // ── 6. 沒有訂閱 / 已取消 → 防呆 ──
  console.log('\n[6] 防呆 — 無訂閱 / 已取消 / 缺參數');
  {
    const store = new InMemoryStore();
    const fakeFetch = makeFakeFetch(async () => ({ status: 200, text: async () => ecpayResp({ RtnCode: '1' }) }));
    // 無訂閱
    const rNone = await handleCancel({ input: { uid: 'ghost' }, env: ENV, store, fetchImpl: fakeFetch });
    eq('無訂閱 → 404', rNone.status, 404);
    eq('沒呼叫綠界（無單可取消）', fakeFetch.calls.length, 0);
    // 已取消 → idempotent，不再打綠界
    await store.setBilling('u_done', { plan: 'pro', billingStatus: 'cancelled', merchantTradeNo: 'X', cancelledAt: 1 });
    const rDone = await handleCancel({ input: { uid: 'u_done' }, env: ENV, store, fetchImpl: fakeFetch });
    ok('已取消 → ok:true（idempotent）', rDone.ok === true);
    eq('已取消不再打綠界', fakeFetch.calls.length, 0);
    // 缺 uid
    eq('缺 uid → 400', (await handleCancel({ input: {}, env: ENV, store, fetchImpl: fakeFetch })).status, 400);
    // 缺金鑰
    eq('缺金鑰 → 500', (await handleCancel({ input: { uid: 'x' }, env: { ECPAY_ENV: 'stage' }, store, fetchImpl: fakeFetch })).status, 500);
    // 缺 fetch
    eq('缺 fetchImpl → 500', (await handleCancel({ input: { uid: 'x' }, env: ENV, store })).status, 500);
  }

  // ── 7. toFormBody / parseActionResponse 工具 ──
  console.log('\n[7] 工具函式');
  {
    const body = toFormBody({ A: '1', B: 'x y', Action: 'Cancel' });
    ok('toFormBody 編碼空白', body.indexOf('B=x+y') >= 0 || body.indexOf('B=x%20y') >= 0);
    const parsed = parseActionResponse('RtnCode=1&RtnMsg=OK');
    eq('parse RtnCode', parsed.RtnCode, '1');
    eq('parse 物件直接回傳', parseActionResponse({ RtnCode: '9' }).RtnCode, '9');
  }

  // ── 結算 ──
  console.log('\n' + '='.repeat(52));
  console.log('結果： ' + passed + ' passed, ' + failed + ' failed');
  if (failed > 0) { console.log('FAIL: ' + failures.join(', ')); process.exit(1); }
  else { console.log('ALL GREEN ✓'); process.exit(0); }
}

run().catch((e) => { console.error('測試執行錯誤：', e); process.exit(1); });
