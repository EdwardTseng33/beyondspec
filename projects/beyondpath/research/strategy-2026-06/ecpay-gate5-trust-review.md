# BeyondSpec × 綠界金流 — Gate 5 信任審查（上線前資安／合規總檢查）

> 沙利曼（Head of Trust）· 2026-06-25 · 階段二金流批 · **只讀只審、未改任何 code、未部署、未碰真金鑰**
> 審查方法：逐行讀 13 支 src 模組 + worker.js 金流路由群 + 實跑測試套件 + secret/PCI grep
> 定位（6/5 Edward 拍板）：本檔是**信任判斷 + 我願親手把缺的鎖補上去**。三紅線是我能給的最強建議，不是否決權。**真錢何時上線 = Edward 拍板。**

---

## Gate 5 verdict：**CONDITIONAL PASS**

> sandbox 端到端跑通 + 補 1 個 P0 admin 洞 + 確認 3 個外部前置 → 真扣款可放行。
> 程式邏輯這關我簽了；「真錢上線」要先補下面 P0 + 跑完 sandbox 真環境 case。

**審查結果摘要：三條紅線在程式邏輯層全部守住。工程品質紮實。** 測試 **469 案全綠 / 0 fail**（src `node test/run-all.mjs`，10 suite）。secret 零外洩、PCI SAQ-A 成立。**但尚未被真環境（綠界 sandbox + 真 Firebase）驗證過一次**，且有一個 admin 端點未授權洞 + reauth 未接線。

---

## 逐紅線打勾（附證據行號）

| 紅線 | 判定 | 證據（檔:行號） |
|---|---|---|
| **🔴1 webhook 必 server 驗章才解鎖** | ✅ **PASS** | 驗章在碰 billing【之前】`webhook.js:160-171`；失敗丟棄+告警+回 200 不解鎖 `:167-170`。idempotent key 含期數 `MerchantTradeNo_Gwsr` `:78-82` `:233-249`（第 2 期不誤判重放）。首扣失敗走 `first_charge_failed`【絕不解鎖】`:190-211`。前端零自解路徑（`authority.js:144-169` localStorage 僅唯讀快取、`:127-141` 付費動作 `assertEntitled` 查 Firestore）。webhook suite 82 案含「改金額不重簽→verify_failed→billing 沒寫」 |
| **🔴2 取消必真打綠界停扣** | ✅ **PASS** | 真 POST `CreditCardPeriodAction Action=Cancel`+簽章 `cancel.js:135-157`；綠界沒回 `RtnCode==1`/HTTP 非 2xx/網路 throw →【絕不】標 cancelled+回 502+告警 `:153-177`。確認停用才寫 cancelled `:179-188`，plan 不動到當期結束 `:187`。cancel suite 38 案 |
| **🔴3 憑證與產品資料分離存（稅法）** | ✅ **PASS（架構層）** | `legalRetention:true`+`kind:'receipt'` `receipt.js:112-113`；「非統一發票」宣告 `:54`；末四碼防呆（全卡號只留末 4）`:92-93`；獨立 collection `billing/receipts`+`billing/transactions`（`store.js:20`/`firestore-store.js:22-23`）。Edward 個人無統編→只開收據，免電子發票字軌整套。清資料邏輯 v1 補（結構 Day-1 已對） |

---

## 金鑰零外洩 · PCI

✅ **乾淨**。
- 真 PAT/AWS/Stripe 掃描（`ghp_`/`AKIA`/`sk_live_`）→ src + worker.js + 部署 ecpay **零命中**。
- demo key（`pwFHCqoQ`/`EkRm7iFT`）**只在 6 個 test fixture**（cancel/checkmac/create-order/reauth/refund/webhook）、src 零字面。
- 卡號/CVV/效期收集欄位 → **無**（唯一命中是 `receipt.js:16` 註解文字「絕不存全卡號/CVV/效期」）。
- 服務帳號私鑰只從 `env` 注入（`firestore-store.js:257-282`）、零字面。
- HashKey/HashIV 一律呼叫端傳入（`checkmac.js:8` 不含值、`create-order.js:90-93`/`cancel.js:70`/`reauth.js:82` 缺金鑰明確報錯不默默簽錯章）。
- → **SAQ-A 最輕等級成立、機密界線（3502366 可寫 / HashKey·HashIV 絕不進 git）守住。**

---

## 新增塊逐項

- **reauth** ✅ 寫得最漂亮：`charged:false` 永遠回（`:205-206`、`:148-150` 所有路徑）、**介面層根本不收 store**（`:116` 設計註 + 測試 `[6]:144` 證明「沒有任何寫 billing 能力」）→ 杜絕「受理當扣成功」白嫖。17 案。
- **dunning** ✅ 寬限不順延防無限續命（`:168-169`）、三條件取先到上鎖（`:188-191`）、idempotent seenKeys（`:153-161`）、`isGraceExpired` 讀取端兜底（`:287-293`）。73 案。
- **refund** ✅ 任何態→locked（`:106-121`）、idempotent refunds[] 去重（`:91-95`）、chargeback 高等級告警（`:186-188`）、退費三件綁定提醒（`:150-153`）。47 案。
- **authority** ✅ fail-closed：store missing/read error/寬限過全回 `allowed:false`（`:128-132`、`:67`）。28 案。
- **firestore-store** ✅ idempotent 升級為**原子**：createDocument+documentId+409 判 duplicate（`:440-459`），不靠 transaction，正確。39 案。
- **CheckMacValue** ✅ `.NET URLEncode` 對 `~`/空格校正正確（`:56-61`），README 證對綠界官方範例逐字過 + stage 真伺服器接受簽章（無 10200073）。23 案。

---

## Worker 路由安全

✅ `/ecpay/*` 與 LLM proxy **完全隔離**：`worker.js:337-340` fetch 最前面早 return，碰不到 rate-limit/SYSTEM_PROMPTS/callAnthropic。webhook 回純文字不套 CORS（`:530-536`、`:613`）符合綠界規格。CORS 走 `ALLOWED_ORIGINS`（`:519-520`）合理。lookupEmail 回空只影響「不寄信、走站內收據」（`:566-570`），不影響解鎖正確性。
⚠️ **唯一缺口 = 下面 P0#1 的 refund admin 路徑少一道門。**

---

## 🔴 P0 · 阻擋真扣款上線（缺任一，強烈建議先別開收費）

1. **`/ecpay/refund` admin JSON 路徑無身分驗證**（已確認 worker.js 掃不到任何 admin token 比對；README D-5 自標 TODO 未補）。`worker.js:645-654` 任何人 POST `{uid, event}` 即可把**任意用戶**鎖成 locked = 未授權 DoS / 惡意鎖客。**上線前必加** admin token 比對（Worker secret）或限內網。→ **我可代寫**（header 比對 + 401，10 行內，與開發並行不卡進度）。
2. **sandbox 端到端從沒跑過**——469 案全是 mock/邏輯層。spec §8 的真環境 case 必跑：**A2 偽造 webhook 被丟棄 / C1 取消後綠界後台確認停用截圖 / B1 前端改金額無效 / G1 stage→prod 金鑰切換**。**C1 堅持要綠界後台截圖**（不接受 app 顯示已取消）——這是我列「最可能上社會新聞」的坑。
3. **webhook 解鎖寫失敗的 idempotent 回滾**（`webhook.js:298-307` 已自標）：FirestoreStore 上線時「標 idempotent(409)」與「寫 billing」非同一 transaction → markProcessed 成功但 setBilling 失敗 → 綠界重送撞 duplicate 而**永久漏解鎖**（用戶付了錢卡住）。MVP 可接受（靠 `unlock_write_failed` 告警+人工補），但**上線前要確認告警看得到**（至少 `wrangler tail`，別靜默）。

## 🟡 P1 · 上線後補（不擋首筆）

- **ReAuth 未接線**：`reauth.js` 寫好但 worker.js 完全沒 import/沒路由 + **部署版 `ecpay/` 夾缺 reauth.js**（其餘 12 支與 src 一致）。MVP 可接受（dunning 寬限頂著）；部署複製記得 §C 的 `cp` 要含 reauth.js。
- **告警通道**：MVP 是 `console.error`（`worker.js:556`）。`checkmac_failed` 頻繁 = 有人試偽造，v1 務必接 Slack/Sentry。
- **lookupEmail 回空**：收據只走站內、不寄信，用戶收不到 email 收據可能客訴，v1 補。
- **隱私權政策 + 服務條款 + 同意 checkbox 不可預設打勾**（spec §6）：收真錢前法律面必備，不在 code、是 Edward 要上線的頁面。

## 外部前置（只有 Edward 能做）

- [ ] 綠界 3502366「信用卡定期定額」+ PCI 托管頁**核准開通**
- [ ] Firebase 服務帳號 JSON → 設 worker secret（`FIREBASE_SERVICE_ACCOUNT` / `ECPAY_HASH_KEY` / `ECPAY_HASH_IV`）
- [ ] Firestore rules：`users/{uid}/billing/**` 前端禁寫（README D-4 範例）

---

## 觀察項（不阻擋，記錄）

- **store.js InMemoryStore 的 saveReceipt/saveTransaction 直接覆寫**（`:105-109`/`:117-121`），而 FirestoreStore 是 create-409 回既有。mock 測試「重複開收據」行為與真 store 不同（mock 覆寫、真 store 回既有）——非安全漏洞（最終都只一筆），但測試覆蓋有此盲區。
- **webhook `unknownPlan` 仍解鎖**（`:259-262`）：金額對不上任何方案仍解鎖（避免漏單），標 `unknownPlan` 供人工查。建單金額由 server 決定（`create-order.js:95` `planDef.amount`、前端不送金額），所以正常流程金額不會異常；此分支是兜底，可接受。

---

## 一句話信任建議

**程式邏輯這關我簽了——三紅線守得乾淨、secret 零外洩、PCI SAQ-A 成立、469 案全綠。「真錢上線」我的信任建議：先補 P0#1（refund admin token，我可代寫）+ 在綠界 sandbox 跑過 A2/B1/C1/G1 四個真環境 case（C1 要綠界後台截圖）+ 確認告警看得到，這三件齊了，真扣款我從信任角度沒有保留。是否現在開收費、何時開 = Edward 拍板。我只負責把鎖加到最牢，不擋前進。**

---

*沙利曼 · Head of Trust · Gate 5 · 2026-06-25 · CONDITIONAL PASS · 未改任何 code / 未部署 / 未碰真金鑰 · 審查基準 = billing-scaffold/ecpay/src（SSOT）+ worker.js 金流路由 + ecpay-integration-trust-spec.md 三紅線*
