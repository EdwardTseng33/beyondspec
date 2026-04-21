# 報告升級 · 整合路線圖（蘇菲綜合）

> **整合日期**：2026-04-21
> **整合者**：🌸 蘇菲（主對話）
> **素材**：女巫（視覺）/ 霍爾（內容）/ 蕪菁頭（UX）/ 卡西法（技術）四份獨立評估
> **適用**：市場探測報告 / Lab 研究報告 / PATH 診斷報告

---

## 一、四視角共識強度

### 🔴 四人全中（最高共識 → P0 必做）

1. **移除 Math.random() 造假數據** ← 信任救火
   - 蕪菁頭：P3 坤書必定檢出，公開批評風險
   - 卡西法：11 小時工時，今晚可清
   - 霍爾：信任是「內容深度」的底層
   - 女巫：違反「真實資料」憲法

2. **資料源透明化標記系統**（🟢 實測 / 🟡 推估 / 🔴 AI 生成）
   - 女巫：audit tag 元件
   - 霍爾：hypothesis transparency
   - 蕪菁頭：所有 persona 都需要
   - 卡西法：配合 AI wrapper 層 log cost

3. **Executive One-Liner + Hero + Verdict**
   - 女巫：視覺 Hero 元件
   - 霍爾：Executive One-Liner 開頭
   - 蕪菁頭：P1/P4 需要一句話帶走
   - 卡西法：配合 chapter registry

### 🟡 三人中（次高共識 → P0/P1 邊界）

4. **Next Action 清單**（報告結尾強制）
   - 霍爾 / 蕪菁頭 / 女巫（女巫列 `.report-cta`）

5. **方法論透明 / 信心度刻度**
   - 霍爾 / 蕪菁頭 / 卡西法（技術面 JSON schema）

6. **Lab 升級專屬**（合成 AI badge + 紫色違憲清除 + CAVEAT 視覺打磨）
   - 女巫 / 霍爾 / 蕪菁頭

### 🟢 獨到洞察（單人觀點，值得採納）

- **卡西法獨到**：`renderFullReport` 475 行 god function 不解決會一直踩雷 → P1 重構
- **蕪菁頭獨到**：Lab Step A 3 問題引導 onboarding → P0
- **霍爾獨到**：cross-tool 導引形成閉環 → P1
- **女巫獨到**：`.report-*` namespace 統一 class 系統 → P0 底層

---

## 二、衝突 · 需 Edward 拍板 3 件

### C-1 · PDF 匯出優先級
- 卡西法：延後到 v1.5+（技術複雜 + 固化 bug）
- 霍爾：不做 PDF 這類花俏功能，先做內容深度
- （無反對）→ **默認延後，v1.5+ 再評估**

### C-2 · `renderFullReport` 重構時機
- 卡西法：P1 中期投資，16h
- 女巫：配合 `.report-*` namespace 一起做較有意義
- → **建議合併在一個 sprint 做**，但需 Edward 確認是否願意花 2-3 天純重構（風險：期間沒有新 feature）

### C-3 · Lab 報告要不要獨立一個 sprint
- 蕪菁頭 + 女巫皆指出 Lab 風險最高
- 霍爾認為 Lab 誠實聲明是差異化護城河
- → **建議拉出一個 Lab-only sprint**，專心處理：AI badge + 紫色清 + CAVEAT 打磨 + Step A 引導 + 合成方法論透明

---

## 三、整合 Sprint Plan（2 週）

### Week 1 · Foundation + 信任救火

| Day | 工作 | 主責 | 工時 |
|-----|------|------|------|
| 1 | **Math.random 清零**（市場競爭矩陣） | 卡西法 | 3h |
| 1 | **ES5 違憲清除**（optional chaining） | 卡西法 | 2h |
| 1 | **AI call wrapper 建立** | 卡西法 | 6h |
| 2 | **`.report-*` CSS namespace** | 女巫 | 4h |
| 2-3 | **Hero + Verdict 元件**（三報告共用） | 女巫 + 霍爾 | 10h |
| 3 | **資料源三色標記系統** | 女巫 + 蕪菁頭 | 8h |
| 4 | **市場報告 migrate**（用新 namespace） | 卡西法 | 6h |
| 5 | **PATH 報告 migrate** | 卡西法 | 4h |

**Week 1 小計：43h**

### Week 2 · 內容深度 + Lab 專項

| Day | 工作 | 主責 | 工時 |
|-----|------|------|------|
| 1 | **One-Liner prompt 擴充**（三報告） | 霍爾 | 4h |
| 1-2 | **Hypothesis transparency 小抽屜** | 霍爾 + 女巫 | 7h |
| 2-3 | **Next Action 清單元件** | 霍爾 + 女巫 | 9h |
| 3-4 | **Lab AI badge + 紫色清除 + CAVEAT 打磨** | 女巫 | 6h |
| 4-5 | **Lab Step A 引導 3 問題** | 蕪菁頭 + 卡西法 | 6h |
| 5 | **Confidence Calibration % 顯示** | 霍爾 | 4h |

**Week 2 小計：36h**

**總計：79 小時** · 單人日 8h = 10 個工作日 · **移動城堡估 16 小時**（6-15× 效率比）

---

## 四、預期成果（2 週後）

| 指標 | v1.3.16 現況 | v1.5.0 目標 |
|------|-------------|------------|
| 市場報告視覺分 | 82/100 | 92/100 |
| Lab 報告視覺分 | 62/100 | 85/100 |
| PATH 報告視覺分 | 83/100 | 90/100 |
| 內容深度層次 | 表層 | 中層 → 深層 |
| P3 坤書信任風險 | 🚨 Math.random 毒瘤 | ✅ 全清 |
| P1 阿敏上手率 | 不確定 | Step A 引導後 +30% |
| Top-player 對標 | 60% | 85% |

---

## 五、立即執行（今晚可做）

按 Auto Mode 授權，**今晚先做這三件（合計 5 小時）**：

### 🚨 Hot-Fix 1 · Math.random() 清零（1h）
grep `renderFullReport` 內 `Math.random`，全部改為：
- 若是競爭矩陣 mock data → 暫時標「AI 推估 · 示意」
- 若是視覺裝飾（sparkline noise）→ 改固定模式

### 🚨 Hot-Fix 2 · ES5 違憲清除（2h）
grep `?\.` / `??`，全部改為 `&&` 鏈式守護。

### 🚨 Hot-Fix 3 · `renderFullReport` Math.random 章節紅線（1h）
競爭矩陣標上「本區為 AI 模擬推估，不代表真實競品數據」+ 卡片頂 1px rose 線。

### Hot-Fix 4 · 資料源標記原型（1h）
在市場報告 hero 放 3 個 chip（Trend = 🟢 DataForSEO / CPC = 🟡 推估 / Competition = 🔴 AI 生成）當 P0C。

---

## 六、後續 Sprint（Week 1-2）需 Edward 拍板

1. **是否啟動 2 週 report upgrade sprint**（Y/N）
2. **是否同意 `renderFullReport` 花 2-3 天重構**（重構期間無新 feature）
3. **是否同意 PDF / 分享連結延後到 v1.5+**（預計省 2-3 週工）

---

*— 蘇菲（主對話整合）· 2026-04-21 · 四視角綜合*
