# BeyondPath 市場報告 · McKinsey 級標竿對標規範

> **建立日期**：2026-04-21
> **作者**：🧙 霍爾（CPO / 策略 · Opus 4.7）
> **目的**：為 BeyondPath「市場報告」建立 **95 分 → 10 分理想級** 的頂級對標標竿，以 McKinsey/BCG/Bain 三大顧問公司（MBB）的報告格式為基準
> **用法**：
> - 市場報告 Layer 1（Content Spec）起筆前先過一次
> - Gate 3 遠景校準時逐條驗收
> - 與 `content-rubric-95.md §5` 市場報告評分矩陣並用
> **底線**：47 條中「必採 21 條」全數達標 · 「選採 26 條」至少 60%

---

## 零、為什麼要對標 McKinsey（不是 Maze/Dovetail）

| 對標對象 | 回答什麼 | 適合誰 |
|---------|---------|-------|
| **Maze/Dovetail** | 研究工具怎麼呈現用戶洞察 | 內部研究員、產品經理 |
| **Productboard** | 產品優先級怎麼排 | 產品團隊 |
| **McKinsey/BCG/Bain** ✨ | **給投資人 / 高階主管看的市場報告長怎樣** | **BeyondPath 市場報告真正的讀者** |

BeyondPath 市場報告的讀者不是自己團隊研究員，而是：
- 愛德華要拿去跟 VC 談的投資人
- 客戶公司的 C-level / 董事會
- 可能的策略合作對象

他們一天看 10 份報告，**第一秒就判斷這份報告是不是「認真的」**。McKinsey 級的格式嚴謹度 = 認真的代理指標。

---

## 一、McKinsey 報告格式解剖

### §1.1 Executive Summary 寫法（4 段式 · 總 150-250 字）

| 段 | 功能 | 字數 | 例子 |
|---|------|------|------|
| **Thesis sentence** | 一句話給完答案 | **30-50 字** | 「亞太 AI-SaaS 小團隊市場 2026-2028 將從 $2.1B 擴張至 $5.4B，台灣以 18% CAGR 位居成長最快三角區前列。」 |
| **Three pillars** | MECE 論證三點 | 各 30-50 字 | 「(1) 小團隊採用率翻倍…(2) 台灣政策紅利…(3) 本土 AI 模組缺口…」 |
| **Implication** | 「所以呢」 | 30-50 字 | 「這意味著 2026 H2 是進場窗口；錯過者將面對 2027 紅海。」 |
| **Recommended action** | 「怎麼辦」 | 30-50 字 | 「優先聚焦 3-10 人服務業 segment，放棄泛 SMB 定位。」 |

**硬指標**：
- 總字數 150-250（過多讀者跳過，過少不夠 substantiate）
- Thesis 必含可驗證數字或明確時間點
- 禁止開場：「本報告分析了 X」「近年來 AI 蓬勃」→ McKinsey 退稿
- **Elevator test**：只讀這段 30 秒，能否做決策？

### §1.2 Pyramid Principle（Minto / SCQA）

Barbara Minto 1960s 於 McKinsey 發明，至今 MBB standard。

**SCQA 開場公式**：

| 元素 | 功能 | BeyondPath 市場報告應用 |
|------|------|---|
| **S**ituation | 讀者已知背景 | 「台灣 SMB 服務業長期以 Excel + LINE 管理」 |
| **C**omplication | 擾動 | 「但 2024-2026 AI 浪潮讓 3-10 人團隊首次有機會自動化 60% 苦工」 |
| **Q**uestion | 隱含問題 | 「那麼 · 誰會贏下這波採用？用什麼產品？市場多大？」 |
| **A**nswer = thesis | 金字塔頂端 | 「3 年內 $2.1B → $5.4B；贏家是『AI-native + 在地工作流』的垂直玩家」 |

**Pyramid 結構**：
```
               [ 主答案 · Thesis ]
                       │
     ┌─────────────────┼─────────────────┐
     │                 │                 │
  Pillar 1         Pillar 2          Pillar 3
  (MECE)           (MECE)            (MECE)
     │                 │                 │
  證據 證據 證據    證據 證據 證據    證據 證據 證據
```

**MECE 鐵律**：
- **互斥**：三支柱不重疊（壞例：「省錢」+「降成本」同義）
- **窮盡**：加起來覆蓋問題全貌（壞例：只談需求不談供給）
- **支柱數**：2-4 個（標準 3；超過 4 人腦記不住）

### §1.3 Exhibit 設計語言

McKinsey 稱「exhibit」不稱「chart」——每個 exhibit 是**一個完整論點**。

| 規則 | 內容 |
|------|------|
| One chart, one point | 每張圖一個洞察；title 有「and」就拆成兩張 |
| Chart is a sentence | 「圖是用來說一句話的，不是資料畫出來」 |
| 蓋資料光看標題懂結論 | 黃金測試 |
| 配色極簡 | 2-3 色；單一 highlight 色點主角 |
| 無陰影、無漸層、無裝飾 | 「當一切都很吵，沒東西突出」 |

**Exhibit 版面 5 區**：
```
┌──────────────────────────────────────────────┐
│ Action Title · 結論句（18px bold · 1-2 行）    │  區 1
│ Subtitle · 佐證補充（13px · 選用）              │  區 2
├──────────────────────────────────────────────┤
│                                              │
│           Chart Body                         │  區 3
│      （highlight 色點主角；其他灰階）            │
│                                              │
├──────────────────────────────────────────────┤
│ Footnote¹ ² （11px 灰）                        │  區 4
│ Source: [資料], [年份]; [分析方法]（10px 灰）   │  區 5
└──────────────────────────────────────────────┘
```

### §1.4 Slide Master 結構
```
┌────────────────────────────────────────────────┐
│ [Section name · 左上 10px 灰]                   │  Breadcrumb
├────────────────────────────────────────────────┤
│ ACTION TITLE（18-22px · bold · 左齊）           │  Headline
│ Optional subtitle（13-14px regular）            │
├────────────────────────────────────────────────┤
│           Body（exhibit / text / table）        │  Content
├────────────────────────────────────────────────┤
│ Footnotes¹² （11px）                            │  Footer
│ Source: ... （10px 灰）      [Page · Date]     │
└────────────────────────────────────────────────┘
```

**核心**：每張 slide 獨立存在 = 離開 deck 單獨印出仍能被看懂。

### §1.5 資料來源標示規範

**標準格式**：
```
Source: [原始資料庫], [年份或期間]; [分析方法說明]
```

**實例**：
- `Source: IDC Worldwide SaaS Tracker, Q2 2024; McKinsey Digital`
- `Source: McKinsey survey of 238 CIOs (n=238, Jun 2024); weighted by revenue`

**必含 3 元素**：Where（來源）+ When（時間）+ How（分析方法）

**AI/合成/推估必透明標記**（BeyondPath 三色 badge 對應）：
- `Source: BeyondPath AI-synthesized based on 47 public data points; Apr 2026` 🟡
- `Source: Claude Sonnet 4.6 analysis (low confidence)` 🔴

---

## 二、三家對比（McKinsey vs BCG vs Bain）

### §2.1 視覺 DNA

| 維度 | McKinsey | BCG | Bain |
|------|---------|-----|------|
| **主色** | 深藍/亮藍（50 shades of blue）| 深綠 forest | 紅+黑 |
| **主色語義** | 沉穩、專業、信任 | 成長、分析、策略 | 實戰、熱血、直接 |
| **Heading font** | Bower serif（降階 Georgia）| Sans-serif | Sans-serif |
| **Body font** | McKinsey Sans | Helvetica/Arial | Calibri/Arial |
| **視覺溫度** | 冷、嚴謹、學術 | 中性、結構 | 熱、果斷 |

### §2.2 敘事調性

| 維度 | McKinsey | BCG | Bain |
|------|---------|-----|------|
| **語氣** | 嚴謹理性、學術權威 | 創新前瞻、智力挑戰 | 直接實戰、結果導向 |
| **標題語言** | 「Our analysis indicates...」 | 「A new paradigm emerges...」 | 「The answer is...」 |
| **篇幅** | 最長（MGI 200+ 頁）| 中長（40-80 頁）| 最短（20-40 頁）|

### §2.3 BeyondPath 應向誰學多少？

| 來源 | 要學 | 不學 |
|------|-----|-----|
| **McKinsey** | Pyramid/SCQA、action title、exhibit 規範、source footnote | 冷調藍、200 頁肥厚 |
| **BCG** | 2x2 matrix conceptual chart | 深綠主色（與品牌衝突）|
| **Bain** | 直接給答案開場、action plan、篇幅克制 | 紅+黑配色（太重）|

---

## 三、BeyondPath 學什麼 / 不學什麼

### §3.1 必學清單

✅ **結構**：SCQA 開場 / Pyramid + MECE 3 支柱 / Executive 150-250 字 / Action Title
✅ **Exhibit**：One chart one point / source footnote / highlight 色點主角 / 蓋標題測試
✅ **可信度**：每個量化主張附 source / 三階信心度 🟢🟡🔴 / BeyondPath analysis 二次分析署名
✅ **克制**（向 Bain 學）：關鍵 exhibit 6-10 張即可 / 每張獨立可讀

### §3.2 絕不學

❌ **配色**：McKinsey 冷藍 / BCG 深綠 / Bain 紅黑 都不採用
❌ **過度複雜**：200 頁 full report / 7px 極小字 / 三層巢狀子圖
❌ **過度嚴肅**：純學術腔 / 純英文 jargon / 黑白人物陰影視覺

### §3.3 BeyondPath 獨有差異化（守住不同）

| 面向 | MBB 標準 | BeyondPath 做法 |
|------|---------|----------------|
| **儀式開場** | 冷調封面 + title | 保留 **warm-serif Georgia italic + 琥珀 #D4712A DNA** |
| **字體** | Arial/Helvetica | 主體 sans-serif 但**開場 thesis 可 warm-serif 儀式感** |
| **語氣** | 嚴謹顧問腔 | **蘇菲的「溫暖但精準」**—讓數字說話、讓故事動人 |
| **篇幅** | MGI 80+ 頁 | **Web 單頁 scrollable**（6-10 exhibit 上限）|
| **互動** | 靜態 PDF | 可點擊 chart 展開原始資料 + **可分享 URL**（對應 url-routing-spec.md）|

---

## 四、47 條可驗收硬指標

### §4.1 Executive Summary（7 條）
1. 總字數 **150-250 字**（`wordCount` 檢查）
2. Thesis 首句 **30-50 字**
3. 三支柱 MECE **2-4 個**（標準 3）
4. 每支柱 **30-50 字**
5. 結尾必含具體 recommendation
6. 首句必含數字或百分比
7. 禁開場語（regex block-list：「本報告」「近年來」「AI 蓬勃」）

### §4.2 Section TL;DR（4 條）
8. TL;DR **50-80 字**
9. 位置在 section heading 下第一行
10. 結論句（SVO 完整）+ 量化錨點
11. 視覺 13px italic grey 或 callout box

### §4.3 Action Title（7 條）· **McKinsey 經典**
12. **必是完整結論句**（非名詞短語）
13. **≤ 15 字**（極限 20 字）
14. **≤ 2 行**
15. 主動語態
16. 具體可量化（含數字/%/時間/比較對象）
17. **黃金測試**：蓋 body 光讀 title 結論清楚
18. 「and」拆分原則

**改造對照表**：

| ❌ 平庸 | ✅ McKinsey 級 |
|---|---|
| 亞太 AI SaaS 市場規模 | 亞太 AI SaaS 2026-2028 規模翻 2.5 倍，達 $5.4B |
| 競品功能對比 | BeyondPath 是 5 家中唯一覆蓋「驗證→營收」全鏈 |
| 用戶需求分佈 | 小團隊最痛的是「收錢 + 報價」，不是「找客戶」 |
| 風險分析 | 最大風險是 Honeybook 中文版；反制窗口剩 9 個月 |

### §4.4 Source Footnote（6 條）· **強制每 exhibit**
19. 格式 `Source: [來源], [年份]; [分析方法]`
20. **10-11px 灰**（不低於 10px）
21. 位置 chart body 正下方左對齊
22. 必含 3 元素 Where/When/How
23. AI/推估/合成必標 🟢/🟡/🔴
24. 二次分析加「BeyondPath analysis, YYYY-MM」

### §4.5 Chart Design（9 條）
25. 色彩上限 **2-3 色**（不含灰階 baseline）
26. 單一 highlight 色點主角
27. 其餘系列色灰階
28. 禁陰影
29. 禁漸層（welcome-banner 暖漸層除外，屬儀式）
30. 禁 3D / 旋轉 / 爆炸 pie
31. Y 軸從 0 開始；截斷必加「⇃」斷線
32. Bar 末端標數字 / Line 標端點（不在每點標）
33. ≤ 2 系列用內嵌標註取代 legend box

### §4.6 Layout & Typography（7 條）
34. Exhibit 標題 **17-18px bold**
35. Subtitle **13-14px regular**
36. Body **13-14px / line-height 1.6**
37. Footnote **11px**（非 7-10px，web 閱讀性）
38. Source citation 10-11px grey
39. 段落 **≤ 3 句**，超過拆段
40. Section body 文字 **≤ 200 字**

### §4.7 Narrative（7 條）
41. 全報告 **top-down**（不從背景/方法論開頭）
42. 每 section 用 SCQA 或 S→A
43. MECE 自檢（分類/支柱/分段皆互斥窮盡）
44. 每 section 結尾「So what」一句 takeaway
45. 禁 filler 語（「值得注意的是」「一般而言」「眾所周知」）
46. 數字必溯源
47. **蘇菲聲音層保留**（McKinsey 骨架 + 蘇菲視角用人話說戰略意涵）

---

## 五、Action Title 寫法專章

### §5.1 公式
```
[主體] + [動作動詞] + [量化結果] + [時間/條件]
```

### §5.2 10 條 BeyondPath 實戰改造

| ❌ 平庸 | ✅ McKinsey 級 |
|---|---|
| 1. 市場規模 | 2026 台灣小團隊 AI-SaaS 市場 $220M，3 年翻 2.5 倍 |
| 2. 競品分析 | Honeybook 是唯一有「服務業閉環」對手，但未進中文 |
| 3. 用戶 Persona | 3-10 人服務業老闆是甜蜜帶，5-8 人最痛 |
| 4. 功能覆蓋對比 | BeyondPath 唯一覆蓋 6 模組，對手平均 3 |
| 5. 用戶痛點 | 最痛是「收錢」不是「找客戶」（68% vs 41%）|
| 6. 定價策略 | 月費 TWD 990 是市場中位數 1/3，適合滲透期 |
| 7. 成長預測 | 18 個月可達 ARR $500K，若留存 > 70% |
| 8. 風險評估 | 最大風險是 Honeybook 中文版；窗口剩 9 個月 |
| 9. GTM 策略 | 先打「報價/收款」入口，再往上游拉 |
| 10. 資金需求 | 種子輪 NT$15M 撐 18 個月到下一里程碑 |

### §5.3 黃金測試
1. **蓋 body**：只看 title 30 秒能做決策？
2. **電梯測試**：只讀 title 清單能否形成完整故事？
3. **無 jargon 測試**：念給非同業朋友聽他懂嗎？
4. **可反駁測試**：title 是否有具體可驗證主張？

---

## 六、47 條規範彙整

| 類別 | 條款 # | 核心要求 | 級別 |
|------|-------|---------|------|
| Executive Summary | 1-7 | 字數/thesis/支柱/禁語 | **必採** |
| Section TL;DR | 8-11 | 50-80 字/位置/視覺 | **必採** |
| Action Title | 12-18 | 完整句/≤15 字/黃金測試 | **必採** |
| Source Footnote | 19-24 | 3 元素/信心度 | **必採** |
| Chart Design | 25-33 | 2-3 色/禁陰影漸層 3D | 選採 |
| Layout & Typo | 34-40 | 字階/段落長度 | 選採 |
| Narrative | 41-47 | Top-down/MECE/Takeaway | **必採** |

**必採 21 條全達標 / 選採 26 條 ≥ 60%**

---

## 七、Gate 3 驗收 Checklist

- [ ] Executive Summary 150-250 字，thesis 30-50 字含數字
- [ ] 三支柱 MECE，各 30-50 字
- [ ] 每 exhibit 有 action title（完整結論句）
- [ ] 每 exhibit 有 source footnote（3 元素齊備）
- [ ] 每 exhibit 通過蓋標題測試
- [ ] 資料信心度 🟢/🟡/🔴 明確
- [ ] 色彩 2-3 色 + highlight 主角
- [ ] 段落 ≤ 3 句 / section body ≤ 200 字
- [ ] SCQA top-down（不從背景/方法開場）
- [ ] 每 section 結尾「So what」takeaway
- [ ] 保留 warm-serif 儀式開場 DNA（不套 McKinsey 冷藍）
- [ ] 蘇菲聲音層保留（不學純顧問腔）

**任一未過 → 退回，不進 Gate 1**

---

## 八、與其他 rubric 配合

| 文件 | 關係 |
|------|------|
| `content-rubric-95.md §5 市場報告` | **互補**：本檔「外部標竿」+ §5「內部 Surface/Mid/Deep」兩者都要過 |
| `visual-rubric-95.md` | **互補**：本檔 §4.5-4.6 McKinsey chart/typo 標準 + visual rubric 10 維 BeyondPath 視覺系統；衝突時 visual rubric 優先（品牌 DNA）|
| `tech-rubric-95.md` | **互補**：本檔是產出品質 what，tech 是實作品質 how |

---

## 九、3 條 BeyondPath 必須立即採用的 McKinsey 技法

### 🥇 #1 · Action Title 完整改造
把每張 chart 標題從「亞太市場規模」改成「亞太 AI-SaaS 2026-2028 從 $2.1B 擴張至 $5.4B」。
**一次性即可帶來「嚴肅度躍升」**——投資人一翻頁就懂市場報告認真程度。

### 🥈 #2 · SCQA 開場 + Pyramid Top-Down Executive Summary
強制 150-250 字、thesis 首句 30-50 字含數字、三支柱 MECE。決定打開 3 秒內的可信度。
**既有 `renderFullReport` 若還是「本報告分析了亞太市場」開頭，McKinsey 級一眼看穿是學生作業**。

### 🥉 #3 · 每個 Exhibit 強制 Source Footnote
`Source: [來源], [年份]; BeyondPath analysis, Apr 2026` + 三階信心度 🟢🟡🔴。
**投資人級可信度的最低門檻。沒這條，報告連 MBB 實習生寫的都不如**。

---

## 十、工時雙軌回填

- **預估工時**：2-3 小時（戰略顧問做產業對標）
- **移動城堡**：~12 分鐘（6 個並發 WebSearch/WebFetch + 撰稿）
- **倍率**：~12-15×（Research 類典型區間）

---

*v1.0 · 2026-04-21 · 霍爾 Opus 4.7*
*本檔為 BeyondPath 市場報告向 McKinsey 級對標的產品級憲法，與 `content-rubric-95.md` 並列為市場報告 95 分驗收雙軌*
