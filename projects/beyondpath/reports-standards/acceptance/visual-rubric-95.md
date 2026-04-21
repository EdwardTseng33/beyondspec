# BeyondPath 5 份報告 · 視覺 Rubric 95 分驗收標準

> **作者**：荒野女巫（Creative Director · Opus 4.7）
> **建立**：2026-04-21
> **基於**：`research/report-upgrade-visual.md` 診斷 + Chrome MCP 實測 Maze/Dovetail/Productboard
> **用途**：5 份報告（PATH 診斷 / Lab 分析 / 市場探測 / 市場報告 / AI 問卷）視覺交付的**客觀 95 分閘門**
> **規則**：10 維 × 5 報告 = 50 格，每格明確可驗收、可 grep、可量化。憲法遵循維度採二元制（10 或 0）
> **使用方式**：每份報告交付前，女巫用本表逐格自評；任一格 < 9.5 則退回修改；憲法違憲（#8 = 0）則直接 block

---

## 第零章 · Rubric 核心公理

### 0.1 95 分的數學定義
```
總分 = Σ (維度 i 分數 × 權重 i)
維度 1-7, 9, 10：目標 ≥ 9.5 / 10
維度 8（憲法）：binary — 違憲 = 0（總體作廢），不違憲 = 10
```

| 維度 # | 名稱 | 權重 | 及格線 | 95 分 | 10 分 |
|:---:|:---|:---:|:---:|:---:|:---:|
| 1 | 視覺層次 Hierarchy | 12% | 8.5 | 9.5 | 10 |
| 2 | 字體節奏 Typography | 11% | 8.5 | 9.5 | 10 |
| 3 | 色彩語義 Color Semantics | 10% | 8.5 | 9.5 | 10 |
| 4 | 空間密度 Density | 10% | 8.5 | 9.5 | 10 |
| 5 | 資訊載荷 Info Load | 10% | 8.5 | 9.5 | 10 |
| 6 | 視覺錨點 Focal Anchor | 10% | 8.5 | 9.5 | 10 |
| 7 | 情感溫度 Emotional Tone | 10% | 8.5 | 9.5 | 10 |
| 8 | 憲法遵循 Compliance | — | 10 | 10 | 10 |
| 9 | 一致性 Consistency | 12% | 8.5 | 9.5 | 10 |
| 10 | 品牌辨識 Brand Recognition | 15% | 8.5 | 9.5 | 10 |

**95 分公式**：9 維 × 9.5 + 憲法 × 10 = **95.0**，通過。**任一維度 < 9.5 → 不通過**。

### 0.2 可驗收三層定義
- **Quantifiable（量化）**：px、ratio、token 使用比例，Chrome DevTools / grep 可驗
- **Observable（可觀察）**：截圖對比 Maze/Dovetail/Productboard 樣本，雙盲對比
- **Empirical（實證）**：用戶情緒曲線無 blocker（蕪菁頭 P1-P5 測）

---

## 第一章 · Warm-serif vs Sans-serif 分界條款（憲法級）

### 1.1 分界決策樹
```
這個區塊是儀式型 or 工具型？
├─ 儀式型（情感、開場、慶祝、總結、歡迎）
│   └─ 允許 warm-serif + 琥珀
│       · 字體：Georgia, 'Times New Roman', serif（italic）
│       · 色彩：#3D2E1A title + #D4712A sub + 背景可 warm gradient
│       · 字級：26px-48px（report hero 可拉 48px/700 italic）
│
└─ 工具型（數據、表格、操作、清單、診斷）
    └─ 強制封閉五色 + sans-serif
        · 字體：Inter, 'Noto Sans TC', sans-serif
        · 色彩：#7C5CFC / #1BA891 / #E08A3A / #D94462 / #94A3B8
        · 字級：依 typography scale（22/17/15/14/13/12/11px）
```

### 1.2 5 報告 × 區塊分類表

| 報告 | 區塊 | 分類 | 字體 | 色系 |
|:---|:---|:---:|:---:|:---:|
| **PATH 診斷** | Hero verdict | 儀式 | warm-serif OK | 琥珀 or 封閉五色 |
| | 分數環 + 三維度 | 工具 | sans-serif | 封閉五色 |
| | Next Action card | 工具 | sans-serif | 封閉五色 |
| **Lab 分析** | Hero insight | 儀式 | warm-serif OK | 琥珀 or 封閉五色 |
| | AI 合成 persona 卡片 | 工具 | sans-serif | 封閉五色 |
| | Quote 區塊 | **半儀式** | serif 非 italic OK | 中性 + slate |
| | CAVEAT 警告條 | 工具 | sans-serif | rose |
| **市場探測** | Hero verdict | 儀式 | warm-serif OK | 琥珀 or 封閉五色 |
| | 訊號儀表板 | 工具 | sans-serif | 封閉五色 |
| | 競品表格 | 工具 | sans-serif | 封閉五色 |
| **市場報告** | Executive hero | 儀式 | warm-serif OK | 琥珀 or 封閉五色 |
| | 市場規模 KPI | 工具 | sans-serif | 封閉五色 |
| | 競爭地圖 / 機會矩陣 | 工具 | sans-serif | 封閉五色 |
| | 結語 + next action | 儀式→工具 | 上 serif 下 sans | 封閉五色 |
| **AI 問卷** | 封面 thank-you | 儀式 | warm-serif OK | 琥珀 |
| | 題目結果條圖 | 工具 | sans-serif | 封閉五色 |
| | 洞察總結 | 儀式 | warm-serif OK | 琥珀 or 封閉五色 |

**口訣**：「讀者要被感動 → warm-serif；讀者要做決策 → sans-serif」

### 1.3 違憲 grep 規則
```bash
# 工具區塊用 Georgia
grep -E "\.md-card|\.rm-metric|\.pv-score|\.report-kpi.*font-family.*Georgia" app.html
# 儀式區塊強塞封閉五色
grep -A 3 "\.welcome-banner\{" app.html | grep -v "#3D2E1A\|#D4712A\|warm\|gradient"
# report hero 用 sans-serif 22px
grep -E "\.report-hero.*font-size:22px" app.html
```

---

## 第二章 · 三層體驗在視覺層的具體體現

### 2.1 三層體現對照表

| 層次 | 視覺表現要素 | 反面教材 |
|:---|:---|:---|
| **信任 Trust** | · 資料源 badge（🟢實測/🟡推估/🔴AI生成）11px slate 不搶戲<br>· AI 合成 persona 卡右上角「🤖 AI 合成」11px badge<br>· 數字必附信心度（3 色點 + 文字）<br>· 每個推論「為什麼」tooltip<br>· 色 + 文字雙編碼（色盲友善） | · 裸數字無來源<br>· AI 推估假扮實測<br>· 單一健康度分數安慰劑 |
| **包覆 Enveloping** | · Hero padding ≥ 72px<br>· 空狀態人性化插畫 + 微文案<br>· 連續性敘事（「上次你在這裡看到 X，今天 Y」）<br>· 無爆炸式紅底 error<br>· 進場 stagger 40ms × 8 items | · 密集表格無呼吸<br>· No data 冷敘述<br>· 全屏紅底 error |
| **情緒價值感 Emotional Value** | · Hero verdict 讓用戶「看到自己的路徑」<br>· 里程碑 warm-serif + 琥珀<br>· AI 發現 primary gradient badge<br>· Next Action 排序編號 1./2./3.<br>· 尾部分享/儲存/下載三件套 | · 冷數據展示<br>· 分享只有社群開關<br>· 努力後無回報儀式 |

### 2.2 CSS 量化指標

| 指標 | Trust | Enveloping | Emotional |
|:---|:---:|:---:|:---:|
| 資料源 badge 覆蓋率 | ≥ 95% | — | — |
| Hero padding-y | — | ≥ 72px | — |
| 空狀態含插畫 + 微文案 | — | 100% | — |
| 儀式區塊 warm-serif 正確套用 | — | — | 100% |
| Next-action 含排序編號 | — | — | 100% |
| 報告尾部含分享 CTA | — | — | 100% |

---

## 第三章 · 封閉五色違憲判定標準

### 3.1 封閉五色（絕對集合）
| # | 名稱 | Hex | HSL | 使用語義 |
|:---:|:---|:---|:---|:---|
| 1 | Primary | `#7C5CFC` | 252°, 97%, 68% | 品牌 / idle / 中性動作 |
| 2 | Teal | `#1BA891` | 170°, 72%, 38% | healthy / 成功 / 高信心 |
| 3 | Gold | `#E08A3A` | 28°, 74%, 55% | warn / 稍落後 / 中信心 |
| 4 | Rose | `#D94462` | 349°, 66%, 56% | danger / 逾期 / 低信心 |
| 5 | Slate | `#94A3B8` | 214°, 20%, 65% | 中性元資料 / disabled |

**允許延伸**：中性灰階、五色 `color-mix` 產生的 bg。
**儀式特例**：`#3D2E1A` 深琥珀 + `#D4712A` 橘金（warm-serif DNA），僅限 `.welcome-banner` 及報告 hero。

### 3.2 違憲色 ΔE 判定
```
ΔE(new_hex, 封閉五色最近) ≥ 5.0
AND new_hex ∉ {中性灰階 + 琥珀 DNA 例外}
→ 違憲
```

**常見違規快表**：

| 觀察色 | 最近憲法色 | ΔE | 判定 | 處理 |
|:---|:---:|:---:|:---:|:---|
| `#3B82F6` Tailwind blue | primary | ~18 | 違憲 | 改 primary |
| `#10B981` Tailwind emerald | teal | ~12 | 違憲 | 改 teal |
| `#8B5CF6` Tailwind violet | primary | ~4.8 | **邊緣** | 改 primary |
| `#9F7BFC` Lab 舊紫 | primary | ~6 | 違憲 | 改 primary |
| `#F59E0B` amber | gold | ~12 | 違憲 | 改 gold |
| `#EF4444` red-500 | rose | ~9 | 違憲 | 改 rose |

### 3.3 Grep pipeline
```bash
grep -oE '#[0-9A-Fa-f]{6}' app.html | sort -u | \
  grep -viE '^(#7C5CFC|#6A4BE8|#5B3FC9|#1BA891|#E08A3A|#D94462|#94A3B8|#3D2E1A|#D4712A|#F5F5F8|#FFF|#111122|#44445E|#66667A|#9999AA|#E2E2EA|#CCCCD6|#F0F0F5|#B8B8CC)$'
```

---

## 第四章 · 10 維度 × 5 報告 = 50 格評分表

### 維度 1：視覺層次 Hierarchy（12%）

| 分 | 定義 |
|:---:|:---|
| 9 | 視線 5 秒內找到 Hero verdict；次要層級清楚但錨點感弱 |
| 9.5 | 視線 **3 秒內**找到 Hero；H1/H2/H3 字級比 ≥ 1.4；三級以上有斷點 |
| 10 | 視線 **2 秒內**找到 Hero；Hero 占屏比 ≥ 35%；KPI row 獨立（對標 Dovetail ROI） |

| 報告 | 9.5 分 criteria |
|:---|:---|
| **PATH 診斷** | Hero verdict 最前置 `--text-display-md 36px`+；三維度分數環獨立 section，padding-top ≥ `--space-8`；Next Action 1./2./3. 排序 |
| **Lab 分析** | Hero insight warm-serif 36-48px italic；AI badge 右上角 z-index 最高；Quote drop-cap 42px |
| **市場探測** | Hero verdict + 三關鍵訊號前置；儀表板 col 寬 33% 均分；section 間距 `--space-9 96px` |
| **市場報告** | Executive hero 3-KPI（對標 Dovetail 2.3x/30hrs/66%）；TOC 左側 sticky；section 編號 `01/02/03` |
| **AI 問卷** | 封面 thank-you warm-serif hero；題目按重要度排，前 3 獨立；洞察 primary-bg callout 17px/600 |

### 維度 2：字體節奏 Typography（11%）

| 分 | 定義 |
|:---:|:---|
| 9 | 字級 scale 取值 ≥ 90%；line-height CJK ≥ 1.6；無 body text < 13px |
| 9.5 | scale 取值 ≥ 95%；無 14.5/21 奇值；CJK ≥ 1.7；數字 `tabular-nums` |
| 10 | scale 100%；CJK 1.7-1.8；hero 用 display 字階；uppercase meta letter-spacing ≥ 0.6px（對標 Dovetail） |

| 報告 | 9.5 分 criteria |
|:---|:---|
| **PATH 診斷** | Hero `--text-display-md 36px/700`；P/A/T/H 數字 tabular-nums；section title `17px/700 letter-spacing -0.2px` |
| **Lab 分析** | Hero Georgia italic 36-48px/700；Persona 名 15px/700 + tag 11px/600 uppercase；Quote 17px/450 line-height 1.75 |
| **市場探測** | 三訊號 KPI `display-md 36px/700`；label uppercase 11px/600 letter-spacing 0.8；資料源 badge 11px mono |
| **市場報告** | Executive KPI `display-lg 48px/700`；section 編號 Georgia italic 11px + label uppercase；正文 14px/450 CJK 1.7 |
| **AI 問卷** | 封面 48px Georgia italic；題目結果 22px/700 tabular-nums；洞察 callout 17px/600 |

**違憲 grep**：
```bash
grep -oE 'font-size:[0-9]+px' app.html | sort -u | grep -vE '(11|12|13|14|15|17|22|26|28|36|48|72)px'
grep -B 2 "font-size:36px\|font-size:48px" app.html | grep -v "tabular-nums"
```

### 維度 3：色彩語義 Color Semantics（10%）

| 分 | 定義 |
|:---:|:---|
| 9 | 封閉五色 + 中性灰；狀態色雙編碼；AA ≥ 4.5:1 |
| 9.5 | 每色一語義不混用；中等 pastel ≥ 14%；AA+ ≥ 5:1 |
| 10 | 每色語義 + hover/active 態；色盲模擬可區分；AAA ≥ 7:1 |

| 報告 | 9.5 分 criteria |
|:---|:---|
| **PATH** | 分數環 healthy teal / warn gold / danger rose；三色只用分數語義；Next Action primary；Risk rose 14% bg |
| **Lab** | AI badge primary gradient（唯一例外）；Persona 分類 slate 中性 tag；CAVEAT rose 14% bg + rose border-left（警告唯一允許 stripe） |
| **市場探測** | 儀表板三色：hot teal / neutral slate / cold rose；競品表格黑字 + primary highlight；資料源 badge dot |
| **市場報告** | 市場規模 primary；競爭地圖軸用 slate，我方點 primary；成長 arrow 正 teal / 負 rose / 平 slate |
| **AI 問卷** | 題目條圖 primary；正 teal / 負 rose；洞察 callout primary 14% bg |

### 維度 4：空間密度 Density（10%）

| 分 | 定義 |
|:---:|:---|
| 9 | scale ≥ 90%；無擁擠；section 間距 ≥ 48px |
| 9.5 | scale ≥ 95%；section `--space-8/9 72-96px`；card padding ≥ 24px |
| 10 | scale 100%；Hero padding ≥ 72px；editorial 節奏（Maze hero 留白 20%+） |

| 報告 | 9.5 分 criteria |
|:---|:---|
| **PATH** | Hero padding `--space-8 72px`+；三分數環 gap `--space-5 24px`；Action padding 24px；總寬 max 1024px |
| **Lab** | Hero padding `--space-9 96px`；Persona padding `--space-6 36px`；Quote 獨立 72px 前後 |
| **市場探測** | 儀表板三欄 gap 24px；競品表格 row padding-y 12px line-height 1.6；section 96px |
| **市場報告** | Executive hero padding `--space-10 128px`；KPI row gap 72px 橫向 80+；TOC 左 240px content max 720px |
| **AI 問卷** | 封面 128px；題目卡片 padding 24px gap 16px；洞察 callout margin-y 72px |

### 維度 5：資訊載荷 Info Load（10%）

| 分 | 定義 |
|:---:|:---|
| 9 | 每 section 1 核心訊息；無 10+ 欄表格；適當分頁 |
| 9.5 | Section 主題 + 3 以內證據；表格 ≤ 6 欄；長段有 side note |
| 10 | Editorial 章節節奏（對標 Dovetail themes table） |

| 報告 | 9.5 分 criteria |
|:---|:---|
| **PATH** | Hero = verdict + 3 數字；三維度各 1 句 ≤ 30 字；Next Action 限 3 項 |
| **Lab** | Hero insight ≤ 40 字；Persona 5 欄；Quote 區一次 ≤ 3 則 |
| **市場探測** | 儀表板三訊號 + 三句；競品 ≤ 6 欄；次要折疊 |
| **市場報告** | Executive 3-KPI + verdict；規模 section 只 TAM/SAM/SOM；每 section TL;DR 60-80 字 |
| **AI 問卷** | 封面一句致謝；前 3 題獨立後續 accordion；洞察 ≤ 5 條 |

### 維度 6：視覺錨點 Focal Anchor（10%）

| 分 | 定義 |
|:---:|:---|
| 9 | 每屏 1 錨點 |
| 9.5 | Hero 明確錨點；後續每屏 1 錨；主色 + 字級 |
| 10 | 錨點有互動暗示（對標 Dovetail `↑ 2.3x` icon+數字） |

| 報告 | 9.5 分 criteria |
|:---|:---|
| **PATH** | Hero verdict primary underline；分數環中心大數字；Next Action 第一項 primary 填充 |
| **Lab** | Hero insight italic + 底 2px primary；AI badge 右上 absolute gradient；Quote drop-cap |
| **市場探測** | 「市場溫度」主錨（色強 + 大圖標）；競品表首列 primary bg 14%；我方 ratio 72px |
| **市場報告** | Executive「市場規模」字級 48-72px；機會矩陣我方點 1.5x；結語 CTA 單屏唯一 primary button |
| **AI 問卷** | 封面 hero；結果最高% primary 填充其餘 slate；洞察 callout primary 14% + icon |

### 維度 7：情感溫度 Emotional Tone（10%）

| 分 | 定義 |
|:---:|:---|
| 9 | Hero/尾部有 warm；微文案有溫度 |
| 9.5 | Hero warm-serif 儀式 + 溫度微文案 + 尾部 emotional closing |
| 10 | 三層體驗全達 + 至少 1 delightful moment（完成動畫、彩蛋） |

| 報告 | 9.5 分 criteria |
|:---|:---|
| **PATH** | 「你這個方向 X」而非第三人稱；空狀態「再答 3 題？」；尾部「省下 3 週試錯，記得分享給合夥人」 |
| **Lab** | 「5 位 AI 合成告訴你真正痛點」；CAVEAT 溫和；「下次 Lab 會記得這次洞察」 |
| **市場探測** | 「市場在說什麼」而非 Market Signal Report；badge 有「XX 爬到的」微 icon；CTA「深入這個市場？」 |
| **市場報告** | Hero editorial opener；section TL;DR 一句；warm-serif 「你的 next move」+ 3 action |
| **AI 問卷** | 「謝謝 127 位用戶」；過場句「還有幾個洞察...」；「把回饋分享給團隊」 |

### 維度 8：憲法遵循 Compliance（binary，違憲則整份作廢）

| 分 | 定義 |
|:---:|:---|
| **0（違憲）** | 任一違規 → 整份作廢 |
| **10（合憲）** | 全部通過 |

**8.1-8.10 合憲項**：
1. 封閉五色（無外來色）
2. PATH Header Spec（`.page-title-area` 合規 / `.report-hero` 另起）
3. 無 border-left/top stripe（CAVEAT 3px rose 例外）
4. 無 emoji 當 icon（資料源 🟢🟡🔴 badge 例外）
5. 無 Math.random / hardcode 色 / inline style > 3 屬性
6. 字體 scale 100%（無 14.5/21/23 奇值）
7. 間距 scale 100%（無 14/22/30 奇值）
8. 不使用 linear easing（必 cubic-bezier）
9. 無動畫 > 500ms（slow 400ms 頁級允許）
10. 資料源標註覆蓋率 = 100%

**Grep pipeline**：
```bash
# 8.3 stripe
grep -E 'border-(top|left):[^;]*(solid|#)[^;]*' app.html | grep -v "var(--border)"
# 8.4 emoji icon（排除 badge）
grep -E '(🚀|✨|🎉|💡|🔥|📊|📈|📉)' app.html
# 8.6 字級
grep -oE 'font-size:[0-9]+px' app.html | sort -u | grep -vE '(11|12|13|14|15|17|22|26|28|36|48|72)px'
# 8.8 linear
grep -E 'transition:[^;]*linear' app.html
```

### 維度 9：一致性 Consistency（12%）

| 分 | 定義 |
|:---:|:---|
| 9 | 5 報告用共同 `.report-*` namespace ≥ 80% |
| 9.5 | 共同 namespace ≥ 95%；所有 Hero 結構一致；所有 CTA 樣式一致 |
| 10 | namespace 100%；5 報告並排無違和；換新 report 只改內容不改 CSS |

| 跨報告 | 9.5 分要求 |
|:---|:---|
| Hero 結構 | verdict + 3 KPI + badge + 分享按鈕 |
| CTA 按鈕 | `.btn-accent` 統一（padding/radius/shadow） |
| 資料源 badge | `.report-source-badge` 11px mono + dot |
| Section 編號 | `01/02/03` uppercase italic meta |
| 尾部 CTA trio | 分享/儲存/下載 位置一致 |
| Dark mode | 5 報告都有 `[data-theme="dark"]` 覆蓋 |

**Grep**：
```bash
grep -E '\.(md-hero|rm-hero|pv-hero|mr-hero|sv-hero)\{' app.html  # 應統一 .report-hero
```

### 維度 10：品牌辨識 Brand Recognition（15%）

| 分 | 定義 |
|:---:|:---|
| 9 | 去 logo 看得出 BeyondPath 元素 ≥ 3 處 |
| 9.5 | ≥ 5 處品牌印記（warm-serif + 封閉五色 + `.page-title-area` + primary gradient AI badge + 資料源 dot） |
| 10 | 截圖丟社群，熟悉用戶 3 秒認出 BeyondPath（對標 Dovetail dark-grid / Maze ivory-serif） |

| 報告 | 9.5 分 5 處印記 |
|:---|:---|
| **PATH** | Warm-serif hero / primary 分數環 / AI gradient badge / Action 編號 / 資料源 dot |
| **Lab** | Warm-serif insight / 右上 gradient AI badge / Quote drop-cap / CAVEAT rose 條 / 資料源 dot |
| **市場探測** | 三訊號獨有布局 / 資料源 dot 系統 / 「我方定位」primary highlight / warm-serif hero / 競品表 |
| **市場報告** | Executive 3-KPI 對標 Dovetail / `01/02/03` italic meta / TOC sticky / warm-serif hero / McKinsey 級 thesis |
| **AI 問卷** | Warm-serif 封面 / primary 填充題目條圖 / 洞察 primary 14% bg callout / AI gradient badge / 過場溫度句 |

---

## 第五章 · Top-Player Benchmark（Chrome MCP 實測）

### 5.1 Maze.co 對標

| 維度 | Maze | 對標點 |
|:---:|:---:|:---|
| 視覺層次 | 10 | Hero 字 72-96px 占屏 40%；Report Preview 卡片 z-index 階梯 |
| 字體節奏 | 10 | Söhne / GT America 粗黑；uppercase meta letter-spacing |
| 色彩語義 | 9.5 | 米底 #F5F2E8 + 藍綠 accent + 黑字 |
| 空間密度 | 10 | Hero 左右留白 20%+；section 垂直 128-160px |
| 資訊載荷 | 10 | 每屏 1 主訊息 + 1-3 visual |
| 情感溫度 | 9.5 | 米底 + 人像 + warm 口吻 |
| 品牌辨識 | 10 | 三秒辨識（米底 + 粗黑 sans + 藍綠） |

### 5.2 Dovetail.com 對標

| 維度 | Dovetail | 對標點 |
|:---:|:---:|:---|
| 視覺層次 | 10 | Dark grid + white hero 72-96px |
| 字體節奏 | 10 | 粗黑 + uppercase letter-spacing 0.6-1px |
| 色彩語義 | 10 | 黑 + 白 + 藍 + theme colored bar |
| 空間密度 | 10 | ROI 3-KPI 橫向 gap 80-100px；表格 line-height ≥ 1.6 |
| 資訊載荷 | 10 | `[01] CENTRALIZE` section meta；ROI 3-KPI；theme table 6 欄 |
| 視覺錨點 | 10 | `↑ 2.3x` icon + 巨數字 + label 教科書級 |
| 品牌辨識 | 10 | Dark grid + syncing 動畫 + colored bar = Dovetail DNA |

### 5.3 Productboard 對標

| 維度 | Productboard | 對標點 |
|:---:|:---:|:---|
| 視覺層次 | 9.5 | Hero 居中 + 下方 3 表格疊合 preview |
| 色彩語義 | 9.5 | 藍 primary + 綠 trend + 黑白表格 |
| 視覺錨點 | 9.5 | 綠色 +78% 右側整齊對齊 |

### 5.4 BeyondPath 超越點

| 維度 | Maze | Dovetail | Productboard | **BeyondPath target** |
|:---:|:---:|:---:|:---:|:---:|
| 情感溫度 | 9.5 | 9 | 8 | **9.5+（差異化優勢）** |
| 其他維度 | 10 | 10 | 9-9.5 | **9.5 對齊** |

**BeyondPath 差異化**：warm-serif + 琥珀 + 三層體驗 = Maze/Dovetail/Productboard 都沒做到，可拿 10 分。

**對齊點**：
- Dovetail ROI hero → 市場報告 Executive hero
- Dovetail `[01] CENTRALIZE` → 市場報告 section 編號
- Maze hero 留白 + 粗黑字 → 所有 hero padding `--space-10 128px`
- Productboard 表格 +trend% → 競品表格 / 訊號儀表板

---

## 第六章 · 驗收 pipeline

### 6.1 自動檢查（CI）
```bash
#!/bin/bash
echo "===== 1/6 封閉五色違憲 ====="
grep -oE '#[0-9A-Fa-f]{6}' app.html | sort -u | \
  grep -viE '^(#7C5CFC|#6A4BE8|#5B3FC9|#1BA891|#E08A3A|#D94462|#94A3B8|#3D2E1A|#D4712A|#F5F5F8|#FFF|#111122|#44445E|#66667A|#9999AA|#E2E2EA|#CCCCD6|#F0F0F5|#B8B8CC)$'

echo "===== 2/6 非 scale 字級 ====="
grep -oE 'font-size:[0-9]+px' app.html | sort -u | grep -vE '(10|11|12|13|14|15|17|22|26|28|36|48|72|96)px'

echo "===== 3/6 非 scale 間距 ====="
grep -oE '(padding|margin|gap|top|bottom|left|right):[^;]*[0-9]+px' app.html | \
  grep -oE '[0-9]+px' | sort -u | grep -vE '^(0|1|2|4|6|8|10|12|16|20|24|32|36|48|64|72|96|128|160|180|240|320|420|520|540|720|900|1024)px'

echo "===== 4/6 stripe ====="
grep -E 'border-(top|left):[^;]*#' app.html | grep -v "var(--border)" | grep -v "CAVEAT\|rose"

echo "===== 5/6 linear easing ====="
grep -E 'transition:[^;]*linear' app.html

echo "===== 6/6 emoji icon ====="
grep -E '(🚀|✨|🎉|💡|🔥|📊|📈|📉|⚡|💪|🏆)' app.html
```

### 6.2 手動視覺審查
1. 每份報告截圖 3 份：desktop 1280 / tablet 768 / mobile 375
2. Dark mode 3 份（共 6 × 5 = 30 張）
3. 10 維 × 5 報告 = 50 格逐格打分
4. < 9.5 → 列出 criteria 與改法 → 退回
5. 全部 ≥ 9.5 + 憲法 = 10 → 簽字放行

### 6.3 跨報告一致性（女巫 + 霍爾）
1. 5 報告 hero 並排 5 欄
2. 5 報告 KPI row 並排
3. 5 報告 CTA 按鈕並排
4. 問「遮 logo，這 5 份是同一產品嗎？」—— 是 → PASS / 不像 → 列 3 點退回

### 6.4 Persona 情緒曲線（蕪菁頭）
P1-P5 跑完 5 報告動線，記錄：打開感受 / Hero 3 秒理解 / KPI 信心 / Next Action 驅動力 / 關閉情緒。任一 blocker → 退回。

---

## 第七章 · 憲法強化條款（2026-04-21 新增）

### 7.1 儀式→工具過渡
**禁**：hero warm-serif 琥珀 + 下方 KPI 冷紫 primary sans-serif 14% bg 相鄰（會撞色斷裂）。
**正**：
- Hero 底部留 ≥ 72px 間距
- Hero 底部加 1 條 `--space-1` slate 細線過渡
- 或加 `<div class="report-hero-break">` 緩衝帶（padding 24px bg `--bg-app`）

### 7.2 資料源 badge 不得搶戲
- 字級 ≤ 11px，mono font
- dot 直徑 ≤ 6px
- **不放** 主 KPI 數字旁邊
- **放** 數字下方新行，間距 `--space-1 4px`

### 7.3 AI 合成硬性警告條（Lab 專用）
```html
<div class="report-warning-ai-synth">
  <svg><!-- 16×16 rose line icon --></svg>
  <span>本報告基於 AI 合成用戶模擬，非真實用戶訪談。建議搭配 3+ 位真實用戶驗證。</span>
</div>
```
樣式：rose-bg 14% / rose color / border-left 3px rose（**Lab 唯一允許 stripe**）/ padding space-3 space-4 / 13px/600

### 7.4 儀式 hero 字級上限
warm-serif hero ≤ **72px**（`--text-display-xl`）。超過失去報告嚴肅性。

---

## 第八章 · Handoff 給卡西法

### 8.1 `.report-*` namespace 必做清單
```css
.report { }
.report-hero { }
.report-hero--ritual { /* warm-serif 變體 */ }
.report-hero--tool { /* sans-serif 變體 */ }
.report-verdict { }
.report-tldr { }
.report-kpi-row { }
.report-kpi { }
.report-kpi-value { }
.report-kpi-label { }
.report-kpi-trend { }
.report-section { }
.report-section-num { /* 01/02/03 */ }
.report-source-badge { }
.report-source-badge--measured { /* teal dot */ }
.report-source-badge--estimated { /* gold dot */ }
.report-source-badge--ai { /* rose dot */ }
.report-warning-ai-synth { /* Lab 警告條 */ }
.report-quote { }
.report-quote-dropcap { }
.report-persona-card { }
.report-persona-ai-badge { }
.report-cta-trio { }
.report-hero-break { }
```

### 8.2 新增 CSS token
```css
:root {
  --amber-ink: #3D2E1A;
  --amber-accent: #D4712A;
  --amber-bg: rgba(212, 113, 42, .08);
  --source-measured: var(--teal);
  --source-estimated: var(--gold);
  --source-ai: var(--rose);
  --text-section-meta: 11px;
}
```

### 8.3 HTML 骨架
```html
<article class="report">
  <header class="report-hero report-hero--ritual">
    <p class="report-section-meta">01 / PATH 診斷</p>
    <h1 class="report-verdict">你這個方向，訊號夠強值得投入</h1>
    <p class="report-tldr">綜合 P/A/T/H 四維...</p>
    <div class="report-hero-break"></div>
    <div class="report-kpi-row">
      <div class="report-kpi">
        <svg class="report-kpi-icon"><!-- trend up --></svg>
        <div class="report-kpi-value">82</div>
        <div class="report-kpi-label">PATH 總分</div>
        <div class="report-kpi-trend">+3 vs 上次</div>
        <div class="report-source-badge report-source-badge--measured">
          <span class="dot"></span>實測
        </div>
      </div>
    </div>
  </header>
  <section class="report-section">...</section>
  <footer class="report-cta-trio">
    <button>分享</button>
    <button>儲存</button>
    <button>下載 PDF</button>
  </footer>
</article>
```

---

## 第九章 · 放行條件

### 9.1 一份報告 95 分 = 三綠燈
1. **綠燈 1**：自動 grep pipeline 6 段皆空
2. **綠燈 2**：10 維手動 ≥ 9.5
3. **綠燈 3**：跨報告一致性 + persona 無 blocker

### 9.2 修正迴圈上限
- 同一報告 retry ≤ 3 次
- 第 3 次不過 → 升級蘇菲做 root cause（結構重做）

---

## 第十章 · 女巫發現 Edward 清單漏點（2 項）

**漏點 1：儀式→工具過渡斷裂風險**
Edward 講「warm-serif 限儀式 / 封閉五色 + sans-serif 守工具頁」但沒講過渡帶。憲法 7.1 補上：Hero 底 72px 緩衝 + 1px slate 細線。避免 v1.0.8 類型撞色事故。

**漏點 2：資料源 badge 戲份重量**
Edward 講「真實數據優先、AI 推估標示」但沒講 **badge 不能搶 KPI 戲**。7.2 規範：≤ 11px mono，dot ≤ 6px，放數字下方新行。避免「信任證據壓過主訊息」。

---

*— 荒野女巫，2026-04-21 · Opus 4.7*
*BeyondPath 5 份報告視覺驗收憲法級文件 · 每季 review*
