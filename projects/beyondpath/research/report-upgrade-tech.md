# 報告升級 · 技術架構評估（卡西法）

> **評估對象**：市場探測報告 / Lab 研究報告 / PATH 診斷報告
> **評估日期**：2026-04-21
> **評估者**：🔥 卡西法（CTO · Opus 4.7）
> **方法**：實讀 app.html 三份 render 函式（2500+ 行）+ 架構債分析

---

## 一、目前技術現況盤點

### 三份報告的實作位置

| 報告 | 函式 | 行數 | 架構狀態 |
|------|------|------|---------|
| PATH 診斷 | `showQuizResults` | 21428-21800+ (~400 行) | 中等（已有結構但 inline style 多） |
| Lab 研究 | `renderLab` + 衍生函式 | 22099-25500+ (~3400 行) | **god functions 地獄** |
| 市場探測 | `renderMarketSignal` + `renderFullReport` | 25596+ / 26986-27461 (**475 行單一函式**) | **最重災區** |

### 架構債清單

| 項目 | 嚴重度 | 影響 |
|------|-------|------|
| `renderFullReport` 475 行 god function | P0 | 任何改動都可能打破其他部分 |
| Inline style 遍地（超過 1,500 個 `style="..."`） | P0 | 無法被 CSS token 系統統一 |
| **ES5 違憲：optional chaining `?.` 多處** | P0 | CLAUDE.md 禁令，Safari 13 前崩潰 |
| 三份報告各自 Claude API call 實作 | P1 | error handling 不一致、cost 追蹤困難 |
| 無 JSON schema 驗證 AI 輸出 | P1 | AI 回傳結構漂移無防護 |
| `Math.random()` 造假數據（市場探測） | **P0-信任級** | 見 turnip ux 報告 |
| 無 unit test 覆蓋 render 函式 | P2 | 重構無保護網 |

---

## 二、三個優先投資（分級）

### 🎯 Quick Win（1-2 天可落地）

#### Q-1 · 統一 AI Call Wrapper（窗口層）

**現況**：三份報告各自寫：
```js
// 市場報告裡：
fetch('https://claude-proxy.xxx.workers.dev', {...}).then(r => r.json())...
// Lab 裡：
fetch(proxyUrl, {method:'POST', body:JSON.stringify(...)}).then(...)
// PATH 診斷裡：
window.PATH_AI.call(...).then(...)
```

錯誤處理不一致、retry 策略不一致、cost 追蹤沒做。

**提案**：建立 `window.BPReport.callAI(prompt, options)`：
- 統一 error handling（timeout / rate-limit / 格式漂移）
- 統一 retry（exponential backoff 3 次）
- 統一 cost logging（寫入 `bp_ai_cost_log`）
- 統一 schema 驗證（optional JSON schema 輸出後 validate）

**工時**：6 小時（3h wrapper + 3h retrofit 三份報告）

---

#### Q-2 · 移除 ES5 違憲（optional chaining `?.` / `??`）

**現況**：`renderFullReport` + `renderLab` 內有 30+ 處 `a?.b?.c`，違反 CLAUDE.md ES5-only 規則。Safari 13 + 老 Chrome 會炸。

**提案**：grep 全文 `?\.` 並替換成 `a && a.b && a.b.c`。

**工時**：2 小時

---

#### Q-3 · 移除 Math.random 假數據（協作 turnip P0-1）

見 ux 報告 P0-1。

**工時**：3 小時

---

**Quick Win 合計：11 小時 · 1.5 天**

---

### 🏗 Foundation（中期投資 · 3-4 天）

#### F-1 · Chapter Registry 重構（god function 分解）

**現況**：`renderFullReport` 是一個 475 行的單體函式，包含 8 個章節的 HTML 拼裝：
1. Hero / verdict
2. Market size (TAM/SAM/SOM)
3. Search trend
4. Competitive matrix（含 Math.random 毒瘤）
5. Customer segments
6. Financial projection
7. Recommendations
8. Footer / data sources

**提案**：重構為 chapter registry：
```js
window.BPReport.chapters = {
  'market.hero': { render: (data) => ..., deps: ['marketSize', 'verdict'] },
  'market.tam': { render: (data) => ..., deps: ['marketSize'] },
  // ...
};
window.BPReport.render(reportType, sectionIds) // 按需組合
```

**好處**：
1. 單章節可獨立測試
2. A/B test 不同章節設計
3. 報告可客製化（Starter 顯示 3 章、Pro 顯示 8 章）

**工時**：16 小時（分 3 次 commit：registry 架構 / 市場報告拆章 / 驗證）

---

#### F-2 · JSON Schema 驗證 AI 輸出

**現況**：Claude API 回傳 JSON，若格式漂移（例少某個 field），render 函式當場崩潰白屏。

**提案**：每個 AI call 配 schema：
```js
const marketHeroSchema = {
  verdict: 'string | required',
  confidence: 'high|medium|low | required',
  top3Metrics: 'array[3] | required'
};
const result = await BPReport.callAI(prompt, { schema: marketHeroSchema });
// schema 不符自動 retry 1 次，retry 還失敗 fallback 到預設提示
```

**工時**：8 小時（schema validator + 三份報告套用）

---

**Foundation 合計：24 小時 · 3 天**

---

### 🚀 Future Bet（先不做 · 評估用）

#### B-1 · PDF 匯出

**技術路線**：
- 路線 A：`html2pdf.js` client-side（快但字體 + 分頁難）
- 路線 B：Puppeteer serverless on Cloudflare Workers（品質高但設置複雜 + cost）

**建議**：**延後到 v1.5+**。目前 web 版 UX 未穩定，PDF 會把問題固化下來。

---

#### B-2 · 報告分享連結

**技術路線**：
- 報告快照存 Firestore `reports/{shareId}`，產 `/shared/{id}` 公開頁
- 浮水印 + 過期機制（7 天 / 30 天可選）

**建議**：**延後到 v1.5+**。需先有 onboarding 穩定的核心功能，否則變「分享出去反而暴露產品不成熟」。

---

## 三、技術投資優先級總覽

| 分級 | 工作 | 工時 | 戰略價值 |
|------|------|------|---------|
| P0 | 移除 Math.random | 3h | 信任救火 🚨 |
| P0 | ES5 違憲清除 | 2h | 憲法合規 |
| P0 | AI call wrapper | 6h | 架構底層 |
| P1 | Chapter Registry 重構 | 16h | 長期可維護 |
| P1 | JSON schema 驗證 | 8h | 穩定性 |
| P2 | PDF / 分享連結 | 延後 | v1.5+ |

**P0 合計 11 小時** · **P0+P1 合計 35 小時 · 約 1 週**

---

## 四、技術風險提醒

### 🚨 High Risk

1. **Math.random 競爭矩陣** — 詳見 turnip ux 報告 P3 坤書場景
2. **`renderFullReport` 單函式脆弱** — 任何 Claude API 格式微變就白屏；沒有 error boundary

### ⚠️ Medium Risk

1. **Lab module 3400 行單檔** — 新加功能必踩雷（已在 v1.3.7 白屏事件驗證過）
2. **無 unit test** — 重構無保護網，退版風險高

### 💡 Low Risk

1. **inline style 1500+ 處** — 慢性病不急救，但若動 `.report-*` namespace 必須一起處理（女巫 P0-1）

---

## 五、Handoff 建議

**推薦動工順序**：

| Sprint | 工作 | 工時 |
|--------|------|------|
| **Week 1 Day 1** | Math.random 清零 + ES5 違憲清除 + AI wrapper | 11h |
| **Week 1 Day 2-3** | `.report-*` CSS namespace（女巫） + AI badge（女巫） | 10h |
| **Week 1 Day 4-5** | Next Action + One-Liner + Hypothesis（霍爾） | 20h |
| **Week 2 Day 1-2** | 資料源三色標記（ux） + Step A 引導（ux） | 14h |
| **Week 2 Day 3-5** | Chapter Registry 重構 + JSON schema | 24h |

**2 週 sprint 總計 79h**，單人日 8h 約 **10 個工作日**。

---

## 六、結論

1. **Math.random 今晚必清**（信任救火，不容拖延）
2. **AI wrapper + ES5 清除**是快 win，1.5 天可落地
3. **Chapter Registry 重構**是中期根本解法，建議 v1.4 啟動
4. **PDF + 分享連結延後到 v1.5+**

---

*— 卡西法，2026-04-21 · Opus 4.7 · app.html 實讀 + 架構債審計*
