import admin from "firebase-admin";

// ── Vercel 設定 ──
export const config = {
    api: { bodyParser: true },
};

// 1. 初始化 Firebase Admin（與 webhook.js 共用同一份邏輯）
let firebaseInitError = null;
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
    firebaseInitError = e;
    console.error("[track:init] Firebase init FAILED:", e.message);
}
const db = firebaseInitError ? null : admin.firestore();

// ═══════════════════════════════════════════════════════════════
// 2. 我們關注的 SendGrid 事件類型
// ═══════════════════════════════════════════════════════════════
const TRACKED_EVENTS = new Set([
    "delivered",  // 郵件已送達收件伺服器
    "open",       // 收件人開啟郵件（tracking pixel）
    "click",      // 收件人點擊郵件中的連結
    "bounce",     // 郵件被退回
    "dropped",    // SendGrid 未發送（例如黑名單）
    "spamreport", // 收件人標記為垃圾郵件
]);

// ═══════════════════════════════════════════════════════════════
// 3. 核心處理：接收 SendGrid Event Webhook
// ═══════════════════════════════════════════════════════════════

export default async function handler(req, res) {
    // ── CORS ──
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    if (firebaseInitError) {
        console.error("[track] Firebase not initialized:", firebaseInitError.message);
        return res.status(500).json({ error: "Firebase init failed" });
    }

    try {
        // SendGrid Event Webhook 以 JSON 陣列發送批次事件
        const events = Array.isArray(req.body) ? req.body : [req.body];
        console.log(`[track] Received ${events.length} event(s)`);

        // ── 按 workspaceId + caseId 分組，批次更新 ──
        const updates = {}; // key: "wsId::caseId" → { events: [...] }

        for (const evt of events) {
            const eventType = evt.event;
            if (!TRACKED_EVENTS.has(eventType)) continue;

            const workspaceId = evt.workspaceId || evt.custom_args?.workspaceId;
            const caseId = evt.caseId || evt.custom_args?.caseId;

            if (!workspaceId || !caseId) {
                console.log(`[track] Skipping event ${eventType} — no workspaceId/caseId`);
                continue;
            }

            const key = `${workspaceId}::${caseId}`;
            if (!updates[key]) {
                updates[key] = { workspaceId, caseId, events: [] };
            }

            updates[key].events.push({
                type: eventType,
                timestamp: evt.timestamp ? new Date(evt.timestamp * 1000).toISOString() : new Date().toISOString(),
                email: evt.email || "",
                url: evt.url || "",           // click 事件才有
                userAgent: evt.useragent || "",
                ip: evt.ip || "",
                reason: evt.reason || "",     // bounce 事件才有
                sgEventId: evt.sg_event_id || "",
                sgMessageId: evt.sg_message_id || "",
            });
        }

        const keys = Object.keys(updates);
        if (keys.length === 0) {
            console.log("[track] No actionable events");
            return res.status(200).json({ status: "ok", processed: 0 });
        }

        // ── 逐案更新 Firestore ──
        let processed = 0;
        for (const key of keys) {
            const { workspaceId, caseId, events: caseEvents } = updates[key];

            try {
                const arCasesRef = db.collection("workspaces").doc(workspaceId).collection("data").doc("arCases");
                const arCasesDoc = await arCasesRef.get();

                if (!arCasesDoc.exists) {
                    console.log(`[track] Workspace ${workspaceId} arCases not found — skipping`);
                    continue;
                }

                const cases = arCasesDoc.data().value || [];
                const idx = cases.findIndex(c => String(c.id) === String(caseId));

                if (idx === -1) {
                    console.log(`[track] Case ${caseId} not found in workspace ${workspaceId} — skipping`);
                    continue;
                }

                // ── 聚合事件為追蹤狀態 ──
                const tracking = cases[idx].emailTracking || {
                    delivered: false,
                    deliveredAt: null,
                    opened: false,
                    openedAt: null,
                    openCount: 0,
                    clicked: false,
                    clickedAt: null,
                    clickCount: 0,
                    clickedUrls: [],
                    bounced: false,
                    bouncedAt: null,
                    bounceReason: "",
                    spamReported: false,
                    lastEventAt: null,
                    events: [],
                };

                for (const evt of caseEvents) {
                    // 追加至事件紀錄（最多保留 50 筆）
                    tracking.events = [...(tracking.events || []), {
                        type: evt.type,
                        at: evt.timestamp,
                        email: evt.email,
                        url: evt.url || null,
                    }].slice(-50);

                    tracking.lastEventAt = evt.timestamp;

                    switch (evt.type) {
                        case "delivered":
                            tracking.delivered = true;
                            if (!tracking.deliveredAt) tracking.deliveredAt = evt.timestamp;
                            break;

                        case "open":
                            tracking.opened = true;
                            if (!tracking.openedAt) tracking.openedAt = evt.timestamp;
                            tracking.openCount = (tracking.openCount || 0) + 1;
                            break;

                        case "click":
                            tracking.clicked = true;
                            if (!tracking.clickedAt) tracking.clickedAt = evt.timestamp;
                            tracking.clickCount = (tracking.clickCount || 0) + 1;
                            if (evt.url && !(tracking.clickedUrls || []).includes(evt.url)) {
                                tracking.clickedUrls = [...(tracking.clickedUrls || []), evt.url].slice(-10);
                            }
                            break;

                        case "bounce":
                            tracking.bounced = true;
                            tracking.bouncedAt = evt.timestamp;
                            tracking.bounceReason = evt.reason || "";
                            break;

                        case "dropped":
                            tracking.bounced = true;
                            tracking.bouncedAt = evt.timestamp;
                            tracking.bounceReason = `dropped: ${evt.reason || "unknown"}`;
                            break;

                        case "spamreport":
                            tracking.spamReported = true;
                            break;
                    }
                }

                // ── 寫入歷程紀錄（僅重要事件：首次開信、首次點擊、退信）──
                const history = [...(cases[idx].history || [])];
                const now = new Date();
                const today = now.toISOString().split("T")[0];
                const timeStr = now.toISOString().substring(11, 16);

                const hasImportant = caseEvents.some(e => ["open", "click", "bounce", "spamreport"].includes(e.type));
                if (hasImportant) {
                    const firstOpen = caseEvents.find(e => e.type === "open");
                    const firstClick = caseEvents.find(e => e.type === "click");
                    const hasBounce = caseEvents.find(e => e.type === "bounce" || e.type === "dropped");
                    const hasSpam = caseEvents.find(e => e.type === "spamreport");

                    // 只在首次事件時加歷程，避免重複灌水
                    if (firstOpen && tracking.openCount <= 1) {
                        history.push({ date: today, time: timeStr, action: "👁️ 客戶已開啟郵件", note: `開啟者：${firstOpen.email}` });
                    }
                    if (firstClick && tracking.clickCount <= 1) {
                        history.push({ date: today, time: timeStr, action: "🔗 客戶點擊郵件連結", note: `連結：${firstClick.url || "unknown"}` });
                    }
                    if (hasBounce && !cases[idx].emailTracking?.bounced) {
                        history.push({ date: today, time: timeStr, action: "❌ 郵件退回", note: `原因：${hasBounce.reason || "unknown"}` });
                    }
                    if (hasSpam && !cases[idx].emailTracking?.spamReported) {
                        history.push({ date: today, time: timeStr, action: "🚫 被標記為垃圾郵件", note: "" });
                    }
                }

                cases[idx] = {
                    ...cases[idx],
                    emailTracking: tracking,
                    history,
                };

                await arCasesRef.set({
                    value: cases,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedBy: { email: "track@system", name: "Email 追蹤系統" },
                }, { merge: true });

                processed++;
                console.log(`[track] Updated case ${caseId} in ws ${workspaceId} — events: ${caseEvents.map(e => e.type).join(",")}`);

            } catch (err) {
                console.error(`[track] Error updating ${key}:`, err.message);
            }
        }

        return res.status(200).json({ status: "ok", processed, total: events.length });

    } catch (error) {
        console.error("[track] Error:", error.message, error.stack);
        return res.status(500).json({ error: "Internal Server Error", detail: error.message });
    }
}
