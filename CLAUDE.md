# Memory

## Me
Edward, 創辦人 of BeyondPath — 小團隊的 AI 商業引擎，主攻台灣/華語區市場。

## Product Vision
**BeyondPath — 小團隊的 AI 商業引擎**
> 從驗證到營收，AI 幫你跑完每一步。
> 你的生意，不該只靠你一個人撐。

- 核心公式：人 + Claude Cowork/Code + BeyondPath
- 不是 SaaS 加 AI，而是從 AI 協作出發設計——人做決策，AI 做苦工
- 一個 PATH，兩個階段：先驗證方向對不對（P·A·T·H 診斷），再幫你把生意跑起來（Pipeline·Accounts·Transaction·Health）
- 模組化設計：不同職能依角色選擇開啟/隱藏所需模組
- 所有模組遵循獨立運作原則：可啟用/隱藏、關閉時降級而非崩壞

## Module Architecture (v3 — 2026-03-31)
**PATH 驗證工具（產品方向）**
| 工具 | 賦能問題 |
|------|----------|
| PATH 診斷 | 這個方向值得做嗎？ |
| Lab 研究 | 用戶怎麼看我的產品？ |
| 問卷引擎 | 怎麼收集真實回饋？ |
| 市場探測 | 市場有多大？ |
| 市場報告 | 完整分析怎麼說？ |

**商業模組（營運閉環）**
| # | 模組 | 賦能問題 | 狀態 |
|---|------|----------|------|
| 1 | 任務看板 | 今天該做什麼？ | ✅ 原生 vanilla JS |
| 2 | 客戶管理 | 這個人跟我們什麼關係？ | ✅ 原生 vanilla JS |
| 3 | 報價提案 | 怎麼快速產一份專業報價？ | ✅ v1.0.3 Phase 1 完成 |
| 4 | 收款管理 | 錢收到了嗎？ | 🔧 待重建 |
| 5 | 會議紀錄 | 上次跟客戶講了什麼？ | ⏸ 評估中 |
| 6 | AI 儀表板 | 公司現在狀況怎樣？ | ⏸ 評估中 |
| 7 | 文件庫 | 那份合約在哪裡？ | ⏸ 評估中 |

## Product Details
| Key | Detail |
|-----|--------|
| **BeyondPath** | 小團隊的 AI 商業引擎 · 1-20 person teams |
| **定位語** | 從驗證到營收，AI 幫你跑完每一步 |
| **域名** | beyondspec.tw/path/ |
| **GitHub Repo** | `https://github.com/EdwardTseng33/beyondspec` — 部署來源，每次 session 必須記住此 URL |
| **部署（GitHub Pages PAT）** | 見下方完整部署 SOP，使用 Edward 的 GitHub PAT 認證 |
| **部署（Vercel 備用）** | `cp app.html deploy/beyondpath-app/path/index.html` → `cd deploy/beyondpath-app && vercel deploy --prod` |
| **部署資源** | 截圖/favicon/og-image 也要複製到對應部署目錄的 `path/` |
| **部署注意** | **城堡禁止每次 session 都忘記 repo URL 和部署方式** |

### GitHub Pages 部署 SOP（城堡憲法級——每次部署必須照做）
```bash
# 1. Clone repo
cd /tmp && rm -rf beyondspec && git clone https://github.com/EdwardTseng33/beyondspec

# 2. 複製 app.html 到部署目錄
cp "/sessions/elegant-keen-pasteur/mnt/Beyond Path/app.html" /tmp/beyondspec/path/index.html

# 3. 設定 git 身份 + PAT 認證
cd /tmp/beyondspec
git config user.email "edwardt0303@gmail.com"
git config user.name "Edward Tseng"
git remote set-url origin "https://${GITHUB_PAT}@github.com/EdwardTseng33/beyondspec.git"

# 4. Commit & Push
git add path/index.html && git commit -m "vX.Y.Z: description" && git push origin main
```
**注意：** PAT 不寫在本檔（憲法級安全規則，2026-04-21 加固）——愛德華從 1Password / 安全備份讀取後 `export GITHUB_PAT=ghp_xxx` 再跑 deploy script。若 PAT 過期請愛德華重新產生。
| **Tech** | Single-file SPA (app.html), vanilla JS 為主（任務看板/客戶管理/報價/收款），部分模組仍用 React 18 UMD |
| **主色** | #7C5CFC (purple) |
| **模組化原則** | 每個模組獨立 enable/disable，sidebar 動態渲染 |

## 主要競業（對焦目標）
| Company | What | 我們的差異 |
|---------|------|-----------|
| **Notion** | All-in-one workspace + AI | 缺報價/收款閉環，不是為商業營運設計 |
| **Monday.com** | Work management + AI | 重、貴、AI 是附加物 |
| **Honeybook** | Service business management | 最接近的對手，但只做服務業、無產品驗證 |
| **Attio / Folk** | AI-native CRM | 只有 CRM，缺任務/報價/收款閉環 |
| **ClickUp** | Project management | 功能多但臃腫，AI 要另外付費 |

## 次要競業（產品驗證領域）
| Company | What |
|---------|------|
| **Maze** | User research platform |
| **Synthetic Users** | AI simulated qualitative research |
| **Dovetail** | Research analysis |
| **Sprig** | AI-native surveys |

## Design System
| Token | Value |
|-------|-------|
| Primary | #7C5CFC |
| Primary-deep | #5B3FC9 |
| Teal | #1BA891 |
| Gold | #E08A3A |
| Rose | #D94462 |
| Slate | #94A3B8 |
| Icons | SVG line, 20×20, stroke-width 1.5 |
| Buttons | btn-accent (primary), btn-outline (secondary), btn-ghost (tertiary) |
| Cards | Borderless, shadow-based, r-xl corners |

## Kanban Column 架構（城堡憲法級——v0.32.22 補上，每次開發任務看板相關功能必讀）
**DEFAULT_COLS（5 欄，實際 label 與 color）**
| id | label | color | 語意 |
|----|-------|-------|------|
| inbox | 收件匣 | #94A3B8 slate | 待入流程的 buffer（board view 會過濾掉，不顯示） |
| todo | 待處理 | #7C5CFC primary | **核心欄，禁刪** |
| doing | 進行中 | #E08A3A gold | **核心欄，禁刪** |
| review | 驗收中 | #5B3FC9 primary-deep | 可選欄（原 #3B82F6 Tailwind blue 違憲，v0.32.22 修復） |
| done | 已完成 | #1BA891 teal | **核心欄，禁刪** |

**Board view 實際顯示**：`boardCols = cols.filter(c => c.id !== 'inbox')` → 4 欄（todo / doing / review / done）

**用戶操作規則**
- **新增欄位**：看板最後一欄右側「+ 新增欄位」按鈕（v0.32.22 修復：空狀態也顯示），`_kbAddCol()` inline prompt 輸入名稱 + 自動分配 PRESET_COLORS
- **編輯/移位**：欄位 header 的 `⋯` 選單 → 重新命名 / 變更顏色 / 往左移 / 往右移
- **刪除保護**：`_kbDeleteCol` 硬擋 todo/doing/done 核心三欄刪除（v0.32.22 新增），其餘（收件匣/驗收中/用戶自訂）可刪
- **Migration**：`getCols()` 讀 localStorage 時自動補齊缺失的核心三欄 + 修正 review 違憲色（v0.32.22 新增）

**開發注意**
- 兩份 DEFAULT_COLS 定義：`_taskShared` line 6957（跨頁共用）+ biz-tasks scope line 12693（本地副本），**修改時兩份都要同步**
- 其他頁面（non-kanban）仍有硬編碼 `colOrder = ['todo','doing','review','done']`（例如時間軸、客戶看板）——這是歷史債，改 DEFAULT_COLS 時要留意

**資料操作安全規則（城堡憲法級——2026-04-16 新增，帳號資料注入踩坑後追加）**
腳本或 agent 要寫入 `bp_kanban_cards` / 改動 columnId 時，**禁止硬編碼** `todo/doing/review/done` 以外的任何 id。因為：
1. **用戶自由編輯欄位**：Edward 的帳號已出現 `review` 被刪、以 `mnw4g4vw41t2e`（審核中）、`mnvqxphwtms52`（擱置中）等自訂 id 取代
2. **核心三欄才是憲法保證**：只有 `inbox / todo / doing / done` 由 Migration 硬性補齊，其他 id 皆可被用戶改名/刪除/新增
3. **正確做法**：寫卡前先 `getCols()`，優先用核心三欄；若需 review/擱置等語義，用 `label` 比對（例：`cols.find(c => c.label.includes('驗收') || c.label.includes('審核'))`），找不到就 fallback 到 `doing`
4. **cycleId 同樣不可硬寫**：`bp_active_cycle` 不等於 kanban 當下顯示的 cycle——kanban 用 `ensureCurrentCycle()` 依今天日期計算 startStr 查找。寫入前應呼叫 `ensureCurrentCycle()` 取得實際顯示中的 cycle.id

**已知 bug（2026-04-16 記錄，回收 backlog）**
- `ensureCurrentCycle()` 時區 off-by-one：`cycleStart.toISOString().slice(0,10)` 使用 UTC 而 `now.getDay()` 用 local time，在 UTC+8 早於 08:00 時會多回前一天。實際案例：2026-04-16 Thu TW，計算應得 4/13 Mon，實得 4/12 Sun（因 cycleStart 的 local 00:00 === UTC 16:00 前一天）。Fix：改用 `fmtLocalYMD(cycleStart)` 或 `toLocaleDateString('sv-SE')`

## PATH Header Spec（城堡憲法級——2026-04-11 建立，永久記憶）
**所有 PATH 頁面的 header 必須符合這個規範。不接受每個模組自己寫一套 `.rm-title` / `.cyc-topbar h2` / 內嵌 style。**

### Canonical class: `.page-title-area`
```
margin-bottom: 24px
padding-bottom: 16px
border-bottom: 1px solid var(--border)
display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap

h1: 22px / 700 / letter-spacing -.3px / line-height 1.3 / ink / gap 8px
h1 svg: 20×20 / var(--primary) / stroke-width 1.5
.subtitle: 13px / 450 / ink-muted / line-height 1.5

變體 .no-border: border-bottom 取消 / padding-bottom 8px / margin-bottom 16px
```

### Canonical HTML
```html
<div class="page-title-area">
  <h1>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><!-- icon path --></svg>
    <span>模組名稱</span>
  </h1>
  <p class="subtitle">一句賦能問題或功能描述</p>
  <!-- 右側可選動作區：<div style="margin-left:auto">…</div> -->
</div>
```

### 規則
1. **一個頁面只有一個 h1**——用 `.page-title-area > h1`，不要用 h2 或自訂 class
2. **icon 必須是 20×20 SVG line**，顏色繼承 `var(--primary)`，不用 emoji，不用 PNG
3. **subtitle 是一句賦能問題**（「這個方向值得做嗎？」「今天該做什麼？」），不是 breadcrumb 也不是 section label
4. **右側動作區用 `margin-left:auto`**，不要另外包容器扭曲 baseline
5. **禁止重新發明 header**——新頁面直接 `<div class="page-title-area">`，不要再寫 `.rm-title` / `.cyc-topbar h2` / 內嵌 style
6. **已存在的自訂 header 必須漸進遷移**（時間軸 `.rm-title`、週期管理 `.cyc-topbar h2` 為歷史債，後續任務中逐個回收）

### 檢查點
- Pre-design：新頁面 render 前，先 grep `page-title-area`，找一個現成樣本 copy
- Gate 2（女巫）：截圖比對頁面 header 是否與 PATH 診斷/客戶/任務頁一致
- Gate 3（霍爾）：若發現任何頁面沒用 `.page-title-area`，直接退版

**執行原則：規範寫在 CLAUDE.md 就是憲法，不需要愛德華再提醒。每次開新頁面或改 header 前，Claude 自動讀這段。**

### 例外條款（v3.1 2026-04-18 新增 · 基於首頁重構 home-dashboard-refactor-202604）

**首頁 `.home-hi` 例外**：首頁（home 模組，路由 `/` 或 `navigate('home')`）使用專屬的 `.home-hi` component 取代 `.page-title-area`。這是**全站唯一**例外，其他所有頁面仍須嚴守本規範。

**為什麼例外**：
- 首頁是「儀式型頁面」（一天的開場），其他頁是「工具型頁面」（進站執行任務）
- Hi greeting 用 26px/700（全站唯一破例字級，其他頁 h1 最大 22px），建立唯一的「一天開始」視覺錨點
- 獨有視覺元素：左側 3px 漸變標點線 + 24px 網格底紋 + **雙層敘事**（個人句 + 業界對照，路徑 B）
- 承載「信任・包覆・情緒價值感」三層靈魂指令的開場儀式感

**使用限制**：
- `.home-hi` 僅限首頁（home 模組）使用——任何其他頁面用 `.home-hi` 視同違憲
- 首頁**不得**同時出現 `.page-title-area`（二選一，不混用）
- 其他所有頁面（PATH 診斷、Lab 研究、任務看板、客戶管理、報價、收款、會議、AI 儀表板、文件庫、設定）**仍必須**使用 `.page-title-area`

**Gate 2/3 檢查調整**：
- 女巫（Gate 2）：截圖檢查首頁應見 `.home-hi`、其他頁應見 `.page-title-area`
- 霍爾（Gate 3）：發現「非首頁用 `.home-hi`」或「首頁用 `.page-title-area`」，直接退版

## Product Development Philosophy（城堡憲法級——所有開發項目強制執行）
1. **不做 MVP 思維**：所有功能與設計規劃，必須從通透的市場調研、定位分析、競業研究出發，以最具競爭力的產品狀態進行規劃，而非「先出最小可行版本再說」。
2. **品味與理性並重**：所有功能在設計與規劃上，除基礎建設外，須明確提升設計品味、質感、有趣的交互體驗，以及 UIUX 上的理性安排——從使用者視角出發，確保易讀、易懂、易操作。
3. **每個設計都要有理由**：任何設計元素與用戶操作，都必須有明確合理的理由（為什麼出現在那、為什麼是這樣使用）。依據是我們模擬的核心使用者情境，以及他們對這套工具的使用期待。

## Preferences
- **設計必須從原則出發，不憑感覺**——動手之前先列出：icon 怎麼用、按鈕怎麼用、用色怎麼用、文字大小怎麼定、交互體驗怎麼鋪陳（2026-04-15 憲法擴充：取消「飽和大膽」作為預設偏好，改成「每次決策都要預先考量設計原則的應用」）
- 設計必須從競品研究出發，不套公式
- 不要淡紫色（避免低彩度淡色疊在中性背景上顯得蒼白）
- 不用 emoji 當 icon
- 不用 border-left colored stripe cards
- 不用 border-top colored stripe cards（2026-04-15 憲法擴充：頂/左任何方向的色帶都禁用；色彩表達改由色塊、色點、tag、chip 承擔）
- 每次設計要有新的視覺體驗
- **首頁 / 儀式型區塊偏好 warm-serif + 琥珀 DNA（2026-04-18 確立，v1.0.8 退版後新增）**：
  - **字體**：Georgia italic serif（welcome-title 26px/700）
  - **色彩**：#3D2E1A 深琥珀（title）+ #D4712A 橘金（sub）
  - **背景**：插圖 + warm gradient（原 `.welcome-banner` 風格）
  - **適用範圍**：首頁 `.welcome-banner` / 未來問候區塊 / 里程碑慶祝 / 年度回顧等「情感儀式型」區塊
  - **不適用範圍**：任務看板、客戶、報價、收款、會議、PATH 診斷、Lab 等**工具型頁面**——這些仍走 #7C5CFC 封閉五色 + sans-serif + `.page-title-area`
  - **重構時規則**：動手前必先 grep `.welcome-banner` / `.welcome-title` / `.welcome-sub` 看 DNA；視覺 token（字體、字級、色彩、背景）一個像素都不改；只升級內容結構（例雙層敘事、stage-aware action panel）

## Design Principle Application Checklist（憲法級——每次動手前先跑過）
任何設計產出或修改前，**先**用這份 checklist 寫下設計意圖，再動 code：
1. **Icon 策略**：這個場景需要 icon 嗎？用線性 20×20 1.5 stroke 嗎？位置與語義配對是否清楚？
2. **按鈕層級**：primary / outline / ghost / text-only 哪一階？CTA 只能一個；次級動作降階
3. **色彩語義**：色用來做什麼？狀態（healthy/warn/danger/idle）？分類？裝飾？每個色都要有語義理由，不為美觀而上色
4. **字級階梯**：22 / 17 / 15 / 13 / 12 / 11 哪一階？為什麼這個階？同頁最多 4–5 階
5. **間距節奏**：4 / 8 / 12 / 16 / 24 / 36 / 48 哪一階？為什麼？節奏一致還是刻意斷點
6. **交互體驗**：hover 怎樣？active 怎樣？載入怎樣？空狀態怎樣？錯誤怎樣？鍵盤操作怎樣？
7. **密度判斷**：這個 UI 是高頻操作（要密）還是低頻決策（要鬆）？資訊量與密度匹配嗎？
8. **可達性**：色盲友善？對比 ≥ 4.5？鍵盤可達？焦點可見？
9. **一致性**：與現有頁面 pattern 一致嗎？新發明還是複用？複用優先
10. **對應競品**：這個做法在 Linear / Height / Notion 等產品怎麼做？我們為何一樣 / 為何不同

## Universal Design Rules（憲法級——通用原則，Claude 自行把關不需提醒）

### Color Rules
- **PATH palette 封閉集合**：只能用 `#7C5CFC primary` / `#1BA891 teal` / `#E08A3A gold` / `#D94462 rose` / `#94A3B8 slate` 五色。任何其他 hex（特別是 Tailwind blue `#3B82F6`、Tailwind green `#10B981` 等外來色）禁止出現在 app.html。若發現既存違規，列入清理 backlog
- **每個色只能有一個語義**：primary=品牌/idle、teal=healthy/成功、gold=warn/稍落後、rose=danger/逾期、slate=中性。同一色不可同時當「分類色」又當「狀態色」，會造成語義衝突
- **色彩不為美觀服務**：每次用色要能回答「這個色在傳達什麼語義？」。若答不出，改用中性色或刪色
- **Pastel 下限**：tag / chip / badge 背景不得低於 `color-mix 14%`，且文字色必須加深保 4.5:1 對比；低於此線的 7-10% pastel 禁用

### Layout Rules
- **禁止 border-top / border-left 色帶**（已有條款，重申）
- **進度條、狀態條、裝飾橫線不得貼卡片頂緣**：任何橫跨卡片的色條若位置 ≤ 16px from top，視覺等同 top-stripe，禁止。進度條屬於「資料尾部」，放 footer 或右下小尺寸
- **資訊流預設：context → headline → stats → action → progress**，進度類元素是 footer 不是 header

### Interaction Rules
- **拖拉把手（grip）預設隱藏**：grip 類 affordance 只在 `:hover` 時 fade-in 顯示。靜態下任何卡片左緣不可有持續的裝飾性 icon / 色點 / 紋路——會被誤讀成 stripe
- **優先級 / 狀態點必須貼內容（title）**：不可貼卡片邊緣。貼邊緣 = 邊緣裝飾 = stripe 觀感
- **hover / focus / active 必有回饋**：不接受「看起來可點但沒有 hover 態」的元件

### Encoding Rules
- **避免三重冗餘**：同一語義不應同時用 icon + 文字 + 色 + 形狀編碼。選 2 個就夠。例：逾期 badge 已有「文字 + rose」，不再加 icon；分類 tag 已有「文字 + 色」，不再加 icon
- **狀態必須雙編碼（色 + 文字或形狀）**：色盲友善。純色區分狀態不被允許

### Scale Rules
- **字階限制**：單頁字級不超過 5 階。H1 用 `.page-title-area`、主 headline 17/700、body 13/500、meta 11-12/500、tag 10/600
- **間距 token**：只用 4/8/12/16/24/36/48 系列；出現 5 / 7 / 13 / 21 這類奇數間距要有明確理由

### Component Reuse Rules
- **複用優先於新發明**：新頁面先 grep 是否有現成 class（`.page-title-area` / `.cp-ov` / `.rmdrw-*` / `.tp-row` 等）。複製現有 pattern 比發明新 class 優先
- **發明新 class 前寫設計意圖**：若真的需要新 class，先在 mockups/ 產出設計意圖 md，說明為何現有 pattern 不適用

### Meta-enforcement
- Claude 每次動 code 前先讀這一段，自行檢查是否觸及任一條；若觸及，先在回應中列出受影響條款 + 解法，再動手
- 若在既有程式碼中發現違規，不靜默保留——列入 v0.next 清理 backlog 或當場修
→ Full details: memory/context/design-philosophy.md

## Design Philosophy (from Edward)
- 高品質、高質感、有設計溫度的交互動態
- 理解亞洲文化習性
- 易懂、易讀、易操作的直觀設計
- 每個 UI 元素必須有存在的意義
- 不要沒意義的數據展示
- 不要左側色條卡片（border-left colored stripe）
- 飽和色、大膽用色，不要淡色
- 不用 emoji 當 icon
- 最終交付前必須自己做一遍視覺檢修

## HTML 尾部 Comment 憲法（城堡憲法級——2026-04-16 新增，累犯事件後追加）
**背景**：app.html `</html>` 之後疊版本 changelog 是既定做法，但 v0.32.10 曾發生 comment 未正確關閉 → 整段 changelog 裸奔在 `</html>` 後面 → 瀏覽器當 body text node 渲染 → 每個頁面 footer 都看得到「時間軸 6 點 UX 修正：(1)...」這段文字。Edward 已多次回報，屬累犯事件。

### 鐵律
1. **每個版本 changelog 必須完整包裹在 `<!-- ... -->` comment 內**。格式：`<!-- vX.Y.Z · 描述內容 -->`
2. **禁止跨 comment 混寫**——不可寫成 `<!-- A --> 裸文字 B <!-- C -->`。
3. **`</html>` 之後只允許 HTML comment，不允許任何裸文字節點**。

### Gate 4（馬魯克）版控前必跑的自動檢查
```bash
# 確認 </html> 後沒有非 comment 文字
grep -n '</html>' app.html | head -3
# 檢查尾部那一行裸文字（</html> 之後 + 非 <!-- 起始的實字）
tail -c 10000 app.html | grep -oE '</html>.*' | grep -v '^</html>\(<!--.*-->\)*\s*$'
# 或者更精確：找出 --> 後面跟的不是 <!-- 或結尾的內容
tail -c 10000 app.html | grep -oE '\-\->[^<]+[A-Za-z\xe4-\xe9]' | head -5
```
若輸出不為空 → **退版，禁止 deploy**。

### 提交 checklist
新增版本 changelog 時：
- [ ] 整段用 `<!-- vX.Y.Z · ... -->` 包起來，不跟既有 comment 拼接
- [ ] 運行 `tail -c 10000 app.html` 肉眼檢查尾部，沒有裸文字
- [ ] 若要重寫尾部 comment chain，先備份再整段重建，避免部分 comment close 遺漏
- [ ] **每個 comment 獨立一行**（`</html>` 之後換行，每個 `<!-- vX.Y.Z -->` 各自一行，禁止接龍）

### Tail 保留政策（v0.32.24 新增，防止尾部再次肥胖）
**背景**：v0.32.23 前，14 個版本 changelog 擠在 app.html 單行 26,819 字符，可讀性災難且脆弱（一次誤刪全沒）。v0.32.24 改為「熱區 + 冷區」雙層：

1. **HTML tail 只保留最新 3 個版本 comment**（熱區）
2. **第 4 個版本出現時**，將最舊的那個搬進 `projects/beyondpath/CHANGELOG.md`（冷區，markdown 格式）
3. **Tail 最後一行永遠是指標**：`<!-- changelog 歷史：見 projects/beyondpath/CHANGELOG.md -->`
4. **部署前 Gate 4 自動檢查**：`grep -c "<!-- v0\.[0-9]" app.html` 必須 ≤ 3，超出 = 退版
5. **搬運工具**：`scripts/rewrite_html_tail.js`（Node ≥ 14），輸入新版本號自動執行熱冷區遷移

### 標準尾部結構（參考樣本）
```html
</body>
</html>
<!-- v0.32.23 · 最新版 · 摘要... -->
<!-- v0.32.22 · 次新版 · 摘要... -->
<!-- v0.32.21 · 第三新 · 摘要... -->
<!-- changelog 歷史：見 projects/beyondpath/CHANGELOG.md -->
```

## Delivery Gates v2（城堡憲法級——每次交付強制執行）
| Gate | 主責 | 核心 |
|------|------|------|
| Gate 1 流程測試 | 卡西法 | **程式碼驗證 + 瀏覽器實測**（Chrome 工具截圖、讀 console、點擊操作、暗色模式、手機 375px）+ **`node projects/beyondpath/tests/unit/run-all.js` 全綠 + 至少一條 smoke playbook 跑過** |
| Gate 2 視覺檢修 | 女巫 | **看截圖檢查**，不能只讀 CSS。高品質高質感、每個 UI 有意義、無空數據、無 border-left stripe |
| Gate 3 遠景校準 | 霍爾 | 對齊產品目標、做過競品調研、不超綱亂改 |
| Gate 4 版控確認 | 馬魯克 | 版本號更新、快照存檔、確認可退版、**`</html>` 後裸文字檢查**、**`diffs/vX.Y.Z.diff-report.md` 的 AC 表 ≥ 8 成 ✅**（2026-04-16 擴充） |
- 城堡自主執行，不需要愛德華提醒
- **最低底線：Gate 1（含瀏覽器實測 + unit + smoke）+ Gate 4**——不接受只做程式碼檢查就交付
- 超綱改動 → 立刻退版
- 「PASS」必須附證據（截圖、console 輸出、test runner stdout），不能空口說 PASS
- 完整 SOP → Ai workflow/memory/context/delivery-sop-v1.md（已更新至 v2）
- **交付閉環 SOP → `projects/beyondpath/WORKFLOW.md`**（2026-04-16 新增，見下段）

## 交付閉環 SOP（城堡憲法級——2026-04-16 新增）
**完整流程：** `projects/beyondpath/WORKFLOW.md`（spec→mockup→code→test→diff-report 閉環）

### Feature Level 分級（先分級再決定跑多少）
| Level | 判定條件 | 必做步驟 |
|-------|---------|---------|
| **S** 小改動 | <30 行 + 無新 UI + 無資料遷移 | Spec 簡版（§1–3 + §5 AC）、Unit test、部署 |
| **M** 單 feature | 新增/改版單一功能、含 UI 或資料 | 完整 Spec + Mockup（有 UI）+ Unit + Smoke + G1–4 |
| **L** 跨模組架構 | 多模組 + 架構變動 | 完整 Spec + Mockup + ADR + Unit + Smoke + Regression + G1–4 全簽 + 獨立 review agent |

### 必產文件（每個 M+ feature 強制）
每個 feature 完成後，`projects/beyondpath/` 底下必須齊備：
- `specs/active/X.md` ← 規格（事前）
- `mockups/active/X.md` ← 設計（有 UI 才需要）
- `tests/unit/X.test.js` + `tests/smoke/X.smoke.md` ← 測試（基於 AC）
- `tests/reports/X.test-report.md` ← 測試結果
- `diffs/X.diff-report.md` ← 交付報告（AC 逐條打勾）
- `versions/vX.Y.Z.html` ← 版本快照

若某份缺，在 `diff-report §7「未覆蓋事項」` 誠實列出。**未列 = 違憲**。

### 三獨立 subagent 原則（客觀審查的關鍵）
- **Agent A 規劃者**：讀需求 → 產 spec。不寫 code、不寫 test
- **Agent B 執行者**：讀 spec → 產 diff/mockup。不審查自己的成果
- **Agent C 審查者**：只讀 spec + 成果物（不讀執行者 context）→ 對 AC 逐條打勾 → 產獨立 review 報告

**為什麼要分開：** 同一 agent 不能客觀審查自己的成果（會自我合理化）。三 agent 各自獨立，才接近「多面向客觀檢查」。L 級必須派 Agent C；M 級可選但建議派。

### 部署前 checklist（Gate 4 擴充版，部署前必須全綠）
- [ ] `node projects/beyondpath/tests/unit/run-all.js` 全 PASS
- [ ] 至少一條 smoke playbook 過（Chrome MCP 實測）
- [ ] `diffs/vX.Y.Z.diff-report.md` 的 AC 表 8 成以上 ✅
- [ ] `versions/vX.Y.Z.html` 已建立
- [ ] HTML 尾部 naked text grep PASS
- [ ] `sidebar-version` 已更新
- [ ] CLAUDE.md 若有更新，已 commit

## Agent 防護規則（城堡憲法級——2026-04-01 新增 · 2026-04-21 補強 v1.3.19 連鎖事件）
1. **Agent 禁止直接修改 app.html**——產出 diff 草稿，主對話 review 後才 apply
2. **Agent prompt 必須帶完整 context**——設計原則、編碼規範（ES5: var, function, 無 const/let/arrow）、版控規則、禁止超綱
3. **大範圍改動（>50 行）必須分批**——每批過程式碼驗證，全部 apply 後做完整瀏覽器實測
4. **Agent 產出必須標記改動摘要**——列出修改函式/區塊、理由，超出範圍的標記「需審批」
5. **Background agent race condition 防護（2026-04-21 新增）**——派 `run_in_background: true` 的 agent 處理 app.html / 本地 shared file 時，主對話**不得同時編輯該 file**；bg agent 執行期間主對話只做獨立任務（research doc、STATUS.md、ops/ 等非 app.html 操作）
6. **Bg agent 後的 local file 驗證（2026-04-21 新增）**——bg agent 完成後，若 local file state 可疑（size 異常、`wc -l` 少於預期），**立即從 `versions/vX.Y.Z.html` snapshot restore**，不信任被截斷的 local file

## 部署憲法（城堡憲法級——2026-04-21 v1.3.19 連鎖事件後建立）

### 為什麼要有這章
2026-04-21 深夜發生 v1.3.17 → v1.3.18 → v1.3.19 三個 bug 連鎖事故：戰情室白屏 + landing 被 app.html 覆蓋 + 登出跳錯頁。根因之一是我 v1.3.18 push 時**繞過 `scripts/push-prod.sh`**，直接 `cp app.html → path/index.html`（landing 位置）+ `path/app/index.html`（app 位置），導致 landing 被 app.html 2.6MB 覆蓋。詳見 `projects/beyondpath/ops/postmortem-v1.3.17-to-v1.3.19-chain.md`。

### D-1 · 所有 prod deploy 必須走 `scripts/push-prod.sh`
**禁止** ad-hoc `cp` + `git add` + `git commit` + `git push` 組合。違規 = 憲法違反。若真有緊急情境需跳過，必須在該次回應中明確寫清楚**跳過理由 + 承諾的 sanity check**，不接受「快就好」。

### D-2 · Push-Prod.sh 五層 Guard（不可移除）
```
Layer 1: App 正向檢查    — app.html 必須含 'class="sidebar-version"'
Layer 2: App 大小檢查    — app.html size ≥ 500KB
Layer 3: Landing 正向    — index.html 必須含 'screen-welcome' 或 'bpSubmitApply'
Layer 4: Landing 大小    — index.html size ≤ 100KB
Layer 5: 部署後 sanity   — path/index.html size ≤ 200KB，超過 abort push
```
五層任一 fail → exit code 10-14。不允許移除或放寬。

### D-3 · 本地檔案是 Single Source of Truth
每次 session 開頭或 deploy 前：
1. `diff "/c/Users/Administrator/Claude/Beyond Path/index.html" /tmp/beyondspec/path/index.html`
2. `diff "/c/Users/Administrator/Claude/Beyond Path/app.html" /tmp/beyondspec/path/app/index.html`
3. 若有差異，先確認是誰較新（git log + 本地 mtime）再決定 sync 方向
4. 不可假設本地永遠是最新（愛德華有多 session 並行，local 可能 stale）

### D-4 · 深夜 / 疲累推版標準提升
台灣時間晚上 22:00 後推版：
- 必跑 Chrome MCP **3 個核心模組** smoke：landing 載入 / 登入流程 / 該版動到的模組
- 不信任「只改一點點所以沒事」的判斷
- 若疲累度高，優先寫 post-mortem 或做 research，**不推版**

### D-5 · 相對路徑 `../` 禁用於 URL redirect
`window.location.replace('../')` / `window.location.href = '../'` **全站禁用**。
- 改用絕對路徑 `/path/` / `/path/app/`
- 理由：若 app.html 被誤部署到 `/path/` 位置，`../` 會跳到根域；絕對路徑抗誤部署

### D-6 · Render 函式變更強制 Gate 1
改 `render[A-Z]\w+` 函式（特別是 renderInsights / renderFullReport / renderLab / renderHome 等大函式）：
1. 改動前 grep 該函式內所有 `_xxx` 變數宣告位置，建立 var order map
2. 新增 block 若在函式頂部或中段，**每個引用的變數 grep 確認 assign 位置在新 block 之前**
3. 改動後**強制 Gate 1 Chrome MCP 實測**該模組（看 console + 確認 render 完整）
4. 實測 PASS 才能進 Gate 4 push

## UIUX Design Excellence（城堡憲法級——2026-04-09 建立）
**完整參考手冊：** `Ai workflow/memory/context/uiux-design-excellence.md`（389 行）
- 所有 UI/UX 設計產出前必須參照此手冊
- 五大設計原則：約束>自由 / 動態即語言 / AI透明度 / 密度可控 / 一致性>新穎性
- Token 系統：間距（4/8/12/16/24/36/48）、字體（11-22px）、動畫（80-400ms）、陰影（xs-lg）
- 品質評分：10 維度加權，目標 ≥ 85/100，低於不得進入 Gate 1
- Workflow 13 UIUX 設計卓越流程：Pre-Design Gate → 設計執行 → 三方品質複評 → 實作 → 交付
- 女巫/霍爾/蕪菁頭 agent 已升級（skills-backup/ 中），待下次技能重裝生效

## Version Control
- **版號語意（2026-04-18 城堡憲法確立，v1.0.0 起）**：`vMAJOR.MINOR.PATCH`
  - `MAJOR`（第 1 碼）：**重大更版**——產品定位重構、商業模式變更、核心架構重寫、品牌升級等
  - `MINOR`（第 2 碼）：**新增模組**——新的頂層 feature 模組（PATH 工具、商業模組皆計）
  - `PATCH`（第 3 碼）：**功能優化或 bug 調整**——既有模組 UIUX 打磨、視覺清理、效能優化、bug fix
  - 每次改動必須 increment 對應欄位；不可跨欄位 skip（例如 bug fix 只動第 3 碼）
- 快照：`versions/vX.Y.Z.html`
- 標記：HTML 尾部 `<!-- vX.Y.Z -->` + sidebar `.sidebar-version`
- 退版：直接從 `versions/` 復原
- 乾淨備份：`app.html.bak`（無 Business 的原版 PATH）
- **歷史版號**：v0.x.x 為 Pre-1.0 開發期（2026-03 ~ 2026-04-17，37 個 iteration）；**v1.0.0 = BeyondPath 首次里程碑正式版**（Claude API 正式接通 + UIUX 全面升級完成，愛德華於 2026-04-18 宣告）
