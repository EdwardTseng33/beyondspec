# Tasks — Beyond Business

## Active

- [ ] **[Story 1] deals/invoices 一鍵轉入 AR 建案** - 目前需手動填入，應可從現有交易/發票直接 prefill 新 AR 案件
  - 優先度：P1

- [ ] **法務助手匯出格式升級** - 目前只有 .txt，律師實務建議升級為 .docx（支援格式、修改、協作）
  - 優先度：P2

## Waiting On

- [ ] **Vercel 環境變數設定 SENDGRID_FROM_EMAIL** - 需 Edward 至 Vercel Dashboard → Settings → Environment Variables 加入已在 SendGrid 驗證的寄件者信箱
  - since 2026-03-07

- [ ] **E2E SendGrid 寄信測試** - 完成 SENDGRID_FROM_EMAIL 設定 + GitHub push 後，在 AR 案件詳情頁點「確認寄出」，確認信件正確到達、Reply-To 追蹤位址正確、客戶回信後 Firestore 有寫入
  - since 2026-03-07

## Someday

- [ ] **SendGrid 設定 Onboarding 指南** - 技術門檻高，需要文件引導用戶自行配置 MX 記錄與 webhook URL
- [ ] **AR → LINE 通知整合** - 目前 LINE 渠道標示「即將推出」
- [ ] **AR → SMS 整合** - 同上

## Done

- [x] ~~SendGrid Outbound API 整合~~ (2026-03-07) — v2.86
  - 新增 /api/send.js 後端端點（@sendgrid/mail）
  - 以 fetch('/api/send') 取代 window.location.href = mailto:
  - 確保每封催款信帶有正確 Reply-To 追蹤位址
  - 加入寄送中 / 成功 / 失敗 UI 狀態回饋
- [x] ~~[P0 重定義] Webhook Gemini 升級：豐富 AI 來信判讀~~ (2026-03-07) — v2.85
  - Gemini prompt 升級：新增 paymentCommitted / commitDate / disputeDetected / suggestedAction
  - Firestore 寫入新欄位：aiSummary, aiPaymentCommitted, aiCommitDate, aiDisputeDetected, aiSuggestedAction, lastReplyText
  - ArDetailDrawer 新增「🧠 AI 來信判讀」卡片（摘要 + 結構標籤 + 建議行動）
  - 產品方向決策：外發催款信維持範本即可，AI 聚焦在判讀來信
- [x] ~~[Story 4] 客戶回信後 UI 顯示🔔通知 badge~~ (2026-03-07) — v2.84
  - webhook.js: unreadReply: true 寫入 Firestore
  - ArDashboard: 閃爍統計卡 + 列表 badge
  - ArDetailDrawer: 開啟自動清除旗標
  - MorningBrief: 新回覆提醒行
  - Nav tab: AR tab 紅點 badge (mobile + desktop)
- [x] ~~移除 Mock Reply 假功能~~ (2026-03-07) — v2.83（4 處全部清除）
- [x] ~~法務程序 Playbook CTA 修復~~ (2026-03-07) — v2.83
- [x] ~~存證信函助手多步驟強化~~ (2026-03-07) — v2.83
- [x] ~~RWD 手機版格線修復~~ (2026-03-07) — v2.83a
- [x] ~~P0 Webhook Firestore 路徑修正~~ (2026-03-07) — v2.81
- [x] ~~P0 busboy multipart 解析~~ (2026-03-07) — v2.82
- [x] ~~Playbook UX 完整重構~~ (2026-03-07) — v2.82
- [x] ~~CONTACT_FILTERS 健康標籤~~ (2026-03-07) — v2.82
