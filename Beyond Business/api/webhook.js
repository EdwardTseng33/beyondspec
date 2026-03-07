import admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Busboy from "busboy";

// ── Vercel 設定：關閉預設 bodyParser，改由 Busboy 手動解析 multipart/form-data ──
export const config = {
    api: { bodyParser: false },
};

// 1. 初始化 Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
    });
}
const db = admin.firestore();

// 2. 初始化 Gemini
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 3. 將 multipart/form-data 請求解析為 key-value 物件
function parseMultipart(req) {
    return new Promise((resolve, reject) => {
        const fields = {};
        const busboy = Busboy({ headers: req.headers });
        busboy.on("field", (name, val) => { fields[name] = val; });
        busboy.on("finish", () => resolve(fields));
        busboy.on("error", reject);
        req.pipe(busboy);
    });
}

// 4. Vercel Serverless 核心處理出口
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        // SendGrid Inbound Parse 以 multipart/form-data 傳送
        const fields = await parseMultipart(req);

        const fromEmail = fields.from || "";
        const toEmail   = fields.to   || "";
        const emailText = fields.text || fields.html || "";

        console.log(`[webhook] from=${fromEmail} to=${toEmail}`);

        // 從收件人解析 workspaceId + caseId
        // Format: reply+{workspaceId}_{caseId}@reply.beyondspec.tw
        const match = toEmail.match(/reply\+([^_]+)_([^@]+)@/);
        if (!match) {
            console.log("[webhook] No valid workspaceId/caseId in:", toEmail);
            return res.status(200).send("No matching Workspace or Case ID");
        }

        const workspaceId = match[1];
        const caseId      = match[2];
        console.log(`[webhook] workspaceId=${workspaceId} caseId=${caseId}`);

        // 5. Gemini AI 判讀客戶回信意圖
        const model = ai.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" },
        });
        const prompt = `你是一位專業的應收帳款催收助理，請分析以下客戶回信並回覆純 JSON（不加任何說明文字）：
{
  "risk": "low" 或 "medium" 或 "high",
  "summary": "回信重點摘要（25字以內）",
  "paymentCommitted": true 或 false,
  "commitDate": "YYYY-MM-DD 或 null（若客戶有明確提到付款日期）",
  "disputeDetected": true 或 false,
  "suggestedAction": "建議下一步行動（30字以內，例如：確認付款日期、發送 T2 正式催告、轉法務程序）"
}

判斷原則：
- risk=low：客戶明確承諾付款且態度配合
- risk=medium：態度模糊、給出藉口、未明確承諾
- risk=high：拒絕付款、提出爭議、無回應跡象、超過 30 天
- paymentCommitted=true：信中有明確付款承諾或日期
- disputeDetected=true：信中提到合約爭議、品質問題、拒絕承認欠款

客戶回信內容：
${emailText.substring(0, 2000)}`;
        const aiResponse = await model.generateContent(prompt);
        const aiResult = JSON.parse(aiResponse.response.text());

        // 6. 讀取並更新 workspaces/{workspaceId}/data/arCases（usePersisted 格式）
        const arCasesRef = db
            .collection("workspaces")
            .doc(workspaceId)
            .collection("data")
            .doc("arCases");

        const arCasesDoc = await arCasesRef.get();
        if (!arCasesDoc.exists) {
            console.warn(`[webhook] arCases doc not found for workspace: ${workspaceId}`);
            return res.status(200).send("Workspace or arCases document not found");
        }

        const cases = arCasesDoc.data().value || [];
        const idx = cases.findIndex(c => String(c.id) === String(caseId));
        if (idx === -1) {
            console.warn(`[webhook] caseId ${caseId} not found in workspace ${workspaceId}`);
            return res.status(200).send("Case not found in workspace");
        }

        // 7. 附加回信歷史記錄 + AI 判讀結果
        const today = new Date().toISOString().split("T")[0];
        const history = [...(cases[idx].history || [])];
        history.push({
            date: today,
            action: `📩 收到客戶回覆 (${fromEmail})`,
            note: emailText.substring(0, 120) + (emailText.length > 120 ? "…" : ""),
        });
        const riskLabel = aiResult.risk === "low" ? "✅ 善意回覆" : aiResult.risk === "medium" ? "⚠️ 態度模糊" : "🚨 高風險拖延";
        let aiNoteLine = `判定：${riskLabel}｜${aiResult.summary}`;
        if (aiResult.paymentCommitted) aiNoteLine += `｜💳 承諾付款${aiResult.commitDate ? `（${aiResult.commitDate}）` : ""}`;
        if (aiResult.disputeDetected)  aiNoteLine += `｜⚠️ 偵測到爭議`;
        aiNoteLine += `｜建議：${aiResult.suggestedAction}`;

        history.push({
            date: today,
            action: `🧠 AI 判讀完成`,
            note: aiNoteLine,
        });

        cases[idx] = {
            ...cases[idx],
            history,
            mockRisk: aiResult.risk,
            lastReplyAt: today,
            lastReplyFrom: fromEmail,
            lastReplyText: emailText.substring(0, 300),
            aiSummary: aiResult.summary,
            aiPaymentCommitted: aiResult.paymentCommitted || false,
            aiCommitDate: aiResult.commitDate || null,
            aiDisputeDetected: aiResult.disputeDetected || false,
            aiSuggestedAction: aiResult.suggestedAction || "",
            unreadReply: true,
        };

        // 8. 寫回 Firestore（與 usePersisted 相同格式）
        await arCasesRef.update({
            value: cases,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedBy: { email: "webhook@system", name: "AI 自動回信判讀" },
        });

        console.log(`[webhook] Case ${caseId} updated — risk=${aiResult.risk}`);
        return res.status(200).send("Processed successfully");

    } catch (error) {
        console.error("[webhook] Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
