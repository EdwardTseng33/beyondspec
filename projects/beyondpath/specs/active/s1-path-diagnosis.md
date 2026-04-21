# Sprint 1 · PATH 診斷 v2.0 Spec

> **Sprint**：S1（W1-2 · 2026-04-21 ~ 2026-05-05）
> **主題**：PATH 診斷 v2.0（JTBD 4 層 + 技術地基共建）
> **Feature Level**：**L**（跨模組架構：新 namespace + Render Engine + URL routing + AI Wrapper + PATH 實戰）
> **Owner**：🌸 蘇菲（主對話）整合派工
> **版本目標**：v1.4.0（prod deploy 預計 2026-05-05）

---

## §1 · 目標與非目標

### §1.1 目標（Do）
1. **PATH 診斷報告** 升級為 95 分 rubric 合規版本（第一份實戰驗證）
2. **建立 `.report-*` CSS namespace**（5 報告未來複用基礎）
3. **Report Render Engine v1**（schema-driven，5 報告共用）
4. **URL routing**（`/path/report/diagnostic/:id` 獨立可分享 URL）
5. **AI Call Wrapper v2**（retry + cost log + error boundary，不替換既有 `PATH_AI.call`）
6. **跨報告流暢度 F1/F2**（A 軸 < 60 → Lab / T 軸 < 60 → 市場探測）

### §1.2 非目標（Don't · S1 不做）
- DataForSEO 真實資料整合（S2-S3）
- 其他 4 份報告（Lab / 市場探測 / 市場報告 / AI 問卷）
- PDF 匯出 / 分享連結 OG card（S4）
- Observability dashboard（S4+）
- Mobile 真機測試矩陣（S4）

---

## §2 · 5 Deliverables 詳細規格

### §2.1 D1 · `.report-*` CSS Namespace

**檔案**：`projects/beyondpath/reports-standards/render-contract/css/report-namespace.css`

**10 個核心 class**：
```css
.report                  /* base container · max-width 1024px · margin auto */
.report-hero             /* 儀式型 hero · padding space-10 · warm-serif OK */
.report-hero--ritual     /* warm-serif variant · Georgia italic */
.report-hero--tool       /* sans-serif variant · Inter */
.report-verdict          /* 一句話結論 · display-md 36px */
.report-tldr             /* 60-80 字摘要 · 14px italic slate */
.report-section          /* section 容器 · padding space-9 */
.report-section-num      /* 01/02/03 meta label · uppercase 11px */
.report-kpi-row          /* 3-KPI 橫排 · gap space-8 */
.report-kpi              /* 單個 KPI · padding space-5 */
.report-kpi-value        /* 大數字 · display-lg 48px tabular-nums */
.report-kpi-label        /* uppercase meta 11px letter-spacing 0.6 */
.report-kpi-trend        /* arrow + % · teal/rose/slate */
.report-source-badge     /* 資料源 badge · 11px mono */
.report-source-badge--measured   /* 🟢 teal dot */
.report-source-badge--estimated  /* 🟡 gold dot */
.report-source-badge--ai         /* 🔴 rose dot */
.report-warning-ai-synth /* Lab AI 合成警告條 · rose border-left */
.report-quote            /* editorial quote · serif 非 italic */
.report-quote-dropcap    /* 首字放大 42px */
.report-cta-trio         /* 分享/儲存/下載 三件套 */
.report-hero-break       /* 儀式→工具過渡帶 · space-1 slate 細線 */
.report-section-meta     /* section uppercase meta */
.report-jtbd-layer       /* JTBD 4 層單層容器 · v1.1 新增 */
.report-jtbd-score       /* JTBD 子分數 · tabular-nums */
```

**CSS token 新增**：
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

**AC（acceptance criteria）**：
- [ ] 10+ 個 class 定義完整
- [ ] 封閉五色合規（grep 無 Tailwind blue / emerald）
- [ ] 無 border-left/top stripe（除 `.report-warning-ai-synth`）
- [ ] 字級只用 scale（11/12/13/14/15/17/22/36/48/72）
- [ ] 間距只用 4/8/12/16/24/36/48/72/96/128

---

### §2.2 D2 · Report Render Engine v1

**檔案**：新增 `window.BPReport.render(schema, data, container)` API 在 app.html

**Schema 定義**（JSON）：
```json
{
  "type": "diagnostic",
  "title": "你的 PATH 診斷",
  "hero": {
    "verdict": "方向對，持續驗證",
    "confidence": 72,
    "kpis": [
      {"value": 82, "label": "PATH 總分", "trend": "+3 vs 上次", "source": "measured"},
      {"value": "P 弱項", "label": "需補強", "source": "measured"},
      {"value": "2 週", "label": "下輪重估", "source": "estimated"}
    ]
  },
  "sections": [
    {
      "type": "path-scores",
      "title": "四維分析",
      "data": {"P": 18, "A": 20, "T": 22, "H": 22},
      "subScores": {
        "P": [
          {"layer": "L1 Functional", "score": 5.5, "max": 6, "evidence": "..."},
          {"layer": "L2 Emotional", "score": 5.0, "max": 6, "evidence": "..."},
          {"layer": "L3 Identity", "score": 6.0, "max": 7, "evidence": "..."},
          {"layer": "L4 Addiction", "score": 5.0, "max": 6, "evidence": "..."}
        ]
      }
    },
    {"type": "next-actions", "title": "下一步 3 件事", "data": [...]},
    {"type": "hypothesis", "title": "方法論透明", "data": {...}}
  ],
  "crossToolNav": [
    {"trigger": "A < 60", "target": "lab", "label": "Audience 不夠清楚 → 跑 Lab"}
  ]
}
```

**支援 3 種 section type**（S1 範圍）：
1. `path-scores` — 四維分數環 + 子分展開
2. `next-actions` — Top 3 action cards（SMART 格式）
3. `hypothesis` — 方法論透明抽屜

**AC**：
- [ ] `window.BPReport.render()` 可接受 schema + data + container
- [ ] 3 種 section type 都能 render
- [ ] Schema 驗證失敗 → fallback UI（不白屏）
- [ ] 現有 `showQuizResults()` **不動**（漸進遷移，S1 只接新 route）

---

### §2.3 D3 · URL Routing `/path/report/diagnostic/:id`

**實作**：app.html SPA hash router 新增 route

```js
// 新 route
case 'report-diagnostic':
  var reportId = route.params.id;
  var reportData = state.reports.find(r => r.id === reportId);
  if (!reportData) return render404();
  window.BPReport.render(diagnosticSchema, reportData, contentEl);
  break;
```

**URL pattern**：
- 對內：`https://beyondspec.tw/path/app/#/report/diagnostic/{id}`
- 對外分享（S3 實作）：`https://beyondspec.tw/path/share/diagnostic/{shareId}`

**AC**：
- [ ] 貼網址可直接開報告
- [ ] Refresh 不掉內容
- [ ] 不存在 id → 404 頁「報告不存在或已刪除」
- [ ] 複製網址貼新分頁 → 可開
- [ ] 列印按鈕 → A4 print-safe

---

### §2.4 D4 · AI Call Wrapper v2

**API**：
```js
window.PATH_AI.callV2(prompt, {
  schema: {...},          // JSON Schema 驗證
  retries: 3,             // exponential backoff
  timeout: 30000,         // 30s hard cap
  costCap: 0.50,          // USD per request
  fallback: 'default',
  userId: state.user.uid,
  reportType: 'diagnostic'
})
```

**Cost Log Firestore**：`bp_ai_cost_log/{logId}`
```yaml
timestamp: server
userId: string
reportType: 'diagnostic' | 'lab' | 'market-signal' | 'market' | 'survey'
model: 'claude-sonnet-4.5'
inputTokens: number
outputTokens: number
costUSD: number
latencyMs: number
success: boolean
errorCode: string | null
```

**AC**：
- [ ] V2 獨立存在，不替換 `PATH_AI.call`（既有 stable）
- [ ] Schema 驗證失敗自動 retry 1 次
- [ ] 30s timeout 硬上限
- [ ] 成本超標自動 abort + 告警
- [ ] Firestore log 成功寫入（可從 Firebase Console 看）

---

### §2.5 D5 · PATH 診斷 v2.0 實戰

**整合**：既有 `showQuizResults()` 升級為用新 `BPReport.render`，內容升級：

#### D5.1 · Hero Verdict（新增）
**位置**：POC SCORE 之前
**內容**：Claude API 產出 **12-20 字 One-Liner punchline**
**例**：
- 健康：「方向對，補 Traction 就能衝」
- 中等：「訊號混合，先補最弱維度」
- 差：「重新思考切入點」

#### D5.2 · JTBD 4 層展開（P 維子分）
**點 P 軸環 → 展開 4 層子分**：
- L1 Functional（6 分）· L2 Emotional（6 分）· L3 Identity（7 分）· L4 Addiction（6 分）
- 每層附狀態色 🟢🟡🔴 + 一句證據 + 改進動作

#### D5.3 · Next Action 升級（SMART 格式）
現有 Action 清單升級為：
```
Action 1 · 補 Traction 證據
Specific: 蒐齊 3 個付費客戶 testimonial
Measurable: 每段 ≥ 60 秒
Achievable: 工時 6h · 城堡估 1h
Relevant: T 軸 +5 預估
Time-bound: 2 週內
誰做 / 風險 / 失效條件
```

#### D5.4 · Hypothesis 方法論抽屜
新增「📐 本診斷的計算方法」抽屜：
- 資料來源（你的作答 + AI 推論）
- 核心假設 2-3 項
- 信心度 72%（而非「中信心」）
- 失效條件

#### D5.5 · 跨工具導引 F1/F2
根據分數動態提示：
- A 軸 < 60 → 「Audience 不夠清楚，跑 Lab 合成 5 位 persona 驗證」
- T 軸 < 60 → 「Traction 弱，看市場訊號是否支撐」

#### D5.6 · 資料源 Badge
所有數字旁加 🟢 實測（你的作答）/ 🟡 推估（AI 計算）/ 🔴 AI 生成（示例對照）

#### D5.7 · 獨立 URL
報告產出後自動分配獨立 URL，右上角「複製連結」

**AC**：
- [ ] Hero verdict 12-20 字 punchline
- [ ] JTBD 4 層可展開
- [ ] Next Action 3 條 SMART 格式
- [ ] Hypothesis 抽屜含 5 欄位
- [ ] 跨工具 F1/F2 條件觸發
- [ ] 資料源 3 色 badge 覆蓋率 ≥ 95%
- [ ] 獨立 URL 可複製貼出

---

## §3 · Sprint 1 時程（10 工作日）

| Day | 主對話蘇菲 | 卡西法（bg）| 其他 |
|:-:|---|---|---|
| D1-2 | 落檔 S1 spec · 建 CSS namespace | - | - |
| D3-5 | PATH content spec + prompt 升級 | D1 namespace 擴充 + D2 Render Engine v1 | - |
| D6-7 | D5 PATH 內容產出 · 套 namespace | D3 URL routing + D4 AI Wrapper v2 | - |
| D8 | 整合 + 首次 Chrome MCP 實測 | G1 實測 | 女巫 G2 截圖 |
| D9 | 修 Bug · 回歸測試 | - | 霍爾 G3 + 馬魯克 G4 |
| D10 | Push v1.4.0 prod | 部署驗證 | 蕪菁頭 5 persona 驗 |

---

## §4 · Gate 驗收清單

### Gate 1（卡西法）
- [ ] unit test 全綠（`node projects/beyondpath/tests/unit/run-all.js`）
- [ ] Chrome MCP 實測：login → PATH 診斷 → 報告 render → 複製 URL 貼新分頁
- [ ] Console 0 error
- [ ] Mobile 375px 不橫滑
- [ ] Dark mode 適配

### Gate 2（女巫）
- [ ] 10 維 visual rubric ≥ 85 分
- [ ] 截圖對照 v1.3.19 前版 · 視覺進化明顯
- [ ] 封閉五色合規 grep PASS

### Gate 3（霍爾）
- [ ] JTBD 4 層融入 P 維（未違 Howl's Law）
- [ ] Hero verdict 符合 Gemini 風格
- [ ] Next Action SMART 5 要素齊
- [ ] 未超綱（不碰其他 4 報告）

### Gate 4（馬魯克）
- [ ] `diffs/v1.4.0.diff-report.md` AC 表 ≥ 80% ✅
- [ ] `versions/v1.4.0.html` 快照建立
- [ ] HTML tail 裸文字 grep PASS
- [ ] sidebar-version 更新
- [ ] `push-prod.sh` 5 層 guard 全綠

---

## §5 · 風險與預防

| 風險 | 預防 |
|------|------|
| JTBD 4 層 prompt 要求高，Claude 產出品質不穩 | S1 前測 10 次產出，不穩就加 schema 驗證 + retry |
| `.report-*` namespace 與既有 `.page-title-area` 衝突 | 嚴格隔離 · 報告內不用 `.page-title-area` |
| AI Wrapper v2 遷移撞到既有 call 點 | 不遷移 · 新建 V2 · 新報告一律走 V2 |
| 獨立 URL routing 與 SPA hash router 衝突 | 用 hash route (`/#/report/:id`) 不用 History API |
| 跨工具 F1/F2 動態提示過度打擾 | 只顯示一次 + 可 dismiss + 分數跨閾值才觸發 |

---

## §6 · 相關規格引用

- Howl's Law · `reports-standards/acceptance/tool-selection-matrix.md`
- JTBD 4 層 · `reports-standards/acceptance/2026-ai-native-upgrade.md §1`
- 視覺 95 分 · `reports-standards/acceptance/visual-rubric-95.md`
- Signal-driven · `reports-standards/acceptance/claude-framework-synthesis.md §2`
- 最終決議 · `reports-standards/final-decision-manifesto.md`

---

*Spec v1.0 · 2026-04-21 · 主對話蘇菲落檔*
*待 Gate 1-4 全綠 → push v1.4.0 prod → 啟動 S2 Lab + 市場探測*
