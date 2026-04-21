# BeyondPath 報告規格體系（Reports Standards）

> **建立日期**：2026-04-21
> **目標**：所有 BeyondPath 輸出報告達到客觀評判 **95 分** 水準
> **覆蓋**：PATH 診斷 / Lab 分析 / 市場探測 / 市場報告 / AI 問卷產出 · 共 5 份報告類別

---

## 📐 四層規格架構

```
Layer 1  Content Spec（內容規格）
         └─ 每份報告「該說什麼」：sections / 敘事邏輯 / 資訊點清單
              │
Layer 2  JSON Schema（AI 輸出契約）
         └─ Claude 回傳的 JSON structure / required fields / validation
              │
Layer 3  Prompt Rubric（AI 產出品質 standard）
         └─ 叫 Claude 用什麼語氣 / 字數 / 結構 / 禁用項 / 信心度自評
              │
Layer 4  Render Contract（前端呈現契約）
         └─ `.report-*` namespace / component library / 互動規格
```

---

## 📁 目錄結構

```
projects/beyondpath/reports-standards/
├─ README.md                              ← 本檔（總覽 + 四層架構）
├─ content-specs/                          ← Layer 1
│   ├─ path-diagnostic.md                 ← PATH 診斷內容規格
│   ├─ lab-analysis.md                    ← Lab 分析內容規格
│   ├─ market-signal.md                   ← 市場探測內容規格
│   ├─ market-report.md                   ← 市場報告內容規格
│   └─ ai-survey.md                       ← AI 問卷產出規格
├─ schemas/                                ← Layer 2
│   ├─ path-diagnostic.schema.json        ← JSON Schema（AI 輸出契約）
│   ├─ lab-analysis.schema.json
│   ├─ market-signal.schema.json
│   ├─ market-report.schema.json
│   └─ ai-survey.schema.json
├─ prompt-rubrics/                         ← Layer 3
│   ├─ path-diagnostic.md                 ← Claude prompt 品質標準
│   ├─ lab-analysis.md
│   ├─ market-signal.md
│   ├─ market-report.md
│   ├─ ai-survey.md
│   └─ shared-rules.md                    ← 5 份共用語氣、禁用項
├─ render-contract/                        ← Layer 4
│   ├─ report-namespace.md                ← `.report-*` CSS namespace 規範
│   ├─ component-library.md               ← Hero / Verdict / KPI / Next Action 元件
│   ├─ interaction-spec.md                ← 互動 / 動態 / 空狀態
│   └─ data-source-badges.md              ← 🟢 實測 / 🟡 推估 / 🔴 AI 生成 規範
└─ acceptance/                             ← 95 分驗收
    ├─ 95-rubric-checklist.md             ← 10 維度 × 5 報告 = 50 格驗收表
    ├─ persona-journey-map.md             ← P1-P5 × 5 報告情緒曲線 target
    └─ top-player-benchmark.md            ← 對標 Maze / Dovetail / Productboard
```

---

## 🎯 95 分 = 什麼

### 視覺（女巫 10 維 rubric · 每項 ≥ 9.5）
1. 視覺層次 ≥ 9.5
2. 字體節奏 ≥ 9.5
3. 色彩語義 ≥ 9.5
4. 空間密度 ≥ 9.5
5. 資訊載荷 ≥ 9.5
6. 視覺錨點 ≥ 9.5
7. 情感溫度 ≥ 9.5
8. 憲法遵循 = 10
9. 一致性 ≥ 9.5
10. 品牌辨識 ≥ 9.5

### 內容（霍爾三層深度 · 全達 Deep）
- **Surface**：數據展示 ≥ 9.5
- **Mid**：原因解釋 ≥ 9.5
- **Deep**：Next Action + 風險 + 時程 ≥ 9.5

### UX（蕪菁頭 5 persona × 5 報告）
- P1 阿敏 / P2 Tina / P3 坤書 / P4 美琪 / P5 Kevin 情緒曲線**無 blocker**
- 特別：P3 坤書打開 DevTools 不會想公開批評

### 技術（卡西法架構硬度）
- 零 Math.random
- 零 god function（≥ 200 行函式分解為 chapter registry）
- 100% JSON Schema 驗證
- Error boundary 覆蓋
- ES5 嚴格守（無 optional chaining）

### 對標（Top-player 至少 90%）
- Maze：Executive One-Liner + Next Action + Share button
- Dovetail：Quote-first + Insight clustering
- Productboard：Top 3 actions this week + Confidence calibration

---

## 🔄 與現有 5 份評估報告的關係

本規格體系**基於**以下 4 份評估 + 1 份整合：
- `research/report-upgrade-visual.md`（女巫評估）
- `research/report-upgrade-content.md`（霍爾評估）
- `research/report-upgrade-ux.md`（蕪菁頭評估）
- `research/report-upgrade-tech.md`（卡西法評估）
- `research/report-upgrade-roadmap.md`（蘇菲整合）

評估階段已完成 ✅。本規格體系是**實作前的最後一層藍圖**——規格寫完才能動手 prompt + render。

---

## 🏗 制定順序（為何這樣排）

1. **Content Spec（先做）**：決定「要說什麼」是最上游決策
2. **JSON Schema**：Content Spec → 對應輸出 JSON 結構
3. **Prompt Rubric**：Schema 定了 → 才知道怎麼叫 Claude 產
4. **Render Contract（最後）**：JSON 結構穩了 → 前端才好套模板

**先規格 → 再 prompt → 再 render**，不能反過來。

---

## 📋 這套規格的本質

**這不是一次性 sprint 的產出**，是 **PATH 產品未來每一次 AI 報告產出的長期規格標準**，類似：
- Apple 的 Human Interface Guidelines（長期產品規範）
- IBM 的 Carbon Design System（企業級輸出標準）
- Maze 的 Research Report Template（每個用戶跑出來的報告都長同樣的骨架）

### 意思
- PATH 診斷用戶 A 今天產的報告、明天產的報告、下個月產的報告 → **結構一致、品質一致、敘事邏輯一致**
- Lab 合成 persona → 不管跑幾次、不管 Claude 版本怎麼迭代，output 都符合本規格
- AI 問卷 → 每次生成的品質都可預期（同一等級），不會忽好忽壞

### 維護規則

1. **每份報告改動必過規格**：新增 section → 先改 Content Spec + Schema → 再改 prompt + render
2. **規格衝突以憲法為準**：`CLAUDE.md` Universal Design Rules + 設計憲法優先
3. **規格是 BeyondPath 的產品資產**：寫死在 `reports-standards/`，跨 session / 跨開發者都遵循
4. **每季 review 一次**：top-player 動態更新、rubric 標準可能提升；AI 模型迭代若有更好的 prompt 技巧，納入 Prompt Rubric
5. **Claude 模型升級（4.7 → 4.8 → …）仍遵循同一規格**：規格定義「該輸出什麼」，模型只負責「怎麼寫得好」

---

*規格體系建立於 2026-04-21 · 作者：蘇菲 · 配合 v1.3.19 後的 5 份報告全面升級工程*
