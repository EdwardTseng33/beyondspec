# BeyondPath 95 分報告體系 · 城堡最終決議 Manifesto

> **決議日期**：2026-04-21
> **決議人**：🌸 蘇菲（主對話）· 整合城堡 7 人圓桌會議
> **啟動日**：2026-04-21（即刻啟動 Sprint 1）
> **總工時**：8 週 / 4 Sprint · 預估 30 人日 / 城堡 336 小時 · 倍率 ~11×

---

## 一、6 題最終拍板（整合霍爾戰略智慧）

| # | 決議 | 採納來源 |
|:-:|---|---|
| **Q1** | **A · 液態團隊時代**：「3-10 人用 Claude 跑完驗證到營收的元年」 | 霍爾推薦 |
| **Q2** | **STEEP 2.0（改版）**：砍 Political + 加 **Ethics/AI Governance** | 霍爾智慧轉向（2026 議題不是傳統政治）|
| **Q3** | **Gemini 主 70% + GPT 30%**（不是 50-50，避免精神分裂）| 霍爾 |
| **Q4** | **Claude + 霍爾折衷**：AI 融入每章 **+** 保留 2-3 頁「AI 原生時代宣言」章 | 霍爾 |
| **Q5** | **每 Trend ≥ 3 Signal**（第一波可降 ≥ 2 追溯）| Claude 原則 + 霍爾落地 |
| **Q6** | **不選 MBA 框架 · 改選 AI 研究工具棧**：Perplexity Deep Research + Claude Projects + Gemini Deep Research | 霍爾戰略轉向（Howl's Law 守護）|

---

## 二、5 報告實作順序（採納馬魯克 · 修正霍爾）

```
Sprint 1 (W1-2) · PATH 診斷 + 技術地基共建
Sprint 2 (W3-4) · Lab 分析 + 市場探測（共用 Signal engine）
Sprint 3 (W5-6) · 🏆 市場報告（旗艦 · 完整 95 分示範 · 含 Data Flywheel money slide）
Sprint 4 (W7-8) · AI 問卷 + 整合收尾
```

**為什麼調整霍爾的「市場報告先」**：
- 馬魯克對——8 週分級實作 · **PATH 診斷是產品高頻入口**，既有用戶天天用，先升級對留存有立即正面影響
- 霍爾的「旗艦先」戰略沒錯，但**市場報告放 S3** 讓我們有 4 週時間累積前 3 份報告的真實資料，當作市場報告 Data Flywheel 的證據
- **市場報告仍是 95 分最高標**——只是它是「集大成」而非「開山」

---

## 三、Sprint 1 · 雙軌混合方案（整合卡西法 + 霍爾 + 馬魯克）

### S1 主題：**PATH 診斷 v2.0（JTBD 4 層 + 技術地基）**

**霍爾 vs 卡西法的張力解法 = 雙軌並行**：
- **卡西法前 5 天**：建 `.report-*` namespace 最小骨架 + URL routing + AI Wrapper v2
- **並行 · 主對話蘇菲**：寫 PATH 診斷 content spec + JTBD 4 層 prompt 升級
- **後 5 天**：PATH 診斷報告套進新 namespace（成為第一個實戰驗證）

### S1 DoD（10 條驗收 · 馬魯克定義）

1. PATH 診斷報告頁可正常渲染、console 0 error
2. 5 份 rubric AC ≥ 80% PASS
3. `page-title-area` 合規
4. Gate 1：Chrome MCP 實測截圖 + unit test 全綠
5. Gate 2：視覺 10 維 ≥ 85 分
6. Gate 3：霍爾確認未超綱（JTBD 4 層必融入 P 維）
7. Gate 4：`versions/v1.4.0.html` 快照 + HTML tail 裸文字檢查
8. `diffs/v1.4.0.diff-report.md` AC ≥ 80%
9. `specs/active/s1-path-diagnosis.md` 落檔
10. sidebar-version 更新至 v1.4.0

### S1 5 個 Deliverables（卡西法技術 + 霍爾內容）

| # | Deliverable | 技術側（卡西法）| 內容側（霍爾 + 蘇菲）|
|:-:|---|---|---|
| D1 | `.report-*` CSS namespace 骨架 | ✅ 10 個核心 class | - |
| D2 | Report Render Engine v1（schema-driven）| ✅ 3 種 section type | - |
| D3 | URL routing `/path/report/diagnostic/:id` | ✅ 分享 + 列印 path | - |
| D4 | AI Call Wrapper v2（retry / cost log / fallback）| ✅ 不替換 PATH_AI.call | - |
| D5 | **PATH 診斷 v2.0 實戰** | 套用新 namespace | **JTBD 4 層 + Hero verdict + Next Action + Hypothesis 抽屜** |

---

## 四、Gate 節奏（馬魯克制定）

| Sprint | G1 卡西法 | G2 女巫 | G3 霍爾 | G4 馬魯克 | G5 沙利曼 |
|:-:|:-:|:-:|:-:|:-:|:-:|
| S1 | ✅ | ✅ | ✅ | ✅ | 可跳（無新部署）|
| S2 | ✅ | ✅ | ✅ | ✅ | 可跳 |
| S3 | ✅ | ✅ | ✅ | ✅ | **✅ 必跑**（市場報告 Data Flywheel 涉 AI-native 合規宣稱）|
| S4 | ✅ | ✅ | ✅ | ✅ | **✅ 必跑**（正式部署）|

---

## 五、其他 4 人代言（主對話蘇菲整合）

### 🔮 女巫（視覺）· 代答
- S1 **`.report-*` namespace 優先**（對應她的 visual-rubric §8 一致性維度 ≥ 9.5）
- 封閉五色守護 + warm-serif DNA 不動（welcome-banner 不碰）
- Hero verdict 字階用 `--text-display-md` 36px（儀式型）
- 資料源三色 badge（🟢/🟡/🔴）必備

### 🥕 蕪菁頭（UX）· 代答
- S1 納入**跨報告流暢度 F1/F2**（PATH A 軸 < 60 → 引導 Lab · PATH T 軸 < 60 → 引導市場探測）
- 5 persona × PATH 診斷情緒曲線測試（P3 坤書「打開 DevTools 不炸」必驗）
- 獨立 URL 必實作（她的 G7 硬指標）

### 🌸 蘇菲 subagent（商業）· 代答
- PATH 診斷 S1 升級對**既有用戶留存直接正面**（Edward 現有用戶每週都在跑）
- S3 市場報告完成後可立刻用於 BD（寄給潛在客戶 / 投資人對談 / 案例研究）
- 不走 MVP = 定價也能直接提到 pro tier 甚至 enterprise

### 🧙‍♀️ 沙利曼（信任/合規）· 代答
- S1 Gate 5 可跳（無新部署 · 只改 render layer）
- **S3 市場報告 G5 必跑**：Data Flywheel 護城河自評 ≥ 16 才能對外宣稱 AI-native（否則虛假宣傳）
- AI 成本 cap 建立：per-request ≤ $0.10 / per-report ≤ $1.00 / per-user daily ≤ $5.00 / 月預算 $500

---

## 六、Howl's Law 最終守護 ✅

| 三條 | 決議對應 |
|---|---|
| **融合 > 並列** | ✅ Q4 折衷 · JTBD 4 層融入 P 維子分不獨立成章 |
| **讀者情境決定** | ✅ Q3 Gemini 主（敘事）· S1 PATH 診斷先（高頻用戶）|
| **創業者不需學 MBA** | ✅ Q2 砍 PESTEL 改 STEEP 2.0 · Q6 改 AI 工具棧（不是 Porter 1957）|

---

## 七、風險清單 Top 5（馬魯克）+ 預防

| # | 風險 | 預防 |
|:-:|---|---|
| 1 | 486 條 criteria AC 打勾變主觀 | S1 前 criteria → 可量測 AC 轉換（霍爾確認）|
| 2 | 5 報告 UI 各自發明 class | 強制 pre-design grep 現有 pattern |
| 3 | AI-native 78 + Gemini 30 條 語義重疊 | S2 前蕪菁頭做去重 mapping |
| 4 | Gate 2 視覺審無 preview URL（v1.0.8 教訓）| S1 前完成 Vercel preview pipeline |
| 5 | Multi-session race condition | 每次 push 前 `git fetch origin main` |

---

## 八、進度追蹤（Edward 每 2 週看 1 頁 Sprint Report）

- AC 達成率（X / 486 條 + 本 sprint 新增 ✅ 數）
- Gate 1-5 通過狀態（紅/黃/綠燈）
- 下 sprint 主題 + 預計完成日
- 未覆蓋事項（誠實列，不能空白）

---

## 九、立即啟動 · 第一個動作

**Sprint 1 Day 1 · 主對話蘇菲 + 卡西法並行**：

1. **我（主對話蘇菲）現在動手**：
   - 落檔 `specs/active/s1-path-diagnosis.md`（PATH 診斷 v2.0 spec）
   - 建立 `.report-*` namespace CSS 檔案骨架

2. **卡西法 Sprint 1 任務**（待主對話派工）：
   - D1 `.report-*` 擴充完整 10 class
   - D2 Report Render Engine v1
   - D3 URL routing
   - D4 AI Wrapper v2

3. **霍爾 Sprint 1 任務**（待主對話派工）：
   - S1 結束前跑 Gate 3（對齊 JTBD 4 層戰略定位）

4. **女巫 Sprint 1 任務**：
   - D5 視覺打磨 + Gate 2 10 維審查

5. **馬魯克 Sprint 1 任務**：
   - Gate 4 + `diffs/v1.4.0.diff-report.md` AC 表

6. **蕪菁頭 Sprint 1 任務**：
   - 5 persona 情緒曲線測試 + F1/F2 跨報告流暢度驗收

---

*決議完畢 · 開工！*
*— 蘇菲（主對話）· 2026-04-21 · 整合霍爾 + 卡西法 + 馬魯克 + 女巫/蕪菁頭/蘇菲 subagent/沙利曼*
