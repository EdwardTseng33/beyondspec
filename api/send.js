import sgMail from "@sendgrid/mail";

// ── Vercel 設定 ──
export const config = {
    api: { bodyParser: true },
};

export default async function handler(req, res) {
    // CORS — allow beyondspec.tw to call this API on vercel.app
    res.setHeader("Access-Control-Allow-Origin", "https://beyondspec.tw");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { to, subject, body, workspaceId, caseId, fromName } = req.body;

    // 基本欄位檢查
    if (!to || !subject || !body || !workspaceId || !caseId) {
        return res.status(400).json({ error: "Missing required fields: to, subject, body, workspaceId, caseId" });
    }

    // FROM_EMAIL 必須是 SendGrid 已驗證的寄件者
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    if (!fromEmail) {
        return res.status(500).json({ error: "SENDGRID_FROM_EMAIL env var not set" });
    }

    const replyToAddress = `reply+${workspaceId}_${caseId}@reply.beyondspec.tw`;

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
        to,
        from: {
            email: fromEmail,
            name: fromName || "帳務催收中心",
        },
        // ── Reply-To：使用物件格式確保 SendGrid 正確設定 header ──
        replyTo: {
            email: replyToAddress,
            name: fromName || "帳務催收中心",
        },
        subject,
        text: body,
        // HTML 版本：保留換行
        html: `<div style="font-family:sans-serif;font-size:15px;line-height:1.8;color:#222;">${body.replace(/\n/g, "<br>")}</div>`,
        // ── 強制 Reply-To header（某些 @sendgrid/mail 版本 replyTo 可能不生效）──
        headers: {
            "Reply-To": replyToAddress,
        },
        // ── Email 追蹤設定 ──
        trackingSettings: {
            clickTracking: { enable: true, enableText: false },
            openTracking: { enable: true },
        },
        // ── 自訂參數：Event Webhook 會帶回這些值 ──
        customArgs: {
            workspaceId,
            caseId,
            sentAt: new Date().toISOString(),
        },
    };

    try {
        await sgMail.send(msg);
        console.log(`[send] OK → to=${to} case=${caseId} replyTo=${replyToAddress}`);
        return res.status(200).json({ ok: true, replyTo: replyToAddress });
    } catch (err) {
        const detail = err?.response?.body?.errors || err.message;
        console.error("[send] SendGrid error:", JSON.stringify(detail));
        return res.status(500).json({ error: "SendGrid send failed", detail });
    }
}
