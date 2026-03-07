# 🏰 移動城堡指揮部 — GitHub Pages 部署指南

> 你的網站：`beyondspec.tw` → GitHub Pages（`edwardtseng33.github.io`）

---

## 🚀 快速部署（5 分鐘）

Dashboard 不需要後端就能運作（資料存在瀏覽器 localStorage），所以可以先上線再慢慢接雲端。

### Step 1：找到你的 repo

在你的電腦上找到 `beyondspec` 這個 repo 的本地資料夾。
打開終端機（Terminal），`cd` 進去：

```bash
cd ~/你的路徑/beyondspec
```

確認你在對的地方：

```bash
git remote -v
# 應該會看到 github.com:EdwardTseng33/beyondspec.git
```

### Step 2：建立 business 資料夾

```bash
mkdir -p business
```

### Step 3：複製 Dashboard HTML

把 `business/index.html` 複製到 repo 裡的 `business/` 資料夾。

你可以：
- 直接從這個工作資料夾的 `business/index.html` 拖過去
- 或用指令：

```bash
cp /你下載的路徑/business/index.html ./business/index.html
```

### Step 4：推上 GitHub

```bash
git add business/index.html
git commit -m "feat: add 移動城堡指揮部 Dashboard v5.3"
git push
```

### Step 5：等 1~2 分鐘，打開看

```
https://www.beyondspec.tw/business/
```

完成！Dashboard 已上線，資料存在你的瀏覽器裡。

---

## ☁️ 進階：接上雲端同步（選做）

如果你想要跨裝置同步資料、多人使用，才需要做以下步驟。

### A. 建立 Google Spreadsheet（資料庫）

1. 開啟 [Google Sheets](https://sheets.google.com) → 建立新試算表
2. 命名為「移動城堡 CRM」
3. 記下網址列的 **Spreadsheet ID**：`https://docs.google.com/spreadsheets/d/【這段】/edit`

### B. 部署 Google Apps Script（API）

1. 試算表 → **擴充功能 → Apps Script**
2. 刪除預設程式碼，貼上 `castle-api.gs` 的完整內容
3. 第 18 行的 `YOUR_SPREADSHEET_ID_HERE` 換成 Step A 的 ID
4. 先執行 `initSheets` 函式 → 建立 deals/tasks/leads/users 四個工作表
5. **部署 → 新增部署 → 網頁應用程式**
   - 執行身份：**自己**
   - 存取權限：**擁有 Google 帳號的任何人**
6. 複製 **Web App URL**

### C. 設定 Google Sign-In

1. [Google Cloud Console](https://console.cloud.google.com) → 建立專案
2. **API 和服務 → 憑證 → 建立 OAuth 用戶端 ID**
3. 類型：**網頁應用程式**
4. 已授權 JavaScript 來源：
   - `https://www.beyondspec.tw`
   - `http://localhost`（本地測試用）
5. 複製 **Client ID**

### D. 填入設定值

編輯 `business/index.html`，找到最上面兩行空字串：

```javascript
const API_URL = "";              // ← 貼上 Step B 的 Web App URL
const GOOGLE_CLIENT_ID = "";     // ← 貼上 Step C 的 Client ID
```

填入後重新 push：

```bash
git add business/index.html
git commit -m "feat: connect cloud sync & Google Sign-In"
git push
```

---

## 🔒 安全性

| 措施 | 狀態 |
|------|------|
| `noindex, nofollow` 防搜尋引擎索引 | ✅ 已設定 |
| Google Sign-In 驗證身份 | ✅ 內建（需 Step C） |
| 資料隔離（userId 分流） | ✅ API 層已實作 |
| 網址不公開曝光 | ✅ 只有知道網址的人能進 |

建議加碼：在 `castle-api.gs` 加入 email 白名單，只允許指定帳號存取。

---

## 📁 檔案對照表

| 檔案 | 位置 | 用途 |
|------|------|------|
| `business/index.html` | 推到 GitHub repo | 前端 Dashboard |
| `castle-api.gs` | 貼到 Google Apps Script | 後端 API（選做） |
| `castle-dashboard.jsx` | 留在本地 | React 原始碼（開發用） |

---

## 🔄 未來更新流程

每次我幫你改完 code，你只要：

```bash
# 1. 把新的 index.html 覆蓋進 business/ 資料夾
# 2. 推上去
git add business/index.html
git commit -m "update: Dashboard v5.x"
git push
```

1~2 分鐘後自動生效，不需要碰其他檔案。
