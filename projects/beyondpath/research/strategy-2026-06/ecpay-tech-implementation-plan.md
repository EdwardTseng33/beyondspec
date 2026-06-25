# BeyondSpec × 綠界定期定額 — 技術實作計畫

> 2026-06-25 · 城堡實作手（卡西法接力／本份由實作手調研撰寫）· 階段二金流批
> 性質：**技術實作計畫 doc**。不碰任何 production code（app.html / Worker）。
> 依據：扣住沙利曼 `ecpay-integration-trust-spec.md`（3 紅線 / CheckMacValue 演算法 / sandbox 27 case）——本份**不重抄**安全規格，只補「技術怎麼接 + 哪塊先開工 + 哪塊等開通 + 工時」。
> 調研方法：WebSearch + WebFetch 查綠界官方開發者文件（developers.ecpay.com.tw）+ 官方 support + 官方公告，每條附來源。**前一手用 Chrome 互動導航卡住——本份全程用 WebSearch/WebFetch，未卡。**

---

## 🚦 0. 兩個決定整個方案的紅綠燈（最重要，放最前面）

### 🟢 Q1 · 個人（自然人）綠界特約商店「能不能做信用卡定期定額」？— **綠燈（有但書）**

**結論：能。** 綠界個人會員（個人戶，限以登記負責人身分）支援的信用卡收款方式**明列包含「定期定額」**，不是只有公司戶能做。

**證據鏈（三方獨立佐證，不靠單一來源）：**
- 綠界官方產品頁「信用卡綁卡服務 / 定期定額」說明定期定額用於「影音串流、雲端服務等訂閱制商品，或定期捐款、學費」——未限定公司戶。([綠界 IntroRecurringPayment](https://www.ecpay.com.tw/IntroRecurringPayment))
- 金流串接服務商整理：「個人會員支援 VISA、MasterCard、JCB 信用卡**一次付清、定期定額**」。([ShopStore 教學](https://shopstore.tw/teachinfo/359) / [EasyStore 說明](https://support.easystore.co/zh-tw/article/ecpay-goimkq/))
- 綠界個人會員定位：「適用於個人賣家、部落客或直播主」「僅需註冊即能收款，不用額外收費，僅付手續費」——抖內 / 訂閱皆在此範圍。([Medium 實況主收款教學](https://medium.com/gcake-podcast-tutorial/%E8%81%BD%E7%9C%BE%E6%8A%96%E5%85%A7%E8%A8%AD%E5%AE%9A-ecpay-%E7%B6%A0%E7%95%8C%E7%A7%91%E6%8A%80-%E5%AF%A6%E6%B3%81%E4%B8%BB%E6%94%B6%E6%AC%BE-48db085f0255))

**但書（Edward 申辦時要逐項確認，城堡無法代勞）：**
1. **個人戶 → 特約商店要走升級**：「若註冊的是個人（限登記負責人），需先**升級為商務會員**，再申請升特約商店。」個人/商務會員預設是「未議約的一般會員」，要**付年費議約成特約會員**才能調費率、提高額度、開分期等。Edward 商店代號 3502366 + 已有金流合約 → 大機率已過這關，但**「定期定額」這個 feature 是否已在該帳號開通要單獨確認**。([ShopLine 申請介紹](https://support.shoplineapp.com/hc/zh-tw/articles/215046886) / [ShopStore](https://shopstore.tw/teachinfo/359))
2. **額度天花板**：個人戶信用卡 + 非信用卡 + 超商代收**合併月限額 30 萬 NTD**。訂閱規模做大（例如 PRO 499 × 600 戶 ≈ 月 30 萬）會頂到上限——要嘛升特約調高額度、要嘛改公司戶。**這是商業天花板、不是技術天花板，但要先知道。**([搜尋彙整 · ECPay 個人會員額度](https://support.easystore.co/zh-tw/article/ecpay-goimkq/))
3. **手續費**：個人會員國內卡 **2.75%/筆**、海外卡 3.5%/筆（每筆最低 5 元）。議成特約可降。這進財務模型、不擋技術。([綠界服務費率表](https://www.ecpay.com.tw/Business/payment_fees))

> **要 Edward 問綠界客服 / 後台確認的一句話**：「商店代號 3502366 這個帳號，**信用卡定期定額（CreditCardPeriod）功能是否已開通可用**？個人戶身分有無額外限制？」——這是 critical path 起點，建議今天就問。

---

### 🟡 Q2 · 定期定額能不能「中途改每期扣款金額」而不用客戶重刷卡？— **黃燈：可以，但只能後台手動、API 改不了**

這題答案有兩層，**決定 Team 合併計費（加減員工改金額）的做法**，必須講清楚：

**🟢 第一層（好消息）：改金額「不需要客戶重新授權」——後台可改。**
綠界官方 support 白紙黑字：「定期定額訂單進行中，經與消費者商議過後**可隨時變更訂單的金額、扣款週期頻率、次數**等。」後台 [編輯] 鈕可改：**授權金額 / 信用卡效期 / 扣款週期頻率 / 授權次數 / 消費者手機**。改金額後綠界只要求商家設「下一次執行日」，**不需要消費者重新刷卡授權**，從指定執行日自動生效。
- 來源：([綠界 support · 信用卡定期定額管理 16214](https://support.ecpay.com.tw/16214/))
- 2024-04-08 官方公告再強化：新增「啟用 / 暫停 / 終止」狀態 + 編輯訂單功能（可調授權金額、週期、次數、卡效期、手機）。([綠界公告 nID=5311](https://www.ecpay.com.tw/Announcement/DetailAnnouncement?nID=5311))

**🔴 第二層（關鍵限制）：這個「改金額」只在綠界廠商後台網頁 UI 能做，沒有對應的 API。**
查綠界官方開發者文件「信用卡定期定額訂單作業 API」（`CreditCardPeriodAction`），它**只暴露兩個 Action**：
| Action 值 | 作用 |
|---|---|
| `ReAuth` | 最近一次授權失敗時，重新授權 |
| `Cancel` | 取消（停止）該筆定期定額 |

**沒有 `Edit` / `ChangeAmount` / 改 `PeriodAmount` 的 API 參數。** 官方公告也明寫編輯功能位於「廠商後台 > 信用卡收單 > 定期定額查詢」，**「無 API access，僅 web 介面」**。
- 來源：([ECPay Developers · CreditCardPeriodAction 16618](https://developers.ecpay.com.tw/?p=16618)) / ([綠界公告 nID=5311](https://www.ecpay.com.tw/Announcement/DetailAnnouncement?nID=5311))
- 補強限制：定期定額**後續每期固定授權金額 = 首次 `PeriodAmount`**，且每期 `TotalAmount` 必須等於 `PeriodAmount`（綠界 All-In-One 文件明訂）。([ECPay Developers · Periodic 16470](https://developers.ecpay.com.tw/16470/))

**🟡 對 Team 合併計費的結論（綜合判斷）：**
- 「中途改金額不用客戶重刷」這件事 **產品上可行**（綠界後台做得到）。
- 但**沒辦法讓 BeyondSpec 後端程式自動改金額**——要嘛 (A) Edward / 客服**手動進綠界後台改**，要嘛 (B) 走沙利曼紅線 2.6 寫的「**停舊授權（Cancel）→ 建新總額授權**」、讓 owner 重新確認一次扣款金額（這條會要客戶重走一次結帳授權）。
- **MVP 建議**：Team「加減員工自動改月費」**不要列進第一版自動化**。第一版 Team 用「固定 seat 級距」或「人工調整（後台改 + 寄信告知）」頂著；全自動 proration（按比例分攤）等之後評估值不值得做（綠界 API 不支援 = 要嘛手動、要嘛重授權，兩條都有 UX 摩擦）。**這是我最想先幫 Edward 擋下的過度設計。**

> 一句話總結 Q2：**改金額不用重刷卡（綠燈）、但只能後台手動改、程式自動改不到（紅燈）→ Team 自動 proration 別進 MVP。**

---

## 1. 定期定額技術流程（逐步 + sample 片段）

> 安全風險點逐步標注見沙利曼 spec §4，本節聚焦「技術怎麼接 + 端點 + 參數 + code 骨架」。
> 全程 ES5（Worker 端可用現代 JS；前端 app.html 維持 `var`/`function`，無 `const`/`let`/arrow）。

### 端點（寫死成常數，依環境切換）
| 用途 | Stage（sandbox） | Production |
|---|---|---|
| 建立定期定額訂單（結帳頁） | `https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5` | `https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5` |
| 訂單作業（ReAuth / Cancel） | `https://payment-stage.ecpay.com.tw/Cashier/CreditCardPeriodAction` | `https://payment.ecpay.com.tw/Cashier/CreditCardPeriodAction` |
| 訂單查詢（對帳補漏） | `https://payment-stage.ecpay.com.tw/Cashier/QueryCreditCardPeriodInfo` | `https://payment.ecpay.com.tw/Cashier/QueryCreditCardPeriodInfo` |

來源：([ECPay Developers 2868](https://developers.ecpay.com.tw/?p=2868)) / ([16618](https://developers.ecpay.com.tw/?p=16618))

### 建單關鍵參數（`ChoosePayment=Credit` + 下列定期欄位）
| 欄位 | 型別 | 必填 | 意義 |
|---|---|---|---|
| `PeriodAmount` | Int | ✅ | 每期要授權扣款的金額（整數、僅 NTD、無小數）；**必須 = `TotalAmount`** |
| `PeriodType` | String(1) | ✅ | 週期單位：`D` 天 / `M` 月 / `Y` 年 |
| `Frequency` | Int | ✅ | 多久扣一次（日 1–365 / 月 1–12 / 年限 1） |
| `ExecTimes` | Int | ✅ | 總扣款期數（**最少 2**；上限依 PeriodType） |
| `PeriodReturnURL` | String(200) | 建議填 | 每期扣款結果綠界 server POST 回來的端點（→ 指向 Worker） |
| `MerchantTradeNo` | String(20) | ✅ | 每筆唯一訂單編號（Worker 端產，帶 uid 線索） |
| `CustomField1` | String | 建議 | 帶 uid，webhook 回來定位 Firestore（納入 CheckMacValue 計算，不可竄改） |

> 月訂閱範例：`PeriodType=M`、`Frequency=1`（每 1 個月）、`ExecTimes=12`（先簽 12 期，到期前再續）、`PeriodAmount=499`。
> ⚠️ `ExecTimes` 有上限 → 不是「無限訂閱」，要設「到期前自動續簽新一輪授權」或「快到期寄信請續訂」。這條要進排程。
> 來源：([ECPay Developers 2868](https://developers.ecpay.com.tw/?p=2868)) / ([16470](https://developers.ecpay.com.tw/16470/))

### 流程 8 步（端到端）

```
Step 1 [前端 app.html] openSubscribeFlow() 用戶選 PRO/MAX
  → fetch Worker POST /ecpay/create-order  body: { plan:'pro', uid:<firebase uid> }
  ⚠️ 前端只送 plan key + uid，絕不送金額（金額 server 端查 PLAN_CATALOG，防竄改）

Step 2 [Worker] 依 plan 查金額 → 產唯一 MerchantTradeNo → 簽 CheckMacValue
  → 回前端一份「已簽章的綠界表單欄位」（不回 HashKey/HashIV）

Step 3 [前端] 用 Step 2 回的欄位組一個 <form> auto-submit 到綠界結帳頁
  → 用戶在【綠界域名】輸入卡號（app/Worker 全程不碰卡號，PCI = SAQ-A）

Step 4 [綠界 → Worker] 首次授權成功，綠界 server POST 到 PeriodReturnURL = Worker /ecpay/webhook
  → Worker 重算 CheckMacValue 驗章（演算法見沙利曼 spec §3）
  → 驗章失敗 → 丟棄 + 告警；驗章過且 RtnCode==1 → 繼續

Step 5 [Worker] 驗章過 → idempotent 檢查（MerchantTradeNo 是否已處理）
  → 沒處理過 → 寫 Firestore users/{uid}/billing { plan, subscriptionId(GwsrPeriod), status:'active', paidAt, nextBillingAt }
  → 產收據（§4）→ 回綠界純文字 1|OK

Step 6 [前端] onSnapshot 監聽 Firestore billing 變化 → plan 翻 pro → 解鎖模組 + 刷 UI
  ⚠️ 前端 code 裡【不得有】任何「收到轉址就 state.plan='pro'」路徑（紅線 1）

Step 7 [每月綠界自動扣款] 第 2 期起綠界排程扣款 → 結果 POST PeriodReturnURL → 回 Step 4 驗章
  → 失敗：綠界連 6 次失敗自動取消；Worker 收失敗通知 → 寄信請更新卡 + 寬限期、不立刻斷

Step 8 [取消] 用戶按取消 → 前端 fetch Worker /ecpay/cancel
  → Worker POST 綠界 CreditCardPeriodAction { Action:'Cancel' } → 綠界確認停用後才寫 status:'cancelled'
  ⚠️ 必真呼叫綠界停扣（紅線 2），不可只改自家 DB
```

### Worker 端建單 sample（骨架，示意 CheckMacValue 串接位置）

```javascript
// Cloudflare Worker — /ecpay/create-order
// 金鑰只在 Worker runtime 讀，永不回前端
const PLAN_CATALOG = { pro: 499, max: 999 };           // 金額 server 端權威
const MERCHANT_ID  = '3502366';                          // 公開識別碼，可寫死
const AIO_URL = {                                        // 端點寫死，防 open-redirect
  stage: 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5',
  prod:  'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5'
};

async function createOrder(req, env) {
  const { plan, uid } = await req.json();
  const amount = PLAN_CATALOG[plan];                     // 不信前端金額
  if (!amount || !uid) return new Response('bad request', { status: 400 });

  const tradeNo = 'BS' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  const params = {
    MerchantID: MERCHANT_ID,
    MerchantTradeNo: tradeNo,
    MerchantTradeDate: fmtEcpayDate(new Date()),         // yyyy/MM/dd HH:mm:ss
    PaymentType: 'aio',
    TotalAmount: amount,
    TradeDesc: 'BeyondSpec Subscription',
    ItemName: 'BeyondSpec ' + plan.toUpperCase(),
    ReturnURL: env.WORKER_BASE + '/ecpay/webhook',       // server-to-server，驗章用
    OrderResultURL: env.APP_BASE + '/path/app/#sub-pending', // 前端落地頁，只顯示處理中
    ChoosePayment: 'Credit',
    // —— 定期定額專屬 ——
    PeriodAmount: amount,                                 // 必須 = TotalAmount
    PeriodType: 'M',
    Frequency: 1,
    ExecTimes: 12,
    PeriodReturnURL: env.WORKER_BASE + '/ecpay/webhook', // 每期扣款結果
    CustomField1: uid                                    // webhook 回來定位用戶
  };
  // CheckMacValue 演算法逐步見沙利曼 spec §3（排序→組字串→.NET URLEncode→小寫→SHA256→大寫）
  params.CheckMacValue = genCheckMacValue(params, env.ECPAY_HASH_KEY, env.ECPAY_HASH_IV);

  // 回前端「已簽章欄位」，前端用它組 form auto-submit（前端不持有金鑰）
  return Response.json({ action: AIO_URL[env.ECPAY_ENV], fields: params });
}
```

> `genCheckMacValue` 的 .NET URLEncode 校正（`!*()'` 與 JS `encodeURIComponent` 行為不同）是**最易出錯處**——照沙利曼 spec §3 轉換表寫，sandbox A1 不過時 99% 是這裡。

---

## 2. Worker 架構決策

### 2.1 webhook 放現有 Worker 還是新開？→ **放現有 Worker，新增路由**

**建議：沿用 `path-ai-proxy.edwardt0303-281.workers.dev`（app.html line 12466 已部署），新增 `/ecpay/*` 路由群。**

理由：
1. 沙利曼 spec 架構事實 A1 已定調：「Worker 是 server 端唯一可信執行環境，綠界 webhook / 驗章 / 金鑰 / 解鎖全掛 Worker，不另開後端。」
2. 現有 Worker 已有 Firebase / Firestore 寫入能力（PATH_AI 已走它）→ 解鎖寫 billing 直接複用，不重建連線。
3. 一個 Worker 一個 deploy pipeline，維運面少一套。

**但要做路由隔離**：`/ecpay/create-order`、`/ecpay/webhook`、`/ecpay/cancel`、`/ecpay/query` 各自 handler，與既有 `PATH_AI` proxy 邏輯分檔（同一 Worker、不同 module），避免 AI proxy 改動誤傷金流。

> 命名建議：Worker 內 `src/ecpay/` 一個資料夾，`index.js` 依 `url.pathname` 分派。

### 2.2 金鑰存哪 → **Worker secret，Edward 貼值，蘇菲/實作手不碰值**

```bash
# Edward 從綠界後台取值後自己跑（值永不落 git / 永不進 prompt 回覆）
wrangler secret put ECPAY_HASH_KEY      # sandbox 一組、prod 一組（不同！）
wrangler secret put ECPAY_HASH_IV
wrangler secret put ECPAY_ENV           # 'stage' | 'prod'
```

- sandbox 與 prod 的 HashKey/HashIV **是不同兩組**（沙利曼 spec §3 已警告）→ Worker 依 `ECPAY_ENV` 讀對應 secret + 打對應域名。
- `3502366`（MerchantID）是公開識別碼，可寫 code 常數，**不是 secret**（沙利曼 §1 界線）。
- 實作手 / 蘇菲只負責 Gate 5「grep 全 repo 零金鑰」，不碰值。

### 2.3 idempotent 防重放（綠界會重送通知）

綠界 webhook 可能重送（網路 / 綠界重試機制）→ 同一 `MerchantTradeNo` 進來兩次。**必做 idempotent**：

```javascript
// /ecpay/webhook — 驗章通過後、寫 billing 前
const ref = db.doc(`processed_webhooks/${tradeNo}_${gwsrPeriod}`);
const snap = await ref.get();
if (snap.exists) return new Response('1|OK');   // 已處理，回 OK 但不重做（不重複解鎖/開收據）
await ref.set({ at: Date.now(), rtnCode });
// ... 寫 billing + 產收據
```

- key 建議用 `MerchantTradeNo` + 期數識別（避免「每期都同 tradeNo」誤判第 2 期為重放——定期定額每期回來帶期數 `Gwsr`/`ProcessDate`，要納入 idempotent key）。
- 防重放也擋「同一驗章合法通知被惡意重送」。

---

## 3.（保留）取消 / ReAuth — 對應沙利曼紅線 2

- **取消**：`CreditCardPeriodAction` POST `Action=Cancel` + `MerchantID` + `MerchantTradeNo` + `TimeStamp` + `CheckMacValue` → 綠界確認停用後才寫 `status:'cancelled'`（紅線 2，sandbox C1 要綠界後台截圖為證）。
- **扣款失敗重授權**：`Action=ReAuth`（綠界連 6 次失敗才自動終止；中間可 ReAuth 救回）。
- **這兩個是 API 能做的全部**；改金額不在內（見 Q2）。

---

## 4. 收據（非發票）產法

> Edward 2026-06-25 澄清：**個人身分、無統編、不開統一發票** → 付款成功產「**收據**」（非電子發票）。
> 這大幅簡化沙利曼 spec §7（電子發票字軌 / 財政部上傳 / 作廢折讓那一整套**本階段不做**）。但仍要留收據 + 交易紀錄供帳務與消費者憑證。

### 收據欄位（最小集合）
| 欄位 | 來源 |
|---|---|
| 收據編號 | Worker 產（`RC` + tradeNo，或流水號） |
| 開立方 | BeyondSpec / Edward 個人（登記負責人名）|
| 付款方 | 用戶 email（Firebase auth）/ 顯示名 |
| 品項 | `BeyondSpec PRO 訂閱`（plan + 期數，如「2026-07 第 3 期」）|
| 金額 | `PeriodAmount`（NTD 整數）|
| 付款方式 | 信用卡（末四碼，綠界 webhook 回傳 `Card4No` 可顯示，**只存末四碼、不存全卡號**）|
| 付款時間 | webhook `paidAt` |
| 綠界交易序號 | `TradeNo` / `GwsrPeriod`（內部對帳，不一定對用戶顯示）|
| 聲明 | 「本收據為信用卡訂閱付款憑證，非統一發票」|

### 產法（建議：HTML 收據頁 + email，PDF v1 再說）
1. **MVP**：Worker 收到合法 webhook → 寫一筆 `users/{uid}/billing/receipts/{receiptNo}`（Firestore）→ 前端「訂閱管理」頁渲染成 HTML 收據（可列印）。**寄信**：Worker 觸發一封「付款成功 + 收據連結」email（用既有寄信通道；若無，先站內顯示、email v1 補）。
2. **v1**：要正式 PDF 收據 → Worker 用 HTML→PDF（如 Cloudflare 環境用 `pdf-lib` 或外部 render service）。**MVP 不必**，HTML 可列印頂著。
3. **資料分離**（沙利曼紅線 3 仍適用，即使是收據非發票）：`receipts` + `transactions` 存獨立 collection、標 `legalRetention:true`，**90 天清產品資料時跳過**——個人雖不開發票，但**信用卡交易收款紀錄仍屬帳務憑證**，要留（個人綜所稅 / 將來轉公司戶查核都用得到）。Day-1 就分離存。

> 收據 vs 發票差異對工時的影響：**省掉電子發票字軌申請 + 財政部上傳 + 統編檢核 + 作廢折讓 SOP**（沙利曼 spec §7 整段 + sandbox E1–E7 七個 case）→ 金流批工時可砍掉約 1–1.5 天。**這是 Edward「不開發票」決定省下來的實質工時。**

---

## 5. credit / 訂閱後端權威化（防清 localStorage 繞過）

> 現況風險：訂閱狀態若只存 `bp_subscription`（localStorage）→ 用戶清 localStorage 或改值就能偽造 PRO。**必須後端權威。**

### 權威來源 = Firestore `users/{uid}/billing`，localStorage 只當快取
1. **狀態真相在 Firestore**，且只由 Worker 收到合法 webhook 後寫（紅線 1）。Firestore 規則只放行本人讀、**禁止前端寫 billing**（payroll 模組已有此 pattern，沙利曼 A3）。
2. **前端啟動時**：`onAuthStateChanged` → 讀 Firestore billing → 寫進 `bp_subscription`(localStorage) 當**唯讀快取**（離線 / 首屏快顯）。**localStorage 是顯示快取，不是真相。**
3. **解鎖判斷雙層**：
   - 前端 UI gating（隱藏 / 顯示模組）讀 localStorage 快取 → 反應快，但**這只是 UX，不是安全邊界**。
   - **真正吃資源的動作**（AI 呼叫 `PATH_AI.call` 等付費功能）→ Worker 端**每次都查 Firestore billing 確認 plan**，前端 localStorage 改了也沒用（Worker 不信前端傳的 plan）。
4. **migration**：現有 `bp_subscription` 結構保留相容，但加一條「以 Firestore 為準、localStorage 過期就重抓」。

> 一句話：**localStorage 改成 PRO 只會讓 UI 暫時亮起來，但 Worker 端付費動作仍查 Firestore → 點下去不會真的給服務。** 安全邊界在 Worker，不在前端。

---

## 6. 切塊 + 雙軌工時估

> 工時格式依城堡憲法：`預估工時（AI 輔助對口工程師）/ 移動城堡估`。
> 「能先開工」= 用 sandbox + 測試金鑰就能做、不等 Edward 開通正式；「要等」= 卡在綠界帳號 feature 開通 / 正式金鑰 / Edward 外部前置。

### 🟢 可立即用 sandbox 開工（不等正式開通）
| # | 切塊 | 預估工時 | 移動城堡估 | 說明 |
|---|---|---|---|---|
| A | Worker `/ecpay/*` 路由骨架 + 環境切換（stage/prod 讀 secret） | 0.5 天 | 1.5–2 hr | 用 stage 端點 + 測試金鑰 |
| B | `genCheckMacValue` 驗章 module（產 + 驗）+ unit test 對綠界範例值 | 1 天 | 2–3 hr | **最易錯、最該先寫死測過**；綠界文件有標準範例可比對 |
| C | `/ecpay/create-order`（金額 server 權威 + 簽章 + 回前端表單） | 0.5 天 | 1.5 hr | PLAN_CATALOG 寫死 |
| D | `/ecpay/webhook` 驗章 + idempotent + 寫 Firestore billing | 1 天 | 2–3 hr | 紅線 1 核心 |
| E | 前端 openSubscribeFlow 接 create-order + onSnapshot 解鎖（app.html） | 1 天 | 2–3 hr | ES5；前端不自解 |
| F | 收據：寫 receipts collection + HTML 收據頁 + 站內顯示 | 0.5 天 | 1.5 hr | email 可延後 |
| G | credit 後端權威化（Worker 付費動作查 Firestore + localStorage 降為快取） | 0.5 天 | 1.5 hr | |
| H | sandbox 測試 A1–A5 / B1–B2 / F1–F3（驗章 / 金額 / 同意 / 不落卡號） | 1 天 | 2–3 hr | 對應沙利曼 sandbox case |

**🟢 小計：約 6.5 天 / 移動城堡約 14–18 hr**（不含等綠界）。**這一整批今天 Edward 一拿到 sandbox 測試金鑰就能開工。**

### 🟡 要等 Edward 開通 / 正式金鑰才能收尾
| # | 切塊 | 預估工時 | 移動城堡估 | 卡在哪 |
|---|---|---|---|---|
| I | 取消 `/ecpay/cancel`（Cancel API）+ sandbox C1–C3 | 0.5 天 | 1.5–2 hr | sandbox 可測；但「真停扣」要綠界後台確認 |
| J | 扣款失敗 ReAuth + 寬限期寄信 + D1–D3 | 0.5 天 | 1.5–2 hr | sandbox 可測失敗情境 |
| K | 對帳 cron（QueryCreditCardPeriodInfo 補漏接）| 0.5 天 | 1.5 hr | v1，MVP 先 webhook + 告警 |
| L | **stage→prod 金鑰/域名切換 + G1 上線最後一關** | 0.25 天 | 0.5–1 hr | **必須正式金鑰 + 定期定額已開通** |
| M | 真錢 smoke（小額真刷一筆走完整流程再退） | 0.25 天 | 0.5 hr | 必須正式開通 |

**🟡 小計：約 2 天 / 移動城堡約 5–7 hr**（部分卡正式開通）。

### ⛔ 外部前置（只有 Edward 能做，城堡無法代勞，建議今天就動）
- [ ] **問綠界：3502366 帳號「信用卡定期定額」feature 是否已開通**（Q1 但書 #1，critical path 起點）
- [ ] 確認個人戶額度上限 30 萬是否夠初期訂閱規模（Q1 但書 #2）
- [ ] 取得 **sandbox 測試金鑰**（HashKey/HashIV stage 組）→ 解鎖 🟢 整批開工
- [ ] 取得**正式金鑰** + 確認 PCI 托管頁模式核准 → 解鎖 🟡 收尾上線
- [ ] 隱私權政策 + 服務條款定稿（含「不存卡號 / 收據非發票 / 90 天保留 + 交易紀錄保存」）

> **總計（金流批，不含等待）**：預估約 **8.5 天** / 移動城堡約 **19–25 hr**，倍率約 8–12×（符合「無 Vercel preview、prod 直接審」區間）。**省掉電子發票那套 ≈ 已先砍 1–1.5 天。**

---

## 7. 我最擔心的 3 個技術風險（實作手直話）

### 1️⃣ Team 合併計費自動改金額——綠界 API 根本不支援（Q2 紅燈延伸）
這是**最容易被產品端誤以為「之後寫個 API call 改金額就好」**的坑。實際上綠界改金額**只有後台網頁 UI、沒有 API**。若 Team 設計成「加一個員工自動 +金額、按比例分攤」，後端**做不到自動**——只能 (A) 人工進綠界後台改、(B) Cancel 舊授權 + 開新總額授權（客戶要重走授權）。**強烈建議：MVP 的 Team 用固定 seat 級距或人工調整，自動 proration 別進第一版。** 這條我最想先幫 Edward 擋——免得照「自動改金額」去設計 UI，做到一半發現綠界接不上、整個 Team 計費 UX 要打掉重做（這正是憲法 v5.4.24「架構懷疑 5 信號」要早砍的那種）。

### 2️⃣ CheckMacValue 的 .NET URLEncode 校正——驗章對不上會卡死整條金流
JS 的 `encodeURIComponent` 跟綠界要求的 .NET `HttpUtility.UrlEncode` 對 `!*()'` 等字元行為不同。**這一步錯，sandbox 第一個 case（A1 正常授權）就過不了，而且錯得很隱晦**（看起來都對、就是驗章不等）。對策：切塊 B 第一優先寫死 + 拿綠界官方文件的標準範例值做 unit test 逐字比對，**B 沒綠之前不往下做**。這是金流串接 90% 新手卡關處，先排雷。

### 3️⃣ 定期定額 `ExecTimes` 有上限——不是真「無限訂閱」，漏設續簽會悄悄斷
綠界定期定額**必須設總期數**（`ExecTimes` 最少 2、有上限），不是「扣到取消為止」。若設 `ExecTimes=12` 而沒做「到期前自動續簽 / 寄信續訂」→ 第 13 個月用戶**安靜地停扣 + 失去服務**、雙方都沒收到警示。對策：建單時記 `nextBillingAt` + 期數，排程在最後一期前主動續簽或通知。**這條容易在 MVP 漏掉**（因為前 12 個月都正常、第 13 個月才爆），先寫進 backlog 並在訂閱管理頁顯示「目前授權至 X 期」。

---

## 附註 · 本檔與既有 doc 分工
| Doc | 定位 |
|---|---|
| `ecpay-integration-trust-spec.md`（沙利曼 6/25） | 安全/合規實作契約：3 紅線 / CheckMacValue 演算法 / sandbox 27 case / Gate 5 |
| `dev-compliance-suliman.md`（6/24） | 合規依據論述（法條 / PCI / PDPA）—— 發票那段本階段個人戶不開發票、暫不適用 |
| **本檔 `ecpay-tech-implementation-plan.md`（6/25）** | **技術實作計畫：2 紅綠燈 / 端點參數 / Worker 架構 / 收據 / 後端權威化 / 切塊工時 / 技術風險** |

三份互補：安全照沙利曼、合規照 6/24、**怎麼接 + 哪塊先開工 + 工時照本檔**。

---

## 來源彙整（Sources）
- [信用卡定期定額 · ECPay Developers (建單 API)](https://developers.ecpay.com.tw/?p=2868)
- [Periodic fixed-amount by Credit Card · All-In-One API (英文)](https://developers.ecpay.com.tw/16470/)
- [信用卡定期定額訂單作業 API · CreditCardPeriodAction (ReAuth/Cancel only)](https://developers.ecpay.com.tw/?p=16618)
- [定期定額訂單查詢 · QueryCreditCardPeriodInfo](https://developers.ecpay.com.tw/?p=16584)
- [信用卡定期定額管理 · ECPay Support (後台改金額不需重授權)](https://support.ecpay.com.tw/16214/)
- [綠界公告 nID=5311 · 定期定額編輯訂單功能 (後台 only, 2024-04-08)](https://www.ecpay.com.tw/Announcement/DetailAnnouncement?nID=5311)
- [信用卡綁卡服務 / 定期定額 · 綠界產品頁](https://www.ecpay.com.tw/IntroRecurringPayment)
- [申請介紹 · ShopLine (個人→商務會員→特約商店升級路徑)](https://support.shoplineapp.com/hc/zh-tw/articles/215046886)
- [ECPay 金流使用說明 · ShopStore (個人會員支援定期定額)](https://shopstore.tw/teachinfo/359)
- [綠界金流使用說明 · EasyStore (個人戶額度/費率)](https://support.easystore.co/zh-tw/article/ecpay-goimkq/)
- [服務費率表 · 綠界科技](https://www.ecpay.com.tw/Business/payment_fees)
- [實況主收款設定 · Medium (個人會員定位)](https://medium.com/gcake-podcast-tutorial/%E8%81%BD%E7%9C%BE%E6%8A%96%E5%85%A7%E8%A8%AD%E5%AE%9A-ecpay-%E7%B6%A0%E7%95%8C%E7%A7%91%E6%8A%80-%E5%AF%A6%E6%B3%81%E4%B8%BB%E6%94%B6%E6%AC%BE-48db085f0255)

---

*城堡實作手 · 2026-06-25 · 階段二金流批技術計畫 · 全程 WebSearch/WebFetch 查綠界官方文件（未用 Chrome 互動、未卡）· 只出計畫 doc、未碰 production code · 2 紅綠燈查死附來源 · 切塊雙軌工時 · 扣住沙利曼安全 spec 不重抄*
