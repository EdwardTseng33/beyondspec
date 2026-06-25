/**
 * CheckMacValue 驗章模組 — 單元測試
 * ------------------------------------------------------------------
 * 目的（卡西法 de-risk 風險 #2）：拿綠界【官方文件範例值】逐字比對，
 *   把「.NET URLEncode + 排序 + 小寫 + SHA256」這條最易隱晦卡死的鏈釘死。
 *   B（驗章）沒綠之前不往下做。
 *
 * 跑法：  node test/checkmac.test.mjs
 * 退出碼：全過 = 0；任一 fail = 1（給 CI / Gate 1 判斷）。
 *
 * ── 範例來源（已用 WebFetch 對綠界官方文件逐字確認，2026-06-25）──
 *   綠界官方「CheckMacValue 檢查碼機制」文件 https://developers.ecpay.com.tw/?p=2902
 *   給定：
 *     HashKey = pwFHCqoQZGmho4w6
 *     HashIV  = EkRm7iFT261dpevs
 *     參數 10 個（見 OFFICIAL.params）
 *   官方公開的「URLEncode + 轉小寫」字串 = EXPECTED_RAW（逐字）
 *   官方公開的最終 CheckMacValue（SHA256 大寫）= OFFICIAL_CMV
 *
 *   ⚠️ 關鍵確認：綠界的 URLEncode 是對【整串】編碼——連 key/value 之間的
 *      '=' 與 '&' 也一起編成 %3d / %26（不是只編值）。本測試的 EXPECTED_RAW
 *      即官方原文，證明本模組 buildRawString 的整串編碼行為正確。
 */

import {
  dotNetUrlEncode,
  buildRawString,
  genCheckMacValue,
  verifyCheckMacValue,
} from '../src/checkmac.js';

// ── 迷你測試框架（零相依） ──
let passed = 0;
let failed = 0;
const failures = [];

function eq(name, actual, expected) {
  if (actual === expected) {
    passed++;
    console.log('  ✓ ' + name);
  } else {
    failed++;
    failures.push(name);
    console.log('  ✗ ' + name);
    console.log('     expected: ' + JSON.stringify(expected));
    console.log('     actual:   ' + JSON.stringify(actual));
  }
}

function ok(name, cond) {
  eq(name, !!cond, true);
}

// ── 綠界官方範例（A1 正常簽章 · 官方文件逐字確認） ──
const OFFICIAL = {
  HashKey: 'pwFHCqoQZGmho4w6',
  HashIV: 'EkRm7iFT261dpevs',
  params: {
    ChoosePayment: 'ALL',
    EncryptType: '1',
    ItemName: 'Apple iphone 15',
    MerchantID: '3002607',
    MerchantTradeDate: '2023/03/12 15:30:23',
    MerchantTradeNo: 'ecpay20230312153023',
    PaymentType: 'aio',
    ReturnURL: 'https://www.ecpay.com.tw/receive.php',
    TotalAmount: '30000',
    TradeDesc: '促銷方案',
  },
};

// 官方公開「URLEncode + 轉小寫」字串（含 %3d/%26 整串編碼）。任一步錯 → 此行不相等。
const EXPECTED_RAW =
  'hashkey%3dpwfhcqoqzgmho4w6%26choosepayment%3dall%26encrypttype%3d1%26itemname%3dapple+iphone+15%26merchantid%3d3002607%26merchanttradedate%3d2023%2f03%2f12+15%3a30%3a23%26merchanttradeno%3decpay20230312153023%26paymenttype%3daio%26returnurl%3dhttps%3a%2f%2fwww.ecpay.com.tw%2freceive.php%26totalamount%3d30000%26tradedesc%3d%e4%bf%83%e9%8a%b7%e6%96%b9%e6%a1%88%26hashiv%3dekrm7ift261dpevs';

// 官方公開最終 CheckMacValue（SHA256 大寫）。
const OFFICIAL_CMV = '6C51C9E6888DE861FD62FB1DD17029FC742634498FD813DC43D4243B5685B840';

async function run() {
  console.log('\nCheckMacValue 驗章模組 · 單元測試\n');

  // ── Group 1: dotNetUrlEncode 字元行為（.NET vs encodeURIComponent 差異） ──
  console.log('[1] dotNetUrlEncode — .NET 字元校正');
  eq('空白 → +（非 %20）', dotNetUrlEncode('a b'), 'a+b');
  eq('波浪號 ~ → %7e（.NET 會編碼）', dotNetUrlEncode('a~b'), 'a%7eb');
  eq('! 保留字面', dotNetUrlEncode('a!b'), 'a!b');
  eq('* 保留字面', dotNetUrlEncode('a*b'), 'a*b');
  eq('( ) 保留字面', dotNetUrlEncode('(a)'), '(a)');
  eq("' 保留字面（apostrophe）", dotNetUrlEncode("a'b"), "a'b");
  eq('- _ . 保留字面', dotNetUrlEncode('a-_.b'), 'a-_.b');
  eq('/ → %2F（小寫前）', dotNetUrlEncode('a/b'), 'a%2Fb');
  eq(': → %3A（小寫前）', dotNetUrlEncode('a:b'), 'a%3Ab');
  eq('= → %3D（整串編碼，含分隔符）', dotNetUrlEncode('a=b'), 'a%3Db');
  eq('& → %26（整串編碼，含分隔符）', dotNetUrlEncode('a&b'), 'a%26b');
  eq('中文 編碼（促）', dotNetUrlEncode('促'), '%E4%BF%83');

  // ── Group 2: buildRawString — 排序 + 組字串 + 整串編碼 + 小寫（官方範例逐字） ──
  console.log('\n[2] buildRawString — 對綠界官方範例字串逐字比對');
  const raw = buildRawString(OFFICIAL.params, OFFICIAL.HashKey, OFFICIAL.HashIV);
  eq('待雜湊字串 === 官方公開值（整串 URLEncode）', raw, EXPECTED_RAW);

  // ── Group 3: genCheckMacValue — 最終 SHA256 大寫（官方範例） ──
  console.log('\n[3] genCheckMacValue — 最終 CheckMacValue 對官方值');
  const cmv = await genCheckMacValue(OFFICIAL.params, OFFICIAL.HashKey, OFFICIAL.HashIV);
  eq('CheckMacValue === 官方公開值', cmv, OFFICIAL_CMV);
  ok('CheckMacValue 為 64 字大寫 hex', /^[0-9A-F]{64}$/.test(cmv));

  // ── Group 4: verifyCheckMacValue — 驗證收到通知（紅線 1 核心） ──
  console.log('\n[4] verifyCheckMacValue — webhook 驗章');
  // 4a 合法通知（帶正確 CheckMacValue）→ 通過
  const goodNotify = Object.assign({}, OFFICIAL.params, { CheckMacValue: cmv });
  ok('合法通知 → 驗章通過', await verifyCheckMacValue(goodNotify, OFFICIAL.HashKey, OFFICIAL.HashIV));

  // 4b 大小寫不敏感（綠界回大寫，模擬小寫也要過）
  const lowerNotify = Object.assign({}, OFFICIAL.params, { CheckMacValue: cmv.toLowerCase() });
  ok('小寫 CheckMacValue → 仍通過（大小寫不敏感）', await verifyCheckMacValue(lowerNotify, OFFICIAL.HashKey, OFFICIAL.HashIV));

  // 4c 偽造通知（改一個欄位、CheckMacValue 沒跟著改）→ 必須擋下（sandbox A2 核心）
  const forged = Object.assign({}, OFFICIAL.params, { TotalAmount: '1', CheckMacValue: cmv });
  ok('偽造通知（改金額 30000→1）→ 驗章失敗（被丟棄）', !(await verifyCheckMacValue(forged, OFFICIAL.HashKey, OFFICIAL.HashIV)));

  // 4d 缺 CheckMacValue → 失敗
  ok('缺 CheckMacValue → 失敗', !(await verifyCheckMacValue(OFFICIAL.params, OFFICIAL.HashKey, OFFICIAL.HashIV)));

  // 4e 用錯金鑰（模擬 sandbox/prod 金鑰寫反，spec §3 警告的 A3）→ 失敗
  ok('用錯 HashKey → 驗章失敗（A3 環境金鑰切換）', !(await verifyCheckMacValue(goodNotify, 'WRONGKEY00000000', OFFICIAL.HashIV)));

  // ── Group 5: 排序穩定性 — 參數順序不影響結果 ──
  console.log('\n[5] 參數順序無關性');
  const shuffled = {
    TradeDesc: '促銷方案',
    ReturnURL: 'https://www.ecpay.com.tw/receive.php',
    PaymentType: 'aio',
    ItemName: 'Apple iphone 15',
    MerchantTradeNo: 'ecpay20230312153023',
    MerchantTradeDate: '2023/03/12 15:30:23',
    MerchantID: '3002607',
    TotalAmount: '30000',
    EncryptType: '1',
    ChoosePayment: 'ALL',
  };
  const cmv2 = await genCheckMacValue(shuffled, OFFICIAL.HashKey, OFFICIAL.HashIV);
  eq('打亂順序 → 同一 CheckMacValue', cmv2, OFFICIAL_CMV);

  // ── Group 6: 空值欄位被排除（不參與計算） ──
  console.log('\n[6] 空值/undefined 欄位排除');
  const withEmpty = Object.assign({}, OFFICIAL.params, { CustomField1: '', CustomField2: undefined, CustomField3: null });
  const cmv3 = await genCheckMacValue(withEmpty, OFFICIAL.HashKey, OFFICIAL.HashIV);
  eq('空字串/undefined/null 欄位被排除 → 同官方值', cmv3, OFFICIAL_CMV);

  // ── Group 7: CheckMacValue 自身不參與計算 ──
  console.log('\n[7] CheckMacValue 欄位自身被排除');
  const withSelf = Object.assign({}, OFFICIAL.params, { CheckMacValue: 'WHATEVER_SHOULD_BE_IGNORED' });
  const cmv4 = await genCheckMacValue(withSelf, OFFICIAL.HashKey, OFFICIAL.HashIV);
  eq('帶 CheckMacValue 欄位 → 仍同官方值（自身排除）', cmv4, OFFICIAL_CMV);

  // ── 結算 ──
  console.log('\n' + '='.repeat(52));
  console.log('結果： ' + passed + ' passed, ' + failed + ' failed');
  if (failed > 0) {
    console.log('FAIL: ' + failures.join(', '));
    process.exit(1);
  } else {
    console.log('ALL GREEN ✓');
    process.exit(0);
  }
}

run().catch((e) => {
  console.error('測試執行錯誤：', e);
  process.exit(1);
});
