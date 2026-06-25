# 綠界第二塊 → Worker 整合計畫（不部署 · 留 Edward + 蘇菲 review）

> 城堡實作手 · 2026-06-25 · 階段二金流批 · **第二塊**（webhook 解鎖 / cancel / 收據 / 後端權威化）
> 性質：**整合待辦 + Edward infra 清單**。本批【未部署、未碰真金鑰、未碰真錢、未改 worker.js】。
> 模組已寫成「可單元測、Firestore 用 interface/mock 包」——真接 Firebase / 部署留 Edward。

---

## 0. 第二塊產出了什麼（全在 `src/`，全綠）

| 檔 | 職責 | 對應紅線 / spec |
|---|---|---|
| `src/store.js` | **Firestore 邊界**：`BillingStore` 介面 + `InMemoryStore` mock。webhook/cancel/收據全走它，真上線換 `FirestoreStore` 即可、邏輯不動。 | A3 / 紅線 3 / idempotent §2.3 |
| `src/webhook.js` | **`/ecpay/webhook`（紅線 1 核心）**：server 端驗章 → idempotent → 解鎖寫 billing → 交易+收據。前端永遠不自解。 | 紅線 1 / flow Step4-5 |
| `src/cancel.js` | **`/ecpay/cancel`（紅線 2）**：**真呼叫**綠界 `CreditCardPeriodAction Cancel`，綠界確認後才寫 cancelled。 | 紅線 2 / flow Step8 |
| `src/receipt.js` | **收據（非發票）**：欄位 + HTML 收據頁 + email hook。獨立 collection + `legalRetention`。 | 技術計畫 §4 / 紅線 3 |
| `src/authority.js` | **後端權威化**：付費動作 Worker 端查 Firestore 為真相；localStorage 唯讀快取（防清繞過）。 | 技術計畫 §5 / A3 |

測試（`test/`，**第二塊 +219 案、合第一塊共 271 案全綠**）：
`store.test.mjs`(17) / `webhook.test.mjs`(60) / `cancel.test.mjs`(38) / `receipt.test.mjs`(38) / `authority.test.mjs`(28)。
跑：`node test/run-all.mjs`（exit 0）。

---

## 1. 現有 worker.js 的真實狀態（實讀原始碼確認 · 修正技術計畫的樂觀假設）

> 檔：`E:\Claude\beyondSpec 2.0\_workspace\ai-proxy\worker.js`（472 行，**本機、未進 git**）。

```js
// 現況（line 313-393）：
export default {
  async fetch(request, env) {
    ...
    if (request.method !== 'POST') return 405;          // ← 只收 POST
    const body = await request.json();
    const { node, context, userMessage, ... } = body;   // ← 依 body.node 分派
    if (!node || !SYSTEM_PROMPTS[node]) return 400;
    // → 呼叫 LLM（callAnthropic / callOpenAI），回 { ok, text, usage }
  }
};
```

**三個和技術計畫 §2.1 樂觀假設【不符】的事實**（卡西法 6/24 已標、本批實讀再確認）：

| 技術計畫假設 | 實際 worker.js | 對整合的影響 |
|---|---|---|
| 「Worker 已有 Firestore 寫入能力」 | ❌ **完全沒有**。只 `fetch()` 打 LLM API（Anthropic/OpenAI）。無任何 Firebase/Firestore import 或呼叫。 | **webhook 解鎖寫 billing = 要從零加 Firebase 寫入路徑**（見 §3）。這是第二塊上線前最大的一塊 infra。 |
| 「依 `url.pathname` 分派」 | ❌ **無路由**。`new URL(request.url)` 沒出現；分派靠 `body.node`。 | 要在 `fetch()` 最前面加 `url.pathname` 分流，把 `/ecpay/*` 切出來，**不碰現有 LLM proxy 邏輯**。 |
| webhook 是 POST form | ⚠️ 現有只 `request.json()` | 綠界 webhook 是 `application/x-www-form-urlencoded`，**不是 JSON**。`/ecpay/webhook` 要用 `request.formData()` / `request.text()` 解析，不能走現有 `request.json()`。 |

---

## 2. 路由怎麼加（最小侵入 · 不傷現有 LLM proxy）

在 `fetch()` 最前面（line 314 之後、現有 CORS/POST 檢查【之前】）插一段 pathname 分流：

```js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── 新增：/ecpay/* 路由群（與現有 LLM proxy 完全隔離）──
    if (url.pathname.startsWith('/ecpay/')) {
      return handleEcpay(url.pathname, request, env);   // ← 見 §3
    }

    // ── 以下為現有 LLM proxy 邏輯，一行不動 ──
    const origin = request.headers.get('Origin') || '';
    ...
  }
};
```

`handleEcpay` 依 pathname 再分（建議獨立檔 `src/ecpay/index.js`，本資料夾模組複製進 Worker bundle）：

```js
async function handleEcpay(pathname, request, env) {
  const store = makeFirestoreStore(env);               // ← §3 要你補的

  if (pathname === '/ecpay/create-order') {            // 第一塊（buildSubscriptionOrder）
    const input = await request.json();                // 前端 JSON { plan, uid }
    const r = await buildSubscriptionOrder(input, env);
    return json(r.ok ? { action: r.action, fields: r.fields } : { error: r.error }, r.ok ? 200 : r.status);
  }

  if (pathname === '/ecpay/webhook') {                 // 第二塊（紅線 1）
    const form = await request.formData();             // ⚠️ 綠界是 form-urlencoded 不是 JSON
    const body = {}; for (const [k, v] of form) body[k] = v;
    const res = await handleWebhook({
      body, env, store,
      lookupEmail: (uid) => getAuthEmail(env, uid),    // ← §3：從 Firebase auth 查 email
      mailer: (email) => sendMail(env, email),         // ← §4：寄信通道（可選）
      onAlert: (evt) => logAlert(env, evt),            // ← §5：告警通道
    });
    return new Response(res.body, { status: res.status, headers: { 'Content-Type': 'text/plain' } });
    // ⚠️ webhook 回綠界【純文字 1|OK】，不是 JSON、不要套 CORS JSON header
  }

  if (pathname === '/ecpay/cancel') {                  // 第二塊（紅線 2）
    const input = await request.json();                // { uid }
    const res = await handleCancel({
      input, env, store,
      fetchImpl: (u, init) => fetch(u, init),          // ← 真呼叫綠界用 Worker fetch
      onAlert: (evt) => logAlert(env, evt),
    });
    return json(res, res.status);
  }

  return json({ error: 'unknown ecpay route' }, 404);
}
```

> **隔離原則**：`/ecpay/*` 自己一條 return，碰不到現有 LLM proxy 的 rate-limit / SYSTEM_PROMPTS / callAnthropic。改動 LLM proxy 不會誤傷金流，反之亦然（沙利曼 §2.1 路由隔離要求）。

---

## 3. ⭐ 最大一塊：Firestore 寫入（Worker 目前沒有，Edward 要補）

webhook 解鎖 / cancel 寫狀態 / 收據落庫，全要 Firestore 寫入。worker.js 現在【零 Firebase】。三條路，建議走 A：

### 路 A（建議）· Firestore REST + Google 服務帳號 OAuth（Worker 原生、無 npm）
- Cloudflare Worker 不能直接跑 `firebase-admin`（Node-only）。標準做法：**用服務帳號的 private key 在 Worker 內簽 JWT → 換 Google OAuth access token → 打 Firestore REST API**（`firestore.googleapis.com/v1/projects/{proj}/databases/(default)/documents/...`）。簽 JWT 用 Worker 原生 WebCrypto（`crypto.subtle`，本批 checkmac 已在用），**不需 npm 套件**。
- **Edward 要給的 infra**：
  1. **Firebase 服務帳號 JSON**（Firebase console → 專案設定 → 服務帳戶 → 產生新私密金鑰）。
  2. 把其中 `client_email` + `private_key` 設成 Worker secret：
     ```
     wrangler secret put FIREBASE_CLIENT_EMAIL
     wrangler secret put FIREBASE_PRIVATE_KEY      # 注意換行，多行 PEM
     wrangler secret put FIREBASE_PROJECT_ID
     ```
  3. **服務帳號私鑰 = 最高機密**，和 HashKey/HashIV 同級——只進 Worker secret，永不落 git/prompt（沙利曼 §1 界線延伸）。

### 路 B · 既有前端已用的 Firebase Web SDK
- 前端 app.html 已連 Firebase（PATH_AI / 帳號）。但那是 **client SDK + 用戶身分**，受 Firestore security rules 限制（規則禁止前端寫 billing）。Worker 解鎖要**繞過規則用 admin 權限**→ client SDK 做不到 → 仍要路 A 的服務帳號。

### 路 C · 自架後端
- 超綱。沙利曼 A1 已定調「不另開後端」，不走。

### 要補的 `FirestoreStore`（實作 `src/store.js` 的 `BillingStore` 介面）
照 `InMemoryStore` 同樣 7 個 method，把 Map 換成 Firestore REST 呼叫，路徑用 store.js 註解約定：
- `getBilling(uid)` → GET `users/{uid}/billing/state`
- `setBilling(uid, data)` → PATCH（`updateMask` 做 merge）`users/{uid}/billing/state`
- `getProcessedWebhook(key)` / `markProcessedWebhook(key)` → **見下方「交易一致性」**
- `saveReceipt` → CREATE `users/{uid}/billing/receipts/{receiptNo}`
- `saveTransaction` → CREATE `users/{uid}/billing/transactions/{tradeNo}`

### ⚠️ 交易一致性（idempotent 的正確性命脈 · 上線前必處理）
`InMemoryStore.markProcessedWebhook` 靠「同步 Map 有/無」做到原子。Firestore REST **沒有同步原子**——`get` 後 `set` 中間有空窗，高併發下同筆 webhook 可能雙解鎖。正確做法二選一：
1. **Firestore `createDocument`（create-if-absent 語意）**：對 `processedWebhooks/{idemKey}` 用 create，**文件已存在會回 409** → 接到 409 = 「已處理過」回 duplicate。這就是天然的原子 idempotent，**建議用這個**。
2. **Firestore transaction**（`beginTransaction` + `commit`）把「標 idempotent + 寫 billing」包成一筆——較重，留 v1。
> webhook.js 已在註解標了這個點（「FirestoreStore 上線要用 transaction / create-if-absent 實作同語意」）。**MVP 用做法 1（create 409）即可，最省事又正確。**

---

## 4. 寄信通道（收據 email · 可選 · 不擋首筆收費）

`handleWebhook` 的 `mailer` 是注入 hook，**不給就不寄**（只寫站內收據，前端渲染）。要寄信時：
- Cloudflare 沒內建 SMTP。選項：**MailChannels（CF Worker 免費寄信夥伴，最省）** / Resend / SendGrid API。
- `sendMail(env, email)` 把 `receipt.js` 的 `buildReceiptEmail` 輸出（`{to, subject, text, html}`）丟給上述其一。
- **MVP 可先不寄**：付款成功後前端「訂閱管理」頁讀 `users/{uid}/billing/receipts/*` 自己渲染收據（`renderReceiptHTML` 同款），email v1 補。

---

## 5. 告警通道（驗章失敗 / 取消失敗 / 漏單 · 強烈建議）

`onAlert(evt)` 是注入 hook。沙利曼最擔心的三件事（取消沒真停扣 / 前端自解 / webhook 漏接）都靠告警被人看見：
- **MVP**：`logAlert` 先 `console.error`（Cloudflare dashboard 看 log）。
- **v1**：接 Slack webhook / Sentry。`evt.type` 已分類好（`checkmac_failed` / `cancel_failed` / `payment_failed` / `unknown_plan` / `missing_uid` / `unlock_write_failed` / `receipt_failed`）。
- `checkmac_failed` 頻繁 = 有人在打你的 webhook 試偽造，要特別盯。

---

## 6. 前端 app.html 要接什麼（本批【未動】app.html · 留主對話 review 後做）

> Agent 防護規則 1：agent 不直接改 app.html。以下是**待主對話接的清單**，不是已做。

1. **訂閱流程**：`openSubscribeFlow()` → `fetch(WORKER/ecpay/create-order, {plan, uid})` → 用回傳 fields 組 `<form>` auto-submit 到綠界（第一塊 `buildSubscriptionOrder` 已備好）。
2. **解鎖（紅線 1）**：付款後落地頁 `#sub-pending` **只顯示「處理中」** → `onSnapshot` 監聽 `users/{uid}/billing/state` → `billingStatus` 翻 active 才解鎖 UI。**前端 code 不得有任何「收到轉址就 `state.plan='pro'`」路徑。**
3. **後端權威化（§5 / authority.js）**：
   - 啟動 `onAuthStateChanged` → 讀 Firestore billing → `cacheFromBilling()` 寫進 `bp_subscription`(localStorage) 當**唯讀快取**。
   - UI gating 讀快取（`isCacheUsableForUI`）→ 反應快、但只是 UX。
   - **付費動作**（AI 呼叫等）→ Worker 端 `assertEntitled(store, uid, feature)` 每次查 Firestore，**前端改 localStorage 無效**。
4. **取消**：訂閱管理頁「取消訂閱」→ `fetch(WORKER/ecpay/cancel, {uid})` → 顯示結果。**不在前端改狀態**（紅線 2）。
5. **收據頁**：訂閱管理頁讀 `users/{uid}/billing/receipts/*` 渲染（可用 `renderReceiptHTML` 同款 / 直接連 Worker 產的 HTML）。

> ES5 提醒：app.html 前端維持 `var`/`function`、無 `const`/`let`/arrow。`authority.js` 的 C 段（`cacheFromBilling` / `isCacheUsableForUI`）是純邏輯、可在前端複刻。

---

## 7. Edward Infra 清單（只有 Edward 能做 · 城堡無法代勞）

### 🔴 第二塊上線前必備
- [ ] **Firebase 服務帳號 JSON**（路 A）→ 設 3 個 Worker secret（`FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` / `FIREBASE_PROJECT_ID`）。**私鑰最高機密、不落 git。**
- [ ] **Firestore security rules**：確認 `users/{uid}/billing/**` **禁止前端寫**（只放行本人讀）。解鎖只能 Worker 用服務帳號寫。（payroll 模組已有此 pattern，照抄。）
- [ ] **Cloudflare 部署權限**：`wrangler deploy` + `wrangler secret put` 要 Edward 的 Cloudflare 帳號（城堡不碰）。
- [ ] **綠界 sandbox 測試金鑰**（HashKey/HashIV stage 組）→ 設 `ECPAY_HASH_KEY` / `ECPAY_HASH_IV` / `ECPAY_ENV=stage`（第一塊也需要）。

### 🟠 強烈建議（上線前補）
- [ ] **告警通道**（Slack webhook / Sentry）接 `onAlert`——至少 MVP `console.error` 頂著。
- [ ] **PeriodReturnURL / ReturnURL 對外可達**：綠界要能 POST 到 `WORKER_BASE/ecpay/webhook`。確認 Worker 自訂域名 / workers.dev 在綠界後台填對。

### 🟢 可延後（v1 · 不擋首筆收費）
- [ ] **寄信通道**（MailChannels / Resend）接 `mailer`——MVP 站內顯示收據即可。
- [ ] **對帳 cron**（webhook 漏接第二道網）：`QueryCreditCardPeriodInfo` 主動補查——MVP 先告警頂著（沙利曼 D3）。
- [ ] **到期續簽 / 降級排程**：`ExecTimes=12` 非無限（卡西法風險 #3）；取消後到 `nextBillingAt` 降 free（本批 cancel 故意不動 plan，等排程降級）。

### ⛔ 外部前置（綠界帳號 · critical path 起點 · 建議今天問）
- [ ] 綠界 3502366「**信用卡定期定額**」feature 是否已開通（Q1 但書 #1）。
- [ ] 個人戶額度 30 萬是否夠初期規模（Q1 但書 #2）。
- [ ] 取得正式金鑰 + PCI 托管頁核准（上線最後一關）。

---

## 8. 下一塊建議（第三塊）

> 第二塊把「收錢 → 解鎖 → 收據 → 取消」的**邏輯骨架 + 測試**做完了。第三塊建議按「能不能用 sandbox 開工」排：

1. **🟢 接 `FirestoreStore`（路 A REST + JWT）**——這是把骨架變成「真能寫資料」的關鍵，且 **sandbox 就能做**（用測試 Firebase 專案 + 測試綠界金鑰，不碰真錢真客）。idempotent 用 create-409 做法。**最高優先**，因為 webhook/cancel/收據全卡在它。
2. **🟢 Worker `/ecpay/*` 路由 wiring**（§2）——把第一+二塊模組 import 進 worker.js bundle，pathname 分流。小工，sandbox 可端到端測（建單 → 刷測試卡 → webhook 解鎖 → 取消）。
3. **🟢 前端 app.html 接線**（§6，**主對話 review 後做、agent 不直接改**）——openSubscribeFlow / onSnapshot 解鎖 / 後端權威化快取 / 取消按鈕 / 收據頁。
4. **🟡 sandbox 端到端跑沙利曼 A1-A5 / C1-C3 / F1-F3**——尤其 **C1「綠界後台截圖確認停用」**（紅線 2 驗收，要 Edward 配合看後台）+ A2 偽造 webhook 擋下（本批單元測已證邏輯，sandbox 再證真環境）。
5. **🟡 告警 + 寄信通道**接上（§4 §5）。

> **我最想先幫 Edward 擋的**：別等「全部 infra 到位」才動——**先接 FirestoreStore（路 A）+ 路由 wiring，用測試 Firebase + 綠界 sandbox 端到端跑通一次**，這條走通＝整個第二塊邏輯被真環境驗證，剩下都是換正式金鑰/域名的收尾。Team 自動改金額仍**別進 MVP**（綠界無 API，技術計畫 Q2 紅燈）。

---

## 9. 安全界線複查（Gate 5 預檢 · 本批自審）

- ✅ `src/` 全檔**零金鑰字面**——HashKey/HashIV/服務帳號私鑰一律 env/secret 傳入。
- ✅ test 金鑰全是綠界**官方公開範例值**（`pwFHCqoQZGmho4w6`/`EkRm7iFT261dpevs`），非 Edward 真金鑰。
- ✅ **前端不自解**：解鎖只在 `webhook.js`（server 驗章後）；`authority.js` 明寫 localStorage 唯讀快取、付費動作 Worker 查 Firestore。
- ✅ **驗章擋偽造**：webhook 驗章失敗 → 丟棄 + 告警（test A2 證 billing 不被寫）。
- ✅ **取消真呼叫綠界**：cancel 綠界沒回 RtnCode=1 / 網路錯 → 絕不寫 cancelled（test 證 active 不被錯標）。
- ✅ **收據只存末四碼**：`receipt.js` 末四碼防呆（給全卡號只留末 4）；無 CVV/效期/全卡號欄位。
- ✅ **財會憑證分離**：收據/交易獨立 collection + `legalRetention:true`（紅線 3，store 自動標）。
- ⚠️ **idempotent 原子性**：mock 已對；**FirestoreStore 上線要用 create-409**（§3 已標、必做）。

---
---

# 🟦 第四塊接線實況（2026-06-25 · 真記帳 FirestoreStore + Worker 路由 wiring · 仍未部署）

> 上面 §0–§9 是【第二塊】寫的整合「計畫」（當時 worker.js 未動、FirestoreStore 還沒寫）。
> 本段是【第四塊】**真的做了什麼**——§3 那塊最大的 infra（FirestoreStore）+ §2 的路由 wiring
> 都已落地、全綠（mock 測試）。**仍零真金鑰 / 零真 Firebase / 未部署**——換正式金鑰 + 部署留 Edward。

## A. 第四塊新增/改了哪些檔

| 檔 | 動作 | 內容 |
|---|---|---|
| `src/firestore-store.js` | **新增** | `FirestoreStore`（實作 `BillingStore` 七法）：Firestore REST + 服務帳號 JWT（WebCrypto **RS256**，無 npm）。idempotent 用 **createDocument → HTTP 409**（§3 建議的做法 1，原子）。`setBilling` 用 **PATCH + `updateMask`** 做 merge。收據/交易用 createDocument + 自動 `legalRetention`。**零金鑰字面**，服務帳號從 `env.FIREBASE_SERVICE_ACCOUNT`（或拆 3 個 secret）注入。 |
| `test/firestore-store.test.mjs` | **新增（+39 案）** | mock fetch，**不連真 Firebase**。涵蓋：typed value 往返 / RS256 真簽真驗 / token 快取 / 404→null / PATCH updateMask merge / **⭐ 409 idempotent** / legalRetention / 缺金鑰 lazy 報錯 / 介面相容。 |
| `test/run-all.mjs` | 加一行 | 把 `firestore-store.test.mjs` 納入。**全套 9 → 10 suite，271 → 414 案全綠**（exit 0）。 |
| `_workspace/ai-proxy/worker.js` | **改（向後相容）** | 加 `/ecpay/*` 路由群（§B）。LLM proxy 一行邏輯沒動。**本機檔、未 push、未 deploy。** |

## B. worker.js 真的長怎樣（已接好，非計畫）

`fetch()` 最前面（CORS/origin 檢查【之前】）插 pathname 分流；`/ecpay/*` 自成一條 return：

```
fetch(request, env):
  url = new URL(request.url)
  if url.pathname startsWith '/ecpay/':  return handleEcpay(...)   ← 新增，隔離
  ...以下 LLM proxy 原封不動...
```

`handleEcpay` 路由表（全走 `makeFirestoreStore(env)` 真記帳）：

| 路由 | method | 進來 | 出去 | 接哪支模組 |
|---|---|---|---|---|
| `/ecpay/create-order` | POST | JSON `{plan, uid}` | JSON `{action, fields}` | `buildSubscriptionOrder`（第一塊） |
| `/ecpay/webhook` | POST | **form-urlencoded**（綠界 server） | **純文字 `1\|OK`** | `handleWebhook`（紅線 1） |
| `/ecpay/cancel` | POST | JSON `{uid}` | JSON 結果 | `handleCancel`（紅線 2，`fetchImpl`=真打綠界） |
| `/ecpay/refund` | POST | form→退款通知 / JSON→admin 手動 | 純文字 / JSON | `handleRefundNotify` / `handleManualRefund` |

注入的三個 hook（worker.js 已接，MVP 版）：
- `onAlert` → `console.error('[ECPAY_ALERT]', ...)`（CF dashboard 看 log；v1 接 Slack/Sentry）。
- `lookupEmail` → **MVP 回空字串**（收據走站內顯示；email 通道 v1 補，TODO 已標在 `ecpayLookupEmail`）。
- `mailer` → **故意不給** → `handleWebhook` 回 `emailQueued:false`（站內收據）。

> **整合測試（mock，端到端跑過真 worker.js）證了 17 件**：LLM proxy 沒被破壞 / 偽造章不解鎖 + 告警 / 合法章經 FirestoreStore 解鎖（active + 499→pro 反查）+ 重送 idempotent(409) / create-order 回 64 字簽章 + 權威金額 / 未知 plan→400。（測試 harness 為一次性，已刪，不留 repo。）

## C. ⭐ 部署前一定要做：把 ecpay 模組複製進 Worker bundle

worker.js 的 import 寫 `./ecpay/*.js`（worker.js 同層的 `ecpay/` 夾）。**這個夾現在不存在**——
因為模組在 `billing-scaffold/ecpay/src/`（跨資料夾，不該讓 worker.js 直接 import 進另一棵樹）。
部署前複製過去：

```bash
# worker.js 在 _workspace/ai-proxy/，模組在 billing-scaffold/ecpay/src/
cd "<repo>/_workspace/ai-proxy"
mkdir -p ecpay
cp "<repo>/projects/beyondpath/billing-scaffold/ecpay/src/"*.js ecpay/
# 確認 7 支都在：checkmac config create-order webhook cancel receipt authority dunning refund store firestore-store
```

> Wrangler bundle 階段才解析這些 import；夾沒就位 = `wrangler deploy` 會報找不到模組（不會 silent）。
> 之後要更新金流邏輯，改 `src/` → 重跑 `cp` → 重 deploy（src 仍是 single source）。

## D. 🔴 Edward 部署 secret + 指令清單（城堡無法代勞）

### D-1 · 要設的 wrangler secret（全部 `wrangler secret put`，**永不落 git / wrangler.toml**）

```bash
cd "<repo>/_workspace/ai-proxy"

# ── 綠界（第一塊 create-order + webhook/cancel 驗章都要）──
wrangler secret put ECPAY_HASH_KEY        # 綠界後台 HashKey（sandbox 先用 stage 那組）
wrangler secret put ECPAY_HASH_IV         # 綠界後台 HashIV
# ECPAY_ENV：'stage'（sandbox）/ 'prod'（正式）——可放 wrangler.toml [vars]（非機密）或 secret

# ── Firebase 服務帳號（FirestoreStore 寫 billing/收據/交易/idempotent）──
wrangler secret put FIREBASE_SERVICE_ACCOUNT   # 整包服務帳號 JSON（建議；一個 secret 搞定）
#   產生：Firebase console → 專案設定 → 服務帳戶 → 產生新的私密金鑰 → 下載 JSON → 整包貼進 stdin
#   （或拆三個：FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY / FIREBASE_PROJECT_ID）
```

非機密、可放 `wrangler.toml [vars]`：
```toml
[vars]
ECPAY_ENV = "stage"
WORKER_BASE = "https://path-ai-proxy.<你的子網域>.workers.dev"   # 本 Worker 對外網址
APP_BASE = "https://beyondspec.tw"                              # 前端網址
```

> `WORKER_BASE` / `APP_BASE` 決定 create-order 寫進綠界訂單的 **ReturnURL / PeriodReturnURL / OrderResultURL**，
> 必須是綠界打得到的真網址（見 D-3）。

### D-2 · 部署指令

```bash
cd "<repo>/_workspace/ai-proxy"
cp "<repo>/projects/beyondpath/billing-scaffold/ecpay/src/"*.js ecpay/   # 先複製模組（§C）
wrangler deploy                                                          # 部署
wrangler tail                                                            # 看 log（含 [ECPAY_ALERT]）
```

### D-3 · 綠界後台要填的 Worker 網址

create-order 自動把這兩個 URL 寫進綠界訂單（都指向同一支 webhook）：
- **ReturnURL**（首扣結果，server-to-server）= `WORKER_BASE` + `/ecpay/webhook`
- **PeriodReturnURL**（每期續扣結果）= `WORKER_BASE` + `/ecpay/webhook`
- **OrderResultURL**（前端落地，只顯示「處理中」、不可自解）= `APP_BASE` + `/path/app/#sub-pending`

→ 確認綠界後台「**信用卡定期定額**」已開通，且 webhook 網址（`WORKER_BASE/ecpay/webhook`）對外可達（workers.dev 預設可達；自訂域名要設好 DNS/route）。

### D-4 · Firestore security rules（解鎖只能 Worker 寫）

確認 `users/{uid}/billing/**` **禁止前端寫**、只放行本人讀；解鎖只由 Worker 用服務帳號（繞過 rules）寫。
（payroll / 既有模組已有此 pattern，照抄。）範例：
```
match /users/{uid}/billing/{document=**} {
  allow read: if request.auth != null && request.auth.uid == uid;
  allow write: if false;   // 只有服務帳號（Admin/REST）能寫，前端一律拒
}
```

### D-5 · `/ecpay/refund` admin 路徑要加身分驗證（上線前 TODO）

`/ecpay/refund` 的 JSON（admin 手動 re-lock）目前**沒有管理員驗證**——上線前必須加（Worker secret 比對 admin token / 或限內網）。退款通知（form-urlencoded）那條有綠界驗章，安全。

## E. 安全複查（第四塊增量 · Gate 5 預檢）

- ✅ `firestore-store.js` **零金鑰字面**——服務帳號私鑰只從 `env` 注入；測試用 runtime 現產的 RSA（非真金鑰）。
- ✅ **idempotent 升級為原子**：FirestoreStore 用 **createDocument 409**（不再依賴同步 Map）——§3 標的「上線必做」已做。
- ✅ **服務帳號私鑰 = 最高機密**：與 HashKey/HashIV 同級，只進 `wrangler secret`，永不落 git/prompt/log。
- ✅ **路由隔離**：`/ecpay/*` 自成一條 return；整合測試證 LLM proxy 未受影響、金流偽造章不解鎖。
- ✅ **webhook 回純文字**：`/ecpay/webhook` 不套 CORS/JSON header（綠界規格），其餘前端路由帶 CORS。
- ⚠️ **未部署**：worker.js 是本機檔（未 push）；`ecpay/` bundle 夾未建；真金鑰未設——全留 Edward。

## F. 交接給主對話（下一塊 = 前端 app.html 接線 · agent 不直接改）

第四塊把「**真能寫資料**」這層補完了（FirestoreStore）+ Worker 路由全接好。剩**前端接線**（§6 那份清單），
依城堡規則 **agent 不直接改 app.html、留主對話 review 後做**：

1. **訂閱**：`openSubscribeFlow()` → `fetch(WORKER_BASE + '/ecpay/create-order', {plan, uid})` → 用回傳 `fields` 組 `<form>` auto-submit 到 `action`。
2. **解鎖（紅線 1）**：付款落地 `#sub-pending` **只顯示「處理中」** → `onSnapshot('users/{uid}/billing/state')` → `billingStatus==='active'` 才解鎖 UI。**前端不得有任何「收到轉址就 `state.plan='pro'`」路徑。**
3. **後端權威化**：`onAuthStateChanged` → 讀 Firestore billing → 寫 `bp_subscription`(localStorage) 當**唯讀快取**（`authority.js` 的 `cacheFromBilling`/`isCacheUsableForUI` 純邏輯可 ES5 複刻）；付費動作仍每次回 Worker 查。
4. **取消**：訂閱管理「取消」→ `fetch(WORKER_BASE + '/ecpay/cancel', {uid})` → 顯示結果。**不在前端改狀態。**
5. **收據頁**：讀 `users/{uid}/billing/receipts/*` 渲染（`renderReceiptHTML` 同款）。

> ES5 提醒：app.html 前端維持 `var`/`function`、無 `const`/`let`/arrow。
> 主對話接前端前，先跑一次 `node test/run-all.mjs`（414 全綠）確認後端骨架沒被動到。
