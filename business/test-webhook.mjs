/**
 * =====================================================================
 * Beyond Business — Webhook E2E 測試工具
 * 模擬 SendGrid Inbound Parse 發送客戶回信，驗證整個 webhook 流程
 *
 * 使用方式：
 *   node test-webhook.mjs <vercel-url> <workspaceId> <caseId> [scenario]
 *
 * 範例：
 *   node test-webhook.mjs https://beyondspec.vercel.app TA001 1 medium
 *
 * Scenario 選項：low | medium | high
 * =====================================================================
 */

// ── 讀取 CLI 參數 ────────────────────────────────────────────────────
const [,, vercelUrl, workspaceId, caseId, scenario = "medium"] = process.argv;

if (!vercelUrl || !workspaceId || !caseId) {
  console.error(`
❌ 缺少必要參數！

用法：
  node test-webhook.mjs <vercel-url> <workspaceId> <caseId> [scenario]

範例：
  node test-webhook.mjs https://beyondspec.vercel.app TA001 1 medium

📌 如何找到你的 workspaceId：
  打開 app → 瀏覽器 F12 → Console → 輸入以下程式碼：
  firebase.firestore().collection("workspaces").where("memberEmails","array-contains","edwardt0303@gmail.com").get().then(s=>s.forEach(d=>console.log("workspaceId:",d.id)))

📌 caseId 是你 AR 案件的 id 欄位（通常是 1 或 2）
`);
  process.exit(1);
}

// ── 各情境的假回信內容 ───────────────────────────────────────────────
const SCENARIOS = {
  low: {
    label: "✅ 低風險：客戶友善確認付款",
    fromEmail: "customer-test@example.com",
    subject: "Re: 【帳務通知】關於發票溝通事宜",
    text: `您好，

非常抱歉晚回，我們內部帳務部門剛確認完畢，
預計本週五（3/13）前會完成匯款，金額將全額清償。

請您告知貴公司帳號，我們將盡速處理。

林小花 敬上
PawPaw 寵寵有限公司`,
  },
  medium: {
    label: "⚠️ 中風險：態度模糊、拖延",
    fromEmail: "customer-test@example.com",
    subject: "Re: 【帳務通知】請盡速處理欠款事宜",
    text: `你好，

我們老闆最近比較忙，這件事需要他批准後才能處理。
目前還無法給出確切的付款時程，可能還要等一段時間。

請見諒。

採購部 回覆`,
  },
  high: {
    label: "🚨 高風險：拒絕付款",
    fromEmail: "customer-test@example.com",
    subject: "Re: 【帳務通知】",
    text: `你好，

我們對這筆帳款有異議，認為服務並未如期交付，
因此不認為我們有付款義務。

如有問題請找我們的法務部門聯繫。

不便之處請見諒。

學堂科技`,
  },
};

const chosen = SCENARIOS[scenario] || SCENARIOS.medium;

// ── 建立模擬 SendGrid multipart/form-data ────────────────────────────
const replyToAddr = `reply+${workspaceId}_${caseId}@reply.beyondspec.tw`;
const boundary = "----SendGridBoundary" + Date.now();

const multipartBody = [
  `--${boundary}`,
  `Content-Disposition: form-data; name="from"`,
  ``,
  chosen.fromEmail,
  `--${boundary}`,
  `Content-Disposition: form-data; name="to"`,
  ``,
  replyToAddr,
  `--${boundary}`,
  `Content-Disposition: form-data; name="subject"`,
  ``,
  chosen.subject,
  `--${boundary}`,
  `Content-Disposition: form-data; name="text"`,
  ``,
  chosen.text,
  `--${boundary}--`,
].join("\r\n");

// ── 執行測試 ─────────────────────────────────────────────────────────
const webhookUrl = vercelUrl.replace(/\/$/, "") + "/api/webhook";

console.log(`
🧪 Beyond Business Webhook E2E 測試
════════════════════════════════════════════════════════
📍 Webhook URL  : ${webhookUrl}
🏢 workspaceId  : ${workspaceId}
📋 caseId       : ${caseId}
📧 From         : ${chosen.fromEmail}
📬 Reply-To addr: ${replyToAddr}
💬 情境         : ${chosen.label}
════════════════════════════════════════════════════════
`);

console.log("📤 傳送假回信到 webhook...\n");

try {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": Buffer.byteLength(multipartBody, "utf8"),
    },
    body: multipartBody,
  });

  const responseText = await response.text();
  const statusOk = response.status === 200;

  console.log(`📥 HTTP 狀態碼: ${response.status} ${statusOk ? "✅" : "❌"}`);
  console.log(`📄 回應內容  : ${responseText}`);

  if (statusOk && responseText.includes("success")) {
    console.log(`
════════════════════════════════════════════════════════
✅ 測試通過！Webhook 成功處理回信

📋 後續驗證步驟：
   1. 打開 Beyond Business app
   2. 進入「應收帳款」看板
   3. 點擊案件 ID=${caseId} 的案件詳情
   4. 查看「案件歷程」—應出現：
      - 📩 收到客戶回覆 (${chosen.fromEmail})
      - 🧠 AI 判讀完成（風險：${scenario === "low" ? "善意回覆" : scenario === "medium" ? "態度模糊" : "高風險拖延"}）
   5. 案件的 AI 風險標籤應已更新
════════════════════════════════════════════════════════
`);
  } else if (statusOk && responseText.includes("not found")) {
    console.log(`
════════════════════════════════════════════════════════
⚠️  Webhook 可以連線，但找不到案件！

可能原因：
  1. workspaceId 錯誤 → 確認你的工作台 ID
  2. caseId 不存在 → 確認案件 ID（通常是 1 或 2）
  3. Firestore 中還沒有 arCases 文件 → 請先在 app 新增 AR 案件後再測試

你傳入的參數：workspaceId="${workspaceId}", caseId="${caseId}"
════════════════════════════════════════════════════════
`);
  } else if (response.status === 500) {
    console.log(`
════════════════════════════════════════════════════════
❌ Webhook 伺服器內部錯誤 (500)

請到 Vercel Dashboard → 你的專案 → Logs 查看詳細錯誤
常見問題：
  - FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY 環境變數未設定
  - GEMINI_API_KEY 未設定或無效
  - Firebase Admin SDK 金鑰格式錯誤（PRIVATE_KEY 換行符需為 \\n）
════════════════════════════════════════════════════════
`);
  }

} catch (err) {
  if (err.code === "ECONNREFUSED" || err.cause?.code === "ECONNREFUSED") {
    console.error(`
❌ 無法連線到 Webhook！

請確認：
  1. Vercel 專案已部署（URL: ${webhookUrl}）
  2. Vercel 部署狀態為 "Ready"（非 "Building" 或 "Error"）
  3. URL 是否正確？試試：https://beyondspec.vercel.app/api/webhook
`);
  } else {
    console.error("❌ 測試失敗：", err.message);
  }
  process.exit(1);
}
