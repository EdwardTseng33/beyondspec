# BeyondSpec SaaS 計費系統 — 技術實作計畫 + 雙軌工時

> 作者：卡西法（CTO / 技術）· 2026-06-24
> 性質：把 SaaS 帳號/方案/金流/Team 落地的技術實作計畫 + 雙軌工時，給 Edward 拍板 + 城堡排程
> 依據：saas-account-billing-plan.md（帳號/方案/金流 v1）· dev-roadmap-howl.md（霍爾 CPO roadmap）
> 方法：實讀 path/app/index.html（42,989 行 / 3.2MB single-file SPA）原始碼，逐一定位四大系統實況，非憑霍爾摘要規劃。

---

## 0. 一句話技術結論

> 這不是「建計費系統」，是「把既有的半自動帳號系統接上綠界自動化 + 把 localStorage 計量升成 Firestore 權威計量」。地基比兩份規劃假設都成熟——server proxy 在、credit 已實扣、唯讀鎖已存在、手動付費隧道已通。MVP 真正從零的只有兩塊：①綠界金流 webhook ②時間到期觸發器。其餘全是「改造既有」。

---

## 1. 地基實況盤點（實讀原始碼修正版）

霍爾的 roadmap 紮實，但他看的是「產品形狀」，我鑽的是「技術接點」。實讀後三處比他的盤點再成熟一級，直接縮短工時。

| 系統 | 霍爾盤點 | 卡西法實讀真相（行號） | 工時影響 |
|---|---|---|---|
| Server AI proxy | 待確認 | 已存在且已部署 — Cloudflare Worker path-ai-proxy.edwardt0303-281.workers.dev（line 12264，v0.33.0），前端 window.PATH_AI.call() 已走它（line 12283-12345），Claude key 不在前端 | 省掉「從零建 proxy」；webhook / server 權威計量有現成落腳點 |
| Credit 扣減 | 半成品·沒扣減 | 已實扣 — PATH_AI.call() 回來後 state.creditUsed += credits + 寫 creditStats + saveState()（line 12327-12342）；checkCreditReset() 月度自動歸零（line 12362）；另有 useCredits()/checkCredits() 同步路（line 10034-10055）。霍爾 grep 不到 deductCredit 是因命名是 state.creditUsed += | 缺的不是扣減邏輯，是持久化到 Firestore + server 端權威計量防作弊。扣減本體可沿用 |
| Starter 到期鎖 | 從零 | 唯讀鎖機制已存在 — 降級流程已有「90 天唯讀模式：可看可匯出、不可新增編輯」完整 modal（line 10409）+ body.hd-locked（line 5897）+ nav .locked-item（line 507-508）+ MODULE_MIN_PLAN guard（line 10097） | 複用降級唯讀邏輯，缺的只有時間到期觸發器 + read-only 實際攔截編輯動作層 |
| 付費隧道 | 完全沒有 | 半套手動隧道已通 — openSubscribeFlow() 早鳥期走 /path/?apply=xxx modal（line 10281-10297）寫入 Firestore applications collection，admin 後台列表已有（line 30862-30879），人工開通 | 綠界 = 把人工開通換成 webhook 自動開通 + 自動扣款。資料層 + UI 入口已在 |
| Firestore sync | 未提 | state-to-Firestore mirror patch 已有（line 9994-10002 _scheduleFirestoreSync）；payroll 模組已示範權威雲端模式（users/{uid}/payroll_*，Firestore 規則只放行本人，line 40247-40289） | billing 直接抄 payroll 的權威雲端 pattern，不發明新架構 |
| 方案目錄 | 改規格 | 確認 — PLAN_CATALOG（line 10114）free/starter/pro/enterprise + MODULE_MIN_PLAN（line 10097）+ PLAN_RANK（line 10104）+ changePlan()（line 10427）。現價 starter 290 / pro 990 不等於 Edward 拍板（PRO 499 / MAX 999 / Starter 免費） | 純改 config object 數字 + key rename，框架不動 |

架構事實（寫死，後續排程依此）：
- 唯一 prod 程式來源 = path/app/index.html single-file SPA（vanilla JS 為主，ES5：var/function，無 const/let/arrow — 動刀守 CLAUDE.md ES5 鐵律）
- 帳號層 = Firebase Auth（Google/email）+ Firestore（users/{uid}/* 權威、規則只放行本人；workspaces/{uid} 父文件已建）
- AI 層 = Cloudflare Worker proxy（已部署）— server 端唯一可信執行環境，金流 webhook + 權威 credit 計量都掛這裡，不另開後端
- 計費狀態現況 = 存 localStorage（bp_plan / bp_creditUsed / bp_state），鏡像 Firestore。付費後必須翻轉成 Firestore 權威、localStorage 只是 cache — 否則用戶清 localStorage 就能 reset credit / 偽造 plan（毛利 + 安全漏洞）

---

## 2. 四塊技術實作計畫

### ① 帳號地基改造（對齊新 4 方案 + AI 額度權威計量）

技術做法（改造既有，不重寫）：
1. 改 PLAN_CATALOG config（line 10114）：
   - starter：290 改 0（免費）、credits 600 改 50、加 trialDays 7 欄位、模組改全模組（Max 級，對齊拍板 Starter 全模組）
   - pro：990 改 499、credits 3000 改 50、模組改職務制核心組（MVP 先固定一組：報價/收款/客戶/任務，職務制 UI 延 v1）
   - 新增 max：999、credits 1000、全模組（或把現 enterprise rename 成 max 並改數字，省一個 key）
   - MODULE_MIN_PLAN / PLAN_RANK 同步調 mapping（line 10097/10104）
   - 三處價格字串要同步：PLAN_CATALOG（line 10114）+ lpSetCycle priceMap（line 10267）+ getCreditLimit（line 10007）。現在散三處，不同步會出現設定頁顯示 A、landing 顯示 B。改造時統一成單一 source（getCreditLimit 改成讀 PLAN_CATALOG 的 credits，刪掉 hardcode）
2. AI 額度權威計量（升 localStorage 改 Firestore + server）：
   - 前端：state.creditUsed 改成從 Firestore users/{uid}/billing/usage 文件讀寫（沿用 payroll 的 _userBase() pattern）；保留 localStorage 當 cache + 離線 fallback
   - server（Cloudflare Worker）：proxy 回應前，在 Worker 端用 Firestore Admin SDK（或 REST）原子扣減 creditsRemaining，這才是防作弊的權威點。前端扣減只是 UI 即時回饋，真正的閘門在 Worker：credits 用盡（小於等於 0）時 Worker 直接拒絕呼叫（回 402），前端收到就擋
   - 月度 reset：沿用 checkCreditReset() 邏輯，但 reset 動作也要 server 端做（避免用戶改本機時間提前 reset）

關鍵技術風險：
- R1（中）：Worker 端接 Firestore 需要 service account 金鑰，不能放前端，要放 Worker secret（Cloudflare env var）。Worker 原本可能只代理 Anthropic，現在要加 Firestore 讀寫權 = Worker 要升級 + 重新部署 + 測。沙利曼 Gate 5 必驗 service account 權限範圍（只給 billing collection，不給全庫）
- R2（低）：localStorage 改 Firestore 遷移時，現有用戶的 creditUsed 要一次性 migration 上雲，避免歸零或重複扣

雙軌工時：
- 改 catalog config + 三處價格統一：預估 0.5 人天 / 移動城堡 1.5 小時
- AI 額度權威計量（前端 Firestore 讀寫 + Worker 端原子扣減 + migration）：預估 3 人天 / 移動城堡 8 小時（Worker 改動 + 跨前後端測試是主成本）
- 小計：預估 3.5 人天 / 移動城堡 9.5 小時

前置依賴：Cloudflare Worker 原始碼存取權（要改 Worker，得能 deploy）；Firestore service account 金鑰（Edward 從 Firebase console 產，給 Worker secret）

---

### ② Starter 7 天試用 + 到期軟鎖

技術做法（複用降級唯讀，補時間觸發器）：
1. 建立日記錄：註冊時（Firebase Auth onAuthStateChanged 首次）寫 users/{uid}/billing 的 trialStartedAt（serverTimestamp，用 server 時間不用本機，防改鐘）+ trialDays（讀 config，不寫死 7，採霍爾盲點 6.1 建議，當可調參數，未來 A/B）
2. 倒數狀態計算：getTrialState() 純函式，比對 trialStartedAt + trialDays 天 vs now，回 status（active/expiring/locked）+ daysLeft。expiring = 剩 2 天以內
3. Day 5/6 提醒：進站時 getTrialState() 回 expiring 顯示 banner（複用 .sub-trial-badge 既有樣式 line 1033）還有 X 天，升級保留資料 + 繼續用
4. Day 7 到期軟鎖（status locked）：
   - 複用降級唯讀機制：set body.hd-locked（line 5897 已有 CSS）+ 所有模組 nav 加 .locked-item（line 507）+ 進站顯示升級解鎖你的資料牆
   - read-only 實際攔截（這是缺的部分）：所有新增/編輯/儲存按鈕的 handler 進入點加一道 guard（isTrialLocked 為真就 return showUpgradeWall）。做法：集中在各模組的 save 函式頂部插 guard（不是逐顆按鈕改），用一個全域 _guardWrite() wrapper
   - 一鍵匯出保留：匯出函式不加 guard（讓用戶能帶走資料 = 轉換槓桿 + 個資法信任）
5. 90 天清資料：MVP 不做（霍爾 2.4，合規義務非 Day-1 緊迫）；v1 用 Cloud Function 排程

關鍵技術風險：
- R3（中）：read-only 實際攔截要找出所有寫入點。app 有 14 模組、寫入函式散落，若漏一個，鎖了還能編輯（信任破口）。緩解：不逐顆改，集中攔在 saveState() + 各模組 saveXxxCloud() 的統一入口；Gate 1 Chrome MCP 逐模組實測鎖定後按儲存應被擋
- R4（低）：trialStartedAt 用 serverTimestamp，但離線時讀不到，fallback 用本機時間 + 上線後校正（容忍幾分鐘誤差，不影響 7 天尺度）

雙軌工時：
- 建立日 + 倒數狀態 + 提醒 banner：預估 1.5 人天 / 移動城堡 4 小時
- 到期軟鎖 + read-only 統一攔截 + 升級牆：預估 2.5 人天 / 移動城堡 6.5 小時（找全寫入點 + 逐模組實測是主成本）
- 小計：預估 4 人天 / 移動城堡 10.5 小時

前置依賴：① 帳號地基的 Firestore billing 文件結構先定（trialStartedAt 掛這）；Edward 一句話確認霍爾盲點 6.1（時間倒數鎖 vs 功能配額鎖，這決定整塊做不做）

---

### ③ 綠界金流（信用卡定期定額 + 電子發票 + webhook 解鎖）

技術做法（從零，但掛在既有 Worker + applications 隧道上）：

架構流程：
app 內選 PRO，openSubscribeFlow(pro)，改成導向綠界信用卡定期定額結帳頁（帶 MerchantTradeNo = uid+timestamp），用戶在綠界頁填卡號 + 統編/載具（app 全程不碰卡號，PCI 由綠界托管），綠界授權成功，綠界 server-to-server POST webhook 到 Cloudflare Worker 新端點 /ecpay-webhook（驗 CheckMacValue 防偽造，寫 Firestore users/{uid}/billing 的 plan=pro / subscriptionId / status=active / paidAt，呼叫綠界電子發票 API 開立 公司戶統編或個人載具，email 寄送），app 端監聽 Firestore billing 文件變化，plan 翻 pro，模組解鎖；之後每月綠界自動扣款，每次發 webhook，Worker 續期 + 開發票

存什麼 / 不存什麼（卡號絕不落地）：
- 存 Firestore：subscriptionId（綠界定期定額授權 ID）、plan、status、paidAt、nextBillingAt、lastInvoiceNo、統編/抬頭（開票用）、載具號
- 絕不存：卡號、CVV、卡片到期日。全部留在綠界，app/Worker 一個 byte 都不碰（PCI 合規核心）
- Worker secret：綠界 HashKey / HashIV（簽章用）放 Cloudflare env var，不進 git

對帳雙保險（防 webhook 漏接 = 付了錢沒解鎖）：
- 主：webhook 即時解鎖
- 備：Worker 定時（cron）主動查綠界訂單狀態 API，補解鎖漏接的；解鎖失敗 retry + 人工告警（沿用 Sentry 上報通道 line 42985 已有骨架）

關鍵技術風險：
- R5（高，這是 MVP 最大風險）：綠界商店帳號審核 = 外部依賴 + 純等待，不是寫 code 速度問題（霍爾 6.3 已點，我完全同意）。申辦、審核、拿金鑰可能數天到一兩週，卡在 critical path 起點。緩解：Edward Day-1 立刻申辦；審核期間城堡先做帳號/Starter（不依賴綠界），不空等
- R6（高）：webhook 漏接，付款狀態不一致。SaaS billing 最易出錯處。緩解：webhook + cron 主動查雙保險 + 對帳告警（上面已設計）
- R7（中）：電子發票字軌/上傳合規（財政部規範）。緩解：用綠界托管開立（不自建字軌），個人/公司戶分流測過；沙利曼 Gate 5 必驗

雙軌工時：
- 綠界定期定額結帳串接（前端導向 + Worker webhook 端點 + CheckMacValue 驗章 + Firestore 寫入）：預估 4 人天 / 移動城堡 11 小時
- 電子發票 API（開立 + 公司/個人分流 + email）：預估 2.5 人天 / 移動城堡 7 小時
- 對帳 cron + retry + 告警：預估 1.5 人天 / 移動城堡 4 小時
- 小計：預估 8 人天 / 移動城堡 22 小時（不含綠界審核等待，那是日曆時間不是工時）

前置依賴：綠界商店帳號 + HashKey/HashIV + 定期定額權限 + 電子發票 API 權限（只有 Edward 能申辦）= 硬前置，沒有它整塊寸步難行；Cloudflare Worker deploy 權限；沙利曼 Gate 5 合規驗

---

### ④ Team seat（主帳號 + 邀請 + 逐人方案 + 合併計費）

技術做法（從零，最複雜，推 v2）：
1. seat 資料模型：workspaces/{ownerUid}/seats/{memberUid} 每筆 email / plan（pro 或 max）/ modulePerms / status；owner 文件持 subscriptionId（一張綠界授權）
2. 邀請流程：owner 輸入 email，寫 seats pending，受邀者登入時比對 email，加入空間（複用 memberEmails 既有機制 line 40223）
3. 逐人權限：owner 對每 seat 指派 modulePerms，該成員的 isModuleAvailable 改讀 seat 的 perms 而非個人 plan（要改 isModuleAvailable 簽名 line 10106 支援 seat-aware）
4. 合併計費金額：各 seat 的 plan 月費加總，owner 一張綠界定期定額授權，金額 = 總和。加/減人，次期生效（霍爾 v2 建議，避免按比例退費的對帳地獄）
5. 一張發票：開給 owner（統編 + 抬頭）

關鍵技術風險：
- R8（高）：合併計費的授權金額動態調整是綠界定期定額最易錯處（改金額要重新授權 或 用綠界的金額變更 API）+ 對帳。緩解：次期生效（不做當期按比例）；Markl Gate 4 把計費狀態機當測試重點
- R9（中）：seat-aware 權限要改 isModuleAvailable 核心函式，它被全站 sidebar/guard 呼叫（grep 到 10+ 處 line 10504/10617/10628）。改簽名要回歸測全站。緩解：保持向後相容（無 seat 時 fallback 個人 plan）

雙軌工時：
- seat 資料模型 + 邀請 + 加入空間：預估 3 人天 / 移動城堡 8 小時
- 逐人模組權限（改 isModuleAvailable seat-aware + owner 指派 UI）：預估 3 人天 / 移動城堡 8 小時
- 合併計費（金額計算 + 綠界授權金額調整 + 一張發票）：預估 3.5 人天 / 移動城堡 9 小時
- 小計：預估 9.5 人天 / 移動城堡 25 小時

前置依賴：③ 綠界金流隧道穩定跑通（Team 是在單方案隧道上加 seat 計算）；① 帳號地基的 Firestore 結構；v1 的職務制 entitlement（Team 要組合 PRO/MAX seat 權限）

---

## 3. 雙軌工時總表

| 塊 | 技術性質 | 預估工時 | 移動城堡 | MVP? |
|---|---|---|---|---|
| ① 帳號地基改造（catalog 改價 + AI 額度權威計量） | 改造既有 | 3.5 人天 | 9.5 小時 | 部分（catalog 改價 + credit 權威化是 MVP；其餘優化 v1） |
| ② Starter 7 天試用 + 到期軟鎖 | 複用唯讀 + 補觸發器 | 4 人天 | 10.5 小時 | MVP 核心 |
| ③ 綠界金流（定期定額 + 發票 + webhook） | 從零（掛既有 Worker） | 8 人天 | 22 小時 | MVP 核心 |
| ④ Team seat（合併計費） | 從零（最複雜） | 9.5 人天 | 25 小時 | 推 v2 |
| MVP 小計（①核心 + ② + ③） |  | 約 13 人天 | 約 37 小時 |  |
| 全做（①②③④） |  | 約 25 人天 | 約 67 小時 |  |

倍率區間：金流串接的瓶頸不在寫 code，是綠界審核 + webhook 對接測試 + 沙利曼合規驗 + Edward 審核迴圈。城堡並行寫 code 很快，但跨前後端 + 外部金流 API 的整合測試是 bottleneck，倍率落在 8-15x 區間（無 preview、prod 直審）。MVP 的日曆時間大概率卡在綠界商店帳號審核（數天到兩週），不是這 37 小時。

---

## 4. MVP 最小技術切點（我的技術判斷）

完全同意霍爾的 PRO 單方案先收第一筆錢。從技術角度再收斂，MVP 真正必須寫的程式最小集：

MVP 技術範圍（能收到第一筆 NT 499 的最小集）
1. catalog 改價對齊拍板（PRO 499 + Starter 免費 + 三處價格統一）— 0.5 人天
2. AI 額度權威化（Worker 端原子扣減 + Firestore 持久化 + 用盡封頂）— 毛利護欄，不能省 — 3 人天
3. Starter 7 天倒數 + 軟鎖 read-only + 升級牆（時間觸發器 + 複用唯讀 + 統一寫入攔截）— 4 人天
4. 綠界定期定額單方案串接（PRO 一條隧道：選方案、綠界結帳、webhook 解鎖）— 4 人天
5. 綠界電子發票自動開立（公司/個人分流）— 2.5 人天
6. 對帳保險最小版（webhook + 解鎖失敗告警，cron 主動查可 v1 補）— 1 人天

MVP 技術小計：約 15 人天 / 移動城堡約 40 小時（含對帳告警；不含綠界審核等待）

MVP 明確不寫（技術上可延後零損失）

| 不進 MVP | 技術理由 |
|---|---|
| MAX 999 | 純多一個 PLAN_CATALOG row + 價格按鈕，entitlement 參數差，金流隧道 100% 共用，v1 加幾乎零增量風險 |
| Team seat ④ | 整套 seat 模型 + 改 isModuleAvailable 核心 + 合併計費狀態機 = 最大技術風險區，且主 ICP 不需要 |
| 職務制模組選擇器 | entitlement 的 UI 包裝，不影響能不能扣款，先固定核心模組組 |
| Credit 精算回填 | MVP 用 tokensToCredits 估算值扣（誤差容忍），真實 usage 回填 v1 補 |
| 年繳 SKU | 多一個價格維度 + 折扣邏輯，月繳單狀態先驗證 |
| 90 天清資料排程 | 合規義務非 Day-1 緊迫，Cloud Function 排程 v1 補 |
| 對帳 cron 主動查 | webhook + 告警先頂著，cron 是漏接的第二道網，v1 補 |

技術切點的關鍵順序（依賴鏈）

Edward 申辦綠界（Day-1，外部等待），審核期間並行做：① catalog 改價（0.5d，無依賴，立刻做），② AI 額度權威化（3d，依賴 Firestore billing 結構），③ Starter 7天軟鎖（4d，依賴 ② 的 billing 文件結構）。綠界金鑰到手後：④ 綠界定期定額串接（4d，硬依賴綠界金鑰），⑤ 電子發票（2.5d，依賴 ④ 跑通），⑥ 對帳告警（1d，依賴 ④）。最後：沙利曼 Gate 5 合規驗（卡號不落地 / 發票字軌 / service account 權限 / 個資），Markl Gate 4 計費狀態機測 + 卡西法 Gate 1 Chrome MCP 逐模組實測鎖定攔截。

①②③ 不依賴綠界，綠界審核那幾天到兩週城堡先把這 7.5 人天做掉，金鑰一到手直接接 ④⑤⑥，不空等。

---

## 5. 三個最大技術風險（收斂版）

| # | 風險 | 機率 | 影響 | 緩解 |
|---|---|---|---|---|
| R5 | 綠界商店帳號審核拖長（外部依賴，純等待，卡 critical path 起點） | 高 | 高 | Edward Day-1 立刻申辦；審核期城堡先做 ①②③（不依賴綠界的 7.5 人天），不空等 |
| R6 | webhook 漏接，付了錢沒解鎖 / 扣了款沒記錄（SaaS billing 最易錯處，傷信任） | 中 | 高 | webhook 即時 + cron 主動查綠界訂單雙保險 + 解鎖失敗 retry + Sentry 告警（骨架已有 line 42985）；MVP 至少 webhook + 告警 |
| R1/R3 | Worker 接 Firestore 需 service account（權限要收斂，沙利曼必驗）+ read-only 攔截漏寫入點（鎖了還能編 = 信任破口） | 中 | 中-高 | service account 只給 billing collection、放 Worker secret；攔截集中在 saveState/saveXxxCloud 統一入口（不逐顆按鈕），Gate 1 逐模組實測鎖後按儲存應被擋 |

---

## 6. 前置依賴總清單（給 Edward / 蘇菲排程）

硬前置（沒有它對應塊做不了）：
1. 綠界商店帳號 + HashKey/HashIV + 定期定額權限 + 電子發票 API 權限（只有 Edward 能申辦）— ③④ 的命脈，Day-1 立刻動
2. Firestore service account 金鑰（Edward 從 Firebase console 產，給 Worker secret）— ① 權威計量要 Worker 寫 Firestore
3. Cloudflare Worker deploy 權限（要改現有 proxy Worker，得能部署）— ①③④ 都要動 Worker

待 Edward 一句話確認（決定做哪套，不確認會做錯方向）：
4. 霍爾盲點 6.1：Starter 要 7 天時間倒數鎖 還是 永久免費 + 功能配額鎖？這決定 ② 整塊的做法（時間觸發器 vs 配額牆，完全不同）。我的技術建議同霍爾：7 天當可調參數做（config 不寫死），先驗證再用數據 A/B
5. 霍爾盲點 6.2：MVP 接受 PRO = 固定核心模組組、職務制延 v1 嗎？

城堡內部依賴：
6. 沙利曼 Gate 5（金流合規、卡號不落地、service account 權限、發票字軌、個資）— ③ 上線前必驗
7. Markl Gate 4（計費狀態機測試）+ 卡西法 Gate 1（Chrome MCP 逐模組實測鎖定攔截）
8. 女巫 Gate 2（升級牆 + 綠界結帳前頁 + 發票流程 UX）

---

## 7. 我的技術立場（CTO 直話）

1. 這份不是從零建計費系統，別當大工程嚇自己。地基實讀後：proxy 在、credit 已扣、唯讀鎖已存在、付費隧道半通。MVP 真正從零的只有綠界 webhook + 時間到期觸發器兩塊，其餘全是改造。40 小時移動城堡時間能讓 Edward 收到第一筆 NT 499，前提是綠界審核別卡太久。
2. 不重寫 app.html。守 single-file SPA + ES5 + 改造既有。任何趁機重構的念頭 = 技術債陷阱，MVP 階段一律不碰（女巫/馬魯克若提視覺重構，排 v1 後）。
3. credit 權威化不能省。現在 credit 存 localStorage = 用戶清快取就能 reset 額度 / 偽造 plan。這是毛利 + 安全雙漏洞，必須 Worker 端權威扣減。這是 MVP 唯一看不見但不能省的基礎建設。
4. 綠界是 critical path，城堡不是。真正的 bottleneck 是綠界審核 + 合規 + webhook 對接測試，不是城堡寫 code。所以 ①②③ 並行先做、金鑰到手秒接 ④⑤⑥ 是唯一不浪費時間的排法。
5. 只規劃，沒動任何一行 app.html / landing。這份是計畫，等 Edward 拍板 + 蘇菲排程，我再依城堡 Gate 流程動刀（render 函式 SOP / Chrome MCP smoke / 分批改 / Gate 1 實測）。

---

卡西法 · CTO · 2026-06-24 · 建立在實讀 path/app/index.html 42,989 行原始碼之上 · 四塊各含技術做法/風險/雙軌工時/前置依賴 + MVP 最小技術切點 · 修正霍爾三處從零為改造既有（proxy/credit/唯讀鎖實況更成熟）· 絕未直接改 app.html / landing
