# 申請管理 · Firestore Rules 修復指南

> **問題**：愛德華進 app /admin 申請管理頁顯示「讀取失敗：Missing or insufficient permissions」
> **時間**：2026-04-21 深夜（v1.3.11 app 內 admin 頁上線時漏設 rules）
> **修法時間**：3 分鐘 Firebase Console 操作
> **誰操作**：愛德華本人（Claude 不能改 Firebase Rules）

---

## 根因

v1.3.9 早鳥申請改 Firestore 直寫時，我只設了 **write 權限**給任何人（landing 表單要 submit），**沒設 read 權限**給 Edward。所以：

- ✅ Landing 的 `applications.add(...)` 成功（write open）
- ❌ app 內 admin 頁的 `applications.orderBy().limit().get()` 被擋（read 沒授權）

這是 Firestore 預設「deny all」的結果——沒明確 allow 就是拒絕。

---

## 修復步驟（3 分鐘）

### Step 1：打開 Firebase Console Rules

前往 https://console.firebase.google.com/project/beyond-business-ca9da/firestore/rules

### Step 2：替換 Rules

把整份 Rules 改成以下內容（複製貼上）：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 早鳥申請 collection
    match /applications/{docId} {
      // 任何人可 create（landing 表單 submit）— 但只允許新增，不允許修改自己填的內容
      allow create: if request.resource.data.keys().hasAll(['plan', 'email', 'submittedAt']);

      // 只有 edwardt0303@gmail.com 可讀 + update（admin 頁審核）
      allow read: if request.auth != null && request.auth.token.email == 'edwardt0303@gmail.com';
      allow update: if request.auth != null && request.auth.token.email == 'edwardt0303@gmail.com';

      // 不允許任何人刪（保留 audit trail）
      allow delete: if false;
    }

    // 其他 Collection 先鎖死（未來再開）
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 3：Publish

按 Firebase Console 右上角 **「發布」/「Publish」**，等約 10-30 秒生效。

### Step 4：驗證

1. 重新整理 https://beyondspec.tw/path/app/#/admin
2. 應該能看到所有申請列表（不再顯示「讀取失敗」）
3. 如果還是壞，打開 DevTools Console 看錯誤 screenshot 給我

---

## 為什麼要這樣設計

| 規則 | 為什麼 |
|------|--------|
| `create` 放開給任何人 | Landing 訪客送表單時還沒登入 |
| `create` 要求必填欄位 | 防止惡意寫垃圾資料（空 doc / 攻擊字串）|
| `read/update` 只限 edwardt0303@gmail.com | 申請資料含 email / 需求 / 公司機敏資訊，只你能看 |
| `delete` 全鎖 | 保留 audit trail（未來需要撤銷改 status 為 'withdrawn' 不刪）|
| 其他 collection 鎖死 | 未來加新 collection 時明確開權限，不被 `match /{document=**}` 意外授權 |

---

## 未來擴充

### 若要加其他 admin（例：Sophie / Howl 帳號也能看）

改成：
```
allow read: if request.auth != null && request.auth.token.email in ['edwardt0303@gmail.com', 'other@email.com'];
```

### 若要加 client-side 讀自己申請狀態

讓申請者本人可查自己的 status：
```
allow read: if request.auth != null && request.auth.token.email == resource.data.email;
```

### 若改用 custom claim 更乾淨

Firebase Admin SDK 設 custom claim `admin: true` 給你的 uid，然後：
```
allow read: if request.auth != null && request.auth.token.admin == true;
```

但 custom claim 要 Cloud Function 設，現階段 email 比對夠用。

---

## 故障排除

| 症狀 | 檢查 |
|------|------|
| Publish 後仍顯示「insufficient permissions」 | 重新整理頁面；清 localStorage；確認你 login 的 email 是 edwardt0303@gmail.com（不是其他） |
| Landing 表單送不出去 | `create` 要求的必填欄位（plan/email/submittedAt）是否都有；v1.3.9 bpSubmitApply 有送這 3 個 field |
| Firebase Console Rules simulator 測試 | Rules 頁右上有 simulator，可模擬「read /applications/xxx with auth.token.email=edwardt0303@gmail.com」驗證 |

---

## 相關記錄

- v1.3.9 Firestore 寫入實裝（2026-04-21）
- v1.3.11 app 內 /admin 頁實裝（2026-04-21）— **漏設 rules**（這次 bug 根源）
- v1.3.18 信任救火 · Math.random 清零（2026-04-21）

---

*建立日期：2026-04-21 · 作者：蘇菲（代愛德華診斷 Firestore 權限 bug）*
