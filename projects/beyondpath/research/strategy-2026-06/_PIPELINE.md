# BeyondSpec 產品策略 · 完整 Pipeline 與進度（跨 session 接棒用）

> 交辦：Edward 2026-06-20 00:40（凌晨）
> 主責：主對話蘇菲（worktree: clever-noether-f45dec · E 槽）
> 用途：這條鏈多步、含 background agent + 跨 agent 審查，若 session 斷，下個 session 讀此檔接棒。

## 任務全貌
為**現在的 BeyondSpec SaaS 產品**（非舊顧問業務）制定完整 BU / 產品 / 市場策略，過兩輪審查後，用策略重新設計落地頁架構與內容（與行銷策略對焦）。

軸心 = Edward 親述核心競爭力：1-3 人 AI native 小團隊、AI 降低產品開發成本＋人力成本、快速應變市場、更低負擔輔助中小企業/新創、更多模組/更快更版/更快客製。

## 完整 Pipeline（5 步）
1. **城堡三人深調研**（background 進行中）
   - 霍爾 `a62920710b883791f` → 競品全景＋定位＋護城河 → `strategy-2026-06/competitive-positioning.md`
   - 蘇菲組 `a4c36a37d3ab1fa08` → 商業模式＋定價＋GTM → `strategy-2026-06/business-model-pricing-gtm.md`
   - 蕪菁頭 `a5ab1f4b62ea641f7` → 客戶輪廓＋痛點＋核心價值 → `strategy-2026-06/customer-pain-value.md`
2. **蘇菲整合**三份 → 策略初稿（BU / 產品 / 市場三大塊，含 9 子項：核心價值、客戶輪廓、痛點、市場定位、產品定位、主競業、次競業、商業模式、定價）
3. **Codex 霍爾審盲點**：透過 Slack #項目討論-agent（C0B3N24J5CG）發給 Hub 端霍爾，請他挑「高價值/高品質策略的盲點 + 我們沒看到的可參考洞見」。發訊用 sophie-post.py（不冒用 Edward 帳號）。
4. **整合兩邊** → 最終策略書（城堡視角 + Codex 霍爾第二意見）
5. **重新設計落地頁架構＋模板內容**：用最終策略，重做 landing-v2.html 的資訊架構與內容，確認與行銷策略對焦。

## 當前進度
- [x] 盤點既有資產（舊 SSOT=顧問業務不用；research/ 3 份 4 月 deep-dive=肩膀；收款模組 AR 研究）
- [x] landing-v2.html 第一版設計做好（hero 定調驗證 OK，等 Edward 視覺回饋）— 注意：Step 5 會依策略再重構此檔架構
- [x] Step 1 三 agent 完成（霍爾/蘇菲組自存、蕪菁頭無 Write 工具由蘇菲代存）
- [x] Step 2 整合初稿 → BeyondSpec-strategy-v1-draft.md（含 6 個待審盲點）
- [x] **Step 3 改用 codex CLI 審**（Slack 被擋，Edward 授權改 CLI 路徑）→ codex.exe exec gpt-5.5 high reasoning → codex-strategy-review.md（犀利：「產品完整 ≠ 策略銳利」、定位太大、PATH 不該放第一屏、缺高價錨點、wedge 是付款結構、營運真相層才是金礦）
- [x] **Step 4 整合兩邊** → BeyondSpec-strategy-v2-FINAL.md（codex 升級幾乎全採納）
- [x] **Step 5 落地頁重設計** → landing-v3.html（主打把錢收回來/應收款真相/付款結構痛點/營運真相層/驗證降第二層/高價錨點/信任段；hero+真相層+定價 截圖驗證通過、結構全對）
- [⏳] **上線待命**：landing-v3 驗證過、可上線；但 (1) 缺 GITHUB_PAT (2) 待 Edward 過目「滿意」。**蘇菲不擅自覆蓋 index.html / 不 push prod**（理由：Edward 要「令我滿意」=保留驗收 + 深夜推正式站 D-4 謹慎 + v1.0.8「我覺得好≠他滿意」退版教訓）。Edward 醒來看 landing-v3 → 滿意給 PAT/按一下即上線。預覽：http://localhost:8899/landing-v3.html

## Step 3 待審材料（不論走 A/B/C 都用這 6 點）
1. 定位 B+A+C 三層會不會稀釋焦點？該不該更狠 all-in 一層？
2. 499/999 是否把品牌定太低、自我商品化、招來低留存用戶？該不該留高價錨點？
3. 先打行銷代理商+設計工作室是「最舒服」還是「最對」？有沒有更被低估該先打的縫？
4. 「3 人團隊」放前台，信任度風險 vs 共鳴收益淨值正不正？
5. SaaSpocalypse 的 per-outcome 演化是 3 年後還是現在就該動？速度有沒有低估？
6. 有沒有完全漏掉但對高價值產品關鍵的維度（留存/NRR、網路效應、資料飛輪、出海、合規資安）？

## 接棒提示
若 background agent 已完成但此 session 未整合：讀 `strategy-2026-06/` 下三份產出 → 從 Step 2 接續。
