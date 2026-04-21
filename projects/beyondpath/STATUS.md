# BeyondPath · 專案狀態 Hub（跨 session persistent state）

> **用途**：每個 Claude conversation window 都有 context 限制，這個檔案是**跨對話的進度記憶 single source of truth**。
> **規則**：每次 session 關鍵進度 / 決策 / 版本推送後，愛德華或主對話蘇菲要**更新此檔 + git commit**，下個 session 開頭 `Read STATUS.md` 就能完整 pick up。
> **上次更新**：2026-04-21 深夜（v1.3.19 三合一 hotfix · 連鎖事故救火完成 + 部署憲法升級）

---

## 🚦 當前 Prod 狀態

| 項目 | 值 |
|------|-----|
| **prod 版本** | v1.3.19（sidebar badge）|
| **最新 commit** | `7989772` v1.3.19 hotfix · 戰情室白屏 + 登出踢錯頁 + landing 被覆蓋 三合一修復 |
| **最新里程碑** | 部署憲法升級：`scripts/push-prod.sh` 五層 guard + CLAUDE.md 新增 D-1~D-6 條款 |
| **repo** | github.com/EdwardTseng33/beyondspec |
| **部署** | GitHub Pages · https://beyondspec.tw/path/ |
| **Firebase project** | beyond-business-ca9da（Auth + Firestore enabled）|
| **早鳥申請後端** | Firebase Firestore `applications` collection + app 內 `/admin` 申請管理頁（僅 edwardt0303@gmail.com 可見）|

---

## 📂 跨 Session 記憶的所有儲存點

這是目前 BeyondPath 所有「持續性記憶」的完整地圖——下個 session 有這些 reference 可以無縫接上：

### 全局規則 / 憲法層
| 檔案 | 內容 | 頻率 |
|------|------|------|
| `C:\Users\Administrator\.claude\CLAUDE.md` | User-level 全域指令：城堡系統、7 人 subagent 分工、Delivery Gates、設計偏好、Opus 4.7 風格政策、雙軌工時、合作模式 | 憲法級，改動需謹慎 |
| `projects/beyondpath/CLAUDE.md`（若存在）| Project-level：PATH Header Spec、Kanban 架構、HTML 尾部 comment 規則、封閉五色、設計原則 checklist | 憲法級 |
| `projects/beyondpath/CHANGELOG.md` | 已搬出 HTML tail 的舊版本 changelog 歸檔 | 每次 tail cleanup 新增 |

### 研究報告（深度知識）
| 檔案 | 內容 |
|------|------|
| `projects/beyondpath/research/market-deep-dive.md` | Sophie · TAM/SAM/SOM + 5 segment + PMF 門檻 + 3 商業決策 |
| `projects/beyondpath/research/competitive-deep-dive.md` | Howl · 3 圈競品矩陣 + 護城河 5 條 + 戰術 + 3 競爭決策 |
| `projects/beyondpath/research/user-deep-dive.md` | Turnip · 5 persona + JTBD + Journey + 10 痛點 + 3 用戶決策 |
| `projects/beyondpath/research/backlog-sprint-plan.md` | Markl · 全 backlog + P0/P1/P2 + 2 週 sprint day-by-day |
| `projects/beyondpath/research/design-reference-maze.md` | Witch · Maze.co 設計 DNA + BeyondPath 對照 + 5 Action |
| `projects/beyondpath/research/market-signal-positioning.md` | Howl · 市場探測定位 memo（台灣三層訊號）|
| `projects/beyondpath/research/market-signal-tech-poc.md` | Calcifer · DataForSEO 接入技術 PoC |
| `projects/beyondpath/research/market-signal-compliance.md` | Suliman · Gate 5 合規審查（DataForSEO + 爬蟲）|
| `projects/beyondpath/research/lab-research-competitive-framing.md` | Howl · Lab 合成訪談誠實度 framing + Synthetic Users 對標 |
| `projects/beyondpath/research/platform-diagnosis-tech.md` | Calcifer · 五工具 AI 接入診斷 |
| `projects/beyondpath/research/platform-diagnosis-visual.md` | Witch · 10 維 rubric 評分 + 設計提案 |
| `projects/beyondpath/research/platform-diagnosis-strategy.md` | Howl · 五工具洞察 + 戰情室策略 + 首頁定位 |
| `projects/beyondpath/research/platform-diagnosis-ux.md` | Turnip · 決策閉環 + 首頁訊息矛盾 + 空狀態 UX |
| `projects/beyondpath/research/report-upgrade-visual.md` | 女巫 · 三報告 10 維 rubric 視覺評分（市場 58 / Lab 62 / PATH 83）+ P0/P1/P2 Actions |
| `projects/beyondpath/research/report-upgrade-content.md` | 霍爾 · 內容深度三層框架（表層/中層/深層）+ 對標 Maze/Dovetail/Productboard |
| `projects/beyondpath/research/report-upgrade-ux.md` | 蕪菁頭 · 5 persona × 3 報告 情緒曲線 + Math.random 信任風險 + Step A 引導 |
| `projects/beyondpath/research/report-upgrade-tech.md` | 卡西法 · 技術債盤點 + 3 投資分級（Quick Win / Foundation / Future Bet）|
| `projects/beyondpath/research/report-upgrade-roadmap.md` | 蘇菲 · 四視角整合路線圖 + 2 週 sprint plan + Edward 待拍板 3 件 |

### Mockup / Design 原型
| 檔案 | 內容 |
|------|------|
| `projects/beyondpath/mockups/war-room-v3.html` | 戰情室 v4 mockup（Honeybook-inspired + 去漸層 + 資料源 audit 表）· https://beyondspec.tw/path/mockups/war-room-v3.html |

### 版本快照
| 位置 | 內容 |
|------|------|
| `versions/v1.X.Y.html` | 每次 push prod 前 backup app.html 原檔（可退版）|
| `app.html` HTML tail `<!-- v1.X.Y · ... -->` | 最新 3 版（熱區）changelog comment |
| Git commit history | 每次 push 含詳細 commit message + co-author 標記 |

### Operational
| 檔案 | 內容 |
|------|------|
| `projects/beyondpath/ops/apply-form-setup.md`（可能存在）| 早鳥申請 Apps Script 設定指南（legacy，現已改 Firestore）|

### Session 進度（此檔）
| 檔案 | 內容 |
|------|------|
| `projects/beyondpath/STATUS.md` ← **就是這份** | 當前 backlog / 當前 blocking / 最近進度 / 跨 session 交接 |

### Agent IDs（可 SendMessage 續）
今晚派過的 subagent（短期內可 continue；幾小時後可能失效，失效後 cold-start）：

| Agent | ID | 任務 |
|-------|-----|------|
| Sophie | `a0c441914a910891d` | 深度市場研究 |
| Howl | `aa4031605c7c192f8` | 深度競業研究 |
| Turnip | `a2a4f32c6dd4b248c` | 深度用戶調研 |
| Markl | `ad13abbe7a8bad82b` | Backlog sprint plan |
| Witch | `afbcead3e75466875` | Maze.co 設計 DNA |

---

## 🎯 當前 Backlog（P0 先做）

**愛德華待拍板 5 件（v1.3.18 後新增 2 件）**：
1. **戰情室 mockup v4 sign-off**（看完 https://beyondspec.tw/path/mockups/war-room-v3.html → 「OK 實裝」或「X 要改」）
2. **Chart.js 引入 vs 純 SVG**（v1.4 大工程決策）
3. **DataForSEO 真實資料接入**要不要這個月投入（H 風險，Markl 建議列 P2）
4. **🆕 是否啟動 2 週 report upgrade sprint**（Y/N）— 詳見 `research/report-upgrade-roadmap.md`
5. **🆕 `renderFullReport` 475 行 god function 重構**（16h · 重構期間無新 feature）Y/N

**不需愛德華拍板的 P0**：
- ✅ ~~BL-012 Tail cleanup~~（v1.3.14 完成：26 條搬進 CHANGELOG.md）
- ✅ ~~BL-013 Firebase Trigger Email 指南~~（v1.3.14：`projects/beyondpath/ops/trigger-email-setup.md`）
- ✅ ~~BL-003 問卷結果頁 P0 重修~~（v1.3.15：55 → 82，移除 Math.random 假分 + hero verdict + 4 ring）
- ✅ ~~BL-004 市場探測結果頁 P0 重修~~（v1.3.16：53 → 82，hero verdict + 12 月 sparkline + CPC benchmark bar + 真 SVG 折線）
- ✅ ~~Lab CAVEAT 升級~~（v1.3.13 霍爾 D.2 三段結構落地）
- ✅ ~~Witch Action 1+2+5~~（v1.3.13 display 字階 + section-scale spacing + `.card-editorial` + `.l-section` token）

**剩餘未做**：
- BL-009 客戶 `bp_contacts.type` schema 擴充（戰情室客戶分佈前置，下輪做）
- Lab 全站敘述更新（landing / 定價 / 模組入口散點中庸版同步）
- Lab persona 卡片右上角「AI 合成」小標
- Lab confidence score Claude prompt 擴充

---

## 📜 今晚（2026-04-21）重大進度

### 推了 30 版（v1.1.1 → v1.3.16）
見 Git log + HTML tail changelog。關鍵里程碑：
- **v1.1.2** Routing fix（登入/登出 /path/ vs /path/app/ 錯亂根治）
- **v1.1.3** P0 信任修復（`closeRate 0%` rose → slate「—」）+ 11 憲法色清理
- **v1.2.0** Lab 誠實 badge + **AI 儀表板 → 營運戰情室改名**（Q2 拍板）
- **v1.2.1** `/path/app/?login=1` 徹底廢除（登入搬回 /path/）
- **v1.2.2** 首頁今日聚焦 + 本週脈搏（Q3 融合）
- **v1.2.3** 首頁近期動態移除（愛德華回報被報告壓掉）
- **v1.3.0–v1.3.4** 登入閃頻 ROOT-CAUSE 5 輪 debug（最終修好）
- **v1.3.5** 任務看板寬模式 5 欄顯示
- **v1.3.6** app 內 upgrade CTA → landing apply modal
- **v1.3.7** 表單白屏修復
- **v1.3.9** 早鳥申請改 Firebase Firestore 直寫（移 FormSubmit.co 第三方）
- **v1.3.10** 首頁報告 card 點擊 open full report（snapshot + openSavedReport）
- **v1.3.11** app 內 /admin 申請管理頁（Edward-only）
- **v1.3.12** PATH CTA 文案對齊 Q1
- **v1.3.13** Witch 設計 token 擴充（display 字階/section spacing/font-serif fallback/.card-editorial）+ Lab CAVEAT 霍爾 D.2 三段結構
- **v1.3.14** Tail cleanup（26 條搬 CHANGELOG.md）+ Firebase Trigger Email 指南
- **v1.3.15** 問卷結果頁 P0 重修（55→82，移 Math.random 假分 + hero verdict + 4 ring）
- **v1.3.16** 市場探測結果頁 P0 重修（53→82，hero verdict + sparkline + CPC benchmark + 真 SVG 折線）
- **v1.3.17** 營運戰情室視覺升級 Batch 1（Hero 今日戰情卡 + 3 mini KPI · Maze-inspired）
- **v1.3.18** 信任救火 · Math.random 造假數據清零 + 競品矩陣 AI badge（P3 坤書型信任風險根除）
- **v1.3.19** 三合一 hotfix · (A) renderInsights var hoisting 修復（戰情室白屏）+ (B) `../` → `/path/` 絕對路徑（登出踢錯頁）+ (C) landing 真本復原（被 app.html 覆蓋）+ `push-prod.sh` 五層 guard

### 🔥 v1.3.17-19 連鎖事故（2026-04-21 深夜）
三個 bug 一次暴露：(1) 戰情室白屏 TypeError；(2) landing 被 app.html 覆蓋 2.6MB；(3) 登出跳到規格外工作室根域。根因：v1.3.17 `var` hoisting 陷阱 + v1.3.18 我繞過 `push-prod.sh` 手動 cp 誤覆蓋。後果：愛德華信任損耗 + 1.5h hotfix。

**憲法升級成果**：
- `CLAUDE.md` 新增**部署憲法 D-1~D-6**（詳見主檔 [部署憲法] 章節）
- `scripts/push-prod.sh` 強化 5 層 guard（App 正向檢查 / App 大小 / Landing 正向 / Landing 大小 / Post-deploy sanity）
- Post-mortem 落檔：`projects/beyondpath/ops/postmortem-v1.3.17-to-v1.3.19-chain.md`（完整連鎖事件分析）

### 產了 4 份深度研究 + 1 份設計參考
見 research/ 目錄。

### 拍板 3 Q
- Q1：**Lab 走合成主軸（C）** + 三道誠實護欄（badge / 方法論 footer / confidence）
- Q2：**「營運戰情室」**（改名完成；UIUX 等實裝）
- Q3：**陪伴型中性語氣**（首頁融合今日聚焦 + 戰情 hero 生成不準先不上）

---

## 🔗 下個 Session 如何快速 pick up

```
1. Read STATUS.md（此檔）5 分鐘掌握全局
2. Read projects/beyondpath/research/backlog-sprint-plan.md 看 Markl 排序
3. Git log --oneline | head -30 看最近 commit
4. 檢查愛德華是否已拍板 3 件待決事項（看他對話輸入）
5. 按 Markl sprint plan 跑 P0 backlog
```

---

## 📌 維護規則

**何時更新此檔**：
- 每次推完一批 prod version（推薦 3-5 版合併更新一次）
- 每次有重大拍板（Q1/Q2/Q3 級策略決議）
- 每次 agent 交付新研究報告
- 每次 session 結束前（「下個 Claude 要知道什麼」）

**誰更新**：
- 主對話蘇菲（每次重大進度後）
- 馬魯克（Gate 4 交付時）
- 愛德華手動補（非城堡動作的決策）

**更新儀式**：
1. Edit 此檔
2. `git add projects/beyondpath/STATUS.md`
3. Commit message 用「docs: STATUS update · [進度摘要]」
4. Push

*此檔建立於 2026-04-21，回應愛德華「跨對話進度記憶存哪裡」的提問。*
