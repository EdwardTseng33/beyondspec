# PATH App Changelog

## v1.3.15

<!-- 從 app.html tail 搬出 · v1.3.18 cleanup -->

v1.3.15 · 問卷結果頁 P0 重修（女巫 rubric 55→82）：移除 Math.random() 假品質分數 — clarity/bias/coverage/completion 不再顯示虛假 random，改由 AI survey_audit 真實給分存；未檢測時 4 卡顯示「—」slate dashed ring；新增 Hero verdict 綜合可信度 84px SVG ring（overallScore = avg(clarity + 100-bias + coverage + completion)）+「可以發 / 建議優化 / 建議重做」verdict 色彩編碼（teal/gold/rose）+ 建議文案 + 題數·預估填答時間 meta；4 純數字卡改 SVG 56px ring 視覺化（封閉五色：清晰度 teal / 誘導性 gold / 覆蓋率 primary / 完成率 rose）；empty state 用 .card-editorial variant（Maze-inspired hover 只變 border）· 版號 v1.3.14→v1.3.15

---

## v1.3.14

<!-- 從 app.html tail 搬出 · v1.3.18 cleanup -->

v1.3.14 · Tail cleanup + Firebase Trigger Email 指南：(1) HTML tail 熱區 26 條舊 changelog（v1.0.8 → v1.3.10）搬運至 `projects/beyondpath/CHANGELOG.md` 歸檔，tail 回歸 CLAUDE.md 憲法 ≤3 條規則；(2) `projects/beyondpath/ops/trigger-email-setup.md` 建檔——Firebase Extension「Trigger Email from Firestore」5-10 分鐘設定指南含：Gmail App Password 取得、Extension 安裝設定（asia-east1 region + SMTP URI）、Cloud Function `applicationEmail` onCreate 中繼寫 `mail/` collection 自動寄 HTML email 給 edwardt0303@gmail.com（含申請摘要 table + admin 頁連結）、測試 & 故障排除、Firebase 免費額度試算（申請量 < 500/日 完全免費）；(3) 愛德華只需在 Firebase Console 執行 5 步即可啟用即時 email 通知，完全不靠第三方 · 版號 v1.3.13→v1.3.14

---

## v1.3.13

<!-- 從 app.html tail 搬出 · v1.3.18 cleanup -->

v1.3.13 · Witch Action 1+2+5 設計 token 擴充 + Lab CAVEAT 方法論升級（霍爾 D.2 落地）：(1) `:root` 新增 `--space-8:72px` / `--space-9:96px` / `--space-10:128px` 敘事型 section-scale spacing；新增 `--text-display-sm:28px` / `-md:36px` / `-lg:48px` / `-xl:72px` display 字階；新增 `--font-serif` / `--font-sans` 含中文 fallback（Noto Serif TC + Noto Sans TC）修 Georgia italic 中文 fallback 到系統 sans 的斷裂；(2) `.card-editorial` variant — 敘事型卡片 hover 只變 border 不做 shadow glow（Maze-inspired）；(3) `.l-section` / `.l-section.spacious` landing section separator 規範化用 `--space-9/10`；(4) Lab CAVEAT 擴充霍爾 D.2 文案三段結構：🟢 適合使用 / ⚠️ 不適合替代 / 誠實聲明 · 版號 v1.3.12→v1.3.13

---

## v1.3.12

<!-- 從 app.html tail 搬出 · v1.3.18 cleanup -->

v1.3.12 · PATH 診斷結果頁 CTA 文案對齊 Q1 中庸版敘事：line 21546 action card 文案「針對最弱維度進行 AI 模擬用戶訪談」→「針對最弱維度進行 AI 合成受眾訪談（先跑廣度，真訪談跑深度）」，與 v1.2.0 Lab 模組 subtitle / header badge 用同一套語言；延伸實施 Q1 Lab 誠實度 slogan 至全站觸點 · 版號 v1.3.11→v1.3.12

---

## v1.3.11

<!-- 從 app.html tail 搬出 · v1.3.18 cleanup -->

v1.3.11 · app 內申請管理頁（Admin-only，回應愛德華「不靠三方」需求閉環）：接續 v1.3.9 Firestore 寫入，這版加 app 內管理介面讓愛德華不用進 Firebase Console 就能審核所有申請。(1) Sidebar 新增「管理」category + 「申請管理」nav item，條件 `state.user.email === 'edwardt0303@gmail.com'` 才顯示；(2) Router 新增 `admin: 'admin-applications'` slug mapping；(3) renderModule 加 `case 'admin-applications': renderAdminApplications()`；(4) 新 `renderAdminApplications()` 讀 Firestore `applications` collection orderBy submittedAt desc limit 100，render table 含時間 / 方案 badge / 公司 / 姓名+職稱 / mailto Email / 需求 / 狀態 badge（pending gold / approved teal / rejected rose）/ 操作；(5) `updateApplicationStatus(docId, status)` update Firestore doc with reviewedAt serverTimestamp + reviewedBy email；完整流程：landing submit → Firestore write → 愛德華進 app /admin 立即看到 → 點通過/婉拒 → status 更新 · 版號 v1.3.10→v1.3.11

---

## v1.3.10

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.3.10 · 首頁報告 card 點擊直接顯示完整報告（愛德華回報：「首頁的報告產出要能正常顯示報告才對而不是跳到市場報告 tab 頁去但什麼都沒顯示」）：根因——card onclick 只 `app.navigate('report')` 跳模組主頁（輸入表單），沒帶 report id 讓 report 模組知道要載哪份；另外 `savedReports` record 只存 meta（productName/verdict/diagTotal）**沒存 aiData + selectedDiag snapshot**，即使拿到 id 也無法 re-render。修法：(1) `saveReport()` 擴充 record schema 加入 `aiData` + `selectedDiag` 完整快照；(2) 新增 `openSavedReport(id)`——從 `state.savedReports` 找 record，restore `reportState` 後 navigate + `renderFullReport()` 直接呈現完整報告（跳過 input 頁）；(3) 首頁 card onclick 從 `navigate('report')` 改 `openSavedReport(rpt.id)`；(4) 舊資料缺 snapshot → 跳 report tool + toast「此舊報告缺完整快照，請重新生成」；(5) `window.app` 曝 `openSavedReport` 讓 inline onclick 可呼叫 · 版號 v1.3.9→v1.3.10

---

## v1.3.9

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.3.9 · 早鳥申請改寫 Firebase Firestore 直接存取（愛德華回報：「一定要三方工具嗎? 不能直接串 google sheet 然後同步寄送通知給我?」）：v1.3.8 的 FormSubmit.co 雖免註冊但畢竟是第三方 email relay，愛德華要求完全在自家 Firebase project 處理。修法：(1) /path/index.html 載入 firebase-firestore-compat.js 10.14.1（之前只有 app + auth）；(2) bpSubmitApply 移除 FormSubmit POST，改 `firebase.firestore().collection('applications').add({...})` 直寫你 beyond-business-ca9da project 的 Firestore `applications` collection；(3) 每筆 document 含 plan / company / title / name / email / needs / submittedAt (server timestamp + iso) / source / userAgent / status=pending / reviewedAt / reviewedBy / notes — 可追蹤審核流程；(4) 下一版 v1.3.10 會在 app 內加 /admin 申請清單頁讓愛德華直接看 + 手動審核（免第三方）；(5) 即時 email 通知可選擇 Firebase Extension「Trigger Email」（Firebase Console 一鍵安裝、設 SMTP 用 Gmail 帳號即可，新增 doc 自動寄）— 指南 v1.3.10 同步出；Google Sheet 同步如需可另建 Apps Script pull Firestore → Sheet，但 app 內 admin 通常夠用 · 版號 v1.3.8→v1.3.9

---

## v1.3.8

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.3.8 · 早鳥申請接 FormSubmit.co 免註冊後端（愛德華 prod 問：「申請會員的表單完成了以後寄送與用戶資訊會留到哪裡?」—— 實情：localStorage 只在申請者瀏覽器、Apps Script 未設愛德華收不到、mailto 需用戶主動點，所以目前愛德華等於收不到任何申請 email）：(1) bpSubmitApply 新增 FormSubmit.co POST——`https://formsubmit.co/edwardt0303@gmail.com` 免註冊免 Access Key，第一次觸發 FormSubmit 寄 confirmation email 給愛德華一次性點擊啟用，之後所有申請自動 email forward 到他信箱；(2) payload 用 FormData，加 `_subject`（[BeyondPath 早鳥] PLAN · NAME）`_template=table`（美化排版）`_captcha=false`；欄位：方案 / 公司 / 職稱 / 姓名 / Email / 需求 / 提交時間 / 來源；(3) mode:no-cors fire-and-forget 避免 CORS blocking；(4) 保留 `window.BP_APPLY_WEBHOOK` Apps Script path（愛德華若未來設定 Google Sheet 同步，webhook 與 FormSubmit 並存）；(5) success modal 文案從「我們會回覆」改「已寄到我們信箱，會回覆到 xxx」更明確告知使用者信件已送達 · 版號 v1.3.7→v1.3.8

---

## v1.3.7

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.3.7 · 早鳥申請 submit 白屏修復（愛德華 prod 回報：「表單填寫完變成白頻」）：根因——v1.2.6 的 bpSubmitApply 成功後自動 `window.open('mailto:...', '_blank')`，某些瀏覽器沒 mail handler 會 navigate 當前頁到 mailto URL 而不是開 new tab，整頁變白屏。修法：(1) 移除自動 mailto；(2) submit 成功後 modal body 替換成 in-place 確認 UI——「已收到你的申請」header + 1-2 工作日回覆承諾 + 申請摘要 card + 可選「點此寄送副本」mailto `<a>`（用戶主動點才觸發，無 popup blocker 風險）+「完成」按鈕；(3) localStorage + Apps Script webhook 照舊不動 · 版號 v1.3.6→v1.3.7

---

## v1.3.6

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.3.6 · app 內部升級 CTA 串接 landing 早鳥申請 modal（愛德華需求：「系統線上的申請 Starter 與 Pro 跟企業帳號先設定彈出一個編輯窗」）：(1) `openSubscribeFlow(planId)` 升級路徑從 `renderSubscribeModal`（原本付款 flow）改 `window.location.href = '/path/?apply=' + planId`——早鳥期所有付費方案統一走「填表 → 寄信給愛德華 → 同步 Sheet → 手動開通」流程，金流未接通前先停用付款 modal；(2) Enterprise 方案原本只 toast 聯絡信箱，現在也走 apply modal 統一體驗；(3) 降級流程保留原 `openDowngradeFlow`（不需要申請表，直接切 plan）；(4) /path/index.html 新增 URL query 解析——載入時若 URL 含 `?apply=starter|pro|enterprise`，`DOMContentLoaded` 後 200ms 自動觸發 `bpOpenApply(planId)`，並用 `history.replaceState` 清 query 避免 refresh 重複開 modal；(5) 此版只有一份 modal code（在 landing）被兩處（app + landing）共用，維護成本低；代價是 app 內點申請會跳出到 landing（未來 v1.4+ 可在 app 內複製 modal 避免離開 app） · 版號 v1.3.5→v1.3.6

---

## v1.3.5

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.3.5 · 任務看板寬模式（愛德華回報：「狀態欄位的預設與全展開為至少能顯示 4.5-5 個狀態目前是 3.3 個左右」）：Chrome MCP 實測 2011px viewport + sidebar 80px 收合下，`#content` 被 `max-width:1400px` + margin auto 限制在 1400px 居中，扣 padding 後 kanban-board 只剩 1328px；`.kanban-col min-width` 公式 `(100vw-280)/4.5` 在大螢幕算 384px → 1328/384 ≈ 3.45 欄（愛德華看到的 3.3）。修法：(1) 新 CSS rule `body.kanban-wide-mode #content{max-width:none;padding:20px 24px}` 解除寬度限制；(2) renderModule 開頭 `body.classList.toggle('kanban-wide-mode', moduleId === 'biz-tasks')` 進出任務看板自動切換 wide mode，其他頁面維持 1400 max-width 原設計；(3) `.kanban-col min-width` 公式改 `(100vw-160)/5.2` 最低 260px——分母從 4.5 加大到 5.2 讓大螢幕能塞更多欄；預留 160px 給 sidebar 收合(80)+padding(48)+margin buffer(32)；下限 260px 仍保證 title 15 字單行 · 版號 v1.3.4→v1.3.5

---

## v1.3.4

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.3.4 · 登入 polling 加速 + 全局 debug trace（v1.3.3 polling 2 秒間隔 + 無 trace，Chrome MCP 測試看 appDisplay 一直 "none"）：(1) polling interval 從 2000ms 改 500ms（總 wait cap 30s 不變，只是 check 更密）；(2) SDK ready 時先做 immediate currentUser check——如果 Firebase 已有 user（IndexedDB 已 resolve），不等 onAuthStateChanged fire 就直接 restore + showDashboard；(3) 加 `window._authTrace` global debug array 記錄每一步 timestamp 與狀態（polls / sdk-ready / user-resolved / onAuthStateChanged / showDashboard 執行結果），讓後續 Chrome MCP 可以 inspect trace 看卡在哪一步；(4) `window._authBoot` 狀態旗標讓 inner/outer polling 共享 userResolved 狀態，避免 double-fire · 版號 v1.3.3→v1.3.4 (DEBUG instrumented)

---

## v1.3.3

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.3.3 · 登入不了真正的 root cause（Chrome MCP 再測發現）——app.html 的 auth IIFE 執行時 Firebase SDK 還沒載入：script 順序上 Firebase SDK 是 async 載入 at end of `</body>`（line 30200+），但 auth IIFE 在 body inline script 更早跑，IIFE 裡 `typeof firebase !== 'undefined'` 判定為 false → 走 else branch → state.isLoggedIn=false → `_handleUnauthed()` 立刻 redirect `/path/`。這才是真正的 bug，v1.3.2 的 polling 只在 `firebase defined` branch 有效，else branch 立即 redirect 沒救。修法：(1) else branch 改成 polling `typeof firebase !== 'undefined'`，每 2 秒 check，最多 30 秒；(2) Firebase SDK 一旦 ready，重新註冊 onAuthStateChanged listener + polling currentUser safety；(3) 30 秒真沒載入 → fallback localStorage state。這套等同於 delay 2–6 秒讓 SDK 載入再決定 redirect，正常網速下使用者根本無感，弱網也只是略延遲，但絕不會錯誤 redirect 已登入用戶 · 版號 v1.3.2→v1.3.3 (PATCH: 登入不了 chrome MCP 實測根治)

---

## v1.3.2

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.3.2 · 登入不了的真正 root cause（Chrome MCP 實測證實）——setTimeout(6000) fallback 搶在 Firebase onAuthStateChanged 之前觸發：Firebase SDK 從 IndexedDB 讀 auth state 需要時間（特別是 CDN 冷啟、弱網路），setTimeout 6 秒觸發時 `firebase.auth().currentUser` 仍是 null（auth state 還沒 resolve），即使 IndexedDB 其實已有 cached user session。結果：有登入的用戶訪問 /path/app/ 被錯誤 _handleUnauthed → redirect /path/。修法：(1) 移除 setTimeout fallback 的 premature redirect；(2) 改用 polling interval：每 2 秒 check `firebase.auth().currentUser`，有就 instant restore + showDashboard，最多 poll 10 次（20 秒）後才 fall back 到 state.isLoggedIn / _handleUnauthed；(3) 正常情況 onAuthStateChanged 會先 fire（Firebase 內部從 IndexedDB 讀完就會 fire listener），polling 只是保險——若 Firebase listener 真的卡住，polling 每 2 秒 check 一次 currentUser 可以 recover · 版號 v1.3.1→v1.3.2 (PATCH: bug fix for 登入不了 Chrome MCP 實測 root cause)

---

## v1.3.1

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.3.1 · 修 v1.3.0 hotfix 引入的 syntax error（蘇菲用 Chrome MCP 實測 prod 發現 `window.bpLogin` 根本 undefined——整個 Firebase `<script>` block 因 SyntaxError 沒執行）：根因——v1.3.0 node script 注入 alert 訊息時，template literal 內 `\\n\\n` 本應轉義成 `\n\n`（escape sequence）寫入 HTML，但實際被解釋成 **真實 newline** 切斷 single-quoted string 橫跨 3 行，瀏覽器 parse 到 line 341 col 51 噴 `SyntaxError: Invalid or unexpected token`，後續 bpLogin / getRedirectResult fallback 全部沒載入。Fix：移除 `\\n\\n`，改用 `' (錯誤代碼：xxx)'` 行內追加括弧——同等資訊量，不需 escape，單行無風險 · 版號 v1.3.0→v1.3.1 (PATCH: hotfix v1.3.0 syntax error)

---

## v1.3.0

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.3.0 · 登入 popup-blocked fallback（蘇菲用 Chrome MCP 實測 prod 發現 Firebase 噴 `auth/popup-blocked` FirebaseError——某些瀏覽器設定 / 企業策略 / 第三方 cookie 擋住 Google OAuth popup，signInWithPopup 失敗後沒有備援路徑，所以愛德華才說「登入不了」）：(1) /path/index.html `bpLogin()` catch 區段加 popup-blocked 判斷——偵測到 `auth/popup-blocked` / `auth/operation-not-supported-in-this-environment` / `auth/web-storage-unsupported` 三種錯誤碼，自動 fallback 到 `firebase.auth().signInWithRedirect(provider)`（整頁跳 Google login → Google 跳回 /path/ 完成 session）；(2) 頁面初始化時加 `getRedirectResult()` handler——redirect flow 完成後回到 /path/，自動偵測 user 存在→清 anti-loop counter→redirect 到 /path/app/；(3) 其他錯誤 alert 顯示 `err.code` 方便日後排查；(4) 錯誤訊息用 `\\n\\n` 換行顯示錯誤代碼 · 版號 v1.2.9→v1.3.0 (MINOR: login flow 新增 redirect 路徑)

---

## v1.2.9

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.2.9 · 移除 anti-loop counter 機制（愛德華 prod 再次回報：「不行登入不了」）：v1.2.7/v1.2.8 的 anti-loop counter 即使加了「登入成功清 counter」仍然出問題——**sessionStorage 是 tab-scoped persist，不隨 hard reload 清除**。愛德華的 tab 已經從 v1.2.7 時累積了 counter=2，v1.2.8 的清 counter 邏輯只在「登入成功」時觸發，但他還沒登入成功，counter 一直卡在 >=2，每次訪問 /path/app/ 都被 redirect-loop break 擋下，顯示錯誤頁，用戶根本到不了 signInWithPopup。根治：(1) **完全移除 `_handleUnauthed` 的 counter 邏輯 + 錯誤頁 render**——閃頻防線靠 A (/path/ 無 auto-redirect，v1.2.7 已落實) + B (setTimeout fallback 6s + fallback 內再次 currentUser check，v1.2.7 已落實) + C (_handleUnauthed 開頭 Firebase currentUser safety check，v1.2.7 已落實) 三層已足夠斷 loop；(2) INITIALIZATION 區塊新增「清舊 counter」邏輯——每次 app.html 啟動都顯式 `sessionStorage.removeItem('_unauthedRedirectCnt'/'_unauthedRedirectTs')`，讓 v1.2.7/v1.2.8 期間卡住的用戶 tab 自動 unstuck · 版號 v1.2.8→v1.2.9

---

## v1.2.8

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.2.8 · 登入流程 anti-loop counter 誤擋修復（愛德華 prod 回報：「不會閃頻了，但沒辦法登入」）：v1.2.7 anti-loop counter 在正常登入流程會誤觸發——步驟：(a) 用戶首次訪問 /path/app/（未登入）→ `_handleUnauthed` counter=1 → redirect /path/；(b) 用戶點登入 → Google OAuth popup → 成功 → redirect 回 /path/app/；(c) Firebase Auth state 在新 page load 慢 resolve（IndexedDB 讀 session 有 latency）→ `setTimeout(6000)` fallback 觸發前 counter 還是 1，但在 10 秒 window 內；(d) 若 fallback 再次觸發 `_handleUnauthed` → counter=2 達 threshold → **錯誤地顯示「登入狀態需重新初始化」錯誤頁**，用戶無法進 dashboard。根治：(1) app.html `_restoreSessionFromFirebase(user)` 內清 `sessionStorage._unauthedRedirectCnt` + `_unauthedRedirectTs` —— 任何一條路徑 restore session 成功都會清 counter；(2) /path/index.html `bpLogin()` 的 `.then(result)` 裡也清 counter，確保 signInWithPopup 成功當下就把之前的 unauthed redirect 標記清掉，即使下一個 page load 的 Firebase 慢，fallback 的 currentUser check 應該 catch 到 user —— 但雙保險，counter 也不會累積 · 版號 v1.2.7→v1.2.8

---

## v1.2.7

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.2.7 · /path/ ↔ /path/app/ 閃頻 redirect-loop 根治（愛德華 prod 再次回報：「還是會喔，會在 /path 與 /path/app 這兩個連結反覆的一直跳」）：v1.2.5 只修了「剛登出」場景的閃頻，正常訪問（Firebase CDN 慢時）仍會 loop——根因：app.html auth flow 的 3 秒 setTimeout fallback 觸發時 state.isLoggedIn=false → _handleUnauthed → redirect /path/ → /path/ 的 auto-redirect 看到 Firebase IndexedDB cached user → redirect /path/app/ → app.html 又 Firebase 慢 → 3s timeout → _handleUnauthed → redirect /path/ → **無限閃頻**。根治措施：(1) **/path/index.html 移除 onAuthStateChanged auto-redirect**——根本不 redirect，回訪用戶需手動點「登入」（bpLogin() 對已 Google-authed 用戶是 instant complete，體感差異小、但絕對不會 loop）；(2) app.html setTimeout fallback 從 3s 延長到 6s（減少誤觸發）+ fallback 觸發前再次 check `firebase.auth().currentUser`，有 user 直接 restoreSession + showDashboard；(3) `_handleUnauthed()` 先做 Firebase currentUser safety check——如果有 Firebase user 但 state.isLoggedIn=false，代表 state mismatch，修復 state 進 dashboard 不再 redirect；(4) 加 anti-loop counter：`sessionStorage._unauthedRedirectCnt`，10 秒內 redirect 2 次 = 偵測到 loop，停下來顯示「登入狀態需重新初始化」錯誤頁 + 「回到首頁」手動按鈕，打破無限迴圈；(5) 新增 `_restoreSessionFromFirebase(user)` helper 把重複的 state 還原邏輯集中 · 版號 v1.2.6→v1.2.7

---

## v1.2.6

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.2.6 · 早鳥申請 modal（/path/ landing）上線 + Apps Script 後端設定指南落檔（愛德華需求：「landingpage 跟系統線上的申請 Starter 與 Pro 跟企業帳號先設定彈出一個編輯窗給他們填個人資料如公司名稱、職稱、姓名、信箱、想在系統獲得什麼幫助(選填)，然後有人申請件信給我，與同步紀錄一個 Google Sheet」）：(1) /path/index.html 新增 `.bp-apply-overlay` modal + `window.bpOpenApply(plan)`/`bpCloseApply()`/`bpSubmitApply()`：5 欄位（公司*、職稱*、姓名*、Email*、需求選填 textarea），ESC 關閉、click-outside 關閉、動畫 cubic-bezier；(2) 3 處定價 CTA 從 `bpLogin`/`mailto` 改 `bpOpenApply`：申請 Starter → `bpOpenApply('starter')`、申請 Pro → `bpOpenApply('pro')`、Enterprise「聯繫我們」→ `bpOpenApply('enterprise')`；PLAN_META map 給 3 種方案各自 tag/title/sub 文案；(3) 提交三軌：localStorage `bp_pending_applications` 永久備份 + `window.BP_APPLY_WEBHOOK`/`localStorage.BP_APPLY_WEBHOOK` Apps Script POST（no-cors fire-and-forget）+ `mailto:edwardt0303@gmail.com` 預填主旨「[BeyondPath 早鳥申請] PLAN · NAME」與完整 body，即使後端沒設定愛德華也立即收信；(4) `projects/beyondpath/ops/apply-form-setup.md` 完整 Apps Script 部署指南（Sheet 欄位 / doPost 程式碼 / Web App 部署 / URL 灌入的 2 種方式 / 測試步驟 / 除錯 / 資安注意）；(5) app.html 內部 upgrade CTA 留 v1.2.7 同步（此版只做 landing 對外入口優先）· 版號 v1.2.5→v1.2.6

---

## v1.2.5

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.2.5 · 登入頁閃頻 redirect-loop bug 修復（愛德華 prod 回報：「登入頁好像壞掉了，一直閃頻」）：根因——v1.2.1 /path/index.html 加的 `onAuthStateChanged` auto-redirect 跟 app.html `logout()` + `_handleUnauthed()` 產生循環：登出 → showLanding → redirect `/path/` → Firebase auth state 還未 resolve、依然認為 user logged in → onAuthStateChanged 觸發 → redirect 回 `/path/app/` → 但 `state.isLoggedIn=false` → _handleUnauthed redirect 回 `/path/` → 無限閃頻。修法：(1) `logout()` 改為先設 `sessionStorage._justLoggedOut = Date.now()` flag、再 `firebase.auth().signOut().finally(showLanding)`——確保 Firebase 登出完成才 redirect；(2) `/path/` auth listener 加 flag check：10 秒內剛登出就 skip auto-redirect；(3) showToast 放到 signOut.finally 裡避免在 redirect 之前的空檔消失 · 版號 v1.2.4→v1.2.5

---

## v1.2.4

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.2.4 · 首頁近期動態移除（補 v1.2.3 sidebar bump 遺漏）+ landing logo 點擊回頂部：(1) 首頁「近期動態」aside-card 整塊移除（5,438 字元）——愛德華回饋「報告生產多了會被壓下去看不到，UX 有問題」。原本讀 castle_xxx_* 舊 key，跟愛德華帳號的 bp_* key 不同源所以恆為空狀態，empty block 又佔 36px padding + 48px icon，報告產出後變視覺盲區。首頁左側 home-main 結構簡化為 welcome-banner → 日期+統計 row → reportsHTML；(2) Landing page (/path/index.html) nav logo 加 `onclick` scroll-to-top（`window.scrollTo({top:0,behavior:'smooth'})`）——愛德華指令「landingpage 的 logo 點擊要能回到最上方」；(3) 前一 commit v1.2.3（Recent Activity 刪除）因 Edit tool file-state race 沒 apply sidebar bump 到 v1.2.3，此版補正跳到 v1.2.4 · 版號 v1.2.2→v1.2.4

---

## v1.2.2

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.2.2 · 首頁「逾期提示與代辦融合」+ 右下擴充「本週脈搏」（愛德華指令「把逾期的那個提示通知與原本右下角的代辦項目融合」+「右下角可以有什麼可以思考」）：(1) 左側 Today's Action Panel 簡化——只保留日期 + 快速統計 row（進行中/待簽回/今日會議），urgent items 區塊從左側移除；(2) 右側 home-aside 新增「今日聚焦」aside-card——融合 5 類 urgent items（逾期款項 rose / 逾期任務 rose / 報價即將到期 gold / 會議待辦未完成 gold / 任務 3 天內到期 primary），按 weight 排序（rose → gold → primary）；空狀態設計：teal ring icon + 「今天沒有緊急事項·可以專注在重要的事」；資料源統一讀 bp_* localStorage（跟左側同源，永不矛盾）；(3) 右側再加「本週脈搏」aside-card 擴充內容：SVG donut ring 顯示本週任務完成率（封閉五色 teal/gold/rose 階梯）+ 本月報價/已收雙 KPI + 「查看完整營運戰情室」小 CTA；完成率 null（無任務）顯示「—」slate，不再「懲罰新用戶」；(4) 整體視覺升級：右下從「快速操作 + 待辦提醒」單純列表 → 「快速操作 + 今日聚焦 + 本週脈搏」三層資訊架構，設計感提升（SVG ring 視覺錨點 + 色彩語義清晰）· 版號 v1.2.1→v1.2.2

---

## v1.2.1

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.2.1 · /path/app/?login=1 徹底廢除，登入流程完全搬到 /path/（愛德華指令）：(1) /path/index.html 加載 Firebase SDK（app-compat + auth-compat 10.14.1）+ firebaseConfig（同 app.html）+ `window.bpLogin()` 函數：直接 `signInWithPopup(new firebase.auth.GoogleAuthProvider())` → 成功 redirect /path/app/、失敗顯示錯誤 + restore 按鈕；(2) 6 處 landing CTA（登入 nav / 免費開始 hero / 免費開始 pricing / 申請 Starter / 申請 Pro / final CTA）從 `href="/path/app/?login=1"` 改成 `onclick="bpLogin(origin);return false;"`——URL bar 永遠停在 /path/，不會跳 /path/app/?login=1；(3) 加 landing auth state listener：已登入用戶進 /path/ 自動 redirect /path/app/（避免回訪時還看到 landing 一瞬間）；(4) app.html `_handleUnauthed()` 簡化——所有未登入 session 一律 `window.location.replace('../')`，不再渲染 landing、不再 auto-trigger Google OAuth（那些邏輯全搬 /path/）· 版號 v1.2.0→v1.2.1

---

## v1.2.0

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.2.0 · Lab 誠實度升級（Q1 中庸版）+ AI 儀表板改名為「營運戰情室」（Q2）：(1) Lab 研究入口（受眾研究室）subtitle 從「AI 模擬目標用戶訪談 · B2B/B2C 雙軌 · 華語五大市場」改中庸版「先用 Lab 跑廣度，真訪談跑深度——AI 合成受眾，分鐘級產出洞察」；page-title-area 右側加 slate `AI 合成受眾 · 非真人訪談` badge（霍爾 lab-research-competitive-framing.md Part D 建議，slate 色非 rose/警告，語義是「資訊分類」不是「警告」）；Lab 報告空狀態文案同步改「AI 合成受眾幫你先跑廣度、把訪綱打磨到 90 分」；(2)「AI 儀表板」全站改名「營運戰情室」（共 7 處：sidebar nav label / MODULE_NAMES map / h1 title in renderInsights / pricing highlights × 2 / comparison table / landing text）——名字訂定經城堡 Q2 決議：有溫度 + 場景感 + co-founder 精神（取代虛詞「儀表板」）· 版號 v1.1.4→v1.2.0 · tail cleanup backlog: v1.0.8/v1.0.9/v1.1.0/v1.1.2 待搬 CHANGELOG.md

---

## v1.1.4

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.1.4 · 首頁訊息融合（Q3 愛德華決議：不要兩個代辦清單）：移除右側 aside「待辦提醒」整塊（原 line 7795-7847），左側 welcome-banner 下的 Today's Action Panel 成為唯一 urgent items source of truth。理由：右側 reminders 讀 `castle_xxx_*` 舊 key（來自 biz 模組殘留），左側 urgentItems 讀 `bp_*`（任務看板/報價/收款/會議的實際 key），兩套資料源會產生「左 2 筆款項逾期 vs 右一切順利」的矛盾訊息，直接破壞用戶信任。此修復後：只在左側統一顯示逾期任務、到期報價、逾期款項、會議待辦，同頁再無矛盾訊息；右側 home-aside 保留「快速操作」4 按鈕。後續 v1.2 會把整個首頁 layout 重構成「今日聚焦 hero + PATH/任務/報告摺疊區」 · 版號 v1.1.3→v1.1.4

---

## v1.1.3

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.1.3 · P0 信任修復 + 憲法封閉五色清理（蕪菁頭 UX 盤點 + 女巫視覺 rubric 共同指出的信任殺手）：(1) 戰情室簽回率「懲罰新用戶」bug 修復——`closeRate` 在 `sentCount + acceptedCount === 0` 時改回 null（不再回 0），卡片顯示「—」slate 色 + 「尚無報價資料」說明，不再用 rose 紅色把沒用過的新用戶當業務失敗標示；(2) 憲法違憲色全面清理——11 處非封閉五色改為 `var(--gold)` / `var(--rose)` / `var(--slate)`：市場探測 compColor / trendColor / dColor / oppColor（`#D97706` / `#EF4444`）、問卷 typeColors（`#E8590C` / `#D946EF` / `#0EA5E9`）、問卷 bias 色、問卷 audit score / error / warn 色、colorMap、PMF scoreBar、PATH bar、landing gradient（`#D97706` → `#E08A3A` 直接 hex 因 gradient 不支援 var）；(3) PRESET_COLORS 用戶自訂色盤保留不動（那是用戶權利）· 版號 v1.1.2→v1.1.3

---

## v1.1.2

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.1.2 · 登入/登出 routing 修正（愛德華 prod 回報：兩個登入介紹頁重複 + 登出殘留 hash）：(1) showLanding 直接 window.location.replace('../') 送回 marketing 首頁；(2) 新增 _handleUnauthed — 沒 query 送回 /path/，有 ?login=1 或 ?apply=* 渲染 landing + 300ms 後自動彈 Google OAuth；(3) onAuthStateChanged + timeout fallback + firebase-unavailable 三路徑統一；(4) /path/index.html 4 處登入 CTA 加 ?login=1；(5) 修復 v1.1.1 race condition 誤砍 v1.2.0 Router — base 從 b9abd20 重新 apply，Router 和 _pendingHash 完整保留 · 版號 v1.1.0→v1.1.2

---

## v1.1.0

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.1.0 · 早鳥申請模式 + Google 登入一鍵化 + URL 結構升級：(1) Landing（beyondspec.tw/path/）定價區所有「選擇 X」CTA → 「申請 X」（申請 Starter / 申請 Pro），因金流尚未接上；加 early-bird 敘事「🚀 現階段早鳥申請中，付費方案尚未開放，搶先體驗 + 首月雙倍 credits」；(2) App 內部（/path/app/）所有升級按鈕 & 訂閱 modal CTA 同步改「申請 X · 早鳥名單」；(3) Google 登入一鍵化——原登入流程：按登入 → 跳 in-app modal → 再按 Google → 彈 popup（二段式）；改為按「登入/免費開始」直接觸發 handleGoogleLogin() → Google popup 一鍵進產品；4 處公開 CTA（nav 登入、hero 免費開始、pricing Free tier 免費開始、final CTA 免費開始）全部改走直通路；保留 in-app modal 的 Google 按鈕作為 fallback；(4) URL 結構升級——app.html 從 /path/app.html 遷移到 /path/app/index.html 資料夾形式（乾淨、可擴充 /path/app/dashboard 等子路徑）；landing CTA 全部更新 · 版號 v1.0.9→v1.1.0 · tail cleanup: v1.0.7 搬進 CHANGELOG.md

---

## v1.0.9

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.0.9 · 全面同步定價到新商業模型（與 landing 對齊）：(1) getCreditLimit() FREE 30→50、STARTER 500→600、PRO 保持 3000；(2) PLAN_CATALOG Free tagline 改「永久免費 · 任務/客戶/報價完整可用」、credits 30→50、加首次 PATH 診斷不計費 highlight；Starter monthly 390→290、annual 3900→2900、credits 500→600、tagline 改「個人接案者」；(3) PLAN_CATALOG 價格 card：STARTER 年繳從 325→242 並加「省 17%」敘事；(4) 所有「7 天免費試用」文案（6 處）全拔，改為「選擇方案名 / 立即訂閱 / credits 用多少付多少」；(5) upgrade CTA button 同步新價格；(6) settings 價格表 4 欄從 390→290；(7) feat landing price-card 區塊 FREE/STARTER/PRO 三卡 credit 數 + 按鈕 + 副標全同步 · 版號 v1.0.8→v1.0.9 · tail cleanup: v1.0.6 搬進 CHANGELOG.md

---

## v1.0.8

<!-- 從 app.html tail 搬出 · v1.3.14 cleanup -->

v1.0.8 · 任務看板 3 題合併修復（愛德華回饋：最小欄寬 / 標題顯示 / 卡片 3 行化）：(1) 恢復 .kanban-board overflow-x:auto（v1.0.5 nuke 的反向操作）——橫向 scroll 重啟；col-body 中鍵 autoscroll 由既有 document-level mousedown hook（_midPanDocHook）擋；CSS 兜底加 body.mid-panning 時 overflow-x:hidden；(2) .kanban-col min-width 用 max(calc((100vw - 280px) / 4.5), 280px)——視窗寬時保證最多顯示 4.5 欄、視窗 <1440px 時下限 280px 保證 title 單行容得下 16 個中文字（14px × 16 ≈ 224 + priority dot 12 + gap 8 + padding 32 ≈ 276）；(3) 卡片從 4 行（title/desc/meta 上/meta 下）壓縮回 3 行——原 Row 4 的 checklist/due/avatar 合併進 Row 3 meta，加 .kb-v2-meta-spacer 用 flex:1 1 auto 把 avatar/due 推到最右端；meta row 從 flex-wrap:wrap 改 nowrap + overflow:hidden，不再發生 avatar 折到第 4 行；.kb-v2-tag 加 flex-shrink:1 + max-width:100px 讓標籤在窄欄下 ellipsis；.kb-v2-cat / checklist / due / ai-badge 全 flex-shrink:0 保證永遠可見 · 版號 v1.0.6→v1.0.7 · tail cleanup: v1.0.4 搬進 CHANGELOG.md

---

本檔聚合 PATH App（`app.html`）歷史版本 changelog，最新 3 個版本保留於 `app.html` 尾部 HTML comment，其餘搬運至此。

格式規則：
- 每個版本獨立 `## vX.Y.Z` section
- 首行一句話摘要，其後列點細節
- 按版號由新到舊排序

---

## v1.0.5

任務看板中鍵拖移核彈級結構修復

- **背景**：v1.0.2 / 1.0.3 / 1.0.4 四版 JS 防禦（rAF enforceLocks、document-level capture、CSS overflow-x 鎖）全部失敗，愛德華反覆回報「還是不行」。
- **根因解**：放棄 JS 防禦，改走結構修復——`.kanban-board` 從 `overflow-x:auto` 改 `overflow:hidden` 永久關閉、`flex-wrap:wrap`、`.kanban-col` min-width 280→200、`flex: 1 1 240px`；Chrome 原生 middle-click autoscroll 在 col-body 按下時，向上找 h-scrollable 祖先都找不到（col-body 本身 overflow-x:hidden、board 永久 hidden），**根本沒 anchor 可選**，autoscroll 無法啟動橫向散逸。
- **代價**：5 欄以上小螢幕會換行（可接受）；attachMidPan 極簡化去掉 rAF/wheel/scroll capture 兜底邏輯。
- **後續**：v1.0.6 把 + 新增欄位搬到 toolbar 解決 wrap 斷裂問題，v1.0.7 再加入 4.5 欄最小規範與 3 行卡片。

---

## v1.0.4

任務看板中鍵拖移根因級修復（來回 3 版才抓到 root cause）

- **根因診斷**：卡西法 Chrome 實測確認——Chrome 原生 autoscroll 在 mousedown 瞬間走 native layer 選最近 h-scrollable 祖先（=`.kanban-board`）當 anchor，col-body 層級 capture listener 已太晚；v1.0.2 / 1.0.3 的 `body.mid-panning` CSS + rAF `enforceLocks` 只能被動拉回，每幀 16ms gap 讓 native pan 可散逸幾十 px。
- **解法**：新增 document-level capture phase mousedown hook（`window._midPanDocHook` 單例），搶先於所有 element handler 先 preventDefault 掉 `.kanban-col-body` 內部中鍵 mousedown，徹底阻止 Chrome 選定 anchor。
- **防禦簡化**：移除 v1.0.3 過度防禦的 `body.mid-panning *{pointer-events:none}` 與雙層 overflow-hidden，簡化為單一 `.kanban-board{overflow-x:hidden !important}`；`attachMidPan` 本身維持 col-body 層級 JS 捲動邏輯不變。
- Tail cleanup：v1.0.1 搬進 CHANGELOG.md。

---

## v1.0.3

任務看板雙 UX 修復（Edward 回報）

- **卡片 hover 靜態化**：移除 `.kb-card-v2:hover` 的 `translateY(-1px)` 浮起 + `box-shadow` 放大 + description `-webkit-line-clamp` 1→2 展開動態；三項合併的動畫在欄位塞滿 8+ 張卡時嚴重干擾閱讀；hover 只保留 border-color 淡紫提示，description 永遠 1 行 ellipsis。
- **中鍵拖移鎖垂直**（此版未根治，後續 v1.0.4/1.0.5 持續追蹤）：attachMidPan 五層防禦——mousedown capture phase 搶先於 Windows autoscroll、`collectLocked()` 記錄祖先橫向 scrollable、rAF `enforceLocks()` 兜底、document scroll capture 即時拉回、wheel capture 吃掉意外滾輪；CSS 強化 `body.mid-panning` 期間 `.kanban-board + .kanban-board-wrap` 雙層 `overflow-x:hidden`。

---

## v1.0.2

緊急回退 + 3 個根源性 bug 修復

- **全域 topbar 整組移除**：v0.34.0 sticky bar 與 v1.0.1 fixed pill 都跟頁面標題互斥，愛德華兩次要求回退；`#globalTopbar` HTML + CSS 全刪；`updateCreditBadge` 改 no-op 保留 API；renderHome 恢復 inline credit pill（跟 v0.33.2 一致）；credit 顯示回到「僅首頁 + 設定頁」。
- **renderModule 統一 overflow safety reset**：timeline/roadmap 設 `#main.overflow:hidden + height:100vh` 鎖死外層捲動，其他 render fn（home/quotes/billing/diagnose/pmf/settings）沒自行 reset，導致從 timeline 切去其他頁「上下拖移失效」；在 renderModule 入口統一清除 `#main + #app` 的 overflow/height inline style。
- **看板中鍵拖移強化鎖定垂直**（此版未根治，後續 v1.0.3/1.0.4/1.0.5 持續追蹤）：attachMidPan 加 `body.mid-panning` class 觸發 `.kanban-board{overflow-x:hidden !important}`、mousemove capture phase、外層祖先 scrollLeft 鎖死、`.kanban-col-body` 加 `overflow-x:hidden`。

---

## v1.0.1

UIUX 打磨批次（愛德華 v1.0.0 部署後回饋 + 女巫雙輪稽核 apply）

- **Global topbar 架構修正**：原 v0.34.0 full-width sticky bar 把所有頁面標題往下推，改 `position:fixed` 右上浮動 pill（glass tint + backdrop-filter + box-shadow），不再佔用垂直空間；username 隱藏，加 plan↔avatar divider。
- **看板分組 button 簡化**：移除 `.kb-groupby-prefix` wrapper，直接用 bpSelect，option label 改「依 X 分組」，localStorage `bp.kbListGroupBy` 跨 session 記住；cat filter 單類時自動隱藏「分類」選項。
- **看板封存 button 合併**：原「封存完成 N」+「已封存 N」兩顆視覺幾乎一樣，合併為單一「封存 N ▾」+ dropdown menu（action: 封存本期完成；toggle: 顯示/隱藏已封存）含 outside-click closer + aria。
- **看板 5 個 P0 視覺**（女巫稽核 62.5→目標 85）：
  - P0-1 color 語義撞車：category chip 改中性 bg-hover + 6px 色點前綴（`--_cat` CSS var），色彩保留給 status/priority/due。
  - P0-2 description 2-line clamp on hover（預設 1 行 ellipsis，展開 2 行）+ 去重跟 title 重複才渲染。
  - P0-3 priority dot 分級：high 8px 無 shadow + 加「高」文字 badge 達雙編碼、medium 7px gold、low slate .6 opacity；`.has-pri-high` 讓 title 字重升 700。
  - P0-4 AI badge 去漸層：搬到 meta row，改 tonal chip（primary/teal 12% tint + 26% border + dot）。
  - P0-5 column count chip 改 `.kanban-col-count` 用 color-mix 呼應欄色 + dark mode 變體。
- **Edit modal 右欄 4-section 分層**：`.kb-rs` 容器分「主要/分類/週期/紀錄」4 區；負責人改 bpSelect 讀 `getMembers()`。
- **文件庫 link-only 化**：移除檔案上傳邏輯，純 linkUrl + linkLabel 必填；card 顯示 hostname + 連結預覽行。
- 額外修補 list-priority low 違憲 `#3B82F6` Tailwind blue → `#94A3B8` slate。

---

## v1.0.0

版本系統重置為 major.minor.patch 語意 · BeyondPath 首次里程碑正式版本

- **版控憲法**：`major = 重大更版`、`minor = 新增模組`、`patch = 功能優化或 bug 調整`；此版跳升 v0.33.2 → v1.0.0。
- **全域 topbar**：credit/plan/avatar 從 sidebar 搬到右上角，`#globalTopbar` sticky + backdrop-filter；sidebar credit badge 整組 CSS 刪除；`updateCreditBadge()` 改渲染至 topbar；renderHome 移除冗餘 header-right。
- **刪假 agentCanAct checkbox**：女巫稽核發現零下游實作（grep 全檔只 3 處寫、0 處讀），文案對用戶說謊違反憲法誠信原則；kb-section 整塊刪除 + save logic 移除對應欄位。
- **Edit modal Esc 鍵可達性**：新增 `document.addEventListener('keydown')` Escape 監聽 + MutationObserver 監看 ov remove 自動解除 listener 防 memory leak；外側 click 改 `closeModalAnimated(ov)` 跟全站 33 處一致。
- **Settings 模組管理重設計**：從 5-column grid 改 2-column 並排 list-row，flex:1 min-width:280px，module list gap:2px 緊湊堆疊；每 row = 32px icon + 2 行 label+賦能問題 + toggle/plan chip；響應式 flex-wrap 自動堆疊。
- **Settings 方案與用量升級**：hero credit bar 40px 大數字 + gradient primary 6% 背景 + 本月剩餘/已使用雙欄；AI 模型卡 Free 用 Sonnet 4.6 名片式顯示；Starter+ 用 bpSelect + tagline + pricing info 卡。

---

## v0.32.24

規劃頁中鍵拖移 + 下週期視覺分離 + tz bug 修補

- **新增 `window.attachMidPan(el)` 通用 helper** — 中鍵 `mousedown` 啟動 pan、`mousemove` 反向 `scrollTop`、`mouseup` 結束、capture-phase `auxclick` block 防誤觸（dy > 3px threshold），idempotent（`__midPanAttached` flag）。
- **renderBacklog 右 pane 包 `#tpRightScroll`** overflow-y:auto scroll container，左 pane `#tpDropBacklog` 同步掛 pan，兩欄獨立捲動。
- **本週期↔下週期分隔帶升級**：原 1px border-top + 8/14px margin 改為 `.tp-cycle-divider` 漸層線 + pill label「下週期規劃」，margin 擴大 24/16px，暗色模式走 `var(--bg-card)`。
- **下週期 opacity .75→.92**，empty state 加 icon + 副提示文字「本週需求過多或預先規劃時可使用」+ 3% primary tint 背景。
- **tz bug 修補**：`renderBacklog` 下週期 startDate/endDate 計算 `.toISOString().split('T')[0]` → `fmtLocalYMD()`，修補 v0.32.23 遷移遺漏的 tz bug。
- **CSS 新增**：`.cp-dropzone` / `.cp-drag-over` / `.tp-cycle-divider` / `.tp-cycle-divider-label` + dark mode 變體。
- **既有 DnD 三區互拖**（`_tpInitDragDrop`）不動，中鍵 pan + 左鍵 DnD 不同按鈕零衝突。

---

## v0.32.23

時區安全日期格式化（ensureCurrentCycle off-by-one 根除）+ 資料遷移

- **根本問題**：`cycleStart` 用 `new Date()` + `setHours(0,0,0,0)` 建立 local 00:00（例 2026-04-13 Mon TW local 00:00），再呼叫 `.toISOString().slice(0,10)` 轉成 UTC「2026-04-12」，UTC+8 TW 凌晨 08:00 前 local date 與 UTC date 差一天，於是 `startStr = "2026-04-12"` 與卡片實際 cycleId 對不上，13 張卡片掛在 `cycle_mnzooqhvze7o7` 但 kanban 用 `cycle_next_2026-04-12` 找不到——愛德華 4/16 截圖只看到 4 張。
- **新增 `fmtLocalYMD(d)` helper** at line 7220：`getFullYear + getMonth+1 padded + getDate padded` 組 YYYY-MM-DD 走 local time 不踩 UTC 偏移。
- **14 個 `.toISOString().slice(0,10)` 呼叫點全面遷移**：generatePmInsights 當日比對、ensureCurrentCycle startStr/endStr、_cycleCarryOver find + 新 cycle dates、demo 注入 _ds helper、timeline drag/resize 四處、cycle next move、交易表單日期預設、quote.created 預設、pulse view _todayISO、meeting.date 預設。
- **保留 3 個檔名產出呼叫點不動**（Lab report / survey / backup）——檔名 UTC 無害且反而有跨時區一致性。
- **一次性 data migration 腳本**：ensureCurrentCycle 修好後產生新正確 cycle（startDate=2026-04-13），同時 `cycle_next_2026-04-12`（bug 產物）孤兒化，腳本把裡面 21 張卡片搬到新 cycle 再刪除孤兒。
- **CLAUDE.md 新增**「資料操作安全規則」（禁止硬編碼 cycleId 或 columnId）+「HTML 尾部 Comment 憲法」（changelog 必須完整包 HTML comment，尾頁後禁裸文字，Gate 4 加 grep 自動檢查）。

---

## v0.32.22

城堡 subagent 並行調研後兩題綜合修正（愛德華第二輪截圖怒火回饋 + 城堡三人並行調研 Explore×2 + general-purpose×1）

- **空狀態「新增欄位」入口消失 bug** — 愛德華截圖只看到 3 欄（待辦/進行中/已完成），質疑「用戶怎麼新增新的狀態列」；`.kanban-col-add` 按鈕在 line 13262 存在但被 v0.15.4 加了 `if(_totalBoardCards > 0)` 條件鎖——空看板時完全不渲染；對標 Trello/Asana/Notion：column 列表最右側永遠有 + 按鈕；修法：移除條件 gate。
- **核心三欄（todo/doing/done）誤刪回復機制** — `getCols()` 加 migration 邏輯：讀 localStorage 後若發現核心三欄缺失，從 DEFAULT_COLS 補回並 silent save；同步修正 review 欄歷史違憲色 `#3B82F6` (Tailwind blue) → `#5B3FC9` (primary-deep) 形成「入流程→深化→完成」視覺梯度；兩處 DEFAULT_COLS 定義同步更新。
- **`_kbDeleteCol` 核心欄位刪除保護** — 憲法「對齊小團隊使用情境，todo/doing/done 是任務流最小三角」；加前置判斷：刪核心三欄彈 alert 提示「這是核心欄位無法刪除，可留空不放卡片」。
- **時間軸 bar 點擊跳 preview drawer 問題** — 原 `_rmOpenCard` drawer 要再按「前往完整編輯」才開 modal，兩步預覽違反一步到位；修法：function 第 5 行短路——若 `window._rmOpenFullCard` 存在則直接轉導並 return；所有 4 個呼叫點自動繼承一步到位行為。
- **城堡 subagent 實戰首次正式出動** — 並行派 3 個 agent（Explore×2 + general-purpose×1）、總 tokens 100K+ / duration 102 秒 parallel；驗證 subagent 真實價值——三份回報各自獨立深入、不佔主 context。

---

## v0.32.21

任務看板六題綜合修正（愛德華截圖回饋 6 連 + 憲法複用提醒 + 兩步預覽除錯）

- **列表 checkbox 整欄移除** — 列表 = 看板密集視圖，不需獨立勾選框，語意衝突（checkbox 暗示「選」，但任務完成的主流程是拖到 done 欄或在 drawer 改狀態）且 v0.32.20 保留的 `.lv2-check` 仍被誤讀為可操作控件；徹底拔除：`.lv2-header` 改 5 欄 `grid-template-columns:1fr 88px 96px 110px 76px`（移除 32px 前導欄），`.lv2-row` 同步 5 欄，移除 row 中 `<div class="lv2-check">` 渲染 HTML；`.lv2-check` CSS 標註 deprecated。
- **groupby 下拉改用既有 bpSelect()** — v0.32.16 引入的 native `<select>` 破壞 PATH 設計系統；憲法「複用優先於新發明」——直接呼叫 `bpSelect({id:'kbGroupBySel', options:[...], onChange:'_kbSetGroupBy'})`，外包 `.kb-groupby-prefix` wrapper 提供 icon + 「分組」label 前綴與 toolbar 齊平，移除 `_kbToggleGroupMenu` / `_kbGroupMenuOutsideClick` 冗餘 handler。
- **封存雙按鈕差異化** — 兩顆圖示只差 badge 數字視覺相同；憲法「複用優先」改用既有 `.kb-archive-btn` 文字變體區分語意：「封存完成 <count>」（手動 action）+「已封存/隱藏封存 <count>」（toggle 檢視，active 態加 primary tint），icon 進一步差異化，文字 label 承擔主要區分責任符合「避免三重冗餘」；新增 `.kb-archive-btn-count` badge（ink 10% tint 圓角 9px tabular-nums）；`.kb-archive-btn` 高度 34→32 對齊 control bar。
- **空狀態直接顯示欄位** — v0.32.18 的 `.kb-empty-banner` hero takeover 違反「空狀態直接顯示這幾個狀態列」；移除 `renderBoard` 中 `_earlyTotal===0` 分支的 banner 渲染，columns（待辦/進行中/Review/擱置/已完成）永遠渲染作為永久結構骨架，欄位內「拖曳卡片至此或按 +」placeholder 承擔空狀態語意，對標 Linear/Jira/Notion 做法；同步刪除 `.kb-empty-banner` / `.kb-empty-hero` 系列全部 CSS（~120 行 dead code），保留 `@keyframes kbEmptyIn` 供後續可能復用。
- **欄位 +/... 按鈕 hover 明顯化** — 原 `.kanban-col-btn:hover` 只換 `var(--bg-hover)` 在彩色 tint column header 上對比太弱；重做 hover 多狀態：背景 `rgba(255,255,255,.92)` + color 切 primary + `translateY(-1px)` lift + 多層 `box-shadow`（外 drop + 內 primary 22% inset border），active 態 primary 14% tint + 36% inset border + `aria-expanded/is-open` 同步，svg stroke-width 1.8→2 加粗，focus-visible outline primary 55% 2px；dark mode 反轉為 white 12% tint + primary 40% border；`_kbToggleColMenu` 補上 `is-open` class 與 `aria-expanded` 切換邏輯，外層 click closer 一併清除。
- **點卡片直接開完整編輯彈窗** — 原流程「點卡→側邊 preview panel→按『前往完整編輯』再開 modal」違反一步到位原則；`window._kbOpenDetail` 短路改寫：function body 首行 `window._kbEditCard(cardId)` + return，原 side panel 渲染邏輯保留為 unreachable dead code 供歷史參考；所有 4 個呼叫點（cp-focus-card / timeline drawer 前往按鈕 / roadmap 內聯 handler / checklist toggle 回寫）自動繼承一步到位行為。
- **憲法反思** — 「複用優先於新發明」+「UX 痛點即時修正」的實戰教訓版本。開發流程內建檢查：動工前 grep 現有元件 + 先跑設計意圖 md 再 code，hover/active/focus 多狀態必備，低頻預覽不要跟主編輯 flow 並存。

---

## v0.32.20

任務看板列表視圖框架統一 + 卡片呼吸感升級（愛德華三輪回饋綜合處理）

- **列表視圖交互語言對齊看板** — 原「點 row = 開 side detail-panel」「左側長得像 checkbox 的握把被誤讀」「右側 ↑ + 鉛筆 hover 快捷冗餘」「無法拖曳換狀態」四重斷裂，改為：row 整個 draggable + onclick 改呼叫 `window._kbEditCard`（與看板卡片 mouseup 同一個 drawer，消除兩套 detail UI），點擊/拖曳邏輯跟看板卡片一致；`.lv2-hover-actions`（↑ + 鉛筆）整塊移除，優先級切換交給 drawer 內單獨控件；`.lv2-check` 保留為真勾選框但明確 title + hover primary border 強化可識性。
- **列表拖曳 drop zone** — `_groups.push` 附帶 colId，status 分組時每 group rows 包進 `.lv2-group-rows[data-col]`，非 status 分組（優先級/分類/負責人）row 不可拖；空 group 加 `.lv2-empty-row`「拖曳任務至此以變更為『X』」dashed placeholder；drag-over 態 primary 8% tint + 28% inset border。
- **`_kbBindDragDrop` 擴充列表分支** — listRows 綁 dragstart/dragend 加 `.dragging`，click-vs-drag 衝突處理（mousemove > 5px 後的 click 抑制）；listZones 綁 dragover/dragleave/drop，drop 時更新 card.columnId + activities log + reorder + saveCards + renderBoard，drop 到 done 欄顯示 toast。
- **卡片視覺呼吸升級** — `.kanban-col` min-width 240→280px、max-width 400→420px 讓標題欄位有空間容納 ≥15 中文字，`.kanban-col-body` 改 flex column + gap:12px 取代原 `.kanban-card` margin-bottom:8px 過密。
- **移除「手動」badge** — manual 是預設狀態不需貼標，僅 AI 協作/全自動才有資訊價值。
- **PATH 憲法色彩補洞** — `.lv2-pri.p2` 從 Tailwind blue `#3B82F6` 違規改用 `var(--teal)`（低優先 = 穩定）。

---

## v0.32.19

時間軸項目 drawer 標題區單一化 + PATH 色彩憲法修補

- **drawer 標題區壓縮** — 原 `rmdrw-kb-preview` 大卡包含「標題 input」+「狀態 chip × 4（status + 需求數 + 完成% + 日期範圍）」，而下方 `rmdrw-meta-grid` 又重複顯示「開始/結束/進度/需求」四格，資訊三重呈現，違反「每個 UI 元素必須有存在的意義」憲法。修法：drawer 標題區壓縮為單一 `.rmdrw-title-simple` row——14×14 色塊 + 項目名稱 input + 一顆 status chip（尚未開始/進行中/完成）；需求數、完成%、日期範圍全交給 meta-grid。
- **新增 `.rmdrw-title-simple` CSS** — padding 4/12 + border-bottom + flex gap:10 對齊 drawer 其他 section。
- **憲法色彩違規修補** — `.rmdrw-kb-status.review` 從 Tailwind blue `#3B82F6` 改用 `var(--rose)` color-mix 14% tint（review 語意對應「待審核」，用 rose 表達需要關注）。

---

## v0.32.18

週期 pill 單排化 + 空狀態改輕量 banner（兩項 UX 除錯）

- **週期 pill 左右切換箭頭根源問題** — Next 沒加 disabled 防守，單週期狀態下點了 silent fail。修法改策略：任務看板專注本週工作，週期切換交給規劃頁處理；pill 退化為純資訊展示，移除兩顆 `.kb-cyc-nav` 按鈕 HTML + JS onclick 綁定（函式保留未觸發供未來重開需要）。
- **任務看板空狀態 takeover 違反設計邏輯** — 原 `_earlyTotal===0` 會整個 render 成 `.kb-empty-hero` 大面積佔位，把已經存在的 columns 全屏蔽。修法對標 Linear/Jira/Notion：columns 是永久結構骨架，改掛一條輕量 `.kb-empty-banner` 在 columns 上方（icon + 標題 + 副標 + 主 CTA「前往需求池」+ ghost CTA「規劃頁」），filter 為空完全不顯示 banner。
- **新增 `.kb-empty-banner` 系列 CSS** — primary 5% 染底 + 20% border，CTA 32px 配合 row 2 高度系統。

---

## v0.32.17

任務看板 header 二次優化（UIUX 齊平 + 雙層節奏）

v0.32.16 重構後截圖顯示四個問題——週期 pill 換行到 row 2 單獨落腳、封存 badge 絕對定位像脫離的紅點、row 2 五個元件高度不一（chip 28 / search 36 / view 30 / groupby 34 / pill 46px）、控制項擠在一排密度過高。對標 Linear cycle header 雙層節奏：

- **Row 1 升級為 `.kb-title-row`** — align-items:center、gap:12px，週期 pill 以 `margin-left:auto` 進駐 title 行（週期是頁面 context 屬於 headline 層）。
- **Row 2 新 `.kb-control-bar` 獨立一層** — 專責控制項，順序「分類 chips | 搜尋 | view toggle | groupby」，移除 pill。
- **全 row 2 元件統一 height:32px 齊平** — chip 28→32、search wrap 固定 220×32、view-seg 30→32、groupby 34→32。
- **封存按鈕 `.kb-archive-icon` 重做** — 從「30×30 icon + 絕對定位 badge」改為「min-width:32 height:32 ghost button + inline count」，數字 tabular-nums 對齊。
- **響應式 @media(max-width:900px)** — pill 於 row 1 降為 width:100% 獨立一行 justify-content:space-between。

對標競品：Linear cycle page / Height board header 兩層結構 / Notion database 週期 filter 貼 title。

---

## v0.32.16

任務看板 header 重構 + 封存動作降階（對齊 Linear/Notion/Trello/Jira 業界慣例）

- **Row 1 `page-title-area` 移除「看板/列表」toggle** — 只保留 h1 + subtitle，title 區回到城堡憲法規範單純態。
- **Row 2 `kb-control-bar` 重排序** — 愛德華指定順序「分類 chips | 搜尋 | 看板/列表 toggle | 週期 pill（靠右）」，分組 select（list only）緊貼 view toggle 後；週期 pill 以 `margin-left:auto` 靠右定位。
- **Row 3 `.kb-catfilter` 整條卡片取消** — 分類 chips 以 `.kb-catfilter-inline` 併入 row 2，chip 高度 26→28px，移除 label「分類」（chip 本身已明示分類含意）。
- **封存按鈕動作降階** — 原「封存完成 N」+「封存 N / 隱藏封存」兩顆實心按鈕掛在 row 2 右側（違反憲法「每個 UI 元素必須有存在的理由」），改為新 `.kb-archive-icon` ghost 按鈕（30×30 透明底 + hover 浮 bg + 右上 14px badge），對齊 Linear overflow menu / Trello card actions 業界慣例。
- **搜尋框包 `.kb-search-wrap`** — min-width:180 / max-width:240，避免 flex grow 搶位。
- **CSS 新增 5 個 class** — 走 token 系統，不碰舊 `.kb-catfilter` / `.kb-archive-btn` / `.kb-archive-all-btn`（歷史相容保留）。

---

## v0.32.15

PATH 色對齊 + 憲法落地

- **dev 分類色 #3B82F6（Tailwind blue 違規）→ #5B3FC9（PATH primary-deep）** — 全站任務分類回到 PATH 5 色封閉集合。
- **`.tp-cat` tag pill 背景升級** — 從 `color + '12'` hex suffix（7% opacity 蒼白）→ `color-mix(in srgb, cat-color 14%, transparent)` + 22% border，符合憲法 Pastel 下限 14% 並保 AA 對比。
- **`.tp-grip` 預設 opacity:0** — 改為 `.tp-row:hover` 才 fade-in 到 opacity:.5，靜態下左緣完全乾淨、根除 grip + pri-dot 組合造成的 left-stripe 觀感。
- **`.tp-pri` 從獨立左緣 flex item 移到 title flex 內前置** — 6×6 dot，無 box-shadow ring，優先級貼內容而非貼卡片邊緣。
- **cp-ov 進度條從卡片頂部移到卡片最底 footer** — 新增 `.cp-ov-bar-footer` 變體：高度 3px、margin-top:12px、60% 色淡 track，資料流改為 context → stats → status → focus → progress。
- **`.rmdrw-kb-preview::before` 頂部色帶整段移除** — CSS + 兩處 JS 使用點的 inline style 清掉。
- **CLAUDE.md 憲法擴充** — 七類通用條款（Color / Layout / Interaction / Encoding / Scale / Reuse / Meta-enforcement）及「Design Principle Application Checklist」十項，取消「飽和大膽」作為預設偏好。

---

## v0.32.14

P0 結構除錯（任務中心稽核後）

- **Demo cycle override 合併不完整 bug** — v0.32.3 引入的 sessionStorage override 邏輯只套用 color/label，但 `_rmCycleSetDates` 與 `_rmCycleSetDesc` 都有把 startDate/endDate/description 寫入 sessionStorage，結果編輯後靜默消失。`renderRoadmap` demo 注入處補齊 override 套用（line 10024-10038）。
- **`.tp-row.tp-overdue` 左側色條違規** — 原設計用 `box-shadow:inset 3px 0 0 var(--rose)` 模擬 border-left stripe，違反 CLAUDE.md 憲法；改為整邊 rose 邊框漸變 + 微染底（color-mix），加邊框 pulse 呼吸動畫。
- **移除 `.tp-row` 上未使用的 `tp-pri-high/medium/low` class cruft** — JS 端加 class 但 CSS 沒對應（v0.17.0 Calm Interface 已改用 6px dot 表達優先級），清理冗代碼避免未來誤接到 left-border 重新長回來。

稽核綜合分 72 → 目標 90+ 路徑：v0.32.14 結構除錯 → v0.32.15 三 row 視覺統一 → v0.33.0 規劃↔看板動線 + AI 引擎 → v0.33.1 週期生命週期。

---

## v0.32.13

城堡三題交付（pill 改版 / 分類 filter / 任務封存）+ 時間軸項目編輯修正

- **週期 pill 壓縮層級** — 新增 primary/healthy/warn/danger/idle 狀態 dot（shadow halo）、tonal「剩 X 天」chip、tonal 進度條（bar-idle/healthy/ahead/warn/danger 沿用 cp-ov 同套 token）；JS 端計算 `_pillTone`（timeProgress vs workProgress + overdue count 綜合判斷），達成 planning（完整 cp-ov 卡）→ tasks（壓縮 pill）的資訊密度梯度。
- **分類 filter chip row** — 6 個分類（產品/研發/QA/行銷/業務/行政）多選 chip，active 態用該分類 color border + 10% bg（不 fill 以保留卡片視覺）、idle 態 muted，已選時右側浮「已篩選 N 類」+ dashed 清空按鈕；localStorage 持久化（`bp.kbCatFilter`），board / list / 空狀態三處濾鏡同步。
- **任務封存 UX** — 新增「封存完成 N」一鍵按鈕（dashed border，done 欄有卡時才浮現），confirm dialog 列 N 張預設全封存，archived + archivedAt 寫入 card；新增 `window._kbArchiveCard / _kbUnarchiveCard / _kbArchiveCycleDone`；`kb-toast` 元件（success/warn/danger 三態，2.6s auto-dismiss）。
- **時間軸 `_rmOpenCard` 補 `_rmAllCardsCache` 快取查詢** — demo 卡點擊不再 silent fail，查不到再 fallback 到 storage。

---

## v0.32.12

任務看板空狀態 + 週期底色修正

- **空看板佈局 bug** — 舊 empty state 用 `grid-column:1/-1` 但 `.kanban-board` 是 `display:flex`，empty block 成了第 4 個 flex sibling 跟 columns 並排。新增 early-return 分支：當 `totalInCycle===0` 且無搜尋時不渲染 columns，直接渲染統一 `.kb-empty-hero`（icon 84×84 primary gradient + 3 步快速導引卡：新增需求→排入週期→開始執行 + CTA 前往需求池）。
- **週期底色不符 PATH 規範** — 空狀態原本套 'warn' 類（gold `#E08A3A` 偏暖），語意錯誤；新增 'idle' 狀態走 primary（`#7C5CFC`）微染色，`cp-ov` / `cp-ov-tag` / `bar` 三處同步支援 bar-idle/cp-ov-idle/cp-ov-tag-idle。JS 面兩處（line 8118 / 9350）`_tagClass` 從 'warn' → 'idle'，文案維持「待排程」。

---

## v0.32.11

修兩個 v0.32.10 漏網 bug

- **色塊點擊不開 drawer** — demo cycles 從未進 `T.getCycles()` 儲存層，`_rmGetCycleByKey` 一律找不到回 null，drawer 提前 return。新增 `window._rmAllCyclesCache` / `_rmAllCardsCache` 在 render-time 暴露完整列表（含 demo），`_rmGetCycleByKey` 與 `_rmOpenCycleDrawer` 優先讀快取再 fallback 到 storage。
- **展開動畫太微弱看不出來** — 重做 `@keyframes rmGroupRowIn`：translateY -22px、scaleY .85→1.02→1（spring overshoot）、blur(2px)→0、duration .52s、stagger 從 30ms 拉到 60ms（最後一階 360ms），加 transform-origin top center；chevron 旋轉延長到 .42s 並加色彩切換（collapsed=muted, expanded=primary）。

---

## v0.32.10

時間軸 6 點 UX 修正

- **全域 cursor:default + user-select:none** — 處理裝飾性文字（header/subtitle/group-label/bar-title/drawer-title 等），inputs/textareas 顯式保留 cursor:text，根除 I-beam 浮標 bug。
- **header 整列 onclick = 展開/收合（Fitt's Law 大命中區）** — 左側色塊 onclick = 開項目 drawer，互動分工清晰。
- **`@keyframes rmGroupRowIn` 展開 stagger 動畫** — spring easing，data-stagger 0–7 階段 0–160ms，respect prefers-reduced-motion。
- **顏色編輯統一收進 drawer 的「外觀色彩」section** — 10 色 swatch grid + active 勾選打勾，不再用 dot popover。
- **2026 UIUX 趨勢列入後續迭代** — spring 微互動、空間轉場、自適應密度。
- **drawer 全面改用既有 `.rmdrw-*` 視覺語言** — kb-preview / meta-grid / sec / empty-block，與任務編輯抽屜一致，零學習成本。
