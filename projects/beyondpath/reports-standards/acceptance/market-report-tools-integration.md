# 市場報告 · MBA 工具整合規格（5 工具 × 6 要素 × 整合邏輯）

> **⚠️ 適用範圍聲明（2026-04-21 修正）**：
> 本規格**僅適用於「市場報告」這一份報告類型**（5 份中最嚴肅、給投資人/高管看的那份）。
> 其他 4 份報告（PATH 診斷 / Lab 分析 / 市場探測 / AI 問卷）**不全用** MBA 工具——選擇性融合規則見 `tool-selection-matrix.md`（待霍爾修正版完成）。
> **PATH 四維（P/A/T/H）增強融合版**亦在 `tool-selection-matrix.md`（STP 融合 A 維等）。
>
> **建立日期**：2026-04-21
> **作者**：🧙 霍爾（CPO / 策略 · Opus 4.7）
> **與其他 rubric 關係**：與 `content-rubric-95.md §5`（內部三層）+ `mckinsey-style-benchmark.md`（外部格式）**三軌並列**，本規格補齊 MBA 標準「分析工具論」缺口。
> **底線**：5 工具必採用、6 要素必出現、6 條推導規則必對齊；Gate 3 霍爾逐條驗收。

---

## 零、本規格在規格體系的位置

| 文件 | 回答什麼 |
|------|---------|
| `content-rubric-95.md §5` | 市場報告有什麼數據（Surface）/ 為什麼代表什麼（Mid）/ 接下來做什麼（Deep）|
| `mckinsey-style-benchmark.md` | 市場報告長怎樣才像 MBB（格式 / 敘事 / 視覺）|
| **本檔（market-report-tools-integration.md）** | **市場報告用哪幾個分析工具、工具彼此的邏輯關係、整合閉環** |

三份都必過才是 95 分。

---

## 一、五大工具使用規格

### §1.1 SWOT 分析

| 項目 | 規格 |
|---|---|
| **出現位置** | `content-rubric §5.2 Mid`（Thesis 三支柱後即 SWOT 章）+ `§5.3 Deep` 前戰略推導轉接點 |
| **最少必填欄位** | S/W/O/T 四象限各 **≥ 3 點 ≤ 5 點**；每點 ≤ 20 字；每點必附量化錨點（數字/%/時間）或原文證據（引用 Lab / 問卷）|
| **視覺呈現** | 2×2 矩陣卡片；四象限用封閉五色：S=teal / W=rose / O=gold / T=slate；primary 保留給中央「主定位結論」；**禁止 stripe** |
| **9.5 分 criteria** | 每點具體可驗證（非「團隊很強」而是「6 位工程師均有 5+ 年 AI 經驗」）；S/W 來源=內部（PATH+Lab）；O/T 來源=外部（PESTEL+五力）；**每點附來源溯源 tag**（`→ PESTEL §X.X` 或 `→ PATH A 軸`）|
| **10 分 criteria** | 每點再配「戰略動作 tag」（SO 攻擊 / WO 補位 / ST 防禦 / WT 避險）為 STP 與 Ansoff 鋪路；四象限**數量不對稱**（反映真實策略不對稱）|
| **禁止** | 四象限湊數 / 無錨點敘述 / Ansoff 推導沒回頭引用 SWOT |

### §1.2 PESTEL 分析

| 項目 | 規格 |
|---|---|
| **出現位置** | `§5.1 Surface` 的「成長驅動 top 5」與「監管/合規風險清單」合併升級為 PESTEL 六構面章 |
| **最少必填** | 六構面（Political / Economic / Social / Technological / Environmental / Legal）各 ≥ 2 點，共 ≥ 12 點；每點附「影響方向 ↑/↓」+「影響強度 1-5」+「時間維度：現在/12 月內/24 月+」|
| **視覺呈現** | 六格卡片網格（3×2 或 2×3）；每格頂端 line-icon 20×20 + 構面名 + 影響強度 chip（slate→gold→rose 三階對應 1-5）|
| **9.5 分 criteria** | 六構面全覆蓋（缺一退版）；每點含 third-party 來源；Environmental 與 Legal 不得以「不相關」帶過（小團隊 SaaS 仍有 GDPR / 個資法 / 碳揭露相關性）|
| **10 分 criteria** | 每點 explicit 標示「→ SWOT **O** 第 X 點」或「→ SWOT **T** 第 Y 點」——**每個 PESTEL 點必須推導到 SWOT 某點**，否則視為冗餘 |

### §1.3 波特五力分析

| 項目 | 規格 |
|---|---|
| **出現位置** | `§5.1` 競品 landscape 矩陣**前**——先結構化五力、再進 competitor matrix |
| **最少必填** | 五力各有威脅強度 1-5 + 2-3 支撐理由 + 1 緩解動作 |
| **視覺呈現** | 中央「既有競爭」+ 四角「新進者/替代品/買方/供應商」放射圖（對標 BCG 經典）；色塊+文字雙編碼；**禁 radar chart**（5 軸雷達對「強度」語義不精確）|
| **9.5 分 criteria** | 五力各自產業特化（不能都寫「市場競爭激烈」空話）；買方議價引用 Lab §3.2 價格敏感度；替代品 ≥ 3 個具體（不是 SaaS 競品，而是 Excel / LINE / 外包會計等真實替代）|
| **10 分 criteria** | 每力緩解動作對應到 Ansoff 某象限；五力總分 → Industry Attractiveness Score（滿分 25，≤10 紅海、11-17 可打、≥18 藍海）|
| **禁止** | 任一力「低」不解釋 / 把 Maze/Dovetail 當供應商 / Notion/Attio 當替代品（它們是競爭者）|

### §1.4 STP 分析

| 項目 | 規格 |
|---|---|
| **出現位置** | `§5.2 Mid` 結尾「戰略意涵」轉接；SWOT 後、Ansoff 前必經章 |
| **最少必填** | **Segmentation**：≥ 3 個可辨識區隔（附人數/預算/行為）；**Targeting**：從 N 個選 1 primary + 1 secondary，明示為何放棄其他（strategic sacrifice）；**Positioning**：「For [用戶] who [需求], BeyondPath is [類別] that [差異化], unlike [競爭者] we [獨特 promise]」六格公式 |
| **視覺呈現** | Segmentation = 氣泡圖（X=規模 / Y=採用意願，氣泡大小=預估 LTV）；Targeting = 氣泡圖圈選（primary 實心紫 / secondary 描邊 teal / 放棄 slate）；Positioning = 卡片（warm-serif 儀式字體允許，屬戰略定位儀式感）|
| **9.5 分 criteria** | Segmentation 變數 ≥ 3 層（人口+行為+心理）；Targeting 放棄理由具體可量化；Positioning 六格全填不得缺 unlike/we |
| **10 分 criteria** | Positioning 結論直接餵進 `.welcome-banner` sub-line 文案（策略→品牌敘事閉環）；Targeting primary segment 與 Lab primary persona 顯式對齊 |
| **禁止** | Segmentation 用「中小企業」這種非區隔 / Targeting 不放棄任何段（=沒做 Targeting）/ Positioning 寫「最好的 AI SaaS」絕對化 |

### §1.5 安索夫矩陣

| 項目 | 規格 |
|---|---|
| **出現位置** | `§5.3 Deep` 前置戰略章——Roadmap 之前的成長策略象限選擇 |
| **最少必填** | 2×2 矩陣（X：既有/新市場；Y：既有/新產品）→ 市場滲透 / 市場開發 / 產品開發 / 多角化；每象限填動作 ≥ 1 項 + 風險等級（低/中/高）+ 資源配比 %；四象限 **總和 = 100%** |
| **視覺呈現** | 經典 2×2 卡片；四象限風險漸層（滲透 teal / 開發 gold / 產品 gold / 多角化 rose）；主選象限加 primary 外框高亮；禁 3D 旋轉 |
| **9.5 分 criteria** | 四象限全填（不能只填主選 · 其餘明示「不採用」戰略理由才完整）；資源配比 % 精確加總 100%；每象限動作可映射到 Roadmap 時相 |
| **10 分 criteria** | 每象限動作附 SMART 五要素；主選象限「為何是它」明示回頭引用 SWOT SO/WO/ST/WT tag |
| **禁止** | 四象限全 ≥ 20%（=沒選）/ 多角化放完全無根據新事業 / 資源配比沒加總檢驗 |

---

## 二、六要素結構規格

### §2.1 SMART 目標原則

Executive Summary 之後、正文之前必有「分析目標 SMART」抽屜：

```yaml
本報告的分析目標（SMART）:
  Specific:   要回答什麼問題？（例：BeyondPath 應否於 2026 H2 進入台灣 3-10 人服務業 SaaS 市場？）
  Measurable: 用什麼數字判定？（例：18 個月內達 ARR NT$15M + 留存 ≥ 70%）
  Achievable: 為什麼做得到？（例：PATH A 軸 20/25、Lab 已驗證 3 付費客戶意向）
  Relevant:   為什麼現在問？（例：對標 Honeybook 中文版 reverse-engineer 預估 9 個月進場）
  Time-bound: 何時到期？（例：本報告結論效期至 2026-10-21，6 個月後重跑）
```

**硬指標**：五要素全填 / Specific 必為疑問句 / Measurable 必含雙指標（leading + lagging）/ Time-bound 必明示報告 shelf-life
**9.5 分**：SMART 五格回扣到 Ansoff 主選象限動作
**10 分**：SMART 與 Executive Summary thesis 句邏輯一致（thesis 回答 Specific、thesis 數字 = Measurable）

### §2.2 市場與產業概述（擴充既有 TAM/SAM/SOM）

補位項（不重複 `content-rubric §5.1`）：

| 補位項 | 規格 |
|---|---|
| **產業生命週期階段** | 在 TAM/SAM/SOM 旁明示「導入期 / 成長期 / 成熟期 / 衰退期」；判斷依據 ≥ 2 條（CAGR / 新進者數 / 客戶教育成本 / 定價壓力趨勢）|
| **價值鏈分析** | 1 張 exhibit 畫產業價值鏈（例：Raw LLM → Tooling → App Layer → End User），標示 BeyondPath 所處環節 + 上下游議價能力（接回五力買方/供應商）+ 利潤池集中環節（rose highlight）|

**9.5 分**：生命週期階段 + 價值鏈圖明確告知 Ansoff 主選象限
**禁止**：把「AI 產業」當本產業（粒度錯）/ 價值鏈省略下游 end-user

### §2.3 消費者分析專章（濃縮版 Lab · 不重抄）

與 Lab 報告的區別：Lab 是深度田野 → 市場報告消費者專章是 **Lab 萃取版 ≤ 1 頁**。

| 必填區塊 | 規格 |
|---|---|
| **JTBD 三層** | 功能層（要完成什麼任務）/ 情感層（想獲得什麼感受）/ 社交層（想被怎麼看）；強制生活化比喻；每層 ≤ 30 字 |
| **購買旅程 5 階** | Awareness → Consideration → Decision → Onboarding → Retention；每階 1 句「用戶做什麼 + 用什麼工具 + 痛在哪」|
| **情感曲線** | 橫軸購買旅程 5 階、縱軸情緒（-3 挫折 → +3 爽）；highlight 最低點（rose）+ 最高點（teal），附「BeyondPath 在此點的機會」一句 |

**9.5 分**：JTBD 三層不互抄 / 購買旅程引用 Lab quote（不是自己想）/ 情感曲線有具體最低點文案
**10 分**：消費者專章結論直接餵進 §1.4 STP Positioning 的 [需求]；情感曲線最低點對應 Ansoff 主選第一動作（先修復最痛那點）

### §2.4 競爭對手分析（五力 + STP 擴充）

補位項（不重複 `content-rubric §5.1` 8-12 對手競品矩陣）：

| 補位項 | 規格 |
|---|---|
| **每對手 STP 解讀** | 逆向解讀 top 5 競品：「For [他們鎖定誰] they are [類別] that [他們的差異化]」。暴露市場空白區 |
| **每對手 Ansoff 象限** | 每 top 5 對手當前在哪 Ansoff 象限，暴露 BeyondPath 若走相反可避開正面碰撞 |

**9.5 分**：Top 5 對手 STP + Ansoff 全填；發現 ≥ 1 個 uncontested segment 或標明「無空白必須正面打」
**10 分**：逆向 STP 的「放棄者」欄位彙總 → 成為 BeyondPath primary segment 候選（競品不要的可能是我機會）

### §2.5 SWOT + STP 總結章（戰略意涵單頁 · the money slide）

| 規格 | 內容 |
|---|---|
| **位置** | Roadmap 前、所有分析後；單頁獨立；脫離全報告能被讀懂 |
| **版面 3 區** | 上：SWOT 四象限壓縮（每象限 top 2 點）/ 中：STP Positioning 六格 / 下：戰略結論 3 行（thesis / Ansoff 主選 / 18 月 KPI）|
| **Action Title** | 完整結論句 ≤ 15 字（例：「內部執行力 vs 市場時機同時有利，18 個月進場窗口」）|
| **9.5 分** | SWOT 四象限 top 8 點**全部已在前章出現**（不新增）/ STP 已在 §1.4 出現 / **本章純彙整不新增 insight**（Pyramid：結論不能有新證據）|
| **10 分** | 戰略結論 3 行精準預告 Roadmap 第一里程碑 / 本頁截圖可單獨給 VC 做 elevator pitch（40 秒講完）|
| **禁止** | 在總結章新增分析 / 總結變成另一個 Executive Summary / 超過 1 頁 |

### §2.6 建議與行動 Plan（三時相 + SMART 強化）

補位項（不重複 `content-rubric §5.3` 三時相 Roadmap + Exit + 雙敘事）：

| 補位項 | 規格 |
|---|---|
| **每 action 附 SMART 五要素** | 不只時程+負責+預算，再疊 SMART 完整版 |
| **每時相對應 Ansoff 象限** | 0-3 月=滲透 / 3-12 月=滲透+開發 / 12+月=產品開發；每時相 header 明示 Ansoff 象限 |

**格式範例**：
```
Action 1.1 · 優化報價模組轉換率
Specific: 首次用戶到第一份報價的漏斗從 62% 提到 80%
Measurable: funnel 第 3 步 retention（週報）+ 首月續用率（月報）
Achievable: Lab 驗證 3 阻礙點 / 工時 40h
Relevant: 對應 Ansoff 滲透象限 40% 資源配比
Time-bound: 2026-06-30 前
誰做 / 工時 / 風險 / 失效條件（沿用既有格式）
```

---

## 三、整合邏輯（戰略判斷的脊椎）

**這章是本規格最關鍵**——MBA 工具若只羅列不整合只是「擺工具展」，真正戰略價值在**推導鏈閉環**。

### §3.1 推導鏈（5 條必須單向閉合）

```
PESTEL  ─推導→  SWOT (O/T)     §3.2 規則 1
五力    ─推導→  SWOT (W/T)     §3.2 規則 2
PATH+Lab─推導→  SWOT (S/W)     §3.2 規則 3
SWOT    ─推導→  STP            §3.2 規則 4
STP     ─推導→  Ansoff         §3.2 規則 5
Ansoff  ─推導→  Roadmap+SMART  §3.2 規則 6
```

### §3.2 六條推導規則（Gate 3 逐條檢）

| # | 規則 | 驗收 |
|---|---|---|
| **1** | 每個 PESTEL 點 → 必有對應 SWOT O 或 T 某點 | grep PESTEL 每點結尾 `→ SWOT O/T §X.X`，無者退 |
| **2** | 每個五力**高威脅項**（強度 ≥ 4）→ 必有對應 SWOT W 或 T 某點 | 同上 grep |
| **3** | 每個 SWOT S/W → 必有源自 PATH 某軸 或 Lab 某 insight cluster | 同上 grep |
| **4** | SWOT 四象限 → STP Targeting 放棄理由必引用 SWOT ≥ 2 點 | §1.4 Targeting grep `SWOT §` ≥ 2 |
| **5** | STP Positioning 差異化句 → Ansoff 主選象限動作第一條邏輯對應 | §1.5 主選動作逐點對齊 §1.4 unlike/we |
| **6** | Ansoff 四象限資源配比 → Roadmap 三時相預算配比 ≈ 相符（±10%）| 對比 Ansoff % vs Roadmap NT$ 配比 |

**任一斷裂 → 全報告 MBA 不及格**，退 Gate 3。

### §3.3 反向崩潰測試（避免「工具羅列」）

每份市場報告 Gate 3 追加一題：

> **「把 PESTEL / 五力 / SWOT / STP / Ansoff 任何一章拿掉，剩下四章會崩潰嗎？」**
> - 會崩潰 → **整合到位**（這章真的有價值）
> - 不會崩潰 → **該章冗餘**（擺著好看）

**9.5 分 criteria**：五工具彼此不可或缺。

---

## 四、工具間「不重疊」判定表

### §4.1 只出現一次（避免冗餘）

| 工具 | 唯一出現位置 | 原因 |
|---|---|---|
| SMART 目標 | 報告開頭（§2.1）+ 每 Action 上（§2.6）；中間章節不得再列 | 開頭定義、Action 嵌入；中間列=視覺雜訊 |
| TAM/SAM/SOM | §2.2 一次 | 不要在競品章又列、Roadmap 又列 |
| 價值鏈圖 | §2.2 一次 | 五力買方/供應商時文字引用即可 |
| 情感曲線 | §2.3 一次 | 不在 Ansoff 或 SWOT 重現 |
| Positioning 六格 | §1.4 一次 + §2.5 總結壓縮重現 | 總結是彙整非新增 |

### §4.2 互相引用（跨章 cross-reference 強制）

| 引用鏈 | 引用方式 |
|---|---|
| PESTEL → SWOT O/T | 每 PESTEL 點結尾 `→ SWOT O §1.1-O1` |
| 五力 → SWOT W/T | 每力緩解動作結尾 `→ SWOT W §1.1-W2` |
| PATH/Lab → SWOT S/W | 每 S/W 點開頭 `🟢 PATH A 軸 18/25` 或 `🟢 Lab P3 quote` |
| SWOT → STP | Targeting 放棄理由 `← SWOT WT §1.1-T2` |
| STP → Ansoff | 主選象限動作 `← Positioning unlike-we` |
| Ansoff → Roadmap | 每時相 header `Ansoff 象限：市場滲透（40% 資源）` |

### §4.3 合併呈現（節省版面）

- §2.5 總結章：SWOT 壓縮 + STP Positioning + 3 行戰略結論 合併單頁
- Exhibit #4-5：SWOT 2×2 + 戰略動作 tag（SO/WO/ST/WT）合併
- Exhibit #9：Ansoff 2×2 + 資源配比 % + 風險等級 合併

### §4.4 絕對禁止混合

| 禁止 | 原因 |
|---|---|
| SWOT 與 STP 畫同張 2×2 | 語義完全不同（SWOT=優劣機威 / STP=區隔目標定位）；混合讀者腦傷 |
| PESTEL 塞進 SWOT O/T 象限 | PESTEL=外部全景 / SWOT O/T=過濾後子集；混合失去過濾意義 |
| 五力與價值鏈合併 | Porter 同作者但層次不同（五力=產業競爭 / 價值鏈=企業內部）|
| Ansoff + BCG 成長矩陣 | 軸不同；小團隊只用 Ansoff（BCG 適用多產品線組合）|

---

## 五、BeyondPath 的 McKinsey 式改造

### §5.1 五工具 Action Title 改造

| 工具 | ❌ 平庸 | ✅ McKinsey + BeyondPath 級 |
|---|---|---|
| **SWOT** | SWOT 分析 | **內部執行力 × 市場時機同時有利，18 個月進場窗口** |
| **PESTEL** | PESTEL 六構面掃描 | **台灣 AI 政策紅利 + 個資法緊縮，外部壓力偏正 3:2** |
| **五力** | 波特五力 | **買方議價最弱（鎖定效應），新進者威脅最強（紅海徵兆）** |
| **STP** | STP 定位分析 | **放棄 SMB 泛用定位，只鎖 3-10 人服務業老闆** |
| **Ansoff** | 成長策略矩陣 | **主選市場滲透 60%，產品開發 30%，棄多角化** |

**憲法**：沿用 `mckinsey-style-benchmark.md §5` 公式 + 黃金測試（≤15 字、完整結論句、蓋 body 可讀）

### §5.2 每工具 Source Footnote

| 工具 | Footnote 模板 |
|---|---|
| **SWOT** | `Source: PATH 診斷 (n=1, Apr 2026) + Lab 分析 (n=5 interviews, Mar 2026); BeyondPath analysis, Apr 2026` |
| **PESTEL** | `Source: 經濟部 SMB 白皮書 2025 + Gartner AI Agent Market 2026 + BeyondPath desk research, Apr 2026` |
| **五力** | `Source: Crunchbase 競品 funding Q1 2026 + BeyondPath competitor analysis, Apr 2026 🟡 推估成分見信心度抽屜` |
| **STP** | `Source: Lab primary persona cluster (n=5, Mar 2026); BeyondPath synthesis, Apr 2026` |
| **Ansoff** | `Source: BeyondPath strategy synthesis §1.1-§1.4 + financial projection v1.0; Apr 2026 🟡 含財務推估` |

**三色 badge**：每 footnote 結尾標 🟢🟡🔴（對應 `content-rubric §8 Hypothesis Transparency`）

### §5.3 每工具結尾 Takeaway（So what 一句）

| 工具 | Takeaway 範例 |
|---|---|
| **SWOT** | `So what: 18 月窗口打 SO 攻擊，不花資源補 WT——放棄「什麼都做」` |
| **PESTEL** | `So what: 台灣政策面正向、法規面待觀察；外部推力足以啟動，不需等完美時機` |
| **五力** | `So what: 新進者是最大敵人；反制窗口 9 個月，靠產品差異化而非價格` |
| **STP** | `So what: 3-10 人服務業是唯一 segment；放棄泛 SMB 換來敘事鋒利度` |
| **Ansoff** | `So what: 市場滲透是唯一答案（60% 資源）；產品開發副線（30%），多角化免談` |

**Gate 3 檢查**：工具章無 Takeaway callout → 退回

---

## 六、總驗收 checklist（Gate 3 霍爾用）

```
【工具完備度】
[ ] SWOT 四象限 ≥ 3 點 / 象限，每點量化錨點 + 來源 tag
[ ] PESTEL 六構面 ≥ 2 點 / 構面，全覆蓋不缺
[ ] 波特五力 5 力有分數 + 2-3 支撐 + 1 緩解
[ ] STP Positioning 六格公式全填
[ ] Ansoff 2×2 + 資源配比加總 = 100%

【結構完備度】
[ ] SMART 五要素開頭明示
[ ] 產業生命週期 + 價值鏈圖
[ ] 消費者專章 JTBD + 購買旅程 + 情感曲線
[ ] 競品分析含 top 5 逆向 STP + Ansoff
[ ] SWOT + STP 總結單頁
[ ] 三時相 Roadmap 每 action 附 SMART

【整合邏輯】
[ ] PESTEL → SWOT O/T 每點有 tag
[ ] 五力高威脅 → SWOT W/T 每點有 tag
[ ] PATH+Lab → SWOT S/W 每點有來源
[ ] SWOT → STP Targeting 放棄理由引用 ≥ 2 點
[ ] STP Positioning → Ansoff 主選動作邏輯對應
[ ] Ansoff 資源配比 ≈ Roadmap 預算配比（±10%）

【McKinsey 化】
[ ] 五工具每章 Action Title ≤ 15 字
[ ] 五工具每章 Source Footnote 三元素 + 三色 badge
[ ] 五工具每章結尾 Takeaway（So what 一句）

【不重疊】
[ ] SMART 只在開頭 + Action 嵌入
[ ] TAM/SAM/SOM 只出現一次
[ ] SWOT 與 STP 沒畫在同張 2×2
[ ] PESTEL 沒硬塞進 SWOT 象限
[ ] 反向崩潰測試：拿掉任一工具章剩下會崩嗎？（應：會崩）
```

**27 項全勾才進 Gate 1 · 任一未勾退版**

---

## 七、霍爾戰略觀點（3 條最重要整合判定）

### 🥇 #1 · PESTEL → SWOT O/T 強制單向 tag
**MBA vs 野路子報告的分水嶺**。多數野路子把 PESTEL 與 SWOT 都列上去，但**沒有推導關係**——讀者看完不知道兩章有什麼關係。強制每個 PESTEL 點都 tag 到 SWOT O/T 某點，報告從「擺工具展」變「推導鏈閉環」。

若一個 PESTEL 點 tag 不到任何 SWOT → 該點對我無關應刪；若一個 SWOT O/T 點追不到 PESTEL 源頭 → 那個 O/T 是憑空感覺、缺外部驗證。

### 🥈 #2 · SWOT → STP → Ansoff 三段推導
**戰略邏輯的脊椎**。若 SWOT WT 提示「避險」，但 Ansoff 主選「多角化」（最高風險），**全報告戰略不一致**。VC 會議現場被 reject 的典型 killer。

強制 STP Targeting 放棄理由引用 SWOT ≥ 2 點、Ansoff 主選動作對應 STP unlike-we，三段一旦斷裂讀者立刻察覺「分析與建議不一致」。

### 🥉 #3 · 反向崩潰測試
**最終 MECE 守門員**。Gate 3 強制問：「拿掉任一工具章，剩下會崩嗎？」——會崩才算整合到位。

若拿掉五力章報告照樣讀得通 → 代表五力章是**擺著好看**、沒承載實際推導功能。避免報告變「工具清單」而非「戰略思考」。

---

## 八、與其他 rubric 配合

| 文件 | 關係 |
|---|---|
| `content-rubric-95.md §5 市場報告` | **互補**：§5 定義 Surface/Mid/Deep 三層內容深度；本規格定義工具論與整合邏輯 |
| `mckinsey-style-benchmark.md` | **互補**：McKinsey 規定外部格式（Action Title / Source / SCQA / Chart）；本規格規定分析工具骨架 |
| `visual-rubric-95.md` | **互補**：本規格 §1.1-§1.5 視覺呈現由女巫 10 維把關；衝突時 visual rubric 優先（品牌 DNA）|
| `tool-selection-matrix.md` | **上位**：選哪些工具用哪些報告（本規格僅適用市場報告）|

**四軌交集**：同頁 exhibit 需同時滿足四份 rubric；單份通過不代表整體通過。

---

## 九、121 條可驗收 criteria 彙整

- 5 工具規格 = ≥ 25 條
- 6 要素結構 = ≥ 24 條
- 整合邏輯 = 12 條（推導鏈 5 + 規則 6 + 反向 1）
- 不重疊判定 = 18 條（§4.1 一次性 5 + §4.2 cross-ref 6 + §4.3 合併 3 + §4.4 禁止混合 4）
- McKinsey 改造 = 15 條（Action Title 5 + Footnote 5 + Takeaway 5）
- Gate 3 Checklist = 27 項

**合計 121 條**（純新增、不重複 content-rubric 170 條 + mckinsey-benchmark 47 條）

---

*v1.0 · 2026-04-21 · 霍爾 Opus 4.7*
*對標 MBA 核心工具（Porter / Ansoff / Kotler STP / Drucker SMART）+ McKinsey 整合顧問實務*
***適用範圍**：市場報告。其他 4 份報告的工具選擇見 `tool-selection-matrix.md`（待修正版）*
