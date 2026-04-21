# Firebase Extension · Trigger Email 設定指南

> **目的**：讓每次有人送出早鳥申請（寫入 Firestore `applications` collection）時，**自動寄 email 通知 edwardt0303@gmail.com**。
> **時間**：5-10 分鐘（Firebase Console 操作）
> **費用**：免費（Firebase Extensions 免費，只收 SMTP 方的費用。用你 Gmail 帳號的 SMTP 無費用）
> **前置條件**：Firebase project `beyond-business-ca9da` 已有 Firestore applications collection（v1.3.9 已完成）

---

## Step 1：取得 Gmail App Password（給 SMTP 用）

> Gmail SMTP 不接受一般密碼，必須用 **App Password**（應用程式密碼）。

1. 前往 https://myaccount.google.com/security
2. 確認**「兩步驟驗證」已開啟**（如果沒開，先開它）
3. 搜尋「App passwords」或「應用程式密碼」
4. 建立新應用程式密碼：
   - 選「郵件」作為 App
   - 選「其他」作為 Device，命名「BeyondPath Firebase」
5. **複製 16 位字元的密碼**（像 `xxxx xxxx xxxx xxxx`）—— 下一步要貼

---

## Step 2：安裝 Firebase Trigger Email Extension

1. 前往 https://console.firebase.google.com
2. 選 `beyond-business-ca9da` project
3. 左側 menu 找 **Extensions**
4. 點「Explore Extensions」
5. 搜尋 **「Trigger Email from Firestore」**（由 Firebase 官方提供）
6. 點「Install」→「Install in console」

---

## Step 3：Extension 設定（關鍵欄位）

安裝流程會問你一系列設定：

### Basic Configuration

| 欄位 | 填什麼 |
|------|--------|
| **Cloud Functions location** | `asia-east1`（台灣，延遲最低） |
| **Email documents collection** | 先 skip（下面我們用另一種機制） |
| **Default FROM address** | `edwardt0303@gmail.com` |
| **Default REPLY-TO address** | `edwardt0303@gmail.com` |

### SMTP Configuration

| 欄位 | 填什麼 |
|------|--------|
| **SMTP connection URI** | `smtps://edwardt0303@gmail.com:APP_PASSWORD@smtp.gmail.com:465` |
|  | ⚠️ 把 `APP_PASSWORD` 換成 Step 1 拿到的 16 位密碼（**去掉空格**） |

範例：如果 app password 是 `abcd efgh ijkl mnop`，填：
```
smtps://edwardt0303@gmail.com:abcdefghijklmnop@smtp.gmail.com:465
```

---

## Step 4：改 applications collection 觸發為「雙 Write 模式」

因為 Trigger Email extension 只讀**特定 collection**（預設 `mail/{docId}`），我們 `applications` collection 要額外**同步寫**一份到 `mail` collection，才會觸發 email。

有兩種做法：

### 方案 A（推薦）：Cloud Function 中繼（零前端改動）

在 Firebase Console → Functions → Create function：

```javascript
// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.applicationEmail = functions
  .region("asia-east1")
  .firestore.document("applications/{docId}")
  .onCreate((snap, context) => {
    const d = snap.data();
    const subject = `[BeyondPath 早鳥] ${(d.plan||'').toUpperCase()} · ${d.name || '匿名'}`;
    const body = `
      <h2>新的 BeyondPath 早鳥申請</h2>
      <table style="border-collapse:collapse;font-family:sans-serif">
        <tr><td><b>方案</b></td><td>${(d.plan||'').toUpperCase()} 早鳥</td></tr>
        <tr><td><b>公司</b></td><td>${d.company || '-'}</td></tr>
        <tr><td><b>職稱</b></td><td>${d.title || '-'}</td></tr>
        <tr><td><b>姓名</b></td><td>${d.name || '-'}</td></tr>
        <tr><td><b>Email</b></td><td><a href="mailto:${d.email}">${d.email}</a></td></tr>
        <tr><td><b>需求</b></td><td>${d.needs || '（選填未填）'}</td></tr>
        <tr><td><b>提交時間</b></td><td>${d.submittedAtIso || '-'}</td></tr>
        <tr><td><b>來源</b></td><td>${d.source || '-'}</td></tr>
        <tr><td><b>User Agent</b></td><td style="font-size:11px;color:#999">${d.userAgent || '-'}</td></tr>
      </table>
      <p style="margin-top:20px">
        <a href="https://beyondspec.tw/path/app/#/admin" style="background:#7C5CFC;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">前往申請管理頁</a>
      </p>
    `;
    return admin.firestore().collection("mail").add({
      to: "edwardt0303@gmail.com",
      message: { subject, html: body }
    });
  });
```

部署：
```bash
firebase init functions
firebase deploy --only functions:applicationEmail
```

### 方案 B（零後端）：前端直接雙 Write

在 `/path/index.html` `bpSubmitApply` 的 Firestore 寫入後，追加一份到 `mail` collection。缺點：credentials 會暴露在前端 rules，需要 Firestore Rules 管控。不推薦。

---

## Step 5：測試

1. 到 https://beyondspec.tw/path/ 點「申請 Starter」
2. 填假資料 → 送出
3. 1–2 分鐘內你的 edwardt0303@gmail.com 應該收到 email（主旨含 `[BeyondPath 早鳥]`）
4. 同時 https://beyondspec.tw/path/app/#/admin 的申請管理頁也會出現這筆

### 若沒收到 email

- 檢查 Firebase Console → Extensions → Trigger Email → Logs，看有無錯誤
- 檢查 Functions → applicationEmail → Logs，看有沒執行
- 檢查 `mail/{docId}` 是否被建立（Firestore Data 頁）
- 檢查 email **垃圾信件匣**（Gmail 有時會判垃圾）

---

## Step 6：未來擴充

- **Slack / Discord 通知**：同樣機制，用 `onCreate` 改 webhook POST
- **逾期提醒**：Cloud Function scheduled 每天檢查 `applications` 中 `status: pending` 超過 7 天的 → 寄 follow-up
- **批次報告**：每週日寄一封「本週 N 筆申請、M 筆已通過」summary

---

## 成本試算（Firebase 免費額度）

| 項目 | 免費額度 | 早鳥階段預估 |
|------|---------|-----------|
| Cloud Functions 呼叫 | 2M / 月 | 每月可能 50-500 筆申請，遠低於限額 |
| Firestore writes | 20K / 日 | 每筆申請 2 write (applications + mail)，遠低於 |
| Firestore reads | 50K / 日 | admin 頁 load 最多 100 筆 × 幾次/日 |
| Gmail SMTP | 無限額（你自己帳號） | 每日上限 500 封（Gmail 限制，早鳥用不完） |

**總成本：NT$0**，直到申請量超過 500/日才可能需要考慮升級 SendGrid / SMTP provider。

---

## 故障排除

| 症狀 | 檢查 |
|------|------|
| Email 沒收到但 admin 頁有資料 | Trigger Email extension 的 SMTP URI 是否正確；App Password 是否過期 |
| Email 進垃圾信件匣 | Gmail → 標記為非垃圾郵件（第一次可能需手動訓練）|
| Functions 執行失敗 | Logs 看錯誤；通常是 Firestore rules 擋住了 admin SDK 寫入 |
| Admin 頁看不到新申請 | Firestore Rules 是否允許 `edwardt0303@gmail.com` 讀取 applications collection |

---

*建立日期：2026-04-21 · v1.3.14 配套指南 · 作者：蘇菲（代愛德華執行前置作業）*
