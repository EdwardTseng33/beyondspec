# 報告升級 · 視覺評估（女巫）

> **評估對象**：市場探測報告 / Lab 研究報告 / PATH 診斷報告
> **評估日期**：2026-04-21
> **評估者**：🔮 荒野女巫（Creative Director · Opus 4.7）
> **方法**：Opus 4.7 實讀 CSS + 既有截圖 + 10 維 rubric

---

## 一、三份報告評分（10 維 rubric · 100 分制）

| 維度 | 市場探測 | Lab 研究 | PATH 診斷 |
|------|---------|---------|----------|
| 視覺層級 | 12/15 | 10/15 | 13/15 |
| 字體節奏 | 8/10 | 7/10 | 9/10 |
| 色彩語義 | 6/10 | 5/10 | 9/10 |
| 空間密度 | 7/10 | 8/10 | 9/10 |
| 資訊載荷 | 5/10 | 6/10 | 8/10 |
| 視覺錨點 | 5/10 | 6/10 | 9/10 |
| 情感溫度 | 6/10 | 7/10 | 8/10 |
| 憲法遵循 | 5/10 | 4/10 | 9/10 |
| 一致性 | 2/10 | 3/10 | 5/10 |
| 品牌辨識 | 2/5 | 2/5 | 4/5 |
| **總分** | **58/100** | **62/100** | **83/100** |

> **關鍵發現**：三份報告視覺基因各自獨立，**缺乏統一 `.report-*` class 系統**，這是所有其他問題的根源。PATH 診斷最接近憲法，問卷結果頁 v1.3.15 重修後已拉到 82，市場探測 v1.3.16 重修到 82；**Lab 報告是下一個主戰場**。

---

## 二、P0 必做（3 件）

### P0-1 · 統一 `.report-*` class 系統

**現況**：三份報告各寫各的 CSS，class 名稱全無系統（`.md-card` / `.rm-hero` / `.pv-score-ring` 各自為政）。

**提案**：建立 `.report` namespace：
```css
.report { /* base container */ }
.report-hero { /* one-line verdict 區 */ }
.report-tldr { /* 60-80 字摘要 */ }
.report-section { /* section 容器 · var(--space-9) 間距 */ }
.report-metric { /* KPI 顯示元件 */ }
.report-data-source { /* 資料源 tag */ }
.report-cta { /* 下一步行動 */ }
```
**成本**：4 小時 CSS + 既有三份報告 retrofit 各 1 小時 = 7 小時

---

### P0-2 · Executive Hero + Verdict 前置

**現況**：讀者打開三份報告第一屏**看不到結論**。市場探測要往下滑才見 verdict；Lab 要展開才見 insight；PATH 已有（最接近標竿）。

**提案**：所有報告第一屏強制 Hero：
- **一句話 verdict**（ex: 「市場有訊號但未達投入門檻」/「你的定位在目標客群心中模糊」）
- **三個最關鍵數字**（不是全部 KPI，只挑最能支撐 verdict 的 3 個）
- **數據信心度 badge**（高/中/低三級）

**成本**：CSS 2 小時 + 各報告整合 6 小時 = 8 小時

---

### P0-3 · 移除 Lab 紫色違憲 + AI 模擬標記

**現況**：Lab report 用 `#9F7BFC` 紫色系（非憲法五色之一的紫）+ 合成 persona 未清楚標註「非真實用戶」。

**提案**：
1. Lab palette 回歸封閉五色（primary #7C5CFC 為主，其他 accent 用 teal / gold / rose / slate）
2. **AI 合成標記系統**：每個合成 persona 卡片右上角 badge「🤖 AI 合成」(11px slate)，每份 Lab 報告最上方紅線 `border-top: 3px solid var(--rose-14)` 警告條「本報告由 AI 合成用戶產生，非真實用戶訪談」
3. Lab CAVEAT 霍爾 D.2 三段結構已上（v1.3.13），視覺打磨：提升對比、加 icon、分三塊 card 排列

**成本**：CSS 重修 3 小時 + AI badge 元件 1 小時 + CAVEAT 重排 2 小時 = 6 小時

---

## 三、P1 值得做（3 件）

### P1-1 · Display 字階升級（延續 v1.3.13）

**現況**：v1.3.13 已加 `--text-display-xl: 72px` 等 token，但**三份報告尚未採用**。

**提案**：所有 report hero H1 升級到 `var(--text-display-md)` (36px) 以上，建立「儀式感頁面」的視覺識別。

**成本**：3 小時

---

### P1-2 · 資料源透明化（audit tag 系統）

**現況**：用戶分不清「哪個數字是 AI 生成、哪個是真實資料、哪個是演算法計算」。

**提案**：每個關鍵數字旁加微標籤：
- 🟢 **實測** = 真 API / 真爬蟲
- 🟡 **推估** = 演算法計算
- 🔴 **AI 生成** = LLM 模擬

視覺：10px mono font + 色點，不搶數字本身的戲。

**成本**：CSS 元件 2 小時 + 既有報告標註 4 小時 = 6 小時

---

### P1-3 · 分段節奏規範化

**現況**：報告內 section 間距亂飄（有 32px、有 48px、有 64px）。

**提案**：report 內只用兩階 `var(--space-8)` (72px) / `var(--space-9)` (96px)，建立 editorial 節奏感。

**成本**：2 小時

---

## 四、P2 長期目標（3 件）

- **PDF 匯出排版**（A4 friendly grid）
- **分享連結 OG image 自動生成**（Hero 截圖 → social card）
- **Dark mode 適配**（目前三份皆 light only）

---

## 五、違憲發現清單（部署前必清）

| 報告 | 違憲項 | 嚴重度 |
|------|--------|--------|
| Lab | `#9F7BFC` 紫色非封閉五色 | P0 |
| Lab | 合成 persona 無 AI 標記 | P0（信任風險） |
| 市場 | v1.3.16 已修，殘留 1 處 border-left 4px teal | P1 |
| PATH | 無 | — |

---

## 六、給下一輪實作的 handoff

**動工順序建議**：
1. 先寫 `.report-*` CSS namespace（獨立檔，不動 app.html）
2. PATH 診斷先 migrate（風險最低，驗證 class 系統 OK）
3. 市場探測 migrate + Hero 重修
4. Lab migrate + AI badge 上 + CAVEAT 重排（最高戰略價值）

**預估工時**：P0 全部 21 小時 · 移動城堡約 1.5 週（單週 20h）

---

*— 荒野女巫，2026-04-21 · Opus 4.7 · 10 維 rubric 實評*
