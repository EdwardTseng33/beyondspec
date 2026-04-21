# BeyondPath · 專案資料夾結構（2026-04-21 大整理後）

> **適用**：`C:\Users\Administrator\Claude\Beyond Path\`
> **整理時間**：2026-04-21 深夜
> **整理前**：89 個頂層項目、428MB、混亂度高
> **整理後**：24 個頂層項目、421MB、分層清晰

---

## 🎯 核心原則

1. **根目錄只放「每次部署都用到」的檔案**（app.html / index.html / CLAUDE.md）
2. **所有歷史檔案歸檔到 `_archive/`**（不刪除，保留退路）
3. **跨 session 記憶中心統一在 `projects/beyondpath/`**
4. **退版歷史統一在 `versions/`**
5. **不用到的檔案立刻歸檔或刪除**（不積雜訊）

---

## 📁 根目錄內容（24 項）

### Core 核心（每次部署用到）
| 項目 | 大小 | 用途 |
|------|------|------|
| `app.html` | 2.6 MB | 系統本體（31,172 行，部署到 /path/app/）|
| `index.html` | 51 KB | Landing page（908 行，部署到 /path/）|
| `CLAUDE.md` | 31 KB | 專案憲法（部署 SOP + 設計規則 + 部署憲法 D-1~D-6）|
| `favicon.png` / `favicon.ico` / `apple-touch-icon.png` | <3 KB | Landing 圖示 |

### Claude Integration 相關
| 項目 | 用途 |
|------|------|
| `beyondpath.plugin` | Claude 插件定義 |
| `beyondpath-eval.skill` | PATH 評估 Skill |
| `moving-castle.skill` | 移動城堡 Skill |

### 主要子資料夾（活躍使用）

| 資料夾 | 大小 | 用途 | 狀態 |
|-------|------|------|------|
| **`projects/beyondpath/`** | 804 KB | 跨 session 記憶中心（STATUS/research/ops/specs/tests/mockups/CHANGELOG）| 🔥 核心活躍 |
| **`versions/`** | 338 MB | 所有版本 HTML snapshot（v0.x → v1.3.19，155 個）| 🔒 退版保險 |
| **`scripts/`** | 128 KB | `push-prod.sh`（五層 guard）+ 輔助工具 | 🔥 核心活躍 |
| **`ai-proxy/`** | 21 KB | Cloudflare Worker（Claude API 代理 source）| 🔥 核心活躍 |
| `mockups/` | 164 KB | 戰情室 v3 / Honeybook 等設計原型 | 🟡 參考用 |
| `docs/` | 88 KB | 補充文件 | 🟡 參考用 |

### Landing Page 依賴
| 資料夾 | 大小 | 用途 |
|-------|------|------|
| `css/` | 56 KB | Landing CSS |
| `js/` | 76 KB | Landing JS |
| `logo/` | 8 KB | Logo 資產 |
| `assets/` | 4 KB | Landing 其他資產 |

### 獨立工具 / 備用部署
| 資料夾 | 大小 | 用途 |
|-------|------|------|
| `beyondpath-eval/` | 76 KB | PATH 評估 Skill 本體 |
| `beyondpath-eval-workspace/` | 428 KB | Skill workspace |
| `beyondpath-mcp/` | 55 MB | MCP server（包含 Beyond Path 相關 servers/skills）|
| `deploy/` | 2.5 MB | Vercel 備用部署目錄（主力走 GitHub Pages，現極少用）|

### 歸檔
| 資料夾 | 大小 | 內容 |
|-------|------|------|
| **`_archive/`** | 21 MB | 所有歷史檔案（見下方細分）|

---

## 📦 `_archive/` 結構

| 子資料夾 | 大小 | 內容 | 保留原因 |
|---------|------|------|---------|
| `bak-files/` | 15 MB | 14 個 app.html 舊備份（`.bak` / `.pre-*` / `.backup-*` / `_landing_*` 等）| 退版用 versions/ 已足，但保留以防 |
| `historical-docs/` | 196 KB | 12 份 2026-03 策略文件（Roadmap-v2.docx / PATH-v2-Strategy.docx / 7 份產品診斷 md + PRODUCT-CORE / DESIGN-SYSTEM / module-dependency-map 等）| 歷史策略知識，可追溯 |
| `legacy-html/` | 1.3 MB | 9 個早期獨立原型 HTML（audience-lab / beyondpath-eval-review / beyondpath-ops-strategy / beyondspec-pricing-analysis / debug-biz / diagnose / index-legacy / lab / test-biz）| 早期原型，已整合進 app.html |
| `legacy-images/` | 3.9 MB | 角色插圖（人物.png 系列）+ test/gate1 截圖 + 未使用的 og-image/banner-bg/screenshot-* | 圖片資產保留，不刪 |
| `obsolete-subdirs/` | 776 KB | `memory/`（舊 memory 系統，已由 projects/beyondpath/ 取代）+ `平台元素/`（3 月截圖）+ `website-patch/`（3 月 DEPLOY-GUIDE）| 子系統已汰換 |

---

## 🗑 已刪除（真垃圾，不可救）

這些檔案**直接 rm**，不進 _archive：
- `test.html`（40 bytes）
- `test_write.txt`（0 bytes 空檔）
- `versions/v3.07.html` / `versions/v3.08.html`（錯誤版號，不對應 v0.x / v1.x 語意）
- `versions/v1.0.8.html.phase0-misplaced-bak`
- `audience-lab.html.tmp.23754.1773994735540`（系統 temp 檔）
- `index.html.y-lite-draft-20260419`（過期 draft）
- `lab.html.original-backup`（lab 模組遷移前備份）

---

## 🧭 下個 Session 快速上手

```
1. Read projects/beyondpath/STATUS.md     → 跨 session 當前狀態
2. Read CLAUDE.md                         → 專案憲法（設計+部署 SOP）
3. Read projects/beyondpath/ops/folder-structure.md  → 本檔（資料夾地圖）
4. 任何開發動刀前先 git log --oneline     → 確認 prod 最新狀態
```

### 活躍開發只碰這些：
- `app.html` / `index.html` / `CLAUDE.md`（頂層 3 核心）
- `projects/beyondpath/` 底下所有（記憶中心）
- `scripts/push-prod.sh`（部署唯一入口）
- `versions/vX.Y.Z.html`（每次部署前 snapshot）

### 絕對不碰 `_archive/`
除非：
1. 需要考古（查歷史策略、早期實作）
2. 退版到 v1.0.x 以前（用 `_archive/bak-files/`）
其他情況 `_archive/` 唯讀。

---

## 🛡 維護規則（新增）

1. **根目錄不加新檔案**：需要新資料先問「這該放 projects/ / scripts/ / _archive/ 哪邊？」
2. **.bak 檔直接進 `_archive/bak-files/`**：不准疊在根目錄
3. **臨時 test HTML**：放 `_archive/legacy-html/` 或 `mockups/`
4. **每月一次小整理**：檢查 `_archive/` 容量，超過 50MB 考慮壓縮或清除非必要歷史
5. **versions/ 的語意版號強制性**：只收 `v[0-9]+\.[0-9]+\.[0-9]+\.html`，其他命名禁止

---

## 📊 整理成果

| 指標 | 整理前 | 整理後 | Delta |
|------|-------|-------|-------|
| 頂層項目 | 89 | 24 | -73% |
| 根目錄總檔案 | ~60 (含雜散 .bak/.html/.md/.docx/.png) | 8（core + skill）| -87% |
| 整體大小 | 428 MB | 421 MB | -7 MB（不大，主因是移不是刪）|
| 混亂度 | 高（新舊混雜）| 低（分層清晰）| ✅ |
| 退版可靠性 | 中（.bak 散落）| 高（versions/ 集中 + _archive/bak-files/ 備份）| ✅ |

---

*建立日期：2026-04-21 深夜 · 作者：蘇菲（整理後文件化）*
