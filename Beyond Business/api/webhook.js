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
        const fromEmail = req.body.from;
        const toEmail = req.body.to;
        const emailText = req.body.text;

        // 從收件人 (To) 裡面精準切出 租戶ID 跟 案件ID (例如: reply+TA001_c123@reply.beyondspec.tw)
        const match = toEmail.match(/\+([^_]+)_([^@]+)@/);

        // 如果找不到標籤，退回 200 (SendGrid 才會停止重試)
        if (!match) {
            console.log("No valid tenant or case ID found in the toEmail address:", toEmail);
            return res.status(200).send("No matching Tenant or Case ID");
        }

        const tenantId = match[1]; // 拿到 TA001
        const caseId = match[2];   // 拿到 c123

        // 呼叫 AI 判讀意圖
        const model = ai.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });
        const prompt = `你是一位催收助理。分析客戶回信判斷風險。請確保只回覆純 JSON：{"risk": "low"或"high"或"medium", "summary": "回信重点"}\n\n客戶回信內容：\n${emailText}`;
        const aiResponse = await model.generateContent(prompt);

        const aiResult = JSON.parse(aiResponse.response.text());

        // 寫入對應租戶的子集合
        const caseRef = db.collection("tenants").doc(tenantId).collection("arCases").doc(caseId);
        const caseDoc = await caseRef.get();

        if (caseDoc.exists) {
            const history = caseDoc.data().history || [];
            history.push({
                date: new Date().toISOString().split("T")[0],
                action: `📩 收到客戶回覆 (${fromEmail})`,
                note: emailText.substring(0, 100) + "..."
            });
            history.push({
                date: new Date().toISOString().split("T")[0],
                action: `🧠 AI 判讀完成`,
                note: `判定結果：${aiResult.risk === 'low' ? '善意' : '拖延'}。摘要：${aiResult.summary}`
            });

            await caseRef.update({
                history: history,
                mockRisk: aiResult.risk,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        return res.status(200).send("Processed successfully");

    } catch (error) {
        console.error("Vercel Webhook Error:", error);
        // 回傳 500 代表錯誤，SendGrid 會在稍後重試
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
