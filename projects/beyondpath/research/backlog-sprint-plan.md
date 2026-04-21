# BeyondPath Backlog 優先排序 + Sprint 計畫
**作者：** 馬魯克（PM / QA Lead）
**日期：** 2026-04-21
**基準版本：** v1.3.12（早鳥申請 modal + Firebase Firestore + admin 頁完成）
**目標 sprint 週期：** 2026-04-22 ~ 2026-05-05（14 天）

---

## 1. 全部 Backlog 鋪開

| ID | 描述 | 依賴 | 預估工時（AI 輔助工程師） | 城堡倍率工時 | 風險 | 感知 |
|----|------|------|--------------------------|-------------|------|------|
| BL-001 | 戰情室 UIUX：重寫 `renderInsights()` god function（425 行拆解 + 視覺重構，依 war-room-v3.html mockup v4） | BL-009（聯絡人 type 欄） | 3-4 天 | 6-9 小時 | H | 看得見 |
| BL-002 | 戰情室：純 SVG 自刻 vs Chart.js 45KB 技術決策 + 實裝 | BL-001 | 0.5 天 | 1-2 小時 | M | 內部 |
| BL-003 | 問卷引擎結果頁重修（55 分→82 分）：4 純數字卡改甜甜圈 + type 色封閉五色修正 + hero 可信度 verdict | — | 1-1.5 天 | 2-3 小時 | M | 看得見 |
| BL-004 | 市場探測結果頁重修（53 分→82 分）：sparkline + benchmark bar + SVG 折線 + verdict + 違憲色清除 | — | 1.5-2 天 | 3-4 小時 | M | 看得見 |
| BL-005 | Lab 研究結果頁重修（58 分→82 分）：量化面板 + quote block + verdict 加厚 | BL-006（Lab footer） | 1-1.5 天 | 2-3 小時 | M | 看得見 |
| BL-006 | Lab footer 方法論區塊落地（霍爾 lab-research-competitive-framing.md Part D.2） | — | 0.5 天 | 1-2 小時 | L | 看得見 |
| BL-007 | 全站 Lab 敘述更新（landing / 定價 / 模組入口中庸版同步）+ Persona 卡右上「AI 合成」小標 | BL-006 | 0.5 天 | 1 小時 | L | 看得見 |
| BL-008 | Lab confidence score（Claude prompt 每題加 High/Medium/Low） | — | 0.5-1 天 | 1-2 小時 | M | 看得見 |
| BL-009 | 客戶 `bp_contacts.type` 欄位新增（戰情室客戶分佈甜甜圈資料來源） | — | 0.5 天 | 1 小時 | L | 內部 |
| BL-010 | 市場報告重修（58 分→82 分）：executive summary hero + 跨資料源風格統一 + 結論 | — | 1.5 天 | 2-3 小時 | M | 看得見 |
| BL-011 | PATH 診斷優化（82 分→88 分）：radar 加 hover tooltip + 歷史趨勢對比 | — | 1 天 | 2 小時 | L | 看得見 |
| BL-012 | Tail changelog cleanup：app.html 尾部剩餘 7+ 條搬入 CHANGELOG.md，維持憲法 ≤ 3 熱區 | — | 0.5 小時 | 0.5 小時 | L | 內部 |
| BL-013 | Firebase Extension Trigger Email 指南落檔（ops/trigger-email-setup.md 操作手冊，5 分鐘 Firebase Console SOP） | — | 0.5 天 | 1 小時 | L | 內部 |
| BL-014 | DataForSEO 真實資料接入 PoC（市場探測 v1.1，market-signal-tech-poc.md）| BL-004、suliman Gate 5 | 4-5 天 | 8-12 小時 | H | 看得見 |
| BL-015 | E 組研究完成後 backlog 校準（Sophie 市場研究 / Howl 競業研究 / Turnip 用戶調研 → 反饋優先序） | BL-E1、BL-E2、BL-E3 | — | 1-2 小時（整合） | M | 內部 |
| BL-E1 | Sophie 深度市場研究 market-deep-dive.md（並行派中） | — | — | — | — | 內部 |
| BL-E2 | Howl 深度競業研究 competitive-deep-dive.md（並行派中） | — | — | — | — | 內部 |
| BL-E3 | Turnip 深度用戶調研 user-deep-dive.md（並行派中） | — | — | — | — | 內部 |

**E 組備注：** BL-E1/E2/E3 為進行中研究，預計 sprint 第 1 週收斂。結果會影響 BL-001（戰情室功能定義）與 BL-014（DataForSEO 是否值得投入）的優先序——sprint 第 7 天設校準點。

---

## 2. P0 / P1 / P2 分類

### P0 — 下一輪必做（影響 prod 可用度 / 愛德華已點名 / 賣點核心）

| ID | 項目 | 理由 |
|----|------|------|
| BL-003 | 問卷引擎結果頁重修 | 55 分、型別色違憲（非封閉五色），屬憲法級 bug，不合格不能對外展示 |
| BL-004 | 市場探測結果頁重修 | 53 分最低分、愛德華親口點名痛點（純數字無圖），早鳥 demo 核心 |
| BL-009 | 客戶 type 欄位 | BL-001 戰情室的資料前置條件，缺了甜甜圈圖沒資料 |
| BL-012 | Tail changelog cleanup | 憲法已違規（7+ 條）且 Gate 4 每次都要跑 grep，現況不乾淨 |
| BL-013 | Firebase Trigger Email 指南 | 早鳥申請已上線，email 通知是下一步必要配套，愛德華 5 分鐘就能開，不指南他不會做 |

### P1 — 這個月做（提升 rubric 分 / 建立長期護城河）

| ID | 項目 | 理由 |
|----|------|------|
| BL-001 | 戰情室 UIUX 重寫 | 最大工程，早鳥 demo 的視覺核心，mockup v4 等了愛德華 sign off |
| BL-002 | 戰情室技術決策 | BL-001 的前置判斷，Chart.js vs SVG 拍板一次決定整個架構 |
| BL-005 | Lab 研究結果頁重修 | 58 分，合成訪談是 BeyondPath 最差異化功能，不能配一個低分結果頁 |
| BL-006 | Lab footer 方法論區塊 | 霍爾已產出研究 Part D.2，誠實敘述合成限制是品牌信任基礎 |
| BL-007 | 全站 Lab 敘述更新 | 配合 BL-006，訊息不一致會傷早鳥印象 |
| BL-008 | Lab confidence score | 技術差異化，競品 Synthetic Users 有類似功能，BeyondPath 需要 |
| BL-010 | 市場報告重修 | 58 分，與 Lab 同一個「產出頁弱」問題，P1 補齊 |
| BL-015 | E 組研究整合校準 | Sprint 中期必做，確保後半段不走錯方向 |

### P2 — 下一季（nice-to-have / 技術債 / 依研究結果而定）

| ID | 項目 | 理由 |
|----|------|------|
| BL-011 | PATH 診斷優化（82→88） | 已是金牌標本，性價比低，下一季再打磨 |
| BL-014 | DataForSEO 真實資料接入 | 技術複雜（H 風險）+ 需 Gate 5 審查 + 需愛德華技術拍板 + E 組研究可能調整必要性，緩 |

---

## 3. 兩週 Sprint 計畫（2026-04-22 ~ 2026-05-05）

> **凡例：** `[agent]` = 主責 subagent；G1=Gate 1 卡西法；G4=Gate 4 馬魯克；G1+G4 = 每次交付最低底線

### Week 1（4/22 ~ 4/28）—— P0 清場 + 戰情室準備

| 日期 | Slot | 任務 | Agent | 說明 |
|------|------|------|-------|------|
| **4/22 Tue** | 上午 | BL-012 Tail cleanup | `markl` | grep 確認現況、整理 CHANGELOG.md、app.html 尾部清至 ≤ 3 熱區 |
| | 下午 | BL-009 客戶 type 欄位 | `calcifer` | 新增欄位 + migration + 資料 schema 驗證；Gate 1+4 |
| | 晚上 | BL-013 Firebase Trigger Email 指南 | `markl` | 落檔 ops/trigger-email-setup.md，5 步驟截圖 SOP |
| **4/23 Wed** | 上午 | BL-003 問卷引擎：設計意圖 checklist | `witch` | 10 維度 rubric 分析，確認 4 甜甜圈 + type 色 + hero verdict 方案 |
| | 下午 | BL-003 問卷引擎：實裝 | `calcifer` | 依 witch 設計意圖落 code |
| | 晚上 | BL-003 Gate 1 + Gate 2 + Gate 4 | `calcifer` / `witch` / `markl` | 截圖確認 55→80+ 分；AC diff-report v1.3.13 |
| **4/24 Thu** | 上午 | BL-004 市場探測：設計意圖 checklist | `witch` | sparkline / benchmark bar / SVG 折線 / verdict 方案設計 |
| | 下午 | BL-004 市場探測：實裝 | `calcifer` | SVG sparkline + benchmark bar + 折線 + verdict + 違憲色清除 |
| | 晚上 | BL-004 Gate 1 + Gate 2 + Gate 4 | `calcifer` / `witch` / `markl` | 截圖確認 53→80+ 分；AC diff-report v1.3.14 |
| **4/25 Fri** | 上午 | E 組研究進度確認（BL-E1/E2/E3） | `sophie` + `howl` + `turnip` | 三份研究各產中期摘要（2-3 條核心洞察），回饋給主對話蘇菲 |
| | 下午 | debug / P0 items 修補 / preview 確認 | `calcifer` | 本週交付物實站確認，任何視覺 bug 修補 |
| | 晚上 | Week 1 復盤 | `markl` | 檢查 4 個 P0 items 完成度、Gate 4 全掃一遍、記錄 off-track 項目 |
| **4/26 Sat** | 上午 | BL-002 戰情室技術決策 | `calcifer` + `howl` | calcifer PoC 純 SVG vs Chart.js benchmark；howl 從產品角度給意見；**等愛德華拍板** |
| | 下午 | （緩衝 / 愛德華決策等待） | — | 若愛德華拍板，calcifer 備齊技術骨架 |
| **4/27 Sun** | 上午 | BL-006 Lab footer 方法論區塊 | `calcifer` | 依霍爾 Part D.2 落 HTML + CSS |
| | 下午 | BL-007 全站 Lab 敘述 + Persona AI 合成標 | `calcifer` | 文案更新 + 小標 badge |
| | 晚上 | BL-006 / BL-007 Gate 1 + Gate 4 | `calcifer` / `markl` | 合併 diff-report v1.3.15 |
| **4/28 Mon** | 上午 | BL-008 Lab confidence score | `calcifer` | Claude prompt 改造，加 High/Medium/Low 輸出 |
| | 下午 | BL-005 Lab 研究結果頁重修：設計意圖 | `witch` | rubric 58 分分析，量化面板 + quote + verdict 方案 |
| | 晚上 | BL-005 Lab 研究結果頁：實裝 | `calcifer` | 依 witch 方案落 code |

### Week 2（4/29 ~ 5/05）—— P1 連攻 + 戰情室開工

| 日期 | Slot | 任務 | Agent | 說明 |
|------|------|------|-------|------|
| **4/29 Tue** | 上午 | BL-005 Gate 1 + Gate 2 + Gate 4 | `calcifer` / `witch` / `markl` | Lab 結果頁截圖確認 58→80+ 分；AC diff-report v1.3.16 |
| | 下午 | BL-010 市場報告重修：設計意圖 | `witch` | 58 分分析，exec summary hero + 風格統一方案 |
| | 晚上 | BL-010 市場報告：實裝 | `calcifer` | 依 witch 方案落 code |
| **4/30 Wed** | 上午 | BL-010 Gate 1 + Gate 2 + Gate 4 | `calcifer` / `witch` / `markl` | 市場報告截圖確認 58→80+ 分；diff-report v1.3.17 |
| | 下午 | BL-015 E 組研究整合校準 | `howl` + `sophie` + `markl` | 三份研究結論彙整，校準 BL-001（戰情室）+ BL-014（DataForSEO）優先序；產校準摘要 |
| | 晚上 | 戰情室前置：BL-001 spec 撰寫 | `howl` | 依 war-room-v3.html mockup v4 + 研究校準結果，產 specs/active/war-room-rewrite.md |
| **5/01 Thu** | 上午 | 戰情室：女巫設計意圖 | `witch` | 10 維度 rubric，確認 mockup v4 所有 UI 元素設計理由 |
| | 下午 | 戰情室 BL-001：Phase 1（資料來源 audit + `renderInsights()` 拆解） | `calcifer` | 分批，先做資料層 + god function 拆解（<50 行 / 批） |
| | 晚上 | 戰情室：Phase 1 Gate 1 + Gate 4（中期檢查點） | `calcifer` / `markl` | 確認資料層乾淨，無 console error |
| **5/02 Fri** | 上午 | 戰情室 BL-001：Phase 2（圖表 UI 實裝） | `calcifer` | 依 BL-002 技術決策，SVG 圖表實裝 |
| | 下午 | 戰情室：Phase 2 Gate 1 + Gate 2 | `calcifer` / `witch` | 截圖確認視覺品質；不通過退回修補 |
| | 晚上 | debug / 視覺修補 / preview 確認 | `calcifer` | 本週交付物實站確認 |
| **5/03 Sat** | 上午 | 戰情室 BL-001：Phase 3（互動 + 空狀態 + 暗色模式） | `calcifer` | hover / fallback / dark mode / mobile 375px |
| | 下午 | 戰情室：Full Gate 1 + Gate 2 + Gate 3 + Gate 4 | all | Gate 3 霍爾確認不超綱；Gate 4 diff-report v1.4.0 |
| **5/04 Sun** | 上午 | 全站收尾：tail grep + 版號確認 + smoke run | `markl` + `calcifer` | `node tests/unit/run-all.js` + smoke playbook |
| | 下午 | （緩衝 / 愛德華視覺審核等待 / 修補） | — | 愛德華實站看過，修小問題 |
| **5/05 Mon** | 上午 | Sprint 收尾復盤 | `markl` | 跑 Gate 4 最終全掃、AC 彙整、learning note |
| | 下午 | 下一輪 sprint 計畫草案（BL-011 + BL-014 決策） | `markl` | 視 E 組研究結論 + 愛德華意見，產 sprint-plan-v2 |

---

## 4. Sprint 驗收標準

### Week 1 Success Criteria（4/22 ~ 4/28）

- [ ] BL-012：`grep -c "<!-- v" app.html` 輸出 ≤ 3；CHANGELOG.md 有對應版本記錄
- [ ] BL-009：`bp_contacts` 記錄有 `type` 欄位；戰情室客戶分佈甜甜圈讀得到資料
- [ ] BL-013：`ops/trigger-email-setup.md` 存在，含 5 步驟 + Firebase Console 操作說明
- [ ] BL-003：問卷引擎結果頁 rubric ≥ 80 分（截圖證據）；`type` 色全換封閉五色（grep 無違憲 hex）
- [ ] BL-004：市場探測結果頁 rubric ≥ 80 分（截圖證據）；有 sparkline + SVG 折線 + verdict
- [ ] BL-006 / BL-007：Lab footer 方法論區塊出現；Persona 卡右上有「AI 合成」標
- [ ] BL-008：Lab 回應 JSON 含 `confidence: "High/Medium/Low"` 欄位

**Gate 4 Checklist（Week 1 整體）：**
- [ ] `node projects/beyondpath/tests/unit/run-all.js` 全 PASS
- [ ] v1.3.13 / v1.3.14 / v1.3.15 diff-report AC ≥ 8 成
- [ ] `versions/v1.3.13.html` ~ `v1.3.15.html` 已建立
- [ ] HTML 尾部 naked text grep PASS（`tail -c 10000 app.html | grep -oE '</html>.*'` 無裸文字）
- [ ] sidebar-version 更新至最新版號

### Week 2 Success Criteria（4/29 ~ 5/05）

- [ ] BL-005：Lab 結果頁 rubric ≥ 80 分（截圖證據）；有量化面板 + quote + verdict
- [ ] BL-010：市場報告 rubric ≥ 80 分（截圖證據）；exec summary hero 存在
- [ ] BL-001：戰情室 `renderInsights()` 拆解完成（god function 不超過 100 行）；圖表全部真 SVG
- [ ] BL-001：戰情室 rubric ≥ 80 分（截圖證據）；暗色模式 + mobile 375px PASS
- [ ] BL-015：校準摘要存在，明確說明 BL-014（DataForSEO）是否進入 next sprint

**Gate 4 Checklist（Week 2 整體）：**
- [ ] `node projects/beyondpath/tests/unit/run-all.js` 全 PASS
- [ ] v1.3.16 / v1.3.17 / v1.4.0 diff-report AC ≥ 8 成
- [ ] `versions/v1.4.0.html` 已建立（戰情室為新模組，MINOR +1）
- [ ] HTML 尾部 naked text grep PASS
- [ ] smoke playbook 至少一條過（戰情室核心路徑）
- [ ] CLAUDE.md 若有更新，已 commit

---

## 5. 給愛德華的「請你拍板 3 件事」

**在城堡出擊前，以下 3 個決策點需要愛德華確認才能啟動：**

**1. 戰情室 UIUX 設計方向 sign off（影響 BL-001 開工時間）**
- 現況：mockup v4 已落 `projects/beyondpath/mockups/war-room-v3.html`
- 需要你：打開 mockup 看一遍，回覆「可以進實裝」或指出哪裡要改
- 影響：4/30 之前沒 sign off，戰情室只能等，Week 2 後半段計畫要挪

**2. 戰情室圖表技術決策（影響 BL-002 + BL-001 架構）**
- 選項 A：純 SVG 自刻（零依賴，BeyondPath 現況技術棧一致，但工時多 +0.5 天）
- 選項 B：引入 Chart.js 45KB（圖表功能強、維護省力，但 app.html 增肥 +45KB，需確認對單檔 SPA 的接受度）
- 建議：若 app.html 已 2.6MB，+45KB 影響不大，建議選 B。但這是你的決定
- 影響：城堡在 4/26 產 PoC benchmark，等你 4/27 前拍板

**3. DataForSEO 真實資料接入是否列入這個月（影響 BL-014）**
- 現況：tech-poc.md 規劃完整，suliman Gate 5 合規審查未啟動
- 需要你：確認是否願意在這個月內開 DataForSEO 帳號、投入 API 費用（估單次 $0.06 / 探測）
- 影響：BL-014 評 H 風險（API 費用 + 合規 + 複雜架構），不拍板則維持 P2，等下季

---

## 6. 2 週後 BeyondPath 的狀態

**版本號：v1.4.0**

**功能交付清單：**

| 功能 | 版本 | 狀態 |
|------|------|------|
| 問卷引擎結果頁（55→80+ 分，甜甜圈 + verdict） | v1.3.13 | 交付 |
| 市場探測結果頁（53→80+ 分，sparkline + SVG 折線 + verdict） | v1.3.14 | 交付 |
| 客戶 type 欄位 + Firebase Trigger Email 指南 + Tail cleanup | v1.3.15 | 交付 |
| Lab 研究：footer 方法論 + 全站敘述 + Persona AI 合成標 + confidence score | v1.3.15 | 交付 |
| Lab 研究結果頁（58→80+ 分，量化面板 + quote + verdict） | v1.3.16 | 交付 |
| 市場報告（58→80+ 分，exec summary hero + 風格統一） | v1.3.17 | 交付 |
| 戰情室 UIUX 全面重寫（god function 拆解 + 真圖表 + 互動）| v1.4.0 | 交付 |

**產品狀態意義：**
Sprint 結束時，BeyondPath 五大 PATH 工具的結果頁全部從「低分裸數字」升級至「圖表 + 敘事 + 可決策」等級；戰情室從 god function 技術債轉為乾淨分層架構 + 視覺呈現達標。對早鳥用戶而言，這是從「能用」到「值得 demo 給別人看」的分水嶺。

**還剩下什麼（下季）：**
- PATH 診斷 radar hover + 歷史趨勢（BL-011，P2）
- DataForSEO 真實資料接入（BL-014，待拍板）
- 首頁融合方案（女巫 B3.5，待下輪排期）
- 收款模組重建（CLAUDE.md 架構圖待評估）
- Vercel preview 三階 pipeline（合作模式 v1 升階目標）

---

*Gate 4 備注：本文件本身不產 diff-report，屬 PM 規劃產出。若愛德華確認計畫，馬魯克將建立 `specs/active/sprint-2026-04-22.md` 作為本輪 sprint 的正式規格錨點。*
