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

    const replyTo = `reply+${workspaceId}_${caseId}@reply.beyondspec.tw`;

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
        to,
        from: {
            email: fromEmail,
            name: fromName || "帳務催收中心",
        },
        replyTo,
        subject,
        text: body,
        // HTML 版本：保留換行
        html: `<div style="font-family:sans-serif;font-size:15px;line-height:1.8;color:#222;">${body.replace(/\n/g, "<br>")}</div>`,
    };

    try {
        await sgMail.send(msg);
        console.log(`[send] OK → to=${to} case=${caseId} replyTo=${replyTo}`);
        return res.status(200).json({ ok: true, replyTo });
    } catch (err) {
        const detail = err?.response?.body?.errors || err.message;
        console.error("[send] SendGrid error:", JSON.stringify(detail));
        return res.status(500).json({ error: "SendGrid send failed", detail });
    }
}
