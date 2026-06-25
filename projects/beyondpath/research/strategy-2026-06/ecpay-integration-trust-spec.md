# BeyondSpec × 綠界金流 — 安全 + 合規「可執行整合 Spec」

> 2026-06-25 · 沙利曼（Head of Trust）· 階段二（金流批）前置備料
> 性質：**可執行實作契約**——給卡西法照著串綠界用。不是「為什麼/合規依據」的論述（那份是同目錄 `dev-compliance-suliman.md`），這份是「怎麼做 / 信任風險點在哪 / sandbox 怎麼驗」。
> 定位提醒（6/5 Edward 拍板精神）：本檔是**強建議 + 我願親手把鎖/驗章/格式驗證寫進城堡 code**。三條紅線是我能給的最強建議，不是否決權；上不上線、何時上線，**Edward 拍板**。我的職責終點 = 把風險講清楚、把能做的保護做出來。
>
> **本檔不碰任何 app code / Worker code。只寫 spec。**

---

## 0. 讀這份之前必須先吃進腦的 3 件架構事實（卡西法 6/24 實讀原始碼確認）

| # | 事實 | 對本 spec 的意義 |
|---|---|---|
| A1 | **Cloudflare Worker 已存在且已部署**：`path-ai-proxy.edwardt0303-281.workers.dev`（app.html line 12264）。前端 `window.PATH_AI.call()` 已走它。 | **這是 server 端唯一可信執行環境。** 綠界 webhook 端點、CheckMacValue 驗章、HashKey/HashIV secret、權威解鎖——**全部掛 Worker**，不另開後端。前端永遠拿不到金鑰。 |
| A2 | **app.html = 唯一 prod 程式來源**：single-file SPA、ES5（`var`/`function`，無 `const`/`let`/arrow）。前端只負責「顯示 + 導向綠界」。 | 前端**絕不**做：驗章、解鎖、存卡號、存金鑰、決定金額。前端能做的只有「把用戶導去綠界已簽好章的表單」+「監聽 Firestore 狀態翻轉後刷新 UI」。 |
| A3 | **Firestore = 帳號 + billing 權威狀態**：`users/{uid}/billing/*`，規則只放行本人（payroll 模組已示範權威雲端 pattern）。 | 付款狀態（plan / subscriptionId / status / paidAt）**只由 Worker 收到合法 webhook 後寫入**。前端讀 Firestore 只是「看結果」，不是「定結果」。 |

---

## 1. 機密 vs 非機密 — 一條寫死的界線（憲法級，全 spec 之首）

開工前所有人對齊：哪些字串可以出現在 spec / git / 前端，哪些絕不行。**踩錯這條 = secret 外洩事故。**

| 類別 | 範例 | 可否進 spec / git / 前端 | 存哪 |
|---|---|---|---|
| 🟢 **商店識別碼（公開）** | 綠界**商店代號（MerchantID）= `3502366`**、特約商店名 BeyondPath | ✅ 可寫進 spec、可進 git、可在前端表單 `MerchantID` 欄位出現 | code 常數即可 |
| 🔴 **金鑰（最高機密）** | **HashKey** / **HashIV** | ❌ **絕不進** spec / git / app.html / 前端 JS / 任何 .md / .sh | **只在 Cloudflare Worker 環境變數**（`wrangler secret`），Worker runtime 內讀取，永不回傳前端 |
| 🔴 **金流授權 ID** | 綠界定期定額 `GwsrPeriod` / 授權碼 / `subscriptionId` | ⚠️ 可存 Firestore（受規則保護），但**不可進前端可見的 URL query / log** | Firestore `users/{uid}/billing` |
| 🔴 **發票字軌 / 開立 token** | 電子發票 API 的金鑰 | ❌ 同 HashKey 規則 | Worker 環境變數 |

> **為什麼把 `3502366` 明寫**：商店代號是綠界回傳每筆通知都帶的公開識別碼，前端送單也要帶——它不是秘密。把它跟 HashKey/HashIV 混為一談會讓人「為了保密把它也藏起來」，反而搞錯保護重心。**真正要命的只有 HashKey/HashIV。** 這條界線寫死，省得每次都要重判。

**開工第一個動作（卡西法）**：在 Worker 設兩個 secret——
```
wrangler secret put ECPAY_HASH_KEY      # 值由 Edward 從綠界後台取，貼進 prompt，永不落 git
wrangler secret put ECPAY_HASH_IV       # 同上
```
我（蘇菲 / 沙利曼）**不碰金鑰值**——只負責確認「值沒出現在任何 git-tracked 檔案」（Gate 5 grep 掃）。

---

## 2. 三條紅線 → 展開成可執行（為什麼 / 做錯後果 / 實作要點）

> 這三條是「上真錢前」絕不能缺的保護。每條給：① 為什麼 ② 做錯的真實後果 ③ 卡西法照著做的實作要點。

### 🔴 紅線 1 · webhook 必 server 端驗章（CheckMacValue）才解鎖；前端不能自解

**為什麼**
綠界用兩種方式回報付款結果：
- `OrderResultURL`（前端轉址）— 用戶授權後瀏覽器被導回的網址，**可被偽造**（任何人複製這個 URL 結構就能假裝「我付款成功了」）。
- `ReturnURL` / `PeriodReturnURL`（server-to-server POST）— 綠界後台直接 POST 到我們 Worker，**帶 CheckMacValue 簽章**，這才是金流真相。

**做錯後果**
若「前端拿到 `OrderResultURL` 就自己把 plan 改成 pro」→ 任何人偽造一個成功轉址就能**白嫖 PRO / MAX**，或冒充已付款。這是 SaaS 金流第一致命漏洞，等於門沒鎖。

**實作要點（卡西法）**
1. **解鎖只發生在 Worker `/ecpay-webhook` 端點**，收到綠界 server POST 後：
   a. 取出 POST body 全部參數（除 `CheckMacValue` 本身）。
   b. **重算 CheckMacValue**（演算法見 §3），與綠界送來的 `CheckMacValue` 字串比對。
   c. **比對失敗 → 立刻丟棄**（回 HTTP 200 但不做任何解鎖；記一筆「驗章失敗」告警，因為這代表有人在試）。
   d. 比對成功且 `RtnCode == 1`（綠界成功碼）→ 才寫 Firestore `users/{uid}/billing` 翻 plan。
2. **前端 `OrderResultURL` 落地頁只能顯示「處理中，請稍候」**，然後**監聽 Firestore billing 文件變化**——plan 翻成 pro 是 Worker 寫的，前端只是「看到」。前端 code 裡**不得有任何 `state.plan = 'pro'` / `changePlan('pro')` 由轉址觸發的路徑**。
3. Worker 回覆綠界必須是純文字 `1|OK`（綠界規定），否則綠界視為通知失敗會重送。
4. **uid 對應**：webhook 進來怎麼知道是哪個用戶？送單時 `MerchantTradeNo` 或 `CustomField1` 帶 uid（見 §4 step 1），webhook 回來時原樣帶回 → Worker 據此定位 Firestore 文件。**`CustomField` 也納入 CheckMacValue 計算範圍**（綠界會把它算進簽章），所以不能被竄改。

> **驗收證據（Gate 5）**：給我看 Worker `/ecpay-webhook` 的驗章 code 段 + 一張「偽造 webhook（故意改一個欄位）被丟棄」的 sandbox 測試 log。

---

### 🔴 紅線 2 · 「取消訂閱」必真呼叫綠界停扣，不只改自家資料庫

**為什麼**
綠界定期定額一旦授權，**扣款排程在綠界端**，不在我們這。我們自家 Firestore 把 `status` 標成 `cancelled` **不會讓綠界停止扣款**——下個月綠界照樣扣。

**做錯後果**
用戶在 app 內按「取消訂閱」、看到「已取消」、**下個月信用卡又被扣 499** → 信用卡爭議（chargeback）+ 消費者保護申訴 + 金流信任徹底崩 + 綠界帳戶可能被風控。這是**會上新聞、會被 PTT 燒**的等級。

**實作要點（卡西法）**
1. 用戶按「取消訂閱」→ 前端**不直接改狀態**，而是呼叫 Worker `/ecpay-cancel-subscription`。
2. Worker 呼叫綠界**「信用卡定期定額訂單作業 API」**（action = 停用該筆 `GwsrPeriod` / 定期定額授權）：
   - 端點：綠界定期定額管理 API（正式 `https://payment.ecpay.com.tw/Cashier/...` 對應的定期定額作業端點；sandbox 用測試域名）。
   - 送 `MerchantID=3502366` + 該訂閱的 `MerchantTradeNo` + `Action=Cancel`（或綠界指定的停用 action 值）+ CheckMacValue。
3. **綠界回覆確認停用成功後**，Worker 才寫 Firestore `status=cancelled` + `cancelledAt`。
4. **綠界回覆失敗 → 不可標記為已取消**，回前端「取消失敗，請聯絡客服」+ 告警給我們（不能讓用戶以為取消了其實沒取消）。
5. **降級時點**：取消後**服務用到當期帳期結束**（用戶已付這個月的錢），不是立刻斷——`status=cancelled` 但 `plan` 維持到 `nextBillingAt`，到期才降 free。這要寫清楚，避免「取消=立刻沒得用」的爭議。
6. **Team 改 seat 金額**（v2，先記）：定期定額金額**不能線上直接改**——做法是「停用舊授權 → 建新總額授權」，UX 要讓 owner 重新確認一次扣款金額。

> **驗收證據（Gate 5）**：sandbox 建一筆定期定額 → 呼叫取消 → **登入綠界後台確認該授權狀態已變停用** 的截圖。不接受「app 顯示已取消」當證據——**要綠界後台的真相**。

---

### 🔴 紅線 3 · 已開發票 / 扣款憑證與產品資料「分離存」，不隨 Starter 90 天清資料一起刪

**為什麼**
兩種資料的「該不該刪」由完全不同的法律決定：
- **產品使用資料**（看板/客戶/報價內容、AI 對話）→ 受**個資法 §11**：特定目的消失（用戶不付費、關係終結）就該刪 → Starter 90 天清是**履行刪除義務**。
- **交易 / 發票 / 會計憑證**（已扣款紀錄、已開發票號）→ 受**稅捐稽徵法 / 商業會計法**：帳簿憑證至少 **5 年**、營業稅相關 **7 年**，**不可因用戶要求或 90 天到期就刪**。這是個資法 §11 但書「執行業務所必須 + 有法令規定保存期限」的例外。

**做錯後果**
- 若「90 天清資料」一鍵把交易/發票紀錄也刪了 → **違反稅法法定保存**，國稅局查核時拿不出憑證 → 補稅 + 罰鍰 + 信譽。
- 反過來，若「為了留發票」把產品個資也無限期留著 → 違反個資法 §11 主動刪除義務。
- **兩邊都會錯，所以必須「分離存」**——這是本紅線的核心。

**實作要點（卡西法）**
1. **資料分兩個 Firestore 命名空間**：
   - 產品資料：`users/{uid}/...`（看板/客戶/報價等）— 受 90 天清資料政策。
   - 財會憑證：`users/{uid}/billing/invoices/{invoiceNo}` + `users/{uid}/billing/transactions/{tradeNo}`（已扣款/已開發票）— **標記 `legalRetention: true`，90 天清資料時跳過**。
2. **清資料函式（v1 的 Cloud Function）必須是「選擇性刪除」**：刪 `users/{uid}/` 下的產品 collection，**白名單保留 `billing/invoices` + `billing/transactions`**。**禁止 `recursiveDelete(users/{uid})` 整碗端**——那會連憑證一起殺。
3. **清資料前寄信預告**：發送紀錄要留存（證明有通知），且隱私政策事先寫明這個保留/刪除政策（見 §6）。
4. **MVP 階段**：90 天清資料**不做**（卡西法判斷非 Day-1 緊迫，v1 補 Cloud Function）——**但資料結構從 Day-1 就要分離**（invoices/transactions 一開始就存在獨立 collection），否則 v1 要回頭拆資料很痛。**這條是「現在就要做對的架構決定」，不是「現在就要寫清資料邏輯」。**

> **驗收證據（Gate 5）**：給我看 billing 資料結構 schema（證明 invoices/transactions 在獨立 collection + 有 legalRetention 標記）。清資料邏輯 v1 再驗。

---

## 3. CheckMacValue 驗章 — 演算法寫死（卡西法照抄）

> 綠界所有送單與通知的防偽核心。**Worker 端做，前端永遠不做**（因為要用 HashKey/HashIV）。

**產生步驟（送單簽章 + 驗證收到通知，同一套演算法）：**

1. **參數排序**：把所有要參與計算的參數（**除了 `CheckMacValue` 本身**）依**參數名稱 A→Z 字母順序**排列。
2. **組字串**：`HashKey=<金鑰>&參數1=值1&參數2=值2&...&HashIV=<金鑰>`
   （前面接 `HashKey=`，後面接 `&HashIV=`，中間是排序後的 `key=value&` 串。）
3. **URL Encode**：整串做 **.NET 風格 URLEncode**，關鍵轉換：
   - 空格 → `%20`、`@` → `%40`、`+` → `%2b`、`/` → `%2f`、`*` 不轉、`(` `)` `!` `-` `_` `.` 等保留字依綠界轉換表。
   - ⚠️ **這是最常出錯的一步**——JS 的 `encodeURIComponent` 跟 .NET `HttpUtility.UrlEncode` 對某些字元（`!`, `*`, `(`, `)`, `'`）行為不同，要照綠界轉換表手動校正，否則驗章永遠對不上。
4. **轉小寫**：整串轉成全小寫。
5. **SHA256**：對整串做 SHA256 雜湊。
6. **轉大寫**：雜湊結果轉成全大寫 → 這就是 `CheckMacValue`。

**驗證收到通知時**：對綠界 POST 進來的參數（除 `CheckMacValue`）跑完全相同的 1–6，產出的值與綠界送的 `CheckMacValue` **逐字比對**，**完全相等才算真**。

> 綠界官方明列常見錯誤：HashKey/HashIV 用錯（sandbox 與正式不同組）、參數排序錯、URL encode 大小寫/特殊字元錯、編碼非 UTF-8。**驗章對不上時 99% 是這四個之一，不是綠界的錯。**

**實作風險點**：sandbox 與正式環境的 HashKey/HashIV **是不同的兩組**。Worker 要能依環境切換（`ECPAY_ENV=stage|prod` 決定讀哪組 secret + 打哪個域名）。**上線切正式時最容易忘記換金鑰** → 驗章全錯 → 全部扣款卡住。這條列入 Gate 5 checklist。

---

## 4. 定期定額 flow（安全角度逐步標風險點）

> 每一步標出「信任風險點」🔺 與「對應防護」🛡。

```
┌─ Step 1 [前端] 用戶在 app 選 PRO → 呼叫 Worker /ecpay-create-order
│   🔺 風險：前端傳金額過來，被改 499→1
│   🛡 防護：前端只傳「方案 key=pro」+ uid；金額由 Worker 依 PLAN_CATALOG 算（§見紅線1.4）
│
├─ Step 2 [Worker] 依方案算 PeriodAmount → 產唯一 MerchantTradeNo(uid+timestamp)
│         → 簽 CheckMacValue → 回前端一張「已簽好的綠界表單」
│   🔺 風險：MerchantTradeNo 重複 → 綠界拒單 or 重放攻擊
│   🛡 防護：MerchantTradeNo 每筆唯一（uid + 毫秒時戳 + 隨機尾碼），Worker 端產、不信前端
│   🛡 防護：HashKey/HashIV 只在這一步的 Worker runtime 用到，簽完就丟，不回前端
│
├─ Step 3 [前端→綠界] 用戶被導向綠界定期定額結帳頁(綠界正式域名,寫死常數)
│         → 在綠界頁輸入卡號 + 統編/載具
│   🔺 風險：open-redirect——導向網址被前端參數拼裝,導去釣魚假結帳頁
│   🛡 防護：結帳域名 = code 寫死綠界正式域名常數,不由前端任意 URL 參數決定
│   🛡 防護：app/Worker 全程不接觸卡號(PCI 由綠界托管,見 §5)
│
├─ Step 4 [綠界→Worker] 授權成功,綠界 server POST 到 /ecpay-webhook (PeriodReturnURL)
│   🔺 風險①：偽造的成功通知
│   🛡 防護：CheckMacValue 重算驗章,失敗丟棄(紅線1)
│   🔺 風險②：同一期通知重送 → 重複解鎖 / 重複開發票
│   🛡 防護：idempotent——先查 MerchantTradeNo 是否已處理,已處理回 1|OK 但不重做
│   🛡 防護：解鎖只在這裡發生(Worker 寫 Firestore),前端不自解
│
├─ Step 5 [Worker] 驗章過 → 寫 Firestore billing(plan=pro/subscriptionId/status=active/paidAt)
│         → 呼叫綠界電子發票 API 開立(§見發票)→ 回綠界 1|OK
│   🔺 風險：發票開立失敗但扣款成功 → 用戶付了錢沒發票
│   🛡 防護：開票失敗 → retry + 告警 + 標記 invoicePending(不阻擋解鎖,但要補開)
│
├─ Step 6 [前端] 監聽 Firestore billing 變化 → plan 翻 pro → 模組解鎖 + 刷新 UI
│   🔺 風險：webhook 漏接 → 用戶付了錢但 billing 沒翻 → 卡在「處理中」
│   🛡 防護：對帳雙保險——Worker cron 定時查綠界訂單狀態 API,補解鎖漏接的(MVP 可先 webhook+告警,cron v1 補)
│
└─ Step 7 [每月] 綠界自動扣款 → 每期發 webhook 到 PeriodReturnURL → 回 Step 4
    🔺 風險①：連續扣款失敗(卡片過期/額度不足)
    🛡 防護：綠界連失敗 6 次自動取消後續扣款;Worker 監聽失敗通知 → 寄信請更新卡 + 標「付款異常」寬限期(不立刻斷,給補卡時間),達自動取消門檻才降級
    🔺 風險②：PeriodReturnURL 每期只送一次,沒收到 ≠ 沒扣
    🛡 防護：不假設「沒收到通知=沒扣款」,用定期定額訂單查詢 API 主動補查實際扣款結果
```

**ReturnURL vs PeriodReturnURL 釐清（綠界定期定額特性）**：
- **首次授權**結果回 `ReturnURL`（或 `OrderResultURL` 給前端轉址）。
- **第 2 期起**由綠界排程扣款，結果送 `PeriodReturnURL`。
- **兩個 server URL 都要驗章、都要 idempotent。** 前端轉址的 `OrderResultURL` 永遠只能顯示、不能解鎖。

---

## 5. PCI / 卡號 — app 與 Worker 絕不碰卡號

| 規則 | 內容 |
|---|---|
| **托管結帳頁 = SAQ-A 最輕等級** | 卡號（PAN）/ CVV / 到期日**只在綠界域名輸入**，app 與 Worker 完全不接觸、不傳輸、不儲存 → PCI DSS 責任落 SAQ-A，絕大部分由綠界承擔。 |
| **絕不為任何理由把卡號拉回 app** | 包括「想做更順的結帳 UX」——一旦 app 自己收卡號,PCI 責任暴增到 SAQ-D,且我們沒有那個合規能力。**這條沒有例外。** |
| **存什麼 / 不存什麼** | ✅ 存 Firestore：`subscriptionId`/`GwsrPeriod`、plan、status、paidAt、nextBillingAt、lastInvoiceNo、統編/抬頭、載具號。❌ 絕不存：卡號、CVV、到期日——**一個 byte 都不碰**。 |
| **綠界商家審核 / PCI AOC** | 綠界文件載明：用信用卡授權,商家須提供 PCI DSS 合規證明(AOC),綠界依商家實況評估、有最終審核權。多數中小商家用托管頁 = 直接符合,但**開定期定額前要確認綠界核准**（Edward 申辦時走完審核）。 |

> **驗收證據（Gate 5）**：grep 全 repo（app.html + Worker code + 所有 .md/.sh/.js）**無任何卡號欄位變數**（如 `cardNumber` / `cvv` / `expiry` 收集）。確認結帳是 redirect 去綠界、不是 app 內 iframe 收卡號。

---

## 6. 個資法（台灣 PDPA）— 實作落點

> 法律論述見 `dev-compliance-suliman.md` §3。這裡只列「卡西法/蘇菲要做出來的東西」。

| 項目 | 實作落點 | MVP? |
|---|---|---|
| **§8 蒐集告知** | 隱私權政策頁 + 服務條款頁上線。含六項告知 + **「金流由綠界處理，本服務不儲存您的信用卡卡號」**明文 + 90 天保留政策 + 交易紀錄法定保存聲明。 | 🔴 收真錢前必備 |
| **同意機制（不可預設打勾）** | 註冊/結帳前 checkbox「我已閱讀並同意隱私權政策與服務條款」——**`checked` 預設 false，用戶必須主動勾**。預設打勾 = 違反個資法「告知後同意」。 | 🔴 必備 |
| **資料最小化** | Starter 試用**不收信用卡** = 符合 §5 比例原則，繼續保持。 | ✅ 已符合 |
| **留存/刪除分離** | 見紅線 3：產品資料 90 天清、財會憑證法定保存,分離存。 | 結構 MVP / 清邏輯 v1 |
| **當事人權利窗口** | 至少 email 客服管道 + SOP，可行使查詢/更正/刪除/停止利用。 | 🟠 上線前 |
| **跨境** | 綠界在台灣（境內），無跨境傳輸問題；Firebase 建議鎖亞洲區（asia-east1）。 | 🟢 記錄 |
| **Team 成員資料**（v2） | owner 邀請時 checkbox「已取得成員同意」+ 成員首登顯示我方隱私政策。 | v2 |

---

## 7. 電子發票合規 — 實作落點

> 法律論述見 `dev-compliance-suliman.md` §2。這裡只列實作要點 + 信任風險。

| 環節 | 實作要點 | 風險點 |
|---|---|---|
| **字軌取得** | 字軌 = 2 英文字母 + 8 位數字,到公司登記地國稅局申請(或**綠界加值中心代配**)。Edward 申辦時確認綠界代配。**字軌按期(每 2 月一期,奇數月)配號,要預估月訂閱用量足夠。** | 🔺 字軌用完 → 開不出發票 → 扣了款沒發票。要監測剩餘配號 + 提前加配。 |
| **上傳財政部時機** | 綠界「每日排程自動上傳」：B2C(個人/二聯)48 小時內、B2B(公司/三聯)買受人 7 日內接收。**我們不手動上傳,但要知道「開錯不能拖」**——上傳後更正要走作廢/折讓。 | 🔺 開錯抬頭/統編 → 要作廢重開,跨月可能只能折讓。 |
| **公司戶三聯（統編）** | 結帳收「統編(8 碼)+ 抬頭」。**統編做財政部檢核碼演算法驗證**(前端先驗、Worker 再驗),防開錯抬頭。 | 🔺 統編填錯 → 開錯發票 → 作廢重開麻煩。 |
| **個人戶二聯（載具）** | 結帳收「載具類型 + 手機條碼(`/`+7 碼英數)」,做格式驗證,防歸戶失敗。 | 🔺 載具格式錯 → 用戶領不到發票 → 客訴。 |
| **開立時點** | 扣款成功(webhook 驗章過)→ Worker 呼叫綠界電子發票 API 自動開立 → email 寄送。 | 🔺 開票失敗但扣款成功 → retry + 告警 + invoicePending,不可默默漏掉。 |
| **作廢 / 折讓（退費/降級退款必走）** | **作廢**：綠界僅接受單月 13 日前作廢上期;奇數月 13 號 23:59:59 後已申報財政部,無法作廢前兩月發票 → 跨月退費多半只能折讓。**折讓**：無期限,於折讓事實發生時開立。**順序鐵則**：發票已有折讓紀錄 → 不得直接作廢,要先作廢全部折讓紀錄才能作廢發票。 | 🔺 退費三件綁定：①綠界停扣 ②開折讓/作廢 ③app 降級——缺一出爭議,走同一 SOP。 |

---

## 8. sandbox 測試計畫（上真錢前必過的 case 清單）

> 全部在**綠界測試模式**（stage 環境 + 測試金鑰 + 綠界提供的測試卡號）跑,**不碰真錢**。每個 case 要附證據（log / 截圖 / 綠界後台畫面）。
> 綠界測試卡號（官方）：`4311-9522-2222-2222`，安全碼任意 3 碼，到期日填未來。

### A. 驗章與 webhook（紅線 1 對應）
- [ ] **A1 正常授權**：sandbox 刷測試卡 → 綠界 POST webhook → Worker 驗章通過 → Firestore plan 翻 pro → 前端解鎖。附 webhook log + Firestore 文件截圖。
- [ ] **A2 偽造 webhook（關鍵）**：手動 POST 一個「改了一個欄位但 CheckMacValue 沒跟著改」的假通知到 `/ecpay-webhook` → **必須被丟棄、Firestore 不變、發告警**。這是證明「前端不能自解、只認驗章」的核心測試。
- [ ] **A3 驗章用錯金鑰**：故意用正式金鑰驗 sandbox 通知（或反之）→ 驗章失敗 → 丟棄。證明環境金鑰切換正確。
- [ ] **A4 webhook 重送（idempotent）**：同一筆 MerchantTradeNo 的 webhook 連送兩次 → 只解鎖一次、只開一張發票、回 `1|OK`。
- [ ] **A5 前端偽造解鎖嘗試**：直接在前端 console 模擬「收到 OrderResultURL 轉址」→ 確認**沒有任何前端路徑能把 plan 改成 pro**（plan 只由 Firestore 翻轉,而 Firestore 只由 Worker 寫）。

### B. 金額與訂單（紅線 1 延伸）
- [ ] **B1 前端竄改金額**：前端送單時把金額參數改成 1 → Worker 仍依 PLAN_CATALOG 算 499 簽章 → 綠界收到的是 499。證明金額 server 端決定。
- [ ] **B2 MerchantTradeNo 唯一性**：連續發兩單,確認 MerchantTradeNo 不重複。

### C. 取消停扣（紅線 2 對應）
- [ ] **C1 取消即停扣（關鍵）**：sandbox 建定期定額 → app 內取消 → Worker 呼叫綠界停用 API → **登入綠界 sandbox 後台確認該授權狀態 = 停用**。附後台截圖（不接受 app 顯示已取消當證據）。
- [ ] **C2 取消失敗處理**：模擬綠界回停用失敗 → app**不可**標記已取消 → 回「請聯絡客服」+ 告警。
- [ ] **C3 取消後當期續用**：取消後 plan 維持到 nextBillingAt,到期才降 free。

### D. 扣款失敗與重試（flow Step 7 對應）
- [ ] **D1 扣款失敗通知**：模擬卡片額度不足扣款失敗 → 收到失敗 webhook → 寄信請更新卡 + 標「付款異常」寬限期,不立刻斷服務。
- [ ] **D2 連續失敗自動取消**：模擬連失敗達綠界門檻(6 次)→ 綠界自動取消 → app 降級 free。
- [ ] **D3 漏接補查**：手動讓一筆 PeriodReturnURL 不送達 → Worker cron(或手動觸發查詢)用訂單查詢 API 補查到實際已扣 → 補解鎖。（MVP 若 cron 未做,至少驗證「告警有觸發」。）

### E. 電子發票（§7 對應）
- [ ] **E1 公司戶三聯**：填統編(用測試統編)+ 抬頭 → 扣款成功自動開三聯式 → email 收到。
- [ ] **E2 個人戶二聯**：填手機載具 → 開二聯式 → 載具歸戶成功。
- [ ] **E3 統編檢核碼擋錯**：填一個檢核碼不對的假統編 → 前端 + Worker 都擋下,不送開票。
- [ ] **E4 載具格式擋錯**：填格式錯的載具 → 擋下。
- [ ] **E5 開票失敗 retry**：模擬開票 API 失敗 → retry + 告警 + 標 invoicePending（扣款仍成功、用戶有服務,但發票待補）。
- [ ] **E6 折讓**：對一筆已開發票開折讓證明單 → 綠界後台確認折讓成功。
- [ ] **E7 作廢順序鐵則**：對已有折讓的發票嘗試直接作廢 → 確認被擋（要先作廢折讓）。

### F. 個資與同意（§6 對應）
- [ ] **F1 同意 checkbox 預設未勾**：結帳頁 checkbox 預設 `false`,不勾不能送出。
- [ ] **F2 卡號不落地**：grep 全 repo 無卡號收集欄位;確認結帳是 redirect 去綠界。
- [ ] **F3 資料分離**：建一筆交易 → 確認 invoices/transactions 在獨立 collection + legalRetention 標記。

### G. 環境切換（上線最易爆點）
- [ ] **G1 stage→prod 金鑰切換**：確認 Worker 依 `ECPAY_ENV` 讀對的金鑰 + 打對的域名。**上線前最後一關：確認沒有殘留 sandbox 金鑰/域名。**

---

## 9. 🚦 上真錢前必過 Checklist（Gate 5 信任關卡）

> 收第一筆真錢前逐項過,每項附證據（截圖/code 位置/綠界後台/sandbox log）。**不接受空口 PASS。**
> 提醒（6/5 定位）：以下是我建議的保護 + 我願親手把鎖/驗章/格式驗證寫好。最終上線 Edward 拍板。

### 🔴 必過（缺任一,強烈建議不開收費）
- [ ] **HashKey/HashIV 只在 Worker secret**——grep 全 repo（app.html + Worker + .md/.sh/.js）**零金鑰外洩**
- [ ] **webhook 雙向 CheckMacValue 驗章**已實作,sandbox A2 偽造測試「被丟棄」通過
- [ ] **前端無任何自行解鎖路徑**——sandbox A5 通過（plan 只由 Worker 寫 Firestore）
- [ ] **金額 server 端決定**——sandbox B1 通過（前端改金額無效）
- [ ] **取消訂閱真停扣**——sandbox C1「綠界後台確認停用」截圖
- [ ] **財會憑證與產品資料分離存**——schema 證明 invoices/transactions 獨立 + legalRetention 標記
- [ ] **隱私權政策 + 服務條款上線**——含卡號不存聲明 + 90 天保留 + 交易法定保存
- [ ] **同意 checkbox 不可預設打勾**——sandbox F1 通過

### 🟠 強烈建議（上線前補齊）
- [ ] webhook idempotent（A4 通過）
- [ ] open-redirect 防護——結帳域名 code 寫死綠界正式域名常數
- [ ] 扣款失敗寬限期 + 寄信 UX（D1 通過）
- [ ] 發票統編/載具格式驗證 + 檢核碼（E3/E4 通過）
- [ ] 退費三件綁定 SOP（停扣 + 折讓/作廢 + 降級）
- [ ] stage→prod 金鑰/域名切換確認（G1 通過,**上線最後一關**）
- [ ] 卡號不落地 grep（F2 通過）

### 🟢 建議（v1 補,不擋首筆收費）
- [ ] 對帳 cron 主動查綠界訂單（webhook 漏接第二道網,MVP 先告警頂著）
- [ ] 90 天清資料 Cloud Function（結構 Day-1 先分離,邏輯 v1 補）
- [ ] 字軌剩餘配號監測 + 提前加配告警
- [ ] 異常監控告警通道（扣款失敗/驗章失敗/開票失敗）整合 Sentry

### 外部前置（只有 Edward 能做,城堡無法代勞）
- [ ] 綠界商店帳號（代號 3502366）已開、商家審核通過（含**定期定額** + **電子發票** API 權限）
- [ ] 綠界 PCI AOC / 托管頁模式核准確認
- [ ] 電子發票字軌已申請（或確認綠界代配）+ 配號足夠
- [ ] 營業登記 / 統一編號（開發票主體）
- [ ] 隱私權政策/服務條款定稿（城堡起草,$10K+ ACV 企業客戶建議外部律師複核）

---

## 10. 我最擔心的 3 個風險（沙利曼直話）

> 排序 = 我認為最可能出事 + 出事最痛的。

### 1️⃣ 取消訂閱沒真停扣（紅線 2）— **最可能上社會新聞的坑**
這是所有 SaaS 金流裡**最容易「以為做了其實沒做」**的——因為 app 內標記「已取消」很容易寫,但真正去呼叫綠界停用 API 是另一回事,而且**測試時很容易只看 app 顯示、不看綠界後台**。一旦用戶取消後下月還被扣,就是 chargeback + 消保 + PTT。**所以 sandbox C1 我堅持「要綠界後台截圖」,不接受 app 畫面。** 這條我最盯。

### 2️⃣ webhook 漏接 / 前端自解（紅線 1）— **金流真相被前端綁架**
兩個方向都危險：① 漏接 → 付了錢沒解鎖 → 用戶罵 → 退費。② 圖快讓前端拿轉址就解鎖 → 白嫖 + 偽造付款。**SaaS billing 史上最常見的兩個洞都在這。** 對帳雙保險(webhook + cron 補查)MVP 至少要有「webhook + 告警」,cron 可 v1。**前端自解這條我零容忍**——sandbox A5 必過。

### 3️⃣ 90 天清資料一鍵端走財會憑證（紅線 3）— **安靜的合規地雷**
這個不會立刻爆,但**國稅局查核時爆**——而且最隱蔽,因為「清資料」功能寫起來很自然就會 `recursiveDelete(users/{uid})` 整碗端。**關鍵是 Day-1 就把 invoices/transactions 存獨立 collection**,不然 v1 要回頭拆很痛。清資料邏輯可以晚做,**但資料分離的架構決定現在就要對**——這是我在 design 階段（Gate 0）就要釘死的,不能等 Gate 5。

### 額外提醒（不算風險,是時程現實）
綠界商店帳號審核是**外部等待**(數天到兩週),卡在 critical path 起點,但**不是城堡能加速的**。建議 Edward 趁城堡做階段一（不碰錢批）那幾天**立刻去申辦綠界**,金鑰一到、城堡無縫接 §4 的金流串接。這條卡西法 R5 也標了，我們一致。

---

## 附註 · 本檔與 `dev-compliance-suliman.md` 的分工

| | `dev-compliance-suliman.md`（6/24） | 本檔 `ecpay-integration-trust-spec.md`（6/25） |
|---|---|---|
| 定位 | **為什麼 / 合規依據**（Gate 0 + Gate 5 論述版） | **怎麼做 / 實作契約**（給卡西法串綠界） |
| 內容 | 法條引用、PCI 等級、PDPA §5/§8/§11、字軌規範、vendor 風險 | 架構事實、機密界線、紅線實作要點、flow 風險點、CheckMacValue 演算法、sandbox case 清單 |
| 讀者 | Edward 拍板 + 沙利曼自己 review | 卡西法照著實作 + 沙利曼 Gate 5 驗收 |

兩份互補、不重複。法律細節查 6/24 那份,實作與驗收照本檔。

---

*沙利曼 · Head of Trust · 2026-06-25 · 階段二金流批前置 · 只寫 spec、未碰任何 app/Worker code · 機密界線（3502366 可寫 / HashKey·HashIV 絕不進 git）寫死 · 三紅線展開可執行 + sandbox 27 case + Gate 5 checklist*
