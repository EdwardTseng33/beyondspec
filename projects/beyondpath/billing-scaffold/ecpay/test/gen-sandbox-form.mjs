/**
 * 產生「綠界測試環境定期定額」自動送出表單（sandbox 手動實測用）
 * ------------------------------------------------------------------
 * 用途：把建單模組產出的【已簽章欄位】組成一份 HTML <form>，auto-submit 到
 *       綠界 STAGE 結帳頁，讓人用綠界官方測試卡實際跑一筆定期定額授權。
 *
 * ⚠️ 只用【綠界官方公開測試商店】憑證（MerchantID 2000132 / 公開 stage 金鑰），
 *    這是綠界文件公開的 demo 帳號——【不是 Edward 的真商店、不是真金鑰、不碰真錢】。
 *    Edward 的真 MerchantID 3502366 + 真金鑰永遠只進 Worker secret，本檔不碰。
 *
 * 跑法：node test/gen-sandbox-form.mjs > /tmp/ecpay-sandbox.html
 *       然後用瀏覽器開該檔 → 會自動跳轉綠界 stage → 用測試卡 4311-9522-2222-2222 刷。
 *
 * 綠界官方公開測試商店（文件常用 demo，stage 環境）：
 *   MerchantID = 2000132
 *   HashKey    = 5294y06JbISpM5x9
 *   HashIV     = v77hoKGq4kWxNNIS
 *   （見綠界技術文件 / SDK 範例。stage 專用、公開、非生產。）
 * 測試卡（官方）：4311-9522-2222-2222，安全碼任意 3 碼，到期日填未來。
 */

import { genCheckMacValue } from '../src/checkmac.js';

// —— 綠界公開測試商店（stage demo，非 Edward 真帳號）——
const DEMO = {
  MerchantID: '2000132',
  HashKey: '5294y06JbISpM5x9',
  HashIV: 'v77hoKGq4kWxNNIS',
  endpoint: 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5',
};

function fmtEcpayDate(d) {
  const tw = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  const p2 = (n) => String(n).padStart(2, '0');
  return tw.getUTCFullYear() + '/' + p2(tw.getUTCMonth() + 1) + '/' + p2(tw.getUTCDate()) + ' ' +
    p2(tw.getUTCHours()) + ':' + p2(tw.getUTCMinutes()) + ':' + p2(tw.getUTCSeconds());
}

function genTradeNo() {
  return ('BS' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)).slice(0, 20);
}

async function main() {
  const amount = 499;
  const params = {
    MerchantID: DEMO.MerchantID,
    MerchantTradeNo: genTradeNo(),
    MerchantTradeDate: fmtEcpayDate(new Date()),
    PaymentType: 'aio',
    TotalAmount: amount,
    TradeDesc: 'BeyondSpec Subscription Test',
    ItemName: 'BeyondSpec PRO 訂閱(測試)',
    // 測試環境用綠界文件常見的可達 echo URL；真環境會指向 Worker /ecpay/webhook。
    ReturnURL: 'https://payment-stage.ecpay.com.tw/EcpayInfo/Index',
    OrderResultURL: 'https://payment-stage.ecpay.com.tw/EcpayInfo/Index',
    ChoosePayment: 'Credit',
    EncryptType: 1,
    PeriodAmount: amount,
    PeriodType: 'M',
    Frequency: 1,
    ExecTimes: 12,
    PeriodReturnURL: 'https://payment-stage.ecpay.com.tw/EcpayInfo/Index',
    CustomField1: 'sandbox_test_uid',
  };
  params.CheckMacValue = await genCheckMacValue(params, DEMO.HashKey, DEMO.HashIV);

  const inputs = Object.keys(params)
    .map((k) => '  <input type="hidden" name="' + k + '" value="' + String(params[k]).replace(/"/g, '&quot;') + '">')
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="zh-Hant"><head><meta charset="utf-8"><title>ECPay Sandbox 定期定額測試</title></head>
<body>
<p>自動送出到綠界 STAGE 結帳頁（測試卡 4311-9522-2222-2222 / 任意 3 碼安全碼 / 未來到期日）…</p>
<form id="ecpay" method="post" action="${DEMO.endpoint}">
${inputs}
</form>
<script>document.getElementById('ecpay').submit();</script>
</body></html>`;

  process.stdout.write(html);
}

main().catch((e) => { console.error(e); process.exit(1); });
