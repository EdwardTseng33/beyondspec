# BeyondSpec × 綠界定期定額 — 驗章 + 建單 + webhook + 取消 + 收據 + dunning + 退款

> 城堡實作手 · 2026-06-25 · 階段二金流批 · **第一塊 + 第二塊 + 第三塊**
> 性質：可獨立測試的 Worker 端模組草稿。**未部署、未碰真金鑰、未碰真錢、未改 app.html/worker.js。留蘇菲 review。**
> 依據：`../../research/strategy-2026-06/ecpay-tech-implementation-plan.md`（技術） + `ecpay-integration-trust-spec.md`（安全 3 紅線 / CheckMacValue §3）
>
> - **第一塊**（驗章 de-risk + 建單）：見「第一塊」段，52 案綠。
> - **第二塊**（webhook 解鎖 / 取消 / 收據 / 後端權威化）：見「第二塊」段，+219 案綠。**Worker 整合計畫見 `WORKER-INTEGRATION.md`。**
> - **第三塊**（**失敗 / 逆向全情境**：首扣失敗不解鎖 + 每期失敗 dunning 狀態機 + 退款/chargeback re-lock）：見「第三塊」段 + **「6 情境完整矩陣」**，+104 案綠。
> - 合計 **375 案全綠**。

## 第一塊做了什麼

| 檔 | 內容 | 對應 spec |
|---|---|---|
| `src/checkmac.js` | **CheckMacValue 驗章核心**（產生 + 驗證）。.NET URLEncode 校正 + 排序 + 小寫 + SHA256。 | 安全 spec §3、紅線 1 |
| `src/config.js` | 端點（stage/prod）、MerchantID(3502366 公開)、PLAN_CATALOG（金額 server 權威）、定期週期預設。 | 安全 §1 機密界線、紅線 1.4 |
| `src/create-order.js` | 定期定額建單：查權威金額 → 產唯一 TradeNo → 組 AioCheckOut/V5 + 定期欄位 → 簽章 → 回前端表單。 | 技術 §1、安全 §4 Step1-2 |
| `test/checkmac.test.mjs` | 驗章單元測試（23 案，**對綠界官方文件範例值逐字比對**）。 | sandbox A2/A3 |
| `test/create-order.test.mjs` | 建單單元測試（29 案：金額權威/唯一性/欄位/簽章自洽/open-redirect 防護）。 | sandbox B1/B2 |
| `test/gen-sandbox-form.mjs` | 產「綠界 stage 自動送出表單」供手動刷測試卡（用綠界**公開** demo 商店 2000132）。 | sandbox 手動實測 |
| `test/run-all.mjs` | 全測試入口。 | Gate 1 |

## 第二塊做了什麼（webhook 解鎖 / 取消 / 收據 / 後端權威化）

| 檔 | 內容 | 對應 spec |
|---|---|---|
| `src/store.js` | **Firestore 邊界**：`BillingStore` 介面 + `InMemoryStore` mock。webhook/取消/收據全走它，真上線換 `FirestoreStore` 即可、邏輯不動。idempotent / 收據-交易獨立 collection 在這保證。 | A3 / 紅線 3 / §2.3 |
| `src/webhook.js` | **`/ecpay/webhook`（紅線 1 核心）**：server 端**重算 CheckMacValue 驗章**（import 第一塊）→ **idempotent**（同期重送不重複解鎖、防重放；key 含期數 Gwsr）→ 解鎖寫 billing（plan/subscriptionId/billingStatus=active/paidAt）→ 交易+收據。**前端永遠不自解。** | 紅線 1 / Step4-5 |
| `src/cancel.js` | **`/ecpay/cancel`（紅線 2）**：**真呼叫**綠界 `CreditCardPeriodAction Cancel`（fetch 注入），綠界回 RtnCode=1 才寫 cancelled；失敗/網路錯**絕不**標已取消。plan 不動（當期續用）。 | 紅線 2 / Step8 |
| `src/receipt.js` | **收據（非發票）**：欄位（金額/品項/日期/交易序號/商家=Edward）+ HTML 收據頁（可列印）+ email hook。**只存末四碼**。獨立 collection + `legalRetention`。 | 技術計畫 §4 / 紅線 3 |
| `src/authority.js` | **後端權威化**：付費判斷 Firestore 為真相（`assertEntitled` Worker 端查、不信前端）；localStorage 唯讀快取（防清繞過、太舊重抓）。 | 技術計畫 §5 / A3 |
| `test/{store,webhook,cancel,receipt,authority}.test.mjs` | 第二塊單元測試 +219 案（17+60+38+38+28）。 | sandbox A1/A2/A4/C1/C2/C3 等 |

**Worker 怎麼接 + Edward infra 清單 + 下一塊建議 → `WORKER-INTEGRATION.md`**（含實讀 worker.js 現況：無 Firestore 寫入 / 無 pathname 路由，要補的 `FirestoreStore`（REST+JWT 路 A）+ idempotent create-409 原子性）。

## 跑測試

```bash
cd projects/beyondpath/billing-scaffold/ecpay
node test/run-all.mjs          # 全部 9 suite（375 案）
node test/webhook.test.mjs     # webhook（驗章擋偽造 / idempotent / 解鎖 / 收據 / 全狀態矩陣）
node test/dunning.test.mjs     # 扣款失敗 dunning 狀態機（past_due 寬限 / 上鎖 / 救回 / idempotent）
node test/refund.test.mjs      # 退款 / chargeback re-lock（手動 + webhook 通知 / idempotent）
node test/cancel.test.mjs      # 取消（真呼叫綠界 / 失敗不錯標）
node test/receipt.test.mjs     # 收據
node test/authority.test.mjs   # 後端權威化 + past_due/locked entitlement
node test/store.test.mjs       # 資料層
```

## ✅ 驗證證據（2026-06-25）

1. **CheckMacValue 對綠界官方範例逐字過**：官方文件（developers.ecpay.com.tw/?p=2902）給的
   - URLEncode 後字串 ✅ 逐字相等
   - 最終 CheckMacValue `6C51C9E6888DE861FD62FB1DD17029FC742634498FD813DC43D4243B5685B840` ✅ 相等
   → 卡西法風險 #2（.NET URLEncode 校正）**已釘死**。
2. **建單 52 案全綠**（23 + 29）。
3. **綠界 STAGE 真伺服器接受簽章**：把已簽章定期定額訂單直接 POST 到
   `payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5` → 回 HTTP 200 +「選擇支付方式|綠界科技」結帳頁，
   **無 CheckMacValue Error（10200073）** → 證明真刷測試卡會走到刷卡頁（簽章鏈端到端通）。

### 第二塊（webhook / 取消 / 收據 / 後端權威化）— +219 案全綠（合計 271）

`node test/run-all.mjs` → exit 0，7 suite 全 `ALL GREEN ✓`。關鍵驗證（對應沙利曼 sandbox case 的【邏輯層】證明；sandbox 真環境留第三塊）：

- **A2 偽造 webhook 擋下（核心）**：簽好的合法通知改金額但不重簽 → 驗章失敗 → **billing 完全沒寫**（沒被解鎖）+ 發 `checkmac_failed` 告警。亦測「無簽章 / 亂簽 DEADBEEF」皆擋。
- **前端不自解（紅線 1）**：解鎖只在 `webhook.js` server 驗章後發生；`authority.js` 明寫 localStorage 唯讀快取、付費動作 `assertEntitled` 查 Firestore（store 無此人/讀取爆炸 → fail closed 擋）。
- **A4 idempotent**：同一期通知重送 → 只解鎖一次、只 1 張收據、只 1 筆交易、回 `1|OK`；**第 2 期（不同 Gwsr）→ 正確視為新期再解鎖**（不被當重放）。
- **取消真呼叫綠界（紅線 2 / C1）**：fakeFetch 證明真的 POST 到 `CreditCardPeriodAction` + body 含 `Action=Cancel` + 簽章；綠界回 RtnCode=1 才寫 cancelled。
- **C2 取消失敗不錯標**：綠界回 RtnCode≠1 / HTTP 500 / 網路 throw → **billingStatus 仍 active**（絕不錯標已取消）+ 502 + 告警。
- **C3 取消後當期續用**：寫 cancelled 但 plan 不動。
- **收據（紅線 3）**：`kind=receipt`（非發票）+ `legalRetention=true` + 獨立 collection + **只存末四碼**（給全卡號自動只留末 4）+「非統一發票」聲明 + XSS payload 被 escape。HTML 收據頁產出 2199 bytes、合法 doctype、品牌色 #7C5CFC。
- **email 來源安全**：收據 email 收件人只信 `lookupEmail(uid)`（Firebase auth 查），**不信綠界 body 夾帶的 Email 欄位**（驗章邊界）。

> ⚠️ idempotent 原子性在 mock 已對；**FirestoreStore 上線要用 create-409 做原子**（見 WORKER-INTEGRATION §3，必做）。

## 第三塊做了什麼（失敗 / 逆向全情境 — Edward 親點漏財防線）

| 檔 | 內容 | 對應 spec |
|---|---|---|
| `src/dunning.js` | **扣款失敗 dunning 狀態機**：`active → past_due（寬限 N 天、仍可用、發提醒）→ 重試 → 連續失敗/寬限過 → locked`。寬限天數 / 重試次數 / 綠界自動取消門檻（6）全做成**可調參數** `DUNNING_DEFAULTS`。每個轉換**純函式 + idempotent**。`classifyNotify` 分首扣 vs 續扣、成功 vs 失敗。 | sandbox D1/D2 · trust spec Step7 |
| `src/refund.js` | **退款 / chargeback → re-lock**：admin/手動觸發（`handleManualRefund`）+ webhook 退款通知前瞻接口（`handleRefundNotify`，先驗章再鎖）。任何狀態都 re-lock 成 `locked`、idempotent（`refunds[]` 去重）、chargeback 走高等級告警。回傳 `bindingTodo` 提醒**退費三件綁定**（①停扣 ②開折讓/作廢 ③降級——本模組只做③）。 | trust spec §232 |
| `src/webhook.js`（擴充） | webhook 從「只處理成功」升級到**全狀態矩陣**：首扣失敗 → `first_charge_failed`（絕不解鎖）；續扣失敗 → 路由進 dunning；續扣成功且原本 past_due/locked → **救回 active 並清 dunning**（`recovered`）。 | 全狀態矩陣 |
| `src/authority.js`（擴充） | `isSubscriptionActive` / `resolveEntitlement` 認得 `past_due`（寬限內可用、寬限過失效）+ `locked`（降 free）；新增 `resolveReadOnlyState` → past_due/locked **重用既有唯讀殼**（與試用到期同一殼，不另造）。 | 一致性要求 |
| `test/{dunning,refund}.test.mjs` + webhook 擴充 | +104 案（dunning 73 + refund 47 − 重複計入 webhook +24 已含在 webhook 82）。 | D1/D2 + 逆向 |

### 🧩 6 情境完整矩陣（哪條情境 → 哪個檔 / 哪個函式處理）

> Edward 點名的「6 情境」= 正向 2（首扣成功 / 續扣成功）+ 失敗逆向 4（首扣失敗 / 續扣失敗 dunning / 退款 / chargeback）。

| # | 情境 | 觸發 | 主處理檔 · 函式 | 結果狀態 | 鎖機制 | idempotent | 測試 |
|---|------|------|----------------|----------|--------|-----------|------|
| 1 | **首次刷卡成功** | webhook RtnCode==1、無既有訂閱 | `webhook.js handleWebhook` → 解鎖 | `active` | — | `processedWebhooks` key（含期數） | webhook [3] |
| 2 | **每期扣款成功** | webhook RtnCode==1、已有訂閱 | `webhook.js` → 解鎖；若原 past_due/locked → `dunning.applyRecurringSuccess` 救回 | `active`（`recovered`） | 解鎖殼 | `processedWebhooks` + dunning seenKeys | webhook [7][12] · dunning [7] |
| 3 | **首次刷卡失敗** | webhook RtnCode≠1、無既有訂閱 | `webhook.js` → `first_charge_failed` 分支 | 維持 `none`、標 `firstChargeFailed` | **絕不解鎖** | — | webhook [8][13] |
| 4 | **每期自動扣款失敗** | PeriodReturnURL RtnCode≠1、已有訂閱 | `webhook.js` → `dunning.handlePeriodicFailure` → `applyRecurringFailure` 狀態機 | `past_due`（寬限）→ `locked`（門檻/寬限過） | **重用試用到期軟鎖**（past_due/locked → `_isReadOnly`） | dunning `seenKeys[idemKey]` | dunning [1-11] · webhook [11] |
| 5 | **退款（手動 / 後台）** | admin 在我方後台觸發 / 綠界退款 webhook | `refund.js handleManualRefund` / `handleRefundNotify` → `applyRefundLock` | `locked`（`refund_manual_refund`） | **同 locked 唯讀殼** | `refunds[refundId]` 去重 | refund [1-4][7-11] |
| 6 | **銀行退單（chargeback）** | admin 觸發（kind=chargeback） / 爭議通知 | `refund.js handleManualRefund(kind:'chargeback')` | `locked`（`refund_chargeback`） | **同 locked 唯讀殼** | `refunds[refundId]` 去重 | refund [5] |

**一致性保證（chunk3 關鍵要求）**：情境 4/5/6 的「鎖」**全是同一個 `billingStatus='locked'`**（past_due 是寬限態），前端 `_isReadOnly` / `authority.resolveReadOnlyState` 一視同仁——**沒有另造一套鎖**。entitlement 一律走 `authority.resolveEntitlement`（locked / 寬限過 → 降 free），UI 顯示靠 `cacheFromBilling` 帶出的 `readOnly` / `readOnlyReason` / `paymentIssue` / `graceUntil`。

### 🔧 可調參數（營運決策，Edward 可覆寫）

`dunning.js DUNNING_DEFAULTS`：
- `graceDays: 7` — 付款失敗後寬限天數（仍可用、發提醒）
- `maxRetries: 3` — 我方提早止血門檻（在寬限內連續失敗幾次先鎖）
- `autoCancelThreshold: 6` — 綠界端「連續失敗自動取消後續扣款」次數（官方值，達此必鎖）
- 上鎖 = **三條件取先到**：達 maxRetries ∥ 達 autoCancelThreshold ∥ 寬限過。覆寫法：`handleWebhook({ ..., dunningParams: { graceDays: 14 } })`。

### 📋 整合待辦（接 app.html / Worker / 真環境時補）

1. **前端 `_isReadOnly` 接 billingStatus**（主對話 review 後改 app.html，本批不碰）：onSnapshot billing → `past_due`/`locked` 走既有唯讀殼 + 顯示「付款異常／已暫停，更新卡片」橫幅（文案/CTA 待女巫）。`cacheFromBilling` 已備好 `readOnly`/`readOnlyReason`/`graceUntil` 欄位。
2. **退費三件綁定 ①②**（本批只做③降級）：① 退款前先 `cancel.js` 停扣（避免下期又扣）② 開折讓/作廢發票（綠界後台 / 發票 API，跨月多為折讓，**尚未自動化**）——`handleManualRefund` 回傳的 `bindingTodo` 已把①②列出提醒，不可只做③。
3. **ReAuth 重授權救援**（trust spec §3 / tech plan Step7）：綠界 `Action=ReAuth` 可在自動取消前主動重扣救回——目前 dunning 把「重試」建模為「等下一期綠界自動重扣 / 用戶補卡」，**主動 ReAuth API 呼叫尚未實作**（可加在 cancel.js 同模式：buildReAuthRequest + fetch 注入）。留 backlog。
4. **綠界退款 / 爭議通知欄位對齊**：`handleRefundNotify` 的 `isRefundNotify(p)` 預設用 `RefundAmount>0` 判定，**綠界實際退款/爭議通知欄位待 Edward 對綠界文件後填準**（目前是前瞻接口，主力是 admin 手動觸發）。
5. **dunning 寫盤原子性**：`handlePeriodicFailure` 的 seenKeys 防重在 InMemoryStore 已對；FirestoreStore 上線時 dunning patch 與 processedWebhooks 標記**應同 transaction**（同 webhook 解鎖原子性問題，見 WORKER-INTEGRATION §3）。
6. **past_due 寬限過的主動降級**：目前「寬限過 → locked」發生在**有新失敗通知進來時**；若綠界停止送通知，`authority.isSubscriptionActive` / `isGraceExpired` 在**讀取端**已視為失效（不會白吃服務），但 billingStatus 仍寫 past_due。要「乾淨地把 doc 改 locked」需一支 cron 掃 past_due 且 `now>graceUntil`（與對帳 cron 同批，backlog）。

## 🔒 安全界線（已守）

- `src/` 全檔（含第三塊 dunning/refund）**零金鑰字面**——HashKey/HashIV 一律從 `env.ECPAY_HASH_KEY/IV` 傳入（Worker secret）；grep `pwFHCqoQ.../EkRm7iFT...` 僅命中 test fixture 與 checkmac 演算法變數。卡號**只存末四碼**（`card4No`），無 `cardNumber/cvv/expiry` 收集欄位。
- test 內出現的金鑰**全是綠界官方公開 demo 值**（文件範例 + 公開測試商店 2000132），非 Edward 真金鑰。
- Edward 真商店 3502366 的真金鑰：**從未出現在任何檔**，永遠只進 Worker secret。
- 端點寫死常數（防 open-redirect）；前端金額一律不信（防竄改）。

## ⛏️ 怎麼接進 Worker（下一塊）

現有 Worker = `E:\Claude\beyondSpec 2.0\_workspace\ai-proxy\worker.js`（`path-ai-proxy`，**本機、未進 git**）。
目前它**依 `body.node` 分派、無 `url.pathname` 路由、且尚無 Firestore 寫入**。接 `/ecpay/*` 要：
1. 在 `fetch()` 最前面加 `const url = new URL(request.url); if (url.pathname.startsWith('/ecpay/'))` 分派到 ecpay handler。
2. ecpay handler import 本資料夾模組（`create-order` 用 `buildSubscriptionOrder`，webhook 用 `verifyCheckMacValue`）。
3. **webhook 寫 Firestore = 本 Worker 現在還沒有的能力**——需新增 Firebase Admin / REST 寫入（見下方「給 Edward / 蘇菲」）。

## ⚠️ 給 Edward / 蘇菲 review 的重點

- **Worker 部署權限在 Edward**：源碼本機可讀，但 `wrangler deploy` + `wrangler secret put` 要 Edward 的 Cloudflare 帳號。本塊不部署。
- **現有 Worker 無 Firestore 寫入**：技術計畫假設「Worker 已有 Firestore 寫入能力」與實際源碼**不符**——目前 worker.js 只代理 LLM API。webhook 解鎖寫 billing 需先補 Firebase 寫入路徑（下一塊處理）。
- **金額待 Edward 拍**：`config.js` PLAN_CATALOG 暫填 PRO 499 / MAX 999，須與 app.html / billing-config.js 對齊。
- 外部前置（只有 Edward 能做）：① 問綠界 3502366「定期定額」是否已開通 ② 取得 sandbox + 正式金鑰 ③ 個人戶額度 30 萬確認。
