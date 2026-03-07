import admin from "firebase-admin";

// 初始化 Firebase Admin（與 webhook.js 相同邏輯）
try {
    if (!admin.apps.length) {
        let rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
        if ((rawKey.startsWith('"') && rawKey.endsWith('"')) || (rawKey.startsWith("'") && rawKey.endsWith("'"))) {
            rawKey = rawKey.slice(1, -1);
        }
        const privateKey = rawKey.replace(/\\n/g, "\n");
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
    }
} catch (e) {
    console.error("[debug-ar] Firebase init failed:", e.message);
}
const db = admin.apps.length ? admin.firestore() : null;

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (!db) return res.status(500).json({ error: "Firebase not initialized" });

    const wsId = req.query.ws || "5B18OCKIO3jwUYe4PrLq";
    const caseId = req.query.case || "";

    try {
        // 1. 列出 workspace 下有哪些 data documents
        const dataRef = db.collection("workspaces").doc(wsId).collection("data");
        const dataDocs = await dataRef.listDocuments();
        const docIds = dataDocs.map(d => d.id);

        // 2. 嘗試讀 arCases
        const arDoc = await dataRef.doc("arCases").get();
        let arInfo = { exists: arDoc.exists };

        if (arDoc.exists) {
            const data = arDoc.data();
            const cases = data.value || [];
            arInfo.fieldCount = Object.keys(data).length;
            arInfo.fields = Object.keys(data);
            arInfo.caseCount = cases.length;
            arInfo.caseIds = cases.map(c => ({ id: c.id, clientName: c.clientName, status: c.status }));
            arInfo.updatedAt = data.updatedAt ? data.updatedAt.toDate().toISOString() : null;
            arInfo.updatedBy = data.updatedBy || null;

            // 3. 如果指定 caseId，深入檢查
            if (caseId) {
                const targetCase = cases.find(c => String(c.id) === String(caseId));
                if (targetCase) {
                    // 檢查每個欄位的類型，找出可能導致 INVALID_ARGUMENT 的值
                    const fieldTypes = {};
                    for (const [k, v] of Object.entries(targetCase)) {
                        const type = v === null ? "null"
                            : v === undefined ? "UNDEFINED!"
                            : Array.isArray(v) ? `array(${v.length})`
                            : typeof v === "number" && isNaN(v) ? "NaN!"
                            : typeof v === "number" && !isFinite(v) ? "Infinity!"
                            : typeof v;
                        fieldTypes[k] = type;
                    }
                    arInfo.targetCase = { id: targetCase.id, fieldTypes };

                    // 檢查 history 陣列中的每筆
                    if (targetCase.history) {
                        arInfo.historyCheck = targetCase.history.map((h, i) => {
                            const issues = [];
                            for (const [k, v] of Object.entries(h)) {
                                if (v === undefined) issues.push(`${k}=undefined`);
                                if (typeof v === "number" && isNaN(v)) issues.push(`${k}=NaN`);
                                if (v && typeof v === "object" && v.constructor && v.constructor.name !== "Object" && !Array.isArray(v)) {
                                    issues.push(`${k}=SpecialObject(${v.constructor.name})`);
                                }
                            }
                            return { index: i, action: h.action, issues: issues.length ? issues : "clean" };
                        });
                    }
                } else {
                    arInfo.targetCase = "NOT FOUND";
                    arInfo.availableCaseIds = cases.map(c => c.id);
                }
            }
        }

        return res.status(200).json({
            workspaceId: wsId,
            projectId: process.env.FIREBASE_PROJECT_ID,
            dataDocuments: docIds,
            arCases: arInfo,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message, stack: error.stack });
    }
}
