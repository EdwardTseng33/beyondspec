import admin from "firebase-admin";

// 讀取 _webhookHits collection — 用來確認 SendGrid 是否有打過來
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.method !== "GET") return res.status(405).json({ error: "GET only" });

    try {
        if (!admin.apps.length) {
            let rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
            if ((rawKey.startsWith('"') && rawKey.endsWith('"')) || (rawKey.startsWith("'") && rawKey.endsWith("'"))) {
                rawKey = rawKey.slice(1, -1);
            }
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: rawKey.replace(/\\n/g, "\n"),
                }),
            });
        }
        const db = admin.firestore();
        const snap = await db.collection("_webhookHits").orderBy("ts", "desc").limit(20).get();
        const hits = [];
        snap.forEach(doc => hits.push({ id: doc.id, ...doc.data() }));
        return res.status(200).json({ count: hits.length, hits });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}
