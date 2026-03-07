import admin from "firebase-admin";
import Busboy from "busboy";

// ── Vercel 設定：關閉預設 bodyParser，改由 Busboy 手動解析 multipart/form-data ── // v2
export const config = {
    api: { bodyParser: false },
};

// 1. 初始化 Firebase Admin
let firebaseInitError = null;
try {
    if (!admin.apps.length) {
        let rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
        // 處理各種 Vercel 環境變數格式：
        // 1. 移除外層引號（有些人會用引號包住整個 key）
        if ((rawKey.startsWith('"') && rawKey.endsWith('"')) || (rawKey.startsWith("'") && rawKey.endsWith("'"))) {
            rawKey = rawKey.slice(1, -1);
        }
        // 2. 將 literal \n 轉成真正的換行
        const privateKey = rawKey.replace(/\\n/g, "\n");
        console.log("[webhook:init] FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID ? "SET" : "MISSING");
        console.log("[webhook:init] FIREBASE_CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL ? "SET" : "MISSING");
        console.log("[webhook:init] FIREBASE_PRIVATE_KEY:", privateKey ? `SET (${privateKey.length} chars, begins=${privateKey.substring(0, 27)})` : "MISSING");
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
    console.error("[webhook:init] Firebase init FAILED:", e.message);
    console.error("[webhook:init] Key preview:", (process.env.FIREBASE_PRIVATE_KEY || "").substring(0, 50));
}
const db = firebaseInitError ? null : admin.firestore();

// 2. 將 multipart/form-data 請求解析為 key-value 物件
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

// ═══════════════════════════════════════════════════════════════
// 3. 關鍵字規則引擎（零外部 API 依賴）
// ═══════════════════════════════════════════════════════════════

const KEYWORDS = {
    // ── 善意信號（降低風險）──
    positive: [
        "會付", "會轉", "會匯", "馬上付", "立刻付", "盡快付",
        "下週付", "明天付", "今天付", "月底前", "週一付", "週五前",
        "已匯款", "已轉帳", "已付款", "已處理", "已安排",
        "抱歉遲了", "不好意思", "感謝提醒", "收到了",
        "會盡快處理", "正在處理", "安排付款", "排入付款",
    ],
    // ── 承諾付款日期的模式 ──
    datePatterns: [
        /(\d{1,2})[/\-.](\d{1,2})/,                    // 3/15, 3-15
        /(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/,      // 2026/3/15
        /(下週[一二三四五六日])/,                          // 下週一
        /(本週[一二三四五六日])/,                          // 本週五
        /(明天|後天|大後天)/,                              // 明天
        /(\d{1,2})(號|日)(前|以前|之前)?/,               // 15號前
        /(月底|月底前|月初)/,                              // 月底前
        /(這週|下週|本月|下個月)(內|底)?/,                 // 下週內
    ],
    // ── 爭議信號（提高風險）──
    dispute: [
        "品質問題", "品質有問題", "瑕疵", "不符", "不合規格",
        "合約爭議", "合約問題", "條款不同意", "未達標",
        "沒收到貨", "貨有問題", "服務不滿意", "未完成",
        "要求退款", "退款", "折讓", "折扣",
        "不是我們的責任", "責任歸屬", "你們的問題",
        "需要釐清", "需要確認", "有疑問",
    ],
    // ── 高風險信號 ──
    highRisk: [
        "不會付", "拒絕付款", "不付", "無法付款",
        "找律師", "法律途徑", "法院見", "訴訟",
        "沒有欠款", "不承認", "不認帳",
        "已經付過", "重複請款", "帳目不對",
        "公司已解散", "倒閉", "破產",
        "不要再寄", "不要再聯繫", "騷擾",
    ],
    // ── 拖延信號（中風險）──
    stalling: [
        "再給我一點時間", "需要時間", "最近比較忙",
        "資金周轉", "周轉困難", "現金流", "資金緊",
        "等客戶付款", "等款項進來", "等撥款",
        "內部流程", "需要簽核", "需要主管核准", "跑流程",
        "再看看", "考慮一下", "之後再說",
        "忘記了", "不小心", "疏忽",
    ],
};

function analyzeWithKeywords(emailText) {
    const text = emailText.toLowerCase();
    let score = 0; // 正=善意, 負=高風險
    const signals = [];
    let paymentCommitted = false;
    let commitDate = null;
    let disputeDetected = false;

    // ── 掃描善意關鍵字 ──
    for (const kw of KEYWORDS.positive) {
        if (text.includes(kw)) {
            score += 2;
            signals.push(`✅ ${kw}`);
        }
    }

    // ── 掃描付款日期 ──
    for (const pattern of KEYWORDS.datePatterns) {
        const m = text.match(pattern);
        if (m) {
            paymentCommitted = true;
            commitDate = m[0];
            score += 3;
            signals.push(`📅 ${m[0]}`);
            break;
        }
    }

    // ── 掃描爭議關鍵字 ──
    for (const kw of KEYWORDS.dispute) {
        if (text.includes(kw)) {
            disputeDetected = true;
            score -= 2;
            signals.push(`⚠️ ${kw}`);
        }
    }

    // ── 掃描高風險關鍵字 ──
    for (const kw of KEYWORDS.highRisk) {
        if (text.includes(kw)) {
            score -= 5;
            signals.push(`🚨 ${kw}`);
        }
    }

    // ── 掃描拖延關鍵字 ──
    for (const kw of KEYWORDS.stalling) {
        if (text.includes(kw)) {
            score -= 1;
            signals.push(`⏳ ${kw}`);
        }
    }

    // ── 判定風險等級 ──
    let risk;
    if (score >= 3) risk = "low";
    else if (score >= -2) risk = "medium";
    else risk = "high";

    // ── 生成摘要 ──
    const topSignals = signals.slice(0, 3).map(s => s.replace(/^[✅⚠️🚨⏳📅]\s?/, "")).join("、");
    const summary = topSignals
        ? (topSignals.length > 25 ? topSignals.substring(0, 22) + "…" : topSignals)
        : "未偵測到明確意圖";

    // ── 建議行動 ──
    let suggestedAction;
    if (risk === "low" && paymentCommitted) {
        suggestedAction = `追蹤付款（${commitDate}）`;
    } else if (risk === "low") {
        suggestedAction = "確認付款時程";
    } else if (disputeDetected) {
        suggestedAction = "釐清爭議後再催款";
    } else if (risk === "high") {
        suggestedAction = "發送法務警告或轉法務";
    } else {
        suggestedAction = "發送正式催告（T2）";
    }

    return {
        risk,
        summary,
        paymentCommitted,
        commitDate,
        disputeDetected,
        suggestedAction,
        _engine: "keyword-rules-v1",
        _score: score,
        _signals: signals,
    };
}

// ═══════════════════════════════════════════════════════════════
// 4. AI 判讀（若有 ANTHROPIC_API_KEY 就用 Claude，否則用關鍵字）
// ═══════════════════════════════════════════════════════════════

async function analyzeReply(emailText) {
    // 優先用 Claude（如果有 API Key 且額度足夠）
    if (process.env.ANTHROPIC_API_KEY) {
        try {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                },
                body: JSON.stringify({
                    model: "claude-haiku-4-5-20251001",
                    max_tokens: 512,
                    messages: [{
                        role: "user",
                        content: `你是一位專業的應收帳款催收助理，請分析以下客戶回信並回覆純 JSON（不加任何說明文字）：
{
  "risk": "low" 或 "medium" 或 "high",
  "summary": "回信重點摘要（25字以內）",
  "paymentCommitted": true 或 false,
  "commitDate": "YYYY-MM-DD 或 null（若客戶有明確提到付款日期）",
  "disputeDetected": true 或 false,
  "suggestedAction": "建議下一步行動（30字以內）"
}

判斷原則：
- risk=low：客戶明確承諾付款且態度配合
- risk=medium：態度模糊、給出藉口、未明確承諾
- risk=high：拒絕付款、提出爭議、無回應跡象
- paymentCommitted=true：信中有明確付款承諾或日期
- disputeDetected=true：信中提到合約爭議、品質問題、拒絕承認欠款

只回覆 JSON。

客戶回信內容：
${emailText.substring(0, 2000)}`
                    }],
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const text = data.content[0].text;
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const result = JSON.parse(jsonMatch[0]);
                    result._engine = "claude-haiku";
                    console.log("[webhook] Used Claude Haiku for analysis");
                    return result;
                }
            }
            console.warn("[webhook] Claude API failed, falling back to keyword engine");
        } catch (e) {
            console.warn("[webhook] Claude API error:", e.message, "— falling back to keyword engine");
        }
    }

    // Fallback：關鍵字規則引擎
    console.log("[webhook] Using keyword rule engine");
    return analyzeWithKeywords(emailText);
}

// ═══════════════════════════════════════════════════════════════
// 5. Vercel Serverless 核心處理出口
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
        console.error("[webhook] Firebase was not initialized:", firebaseInitError.message);
        return res.status(500).json({ error: "Firebase init failed", detail: firebaseInitError.message });
    }

    try {
        // ── STEP A: 解析 multipart/form-data ──
        console.log("[webhook] STEP A: Parsing multipart...");
        const fields = await parseMultipart(req);
        console.log("[webhook] STEP A done. Fields:", Object.keys(fields).join(", "));

        const fromEmail = fields.from || "";
        const toEmail   = fields.to   || "";
        const emailText = fields.text || fields.html || "";
        console.log(`[webhook] from=${fromEmail} to=${toEmail} textLen=${emailText.length}`);

        // SendGrid 也會傳 envelope（JSON 格式），可能更可靠
        let envelopeTo = "";
        if (fields.envelope) {
            try {
                const env = JSON.parse(fields.envelope);
                envelopeTo = Array.isArray(env.to) ? env.to.join(", ") : (env.to || "");
                console.log(`[webhook] envelope.to=${envelopeTo}`);
            } catch (e) {
                console.log("[webhook] envelope parse failed:", e.message);
            }
        }

        // ── STEP B: 解析 workspaceId + caseId ──
        // 先嘗試 to 欄位，再嘗試 envelope.to
        let match = toEmail.match(/reply\+([^_]+)_([^@]+)@/);
        if (!match && envelopeTo) {
            match = envelopeTo.match(/reply\+([^_]+)_([^@]+)@/);
        }
        if (!match) {
            console.log("[webhook] STEP B: No valid ID in to:", toEmail, "envelope:", envelopeTo);
            return res.status(200).json({ status: "skipped", reason: "No matching address pattern", to: toEmail, envelopeTo });
        }
        const workspaceId = match[1];
        const caseId      = match[2];
        console.log(`[webhook] STEP B done. ws=${workspaceId} case=${caseId}`);

        // ── STEP C: 分析回信（Claude 或 關鍵字）──
        console.log("[webhook] STEP C: Analyzing reply...");
        const aiResult = await analyzeReply(emailText);
        console.log(`[webhook] STEP C done. engine=${aiResult._engine} risk=${aiResult.risk}`);

        // ── STEP D: 讀取 Firestore ──
        console.log("[webhook] STEP D: Reading Firestore...");
        const arCasesRef = db.collection("workspaces").doc(workspaceId).collection("data").doc("arCases");
        const arCasesDoc = await arCasesRef.get();
        if (!arCasesDoc.exists) {
            return res.status(200).json({ status: "skipped", reason: "arCases not found", workspaceId });
        }
        const cases = arCasesDoc.data().value || [];
        const idx = cases.findIndex(c => String(c.id) === String(caseId));
        if (idx === -1) {
            return res.status(200).json({ status: "skipped", reason: "Case not found", caseId, availableIds: cases.map(c => c.id) });
        }

        // ── STEP E: 更新案件 ──
        const today = new Date().toISOString().split("T")[0];
        const history = [...(cases[idx].history || [])];
        history.push({
            date: today,
            action: `📩 收到客戶回覆 (${fromEmail})`,
            note: emailText.substring(0, 120) + (emailText.length > 120 ? "…" : ""),
        });

        const riskLabel = aiResult.risk === "low" ? "✅ 善意回覆"
            : aiResult.risk === "medium" ? "⚠️ 態度模糊" : "🚨 高風險拖延";
        let aiNoteLine = `判定：${riskLabel}｜${aiResult.summary || "無"}`;
        if (aiResult.paymentCommitted) aiNoteLine += `｜💳 承諾付款${aiResult.commitDate ? `（${aiResult.commitDate}）` : ""}`;
        if (aiResult.disputeDetected) aiNoteLine += `｜⚠️ 偵測到爭議`;
        aiNoteLine += `｜建議：${aiResult.suggestedAction || "無"}`;
        aiNoteLine += `｜引擎：${aiResult._engine || "unknown"}`;

        history.push({ date: today, action: "🧠 AI 判讀完成", note: aiNoteLine });

        // ── 清除所有 undefined 值（Firestore 不接受 undefined）──
        function sanitize(obj) {
            if (obj === null || obj === undefined) return null;
            if (Array.isArray(obj)) return obj.map(sanitize);
            if (typeof obj === "object" && obj !== null) {
                const clean = {};
                for (const [k, v] of Object.entries(obj)) {
                    clean[k] = sanitize(v);
                }
                return clean;
            }
            return obj;
        }

        const updatedCase = sanitize({
            ...cases[idx],
            history,
            mockRisk: aiResult.risk || "medium",
            lastReplyAt: today,
            lastReplyFrom: fromEmail || "",
            lastReplyText: emailText.substring(0, 300) || "",
            aiSummary: aiResult.summary || "",
            aiPaymentCommitted: aiResult.paymentCommitted || false,
            aiCommitDate: aiResult.commitDate || null,
            aiDisputeDetected: aiResult.disputeDetected || false,
            aiSuggestedAction: aiResult.suggestedAction || "",
            aiEngine: aiResult._engine || "unknown",
            unreadReply: true,
        });

        cases[idx] = updatedCase;
        console.log("[webhook] STEP E done. Updated case keys:", Object.keys(updatedCase).join(", "));

        // ── STEP F: 寫回 Firestore ──
        console.log("[webhook] STEP F: Writing to Firestore...");
        await arCasesRef.update({
            value: sanitize(cases),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedBy: { email: "webhook@system", name: "AI 自動回信判讀" },
        });

        console.log(`[webhook] Done! Case ${caseId} — risk=${aiResult.risk} engine=${aiResult._engine}`);
        return res.status(200).json({
            status: "success",
            engine: aiResult._engine,
            caseId,
            risk: aiResult.risk,
            summary: aiResult.summary,
            suggestedAction: aiResult.suggestedAction,
        });

    } catch (error) {
        console.error("[webhook] Error:", error.message, error.stack);
        return res.status(500).json({ error: "Internal Server Error", detail: error.message });
    }
}
