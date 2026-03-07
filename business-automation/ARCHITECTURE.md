# 🏰 Beyond Spec 產品架構與部署總覽

> 馬魯克整理 · 最後更新：2026-03-01 · Dashboard v5.3

---

## 一、產品全景

Beyond Spec 目前有兩個線上產品，共用同一個 GitHub repo 部署：

| 產品 | 網址 | 用途 | 狀態 |
|------|------|------|------|
| 官方網站 | `beyondspec.tw` | 品牌形象 + 客戶進件 | ✅ 已上線 |
| 移動城堡指揮部 | `beyondspec.tw/business/` | 內部業務管理 Dashboard | 🟡 待部署 |

---

## 二、託管與部署

### 2.1 GitHub Pages

- **GitHub 帳號**：`EdwardTseng33`
- **Repo**：`EdwardTseng33/beyondspec`
- **Branch**：`main`
- **CNAME**：`beyondspec.tw`（repo 根目錄有 `CNAME` 檔案）
- **DNS**：GoDaddy（`ns11/ns12.domaincontrol.com`），`www` CNAME → `edwardtseng33.github.io`

### 2.2 Repo 檔案結構

```
EdwardTseng33/beyondspec/          ← GitHub repo（main branch）
│
├── CNAME                          ← beyondspec.tw
├── index.html                     ← 官方網站首頁（140KB，純靜態 HTML）
├── robots.txt
├── sitemap.xml
├── og-image.png
├── favicon.ico / favicon-*.png
├── apple-touch-icon.png
├── android-chrome-*.png
│
└── business/                      ← 【待新增】Dashboard 子目錄
    └── index.html                 ← 移動城堡指揮部（111KB，React SPA）
```

### 2.3 更新流程

```bash
# 在本地的 beyondspec repo 資料夾裡
git pull                                      # 先拉最新
cp /新檔案路徑/index.html ./business/         # 覆蓋 Dashboard HTML
git add business/index.html
git commit -m "update: Dashboard vX.X"
git push                                      # 推上 GitHub
# → 1~2 分鐘後 GitHub Pages 自動部署完成
```

---

## 三、應用程式架構

### 3.1 官方網站（`beyondspec.tw`）

```
┌─────────────────────────────────────────┐
│  index.html — 純靜態單頁                  │
│  ├── HTML + inline CSS + vanilla JS      │
│  ├── 動畫：Intersection Observer reveal  │
│  ├── RWD：CSS Grid + media queries       │
│  └── CTA → Google Form（待填入連結）      │
└─────────────────────────────────────────┘
```

- **技術**：純 HTML/CSS/JS，無框架、無打包工具
- **字體**：Google Fonts（Noto Sans TC、Outfit）
- **SEO**：有 `sitemap.xml`、`robots.txt`、OG Image
- **待辦**：`GOOGLE_FORM_URL_HERE` placeholder 需替換為實際 Google Form 連結

### 3.2 移動城堡指揮部（`beyondspec.tw/business/`）

```
┌─────────────────────────────────────────────────┐
│  business/index.html — React SPA（單檔）          │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │  前端 Runtime                                │ │
│  │  ├── React 18（CDN UMD）                     │ │
│  │  ├── Babel Standalone（瀏覽器端 JSX 編譯）    │ │
│  │  ├── Google Sign-In SDK                      │ │
│  │  └── Google Fonts                            │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │  資料層                                       │ │
│  │  ├── localStorage（離線優先，預設模式）        │ │
│  │  │   key prefix: castle_deals / tasks / leads │ │
│  │  │                                            │ │
│  │  ├── Google Sign-In JWT（登入驗證）           │ │
│  │  │   → 解碼 payload 取 email/name/picture     │ │
│  │  │                                            │ │
│  │  └── Google Sheets API（雲端同步，選用）      │ │
│  │      ↕ fetch GET/POST                         │ │
│  │      Google Apps Script Web App               │ │
│  │      ↕ read/write                             │ │
│  │      Google Spreadsheet（資料庫）             │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

#### 功能模組

| 模組 | 說明 | Tab |
|------|------|-----|
| 📊 業務漏斗 | Kanban 看板，6 階段追蹤案件（洽詢→簽約/未成案） | pipeline |
| 📋 任務看板 | 待辦/進行中/已完成，優先級 + 角色篩選 | tasks |
| 🎯 BD 開發 | 潛在客戶追蹤，7 階段暖身漏斗 | bd |
| 📈 數據分析 | 月/季/年目標達成度 + 案件速度分析 | analytics |
| 📁 文件資源 | 合約、提案、報告範本快速存取 | docs |
| 👥 角色管理 | 城堡五人角色設定 + 自訂角色 | roles |
| ⌘K 指令面板 | 快捷操作，跳轉 / 新增 / 匯出 | overlay |
| 📜 活動紀錄 | 所有操作的即時 log | sidebar |

#### 北極星指標（v5.3）

| # | 指標 | 計算公式 | 說明 |
|---|------|----------|------|
| 1 | 🎉 已簽約營收 ⭐ | `SUM(won deals value)` | 終極指標 |
| 2 | 🏆 贏單率 | `won / (won + lost)` | 僅計算已結案案件 |
| 3 | 📊 加權管線值 | `Σ(value × stageWeight)` | 洽詢10% 探索25% 提案50% 議價75% |
| 4 | ⏱ 成交週期 | `AVG(signedDate - created)` for won deals | 洽詢→簽約平均天數 |

#### 互動設計模式

| 元件 | 模式 | 說明 |
|------|------|------|
| DetailDrawer | Slide-over panel | 右側滑入，backdrop blur，Escape 關閉 |
| 案件編輯 | Drawer 內 inline edit | 點「✏️ 編輯」→ Drawer 原地切換為表單，不跳 Modal |
| 階段切換 | Pill buttons in Drawer | 檢視/編輯模式都能一鍵切階段 |
| 封存 | Soft-delete + Undo Toast | 5 秒內可復原 |
| 搜尋 | SearchBar + FilterPills | 即時篩選 + 角色/優先級 filter |

#### 關鍵技術細節

- **React 元件**：全部寫在單一 JSX 檔（`castle-dashboard.jsx`，~1750 行）
- **樣式**：inline styles（無 CSS 模組），色彩系統由 `C` 物件管理
- **RWD**：`useWindowSize` hook（mobile < 640, tablet < 1024, desktop ≥ 1024）
- **持久化**：`usePersisted` hook = `useState` + `localStorage` auto-save
- **動畫**：CSS keyframes（`drawerSlideIn`, `drawerFadeIn`, `fadeSlideIn`）
- **安全性**：`<meta name="robots" content="noindex, nofollow">`
- **CDN 依賴**：React 18 UMD、Babel Standalone、Google Sign-In SDK、Google Fonts

---

## 四、後端服務

### 4.1 Google Apps Script — CRM API（`castle-api.gs`）

```
Google Sheets                        Google Apps Script Web App
┌───────────────────────┐           ┌──────────────────────────────┐
│ Spreadsheet           │           │                              │
│ ├── deals    (14 欄)  │◄─────────│  doGet()   → getAll / ping  │
│ ├── tasks    (9 欄)   │           │  doPost()  → CRUD ops       │
│ ├── leads    (11 欄)  │           │                              │
│ └── users    (5 欄)   │           │  多租戶隔離：userId 欄位     │
└───────────────────────┘           └──────────────────────────────┘
```

- **部署**：Google Apps Script → Web App（anyone with Google account）
- **驗證**：前端 Google Sign-In JWT → email 當 userId
- **CRUD**：addDeal / updateDeal / archiveDeal（同理 tasks/leads）
- **批量同步**：`syncAll` action（離線 → 雲端整包上傳）
- **狀態**：🟡 尚未部署（需設定 Spreadsheet ID）

### 4.2 Google Apps Script — Auto-Reply（`auto-reply.gs`）

```
Google Form 提交
    ↓ onFormSubmit trigger
auto-reply.gs
    ↓ 讀取表單欄位
GmailApp.sendEmail()
    ↓ 感謝信 + 預約連結
客戶收到 email
```

- **觸發**：Google Form 提交 → `onFormSubmit` trigger
- **功能**：自動寄送品牌化感謝信 HTML email + Google Calendar 預約連結
- **設定**：`CONFIG` 物件定義品牌名、寄件人、欄位對應、預約連結
- **狀態**：🟡 需設定實際 `bookingUrl` 和 Google Form 欄位名稱

---

## 五、開發檔案對照表

| 檔案 | 路徑 | 用途 | 部署位置 |
|------|------|------|----------|
| `index.html` | `/` | 官網首頁 | GitHub Pages 根目錄 |
| `business/index.html` | `/business/` | Dashboard（standalone） | GitHub Pages `/business/` |
| `castle-dashboard.jsx` | `/business-automation/` | Dashboard React 原始碼 | 不部署（開發用） |
| `castle-api.gs` | `/business-automation/` | CRM API 後端 | Google Apps Script |
| `auto-reply.gs` | `/business-automation/` | 自動回覆系統 | Google Apps Script |
| `DEPLOY-GUIDE.md` | `/business-automation/` | 部署步驟指南 | 不部署（內部文件） |
| `ARCHITECTURE.md` | `/business-automation/` | 本文件 | 不部署（內部文件） |

---

## 六、待辦設定值（Placeholder 清單）

上線前需替換的值：

| Placeholder | 所在檔案 | 說明 |
|-------------|----------|------|
| `API_URL = ""` | `business/index.html`、`castle-dashboard.jsx` | Google Apps Script Web App URL |
| `GOOGLE_CLIENT_ID = ""` | 同上 | Google OAuth Client ID |
| `YOUR_SPREADSHEET_ID_HERE` | `castle-api.gs` | Google Sheets ID |
| `GOOGLE_FORM_URL_HERE` | `index.html`（官網） | 洽詢表單連結 |
| `bookingUrl: '...'` | `auto-reply.gs` | Google Calendar 預約連結 |

> **注意**：Dashboard 不填 API_URL 和 GOOGLE_CLIENT_ID 也能正常運作（離線模式，localStorage only）。雲端同步功能只有在填入後才會啟用。

---

## 七、版本歷程

| 版本 | 日期 | 重點 |
|------|------|------|
| v4.2 | 2026-02-28 | 字體放大、UI 精緻化、卡片展開、全寬佈局、數據分析、文件資源 |
| v5.0 | 2026-02-28 | Route C 架構（localStorage + Google Sheets API）、登入、雲端同步 |
| v5.2 | 2026-02-28 | DetailDrawer slide-over panel、所有 View 改用 Drawer |
| v5.3 | 2026-03-01 | 北極星指標修正（贏單率 + 成交週期）、Drawer 內 inline 編輯 |
