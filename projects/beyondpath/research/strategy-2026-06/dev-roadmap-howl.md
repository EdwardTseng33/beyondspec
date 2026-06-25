# BeyondSpec SaaS 商業化開發 ROADMAP

> **作者**：霍爾（CPO / 產品策略）· 2026-06-24
> **性質**：把 SaaS 商業模式落地的開發路線圖 · 給 Edward 拍板 + 城堡排程依據
> **依據**：[saas-account-billing-plan.md](saas-account-billing-plan.md)（帳號/方案/金流 v1）· [BeyondSpec-strategy-v2-FINAL.md](BeyondSpec-strategy-v2-FINAL.md)（策略終版）· [business-model-pricing-gtm.md](business-model-pricing-gtm.md)（定價/GTM）
> **程式現況盤點**：實讀 `_workspace/app.html`（非憑空規劃）

---

## 0. 一句話結論

> **MVP 切點 = 只上 PRO 499 一個付費方案 + 綠界信用卡定期定額 + 自動電子發票 + Starter 7 天倒數鎖定，讓 Edward 能向第一個真實客戶收到第一筆 NT$499——其餘（MAX、Team、credit 精算、年繳）全部 v1 之後。**

收第一筆錢需要的是「一條能跑通的付費隧道」，不是「四個方案都做完」。多一個方案、多一條計費邏輯、多一個 seat 模型，都是在第一筆營收之前疊風險、拖時間——違反我們的燒時間 Gate。

---

## 1. 程式現況盤點（決定哪些是「改造」vs「從零」）

實讀 app.html 後的事實——**地基比兩份規劃文件假設的成熟很多**，這直接改變 MVP 的形狀：

| 能力 | 現況 | MVP 工作性質 |
|---|---|---|
| 工作空間帳號 | ✅ 已有（`resolveWorkspace` + Firestore 多空間 + 成員 + owner + memberEmails 查詢） | 沿用，**不重建** |
| 方案目錄 | ✅ 已有 `PLAN_CATALOG`（free/starter/pro/enterprise）+ 模組權限矩陣 `isModuleAvailable` + `changePlan` | **改規格**（對齊 Edward 拍板），不重建框架 |
| 模組權限 | ✅ 已有 `MODULE_MIN_PLAN` + `PLAN_RANK` + sidebar 動態渲染 | 沿用，調 mapping |
| AI Credit 系統 | 🟡 **半成品**：有換算邏輯（`tokensToCredits`、`MODEL_CATALOG`、`CREDIT_USD_VALUE`、per-tool token 估算）+ 每方案額度定義，**但沒有實際扣減/餘額追蹤/每月用量持久化**（grep 不到 `deductCredit`/`creditsUsed`/`bp_credits`） | **補計量閉環**（額度耗用 + 鎖定），非從零 |
| 管理員後門 | ✅ `devUnlock(planId)` + email 白名單 | 沿用（內部用） |
| Server-side AI 代理層 | ❓ 待卡西法確認（前端有 model catalog，但 Claude API key 不能放前端——付費前必須有 server proxy 計量） | **Gate 5 前必查** |
| 綠界金流 | ❌ 完全沒有 | **從零**（MVP 核心） |
| 電子發票 | ❌ 完全沒有 | **從零**（MVP 核心） |
| Starter 7 天倒數 + 到期鎖定 | ❌ 沒有（現況 free 是永久免費，無倒數） | **從零**（MVP 核心 — 見盲點 §6.1） |
| Team seat 合併計費 | ❌ 沒有 | **從零**（推 v2） |

> ⚠️ **現況方案規格 ≠ Edward 拍板**：app.html 現在是 `free 永久 / starter 290 / pro 990 / enterprise`，credit 50/600/3000/無限。Edward 拍板是 `Starter 7天試用 / PRO 499 / MAX 999 / Team`。**這份 roadmap 第一步就是把規格對齊拍板，不是沿用現況數字。**（卡西法落地時請以 Edward 拍板的 4 方案為準，不要被舊 catalog 數字誤導。）

**我假設**：app.html 仍是唯一 prod 程式來源（single-file SPA），帳號走 Firebase/Firestore，部署走 GitHub Pages。若 server proxy 已另有 Cloudflare Worker / 其他後端，請告知——會影響金流 webhook 的接點設計。

---

## 2. MVP 切點（能收第一筆錢的最小範圍）

### 2.1 哪些方案先上
- **只上 PRO 499 一個付費方案** + 保留 Starter 作為入口（7 天試用）。
- **MAX 999 不進 MVP**：MAX 跟 PRO 的差別只有「全模組 + AI 1000」——這是 entitlement 的參數差，金流隧道完全一樣。先用 PRO 驗證「整條收款隧道跑得通 + 有人真的付」，MAX 在 v1 加（只是多一個 plan row + 一個價格按鈕，幾乎零增量風險）。
- **Team 絕對不進 MVP**：合併計費 + seat 增減 + 逐人權限 = 一整套新的計費邏輯，且 Edward 的 ICP（策略 v2 定義）是「創辦人親自交付的 solopreneur/duo」——**主 ICP 根本不需要 Team**。Team 是 expansion revenue，不是 first revenue。

### 2.2 模組權限：最小做法
- **直接沿用現有 `isModuleAvailable` + `PLAN_CATALOG.modules`**，只改 mapping 對齊拍板。
- PRO = 「依職務選模組」這條，MVP **先簡化成「PRO 給固定一組核心模組」**（報價/收款/客戶/任務），**職務制選擇器 v1 再做**。理由：職務制是「同一批 entitlement 的 UI 包裝」，不影響能不能收錢；先別讓選擇器 UX 卡住金流上線。
- ⚠️ 產品決策：MVP 的 PRO 模組組必須**包含報價+收款閉環**——這是策略 v2 的 P0、是「別讓尾款漏掉」主訴求的載體。沒有它，付 499 的理由不成立。

### 2.3 AI 額度：最小做法
- **MVP 必須有「真實扣減 + 耗盡封頂」**——這是毛利護欄，不能省（business-model §2.2 護欄核心）。但要做到最小：
  - 每個工作空間一個月度 credit 餘額（Firestore 一個 field：`creditsRemaining` + `creditsResetAt`）。
  - 每次 AI 呼叫**回傳後**用既有 `tokensToCredits` 實扣（精算可後補，MVP 先「呼叫成功就扣估算值」即可，誤差容忍）。
  - 餘額 ≤ 0 → AI 功能停、其餘模組正常（既有護欄設計）。
- **不做的**：AI Pack 加購、超用即時購買、Haiku/Sonnet 動態路由優化、prompt caching 省成本——這些都是 v1+ 的毛利優化，不是收第一筆錢的前提。

### 2.4 Starter 鎖定：MVP 必要嗎？
- **倒數 + 軟鎖：MVP 必要。** 因為這是 Edward 整個轉換模型的引擎——沒有「7 天到期會鎖」，Starter 就退化成永久免費，**付費轉換的逼迫力消失，第一筆錢更難來**。
- **但「鎖」的最小做法 = 軟鎖 read-only + 一鍵匯出**（採蘇菲建議，非 Edward 原話的「全鎖」——理由見盲點 §6.1）。
- **90 天清資料：MVP 不做**（個資法義務但非 Day-1 緊迫，排程化即可，v1 補）。

### 2.5 MVP 明確「不做」清單（先做才有營收 vs 之後優化）
| 不進 MVP | 歸屬 | 為什麼可以等 |
|---|---|---|
| MAX 999 | v1 | entitlement 參數差，金流隧道共用，零增量風險 |
| Team seat / 合併計費 | v2 | 整套新計費邏輯，且主 ICP 不需要 |
| 年繳折扣 | v1 | 多一個 SKU + 折扣邏輯，月繳先驗證 |
| 職務制模組選擇器 | v1 | entitlement 的 UI 包裝，不影響收錢 |
| AI Pack 加購 / 超用購買 | v1 | expansion，先驗證基礎訂閱 |
| Credit 精算（真實 usage 回填） | v1 | MVP 用估算值扣，毛利誤差可容忍 |
| 90 天清資料排程 | v1 | 合規義務但非 Day-1 緊迫 |
| 客戶 portal / 報價單品牌露出 / benchmark | v2+ | 網路效應，非收錢前提 |
| Studio/Agency 高價錨點、Concierge | GTM/銷售 | 是定價頁敘事 + 人工銷售，非自助金流範圍 |

---

## 3. 分階段路線圖

### MVP —「第一筆錢」（規模 L · 約 3–4 週）
**目標**：Edward 能把一個真實客戶從 Starter 試用 → 升 PRO → 綠界扣款成功 → 自動開發票 → 模組解鎖，全程跑通。

**Scope**
1. **方案規格對齊拍板**（改 `PLAN_CATALOG`：Starter 試用 / PRO 499，先不動 MAX/Enterprise 數字也行，但 UI 只露 PRO）。
2. **Starter 7 天倒數 + 軟鎖**：註冊時記 `trialStartedAt`、Day5/6 提醒、Day7 未付 → read-only + 一鍵匯出 + 「升級解鎖」牆。
3. **綠界信用卡定期定額串接**：app 內選 PRO → 導綠界結帳頁（app 不碰卡號）→ webhook 回來解鎖 PRO entitlement。
4. **綠界電子發票**：扣款成功自動開立（公司戶統編/抬頭 + 個人載具），email 寄送。
5. **AI 額度實扣 + 耗盡封頂**（補 credit 計量閉環的最小版）。
6. **Server-side AI 代理層確認/補齊**（若還沒有，付費前必須有——否則 key 暴露 + 無法計量）。

**關鍵產品決策**
- 升級觸發點放哪：Starter 鎖定牆 + 「跑出第一份報價/第一筆收款後」的 contextual upsell（對齊 strategy「追回一筆錢」的 aha）。
- 發票在結帳流程**同頁收統編/載具**（台灣 B2B 習慣，不能事後補）。
- 軟鎖而非硬鎖（見盲點）。

**依賴**：⚠️ **綠界商店帳號 + 金鑰（只有 Edward 能申請）= 硬前置**，沒有它金流寸步難行。應 Day-1 就請 Edward 去開（申辦+審核可能數天到一兩週，是 critical path 上的等待）。

**風險**：見 §5。

---

### v1 —「填滿方案 + 護住毛利」（規模 M · 約 2–3 週）
**目標**：四方案到齊（除 Team）、毛利機制完整、轉換漏斗優化。

**Scope**
- **MAX 999 上線**（多一個 plan + 價格按鈕 + entitlement，金流共用 MVP 隧道）。
- **PRO 職務制模組選擇器**（把固定模組組換成「選職稱 → 對應模組」UX）。
- **年繳方案**（PRO/MAX 年繳，省 2 個月）。
- **Credit 精算回填**（真實 usage 取代估算值）+ **AI Pack 加購**（超用轉換器）。
- **90 天清資料排程**（個資法閉環）+ 升級提醒 email 序列。
- **轉換漏斗監測**（trial→paid 轉換率、額度耗盡事件——business-model §3.3 的 Activation 追蹤）。

**依賴**：MVP 金流隧道穩定跑通（webhook 可靠、發票無誤）才動 v1，否則疊 bug。
**對其他階段依賴**：v1 的職務制 + 年繳是 v2 Team 計費的前置（Team 要組合 PRO/MAX seat、要算月/年）。

**風險**：年繳 + 加購讓計費狀態組合爆增（月/年 × 方案 × 加購包），對帳複雜度上升——需要 Markl 在 Gate 4 把計費狀態機測過。

---

### v2 —「Team + 網路效應」（規模 L · 約 4–6 週）
**目標**：開啟 expansion revenue（多人團隊）+ 埋護城河（資料飛輪/網路效應）。

**Scope**
- **Team seat + 合併計費**：owner 一張定期定額授權 = Σ(各 seat PRO/MAX)、加減人改授權金額、一張發票開給 owner（統編）。
- **逐成員模組權限指派** + 共享空間資料（已有多成員地基，補權限層）。
- **網路效應第一槍**（strategy §三）：報價單收件方看到 BeyondSpec 品牌 / 客戶 portal（甲方確認報價/付款/看進度）擇一先做。
- **匿名 benchmark 地基**（成果帳本累積 → 「你比同業收款慢 X 天」）——真護城河起點。

**關鍵產品決策**
- Team 合併計費的綠界授權金額**動態調整**機制（加人當期 vs 次期生效——建議次期生效，避免按比例退費的對帳地獄）。
- benchmark 的匿名化邊界（沙利曼必審，個資/商業敏感）。

**依賴**：v1 的職務制 entitlement + 年繳 SKU + Credit 精算全部就位。
**風險**：合併計費的金額變更 + 退費 + 對帳是 SaaS billing 最容易出錯的地方；網路效應功能涉及對外露出品牌（Tier C/D 對外政策，需走 outbound SOP）。

---

## 4. 階段規模一覽

| 階段 | 主軸 | Scope 摘要 | 規模 | 大致週數 |
|---|---|---|---|---|
| **MVP** | 收第一筆錢 | PRO 單方案 + 綠界定期定額 + 電子發票 + Starter 7天軟鎖 + AI 額度實扣 | **L** | 3–4 週 |
| **v1** | 填方案 + 護毛利 | MAX + 職務制 + 年繳 + Credit 精算 + AI Pack + 90天清資料 + 漏斗監測 | **M** | 2–3 週 |
| **v2** | Team + 護城河 | Team seat 合併計費 + 逐人權限 + 網路效應(portal/品牌露出) + benchmark 地基 | **L** | 4–6 週 |

> 週數含城堡並行開發 + Edward 審核迴圈 + 綠界串接的外部依賴等待（金流串接的 bottleneck 通常不是寫 code，是商店審核 + webhook 對接測試 + 沙利曼合規驗證）。**MVP 的 critical path 大概率卡在綠界商店帳號審核**，不是程式。

---

## 5. 風險清單（含風險建模）

| Risk | 機率 | 影響 | 軸 | Mitigation |
|---|---|---|---|---|
| 綠界商店帳號審核拖長 | 高 | 高 | biz/外部 | Day-1 請 Edward 立刻申辦；審核期間城堡先做帳號規格/Starter鎖定（不依賴金流的部分），不空等 |
| Server-side AI 代理層不存在 → key 暴露 / 無法計量 | 中 | 高 | tech/合規 | MVP 前卡西法先確認；若無，補一個最小 proxy（Cloudflare Worker）計量再上 PRO；沒 proxy 不准上付費 |
| webhook 漏接 → 付了錢沒解鎖（或反之） | 中 | 高 | tech/信任 | 對帳機制：webhook + 定時主動查綠界訂單狀態雙保險；解鎖失敗有 retry + 人工告警 |
| 電子發票字軌/上傳不合規 | 中 | 高 | 合規 | Gate 5 沙利曼必驗財政部規範；用綠界托管開立（不自建字軌）；個人/公司戶分流測過 |
| Credit 用估算值扣 → 毛利失真 | 低 | 中 | biz | MVP 容忍誤差；v1 補真實回填；保留封頂護欄即使估算偏低也不會無限燒 |
| 計費狀態組合爆增（月/年×方案×加購） | 中 | 中 | tech | v1 才引入，Markl Gate 4 把計費狀態機當測試重點；MVP 只有「月繳 PRO」單一狀態 |

---

## 6. Edward 方向裡的產品盲點（我的職責是直說）

### 6.1 ⚠️ 盲點一（最重要）：Starter「7 天硬鎖」與策略 v2「永久免費」是方向性矛盾，且對台灣信任有反作用

**事實對照**：
- 策略 v2 終版（6/20 拍板，落地頁依據）寫的是 **「Starter NT$0/月 · 永久免費 · 信任建立」**，明確選 Freemium 而非限時試用，理由是「台灣付費滲透率 20–30%、信任建立期長、用戶傾向用好了再付」（business-model §1.4，有數據：Freemium 8.9% vs 限時試用需信用卡 31.4%——但 Freemium 免費池更大、更適合台灣）。
- Edward 6/24 拍板的方案表改成 **「Starter 7 天試用 → 鎖定」**（reverse-trial）。

**這不是小調整，是轉換哲學的 pivot**：從「先建信任、池子大、慢轉換」翻成「高壓逼轉換、快但池子小」。蘇菲已在 saas-account-billing-plan §3 標過「比策略 v2 更激進」。

**我的策略判斷**：
- reverse-trial 在歐美 PLG（信用卡文化成熟）轉換很猛，但**台灣的核心阻力正是「信任赤字 + 用了再說」的文化**——7 天就鎖，很可能在用戶還沒建立信任、還沒跑出「追回一筆款」的 aha 之前就把他擋在外面，**反而傷主訴求的轉換**。對「別讓尾款漏掉」這種需要實際用一陣子才感受到價值的工具，7 天偏短。
- **但方向 Edward 定，我不推翻——我提三條軟化 + 一個量測建議**：
  1. **軟鎖不硬鎖**：到期 read-only 預覽 + 一鍵匯出（讓他看到「會失去什麼」= 轉換槓桿，同時顧個資法信任）。Edward 原話「全鎖」我建議改這個。
  2. **試用長度當成可調參數做**（別寫死 7）：MVP 程式用一個 config，這樣之後看轉換數據能 A/B 7天 vs 14天 vs 永久免費，不用改 code。**這是最關鍵的軟化**——把「哲學賭注」變成「可量測的實驗」。
  3. **aha 前置**：7 天內主動引導用戶跑出第一份報價/記第一筆應收（不只是放著倒數），讓價值感在鎖之前發生。
- **我假設**：Edward 選 reverse-trial 是想加速早期現金驗證（先確認有人願付，而非先囤免費用戶）。若是這個意圖，那 §2 的「先上單方案快速驗證」完全契合——但請把「7 天」當實驗起點而非定論。**若 Edward 的意圖其實是「永久免費入口 + 局部功能鎖」（如 business-model 的配額制 Freemium），那 MVP 該做的是「功能配額牆」而非「時間倒數鎖」，方向完全不同——請 Edward 一句話確認是哪個。**

### 6.2 盲點二：MVP 階段「PRO 職務制選模組」是隱藏範圍炸彈

Edward 拍板 PRO = 「依職務選模組」。這聽起來是一個下拉選單，但實際上要定義「哪些職務 → 對應哪些模組組合」的完整矩陣 + 對應 UX + 邊界（選了職務還能不能手動加減模組？換職務資料怎麼辦？）。**這在 MVP 會吃掉本該給金流的時間。** 建議 MVP 先「PRO = 固定核心模組組」，職務制 v1 再做——entitlement 後端一樣，只是前端包裝，延後零損失。已寫進 §2.2 / §3。

### 6.3 盲點三：「先做才有營收」的真正瓶頸不在城堡，在綠界 + 合規

兩份規劃把金流當「開發順序第 3 步」，但**綠界商店帳號審核 + 電子發票合規 + webhook 對接測試是外部依賴 + 來回往返**，不是城堡寫 code 的速度問題。真正的 critical path 是：**Edward 申辦綠界（Day-1 就要動）→ 拿到金鑰 → 串接測試 → 沙利曼合規驗 → 才能收錢**。城堡的帳號/鎖定/額度可以並行先做，但**金流隧道打不通，前面做再多都收不到錢**。所以這份 roadmap 把「請 Edward 開綠界」標成 MVP Day-1 的硬前置，不是第 3 步。

---

## 7. 下一步行動（給 Edward）

1. **立刻**：去申辦綠界商店帳號（信用卡定期定額 + 電子發票 API 權限）——這是 MVP critical path 的起點，審核要時間。
2. **一句話確認盲點 §6.1**：Starter 要的是「7 天時間倒數鎖」還是「永久免費 + 功能配額鎖」？這決定 MVP 做哪一套。（我的建議：7 天當可調參數的軟鎖，先驗證，再用數據決定。）
3. **確認 §6.2**：MVP 接受「PRO = 固定核心模組組」、職務制延到 v1 嗎？
4. 確認後 → 蘇菲排城堡開發（卡西法主金流串接 + Starter 鎖定 + credit 計量 / 沙利曼 Gate 5 合規 / Markl Gate 4 計費狀態 / 女巫 Gate 2 升級牆與發票流程的 UX）。

---

*霍爾 · CPO · 2026-06-24 · 此 roadmap 建立在實讀 app.html 程式現況之上，非憑空規劃 · 含 1 個方向性盲點直言（Starter 轉換哲學）+ 2 個範圍/瓶頸盲點 · 方向 Edward 定，我提軟化路徑與可量測替代，不推翻拍板。*
