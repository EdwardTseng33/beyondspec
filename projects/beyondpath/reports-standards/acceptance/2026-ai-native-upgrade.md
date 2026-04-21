# BeyondPath 報告規格 · v1.1 · 2026 AI-Native 升級補位

> **建立日期**：2026-04-21
> **作者**：🧙 霍爾（CPO / 策略 · Opus 4.7）
> **定位**：**橫切補位文件**——不另起規格，針對 v1.0 四份核心規格（`content-rubric-95.md` / `mckinsey-style-benchmark.md` / `tool-selection-matrix.md` / `market-report-tools-integration.md`）補位 2026 AI-Native 時代的 7 個結構性缺口
> **底線**：4 項 P0（必補）全數落入既有規格相應章節 · 3 項 P1（該補）融入既有欄位 · 3 項 P2（加分）列選採
> **與 Howl's Law 關係**：v1.1 所有升級**嚴守三條**（融合 > 並列 / 讀者情境決定 / 創業者不需學 MBA）

---

## 零、為什麼要 v1.1（戰略脈絡）

### §0.1 v1.0 vs GPT 2026 範例框架差異矩陣

| 要素 | v1.0 現況 | GPT 2026 範例 | **v1.1 補位方案** | 優先級 |
|---|---|---|---|:---:|
| **JTBD 模型** | 只有 Functional 層 | 4 層（Functional / Emotional / Identity / Addiction）| **升級 P 維公式為 JTBD 4 層全驗證** | 🔴 P0 |
| **AI 在賽道的位置** | 僅散見於 T 維 | 獨立 AI Native 專章（3 小節）| **市場報告新增 §3 AI 重構章 · PATH T 維新增「AI 成熟度」子分** | 🔴 P0 |
| **成長飛輪敘事** | 有 Roadmap，無飛輪 | Growth Loop Diagram 圓形飛輪 | **§5.3 Roadmap 每時相首 action 必定義飛輪 node · 新增 circular diagram** | 🔴 P0 |
| **Data Flywheel** | 完全缺 | 概念提及但無驗收 | **§9 新增 Data Flywheel 4 階段自評表（money slide）** | 🔴 P0 |
| **LTV / CAC** | 僅術語表定義 | 獨立商業模式章節 | **§2.2 擴充「商業模式可持續性」4 指標硬性必填** | 🟡 P1 |
| **Scenario Planning** | 僅 Exit scenarios | 完整 3 情境 | **§5.3 Exit scenarios 升級為 Best / Base / Worst + Black Swan 4 軸** | 🟡 P1 |
| **使用場景** | Persona 抽象痛點 | 時間+地點+心境+動作 4 要素 | **Lab §3.1 Persona 卡新增「Scenario」欄位** | 🟡 P1 |
| 市場分層 | 有 TAM/SAM/SOM | 上中下游 | §2.2 價值鏈圖已有，補 BeyondPath 位置明示 | 🟢 P2 |
| Feature Map + MVP | 無獨立章 | 功能地圖 + MVP Scope | Ansoff 主選象限內嵌 Feature Map tag | 🟢 P2 |
| Ecosystem | 無 | 獨立生態章 | Data Flywheel 內嵌「外部 partner node」選填 | 🟢 P2 |

**v1.0 既有**：170 + 47 + 121 = **338 條**
**v1.1 新增**：約 **78 條**（P0 52 + P1 18 + P2 8）
**v1.1 合計**：約 **416 條**

---

## 一、P0 · JTBD 4 層升級規格

### §1.1 JTBD 4 層定義

| 層 | 英文 | 定義 | 問題範式 |
|---|---|---|---|
| **L1 Functional** | 功能層 | 用戶雇用產品完成什麼**具體任務** | 「我要用它做什麼」 |
| **L2 Emotional** | 情感層 | 完成任務過程中想獲得/避免什麼**感受** | 「用的時候我感覺怎樣」 |
| **L3 Identity** | 身份層 | 使用這產品讓用戶**成為/確認自己是誰** | 「我透過它定義自己是個什麼樣的人」 |
| **L4 Addiction** | 習慣層 | 什麼**節奏/觸發**讓用戶每天想打開 | 「為什麼它變成我的儀式」 |

**理論溯源**：Christensen 原 JTBD（HBR 2016）只有 L1；L2 由 Bob Moesta 擴展（Intercom 2019）；L3 來自 Greg Isenberg Identity Economy（2024）；L4 來自 Nir Eyal《Hooked》+ Duolingo retention 實證（2025）。**2026 AI-Native SaaS 時代 4 層全驗證已成 category definer 起跑線**。

### §1.2 BeyondPath 自己跑 4 層範例

| 層 | BeyondPath 給台灣小團隊創辦人的 JTBD |
|---|---|
| **L1 Functional** | 把「驗證方向 → 跑出營收」整條鏈在一個地方完成，不用在 5 個工具間切換 |
| **L2 Emotional** | **不孤單**——半夜擔心 cash flow、懷疑方向錯時，有 Claude 陪跑、有結構化對話對象 |
| **L3 Identity** | **我是一個能獨立跑完整條鏈的創辦人**——不是「還需要 co-founder 才能開公司」的人 |
| **L4 Addiction** | **每日儀式**——早上打開看 PATH 分數 + 今天 3 件事（welcome-banner 的 warm-serif 儀式感、kanban cycle 節奏） |

**策略意涵**：BeyondPath 是 **L3-heavy 產品**（Identity 是最深護城河）+ **L4 儀式**（warm-serif 首頁 = 情感 DNA 物理化身）。這也是為什麼 v1.0.8 退版——視覺把 L4 儀式感抹掉了。

### §1.3 PATH 診斷 P 維升級公式

**v1.0**：P = 痛點真實性 10 + 頻率 5 + 替代方案不滿度 5 + JTBD 清晰度 5 = 25

**v1.1**：
```
P 分數（0-25）=
    L1 Functional 清晰度（6 分）· 能用一句話說「雇用我們幹嘛」
  + L2 Emotional 真實性（6 分）· 訪談出現情緒關鍵字頻率
  + L3 Identity 共鳴度（7 分）· 用戶願意公開說「我用 X」的強度
  + L4 Addiction 節奏（6 分）· 定義打開頻率 + 觸發條件
```

**顯示（漸進揭露）**：
```
Default：雷達圖 P 軸 0-25 score + 狀態色
點擊展開：
    P 22/25 你的用戶把你雇用來完成什麼？
    ├─ L1 功能層   6/6  🟢 「一個人把驗證到營收跑完」
    ├─ L2 情感層   5/6  🟢 「不孤單」關鍵字頻率 72%
    ├─ L3 身份層   6/7  🟡 「獨立 founder」共鳴中等
    └─ L4 習慣層   5/6  🟢 每日晨間儀式已成形
    ─────────────────────
    診斷：強在 L1/L2，L3 有放大空間
    Action: 設計「創辦人徽章」強化 L3
```

**驗收 criteria**：
1. 4 層全填（缺一退版）
2. 每層必有具體證據（Lab quote / 問卷數據 / 行為數據），不得互抄
3. 每層必有狀態色（🟢 ≥80% / 🟡 60-79% / 🔴 <60%）
4. L2 情感層關鍵字 ≥ 3 個
5. L3 身份層必有**第三方可觀測證據**（LinkedIn / Twitter / 社群貼文）
6. L4 習慣層必有量化節奏定義
7. 4 層不互抄
8. 證據來源 tag 必備（🟢/🟡/🔴）

### §1.4 Lab Persona 卡升級

```
┌─────────────────────────────────────┐
│ P3 · 45 歲 · SaaS 工程師轉一人公司     │
│ [🔴 AI 合成 基於 5 份訪談 · 信心度 78%]│
├─────────────────────────────────────┤
│ 📍 基本資料 · 痛點 · Quote（v1.0 既有）│
├─────────────────────────────────────┤
│ 🧬 JTBD 4 層（v1.1 新增）             │
│   L1：替自己驗證 side project 值得做   │
│   L2：不想再獨自對 Notion 空白頁自語    │
│   L3：「我是能用 AI 跑驗證的獨立工程師」│
│   L4：晚餐後 30 分鐘打開跑一次診斷      │
├─────────────────────────────────────┤
│ 🎬 Use Scenarios（v1.1 新增 P1）      │
└─────────────────────────────────────┘
```

**驗收**：
9. Persona 卡必含 4 層 JTBD 摘要（每層 ≤ 25 字）
10. JTBD 來源回扣到具體 quote 或行為
11. 多 persona 的 4 層**互有差異**（都一樣 = 同一 persona 退版）

### §1.5 JTBD 在 5 報告路由

| 報告 | 4 層處理 |
|---|---|
| PATH 診斷 | ✅ P 維子分完整展開 |
| Lab 分析 | ✅ Persona 卡摘要 |
| 市場探測 | 🟡 只用 L1 |
| 市場報告 | ✅ §2.3 消費者 JTBD 三層升級為 4 層 |
| AI 問卷 | 🟢 每題設計意圖可 tag L1/L2/L3/L4 |

---

## 二、P0 · AI Native 章節規格

### §2.1 為什麼要獨立成章

2026 讀者看到「AI Agent 市場規模」已麻木——真正想知道：**「這賽道的成本結構/體驗/格局會被 AI 怎麼重構？」** 這是 Sangeet Paul Choudary「AI-adopting vs AI-native」論述的實踐。

### §2.2 市場報告 §3 AI 重構章結構

**3 小節（必採）**：

| 小節 | 最少必填 | 硬指標 |
|---|---|---|
| **§3.1 AI 可替代流程**（Replace）| 賽道內原本由人做、現在 AI 可做 ≥80% 的流程 ≥ 5 條；每條：替代率 % + 時間窗 + 成本降幅 % | 必量化；至少 1 條附 benchmark（例：Klarna 客服 AI 替代率 83%）|
| **§3.2 AI 增強體驗**（Augment）| AI 讓 UX 質變躍遷 ≥ 3 條；每條：從 X 變 Y 具體對照 + 感知強度 1-5 | 對照必具體；1 個競品實例 |
| **§3.3 成本結構變化**（Restructure）| 成本項目表 before/after AI ≥ 5 項；毛利率變化 pp | 5 項含：人力/客服/行銷/研發/Infra；必 vertical integration 判讀 |

**視覺規格**：
1. **AI 應用架構圖**：賽道核心流程 node heatmap（深紅 80-100% / 橘 50-79% / 黃 20-49% / 灰 <20%）· 封閉五色合規
2. **AI 價值矩陣 2×2**：X = 用戶感知強度 / Y = AI 技術成熟度
3. **成本結構對照 waterfall**：before-AI bar / after-AI bar + primary 色標「AI-native 毛利空間」

**驗收**：12-18 條 criteria（詳見原文）

### §2.3 PATH T 維升級公式

**v1.1**：
```
T 分數（0-25）=
    內部訊號（12 分）· waitlist / LOI / 付費 / 推薦
  + 外部壓力（8 分）· 簡化五力
  + AI 成熟度訊號（5 分）· 賽道 AI benchmark
```

**AI 成熟度 5 分細項**：
- 公開 case 證明 AI 已替代本業 ≥ 50% → 3 分
- 同地區/同語言發生 → +1 分
- 近 12 個月內發生 → +1 分

**驗收**：必引**具名 case**（公司 + URL + 時間），不接受「一般來說」

### §2.4 命名紀律（Howl's Law 守護）

**❌ 錯誤**：「AI Native 分析」「AI 成熟度章節」
**✅ 正確**：「**為什麼這個賽道正在被 AI 重構**」「**AI 改變了什麼、沒改變什麼**」

---

## 三、P0 · Growth Loop Diagram 規格

### §3.1 為什麼不是 Ansoff 象限

**Ansoff**（1957 靜態分類學）回答「該長哪」；**Growth Loop**（2018 Andrew Chen / Reforge）動態飛輪回答「怎麼長、為什麼越長越快」。**AI-Native SaaS 特徵**：**資料 → AI → 體驗 → 更多資料**本身就是 loop。

### §3.2 視覺規格

**對標**：Amazon Flywheel（Bezos 2001 餐巾紙）/ Stripe Growth Loop / Duolingo Streak Loop

**規格**：
- Node 數：**4-6 個**（< 4 不成 loop / > 6 讀者記不住）
- 形狀：圓形或圓角方形（禁止尖角象限）
- 連接：單向閉合 + 箭頭
- 每 node 含：動作 ≤ 12 字 + 產出 ≤ 10 字 + 時間週期
- 可選「AI 加速 arrow」（primary 色 + 「AI 加速」tag）
- 封閉五色

### §3.3 BeyondPath 自己畫一個（示範）

```
    ① 創辦人用 PATH 診斷
       （每週 1 次 · 填 24 題）
             ↓
    ② 產生 P/A/T/H 分數 + 作答資料
       （結構化創業者困境資料）
             ↓
    ③ 全平台匯總訓練 Claude prompt
       （下一位用戶 diagnosis 更精準）
             ↓
    ④ 新用戶拿到「更懂台灣小團隊」報告
       （NPS ↑ / 推薦 ↑）
             ↓
     回 ① 新用戶再跑 + 推薦擴散
     (AI 加速 arrow：100 用戶迭代一次 prompt)
```

### §3.4 位置

- `content-rubric §5.3`：Roadmap 每時相首 action 必綁定 Loop node
- `market-report-tools-integration §1.5`：Ansoff 章結尾強制追加 Growth Loop diagram

**驗收**：21-26 條 criteria

---

## 四、P0 · Data Flywheel 4 階段自評（**本 v1.1 最重要升級**）

### §4.1 戰略意涵（money slide）

**Data Flywheel = AI-Native SaaS 護城河代理指標**。VC 看 AI SaaS 第一個問：「你的資料飛輪在哪？」——沒有 = AI-adopting = 估值折半。

**BeyondPath 必須自己先跑一次**（§4.3），才有資格要求客戶跑。

### §4.2 4 階段定義

位置：市場報告 §9 高階策略章（money slide）

| # | 階段 | 定義 | 必填 |
|:-:|---|---|---|
| **1** | User Action | 什麼具體行為產生 raw data | 動作 ≥ 3 個 · 每動作含頻率 + 預估資料量 |
| **2** | Data Collected | 哪些可被 AI 學習的資料 | 資料類型 ≥ 3 類 · 規模 + 獨特性 1-5 + 隱私等級 |
| **3** | AI Improvement | 資料如何 improve AI | 具體 AI 能力項 ≥ 2 · 每項 baseline → target accuracy + 所需資料量 |
| **4** | UX Enhancement | AI 強化後用戶感知 | 用戶感知 ≥ 2 · before/after 對照 + 預期 retention 影響 |

### §4.3 BeyondPath 自己填一份（示範）

```
BeyondPath Data Flywheel

①  User Action
   • 填 PATH 診斷 24 題（每週 · 600 bytes/次）
   • 跑 Lab 研究訪談（每月 · 15-30KB transcript）
   • kanban 每日記錄 task（每日 · 5 KB）
   • AI 問卷作答（不定期 · 10-50KB/份）
                   ↓
②  Data Collected
   • 結構化 PATH 分數 × 時間序列（獨特性 5/5）
     規模：N users × 52 週 = 高訊號資料池
   • Lab 訪談 transcript（獨特性 4/5 · 需匿名化）
   • 任務 label × 完成率（獨特性 3/5）
   → 預訓練「台灣小團隊 founder」language model
                   ↓
③  AI Improvement
   • PATH diagnosis 準確度 72% → 88%（需 500+ 次資料）
   • Lab insight clustering 60% → 82%（需 200+ transcript）
   • 競品對照建議相關性 55% → 78%
                   ↓
④  UX Enhancement
   • diagnosis 從「通用建議」→「台灣 SaaS 專屬」
     （預期 NPS +15）
   • Lab report 出報時間 30 分鐘 → 5 分鐘
     （預期 D7 retention +20%）
                   ↓
回到 ① 新用戶帶入更多資料
═══════════════════════════

外部 partner（選填）:
• DataForSEO → ② 市場訊號資料 inflow
• Claude API → ③ 基底模型 upstream

護城河強度自評：4.2/5
獨特性最強環節：①→② PATH 週期性行為資料
最脆弱環節：②→③ 隱私處理 × 訓練同意機制
```

### §4.4 護城河強度自評（1-5）

| 維度 | 問題 | 0-5 分 |
|---|---|---|
| **資料獨特性** | 別人也能蒐，還是只有你能蒐？ | 公開可蒐 0 → 唯一來源 5 |
| **Loop 閉合速度** | 資料→AI→體驗一圈多久？ | > 6 月 0 → < 1 週 5 |
| **Network effects** | 用戶越多 → 資料越多 → AI 越強 → 體驗更好？ | 無 0 → 強正反饋 5 |
| **隱私可持續性** | 用戶同意訓練程度 | 未處理 0 → opt-in + 匿名化 5 |

**≥ 16** = AI-native 強護城河（可宣稱 AI-native 定位）
**10-15** = 中度護城河
**< 10** = **對外不得宣稱 AI-native**（Gate 5 Suliman 合規阻擋）

### §4.5 寫法紀律

**❌ 錯誤**：「Data Flywheel 分析」
**✅ 正確**：「**為什麼越多人用 BeyondPath，它就越懂台灣小團隊**」

**驗收**：27-34 條 criteria

---

## 五、P1 · 3 項該補項目

### §5.1 使用場景 Scenario（Persona 卡新增）

每 Persona ≥ 3 場景 × 4 要素（時間 / 地點 / 心境 / 動作）：
```
Scenario #1 · 晚上孤獨時
  時間：週二晚上 22:30
  地點：家中書房（白天客廳，晚上變 WFH 空間）
  心境：剛跟合夥人 LINE 吵完、擔心下個月房租
  動作：打開 PATH → 看到 P 分數掉 → 跑一次 Lab
```

**驗收**：場景不互抄 / 含具體心境形容

### §5.2 LTV / CAC 商業模式章（市場報告 §2.2 擴充）

**必填 4 指標**：
- LTV = ARPU × 平均留存月數（NT$）
- CAC = 行銷支出 / 新增付費客戶（NT$）
- Payback Period = CAC / ARPU（月）
- **LTV/CAC ratio** · > 3 健康 / 1-3 警戒 / < 1 紅警

**加項**：Gross Margin（AI-native 低 5-15pp） · NDR（> 110% 優秀）

**驗收**：4 指標量化 / Payback 必情境分析 / Gross Margin 必行業 benchmark 對照

### §5.3 Scenario Planning 升級（4 情境）

| 情境 | 機率 | 觸發條件 | 應對 |
|---|:-:|---|---|
| **Best** | 10-20% | ARR 達 NT$30M | 提前融資 / 擴編 / 開新 segment |
| **Base** | 50-60% | ARR NT$10-20M | 按原 roadmap |
| **Worst** | 20-30% | ARR < NT$5M | Pivot / cost cut / bridge round |
| **Black Swan** | 2-5% | 具名競品中文版 3 月內 | 緊急差異化 / partnership / 收購 |

**驗收**：4 情境全備 / 機率加總 100% / Black Swan 具名

---

## 六、P2 · 加分項略述

### §6.1 市場分層
融入 `market-report-tools-integration §2.2` 價值鏈分析——補「BeyondPath 位於哪層 + 上下游依賴」明示

### §6.2 Feature Map + MVP Scope
Ansoff 主選象限動作清單內嵌 tag `[MVP / v1.1 / Later]`——不獨立成章

### §6.3 Ecosystem Strategy
§4 Data Flywheel 外部 partner node 已涵蓋——若需獨立則附錄「Partner Landscape」

---

## 七、與既有規格的連動

### §7.1 `content-rubric-95.md` v1.1 修正

| 章節 | v1.0 | v1.1 |
|---|---|---|
| §2.1 Surface PATH | P 軸整體 score | **+ 支援展開 4 層 JTBD 子分** |
| §2.2 Mid PATH | 每軸 diagnosis | **P 軸 diagnosis 必引 4 層關鍵字** |
| §3.1 Lab Persona | 基本資料 + Quote + 情緒 | **+ JTBD 4 層 + 3 Use Scenarios** |
| §5.1 市場 Surface | TAM/SAM/SOM + 競品 | **+ Data Flywheel 示意 + LTV/CAC 4 指標** |
| §5.3 市場 Deep | 三時相 + Exit 3 分支 | **+ Growth Loop · Exit 升級 4 情境 + Black Swan** |
| §9 差異化敘事 | 7 項 | **+ 第 8 項 Data Flywheel 護城河自評** |

### §7.2 `tool-selection-matrix.md` v1.1 修正

- §2.1 P 維 JTBD：Functional 單層 → **4 層權重重分配**
- §2.3 T 維公式：內部 15 + 五力 10 → **內部 12 + 五力 8 + AI 成熟度 5**
- §7 Top 3 工具：JTBD/STP/SMART → **JTBD 4 層 / STP / SMART / + Data Flywheel（市場報告）**

### §7.3 `mckinsey-style-benchmark.md` v1.1 修正

- §5 Action Title：10 條實戰 → **+ 3 條 AI-native 類範本**

### §7.4 `market-report-tools-integration.md` v1.1 修正

- §1.5 Ansoff：章尾追加 Growth Loop circular diagram
- §2.2 產業概述：+ §2.2.3 LTV/CAC 商業模式章 4 指標
- §2.3 消費者 JTBD 三層 → **升級 4 層**
- **§3 新增 AI 重構章**
- **§9 新增 Data Flywheel 章**
- §3.1 推導鏈：6 條 → 8 條（+ AI 重構→Data Flywheel / Data Flywheel→Ansoff 護城河）

---

## 八、霍爾戰略判斷（三個高階觀點）

### §8.1 GPT 範例 · 照抄 vs 不照抄

| ✅ 照抄 | ❌ 不照抄 |
|---|---|
| JTBD 4 層（2026 行業共識）| 9 章萬言書（讀者 30-60 分鐘上限）|
| AI Native 獨立章（敘事升級）| 技術堆疊章（創業者不看 RAG / vector DB）|
| Data Flywheel 4 階段（護城河標準化）| Ecosystem 獨立章（早期創業者沒生態）|
| LTV/CAC/NDR 硬指標 | 5 年財務模型（18 個月就最遠）|
| Best/Base/Worst + Black Swan | Monte Carlo 模擬（over-engineering）|

### §8.2 追隨趨勢 vs 守住差異化

**追隨的**：2026 AI-Native **認知框架**（JTBD 4 層 / AI Native / Data Flywheel）——category 門票
**守住的**：**小團隊早期驗證身段**——不追求完整 / 不追求 jargon / 不追求 PE-level 精緻度

**姿態**：框架 MBB 級（面子）· 篇幅 Bain 級（克制）· 語氣 Maze 級（溫暖）· 敘事 Dovetail 級（共感）——**「看起來嚴謹，讀起來親切」**

### §8.3 直接超越 McKinsey + GPT 的戰場 = §9 Data Flywheel 章

**為什麼**：
- McKinsey 不寫（太顧問腔）
- GPT 範例寫得表面（只有概念，無 4 階段 + 4 維自評）
- BeyondPath 能寫深（本身就是 AI-native SaaS · 自己跑示範就是 proof of thesis）

**超越路徑**：結構化 4 階段 × 4 維自評 + circular diagram + 護城河雷達 + 賦能提問章名 + 產品內建生成器

**結果**：讀者會說「這章我沒在別地方看過」——這就是 category definer 標誌。

---

## 九、工時雙軌

- **預估工時**：2-3 小時
- **移動城堡**：~45 分鐘
- **倍率**：~4-6×（戰略類偏低；若需同步改 app.html 實作 4 層 JTBD UI，倍率拉高 15-25×）

---

*v1.1 · 2026-04-21 · 霍爾 Opus 4.7 · 1M context*
*對標：Christensen JTBD (HBR 2016) / Moesta Emotional JTBD (Intercom 2019) / Greg Isenberg Identity Economy (2024) / Nir Eyal Hooked (Duolingo 2025) / Andrew Chen Growth Loops (Reforge 2020) / Sangeet Paul Choudary Vertical AI & Data Flywheel (Medium 2024-2026) / Stripe Growth Engineering / Amazon Flywheel (Bezos 2001)*
