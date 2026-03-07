# Tasks — Beyond Business

## Active

- [ ] **[Story 1] deals/invoices 一鍵轉入 AR 建案** - 目前需手動填入，應可從現有交易/發票直接 prefill 新 AR 案件
  - 優先度：P1（原 P2，因下方 P0 方向調整後提升）

- [ ] **法務助手匯出格式升級** - 目前只有 .txt，律師實務建議升級為 .docx（支援格式、修改、協作）
  - 優先度：P2（原 P3）

- [ ] **[Story 1] deals/invoices 一鍵轉入 AR 建案** - 目前需手動填入，應可從現有交易/發票直接 prefill 新 AR 案件
  - 優先度：P2

- [ ] **法務助手匯出格式升級** - 目前只有 .txt，律師可能需要 .docx
  - 優先度：P3

## Waiting On

- [ ] **E2E Webhook 測試** - 等待 Edward 確認 Vercel 部署網址 + workspaceId，再執行 `test-webhook.mjs` 完整驗證
  - since 2026-03-07

## Someday

- [ ] **SendGrid 設定 Onboarding 指南** - 技術門檻高，需要文件引導用戶自行配置 MX 記錄與 webhook URL
- [ ] **AR → LINE 通知整合** - 目前 LINE 渠道標示「即將推出」
- [ ] **AR → SMS 整合** - 同上

## Done

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
