import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════
// 🏰 移動城堡業務指揮 Dashboard
// Beyond Spec — 業務漏斗 + 專案管理 + 角色任務
// ══════════════════════════════════════════════

// ── Design Tokens ──
const C = {
  bg: "#08080c", surface: "#111118", card: "#16161f", border: "rgba(255,255,255,.08)",
  borderHover: "rgba(255,255,255,.15)", ink: "#e8e8f0", inkSoft: "rgba(255,255,255,.6)",
  inkMuted: "rgba(255,255,255,.35)", accent: "#6C8EFF", accentSoft: "rgba(108,142,255,.12)",
  gold: "#F5A623", goldSoft: "rgba(245,166,35,.12)",
  emerald: "#34D399", emeraldSoft: "rgba(52,211,153,.12)",
  rose: "#F472B6", roseSoft: "rgba(244,114,182,.12)",
  violet: "#A78BFA", violetSoft: "rgba(167,139,250,.12)",
  cyan: "#22D3EE", cyanSoft: "rgba(34,211,238,.12)",
  orange: "#FB923C", orangeSoft: "rgba(251,146,60,.12)",
};

const PIPELINE_STAGES = [
  { id: "inquiry", label: "洽詢中", color: C.cyan, icon: "📥" },
  { id: "exploring", label: "探索會議", color: C.accent, icon: "🗓" },
  { id: "proposal", label: "提案中", color: C.gold, icon: "📋" },
  { id: "negotiation", label: "議價中", color: C.orange, icon: "🤝" },
  { id: "won", label: "成交 ✓", color: C.emerald, icon: "🎉" },
  { id: "lost", label: "未成案", color: C.rose, icon: "—" },
];

const CASTLE_ROLES = [
  { id: "howl", name: "霍爾", title: "CPO", emoji: "🧙", color: C.accent },
  { id: "calcifer", name: "卡西法", title: "CTO", emoji: "🔥", color: C.orange },
  { id: "markl", name: "馬魯克", title: "COO", emoji: "🌿", color: C.emerald },
  { id: "sophie", name: "蘇菲", title: "CMO", emoji: "🌸", color: C.rose },
  { id: "turnip", name: "蕪菁頭", title: "CDO", emoji: "🥕", color: C.violet },
];

const PROJECT_STATUSES = [
  { id: "discovery", label: "探索期", color: C.cyan },
  { id: "planning", label: "規劃中", color: C.accent },
  { id: "in_progress", label: "執行中", color: C.gold },
  { id: "review", label: "審核中", color: C.violet },
  { id: "delivered", label: "已交付", color: C.emerald },
];

// ── Demo Data ──
const DEMO_DEALS = [
  { id: 1, name: "FitTrack 健身 App", company: "FitLife Inc.", contact: "陳小明", email: "ming@fitlife.tw", stage: "exploring", value: 250000, tier: "Tier 2", notes: "有興趣做 0→1 Sprint，下週三探索會議", created: "2026-02-20", role: "howl" },
  { id: 2, name: "寵物社群平台", company: "PawPaw 寵寵", contact: "林小花", email: "flower@pawpaw.tw", stage: "proposal", value: 120000, tier: "Tier 3", notes: "已送提案，等待回覆", created: "2026-02-15", role: "sophie" },
  { id: 3, name: "餐飲 POS 系統優化", company: "食光科技", contact: "王大明", email: "wang@foodtime.tw", stage: "inquiry", value: 30000, tier: "Tier 1", notes: "從表單進來，需要產品健檢", created: "2026-02-27", role: "markl" },
  { id: 4, name: "線上教育平台 MVP", company: "學堂科技", contact: "張小美", email: "mei@xuetang.tw", stage: "negotiation", value: 250000, tier: "Tier 2", notes: "價格已談到 22 萬，接近成交", created: "2026-02-10", role: "howl" },
  { id: 5, name: "B2B SaaS Landing Page", company: "雲端方案", contact: "李大哥", email: "li@cloudsol.tw", stage: "won", value: 30000, tier: "Tier 1", notes: "已完成健檢報告，客戶滿意", created: "2026-01-28", role: "turnip" },
  { id: 6, name: "旅遊預訂 App", company: "島遊科技", contact: "黃小姐", email: "huang@island.tw", stage: "lost", value: 250000, tier: "Tier 2", notes: "預算不足，暫緩", created: "2026-02-01", role: "sophie" },
];

const DEMO_TASKS = [
  { id: 1, text: "完成 FitTrack 探索會議簡報", role: "howl", dealId: 1, due: "2026-03-05", done: false },
  { id: 2, text: "PawPaw 提案報價單修改", role: "sophie", dealId: 2, due: "2026-03-03", done: false },
  { id: 3, text: "食光科技產品健檢初步分析", role: "turnip", dealId: 3, due: "2026-03-04", done: false },
  { id: 4, text: "學堂科技合約草稿", role: "markl", dealId: 4, due: "2026-03-02", done: false },
  { id: 5, text: "雲端方案健檢報告 QA", role: "markl", dealId: 5, due: "2026-02-28", done: true },
  { id: 6, text: "FitTrack 技術可行性評估", role: "calcifer", dealId: 1, due: "2026-03-06", done: false },
  { id: 7, text: "LinkedIn 本週貼文（案例分享）", role: "sophie", dealId: null, due: "2026-03-01", done: false },
  { id: 8, text: "學堂科技 IA 資訊架構圖", role: "turnip", dealId: 4, due: "2026-03-07", done: false },
];

// ── Helpers ──
const fmt = (n) => "NT$ " + n.toLocaleString();
const stageOf = (id) => PIPELINE_STAGES.find((s) => s.id === id);
const roleOf = (id) => CASTLE_ROLES.find((r) => r.id === id);

// ══════════════════════════════════════════════
// Components
// ══════════════════════════════════════════════

const Badge = ({ color, bg, children }) => (
  <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, letterSpacing: ".03em", color, background: bg }}>{children}</span>
);

const RolePill = ({ roleId }) => {
  const r = roleOf(roleId);
  if (!r) return null;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${r.color}18`, color: r.color }}>{r.emoji} {r.name}</span>;
};

const Card = ({ children, style, onClick, hover }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onClick}
      style={{ background: C.card, border: `1px solid ${hovered && hover ? C.borderHover : C.border}`, borderRadius: 12, padding: 16, cursor: onClick ? "pointer" : "default", transition: "all .2s", ...(hovered && hover ? { transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(0,0,0,.3)" } : {}), ...style }}
    >{children}</div>
  );
};

// ── Stats Row ──
const StatsRow = ({ deals }) => {
  const active = deals.filter((d) => !["won", "lost"].includes(d.stage));
  const won = deals.filter((d) => d.stage === "won");
  const pipeline = active.reduce((s, d) => s + d.value, 0);
  const revenue = won.reduce((s, d) => s + d.value, 0);
  const stats = [
    { label: "進行中案件", value: active.length, unit: "件", color: C.accent },
    { label: "漏斗總值", value: fmt(pipeline), unit: "", color: C.gold },
    { label: "已成交營收", value: fmt(revenue), unit: "", color: C.emerald },
    { label: "成交率", value: deals.length > 0 ? Math.round((won.length / deals.length) * 100) + "%" : "—", unit: "", color: C.violet },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
      {stats.map((s, i) => (
        <Card key={i} style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: 12, color: C.inkMuted, marginBottom: 8, letterSpacing: ".05em" }}>{s.label}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</div>
        </Card>
      ))}
    </div>
  );
};

// ── Pipeline Kanban ──
const PipelineBoard = ({ deals, onSelect, selected }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${PIPELINE_STAGES.length},1fr)`, gap: 12, marginBottom: 32 }}>
    {PIPELINE_STAGES.map((stage) => {
      const stageDeals = deals.filter((d) => d.stage === stage.id);
      const total = stageDeals.reduce((s, d) => s + d.value, 0);
      return (
        <div key={stage.id} style={{ minHeight: 200 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>{stage.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: stage.color }}>{stage.label}</span>
            </div>
            <span style={{ fontSize: 11, color: C.inkMuted, fontFamily: "monospace" }}>{stageDeals.length}</span>
          </div>
          <div style={{ width: "100%", height: 3, background: `${stage.color}30`, borderRadius: 2, marginBottom: 12 }}>
            <div style={{ height: "100%", width: stageDeals.length > 0 ? "100%" : "0%", background: stage.color, borderRadius: 2, transition: "width .3s" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {stageDeals.map((deal) => (
              <Card key={deal.id} hover onClick={() => onSelect(deal)} style={{ padding: 14, borderLeft: `3px solid ${stage.color}`, ...(selected?.id === deal.id ? { borderColor: C.ink, boxShadow: `0 0 0 1px ${C.ink}` } : {}) }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 6, lineHeight: 1.3 }}>{deal.name}</div>
                <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 8 }}>{deal.company}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Badge color={C.gold} bg={C.goldSoft}>{fmt(deal.value)}</Badge>
                  <RolePill roleId={deal.role} />
                </div>
              </Card>
            ))}
            {stageDeals.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: C.inkMuted, fontSize: 12, border: `1px dashed ${C.border}`, borderRadius: 10 }}>暫無案件</div>
            )}
          </div>
          {total > 0 && (
            <div style={{ marginTop: 10, fontSize: 11, color: C.inkMuted, textAlign: "right", fontFamily: "monospace" }}>小計 {fmt(total)}</div>
          )}
        </div>
      );
    })}
  </div>
);

// ── Deal Detail Panel ──
const DealDetail = ({ deal, tasks, onClose }) => {
  if (!deal) return null;
  const stage = stageOf(deal.stage);
  const role = roleOf(deal.role);
  const dealTasks = tasks.filter((t) => t.dealId === deal.id);
  return (
    <Card style={{ padding: 24, marginBottom: 32, borderTop: `3px solid ${stage.color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.ink }}>{deal.name}</h3>
          <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 4 }}>{deal.company} — {deal.contact}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: `1px solid ${C.border}`, color: C.inkMuted, padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>✕ 關閉</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        <div><div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 4 }}>階段</div><Badge color={stage.color} bg={`${stage.color}20`}>{stage.icon} {stage.label}</Badge></div>
        <div><div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 4 }}>金額</div><div style={{ fontSize: 16, fontWeight: 700, color: C.gold, fontFamily: "monospace" }}>{fmt(deal.value)}</div></div>
        <div><div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 4 }}>方案</div><Badge color={C.accent} bg={C.accentSoft}>{deal.tier}</Badge></div>
        <div><div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 4 }}>負責人</div><RolePill roleId={deal.role} /></div>
      </div>
      <div style={{ background: C.surface, borderRadius: 10, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 6 }}>備註</div>
        <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>{deal.notes}</div>
      </div>
      {dealTasks.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.inkMuted, marginBottom: 10, letterSpacing: ".05em" }}>相關任務</div>
          {dealTasks.map((t) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 14 }}>{t.done ? "✅" : "⬜"}</span>
              <span style={{ flex: 1, fontSize: 13, color: t.done ? C.inkMuted : C.ink, textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
              <RolePill roleId={t.role} />
              <span style={{ fontSize: 11, color: C.inkMuted, fontFamily: "monospace" }}>{t.due}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// ── Tasks by Role ──
const TasksByRole = ({ tasks }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
    {CASTLE_ROLES.map((role) => {
      const roleTasks = tasks.filter((t) => t.role === role.id);
      const pending = roleTasks.filter((t) => !t.done);
      const done = roleTasks.filter((t) => t.done);
      return (
        <div key={role.id}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 20 }}>{role.emoji}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: role.color }}>{role.name}</div>
              <div style={{ fontSize: 10, color: C.inkMuted }}>{role.title}</div>
            </div>
            {pending.length > 0 && (
              <span style={{ marginLeft: "auto", background: `${role.color}25`, color: role.color, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>{pending.length}</span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {pending.map((t) => (
              <Card key={t.id} style={{ padding: 12 }}>
                <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.4, marginBottom: 6 }}>{t.text}</div>
                <div style={{ fontSize: 10, color: C.inkMuted, fontFamily: "monospace" }}>截止 {t.due}</div>
              </Card>
            ))}
            {done.map((t) => (
              <div key={t.id} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, opacity: .4 }}>
                <div style={{ fontSize: 12, color: C.inkMuted, textDecoration: "line-through" }}>✅ {t.text}</div>
              </div>
            ))}
            {roleTasks.length === 0 && (
              <div style={{ padding: 16, textAlign: "center", color: C.inkMuted, fontSize: 11 }}>目前無任務</div>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

// ══════════════════════════════════════════════
// Main Dashboard
// ══════════════════════════════════════════════

const TABS = [
  { id: "pipeline", label: "業務漏斗", icon: "📊" },
  { id: "tasks", label: "城堡任務", icon: "🏰" },
];

export default function CastleDashboard() {
  const [tab, setTab] = useState("pipeline");
  const [deals] = useState(DEMO_DEALS);
  const [tasks] = useState(DEMO_TASKS);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const now = new Date().toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "long" });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: "'Noto Sans TC',-apple-system,sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 22 }}>🏰</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: ".02em" }}>移動城堡指揮部</div>
            <div style={{ fontSize: 11, color: C.inkMuted }}>Beyond Spec 業務管理系統</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 12, color: C.inkMuted }}>{now}</span>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👑</div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 32px" }}>
        {/* Stats */}
        <StatsRow deals={deals} />

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: C.surface, borderRadius: 10, padding: 4, width: "fit-content" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); setSelectedDeal(null); }}
              style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all .2s", fontFamily: "inherit",
                background: tab === t.id ? C.card : "transparent",
                color: tab === t.id ? C.ink : C.inkMuted,
                boxShadow: tab === t.id ? "0 2px 8px rgba(0,0,0,.2)" : "none",
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "pipeline" && (
          <>
            <DealDetail deal={selectedDeal} tasks={tasks} onClose={() => setSelectedDeal(null)} />
            <PipelineBoard deals={deals} onSelect={setSelectedDeal} selected={selectedDeal} />
          </>
        )}
        {tab === "tasks" && <TasksByRole tasks={tasks} />}
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "20px 32px", textAlign: "center" }}>
        <span style={{ fontSize: 11, color: C.inkMuted }}>🏰 移動城堡指揮部 v1.0 — 規格外工作室 Beyond Spec</span>
      </div>
    </div>
  );
}
