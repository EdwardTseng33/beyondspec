# BeyondSpec Team（團隊）機制 — 設計＋架構計畫書

> 2026-06-25 · 霍爾（CPO）誠實評估 + 補完整 Team 設計
> 性質：PRD 級架構文件。Team seat 開發依據（階段三 / saas-account-billing-plan.md §4 的完整化）。
> 對焦：誠實判斷現有 §4 完善度 → 盤缺口 → 補完整可執行設計 → 估時 → 標風險。
> **本文只規劃、不碰 app code。**

---

## 〇、TL;DR（給 Edward 的 3 句話）

1. **目前架構與設計完善度 ≈ 25%、最大缺口是「地基方向錯」**：§4 是一份漂亮的「商業模型」（賣什麼、怎麼算錢、開幾張發票都對），但它**不是設計**——完全沒回答「怎麼運作」。而且它建立在一個對 Team 不成立的地基上：現在 `workspaceId = owner 的 uid`、所有資料綁 `users/{uid}`、訂閱綁「登入的人」而非「空間」。要做 Team，不是補幾個欄位，是**地基要從「以人為中心」轉「以空間為中心」**。
2. **可行、但有一個必須先付的地基稅**：建在現有 Firebase + workspace 上可行（不用換技術棧），但要先做「workspace 實體化 + 訂閱搬到空間級」這層地基，**這層不做、後面 seat / 權限 / 合併計費全是沙上建塔**。地基稅約佔整個 Team 工程的 40%。
3. **最該先決定的是「seat 的最小可賣版本（MVP）長怎樣」**：完整 Team（模組級權限矩陣 + proration + 自動改授權金額 + 資料隔離）是 L 級大工程（估 ~22 城堡小時 / 對口 11 天）。但有一條**「能先收到錢」的最小路徑**（owner 手動邀人 + 二級權限 + 合併計費但**人工調帳**），能用 ~7 城堡小時先驗證有沒有人買 Team，再決定要不要把剩下的工程做完。我強烈建議走這條。

> 一句話判斷：**完善度 ≈ 25%，最大缺口 = 地基是 user-centric、Team 需要 workspace-centric（資料歸屬 + 訂閱歸屬都要搬家）。§4 的商業帳算對了，但底下沒有承接它的房子。**

---

## 一、Problem Statement（為什麼要做、痛點在哪）

### 用戶痛點
台灣小型服務團隊（工作室 / 設計公司 / 顧問 / 接案團隊，2–15 人）目前的真實情況：
- 老闆（owner）一個人在 BeyondSpec 跑全部模組，**團隊其他人看不到、進不來**。
- 報價、客戶、收款是「全公司的事」，但現在綁在老闆個人帳號底下——員工要查客戶聯絡方式得問老闆。
- 老闆不想每個成員各自開一個獨立帳號各自付費（資料各自一份、無法協作、要開 N 張發票報帳麻煩）。
- 台灣團隊還有一個特性：**常有臨時外包 / 兼職 / 接案夥伴**，老闆不想為每個人都長期付一個 seat。

### 商業問題
- Team 是 **ARPU 放大器**：單人 Pro 499 → 一個 5 人 team 可能是 999 + 4×499 ≈ NT$2,995/月，**單一付費關係的價值 ×6**。
- Team 也是 **黏著度錨**：一旦團隊資料 + 協作習慣建立在 BeyondSpec，遷移成本極高，churn 大幅下降。
- 但 Team **錯誤上線比不上線更糟**：合併計費算錯帳、員工看到不該看的薪資資料、owner 離職資料卡死——任何一個都是信任崩塌，且台灣小團隊老闆口碑傳播快。

### 為何現在做（時機判斷）
- v1.12.0 剛上線（試用軟鎖 + 方案價格），單人訂閱閉環正在驗證。
- Team 是 §4 的**階段三**——**金流串綠界（階段二）必須先完成**，因為合併計費 = 改一個綠界定期定額授權的金額，沒有金流地基談不了合併計費。
- **結論：Team 不該現在開工**。現在該做的是「把這份計畫書定下來、把地基稅算清楚」，等金流 ship 後接著做。本文是**設計就緒、待金流就緒後執行**。

---

## 二、Goals / Non-Goals

### Goals（這版 Team 要解）
- G1 owner 能邀請成員加入自己的 workspace，成員接受後共享空間業務資料。
- G2 成員有分層權限（至少 owner / member 兩級，目標三級含 admin）。
- G3 模組級權限：owner 能決定「誰能看 / 編哪些模組」（特別是薪資這種敏感模組）。
- G4 合併計費：一張帳單、一張發票給 owner，金額 = Σ各 seat 月費。
- G5 成員生命週期完整：邀請 → 加入 → 移除 → owner 轉移 → 最後一人離開，每個狀態資料歸屬清楚不卡死。
- G6 跟 v1.12.0 試用 / 訂閱狀態共存，不打架。

### Non-Goals（這版明確不做，寫死避免範圍蔓延）
- ❌ 跨 workspace 協作（一個人同時是 A 空間 member + 自己 B 空間 owner 的複雜切換）——**v1 一個人只屬於一個工作脈絡，多空間切換是 v2+**。
- ❌ 細到「單一報價單 / 單一客戶」的 row-level 權限——v1 權限只到**模組級**（整個收款模組 yes/no），不做單筆權限。
- ❌ 自助線上加減 seat 即時改綠界授權金額——**v1 用「下個帳期生效 + 半自動調帳」**（見 §4③，這是務實取捨，Notion 自己減人也不即時退）。
- ❌ SSO / SAML / 網域自動加入（@company.com 自動入列）——企業級功能，Team 方案不含，留給未來 Enterprise。
- ❌ 稽核日誌 / 成員操作軌跡（誰改了什麼）——v1 不做，v2 合規增強時補。
- ❌ collaborator（不佔 seat 的外部協作者）——**v1.0 不做，但架構預留**（見 §五 競品借鏡，這是 v1.1 高優先補強）。

---

## 三、Users / Personas

| Persona | 角色 | 用 Team 的情境 | 最在意 |
|---|---|---|---|
| **阿哲（owner）** | 工作室老闆 / 創辦人 | 邀 3 個員工進來、設定設計師看不到收款、自己一張發票報帳 | 帳單算得清楚、薪資不外洩、員工離職資料留得住 |
| **小美（member · 一般員工）** | 設計師 / PM | 進公司空間、看自己負責的客戶與任務、不該看薪資 | 進得來、看得到該看的、操作順 |
| **阿姊（admin · 共同管理者）** | 合夥人 / 營運主管 | 幫 owner 管成員、配權限，但不碰計費 | 能管人但不背帳單責任 |
| **阿凱（離職員工）** | 前員工 | 被移除後不該再進得來，但他建的客戶資料要留在公司 | （owner 視角）他的資料歸公司不歸他 |

**核心同理心 statement**：阿哲要的不是「多人系統」，是「**我的公司在 BeyondSpec 裡有一個家，員工進得來、各看各的、薪資鎖好、帳單一張、有人走了房子不會塌**」。Team 設計的每一個決策都回答這句。

---

## 四、現有設計缺口盤點（誠實判斷「完善」與否 · 按重要度排序）

> 評分基準：§4 給了「商業模型」（賣什麼、算錢、發票）≈ 完整。但「機制設計」（怎麼運作）幾乎是 0。整體完善度 ≈ **25%**。
> 下表每項標：**§4 現況** → **缺什麼** → **嚴重度**。

### 🔴 P0 缺口（地基級，不補 Team 根本跑不起來）

#### 缺口 1 · workspace 沒有被「實體化」——這是最大的洞
- **§4 現況**：§4 通篇假設「workspace 是一個獨立實體、訂閱掛在它身上」。
- **地基實況**：`_wsId = uid`（owner 的 Firebase uid）。所有業務資料路徑是 `users/{uid}/payroll_employees`、`workspaces/{uid}/...`——**workspace ID 就是 owner 個人的 uid，資料綁在 owner 個人帳號底下，workspace 不是一個獨立的東西**。
- **缺什麼**：需要一個**真正獨立的 workspace 實體**，有自己的 ID（不等於任何人的 uid）、自己的成員清單、自己的訂閱。資料路徑要從 `users/{uid}/...` 搬成 `workspaces/{wsId}/...`，成員透過「我屬於哪個 wsId」來讀同一份資料。
- **為什麼這是最大洞**：member 小美登入後，她的 uid ≠ owner 的 uid。現在的 `resolveWorkspace(uid)` 會把**她自己的 uid 當成一個新空間**，她永遠進不去阿哲的空間。**這不是補欄位能解，是資料歸屬模型要換。**
- **嚴重度**：🔴🔴🔴 最高。**這一條沒解，下面所有條都是空談。**

#### 缺口 2 · 訂閱綁「人」不綁「空間」——跟 §4 自己矛盾
- **§4 現況**：§4「訂閱掛在空間」「帳單 owner 一張 = Σ各 seat」。
- **地基實況**：`bp_subscription`（trialStartedAt / billingStatus / subscriptionId / plan）全存在 `state` → per-user localStorage + per-user Firestore（`_persistBilling`、line 10220–10241）。**訂閱是「這個登入的人」的，不是「這個空間」的。**
- **缺什麼**：訂閱實體要搬到 workspace 級——`workspaces/{wsId}/billing = { plan, seats:[...], status, subscriptionId, invoiceProfile }`。member 登入時讀的是**所屬空間的 billing**，不是自己的。
- **連鎖問題**：現在 `_enforceBilling()` / `_isReadOnly()` 判的是「state.trialStartedAt」（個人試用）。Team 模式下，**member 不該有自己的試用倒數**——她的可用性 = owner 空間的訂閱狀態 + owner 給她配的 seat 等級。這套 enforcement 邏輯要從「讀個人 state」改成「讀空間 billing + 我的 seat」。
- **嚴重度**：🔴🔴🔴 第二高。billing 不搬到空間級，「合併計費 / 一張帳單」無從實作。

#### 缺口 3 · RBAC 是「寫了註解沒真用」的 scaffold + 沒有模組級權限
- **§4 現況**：§4「owner 指派每成員的模組權限」。
- **地基實況**：line 9911 註解寫了 `workspaces/{wsId}/members/{uid} = {role:'owner'|'editor'|'viewer'}`，但**實際沒有任何 code 在讀這個 sub-collection 做 enforcement**。真正擋權限的是父文件三個 email array（`memberEmails` / `attendanceAccessEmails`）+ Firestore rules。**而且這三個 array 只分「能不能進空間」「能不能看出勤」，沒有任何「模組級」顆粒度。**
- **缺什麼**：① 一個真正被讀取執行的 role 模型（不是註解）。② 模組級權限欄位——`members/{uid} = { role, modulePerms: { quote:'edit', payroll:'none', clients:'view', ... } }`。③ 前端 `isModuleAvailable` / `isLocked` 要從「只看 plan」擴成「看 plan ∩ 我的 modulePerms」。④ **Firestore rules 要能用 members doc 的 role/perms 擋讀寫**（後端真擋，不只前端隱藏）。
- **嚴重度**：🔴🔴 高。**薪資模組的權限控制是信任生死線**——member 看到全公司薪資 = 災難。這條必須後端真擋，不能只前端隱藏 UI。

### 🟠 P1 缺口（Team 能跑但體驗 / 商業不完整）

#### 缺口 4 · 邀請流程完全沒設計
- **§4 現況**：「owner 邀請成員」一句話，**0 流程**。
- **缺什麼（完整邀請流程）**：
  - owner 在「團隊設定」輸入 email → 選 seat 等級（Pro/Max）→ 選模組權限 → 送出。
  - 系統建 `workspaces/{wsId}/invites/{inviteId} = { email, role, seatTier, perms, status:'pending', token, expiresAt, invitedBy }`。
  - 對方收到通知（email 或 app 內）：**對方必須已是 BeyondSpec 用戶（用 email/Google 登入過）**——這是關鍵決策點（見下）。
  - 對方登入後，「我的邀請」看到 pending 邀請 → 接受 → 系統把她寫進 `members/`、把她 email 加進 `memberEmails`、邀請標 `accepted`。
  - **email 比對 vs 連結 token——決策**：建議**雙軌**。① 主路徑：email 精確比對（對方用**同一個被邀請的 email** 登入才看得到邀請，最安全、防止連結轉發被冒用）。② 輔助：邀請連結帶 token（方便分享 + 24–72h 過期），但**點連結後仍須用被邀 email 登入驗證**，token 只是導流不是授權。
  - **未註冊的人怎麼辦**：對方還沒 BeyondSpec 帳號 → 邀請 email 引導她先用該 email 註冊 → 註冊完自動看到 pending 邀請。**不允許「邀請即建帳號」**（避免幫人開帳號的個資 / 安全問題）。
- **嚴重度**：🟠 P1。沒這個 Team 賣不出去，但屬「功能缺」不是「地基缺」，地基對了這個是純前端 + 一張 invites 表。

#### 缺口 5 · 合併計費的「期中加減人 / 升降級 / 付款失敗」細節全缺
- **§4 現況**：「加 / 減人 → 下個帳期調整總額」「owner 一個定期定額授權，加人時改授權金額」——**方向對，但魔鬼細節全缺**。
- **缺什麼**：
  - **期中加人**：採 **Notion 式非對稱 proration**——加人**當期按比例補收**（從加入日到下次續訂日的天數比例），或更簡單地「**下期生效、當期免費試用該 seat**」。建議 v1 取後者（簡單、對台灣用戶友善、少算錯帳機會）。
  - **期中減人**：**下期生效、不退費**（業界標準，Notion / 多數 SaaS 皆如此，明確寫進條款讓 owner 知道）。
  - **seat 升降級**（成員 Pro→Max）：同加減人邏輯，升級當期 or 下期、降級下期。
  - **改綠界授權金額**：綠界定期定額**改授權金額需要重新授權 or 用「變更授權」API**——這是**技術硬骨頭**（見 §六 ADR-T03）。v1 建議：**人數變動先記在 app 端 `pendingBillingChange`，到下次續訂日才一次性把新總額送綠界**，避免頻繁改授權。
  - **付款失敗誰扛**：owner 扛（他是付費關係人）。付款失敗 → 寬限期（3–7 天）→ 仍失敗 → **整個空間進唯讀**（不是只鎖 owner，因為訂閱是空間級）→ member 也唯讀並看到「請聯繫管理員」提示。**這條要設計清楚，否則一個 owner 卡刷不會連累整個 team 的體驗會很差。**
- **嚴重度**：🟠 P1（但 proration + 改授權金額這兩塊技術上偏 P0 難度，是整個 Team 最容易算錯帳 / 出事的地方）。

#### 缺口 6 · 成員生命週期 / 資料歸屬沒定義
- **§4 現況**：**完全沒提**。
- **缺什麼（每個狀態的明確規則）**：
  - **成員離開（自願）**：member 可自行退出 → 從 `members/` 移除、email 移出 array → 她**不再看得到空間資料**，但她**在空間裡建立的資料（客戶 / 報價 / 任務）留在空間**（屬公司不屬她）。
  - **被 owner 移除**：同上，立即失去存取，資料留存。seat 數 -1（下期帳單減）。
  - **owner 轉移**：owner 能把 owner 身份轉給某 admin/member（例：創辦人退出、合夥人接手）。**轉移時訂閱 / 計費關係 / 發票抬頭一起轉**——這是**敏感操作**，要二次確認 + 記錄。
  - **最後一人 / owner 離開**：owner 是訂閱關係人，**owner 不能直接「退出」把空間變孤兒**。owner 要離開必須先「轉移 owner」或「關閉空間」（關閉 = 取消訂閱 + 進 §3 的 90 天資料保留 → 清除流程）。
  - **資料歸屬鐵則**：**空間內所有業務資料屬於 workspace（= 屬 owner / 公司），不屬於建立它的 member**。member 離開帶不走資料。這條要在邀請時就告知 member（避免日後爭議）。
- **嚴重度**：🟠 P1。不致命但「owner 離職空間變孤兒」「員工離職資料卡死」是真實會發生且很難善後的場景，必須事前設計。

### 🟡 P2 缺口（邊界 / 合規，可後補但要列）

#### 缺口 7 · seat 上限與方案邊界沒定義
- **§4 現況**：Team「依每 seat（Pro/Max）」——沒說**最少幾人起跳、最多幾人、Pro/Max 以下方案能不能加人**。
- **缺什麼（借鏡 Honeybook 的方案層級鎖 seat）**：
  - **Starter / Pro / Max（單人方案）= 0 個額外 seat**（就是一個人）。要多人 = 必須升 Team。
  - **Team = 起跳 2 seat**（owner + 至少 1 人才有意義），上限建議 **v1 設 20 seat**（對齊「1–20 人小團隊」定位，超過走客製 / Enterprise 洽談）。
  - 這也順帶定義了**升級路徑**：單人 Pro 用戶想加人 → 引導升 Team（owner 自己變成 Team 裡的一個 Max/Pro seat）。
- **嚴重度**：🟡 P2。商業規則，純設定不難，但要先拍板數字。

#### 缺口 8 · 資料隔離 / 敏感模組（薪資）控制沒設計
- **§4 現況**：「共享空間資料」一句——**沒區分哪些該共享、哪些該鎖**。
- **缺什麼**：
  - **預設共享**：客戶、報價、任務看板、收款（這些是團隊協作的核心，預設成員可見可編，依 modulePerms 收斂）。
  - **預設鎖死**：**薪資模組（payroll）預設只有 owner + 被明確授權的 admin 能看**。這是台灣團隊的紅線——薪資外洩是勞資信任崩塌。
  - **Firestore rules 後端真隔離**：薪資資料 `workspaces/{wsId}/payroll_*` 的 read/write rule 要檢查 `members/{uid}.modulePerms.payroll != 'none'`，**前端隱藏不夠，後端必須真擋**（否則懂 F12 的員工直接讀 Firestore）。
- **嚴重度**：🟡 P2（評級成 P2 是因為它依賴缺口 3 的權限模型先建好；一旦缺口 3 做了，這條是配置問題。但**重要性實質是 P0**——薪資外洩零容忍）。

#### 缺口 9 · 發票（一張給 owner / 統編）細節 OK 但 Team 專屬欄位缺
- **§4 現況**：§5 已寫「一張電子發票開給 owner（公司戶填統編 + 抬頭）」——**這條 §4/§5 算完整**。
- **缺什麼（小補強）**：發票抬頭 / 統編 / 載具要存成 **workspace 級 invoiceProfile**（不是 owner 個人級），這樣 owner 轉移時發票資料跟著空間走。明細上**最好列出 seat 組成**（owner Max ×1 + member Pro ×N），讓 owner 報帳對得起來。
- **嚴重度**：🟡 P2。§5 主體已就緒，只差「綁空間不綁人」+「明細列 seat」。

### 缺口盤點小結

| # | 缺口 | 層級 | 嚴重度 | §4 完整度 |
|---|---|---|---|---|
| 1 | workspace 未實體化（wsId=uid、資料綁 user） | 地基 | 🔴🔴🔴 | 0%（假設它已實體化） |
| 2 | 訂閱綁人不綁空間 | 地基 | 🔴🔴🔴 | 0%（宣稱綁空間，實際綁人） |
| 3 | RBAC 是 scaffold + 無模組級權限 | 地基 | 🔴🔴 | 10%（有註解無實作） |
| 4 | 邀請流程 | 功能 | 🟠 | 5%（一句話） |
| 5 | 合併計費期中加減/升降/付款失敗 | 計費 | 🟠（技術 P0 難度） | 30%（方向對細節缺） |
| 6 | 成員生命週期 / 資料歸屬 | 功能 | 🟠 | 0% |
| 7 | seat 上限 / 方案邊界 | 商業規則 | 🟡 | 20% |
| 8 | 資料隔離 / 薪資鎖 | 安全 | 🟡（實質 P0） | 5% |
| 9 | 發票 Team 欄位 | 計費 | 🟡 | 70%（§5 已就緒） |

> **完善度加權結論 ≈ 25%**：商業模型（賣什麼 / 算錢 / 發票）≈ 60% 完整，但機制設計（地基 / 權限 / 邀請 / 生命週期）≈ 10% 完整，且地基方向需要轉向。整體加權 ≈ 25%。

---

## 五、架構可行性評估

### 5.1 建在現有 Firebase + workspace 上：可行，但要先付地基稅

**可行的部分（不用換技術棧）**：
- Firebase Auth（Google / email）已是多用戶基礎——member 用自己帳號登入這件事天生支援。
- Firestore 的 sub-collection + collectionGroup query + rules 完全足以實作 workspace + members + 模組級權限。**技術選型不用變**。
- `memberEmails` array-contains query（line 38576）已經是「找出我屬於哪些空間」的雛形——**方向是對的，只是現在 array 永遠只有 owner 一人**。

**必須先付的地基稅（這層不做後面全垮）**：

#### 地基稅 A · workspace 實體化（解缺口 1）
- 新增獨立 `wsId`（用 Firestore auto-id 或 `ws_` + random，**不等於任何 uid**）。
- owner 註冊時建 `workspaces/{wsId} = { owner, members, billing, invoiceProfile, createdAt }`，並在 `users/{uid} = { ..., activeWsId: wsId }` 記錄「這個人屬於哪個空間」。
- **資料路徑遷移**：`users/{uid}/payroll_*` → `workspaces/{wsId}/payroll_*`。**這是最重的一塊**——現有單人用戶的資料要寫 migration（登入時 idempotent 把 `users/{uid}/...` 搬到 `workspaces/{newWsId}/...`，類似現在 `resolveWorkspace` 的 idempotent 補文件思路，但這次是搬資料）。
- `resolveWorkspace` 要從「`_wsId = uid`」改成「`_wsId = users/{uid}.activeWsId`」——**member 登入時拿到的是 owner 空間的 wsId，不是自己的 uid**。這一行是整個 Team 的命脈。

#### 地基稅 B · 訂閱搬到空間級（解缺口 2）
- `bp_subscription` 從 per-user 搬成 `workspaces/{wsId}/billing`。
- `_enforceBilling()` / `_isReadOnly()` 重寫：判據從「state 個人試用」→「空間 billing 狀態 + 我在 members 裡的 seatTier」。
- **單人用戶向下相容**：單人 = 一個只有 owner 一個 member 的 workspace，billing 一個 starter/pro seat。**單人是 Team 的退化特例**——這個抽象一旦對了，單人和 Team 共用一套邏輯，不會有兩套打架。

#### 地基稅 C · RBAC 真實作（解缺口 3）
- `members/{uid} = { role, seatTier, modulePerms, joinedAt }` 真正被讀取。
- 前端 gate（`isModuleAvailable`、`isLocked`、sidebar 渲染）改成 `plan 允許 ∩ 我的 modulePerms 允許`。
- **Firestore rules 後端 enforcement**——這是安全底線，rules 要能讀 `members/{request.auth.uid}.modulePerms` 擋讀寫（特別薪資）。

### 5.2 跟 v1.12.0 試用 / 訂閱狀態怎麼共存、不打架

**這是 Edward 點名問的，也是最容易出事的整合點。我的判斷：不是「共存」，是「v1.12.0 是 Team 的退化特例，要被 Team 的抽象吸收」。**

| 維度 | v1.12.0 現況（單人） | Team 後 | 共存策略 |
|---|---|---|---|
| 試用倒數 | `state.trialStartedAt`（個人級） | 空間級，member 無自己倒數 | trial 搬到 `workspaces/{wsId}/billing.trialStartedAt`；member 讀空間 trial 狀態 |
| 鎖定 enforcement | `_enforceBilling` 讀個人 state | 讀空間 billing + 我的 seat | 重寫判據；**單人 = members 只有 owner 一人的空間**，邏輯一致不分叉 |
| 付費解鎖 | `_isPaidAccount` 看 state.plan/subscriptionId | 看空間 billing.status | 搬判據來源；解鎖整個空間（含所有 member） |
| 唯讀寫入攔截 | `_blockIfReadOnly` | 同左但空間級 | 攔截邏輯不變，只換狀態來源 |

**關鍵不打架原則**：
1. **不要做「Team 是另一套系統」**——那會變成單人一套 billing、Team 一套 billing，永遠在 sync 兩邊。**正解：單人就是「1 人的 Team」**，全站只有一套 workspace-level billing，單人是它的退化情況。
2. **migration 要 idempotent + 不可逆地往前**：現有單人用戶登入 → 自動獲得一個 wsId + 資料搬過去 + billing 搬到空間級，**一次性、冪等、可重入**（沿用現在 `resolveWorkspace` 的 fire-and-forget + try/catch 防禦風格，但加「搬完打標記 `migratedV2:true` 避免重搬」）。
3. **發布順序**：地基稅 A/B/C **必須在「還是單人世界」時就先 ship 並穩定**（單人用戶無感、資料照常），**之後才開 Team 邀請功能**。**絕不能 A/B/C 和邀請功能同一版上**——那是把地基重構和新功能綁在一起炸的經典死法（對照 user CLAUDE.md 架構懷疑 5 信號）。

### 5.3 競品借鏡（WebSearch 查證 · 2026-06-25）

**Notion（seat 計費）**：
- 按 seat 計費，一個 member 一個 seat。
- **加人 = 即時按比例（proration）補收當期剩餘天數**；**減人 = 不退、下期生效**（**非對稱 proration**）。
- → **借鏡**：減人不退、下期生效這條直接抄（業界標準、最務實）。加人 proration 我建議**簡化成「下期生效 / 當期該 seat 免費」**，因為綠界改授權金額成本高，少算一次比少賺一點重要。

**Honeybook（team 角色 + seat）**：
- **方案層級鎖 seat 數**：Starter 0 人 / Essentials 2 人 / Premium 無限。→ **借鏡缺口 7**：用方案鎖 seat 數（單人方案 0 額外 seat、Team 才開多人）。
- **角色四級**：team member / moderator / admin / owner + **可細到單一專案 / 檔案 / 發票授權**。→ v1 取**三級（owner/admin/member）+ 模組級**就好，單筆授權是 v2+。
- **collaborator（不佔 seat、不計費的外部協作者）vs team member（佔 seat、計費）二分**。→ **重要借鏡**：台灣團隊大量用臨時外包/兼職，「不佔 seat 的 collaborator」是高價值差異化，**v1.0 架構預留、v1.1 補上**。這條 §4 完全沒想到，是我從 Honeybook 抓回來給 Edward 的策略點。

---

## 六、Team 完整設計（可執行版）

### 6.1 資料模型（Firestore）

```
workspaces/{wsId}                          ← 獨立實體，wsId ≠ 任何 uid
  ├─ owner: "alice@x.com"                   ← owner email
  ├─ name: "阿哲設計工作室"
  ├─ memberEmails: ["alice@x.com", ...]     ← 沿用現有 array（給 array-contains query 找空間）
  ├─ billing: {                             ← 訂閱搬到空間級（解缺口 2）
  │     plan: "team",                       ← starter/pro/max/team
  │     trialStartedAt, status,             ← 試用/訂閱狀態（空間級）
  │     subscriptionId,                     ← 綠界定期定額 ID（一個）
  │     seats: [ {email, tier:"max"}, ... ],← seat 組成（算總額用）
  │     pendingBillingChange: {...}|null,   ← 期中變動暫存，續訂日才送綠界（解缺口 5）
  │     totalMonthly: 1997
  │  }
  ├─ invoiceProfile: {                      ← 發票綁空間（解缺口 9）
  │     companyName, taxId(統編), carrier(載具), type:"b2b"|"b2c"
  │  }
  ├─ migratedV2: true                       ← 單人→空間 migration 冪等標記
  │
  ├─ members/{uid}                          ← RBAC 真實作（解缺口 3）
  │     role: "owner"|"admin"|"member"
  │     seatTier: "pro"|"max"
  │     modulePerms: { quote:"edit", clients:"edit", payroll:"none", ... }
  │     joinedAt, invitedBy
  │
  ├─ invites/{inviteId}                     ← 邀請流程（解缺口 4）
  │     email, role, seatTier, modulePerms,
  │     status:"pending"|"accepted"|"expired"|"revoked",
  │     token, expiresAt, invitedBy, createdAt
  │
  ├─ payroll_*  ← 業務資料從 users/{uid}/ 搬來（解缺口 1）
  ├─ clients_*
  ├─ quotes_*
  └─ ...（各模組資料）

users/{uid}
  ├─ activeWsId: "ws_abc123"                ← 我屬於哪個空間（命脈！member 靠這個進 owner 空間）
  └─ email, displayName
```

### 6.2 權限矩陣（v1 · 三級 + 模組級）

| 能力 | owner | admin | member |
|---|---|---|---|
| 看 / 編模組資料 | 全部 | 依 modulePerms | 依 modulePerms |
| 邀請 / 移除成員 | ✅ | ✅ | ❌ |
| 配成員模組權限 | ✅ | ✅ | ❌ |
| 看 / 改計費 + 發票 | ✅ | ❌ | ❌ |
| 看薪資模組 | ✅ | 需明確授權 | 預設 none |
| 轉移 owner | ✅ | ❌ | ❌ |
| 關閉空間 | ✅ | ❌ | ❌ |

`modulePerms` 每模組三態：`none`（看不到 / sidebar 隱藏）/ `view`（唯讀）/ `edit`（可編）。**薪資模組預設全員 none，owner 例外。**

### 6.3 關鍵流程

**邀請流程**：owner 團隊設定填 email + seat + 權限 → 建 invite doc → 對方收 email/app 通知 → 對方用**被邀 email** 登入 → 「我的邀請」接受 → 寫入 members + memberEmails，invite 標 accepted，seat +1（下期帳單反映）。

**合併計費流程**：owner 一個綠界定期定額授權，金額 = `billing.totalMonthly`。期中加減人/升降級 → 記 `pendingBillingChange` → **下次續訂日**一次性把新總額送綠界（改授權金額 or 取消重授權，見 ADR-T03）→ 開一張發票列 seat 明細。

**付款失敗流程**：綠界扣款失敗 webhook → 寬限 5 天（空間正常）→ 仍失敗 → 整個空間唯讀（owner + 所有 member）→ member 看到「請聯繫管理員處理付款」→ owner 補款後解鎖。

**生命週期**：見缺口 6 全表（離開 / 移除 / 轉移 / 最後一人 / 資料歸屬鐵則）。

### 6.4 ADR（架構決策記錄）

#### ADR-T01 · workspace 用獨立 wsId，不再 wsId=uid
- 日期：2026-06-25 ｜ 拍板：待 Edward
- 決策：workspace 用獨立 auto-id，`users/{uid}.activeWsId` 指向所屬空間。
- 理由：member 的 uid ≠ owner uid，wsId=uid 模型下 member 永遠進不去 owner 空間。
- 後果：需寫單人用戶 migration（資料從 `users/{uid}/` 搬 `workspaces/{wsId}/`）；`resolveWorkspace` 重寫。
- 狀態：proposed。

#### ADR-T02 · 單人 = 1 人的 Team（不做兩套系統）
- 決策：全站只有一套 workspace-level billing + RBAC，單人是退化特例（members 只有 owner）。
- 理由：兩套系統 = 永遠在 sync、永遠打架（缺口 2 已經是「宣稱空間級實際人級」的矛盾活例）。
- 後果：v1.12.0 的 `_enforceBilling`/`_isReadOnly` 判據來源要全部搬到空間級。
- 狀態：proposed。

#### ADR-T03 · 期中變動「攢到續訂日」才送綠界，不即時改授權
- 決策：加減人/升降級先記 `pendingBillingChange`，續訂日一次結算送綠界。
- 理由：綠界定期定額改授權金額成本高（可能需重新授權流程），頻繁改 = 用戶體驗差 + 出錯面大。攢到續訂日一次算 = 對齊 Notion「下期生效」、少出錯。
- 後果：加人當期該 seat「免費試用」（少賺一點，換少算錯帳）；減人下期生效不退費。
- 狀態：proposed（**需綠界定期定額 API 實測「變更授權金額」可行性後定案**——這是 §八最大風險）。

#### ADR-T04 · 模組級權限後端 Firestore rules 真擋（前端隱藏不夠）
- 決策：薪資等敏感模組的 read/write rule 檢查 `members/{uid}.modulePerms`，後端真隔離。
- 理由：前端隱藏 UI 擋不住懂 F12 的員工直讀 Firestore；薪資外洩零容忍。
- 後果：rules 複雜度上升，需專門 rules 測試（沙利曼 Gate 5）。
- 狀態：proposed。

#### ADR-T05 · 地基重構與 Team 邀請功能分版上線
- 決策：地基稅 A/B/C 先在單人世界 ship 並穩定，之後才開 Team 邀請。
- 理由：地基重構 + 新功能同版 = 經典炸法（user CLAUDE.md 架構懷疑信號）。
- 後果：Team 至少分 2 個發布波次（地基波 → 功能波）。
- 狀態：proposed。

---

## 七、Estimation（雙軌工時 + risk register）

### 7.1 分波估時

> 雙軌工時標準（user CLAUDE.md 憲法）：對口專業者（用 Cursor/Copilot 的工程師）真實工時 / 城堡並行 + 審核淨時間。

| 波次 | 內容 | 對口工時 | 城堡估 | 信心區間 |
|---|---|---|---|---|
| **波 0 · 地基稅** | workspace 實體化 + 資料 migration + 訂閱搬空間級 + RBAC 框架（ADR-T01/02/04/05） | 4 天 | ~8h | [6h, 12h] |
| **波 1 · Team MVP（能收錢）** | 邀請流程 + 二級權限 + seat 管理 UI + 合併計費（**人工調帳**版）+ 薪資鎖 | 3 天 | ~7h | [5h, 10h] |
| **波 2 · 計費自動化** | 綠界改授權金額自動化 + proration + 付款失敗流程 + 發票 seat 明細（ADR-T03） | 2.5 天 | ~5h | [4h, 9h] |
| **波 3 · 生命週期 + 打磨** | owner 轉移 + 關閉空間 + 資料歸屬處理 + collaborator 預留 | 1.5 天 | ~2h | [1.5h, 4h] |
| **合計（完整 Team）** | | **11 天** | **~22h** | [16.5h, 35h] |

主要 risk 來源：A（綠界改授權金額可行性）、B（單人 migration 不能弄壞現有用戶資料）、C（薪資 rules 漏擋）。

### 7.2 我的強烈建議：先做「波 0 + 波 1」就上線收錢

- **波 0 + 波 1 ≈ 15h 城堡 / 7 天對口** → 拿到「能邀人 + 能協作 + 能合併計費（人工調帳）」的可賣 Team。
- 合併計費**先人工**：seat 變動時蘇菲/Edward 手動去綠界改授權金額（Team 客戶量初期個位數，人工完全扛得住）。**這是用 7h 驗證「有沒有人買 Team」，而不是先花 22h 把全自動計費做完才發現沒人買。**
- 波 2（計費自動化）等**Team 付費客戶 ≥ 5 個、人工調帳開始累**了再做——那時自動化才有 ROI。
- 波 3 隨用戶實際遇到（第一個 owner 要離職 / 第一個員工離職）再補。

### 7.3 risk register

| Risk | 機率 | 影響 | 軸 | Mitigation |
|---|---|---|---|---|
| 綠界定期定額「改授權金額」API 不支援 / 需用戶重新授權 | 中 | 高 | 技術 | **波 0 前先 spike 實測綠界 API**；若不支援 → 退「取消舊授權 + 建新授權」or「人工調帳維持更久」；ADR-T03 待此定案 |
| 單人 migration 弄壞現有付費用戶資料 | 中 | 極高 | 技術/用戶 | migration 冪等 + 搬前快照 `users/{uid}` 備份 + `migratedV2` 標記防重搬 + 灰度（先內部帳號跑通）；波 0 獨立發布觀察期 1 週才開 Team |
| 薪資 Firestore rules 漏擋，員工讀到全公司薪資 | 中 | 極高 | 合規/信任 | ADR-T04 後端真擋 + 沙利曼 Gate 5 專門 rules 測試 + 寫負向測試（member 角色嘗試讀 payroll 應被拒） |
| 地基重構 + 新功能同版上線炸掉 | 中 | 高 | 技術 | ADR-T05 強制分波；波 0 在單人世界先穩定 |
| owner 卡刷連累整個 team 唯讀、體驗差 | 低 | 中 | 用戶/商業 | 寬限期 5 天 + member 清楚提示「聯繫管理員」+ owner 多通知管道 |
| 合併計費算錯帳（proration 邊界） | 中 | 中 | 商業 | v1 用「下期生效」避開 proration 複雜度；金額變動雙重確認 + 對帳 |

---

## 八、我最擔心的 1 個風險（霍爾點名）

> **綠界「定期定額改授權金額」這條路，可能根本走不通——而整個合併計費的命都押在它身上。**

§4 一句「owner 一個定期定額授權，加人時改授權金額」聽起來很順，但這是**整份計畫裡唯一一個「我們無法靠自己驗證、要看綠界臉色」的硬假設**。綠界的信用卡定期定額，授權金額是在**首次授權時就綁定**的——「中途調整每期扣款金額」在很多金流商是**不支援、或需要用戶重新做一次授權動作**（重新輸卡 / 重新驗證）的。如果是後者，那「owner 加一個 member，就要 owner 重新授權一次信用卡」——這體驗爛到會直接殺死 Team 的轉換率。

**為什麼這是最該擔心的（不是技術上最難，是「最早該驗、最晚才會發現」）**：所有其他缺口（workspace 實體化、RBAC、邀請流程）都是**我們自己能掌控的工程**，做就會成。但這一條的答案在綠界手上，而且**它卡在依賴鏈的最深處**——你會先興沖沖把 workspace、邀請、權限全做完，到最後一步串計費時才撞牆，那時前面 15h 都已投入。

**所以我的硬要求**：**在波 0 開工之前，先花半天做一個綠界定期定額「變更授權金額」的 API spike**（卡西法 + 沙利曼，拿 Edward 的綠界測試帳號實打一次）。三種結果三條路：
- ✅ 支援即時改金額 → ADR-T03 可全自動，照計畫走。
- ⚠️ 改金額需重新授權 → 合併計費改「**人工調帳維持到有量**」+ 或「**年繳制 Team**」（一次授權整年、不頻繁改）規避。
- ❌ 完全不支援改金額 → Team 計費模型要重想（例：固定 seat 包方案「5 人包 / 10 人包」階梯定價，不做按人精算）。

**這個 spike 的成本是半天，省下的是「做完一半才發現計費模型要重來」的整個波次。Edward，這半天我建議排在所有 Team 工程的最前面，比寫任何一行 Team code 都優先。**

---

## 九、下一步行動（給 Edward 拍板）

1. **不要現在開工 Team**——金流串綠界（§4 階段二）還沒做，Team 沒地基。本文先定下來。
2. **先拍板 3 個數字 / 方向**：① seat 上限（建議 v1 = 20）② 加人計費「下期生效免費當期」OK 嗎 ③ 走不走「波 0+1 先上、計費先人工」的精實路徑（我強烈建議走）。
3. **金流階段開工時，第一件事 = 綠界改授權金額 spike**（§八，半天，比任何 Team code 優先）。
4. spike 結果回來 → 我把 ADR-T03 定案 → 進波 0。

---

*本計畫書 by 霍爾（CPO），2026-06-25。只規劃、未碰 app code。完善度判斷不灌水：§4 是好商業模型但機制設計 ≈ 25%，最大缺口是地基方向（user-centric→workspace-centric）。*
