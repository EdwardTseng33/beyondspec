# 🏰 移動城堡 Dashboard — Google 後端設定指南

歡迎使用移動城堡 Dashboard！本指南將帶您一步步完成 Google 雲端服務的設定，讓您可以開始使用雲端同步功能。

整個設定過程分為 **3 個主要步驟**，預計花費 15-20 分鐘。

---

## 步驟 1️⃣ 建立 Google Spreadsheet 資料庫

Google Sheets 將作為您的雲端資料庫，存放所有交易、任務和潛在客戶資訊。

### 操作步驟

1. 打開 [sheets.google.com](https://sheets.google.com)
2. 點擊 **「+ 建立新試算表」** 按鈕
3. 為試算表命名：**「移動城堡 CRM」**
   - 這個名字只是為了方便識別，您可以自行修改

4. 在試算表的網址列中，複製 **Spreadsheet ID**
   - 網址格式：`https://docs.google.com/spreadsheets/d/XXXXXXXXXXXXXXXX/edit`
   - Spreadsheet ID 就是 `/d/` 之後、`/edit` 之前的那串長字符（大約 40-50 個字符）
   - 舉例：`1a2b3c4d5e6f7g8h9i0j`

5. **暫時保存這個 ID**，下一步會用到

### 💡 提示

- ✅ **不需要手動建立工作表（Sheet）** — Apps Script 會在第一次執行時自動建立 4 個工作表：deals, tasks, leads, users
- 🔒 試算表只有您和授權的應用可以存取

---

## 步驟 2️⃣ 部署 Google Apps Script API

現在我們要將 Castle API 部署到 Google Apps Script，作為後端 API。

### 2.1 開啟 Apps Script 編輯器

1. 返回您剛建立的試算表
2. 點擊上方功能表：**擴充功能 → Apps Script**
3. 新分頁會開啟 Apps Script 編輯器

### 2.2 貼上 API 程式碼

1. 刪除編輯器中的預設程式碼（通常是一個 `myFunction()` 的空函數）
2. 複製 **castle-api.gs** 文件中的全部程式碼
   - 文件位置：`/mnt/Beyondspec/business-automation/castle-api.gs`

3. 將程式碼完全貼到編輯器中

### 2.3 替換 Spreadsheet ID

1. 在第 17 行找到：
   ```javascript
   const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";
   ```

2. 將 `YOUR_SPREADSHEET_ID_HERE` 替換為您在**步驟 1** 複製的 Spreadsheet ID
   - 例如：
   ```javascript
   const SPREADSHEET_ID = "1a2b3c4d5e6f7g8h9i0j";
   ```

3. 按 **Ctrl+S**（或 **Cmd+S**）儲存

### 2.4 重新命名專案

1. 點擊左上方的**「無標題專案」**
2. 重新命名為：**「移動城堡 API」**
3. 點擊 **Rename** 確認

### 2.5 首次初始化（重要！）

初始化會自動建立 4 個工作表，並設定正確的欄位。

1. 在編輯器中，找到函數列表（左邊欄）
2. 點擊 **`initSheets`** 函數名稱
3. 點擊頂部的 **▶ 執行按鈕**（綠色的播放鍵）
4. 第一次執行時，Google 會要求您授權：
   - 按一下出現的 **「Review permissions」** 按鈕
   - 選擇您的 Google 帳號
   - 點擊 **「Advanced」**（進階）
   - 點擊 **「Go to 移動城堡 API (unsafe)」**
   - 點擊 **「Allow」**（允許）

5. 回到編輯器，您應該會在底部看到執行日誌：
   ```
   ✅ 工作表初始化完成！
   ```

### 💡 提示

- ⚠️ 如果忘記執行 `initSheets`，稍後同步時會出現錯誤
- ✅ 只需執行一次，之後就不需要再執行

### 2.6 部署為 Web App

現在我們要部署這個 API，讓 Dashboard 可以連接。

1. 點擊頂部的 **「Deploy」**（部署）
2. 點擊 **「New deployment」**（新部署）
3. 點擊右上角的 **齒輪圖示**，選擇 **「Web app」**（網頁應用）
4. 填寫部署設定：
   - **New deployment** 下拉菜單保持預設
   - **Execute as**（執行身份）：選 **「Me」**（自己）
   - **Who has access**（誰有存取權）：選 **「Anyone」**（任何人）
     - 💡 **重要說明**：雖然設定為「任何人」，但數據會根據 `userId` 過濾，所以每個用戶只能看到自己的資料。這是安全的設計。

5. 點擊 **「Deploy」** 確認

### 2.7 複製 Web App URL

1. 部署完成後，會出現一個對話框，顯示您的部署信息
2. 複製 **Deployment ID** 下方顯示的完整網址
   - 網址格式類似：`https://script.google.com/macros/s/XXXXXXXXXXXXXXXX/exec`
   - 這就是您的 **API_URL**

3. **保存這個 URL**，下一步會用到

### 🧪 快速測試（選擇性）

想驗證 API 有沒有正常工作？在瀏覽器打開（記得替換 YOUR_USER_ID）：

```
https://script.google.com/macros/s/XXXXXXXXXXXXXXXX/exec?action=ping&userId=YOUR_USER_ID
```

如果看到回應 `{"ok":true,"data":{"message":"🏰 移動城堡 API 運作中",...}}`，表示 API 已成功部署！

---

## 步驟 3️⃣ 設定 Google OAuth Client ID（Google 登入）

現在設定 Google 登入功能，讓用戶可以用 Google 帳號登入 Dashboard。

### 3.1 建立 Google Cloud 專案

1. 打開 [console.cloud.google.com](https://console.cloud.google.com)
2. 如果您沒有 Google Cloud 帳號，先建立一個（免費）

3. 點擊頂部的 **專案選擇器**（通常顯示「Select a Project」）
4. 點擊 **「NEW PROJECT」**（新專案）
5. 填寫專案資訊：
   - **Project name**（專案名稱）：`Moving Castle`
   - **Organization**：保持空白或選擇您的組織
   - 點擊 **CREATE** 建立專案

6. 等待專案建立完成（通常需要幾秒鐘）

### 3.2 設定 OAuth 同意畫面

1. 在左側功能表，點擊 **「APIs & Services」**
2. 點擊 **「OAuth consent screen」**（OAuth 同意畫面）

3. 選擇 **「External」**（外部）為用戶類型
4. 點擊 **「CREATE」** 建立

5. 填寫應用信息：
   - **App name**（應用名稱）：`移動城堡 Dashboard`
   - **User support email**（用戶支持郵箱）：輸入您的 Google 帳號郵箱
   - 向下滾動，找到 **Developer contact information**（開發者聯絡方式）
   - **Email addresses**（郵箱）：再次輸入您的郵箱

6. 點擊 **「SAVE AND CONTINUE」**（儲存並繼續）
   - 後面會出現 **Scopes**（範圍）頁面 → 點擊 **SAVE AND CONTINUE**
   - **Test users** 頁面 → 點擊 **ADD USERS**，輸入您的 Google 郵箱，然後點擊 **SAVE AND CONTINUE**
   - 最後頁面 → 點擊 **BACK TO DASHBOARD**

### 3.3 建立 OAuth Client ID

1. 在左側功能表，點擊 **「Credentials」**（憑證）
2. 點擊 **「+ CREATE CREDENTIALS」**（+ 建立憑證）
3. 選擇 **「OAuth client ID」**（OAuth 用戶端 ID）

4. 如果系統提示要選擇應用類型，選 **「Web application」**（網頁應用）

5. 填寫設定：
   - **Name**（名稱）：`移動城堡 Dashboard`

   - **Authorized JavaScript origins**（已授權的 JavaScript 來源）：
     - 點擊 **「ADD URI」**，輸入：`https://beyondspec.tw`
     - 再點擊 **「ADD URI」**，輸入：`http://localhost`（用於本機測試）

   - **Authorized redirect URIs**（已授權的重新導向 URI）：
     - 如果有這個欄位，先暫時空著不填

6. 點擊 **「CREATE」** 建立

### 3.4 複製 Client ID

1. 建立完成後，會出現一個包含您的憑證資訊的對話框
2. 複製 **Client ID** 欄位中的值
   - 格式類似：`123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`
   - 這就是您的 **GOOGLE_CLIENT_ID**

3. **保存這個 ID**，下一步會用到

4. 您也可以在 Credentials 頁面看到您的 OAuth 2.0 Client IDs 列表，隨時複製

### 💡 提示

- ✅ Client ID 是公開的，可以安全地儲存在前端代碼中
- 🔒 不要洩露 Client Secret（如果有的話）
- 📱 支援網頁版和行動裝置登入

---

## 步驟 4️⃣ 填入 Dashboard 設定值

現在我們要將 API_URL 和 GOOGLE_CLIENT_ID 填入 Dashboard 代碼。

### 4.1 找到設定檔案

Dashboard 的設定通常位於：
- `business/index.html` 或
- `js/config.js`

### 4.2 更新設定常數

在文件中找到以下兩個常數（或自行添加）：

```javascript
// 您在步驟 2.7 複製的 Web App URL
const API_URL = "https://script.google.com/macros/s/XXXXXXXXXXXXXXXX/exec";

// 您在步驟 3.4 複製的 Client ID
const GOOGLE_CLIENT_ID = "123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com";
```

### 4.3 提交變更

1. 將修改後的文件儲存
2. 推送到 GitHub：
   ```bash
   git add business/index.html
   git commit -m "chore: update Google API configuration"
   git push origin main
   ```

3. 如果您的 Dashboard 託管在 Vercel、Netlify 等平台，通常會自動部署

### 💡 提示

- ✅ 確保沒有多餘的空格或換行符
- ✅ 兩個 URL/ID 都是必填的
- 🔒 生產環境中，考慮使用環境變數而不是硬編碼

---

## ✅ 驗證設定（測試一切是否正常）

完成以上 4 個步驟後，讓我們驗證所有設定是否正確。

### 驗證步驟

1. **打開 Dashboard**
   - 訪問 `https://beyondspec.tw/business/`
   - 或本機開發：`http://localhost:8080/business/`（根據您的設定調整）

2. **檢查 Google Sign-In 按鈕**
   - 在網頁的右上角，應該能看到一個 **Google Sign-In 按鈕**
   - 如果沒有，檢查瀏覽器控制台是否有錯誤

3. **登入測試**
   - 點擊 Google Sign-In 按鈕
   - 用您的 Google 帳號登入
   - 登入成功後，應該能看到您的名字和頭像

4. **建立測試資料**
   - 在 Dashboard 中添加一個測試交易（Deal）或任務（Task）
   - 填寫基本信息後，點擊儲存

5. **測試雲端同步**
   - 點擊工具列中的 **☁️ 雲端同步按鈕**（或相似的按鈕）
   - 等待 1-3 秒，應該會看到成功的提示

6. **驗證 Google Sheets**
   - 返回您的 Google Sheets（移動城堡 CRM）
   - 檢查 **deals**、**tasks** 或 **leads** 工作表
   - 您剛才添加的測試資料應該出現在相應的工作表中

### ✅ 成功的標誌

- ✅ Google Sign-In 按鈕顯示正常
- ✅ 能夠成功登入
- ✅ 能夠添加資料並在本機保存
- ✅ 雲端同步後，Google Sheets 中出現數據
- ✅ 瀏覽器控制台沒有紅色錯誤訊息

---

## 🆘 常見問題與故障排查

### 問題 1：點擊 Google Sign-In 按鈕沒有反應

**可能原因：**
- GOOGLE_CLIENT_ID 設定錯誤或未設定
- 瀏覽器已禁用第三方 Cookie

**解決方案：**
1. 檢查 `index.html` 或 `config.js` 中的 GOOGLE_CLIENT_ID 是否正確
2. 確保 Client ID 的格式為：`XXXXX.apps.googleusercontent.com`
3. 打開瀏覽器開發者工具（F12），檢查 **Console** 標籤
4. 查看是否有相關的錯誤訊息
5. 如果是 Cookie 問題，嘗試在隱私瀏覽模式下開啟網頁

### 問題 2：雲端同步失敗，顯示 401 或 403 錯誤

**可能原因：**
- API_URL 設定錯誤
- Web App 部署的存取權限未設為「任何人」
- 用戶未正確登入

**解決方案：**
1. 檢查 API_URL 是否正確複製（應以 `/exec` 結尾）
2. 返回 Google Apps Script，點擊 **Deploy** → **Manage deployments**
3. 檢查 Web App 的「Who has access」是否設為「Anyone」
4. 確保已用 Google 帳號登入 Dashboard

### 問題 3：Apps Script 執行 `initSheets` 時出現錯誤

**可能原因：**
- SPREADSHEET_ID 在 castle-api.gs 中設定錯誤
- Google Sheets 的存取權限問題

**解決方案：**
1. 檢查 castle-api.gs 第 17 行的 SPREADSHEET_ID
2. 確保 ID 完全正確，沒有多餘空格
3. 返回 Google Sheets，確保您有編輯權限
4. 刪除 Apps Script 專案，重新建立並部署

### 問題 4：Google Sheets 中沒有出現雲端同步的資料

**可能原因：**
- `initSheets` 未執行
- 同步請求中的 `userId` 不匹配
- API 回應了錯誤但 UI 未顯示

**解決方案：**
1. 確保已執行 `initSheets` 並看到「✅ 工作表初始化完成！」
2. 打開瀏覽器開發者工具（F12），進入 **Network** 標籤
3. 點擊雲端同步按鈕，觀察 API 請求
4. 查看 API 回應是否為 `{"ok": true}`
5. 檢查 Google Sheets 中的 **users** 工作表，確認您的用戶資訊已記錄

### 問題 5：看不到 Google Cloud 專案或 OAuth 設定

**可能原因：**
- 使用了錯誤的 Google 帳號
- 沒有建立或選擇專案

**解決方案：**
1. 確保您使用的是建立 Google Cloud 帳號時的同一個 Google 帳號
2. 訪問 [console.cloud.google.com](https://console.cloud.google.com)
3. 確認頁面頂部的專案選擇器顯示「Moving Castle」
4. 如果沒有，點擊專案選擇器，建立新專案

---

## 🔐 安全性最佳實踐

- ✅ **Client ID** 可以安全地公開（它就是為公開使用設計的）
- 🔒 **Spreadsheet ID** 應該保密，不要分享
- 🔒 **不要在代碼中儲存 Client Secret**
- 🔒 **Web App 設為「任何人」存取是安全的**，因為數據按 userId 過濾

---

## 📞 需要幫助？

如果您遇到問題，請檢查：

1. **所有 3 個主要元件是否都已設定：**
   - ✅ Google Sheets 試算表已建立
   - ✅ Apps Script API 已部署
   - ✅ Google OAuth Client ID 已建立

2. **所有值是否已正確填入：**
   - ✅ castle-api.gs 中的 SPREADSHEET_ID
   - ✅ index.html 中的 API_URL 和 GOOGLE_CLIENT_ID

3. **瀏覽器控制台是否有錯誤訊息**
   - 打開 F12 開發者工具 → Console 標籤
   - 查看任何紅色的錯誤訊息

---

## 🎉 恭喜！

您已經完成了 Google 後端設定！現在可以：

- ✅ 用 Google 帳號登入 Dashboard
- ✅ 添加交易、任務和潛在客戶
- ✅ 將資料同步到 Google Sheets
- ✅ 在 Google Sheets 中查看和管理資料
- ✅ 在多個裝置間同步

開始使用移動城堡 Dashboard，管理您的業務！🏰

---

**版本：** 1.0
**最後更新：** 2026 年 3 月
**支援語言：** 繁體中文
