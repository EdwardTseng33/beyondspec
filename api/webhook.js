import admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. 初始化 Firebase Admin (用環境變數防護金鑰)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // 處理換行字元的問題
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}
const db = admin.firestore();

// 2. 初始化 Gemini
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 3. Vercel Serverless 核心處理出口
export default async function handler(req, res) {
    // 檢查是否為 SendGrid 丟過來的 POST 請求
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        // SendGrid Inbound Parse 的 multipart/form-data 欄位
        const fromEmail = req.body?.from || "";
        const toEmail   = req.body?.to   || "";
        const emailText = req.body?.text || req.body?.html || "";

        // 從收件人 (To) 精準切出 workspaceId 與 caseId
        // Format: reply+{workspaceId}_{caseId}@reply.beyondspec.tw
        const match = toEmail.match(/reply\+([^_]+)_([^@]+)@/);

        // 找不到標籤 → 回傳 200 讓 SendGrid 停止重試
        if (!match) {
            console.log("[webhook] No valid workspaceId/caseId in:", toEmail);
            return res.status(200).send("No matching Workspace or Case ID");
        }

        const workspaceId = match[1]; // 對應前端的 _currentWorkspaceId
        const caseId      = match[2];

        console.log(`[webhook] workspaceId=${workspaceId} caseId=${caseId} from=${fromEmail}`);

        // 4. 呼叫 Gemini 判讀意圖
        const model = ai.getGenerativeModel({
            model: "gemini-1.5-flash",  // 穩定版本，gemini-2.5-flash 目前為 preview
            generationConfig: { responseMimeType: "application/json" }
        });
        const prompt = `你是一位催收助理。分析客戶回信判斷風險。請確保只回覆純 JSON：{"risk": "low"或"high"或"medium", "summary": "回信重點（20字以內）"}\n\n客戶回信內容：\n${emailText.substring(0, 2000)}`;
        const aiResponse = await model.generateContent(prompt);
        const aiResult = JSON.parse(aiResponse.response.text());

        // 5. 讀取前端使用的 Firestore 路徑：workspaces/{workspaceId}/data/arCases
        //    usePersisted 將陣列存在 { value: [...] } 結構內
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
        // caseId 可能是數字或字串，統一比對
        const idx = cases.findIndex(c => String(c.id) === String(caseId));

        if (idx === -1) {
            console.warn(`[webhook] caseId ${caseId} not found in workspace ${workspaceId}`);
            return res.status(200).send("Case not found in workspace");
        }

        // 6. 附加回信歷史記錄 + AI 判讀結果
        const today = new Date().toISOString().split("T")[0];
        const history = [...(cases[idx].history || [])];
        history.push({
            date: today,
            action: `📩 收到客戶回覆 (${fromEmail})`,
            note: emailText.substring(0, 120) + (emailText.length > 120 ? "…" : ""),
        });
        history.push({
            date: today,
            action: `🧠 AI 判讀完成`,
            note: `判定結果：${aiResult.risk === "low" ? "✅ 善意回覆" : aiResult.risk === "medium" ? "⚠️ 態度模糊" : "🚨 高風險拖延"}。摘要：${aiResult.summary}`,
        });

        cases[idx] = {
            ...cases[idx],
            history,
            mockRisk: aiResult.risk,
            lastReplyAt: today,
            lastReplyFrom: fromEmail,
        };

        // 7. 寫回 Firestore（與 usePersisted 相同格式）
        await arCasesRef.update({
            value: cases,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedBy: { email: "webhook@system", name: "AI 自動回信判讀" },
        });

        console.log(`[webhook] Case ${caseId} updated with risk=${aiResult.risk}`);
        return res.status(200).send("Processed successfully");

    } catch (error) {
        console.error("[webhook] Error:", error);
        // 回傳 500 → SendGrid 會稍後重試
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
