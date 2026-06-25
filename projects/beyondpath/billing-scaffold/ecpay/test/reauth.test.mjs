/**
 * /ecpay/reauth 主動重授權救援 — 單元測試（dunning 漏財防線 · accepted ≠ charged 紅線）
 * ------------------------------------------------------------------
 * 對應 trust spec §3（ReAuth）+ tech plan Step 7/J（扣款失敗主動重扣救回）+ README 第三塊待辦 #3。
 * 跑法：node test/reauth.test.mjs   退出碼：全過=0 / fail=1
 *
 * 核心要證明的事：
 *   1. buildReAuthRequest 組 Action=ReAuth + 簽章正確（CheckMacValue 能被 verify）+ 端點寫死。
 *   2. 真的去呼叫綠界 CreditCardPeriodAction（fakeFetch 記到被呼叫 + Action=ReAuth + 簽章）。
 *   3. 綠界回 RtnCode=1 → accepted:true（綠界「受理」此次重扣）。
 *   4. 綠界回 RtnCode!=1 / HTTP 500 / 網路錯 → accepted:false（沒受理）+ 告警。
 *   5. 【最關鍵】handleReAuth 永遠 charged:false，且【絕不解鎖 / 絕不碰 billing / 絕不清 dunning】
 *      ——「受理」不是「扣成功」，扣成功要等之後的 webhook（PeriodReturnURL）。
 *      明確驗：handleReAuth 連 store 都不收，沒有任何路徑能改 billing 狀態。
 *
 * 測試金鑰 = 綠界官方公開範例值，非真金鑰。fakeFetch 不打真網路、不碰真錢。
 */

import { handleReAuth, buildReAuthRequest, toFormBody, parseActionResponse } from '../src/reauth.js';
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
  console.log('\n/ecpay/reauth 主動重授權救援 · 單元測試\n');

  // ── 1. buildReAuthRequest — 欄位 + 簽章 + 端點 ──
  console.log('[1] buildReAuthRequest — Action=ReAuth + 簽章正確 + 端點寫死');
  {
    const req = await buildReAuthRequest({ merchantTradeNo: 'BS_sub_001' }, ENV, { now: 1750000000000 });
    eq('Action = ReAuth', req.fields.Action, 'ReAuth');
    eq('MerchantID = 3502366', req.fields.MerchantID, '3502366');
    eq('MerchantTradeNo 帶入', req.fields.MerchantTradeNo, 'BS_sub_001');
    eq('TimeStamp = epoch 秒', req.fields.TimeStamp, 1750000000);
    ok('CheckMacValue 64 字大寫', /^[0-9A-F]{64}$/.test(req.fields.CheckMacValue));
    ok('簽章自洽（能被 verify 過）', await verifyCheckMacValue(req.fields, ENV.ECPAY_HASH_KEY, ENV.ECPAY_HASH_IV));
    eq('端點 = 綠界 stage CreditCardPeriodAction', req.action, 'https://payment-stage.ecpay.com.tw/Cashier/CreditCardPeriodAction');
    const reqProd = await buildReAuthRequest({ merchantTradeNo: 'X' }, Object.assign({}, ENV, { ECPAY_ENV: 'prod' }));
    eq('prod 端點正確', reqProd.action, 'https://payment.ecpay.com.tw/Cashier/CreditCardPeriodAction');
  }

  // ── 1b. buildReAuthRequest 防呆 ──
  console.log('\n[1b] buildReAuthRequest — 防呆（缺單號 / 缺金鑰丟錯）');
  {
    let threwNoTrade = false;
    try { await buildReAuthRequest({}, ENV); } catch (e) { threwNoTrade = true; }
    ok('缺 merchantTradeNo → throw', threwNoTrade);
    let threwNoKey = false;
    try { await buildReAuthRequest({ merchantTradeNo: 'X' }, { ECPAY_ENV: 'stage' }); } catch (e) { threwNoKey = true; }
    ok('缺金鑰 → throw', threwNoKey);
  }

  // ── 2. 綠界受理（RtnCode=1）→ 真呼叫 + accepted:true（但 charged:false） ──
  console.log('\n[2] 綠界受理 → 真呼叫綠界 + accepted:true + charged:false（受理 ≠ 扣成功）');
  {
    const fakeFetch = makeFakeFetch(async () => ({ status: 200, text: async () => ecpayResp({ RtnCode: '1', RtnMsg: 'Success', MerchantTradeNo: 'BS_sub_001' }) }));
    const res = await handleReAuth({ input: { merchantTradeNo: 'BS_sub_001' }, env: ENV, fetchImpl: fakeFetch });

    ok('回 ok:true', res.ok === true);
    ok('accepted:true（綠界受理）', res.accepted === true);
    ok('charged:false（扣成功與否要等 webhook）', res.charged === false);
    eq('真的呼叫了綠界 1 次', fakeFetch.calls.length, 1);
    eq('打的是 CreditCardPeriodAction 端點', fakeFetch.calls[0].url, 'https://payment-stage.ecpay.com.tw/Cashier/CreditCardPeriodAction');
    eq('method POST', fakeFetch.calls[0].init.method, 'POST');
    ok('body 含 Action=ReAuth', fakeFetch.calls[0].init.body.indexOf('Action=ReAuth') >= 0);
    ok('body 含簽章', fakeFetch.calls[0].init.body.indexOf('CheckMacValue=') >= 0);
    eq('帶回 rtnCode', res.rtnCode, '1');
  }

  // ── 3. 綠界回失敗（RtnCode != 1）→ accepted:false + 告警 ──
  console.log('\n[3] 綠界回失敗（RtnCode != 1）→ accepted:false（沒受理）+ 告警');
  {
    const alerts = [];
    const fakeFetch = makeFakeFetch(async () => ({ status: 200, text: async () => ecpayResp({ RtnCode: '10100058', RtnMsg: '額度不足' }) }));
    const res = await handleReAuth({ input: { merchantTradeNo: 'BS_sub_002' }, env: ENV, fetchImpl: fakeFetch, onAlert: async (e) => alerts.push(e) });

    ok('回 ok:false', res.ok === false);
    ok('accepted:false', res.accepted === false);
    ok('charged:false', res.charged === false);
    eq('有試著呼叫綠界', fakeFetch.calls.length, 1);
    eq('帶回綠界 rtnCode', res.rtnCode, '10100058');
    eq('帶回綠界 rtnMsg', res.rtnMsg, '額度不足');
    ok('發 reauth_rejected 告警', alerts.some((a) => a.type === 'reauth_rejected'));
  }

  // ── 4. 網路錯誤 / 綠界不可達 → accepted:false + 502 + 告警 ──
  console.log('\n[4] 綠界不可達（fetch throw）→ accepted:false + 502 + 告警');
  {
    const alerts = [];
    const fakeFetch = makeFakeFetch(async () => { throw new Error('network down'); });
    const res = await handleReAuth({ input: { merchantTradeNo: 'BS_sub_003' }, env: ENV, fetchImpl: fakeFetch, onAlert: async (e) => alerts.push(e) });

    ok('回 ok:false', res.ok === false);
    ok('accepted:false', res.accepted === false);
    ok('charged:false', res.charged === false);
    eq('status 502', res.status, 502);
    ok('發 reauth_network_error 告警', alerts.some((a) => a.type === 'reauth_network_error'));
  }

  // ── 5. HTTP 非 2xx → accepted:false ──
  console.log('\n[5] 綠界 HTTP 500 → accepted:false（沒受理）');
  {
    const fakeFetch = makeFakeFetch(async () => ({ status: 500, text: async () => 'Internal Error' }));
    const res = await handleReAuth({ input: { merchantTradeNo: 'BS_sub_004' }, env: ENV, fetchImpl: fakeFetch });
    ok('回 ok:false', res.ok === false);
    ok('accepted:false', res.accepted === false);
    ok('charged:false', res.charged === false);
  }

  // ── 6. 【最關鍵紅線】handleReAuth 絕不解鎖 / 絕不碰 billing / 絕不清 dunning ──
  console.log('\n[6] 紅線：受理 ≠ 扣成功 → handleReAuth 絕不解鎖、絕不碰 billing、絕不清 dunning');
  {
    // 介面層證明：handleReAuth 根本不收 store——沒有任何寫 billing 的能力。
    ok('handleReAuth 簽名不含 store（從介面就杜絕改 billing）',
      String(handleReAuth).indexOf('args.store') === -1 && String(handleReAuth).indexOf('.setBilling') === -1);

    // 行為層證明：就算把一個 past_due（dunning 中）的訂閱放在 store，
    // 呼叫 handleReAuth 並回 RtnCode=1（綠界受理），store 裡的 billing【完全不變】。
    const store = new InMemoryStore();
    const before = {
      plan: 'pro',
      billingStatus: 'past_due',
      merchantTradeNo: 'BS_sub_lock',
      paymentIssue: true,
      lockedReason: null,
      dunning: { failCount: 2, firstFailedAt: 1, graceUntil: 999, seenKeys: ['a', 'b'] },
    };
    await store.setBilling('u_locked', before);

    const fakeFetch = makeFakeFetch(async () => ({ status: 200, text: async () => ecpayResp({ RtnCode: '1', RtnMsg: 'Success' }) }));
    const res = await handleReAuth({ input: { merchantTradeNo: 'BS_sub_lock' }, env: ENV, fetchImpl: fakeFetch });

    ok('綠界受理（accepted:true）', res.accepted === true);
    ok('但仍 charged:false', res.charged === false);

    // store 完全沒被動到——這才是紅線：受理不解鎖。
    const after = await store.getBilling('u_locked');
    eq('billingStatus 仍 past_due（沒被偷偷救回 active）', after.billingStatus, 'past_due');
    ok('paymentIssue 仍 true（沒被清）', after.paymentIssue === true);
    eq('dunning.failCount 仍 2（沒被清 dunning）', after.dunning.failCount, 2);
    eq('graceUntil 沒動', after.dunning.graceUntil, 999);
    // 回傳值也不該夾帶任何 billing / unlock / plan 欄位
    ok('回傳無 billing 欄位', res.billing === undefined);
    ok('回傳無 unlocked 欄位', res.unlocked === undefined);
    ok('回傳無 plan 欄位', res.plan === undefined);
  }

  // ── 7. 防呆 — 缺單號 / 缺金鑰 / 缺 fetch ──
  console.log('\n[7] 防呆 — 缺 merchantTradeNo / 缺金鑰 / 缺 fetchImpl');
  {
    const fakeFetch = makeFakeFetch(async () => ({ status: 200, text: async () => ecpayResp({ RtnCode: '1' }) }));
    const rNoTrade = await handleReAuth({ input: {}, env: ENV, fetchImpl: fakeFetch });
    eq('缺 merchantTradeNo → 400', rNoTrade.status, 400);
    ok('缺單號也 accepted:false', rNoTrade.accepted === false);
    eq('缺單號沒呼叫綠界', fakeFetch.calls.length, 0);

    const rNoKey = await handleReAuth({ input: { merchantTradeNo: 'X' }, env: { ECPAY_ENV: 'stage' }, fetchImpl: fakeFetch });
    eq('缺金鑰 → 500', rNoKey.status, 500);
    ok('缺金鑰 accepted:false + charged:false', rNoKey.accepted === false && rNoKey.charged === false);

    const rNoFetch = await handleReAuth({ input: { merchantTradeNo: 'X' }, env: ENV });
    eq('缺 fetchImpl → 500', rNoFetch.status, 500);
    ok('缺 fetch accepted:false', rNoFetch.accepted === false);
  }

  // ── 8. toFormBody / parseActionResponse 工具 ──
  console.log('\n[8] 工具函式');
  {
    const body = toFormBody({ A: '1', B: 'x y', Action: 'ReAuth' });
    ok('toFormBody 編碼空白', body.indexOf('B=x+y') >= 0 || body.indexOf('B=x%20y') >= 0);
    ok('toFormBody 含 Action=ReAuth', body.indexOf('Action=ReAuth') >= 0);
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
