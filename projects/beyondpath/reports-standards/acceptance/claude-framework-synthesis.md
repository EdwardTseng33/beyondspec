# Claude 範例補位分析 + 三源融合最終方案

> **建立日期**：2026-04-21
> **作者**：🌸 蘇菲（主對話整合）· 基於霍爾 v1.1 + Claude 範例
> **定位**：終極融合 · 三個 2026 市場報告範例（GPT / Gemini / Claude）+ 我們既有 v1.0 體系 的最終戰略對照
> **底線**：決定 **BeyondPath Market Intelligence Framework v2026** 的最終結構

---

## 一、三個範例 + 我們體系的「獨有貢獻」清單

| 範例 | 獨有精華 | 戰略層次 |
|------|---------|---------|
| **GPT** | 9 章實戰結構 + JTBD 4 層 + Growth Loop + Data Flywheel + AI Native + OKR | 🎯 **戰術狠角色**（執行導向）|
| **Gemini** | 趨勢命名 + STEEP 2.0 + 真實感反彈 + 代際分析 + 3 情境 | 📖 **戰略狠角色**（敘事導向）|
| **Claude** | **5 核心設計原則** + **10 章 + 附錄** + **6 額外分析工具** + **3 版交付規格** + **使用者提醒（90% 只做 3-7 章）** | 🏛 **meta 狠角色**（方法論導向）|
| **BeyondPath v1.0** | Howl's Law 三條 + PATH 四維 + 封閉五色 + warm-serif DNA | 🎨 **品牌狠角色**（差異化定位）|

---

## 二、Claude 範例獨有的 5 大補位（最高戰略價值）

### 🥇 #1 · **五個核心設計原則**（meta 層升級 · 最重要）

Claude 範例在 Part A 明確列出 5 個設計原則——**這是 GPT / Gemini 都沒有的 meta 思考**：

1. **AI 不是一個章節，而是交叉分析維度** ← 直接挑戰我們 v1.1「§3 AI 重構章」的獨立章思路
2. **情境規劃取代單一預測** ← 印證我們 v1.1 §5.3 4 情境
3. **Signal-driven，而非 Trend-driven** ← **我們體系完全沒有**（霍爾 v1.1 有 trend 但缺 signal 追溯）
4. **生態系視角取代單一市場視角** ← **我們 P2 列為選採，Claude 列為 P0**
5. **可驗證、可更新、可反駁** ← 我們 Hypothesis transparency 已有，但缺「Assumptions Log」+「Watchlist」

### 🥈 #2 · **Signal-driven 方法論**（認識論升級）

Claude 範例 Part B §5 提供 **Signal → Driver → Trend → Implication 四層呈現**：
- **Signal（弱訊號）**：可被實證的事件、數據、案例（最少 3 個）
- **Driver（底層驅力）**：為什麼這些訊號會出現？
- **Trend（趨勢）**：綜合訊號推論出的方向
- **Implication（意涵）**：對本市場玩家的策略意義

**vs 我們現狀**：`content-rubric §5.2` 只講 Thesis + 3 支柱 + 情境分析——**缺「從訊號到趨勢」的追溯鏈**。讀者看到「趨勢」但不知「為何相信」。

**補位建議**：`content-rubric §5.2 Mid` 每個 Thesis 支柱必附 **≥ 3 個可驗證 Signal**，Gate 3 追蹤 signal source URL。

### 🥉 #3 · **6 個額外分析工具**（方法論軍火庫補齊）

Claude 範例推薦，我們 v1.1 + tool-selection-matrix 皆**沒有**：

| 工具 | 用途 | BeyondPath 適配 |
|------|------|----------------|
| **Wardley Map** | 演化階段分析（Genesis / Custom / Product / Commodity）| 🟡 適合市場報告 §2 Supply 章（看 AI Agent 位於哪階段）|
| **Van Westendorp PSM** | 價格敏感度四點法 | ✅ **直接升級** `tool-selection §2.2` STP Targeting 的 WTP 分析 |
| **Kano Model** | 功能需求分類（必備/期望/興奮/無差）| ✅ **補 AI 問卷與 Lab 分析的需求優先級** |
| **Shell Scenario Planning** | 企業級情境規劃（2x2 matrix）| ✅ **直接升級** `content §5.3` 4 情境（+2x2 matrix 軸選擇方法）|
| **Playing to Win framework** | Roger Martin 戰略 5 問（Where to Play / How to Win / Capabilities / Systems / Aspiration）| ✅ **直接替代** `content §5.3 Deep` Strategic Implications（更結構化）|
| **Capability Map** | 能力盤點對照 | 🟡 選用 · 融入 PATH H 維 |

**補位建議**：在 `tool-selection-matrix §1` 5 工具矩陣擴充到 **11 工具**（加這 6 個），但維持選擇性使用（不是每份報告都用）。

### 🏅 #4 · **3 版交付規格**（產品化層級補位）

Claude 範例 Part D 明確列出三版本：
- **完整版**：40-60 頁（含圖表）
- **Exec 版**：8-12 頁（只含 0、主要圖、7、8）
- **簡報版**：15-20 張 slide（配 30 分鐘口頭）

**vs 我們現狀**：URL routing spec 只規定每份報告獨立 URL，**未規定不同閱讀情境的 3 版本**。

**補位建議**：`render-contract/url-routing-spec.md` 擴充——每份報告自動產 3 版：
- `/path/report/{type}/{id}/full` ← 完整版
- `/path/report/{type}/{id}/exec` ← Exec 版（1-2 頁）
- `/path/report/{type}/{id}/slides` ← 簡報版（可匯出 PPT）

### 🏅 #5 · **使用提醒**（防 over-engineering 戰略智慧 · 最高層次）

Claude 範例結尾的兩段是**整份 Claude 範例最有價值的部分**：

> **這個框架的真正價值不在「填完所有章節」，而在每個章節都能逼出一個具體決策。實務上，90% 的中型顧問案只會完整做到第 3–7 章，其餘章節以附錄形式補強。**

> **最常見的三個誤用：**
> 1. 把趨勢章節當成「網路 summary 大亂鬥」——沒有訊號追溯 = 不是分析，是整理
> 2. 情境規劃寫成「好、更好、最好」——情境必須有結構差異，而非強度差異
> 3. 建議章節跟分析章節沒有因果鏈——讀者會一眼看出「這結論隨便寫的」

**戰略意涵**：
- **呼應 Howl's Law #1**（融合 > 並列）——章節多寡不等於分析強度
- **BeyondPath 報告的身段**：80% 用戶不需要完整版，6-10 個 exhibit 就足夠（對應霍爾戰略觀點「小團隊早期驗證身段」）

**補位建議**：在 `README.md` 總覽加入一段「**使用者提醒**」章節，引用 Claude 範例的戰略智慧 + Howl's Law 呼應。

---

## 三、Claude 範例 vs 霍爾 v1.1 的**衝突**（需 Edward 決策）

### 衝突 #1 · **AI 是交叉維度 vs 獨立章節**

- **Claude 範例**：AI 不該獨立成章，應該每一章都有 AI 視角
- **霍爾 v1.1**：市場報告 §3 獨立「為什麼這個賽道正在被 AI 重構」章

**融合建議**：
- **80% 融合（Claude 對）**：PATH T 維的 AI 成熟度子分 / 五力 × AI Disruption Overlay / 消費者 JTBD 4 層中的 AI 觸媒
- **20% 獨立（霍爾對）**：市場報告保留 §3 獨立章，但名字改為「**AI 在這賽道改寫了什麼、沒改寫什麼**」（對標結論句風格），並在其他章節交叉提及 AI

### 衝突 #2 · **Trend-driven vs Signal-driven**

- **Claude 範例**：Signal → Driver → Trend → Implication 四層
- **霍爾 v1.1**：Trend 分析直接展開（沒有 signal 追溯鏈）

**融合建議**：**Claude 對**——每個 Trend 強制追溯 ≥ 3 個 Signal（可驗證事件/數據/案例）。這比 v1.0 Hypothesis transparency 更具體。

### 衝突 #3 · **生態系視角**

- **Claude 範例**：P0 核心原則（Ecosystem Map 必備）
- **霍爾 v1.1**：P2 選採（Ecosystem Strategy 融入 Data Flywheel partner node）

**融合建議**：**上調為 P1**——BeyondPath 面向小團隊，生態系視角很重要（例：Claude API / DataForSEO / Firebase / Notion 整合），但不必每份報告都完整畫 Ecosystem Map。**市場報告必畫，PATH 診斷/Lab 可省略**。

---

## 四、最終融合方案：BeyondPath Market Intelligence Framework v2026

**核心架構（結合 Claude 10 章 + 霍爾 v1.1 + Gemini 命名 + GPT 執行）**：

```
┌─────────────────────────────────────────────────┐
│   Part A · 5 核心設計原則（Claude meta 層）       │
│   1. AI 是交叉維度（融合 80%）                    │
│   2. Signal-driven（Claude 補位）                │
│   3. 生態系視角（Claude P1）                     │
│   4. 情境規劃（霍爾 v1.1 4 情境 + Black Swan）   │
│   5. 可驗證可更新（Hypothesis + Assumptions Log）│
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│   Part B · 10 章架構（Claude）+ 霍爾 v1.1 子分    │
│   0. Executive Summary（McKinsey 150-250 字）    │
│   1. Market Definition（TAM/SAM/SOM + 邊界四維） │
│   2. Market Landscape（PESTEL 2026 + 5 Forces × │
│      AI Overlay + Wardley Map 選用）             │
│   3. Demand Analysis（JTBD 4 層 + Van            │
│      Westendorp PSM + Kano Model）               │
│   4. Supply & Competitive（Strategic Groups +    │
│      Value Curve + STP）                         │
│   5. Trend Analysis（Signal→Driver→Trend→        │
│      Implication 四層 + H1/H2/H3 Horizon）       │
│   6. Scenario Planning（Best/Base/Worst/Black    │
│      Swan + No-Regret Moves）                    │
│   7. Strategic Implications（Playing to Win 5 問 │
│      + Capability Map + Build/Buy/Partner）      │
│   8. Recommendations & Roadmap（OKR + SMART +    │
│      Growth Loop + Impact-Effort Matrix）        │
│   9. Data Flywheel 自評 + Ecosystem Map          │
│      （霍爾 v1.1 money slide · 超越戰場）        │
│   10. Risks & Watchlist（Top 10 + Assumptions    │
│       Log + Watchlist）                          │
│   Appendix（方法論 + 詞彙 + 資料品質 ABC）        │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│   Part C · BeyondPath 時代命名（Gemini 風）       │
│   §1 Thesis：「液態團隊時代：一人公司用 Claude    │
│       跑完驗證到營收的元年」（霍爾推薦 A）         │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│   Part D · 3 版交付規格（Claude）                │
│   完整版 40-60 頁 / Exec 8-12 頁 / 簡報 15-20 張 │
│   自動產出 3 URL：/full · /exec · /slides        │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│   Part E · 使用提醒（Claude + Howl's Law）        │
│   • 90% 案例只完整做第 3-7 章                    │
│   • 3 大誤用警告                                 │
│   • Howl's Law 三條守護                          │
└─────────────────────────────────────────────────┘
```

---

## 五、Claude 範例的 6 額外工具 × 我們 11 工具選擇矩陣升級

**v1.0**（5 工具 × 5 報告）→ **v2.0**（11 工具 × 5 報告）：

| 工具 \ 報告 | PATH 診斷 | Lab 分析 | 市場探測 | 市場報告 | AI 問卷 |
|---|:---:|:---:|:---:|:---:|:---:|
| **原 5 工具**（SWOT/PESTEL/五力/STP/安索夫）| 既有判定 | 既有判定 | 既有判定 | 既有判定 | 既有判定 |
| **Wardley Map**（Claude 補位）| ❌ | ❌ | 🟡 | ✅ | ❌ |
| **Van Westendorp PSM**（Claude 補位）| 🟡 | ❌ | ❌ | ✅ | ✅ |
| **Kano Model**（Claude 補位）| ❌ | 🟢 | ❌ | 🟡 | ✅ |
| **Shell Scenario Planning**（Claude 補位）| ❌ | ❌ | ❌ | ✅ | ❌ |
| **Playing to Win**（Claude 補位）| 🟢 融入 H 維 | ❌ | ❌ | ✅ | ❌ |
| **Capability Map**（Claude 補位）| ✅ **融入 H 維** | ❌ | ❌ | ✅ | ❌ |

**總體**：PATH 診斷仍保持**極低工具露出**（Claude 原則 + Howl's Law），市場報告成為**11 工具軍火庫**（但讀者看到的仍是一份敘事報告，不是工具清單）。

---

## 六、最終方案 · 新增規範條數

| 來源 | 新增條數 |
|------|---------|
| v1.0 既有 | 338 條 |
| v1.1 霍爾（GPT 補位）| 78 條 |
| v1.1 Gemini addendum（趨勢命名等）| 約 30 條 |
| **Claude 範例補位**（新增）| **約 40 條**（5 設計原則 + Signal-driven + 6 工具 + 3 版交付 + 使用提醒）|
| **v2.0 合計** | **約 486 條** |

---

## 七、Edward 待決策 · 新增 3 題（承接 Gemini 3 題）

### Q4 · AI 處理方式

- [ ] **A. Claude 原則 + 霍爾折衷**：80% 融合交叉維度 + 20% 獨立章（霍爾推薦 🥇）
- [ ] B. Claude 純融合：100% 每章都有 AI 視角，不獨立成章
- [ ] C. 霍爾原版：獨立 §3 AI 重構章

### Q5 · Signal-driven 採用強度

- [ ] **A. 每個 Trend 強制 ≥ 3 Signal 追溯**（Claude 原則，推薦 🥇）
- [ ] B. 只在市場報告採用（PATH/Lab 可省）
- [ ] C. 不採用（用現有 Hypothesis transparency 即可）

### Q6 · 額外 6 工具擴充

- [ ] **A. 全採用**，但選擇性使用（各工具標 ✅🟢🟡❌）（推薦 🥇）
- [ ] B. 只採用 3 個最高影響（PSM / Kano / Playing to Win）
- [ ] C. 不採用（守住原 5 工具）

---

## 八、蘇菲整合觀點

**三個範例各有所長**：
- **Claude 範例勝在 meta 思考**（5 設計原則 / Signal-driven / 使用提醒 / 3 版交付規格）——這是**方法論的成熟度**
- **GPT 範例勝在戰術武器庫**（JTBD 4 層 / AI Native / Growth Loop / Data Flywheel）——這是**執行的具體度**
- **Gemini 範例勝在敘事戰略**（趨勢命名 / STEEP 2.0 / 真實感反彈）——這是**敘事的穿透力**

**BeyondPath 真正要做的 = 吸收三者，但保有自己的 DNA**：
- Meta 層：Claude 的 5 原則
- 戰術層：GPT 的 JTBD 4 層 + Data Flywheel
- 敘事層：Gemini 的時代命名
- 品牌層：**BeyondPath 自己的「溫暖精準」**（warm-serif DNA + 蘇菲聲音 + 台灣在地）

**最後一哩**：整個報告體系的最終成品，讀者遮住 logo 應該仍能認出「這是 BeyondPath」——**不是因為它抄了 Claude/GPT/Gemini，而是因為它有 Howl's Law + PATH 四維 + warm-serif DNA 這三件誰也抄不走的東西**。

---

*v2.0 方案 · 2026-04-21 · 蘇菲整合 · 基於霍爾 v1.1 + Claude 範例補位*
*待 Edward 拍板 Gemini 3 題 + Claude 3 題 共 6 題後正式啟動實作階段*
