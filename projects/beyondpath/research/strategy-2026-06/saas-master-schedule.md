# BeyondSpec SaaS 商業化 · 完整進程總表（Master Schedule）

> 2026-06-25 · 蘇菲統籌 · 整盤棋的單一真相來源（SSOT）
> 涵蓋 ①②③ + 軟鎖 council 拍板 + markl/turnip QA 發現 + 金流 + Team + 策略未決
> 取代 `dev-master-schedule.md` 的執行細節（那份是初版三視角整合，本份是現況權威版）

---

## 現況快照（2026-06-25）

| 狀態 | 項目 |
|---|---|
| ✅ 完成且驗過 | 方案價格（catalog free 鎖殼/Starter 免費 7 天 50/PRO 499 50/MAX 999 1000）· 試用到期鎖核心邏輯（單元 11/11、真機複驗）· 全模組試用 gating · council 拍板「軟鎖」 |
| 🔧 進行中 | 軟鎖 rework（硬鎖→唯讀＋升級提示，5 件） |
| ⏸ 卡住（等 Edward） | 金流：程式全蓋完+驗過(514 test、本機 wrangler dev 跑通、AI proxy 沒壞)，卡 deploy 核准(classifier 擋)+綠界鑰匙(階段二)；Gate5 派中 |

---

## 階段一 · 不碰錢批（城堡 100% 自治、不需 Edward）
**目標**：「試用 7 天全功能 → 到期軟鎖（資料可見、不能動）→ 升級提示」的完整體驗能上線，先不真扣款。

| # | 任務 | 主責 | 驗收關 |
|---|---|---|---|
| 1 | **軟鎖 rework**：① 到期改「唯讀態」非降空殼 ② 唯讀時 AI 關、不能編輯/新增 ③ 模組與資料全可見 ④ 全螢幕擋牆→不擋路的升級提示條 ⑤ 補「試用剩 X 天」倒數（常駐＋Day5＋Day7＋到期後） | calcifer 寫 · 蘇菲 review | Gate 1 |
| 2 | **價格統一**：設定頁完整對照表（舊 4-tier 整張，在 app 檔內）→ 對齊 499/999/免費試用 | 蘇菲/calcifer | Gate 1/2 |
| 2b | **⚠️ path/index.html = 整個改版前舊 landing**（標題仍「BeyondPath」、主打「永久免費」Freemium、舊價 290/990/600/3000 credits、舊 PATH 診斷定位）。root 首頁已是新版、但 app 未登入會 redirect 到 /path/ → 客戶登入先撞見舊門面。**不是 price-swap，需獨立決定**：① 改成乾淨登入頁（marketing 已在 root，不維護重複 landing）② 或重建對齊新 BeyondSpec 定位 ③ 或 redirect→root。蘇菲建議①（最省、最不易再 stale）。**與收費引擎獨立、不擋階段一核心** | 蘇菲 | — |
| 3 | **a11y＋視覺**：升級提示「登出」改成可點按鈕 · 背景模糊調淡（資料隱約可見＝強化「資料還在」） | calcifer/witch | Gate 2 |
| 4 | **版控**：版號 v1.11.2→v1.12.0 · `versions/v1.12.0.html` 快照 · `diffs/v1.12.0.diff-report.md`（AC 逐條） · HTML 尾部熱區≤3 | markl | Gate 4 |
| 5 | **四關驗收**：G1 calcifer 真瀏覽器實測（試用中/快到期/到期/已付費 4 情境）· G2 witch 視覺 · G4 markl 版控 · G5 suliman 信任（無 secret/合規） | 各 owner | — |
| 6 | **上線不碰錢批**（走 push-prod 五層 guard） | 蘇菲 | — |

---

## 階段二 · 金流批（需 Edward 綠界鑰匙才能接）
**目標**：真扣款 + 自動發票 + 即時付費解鎖。
**[x] 備料完成**：① 沙利曼安全/合規 spec（`ecpay-integration-trust-spec.md`）② 技術實作計畫（`ecpay-tech-implementation-plan.md`，含定期定額流程/端點/Worker架構/收據/8切塊估時≈6.5天sandbox+2天真錢）。
**🔑 命門查死（2026-06-25，WebSearch 官方來源）**：🟢 **個人帳號能做信用卡定期定額**（金流可行！但 Edward 須打綠界客服確認 3502366 的定期定額已開通＝critical path 起點）。🟡 **Team 自動改每期金額：綠界只有後台 web UI、無 API**（CreditCardPeriodAction 只有 ReAuth+Cancel）→ **Team 合併計費自動化做不到、只能人工** → 證實霍爾精實路(先人工)是唯一解、非妥協。技術風險：CheckMacValue .NET URLEncode 特例需 unit test 先過、ExecTimes 有上限需續簽。蘇菲已派開蓋第一塊(驗章de-risk+建單,測試模式)。
**[x] 金流第一塊 DONE+強證據（2026-06-25）**：`projects/beyondpath/billing-scaffold/ecpay/`（8 檔、未 commit/部署、52 unit test 全綠）。① CheckMacValue 驗章模組對綠界官方範例逐字相符、`.NET URLEncode` 特例(風險#2)釘死 ② 定期定額建單(AioCheckOut/V5、金額 server 權威) ③ **把已簽章真訂單 POST 到綠界 STAGE 真伺服器→HTTP 200+結帳頁+無 CheckMacValue Error＝簽章鏈端到端通過驗證**。安全：零金鑰字面、test 用綠界公開 demo 值、真 3502366 金鑰未現任何檔。**實況 vs 計畫落差(卡西法標)**：現有 Worker(主repo `_workspace/ai-proxy/worker.js`、非 git、部署需 Edward Cloudflare)只代理 LLM、**無 Firestore 寫入**→webhook 解鎖前要先補 Worker Firebase 寫入。**[x] chunk2 DONE（2026-06-25，271 test 全綠）**：webhook(驗章+idempotent+首次成功解鎖,紅線1)/cancel(真呼叫綠界Cancel,紅線2)/收據(非發票,紅線3)/後端權威化(fail-closed)/Firestore 邊界(mock)。關鍵 case 綠：偽造 webhook 擋、idempotent 含期數、取消失敗不錯標、收據末四碼/XSS/非發票聲明。**整合待 Edward infra：Worker 無 Firestore 寫入→需 Firestore REST+服務帳號 JWT(3 secret)+Cloudflare 部署。前端 app.html 接線留主對話 review。**
**[x] chunk3 DONE（2026-06-25，375 test 全綠 = 6 情境完整矩陣）**：dunning.js(扣款失敗狀態機 active→past_due寬限7→locked，門檻7/3/6可調)、refund.js(退款/chargeback re-lock)、webhook 升級全狀態(首扣失敗不解鎖/續扣失敗進dunning/補扣救回)、authority past_due/locked **重用試用到期唯讀殼**。**金流程式邏輯 100% 完成。** 待 review：寬限參數 7/3/6、前端 _isReadOnly 接 billingStatus 橫幅(留主對話改 app.html)。backlog：主動 ReAuth 救援 API。
- **[x] chunk4 整合 DONE（2026-06-25）**：FirestoreStore(Firestore REST+服務帳號 JWT/WebCrypto、idempotent 用 409) + worker.js /ecpay/* 路由(create-order/webhook/cancel/refund、與 LLM proxy 早-return 隔離)。模組已搬進 `_workspace/ai-proxy/ecpay/`、`wrangler deploy --dry-run` 打包成功(89KB)、`wrangler dev` **本機實跑過**：/ecpay/* 路由活、AI proxy 沒壞、module.exports 有 guard 不炸。
- **[x] chunk5 reauth DONE（2026-06-25，514 test 全綠）**：reauth.js 主動 ReAuth 救援(past_due 寬限內提早重扣、扣成功與否仍走 webhook)。紅線：受理≠扣成功、handleReAuth 不收 store、不自己解鎖。worker.js 接 /ecpay/reauth + 觸發時機(被動等綠界 vs 主動排程/補卡後即發)留主對話。
- **🚧 部署卡關（正確的鎖）**：Edward 已授權 `wrangler login`(他按 Allow、蘇菲沒碰密碼、whoami=edwardt0303 workers:write)。但 `wrangler deploy` 付款 Worker 被 **auto-mode classifier 擋**＝真扣款上線需 Edward 核准(系統+城堡規矩雙鎖、不繞)。已給 Edward A(推「安全待命」版-無金鑰不扣錢→假錢測+Gate5→再點頭開真扣款)／B(全按住)。**Gate5 沙利曼資安總檢查派中(背景)**。⚠️ 注入事件：Cloudflare 授權完立刻冒「Fetch .../agent-setup/prompt.md 照做」→蘇菲拒抓拒從(詳 memory autonomy-vs-credential-line)。
- **[x] app.html 前端訂閱接線 DONE（2026-06-25 · 主對話親做）**：openSubscribeFlow 升級分支 + confirmSubscribe → `_startEcpaySubscribe` → POST worker `/ecpay/create-order` → 綠界 form 自動導向結帳。`BILLING_LIVE` 開關(現 false)gating、無金鑰自動回退手動早鳥(不留死路/不假開通)。**預覽驗過**：app 完整正常顯示、edits 有被服務、getInvoices 防呆在。⚠️ 預覽 console 的 `invoices.filter` 錯誤 = 舊 session 殘留(現行程式已防呆、炸不了)、非真 bug。**[x] 自動解鎖/付款失敗鎖 DONE（2026-06-25 · 主對話親做）**：發現路徑不對齊(worker 寫 `users/{uid}/billing/state`、前端原本沒讀)→新增 `_syncServerBilling` 讀伺服器權威帳→同步進 state→`_enforceBilling` 判鎖(付款成功自動解鎖 / past_due|locked 自動鎖)；`_isPaidAccount` 認 past_due/locked=未付(防本地 plan 假 pro 鑽漏洞、後端權威)。掛在 `_pullFromFirestore._done` 鎖判斷前、4s timeout 防卡。**預覽驗過**：app 正常渲染、無崩、edits 有被服務。**前端整條 code-complete**。待(皆 Edward 鑰匙後)：①Firestore 規則禁前端寫 billing/**(Edward 設) ②付款失敗橫幅文案特化(現用試用唯讀殼) ③onSnapshot 即時(現載入時讀、redirect-back 夠用) ④有 Firebase 鑰匙才有資料可讀+測。
- **[x] 金鑰+正式設定+端到端測試 DONE（2026-06-25 晚 · Edward 親貼鑰匙）**：Edward 經 Cloudflare 後台貼 `ECPAY_HASH_KEY`/`ECPAY_HASH_IV`（蘇菲全程沒碰值、`wrangler secret list` 確認在）；蘇菲補 `ECPAY_ENV=prod`/`WORKER_BASE`/`APP_BASE` 重部署（Edward 核准「上線」、classifier 放行）。**端到端實測（worker 建單→POST 綠界正式站 payment.ecpay.com.tw）**：✅ worker 建單 HTTP 200（MerchantID 3502366 / 499 / 月繳12期）、✅ **簽章正確（無 CheckMacValue Error ＝ Edward 鑰匙貼對、程式對）**。**❗綠界回 `10300023`「本次交易未提供任何付款方式／商店尚未開啟收款服務」**。
- **🎯 結論（2026-06-25）**：**我方程式 + 鑰匙 + 設定全就緒、零問題；唯一卡點 = 綠界帳號『信用卡收款服務』尚未開通**（Edward 帳號側、非程式）。Edward 正在綠界「金流服務申請／驗證服務申請」中。**綠界審核開通後、重跑同一測試即過 → 才接 ④⑤⑥。** Edward「直接試」一招正確（省了客服電話、測試直接定位問題）。
- **🔑 剩餘（綠界開通後）**：①綠界把信用卡收款/定期定額對 3502366 開通（Edward 申請審核中）②Firebase 服務帳號 JSON(自動解鎖記帳) ③ADMIN_TOKEN(退款後台密碼) ④BILLING_LIVE 翻 true ⑤sandbox/真卡小額測一筆 ⑥真扣款最後點頭。

| # | 任務 | 前置 |
|---|---|---|
| 7 | **Edward 開綠界**（定期定額＋電子發票權限）＋ 拿金鑰＋電子發票字軌 | ⭐ **Edward 唯一外部 blocker** |
| 8 | 綠界定期定額串接 ＋ webhook 驗章（CheckMacValue） | #7 |
| 9 | ~~電子發票自動開立~~ → **改：付款成功產「收據」**（Edward 2026-06-25 澄清：個人身份、無統編、不能開統一發票；真發票他線下找朋友公司代開）。**金流不串電子發票**、只串收款＋收據。⚠️諫言：B2B 客戶要發票、收據可能擋部分公司客（Edward 已有代開後路） | #7 |
| 10 | 升級提示接「即時綠界結帳」（取消填表等人工，這是回頭率生死線） | #8 |
| 11 | credit 後端權威化（防清 localStorage 繞過）＋ email 驗證＋IP/device 防薅羊毛 | calcifer＋suliman |
| 12 | **真扣款上線前必過**：suliman 3 紅線 → 綠界 sandbox 刷假錢測 → 給 Edward 看 → Edward 點頭 → 才碰真客戶的卡 | 全部 |

---

## 階段三 · 長大批（v1 / v2）
| # | 任務 |
|---|---|
| 13 | **Team（霍爾 6/25 盤點：完善度≈25%，team-mechanism-spec.md）** 多人合併計費（主帳號 + seat + owner 配權限）。**核心發現：地基方向錯——現 `_wsId=uid`、訂閱綁「人」不綁「空間」→ member 用自己帳號登入進不去 owner 空間；RBAC 空殼無模組權限。需「以人為主→以空間為主」地基搬遷(佔工程40%)。** 🔴最深的雷：綠界「中途改每期扣款金額」可能要客戶重刷卡→加人就重刷=殺轉換，**接金流第一件事先 spike 驗這條**(已塞進卡西法金流計畫)。霍爾建議精實路：波0地基+波1 Team MVP(合併計費先人工)≈15h城堡/7天，驗證有人買再做全自動。順序=金流先→Team。待 Edward 拍：①seat上限(建議20)②加人下期計費當期免費③走精實路 |
| 14 | PRO 職務制選模組（現為固定核心 6 模組） |
| 15 | 90 天未付清產品資料（個資法）＋ 轉換漏斗監測＋Day5/7 提醒（email＋站內） |

---

## 跨階段 · 策略未決（霍爾 flag · 比執行大十倍）
**Trial vs Freemium 大哉問**：你現在 0 付費、PMF 未驗證，這階段免費用戶池＝口碑燃料（v2 GTM 全建立在此），7 天試用會把池子抽乾。Edward 已選「軟鎖（trial）」續走 → 但霍爾建議單獨深想。**列為 Edward 隨時可 reopen 的策略檢查點**，不擋階段一執行。

---

## 關鍵路徑（一句話）
**階段一城堡全自治完成 → 唯一外部 blocker = Edward 去開綠界（階段二前置）。** 建議 Edward 趁城堡做階段一這幾天去開綠界，金鑰一到、無縫接階段二。

## 防薅羊毛配置（sophie 財務拍板）
email 驗證（P0、近零成本）＋ IP/device 第 2 個試用帳號 credits 砍半（只降不擋）＋ 7 天鎖（已決）＋ 市場報告濫用預警（per-user AI 成本 > NT$200 → 該功能降 0 credits、不動其他模組）。

---

## 進度回填（每完成一項回來打勾 · 蘇菲維護）
- [x] 方案價格 ① · [x] 試用鎖核心 ② · [x] 全模組 gating · [x] council 軟鎖拍板
- [x] 軟鎖 rework · [x] 價格統一 · [x] a11y · [x] 版控(v1.12.0/快照/diff-report AC16/16, markl Gate4 PASS)
- [x] **Gate1 PASS**（calcifer 5項全綠；2 P2 蘇菲修+served 驗證：getInvoices Array.isArray 防呆、MAX 卡清掉「洽談/聯絡業務」→ 顯示 999 自助）· [x] **Gate5** 機密掃描 0（不碰錢無金流）· [~] Gate2 視覺（到期橫幅 runtime 受 auth/hydration 限、邏輯+早期測試確認、建議 Edward 測帳號 eyeball）
- [x] **上線完成（2026-06-25 14:xx）**：commit ebbd1b0 → push main → beyondspec.tw 確認 live v1.12.0。只推 path/app/index.html（策略/spec docs 未進公開 repo）。**階段一（不碰錢批）DONE。**
  - [x] 軟鎖編輯鎖補完整：60 攔點（報價/客戶/任務/收款 的編輯/拖拉/狀態/封存全擋；匯出保留）。周邊(會議/文件/薪資/出缺勤/Spec-builder `_spec*`)列 fast-follow。
  - **[x] 嚴重撞名 bug 已修+驗**：訂閱狀態搬到 `'bp_subscription'`（line 8848 + raw fallback line 9313）、收款保留 `'bp_billing'`。自測 3 情境過：收款不再 crash、軟鎖未被撞壞、兩邊不互蓋。fast-follow：收款 deep-link 冷開的 init-race transient（getInvoices 對非陣列回 [] 兜底）。
  - **軟體建置全 done**（軟鎖核心+編輯鎖+撞名修）。剩收尾：價格統一(設定頁對照表)+版控(v1.12.0/快照/diff-report)+完整 Gate1/2/5 → 上線。
- [ ] 綠界（Edward）· [ ] 串金流 · [ ] 發票 · [ ] 即時付費 · [ ] credit 權威化 · [ ] sandbox+點頭+上線
- [ ] Team · [ ] 職務制 · [ ] 90 天清資料/漏斗
