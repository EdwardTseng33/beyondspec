import { useState } from "react";

// ═══ DESIGN SYSTEM ═══
const C = {
  bg: "#08080c", card: "#111118", elevated: "#1a1a24",
  glass: "rgba(255,255,255,0.035)", border: "rgba(255,255,255,0.07)",
  gold: "#e8c44a", blue: "#4a9ee8", green: "#4ae8a0",
  rose: "#e84a6a", violet: "#a06ef0", cyan: "#40d8e8", orange: "#e8944a",
  text: "#e8e8f0", sub: "#8888a0", muted: "#55556a",
};
const fonts = `'Noto Serif TC', Georgia, serif`;
const sans = `'Noto Sans TC', -apple-system, sans-serif`;
const mono = `'JetBrains Mono', 'SF Mono', monospace`;

const SECTIONS = [
  { id: "exec", label: "執行摘要", icon: "📋" },
  { id: "brand", label: "品牌定位", icon: "🧙" },
  { id: "market", label: "台灣市場", icon: "🌸" },
  { id: "service", label: "服務架構", icon: "⚡" },
  { id: "delivery", label: "交付系統", icon: "🔄" },
  { id: "cowork", label: "AI Cowork", icon: "🔥" },
  { id: "pricing", label: "定價策略", icon: "💰" },
  { id: "tools", label: "工具與成本", icon: "🔧" },
  { id: "sop", label: "接案 SOP", icon: "🌿" },
  { id: "risk", label: "風險管理", icon: "🥕" },
  { id: "finance", label: "財務預測", icon: "📊" },
  { id: "roadmap", label: "執行路線", icon: "🗺️" },
  { id: "prd", label: "PRD 模板", icon: "📝" },
  { id: "prompts", label: "Prompt 庫", icon: "🤖" },
];

// ═══ SHARED COMPONENTS ═══
function Badge({ children, color = C.gold }) {
  return <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, fontFamily:sans, background:color+"18", color, border:`1px solid ${color}30` }}>{children}</span>;
}
function RoleBadge({ emoji, name, color }) {
  return <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:700, fontFamily:sans, background:color+"15", color, border:`1px solid ${color}25` }}>{emoji} {name}</span>;
}
function Card({ children, style, accent, glow }) {
  return (
    <div style={{ background:C.card, borderRadius:16, padding:28, border:`1px solid ${accent ? accent+"25" : C.border}`, boxShadow: glow ? `0 0 40px ${glow}` : "0 2px 20px rgba(0,0,0,0.3)", position:"relative", overflow:"hidden", ...style }}>
      {accent && <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:accent }} />}
      {children}
    </div>
  );
}
function SectionTitle({ icon, title, sub, role }) {
  return (
    <div style={{ marginBottom:32 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
        <span style={{ fontSize:28 }}>{icon}</span>
        <h2 style={{ fontSize:24, fontWeight:800, color:C.text, fontFamily:fonts, margin:0 }}>{title}</h2>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
        <p style={{ fontSize:13, color:C.sub, fontFamily:sans, margin:0 }}>{sub}</p>
        {role}
      </div>
    </div>
  );
}
function KPI({ label, value, unit, color=C.gold }) {
  return (
    <div style={{ textAlign:"center", padding:"12px 8px" }}>
      <div style={{ fontSize:28, fontWeight:800, fontFamily:mono, color }}>{value}<span style={{ fontSize:13, color:C.sub, fontWeight:400 }}>{unit}</span></div>
      <div style={{ fontSize:10, color:C.muted, fontFamily:sans, marginTop:4, letterSpacing:"0.05em", textTransform:"uppercase" }}>{label}</div>
    </div>
  );
}
function TR({ cells, header }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:cells.map(c=>c.w||"1fr").join(" "), gap:1, background:header?C.elevated:"transparent", borderBottom:`1px solid ${C.border}` }}>
      {cells.map((c,i)=><div key={i} style={{ padding:"10px 14px", fontSize:header?11:12, fontWeight:header?700:400, color:header?C.muted:(c.color||C.sub), fontFamily:c.mono?mono:sans, letterSpacing:header?"0.08em":0, textTransform:header?"uppercase":"none" }}>{c.text}</div>)}
    </div>
  );
}
function Divider({ label, color=C.muted }) {
  return <div style={{ display:"flex", alignItems:"center", gap:12, margin:"28px 0 20px" }}><div style={{ flex:1, height:1, background:C.border }}/>{label && <span style={{ fontSize:11, color, fontFamily:sans, letterSpacing:"0.1em", fontWeight:600 }}>{label}</span>}<div style={{ flex:1, height:1, background:C.border }}/></div>;
}

// ═══ § 1 EXEC SUMMARY ═══
function Sec_Exec() {
  return <div>
    <SectionTitle icon="📋" title="執行摘要" sub="一頁看完整份計畫的核心邏輯" />
    <Card accent={C.gold} glow={C.gold+"15"} style={{ marginBottom:24 }}>
      <div style={{ fontFamily:fonts, fontSize:18, fontWeight:700, color:C.gold, marginBottom:16, fontStyle:"italic", lineHeight:1.6 }}>「規格外工作室 Beyond Spec」是一間一人高端產品顧問公司，專為台灣新創與數位轉型企業提供「外部產品大腦」服務。</div>
      <div style={{ padding:"16px 20px", borderRadius:12, background:C.rose+"0a", border:`1px solid ${C.rose}15`, marginBottom:16 }}>
        <div style={{ fontSize:16, fontWeight:800, color:C.text, fontFamily:fonts, textAlign:"center" }}>「軟體開發最貴的不是工程師，是做錯東西。」</div>
      </div>
      <div style={{ fontSize:13, color:C.sub, fontFamily:sans, lineHeight:1.9 }}>核心能力：結合 13 年產品設計、軟體開發管理、商業策略經驗，搭配 AI Cowork 工作流（Claude、Cursor、Figma AI），實現一人產出等同 3-5 人小型產品團隊的交付品質與速度。聚焦台灣市場的 0→1 產品定義與開發管理，「不賣時數，賣結果」。</div>
    </Card>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
      {[{l:"年營收目標",v:"360",u:"萬+",c:C.gold},{l:"同時服務客戶",v:"3-4",u:"家",c:C.blue},{l:"AI效率倍增",v:"3-5",u:"x",c:C.green},{l:"毛利率目標",v:"85",u:"%+",c:C.violet}].map((k,i)=><Card key={i} style={{padding:"16px 8px"}}><KPI label={k.l} value={k.v} unit={k.u} color={k.c}/></Card>)}
    </div>
    <Card style={{ marginBottom:24 }}>
      <div style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:sans, marginBottom:16 }}>商業飛輪</div>
      <div style={{ display:"flex", alignItems:"center", gap:16, justifyContent:"center", flexWrap:"wrap", padding:"8px 0" }}>
        {[{t:"獲客",s:"免費探索會議 + LinkedIn 內容",c:C.blue},{t:"轉換",s:"健檢 NT$3萬 → 衝刺包 NT$25萬 → CPO NT$12萬/月",c:C.gold},{t:"交付",s:"AI Cowork 高效產出",c:C.green},{t:"口碑",s:"推薦轉介 40%+",c:C.violet}].map((s,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ textAlign:"center", minWidth:140 }}>
              <div style={{ fontSize:11, fontWeight:700, color:s.c, fontFamily:sans, marginBottom:4 }}>{s.t}</div>
              <div style={{ fontSize:11, color:C.sub, fontFamily:sans, lineHeight:1.6 }}>{s.s}</div>
            </div>
            {i<3 && <span style={{ color:C.muted, fontSize:18 }}>→</span>}
          </div>
        ))}
      </div>
    </Card>
    <Card style={{ marginBottom:24 }}>
      <div style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:sans, marginBottom:12 }}>🏰 SSOT 文件架構</div>
      <div style={{ fontSize:12, color:C.sub, fontFamily:sans, lineHeight:1.8 }}>本商業計畫書為規格外工作室 SSOT（Single Source of Truth）的互動式版本。所有數字、定義、流程以本文件為準。涵蓋：品牌定位、市場分析、三層服務架構、四階段交付系統、AI Cowork 工作流、定價策略、營運工具、接案 SOP、風險管理、財務預測、90 天路線圖、PRD 模板與 Claude Prompt Template。</div>
    </Card>
    <div style={{ padding:"14px 20px", borderRadius:12, background:C.rose+"0c", border:`1px solid ${C.rose}20`, fontSize:12, color:C.sub, fontFamily:sans, lineHeight:1.7 }}>
      <span style={{ color:C.rose, fontWeight:700 }}>⚠ 核心前提：</span> 此計畫建立在愛德華持續高效運用 AI 工具交付高品質成果的基礎上。AI 工具穩定性、費率變動是最大風險變數。
    </div>
  </div>;
}

// ═══ § 2 BRAND ═══
function Sec_Brand() {
  return <div>
    <SectionTitle icon="🧙" title="品牌定位與差異化" sub="為什麼叫「規格外」？因為我不只照規格做事。" role={<RoleBadge emoji="🧙" name="霍爾 CPO" color={C.gold}/>} />
    <Card accent={C.gold} style={{ marginBottom:24 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32 }}>
        <div>
          <div style={{ fontSize:11, color:C.muted, fontFamily:sans, letterSpacing:"0.1em", marginBottom:12 }}>品牌核心</div>
          <div style={{ fontSize:22, fontWeight:800, color:C.text, fontFamily:fonts, marginBottom:4 }}>規格外工作室</div>
          <div style={{ fontSize:15, color:C.muted, fontFamily:mono, letterSpacing:"0.12em", marginBottom:16 }}>BEYOND SPEC</div>
          <div style={{ fontSize:13, color:C.sub, fontFamily:sans, lineHeight:1.8 }}>
            品牌承諾：「我不只照著你的規格做，我幫你找出規格之外的商業價值。」<br/><br/>
            Slogan：「別讓百萬預算變成試錯實驗」/「動工前，先做對」<br/><br/>
            調性：專業自信、有品味但不高冷、說人話不說術語。
          </div>
        </div>
        <div>
          <div style={{ fontSize:11, color:C.muted, fontFamily:sans, letterSpacing:"0.1em", marginBottom:12 }}>我不是誰</div>
          <div style={{ fontSize:13, color:C.sub, fontFamily:sans, lineHeight:2 }}>
            <span style={{color:C.rose}}>✕</span> 不是外包公司 — 不寫 code、不接純執行<br/>
            <span style={{color:C.rose}}>✕</span> 不是設計公司 — 不只畫圖，做的是產品決策<br/>
            <span style={{color:C.rose}}>✕</span> 不是管顧 — 不出報告了事，交付可執行物<br/><br/>
            <span style={{color:C.gold}}>✦</span> <span style={{color:C.text,fontWeight:600}}>定位：你的「外部產品合夥人」</span>
          </div>
        </div>
      </div>
    </Card>
    <Card style={{ marginBottom:24 }}>
      <div style={{ fontSize:12, fontWeight:700, color:C.rose, fontFamily:sans, marginBottom:16 }}>🎯 三大客戶痛點（對外訊息核心）</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        {[{q:"「花了兩百萬，做出來不是我要的」",s:"需求不清就動工，結果全部重來",c:C.rose},{q:"「功能都做了，為什麼沒人用」",s:"沒驗證需求就開發，做完沒人要",c:C.orange},{q:"「AI 工具買了一堆，效率反而更低」",s:"工具散落，缺系統化工作流",c:C.blue}].map((p,i)=>(
          <div key={i} style={{ padding:16, borderRadius:12, background:p.c+"08", border:`1px solid ${p.c}15` }}>
            <div style={{ fontSize:13, fontWeight:700, color:p.c, fontFamily:sans, marginBottom:8, lineHeight:1.5 }}>{p.q}</div>
            <div style={{ fontSize:11, color:C.muted, fontFamily:sans }}>{p.s}</div>
          </div>
        ))}
      </div>
    </Card>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
      {[{vs:"vs. 台灣外包公司",pain:"只寫 code 不管商業",us:"從商業出發再定義產品",c:C.rose},{vs:"vs. 設計師/Freelancer",pain:"只畫介面不懂工程",us:"設計同時考慮技術+商業",c:C.blue},{vs:"vs. 大型管顧",pain:"高收費交PPT不落地",us:"交可點擊 Prototype + PRD",c:C.violet}].map((d,i)=>(
        <Card key={i} accent={d.c}>
          <div style={{ fontSize:12, fontWeight:700, color:d.c, fontFamily:sans, marginBottom:10 }}>{d.vs}</div>
          <div style={{ fontSize:12, color:C.muted, fontFamily:sans, marginBottom:8 }}>痛點：{d.pain}</div>
          <div style={{ fontSize:12, color:C.text, fontWeight:600, padding:"8px 12px", borderRadius:8, background:d.c+"10" }}>✦ {d.us}</div>
        </Card>
      ))}
    </div>
    <Card style={{ marginBottom:24 }}>
      <div style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:sans, marginBottom:16 }}>🎯 目標客群</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {[{name:"新創創辦人",desc:"有 idea 沒產品經驗，怕花錢做錯東西",need:"0→1 Prototype 拿去對投資人",tier:"衝刺包 NT$25萬",c:C.gold},{name:"傳統企業數位長",desc:"硬體/製造業想做 SaaS，缺軟體思維",need:"產品策略 + 帶團隊敏捷 + AI 導入",tier:"CPO NT$12萬/月",c:C.blue}].map((p,i)=>(
          <div key={i} style={{ padding:16, borderRadius:12, background:C.glass, border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:14, fontWeight:700, color:p.c, fontFamily:sans, marginBottom:6 }}>{p.name}</div>
            <div style={{ fontSize:12, color:C.muted, fontFamily:sans, marginBottom:6 }}>{p.desc}</div>
            <div style={{ fontSize:12, color:C.sub, fontFamily:sans, marginBottom:8 }}>需求：{p.need}</div>
            <Badge color={p.c}>{p.tier}</Badge>
          </div>
        ))}
      </div>
    </Card>
    <Card accent={C.cyan}>
      <div style={{ fontSize:12, fontWeight:700, color:C.cyan, fontFamily:sans, marginBottom:8 }}>🤖 AI 對外定位策略</div>
      <div style={{ fontSize:12, color:C.sub, fontFamily:sans, lineHeight:1.8 }}>
        AI 為內部工作方法與效率工具，對外不作為核心行銷訊息。對外核心訊息聚焦「13 年經驗 + 高效交付」。<br/><br/>
        原因：尚無大量實務導入案例 ｜ AI 導入需個案評估 ｜ 多數公司已有 AI 工具但未系統化<br/><br/>
        <span style={{color:C.gold}}>✦ 未來方向：</span>累積案例後，可將「AI 工作流系統化導入」作為 CPO 加值服務亮點。
      </div>
    </Card>
  </div>;
}

// ═══ § 3 MARKET ═══
function Sec_Market() {
  return <div>
    <SectionTitle icon="🌸" title="台灣市場分析" sub="先確認用戶是誰，再談怎麼說服他們。" role={<RoleBadge emoji="🌸" name="蘇菲 CMO" color={C.rose}/>} />
    <Card accent={C.blue} style={{ marginBottom:24 }}>
      <div style={{ fontSize:13, fontWeight:700, color:C.text, fontFamily:sans, marginBottom:16 }}>台灣產品顧問市場概況</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:20 }}>
        {[{t:"TAM",s:"台灣 5,000+ 活躍新創，30-40% 在 0→1 階段（約 1,500-2,000 家）。傳統企業數位轉型需求約 20 萬家，有軟體產品化意圖者 3-5%。",c:C.blue},{t:"SAM",s:"「有預算 NT$20-50 萬做產品規劃、且認同需要外部產品顧問」，每年約 200-400 個潛在案件機會。Fractional CPO 在台灣仍屬早期。",c:C.gold},{t:"SOM（Y1 目標）",s:"第一年：服務 8-12 個客戶，年營收 NT$200-360 萬。主要透過口碑 + LinkedIn 內容行銷獲客，轉介率目標 40%。",c:C.green}].map((m,i)=>(
          <div key={i}><div style={{ fontSize:11, color:C.muted, fontFamily:sans, letterSpacing:"0.08em", marginBottom:8 }}>{m.t}</div><div style={{ fontSize:12, color:C.sub, fontFamily:sans, lineHeight:1.8 }}>{m.s}</div></div>
        ))}
      </div>
    </Card>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
      <Card accent={C.green}>
        <div style={{ fontSize:12, fontWeight:700, color:C.green, fontFamily:sans, marginBottom:12 }}>✦ 市場機會</div>
        <div style={{ fontSize:12, color:C.sub, fontFamily:sans, lineHeight:1.9 }}>
          • AI 工具成熟，一人公司產出力大幅提升<br/>• 台灣對 Fractional C-Suite 接受度逐年上升<br/>• 外包「做出來不能用」的痛點持續存在<br/>• 硬體大廠轉型軟體/SaaS 是結構性趨勢<br/>• SBIR/SIIR 政府補助提供轉型預算支撐
        </div>
      </Card>
      <Card accent={C.rose}>
        <div style={{ fontSize:12, fontWeight:700, color:C.rose, fontFamily:sans, marginBottom:12 }}>⚠ 市場挑戰</div>
        <div style={{ fontSize:12, color:C.sub, fontFamily:sans, lineHeight:1.9 }}>
          • 台灣「比價文化」強，顧問常被壓價<br/>• Fractional CPO 概念需要市場教育成本<br/>• 新創預算有限，NT$25 萬對種子期是大支出<br/>• 客戶可能期待「顧問＝什麼都做」<br/>• 一人公司的信任度門檻（穩定性疑慮）
        </div>
      </Card>
    </div>
    <Card>
      <div style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:sans, marginBottom:12 }}>台灣競爭格局</div>
      <div style={{ borderRadius:8, overflow:"hidden", border:`1px solid ${C.border}` }}>
        <TR header cells={[{text:"競爭類型",w:"130px"},{text:"代表性業者"},{text:"價格帶"},{text:"規格外的差異"}]} />
        {[["外包公司","眾多中小軟體公司","NT$50-300萬/案","他們做執行，我做定義與把關"],["設計工作室","IF Office、Bito 等","NT$30-150萬/案","我多了商業+工程+AI 維度"],["管理顧問","資策會、工研院","NT$50-200萬","我交付可執行物，不只報告"],["Freelance PM","個人 PM/UX","NT$800-2,000/hr","我賣結果不賣時數"]].map((r,i)=><TR key={i} cells={r.map((t,j)=>({text:t,w:j===0?"130px":undefined,color:j===3?C.gold:C.sub}))} />)}
      </div>
    </Card>
  </div>;
}

// ═══ § 4 SERVICE ARCHITECTURE ═══
function Sec_Service() {
  return <div>
    <SectionTitle icon="⚡" title="產品化服務架構" sub="同一條交付引擎，三種深度的信任階梯。" role={<RoleBadge emoji="🧙" name="霍爾 CPO" color={C.gold}/>} />
    <Card accent={C.gold} glow={C.gold+"10"} style={{ marginBottom:24 }}>
      <div style={{ fontSize:13, fontWeight:700, color:C.text, fontFamily:sans, marginBottom:16 }}>交付引擎 × 服務深度矩陣</div>
      <div style={{ borderRadius:8, overflow:"hidden", border:`1px solid ${C.border}` }}>
        <TR header cells={[{text:"",w:"140px"},{text:"市場策略"},{text:"產品策略"},{text:"產品原型"},{text:"PRD"}]} />
        {[
          ["Tier 1 健檢","✅ 輕量版","✅ 方向級","❌","❌"],
          ["Tier 2 衝刺包","✅ 完整版","✅ 完整版","✅ 完整版","✅ 完整版"],
          ["Tier 3 CPO","✅ 持續迭代","✅ 持續迭代","✅ 持續迭代","✅ 持續迭代"],
        ].map((r,i)=><TR key={i} cells={r.map((t,j)=>({text:t,w:j===0?"140px":undefined,color:j===0?[C.blue,C.gold,C.violet][i]:t.includes("✅")?C.green:t.includes("❌")?C.rose:C.sub}))} />)}
      </div>
      <div style={{ fontSize:11, color:C.muted, fontFamily:sans, marginTop:12, textAlign:"center" }}>Tier 1 的產出物直接成為 Tier 2 的起跑線，形成自然升級路徑</div>
    </Card>

    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, marginBottom:24 }}>
      {[
        {tier:"TIER 1",name:"產品健檢",nameEn:"Product Health Check",price:"NT$30,000",period:"單次",color:C.blue,pop:false,
         desc:"90 分鐘深度診斷，低門檻入場。",
         items:["90 分鐘深度產品診斷","市場概況摘要（3-5 家競品比對）","1-2 個輕量版 Persona","商業模式可行性評估","產品方向建議（做/不做/怎麼調）","30 天行動計畫","概念級 IA 草圖（選配）"],
         del:"健檢報告與 30 天行動計畫",time:"診斷 90min + 報告 1 週"},
        {tier:"TIER 2",name:"0→1 產品衝刺包",nameEn:"Product Sprint",price:"NT$250,000",period:"專案一口價",color:C.gold,pop:true,
         desc:"3 週將點子化為可驗證、可募資的具體規格。",
         items:["市場策略報告（8-10 家深度競品矩陣）","產品策略書（定位、商業模式、GTM）","2-3 個完整 Persona + Journey Map","Figma 高擬真可互動原型","完整 PRD（Markdown，可轉 PDF）","工程對接文件（技術棧+估時+預算）","2 次修改迭代機會"],
         del:"五大交付物：市場報告 + 策略書 + 原型 + PRD + 工程文件",time:"3 週"},
        {tier:"TIER 3",name:"Fractional CPO",nameEn:"外掛產品長",price:"NT$120,000",period:"/月",color:C.violet,pop:false,
         desc:"你的外部產品合夥人，深度參與決策。",
         items:["每月 4 次策略會議","隨時 Slack/LINE async 諮詢","帶團隊跑敏捷","AI 工作流系統化導入（評估+建議）","產品遊戲化與留存設計","月度產品報告","四階段工作流持續循環迭代"],
         del:"持續性產品管理 + 月度報告",time:"最低 3 個月，按月計費"},
      ].map((s,i)=>(
        <Card key={i} accent={s.color} glow={s.pop?s.color+"15":undefined}>
          {s.pop && <div style={{position:"absolute",top:12,right:12}}><Badge color={s.color}>主力服務</Badge></div>}
          <div style={{ fontSize:10, fontWeight:700, color:s.color, fontFamily:mono, letterSpacing:"0.15em", marginBottom:8 }}>{s.tier}</div>
          <div style={{ fontSize:15, fontWeight:800, color:C.text, fontFamily:sans, marginBottom:2 }}>{s.name}</div>
          <div style={{ fontSize:11, color:C.muted, fontFamily:mono, marginBottom:12 }}>{s.nameEn}</div>
          <div style={{ fontSize:12, color:C.muted, fontFamily:sans, marginBottom:16 }}>{s.desc}</div>
          <div style={{ fontSize:22, fontWeight:800, fontFamily:mono, color:s.color, marginBottom:4 }}>{s.price}<span style={{fontSize:12,fontWeight:400,color:C.muted}}> {s.period}</span></div>
          <div style={{ height:1, background:C.border, margin:"16px 0" }} />
          {s.items.map((item,j)=><div key={j} style={{display:"flex",gap:8,fontSize:12,color:C.sub,fontFamily:sans,padding:"3px 0"}}><span style={{color:s.color}}>✓</span>{item}</div>)}
          <div style={{ height:1, background:C.border, margin:"16px 0" }} />
          <div style={{ fontSize:11, color:C.muted, fontFamily:sans }}><span style={{fontWeight:600,color:C.sub}}>交付物：</span>{s.del}</div>
          <div style={{ fontSize:11, color:C.muted, fontFamily:sans, marginTop:4 }}><span style={{fontWeight:600,color:C.sub}}>時程：</span>{s.time}</div>
        </Card>
      ))}
    </div>

    <Card>
      <div style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:sans, marginBottom:12 }}>🔄 信任階梯轉換邏輯</div>
      <div style={{ display:"flex", alignItems:"center", gap:16, justifyContent:"center", padding:"12px 0" }}>
        {[{t:"免費探索會議",s:"30min",c:C.green},{t:"健檢 NT$3萬",s:"信任入門",c:C.blue},{t:"衝刺包 NT$25萬",s:"核心轉換",c:C.gold},{t:"CPO NT$12萬/月",s:"長期關係",c:C.violet}].map((step,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{textAlign:"center"}}><div style={{fontSize:12,fontWeight:700,color:step.c,fontFamily:sans}}>{step.t}</div><div style={{fontSize:10,color:C.muted}}>{step.s}</div></div>
            {i<3&&<span style={{color:C.muted,fontSize:18}}>→</span>}
          </div>
        ))}
      </div>
      <div style={{fontSize:12,color:C.sub,fontFamily:sans,textAlign:"center",marginTop:8}}>目標轉換率：探索→付費 30-40% ｜ 健檢→衝刺包 50% ｜ 衝刺包→CPO 20-30%</div>
    </Card>
  </div>;
}

// ═══ § 5 DELIVERY SYSTEM (NEW) ═══
function Sec_Delivery() {
  const stages = [
    {phase:"階段一：市場策略",icon:"📊",color:C.blue,goal:"搞清楚「做這東西有沒有人要」",
     collect:["客戶商業背景（產業、規模、營收模式）","想做什麼？為什麼現在想做？（觸發點）","他認為的目標用戶（先記錄，後驗證）","他認為的競品","預算範圍與時間壓力","過去是否嘗試過？失敗原因？"],
     output:["目標市場規模估算（TAM/SAM/SOM）","競品分析矩陣","目標用戶初版 Persona","市場機會 vs 風險摘要"],
     tiers:[
       {t:"Tier 1 健檢",items:["桌面研究 + 1 次訪談","3-5 家快速競品比對","1-2 個輕量版 Persona","→ 市場概況摘要（報告一部分）"]},
       {t:"Tier 2 衝刺包",items:["桌面研究 + 深度訪談 + 用戶訪談","8-10 家深度競品矩陣","2-3 個完整 Persona + Journey Map","→ 獨立《市場策略報告》"]},
       {t:"Tier 3 CPO",items:["持續性市場監測","競品持續更新","數據驅動 Persona 修正","→ 月度市場洞察更新"]},
     ],
     edward:["主持客戶訪談（問關鍵問題、判斷真需求）","提供產業 know-how 和人脈情報","最終判斷市場方向"],
     claude:["訪談前：準備訪談大綱","訪談後：整理重點、萃取 Insight","競品研究：整理比較矩陣","Persona 草稿建構","市場報告初稿"]},
    {phase:"階段二：產品策略",icon:"🎯",color:C.gold,goal:"決定「要做什麼、不做什麼、先做什麼」",
     collect:["產品定位與核心價值主張","MVP 功能範圍（做什麼 vs 不做什麼）","商業模式（怎麼賺錢）","GTM 策略方向（先打哪個市場）","成功指標 KPI 定義"],
     output:["產品定位聲明","MVP 功能清單（P0/P1/P2）","商業模式 Canvas","User Story 拆解","GTM 策略方向"],
     tiers:[
       {t:"Tier 1 健檢",items:["方向建議（做/不做/怎麼調）","概念級 MVP 建議","商業模式可行性評估","→ 30 天行動計畫"]},
       {t:"Tier 2 衝刺包",items:["完整產品策略書","功能級 MVP 拆解（含優先級）","完整商業模式設計 + 財務模型","→ 獨立《產品策略書》"]},
       {t:"Tier 3 CPO",items:["持續策略迭代","Sprint 級功能規劃","持續驗證優化商業模式","→ 月度策略 Review"]},
     ],
     edward:["拍板產品定位和 MVP 範圍","以 13 年經驗判斷偽需求","與客戶對焦確認方向"],
     claude:["市場結論轉化為 2-3 個定位選項","MVP 功能拆解 + Impact vs Effort 矩陣","商業模式 Canvas 草稿","User Story 拆解","產品策略書完整初稿"]},
    {phase:"階段三：產品原型",icon:"🎨",color:C.green,goal:"讓策略變成「看得見、點得動」的東西",
     collect:["客戶品牌視覺偏好（既有 CI？）","參考產品/設計風格","核心使用流程優先級"],
     output:["資訊架構（IA）","User Flow","頁面元素與文案規格","互動邏輯說明","Figma 高擬真原型"],
     tiers:[
       {t:"Tier 1 健檢",items:["❌ 不含此階段","（可在報告附概念級 IA 草圖）","作為衝刺包升級鉤子",""]},
       {t:"Tier 2 衝刺包",items:["核心流程 5-15 頁 Figma 原型","可點擊跳轉、展示核心 Flow","Figma 原型連結 + 設計說明","→ 可互動 Prototype"]},
       {t:"Tier 3 CPO",items:["依 Sprint 逐步擴展","包含動效規格","持續交付迭代","→ 持續迭代原型"]},
     ],
     edward:["審美把關（核心不可取代能力）","互動邏輯決策","Figma 設計執行","客戶 Review 簡報"],
     claude:["IA 草稿（Markdown 頁面結構）","User Flow 文字描述","頁面內容規格（每頁元素+文案）","互動邏輯說明","如需：Cursor 快速產出 HTML/React 原型"]},
    {phase:"階段四：PRD 產品需求文件",icon:"📝",color:C.violet,goal:"工程師看了就能開工的完整規格書",
     collect:["前三階段所有成果彙整","技術可行性評估"],
     output:["完整 PRD（Markdown 主體）","User Story + 驗收條件","技術棧建議","開發估時與預算","工程對接文件"],
     tiers:[
       {t:"Tier 1 健檢",items:["❌ 不含此階段","行動計畫有方向建議","",""]},
       {t:"Tier 2 衝刺包",items:["完整 PRD（MVP 全功能）","建議級技術規格","模組級估時 + 預算範圍","→ PRD.md + 工程對接文件"]},
       {t:"Tier 3 CPO",items:["持續迭代活文件","開發級技術規格","Sprint 級精確估時","→ 活文件持續更新"]},
     ],
     edward:["審核 PRD 完整性和邏輯","補充技術判斷（基於專案經驗）","與客戶走讀確認"],
     claude:["彙整前三階段，生成 PRD 初稿","User Story → 驗收條件（Given-When-Then）","技術棧建議與估時框架","PRD 完整性 Checklist 自我審查","輸出 Markdown 版本"]},
  ];

  return <div>
    <SectionTitle icon="🔄" title="四階段服務交付系統" sub="同一條流水線，三種服務只是走到不同深度。" role={<><RoleBadge emoji="🧙" name="霍爾" color={C.gold}/>{" "}<RoleBadge emoji="🥕" name="蕪菁頭" color={C.cyan}/></>} />
    <Card accent={C.gold} glow={C.gold+"10"} style={{ marginBottom:24 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"8px 0", flexWrap:"wrap" }}>
        {stages.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{ padding:"10px 16px", borderRadius:12, background:s.color+"12", border:`1px solid ${s.color}25`, textAlign:"center" }}>
              <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
              <div style={{ fontSize:11, fontWeight:700, color:s.color, fontFamily:sans }}>{s.phase.split("：")[1]}</div>
            </div>
            {i<3 && <span style={{color:C.muted,fontSize:18}}>→</span>}
          </div>
        ))}
      </div>
    </Card>

    {stages.map((s,si)=>(
      <Card key={si} accent={s.color} style={{ marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <span style={{ fontSize:24 }}>{s.icon}</span>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:s.color, fontFamily:sans }}>{s.phase}</div>
            <div style={{ fontSize:12, color:C.muted, fontFamily:sans }}>{s.goal}</div>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
          <div style={{ padding:14, borderRadius:12, background:C.glass, border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.orange, fontFamily:sans, marginBottom:8 }}>📥 需收集的資訊</div>
            {s.collect.map((c,ci)=><div key={ci} style={{fontSize:12,color:C.sub,fontFamily:sans,padding:"2px 0",display:"flex",gap:6}}><span style={{color:C.orange}}>•</span>{c}</div>)}
          </div>
          <div style={{ padding:14, borderRadius:12, background:C.glass, border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.green, fontFamily:sans, marginBottom:8 }}>📤 分析與產出</div>
            {s.output.map((o,oi)=><div key={oi} style={{fontSize:12,color:C.sub,fontFamily:sans,padding:"2px 0",display:"flex",gap:6}}><span style={{color:C.green}}>•</span>{o}</div>)}
          </div>
        </div>

        <div style={{ fontSize:11, fontWeight:700, color:C.muted, fontFamily:sans, marginBottom:8, letterSpacing:"0.08em" }}>各層產出差異</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
          {s.tiers.map((tier,ti)=>{
            const tc = [C.blue,C.gold,C.violet][ti];
            return <div key={ti} style={{ padding:12, borderRadius:10, background:tc+"08", border:`1px solid ${tc}15` }}>
              <div style={{ fontSize:11, fontWeight:700, color:tc, fontFamily:sans, marginBottom:6 }}>{tier.t}</div>
              {tier.items.filter(x=>x).map((item,ii)=><div key={ii} style={{fontSize:11,color:item.startsWith("❌")?C.rose:item.startsWith("→")?tc:C.sub,fontFamily:sans,padding:"2px 0",fontWeight:item.startsWith("→")?600:400}}>{item}</div>)}
            </div>;
          })}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div style={{ padding:14, borderRadius:12, background:C.gold+"08", border:`1px solid ${C.gold}15` }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.gold, fontFamily:sans, marginBottom:8 }}>👤 Edward 做</div>
            {s.edward.map((e,ei)=><div key={ei} style={{fontSize:12,color:C.sub,fontFamily:sans,padding:"2px 0",display:"flex",gap:6}}><span style={{color:C.gold}}>✦</span>{e}</div>)}
          </div>
          <div style={{ padding:14, borderRadius:12, background:C.cyan+"08", border:`1px solid ${C.cyan}15` }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.cyan, fontFamily:sans, marginBottom:8 }}>🤖 Claude 做</div>
            {s.claude.map((c,ci)=><div key={ci} style={{fontSize:12,color:C.sub,fontFamily:sans,padding:"2px 0",display:"flex",gap:6}}><span style={{color:C.cyan}}>→</span>{c}</div>)}
          </div>
        </div>
      </Card>
    ))}
  </div>;
}

// ═══ § 6 AI COWORK ═══
function Sec_Cowork() {
  return <div>
    <SectionTitle icon="🔥" title="Claude Cowork 工作流" sub="告訴我你要什麼，不要告訴我怎麼做。交給我。" role={<RoleBadge emoji="🔥" name="卡西法 CTO" color={C.orange}/>} />
    <Card accent={C.gold} glow={C.gold+"12"} style={{ marginBottom:24 }}>
      <div style={{fontSize:14,fontWeight:700,color:C.gold,fontFamily:sans,marginBottom:12}}>核心理念：Human-in-the-Loop AI Cowork</div>
      <div style={{fontSize:13,color:C.sub,fontFamily:sans,lineHeight:1.9}}>愛德華負責思考與決策，AI 負責執行與產出。每個環節都有人類品質把關。客戶買的是十三年經驗判斷力，AI 是把判斷力放大三倍的工具。</div>
    </Card>

    <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:sans,marginBottom:16}}>衝刺包 AI Cowork Loop（3 週）</div>
    {[
      {phase:"Phase 1：需求探索",days:"Day 1-3",human:"主持訪談、提問追問、判斷真需求",ai:"整理逐字稿、萃取 Insight、訪談報告初稿",tools:"Claude + Otter.ai",c:C.blue},
      {phase:"Phase 2：策略定義",days:"Day 4-7",human:"決定產品定位、選 MVP 範圍",ai:"競品分析、策略書初稿、User Story 拆解",tools:"Claude + Notion",c:C.gold},
      {phase:"Phase 3：設計產出",days:"Day 8-18",human:"審美把關、互動邏輯、客戶 Review",ai:"Figma AI Layout + Cursor 原型 + Claude PRD 細節",tools:"Figma + Cursor + Claude",c:C.green},
      {phase:"Phase 4：文件交付",days:"Day 19-21",human:"品質審核、客戶簡報、交付",ai:"精修 PRD + 估時建議 + 交付簡報",tools:"Claude + Google Slides",c:C.violet},
    ].map((p,i)=>(
      <Card key={i} accent={p.c} style={{ marginBottom:12 }}>
        <div style={{display:"grid",gridTemplateColumns:"160px 1fr 1fr 180px",gap:16}}>
          <div><div style={{fontSize:13,fontWeight:700,color:p.c,fontFamily:sans}}>{p.phase}</div><div style={{fontSize:11,color:C.muted,fontFamily:mono,marginTop:4}}>{p.days}</div></div>
          <div><div style={{fontSize:10,color:C.muted,fontFamily:sans,marginBottom:4}}>👤 愛德華</div><div style={{fontSize:12,color:C.sub,fontFamily:sans,lineHeight:1.7}}>{p.human}</div></div>
          <div><div style={{fontSize:10,color:C.muted,fontFamily:sans,marginBottom:4}}>🤖 AI Cowork</div><div style={{fontSize:12,color:C.sub,fontFamily:sans,lineHeight:1.7}}>{p.ai}</div></div>
          <div><div style={{fontSize:10,color:C.muted,fontFamily:sans,marginBottom:4}}>🔧 工具</div><div style={{fontSize:12,color:C.sub,fontFamily:sans}}>{p.tools}</div></div>
        </div>
      </Card>
    ))}

    <Divider label="AI 使用紅線" />
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
      <Card accent={C.green}>
        <div style={{fontSize:12,fontWeight:700,color:C.green,fontFamily:sans,marginBottom:8}}>✓ AI 可以做</div>
        <div style={{fontSize:12,color:C.sub,fontFamily:sans,lineHeight:1.9}}>初稿撰寫（PRD、報告、文案）<br/>資料整理分析（競品、市場）<br/>原型程式碼快速產出<br/>簡報文件排版視覺化<br/>重複性格式化工作</div>
      </Card>
      <Card accent={C.rose}>
        <div style={{fontSize:12,fontWeight:700,color:C.rose,fontFamily:sans,marginBottom:8}}>✕ AI 不能取代</div>
        <div style={{fontSize:12,color:C.sub,fontFamily:sans,lineHeight:1.9}}>客戶訪談的提問判斷<br/>產品策略決策<br/>設計美感最終審核<br/>客戶關係經營與信任<br/>商業判斷與風險評估</div>
      </Card>
    </div>

    <Card>
      <div style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:sans,marginBottom:12}}>品質把關原則</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {["所有 AI 初稿必須愛德華完整審閱改寫","品質 Checklist：事實核查/邏輯/可讀性","坦誠告知客戶使用 AI 輔助（合約載明）","AI 定位為效率工具，非替代判斷"].map((t,i)=>
          <div key={i} style={{display:"flex",gap:8,fontSize:12,color:C.sub,fontFamily:sans,padding:"4px 0"}}><span style={{color:C.gold}}>☑</span>{t}</div>
        )}
      </div>
    </Card>
  </div>;
}

// ═══ § 7 PRICING ═══
function Sec_Pricing() {
  return <div>
    <SectionTitle icon="💰" title="定價策略" sub="不賣時數，只賣結果。" role={<RoleBadge emoji="🌸" name="蘇菲 CFO" color={C.rose}/>} />
    <Card accent={C.gold} style={{ marginBottom:24 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:20 }}>
        {[{t:"價值定價",s:"NT$25 萬衝刺包能幫客戶省下 NT$50-200 萬的錯誤開發成本，ROI 明確。",c:C.gold},{t:"產品化定價",s:"固定價格 + 固定交付物 + 固定時程 = 客戶安心。避免時薪制的不信任感。",c:C.blue},{t:"三階梯設計",s:"NT$3 萬「試一試」→ NT$25 萬「真的做」→ NT$12 萬/月「長期合作」",c:C.green}].map((d,i)=>(
          <div key={i}><div style={{fontSize:12,fontWeight:700,color:d.c,fontFamily:sans,marginBottom:8}}>✦ {d.t}</div><div style={{fontSize:12,color:C.sub,fontFamily:sans,lineHeight:1.8}}>{d.s}</div></div>
        ))}
      </div>
    </Card>
    <Card style={{ marginBottom:24 }}>
      <div style={{ fontSize:13, fontWeight:700, color:C.text, fontFamily:sans, marginBottom:16 }}>單位經濟（衝刺包）</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:C.gold,fontFamily:sans,marginBottom:8}}>收入端</div>
          <div style={{fontSize:12,color:C.sub,fontFamily:sans,lineHeight:2}}>收入：NT$250,000<br/>投入：60-80 工時<br/>有效時薪：NT$3,125-4,167/hr<br/>（市價 PM 顧問：NT$2,000-5,000/hr）</div>
        </div>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:C.rose,fontFamily:sans,marginBottom:8}}>成本端</div>
          <div style={{fontSize:12,color:C.sub,fontFamily:sans,lineHeight:2}}>AI 工具分攤：約 NT$3,000-5,000/案<br/>Figma 分攤：約 NT$500/案<br/>雜支：約 NT$500/案<br/>直接成本：約 NT$4,000-6,000/案<br/><span style={{color:C.green,fontWeight:600}}>毛利率：97-98%</span></div>
        </div>
      </div>
    </Card>
    <Card>
      <div style={{ fontSize:13, fontWeight:700, color:C.text, fontFamily:sans, marginBottom:16 }}>付款條件</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        {[{n:"健檢 NT$3萬",t:"簽約一次付清",note:"金額低不需分期",c:C.blue},{n:"衝刺包 NT$25萬",t:"簽約 50% + 交付 50%",note:"NT$12.5 萬 × 2 期",c:C.gold},{n:"CPO NT$12萬/月",t:"每月初預付，最低 3 月",note:"首月加 Onboarding NT$3 萬",c:C.violet}].map((p,i)=>(
          <div key={i} style={{padding:16,borderRadius:12,background:C.glass,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:13,fontWeight:700,color:p.c,fontFamily:sans,marginBottom:6}}>{p.n}</div>
            <div style={{fontSize:12,color:C.text,fontFamily:sans,marginBottom:4}}>{p.t}</div>
            <div style={{fontSize:11,color:C.muted}}>{p.note}</div>
          </div>
        ))}
      </div>
    </Card>
  </div>;
}

// ═══ § 8 TOOLS ═══
function Sec_Tools() {
  const cats = [
    {cat:"AI 生產力工具",items:[{name:"Claude Pro",cost:660,note:"主力 AI",req:true},{name:"Claude Max（視用量）",cost:6600,note:"重度使用期",req:false},{name:"ChatGPT Plus",cost:660,note:"備援 + 視覺/語音",req:true},{name:"Cursor Pro",cost:660,note:"AI 程式碼編輯器",req:true}]},
    {cat:"設計工具",items:[{name:"Figma Professional",cost:480,note:"核心設計工具",req:true},{name:"Framer / Webflow",cost:0,note:"Landing Page",req:false}]},
    {cat:"專案管理 & 溝通",items:[{name:"Google Workspace",cost:200,note:"Email/Drive/Meet",req:true},{name:"Notion",cost:0,note:"文件/知識庫",req:true},{name:"Calendly",cost:0,note:"預約排程",req:true},{name:"Slack/LINE",cost:0,note:"客戶溝通",req:false},{name:"Zoom Pro",cost:440,note:"長會議",req:false}]},
    {cat:"部署 & 行銷",items:[{name:"Vercel + GitHub",cost:0,note:"部署+版控",req:true},{name:"域名",cost:100,note:"年費攤月",req:true},{name:"LinkedIn Premium",cost:990,note:"核心獲客",req:true},{name:"Canva Pro",cost:330,note:"社群圖文",req:false}]},
    {cat:"財務 & 行政",items:[{name:"記帳軟體",cost:500,note:"發票管理",req:true},{name:"勞健保",cost:3500,note:"基本保險",req:true},{name:"專業責任險",cost:800,note:"年繳攤月",req:false}]},
  ];
  const reqTotal = cats.reduce((s,c)=>s+c.items.filter(t=>t.req).reduce((a,t)=>a+t.cost,0),0);

  return <div>
    <SectionTitle icon="🔧" title="工具訂閱與營運成本" sub="每個月的實際支出，一毛不少。" role={<RoleBadge emoji="🔥" name="卡西法 CTO" color={C.orange}/>} />
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
      <Card style={{padding:"16px 8px"}}><KPI label="必要工具月費" value={`${(reqTotal/1000).toFixed(1)}k`} unit="" color={C.green}/><div style={{fontSize:10,color:C.muted,fontFamily:sans,textAlign:"center"}}>NT${reqTotal.toLocaleString()}/月</div></Card>
      <Card style={{padding:"16px 8px"}}><KPI label="年度必要支出" value={`${(reqTotal*12/10000).toFixed(1)}`} unit="萬" color={C.blue}/></Card>
      <Card style={{padding:"16px 8px"}}><KPI label="佔基準營收比" value={`${(reqTotal*12/2400000*100).toFixed(1)}`} unit="%" color={C.violet}/></Card>
    </div>
    {cats.map((c,ci)=>(
      <Card key={ci} style={{ marginBottom:12 }}>
        <div style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:sans,marginBottom:12}}>{c.cat}</div>
        <div style={{borderRadius:8,overflow:"hidden",border:`1px solid ${C.border}`}}>
          <TR header cells={[{text:"工具",w:"200px"},{text:"月費",w:"80px"},{text:"必要",w:"60px"},{text:"用途"}]} />
          {c.items.map((t,ti)=><TR key={ti} cells={[{text:t.name,w:"200px",color:C.text},{text:t.cost===0?"免費":`$${t.cost.toLocaleString()}`,w:"80px",mono:true,color:t.cost===0?C.green:C.gold},{text:t.req?"必要":"選用",w:"60px",color:t.req?C.green:C.muted},{text:t.note}]} />)}
        </div>
      </Card>
    ))}
  </div>;
}

// ═══ § 9 SOP ═══
function Sec_SOP() {
  const steps = [
    {n:"01",name:"潛客觸及",desc:"LinkedIn 內容 + 社群 + 轉介",action:"每週 2 篇 LinkedIn + Case Study",c:C.blue},
    {n:"02",name:"免費探索會議",desc:"30min 線上，了解痛點與預算",action:"固定框架：痛點→目標→預算→時程",c:C.blue},
    {n:"03",name:"提案報價",desc:"48hr 內寄出客製提案 PDF",action:"Claude 產出，愛德華審核",c:C.gold},
    {n:"04",name:"簽約收款",desc:"確認範圍 + 合約 + 訂金",action:"標準合約（NDA、智財、修改次數）",c:C.gold},
    {n:"05",name:"Kick-off",desc:"深度訪談 + 建立共享空間",action:"錄音→Claude 記錄→Notion 空間",c:C.green},
    {n:"06",name:"Sprint 執行",desc:"四階段交付系統 + 週同步",action:"AI Cowork Loop → 品質審核 → Review",c:C.green},
    {n:"07",name:"中期 Review",desc:"里程碑檢查 + 回饋收集",action:"簡報進度 + 方向調整",c:C.violet},
    {n:"08",name:"最終交付",desc:"完整交付物移交 + 說明",action:"Figma 權限 + PRD + 交付簡報",c:C.violet},
    {n:"09",name:"結案後續",desc:"尾款 + 推薦信 + Follow-up",action:"滿意度調查 + 3 月後回訪",c:C.cyan},
  ];
  return <div>
    <SectionTitle icon="🌿" title="接案到交付 SOP" sub="收到！每一步精準可控。" role={<RoleBadge emoji="🌿" name="馬魯克 COO" color={C.green}/>} />
    {steps.map((s,i)=>(
      <div key={i} style={{display:"flex",gap:12,marginBottom:8,alignItems:"start"}}>
        <div style={{width:40,height:40,borderRadius:10,background:s.c+"15",border:`1px solid ${s.c}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:s.c,fontFamily:mono,flexShrink:0}}>{s.n}</div>
        <Card style={{padding:14,flex:1}}>
          <div style={{display:"flex",gap:24}}>
            <div style={{minWidth:160}}><div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:sans}}>{s.name}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{s.desc}</div></div>
            <div style={{fontSize:12,color:C.sub,fontFamily:sans}}>{s.action}</div>
          </div>
        </Card>
      </div>
    ))}
    <Card style={{marginTop:16}}>
      <div style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:sans,marginBottom:12}}>📋 合約必備條款</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {["服務範圍與交付物明確定義","修改次數上限（建議 2 次大改）","付款條件與時程","智財權歸屬（交付後歸客戶）","保密條款（NDA）","終止條款與退費機制","AI 工具使用透明聲明","不含「無限修改」承諾"].map((t,i)=>
          <div key={i} style={{display:"flex",gap:8,fontSize:12,color:C.sub,fontFamily:sans,padding:"4px 0"}}><span style={{color:C.green}}>☑</span>{t}</div>
        )}
      </div>
    </Card>
  </div>;
}

// ═══ § 10 RISK ═══
function Sec_Risk() {
  const risks = [
    {risk:"一人公司產能瓶頸",level:"高",color:C.rose,desc:"同時 3-4 客戶可能時間衝突或品質下降。",impact:"交付延遲→客戶不滿→口碑受損",m:["嚴格控管：衝刺包 ≤2 + CPO ≤2","排程留 20% 緩衝","外部協作者口袋名單","回應 SLA：24hr 內"]},
    {risk:"AI 工具不穩定/漲價",level:"中高",color:C.orange,desc:"Claude/Cursor 可能當機、限流、改版、漲價。",impact:"效率驟降→交付延遲→成本惡化",m:["2+ 套 AI 互為備援","核心流程不 100% 依賴單一工具","預算預留 20% 緩衝","定期評估新工具"]},
    {risk:"客戶期望管理失敗",level:"高",color:C.rose,desc:"台灣常見「顧問=什麼都做」的認知。",impact:"Scope Creep→免費加班→毛利崩跌",m:["合約列明包含/不包含","探索會議主動釐清邊界","修改次數寫進合約","變更走書面+追加報價"]},
    {risk:"AI 產出品質/原創性",level:"中",color:C.gold,desc:"AI 可能幻覺、品質不一致。",impact:"專業形象受損→退費→口碑災難",m:["AI 初稿必須完整審閱改寫","品質 Checklist","坦誠告知使用 AI","AI 為效率工具非替代判斷"]},
    {risk:"營收不穩定/現金流",level:"中",color:C.gold,desc:"一人顧問收入天然波動。",impact:"2-3 月空窗→固定支出持續→被迫降價",m:["6 個月緊急預備金","CPO 月費平衡一次性收入","Pipeline 永遠 2-3 個在洽談","空窗期投入內容行銷"]},
    {risk:"法律與智財權",level:"低中",color:C.blue,desc:"AI 生成內容法律灰色地帶。",impact:"法律糾紛→賠償→聲譽損害",m:["合約約定智財權歸屬","AI 使用透明聲明","客戶資料用 API/企業版","考慮投保專業責任險"]},
  ];
  return <div>
    <SectionTitle icon="🥕" title="風險管理" sub="...（看了數據）...有些事不能假裝沒看到。" role={<RoleBadge emoji="🥕" name="蕪菁頭 CDO" color={C.cyan}/>} />
    {risks.map((r,i)=>(
      <Card key={i} accent={r.color} style={{marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
          <div style={{fontSize:14,fontWeight:800,color:r.color,fontFamily:sans}}>{r.risk}</div>
          <Badge color={r.color}>風險：{r.level}</Badge>
        </div>
        <div style={{fontSize:12,color:C.sub,fontFamily:sans,lineHeight:1.7,marginBottom:8}}>{r.desc}</div>
        <div style={{fontSize:12,color:C.rose,fontFamily:sans,marginBottom:12}}><span style={{fontWeight:700}}>影響鏈：</span>{r.impact}</div>
        <div style={{padding:12,borderRadius:10,background:C.glass,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:11,fontWeight:700,color:C.green,fontFamily:sans,marginBottom:6}}>緩解措施</div>
          {r.m.map((m,j)=><div key={j} style={{display:"flex",gap:8,fontSize:12,color:C.sub,fontFamily:sans,padding:"2px 0"}}><span style={{color:C.green}}>→</span>{m}</div>)}
        </div>
      </Card>
    ))}
  </div>;
}

// ═══ § 11 FINANCE ═══
function Sec_Finance() {
  return <div>
    <SectionTitle icon="📊" title="財務預測" sub="數字不說謊，但要誠實看。" role={<RoleBadge emoji="🌸" name="蘇菲 CFO" color={C.rose}/>} />
    <Card accent={C.gold} style={{marginBottom:24}}>
      <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:sans,marginBottom:16}}>Y1 營收三情境</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
        {[
          {name:"保守",c:C.blue,cases:"健檢×4 + 衝刺包×4 + CPO×3月",rev:"NT$148 萬",mo:"NT$12.3萬/月"},
          {name:"基準",c:C.gold,cases:"健檢×6 + 衝刺包×6 + CPO×6月",rev:"NT$240 萬",mo:"NT$20萬/月"},
          {name:"樂觀",c:C.green,cases:"健檢×8 + 衝刺包×8 + CPO×9月",rev:"NT$372 萬",mo:"NT$31萬/月"},
        ].map((s,i)=>(
          <div key={i} style={{padding:20,borderRadius:12,background:C.glass,border:`1px solid ${s.c}20`}}>
            <div style={{fontSize:12,fontWeight:700,color:s.c,fontFamily:sans,marginBottom:10}}>{s.name}情境</div>
            <div style={{fontSize:22,fontWeight:800,fontFamily:mono,color:s.c,marginBottom:8}}>{s.rev}</div>
            <div style={{fontSize:11,color:C.muted,fontFamily:sans,marginBottom:4}}>{s.cases}</div>
            <Badge color={s.c}>{s.mo}</Badge>
          </div>
        ))}
      </div>
    </Card>
    <Card style={{marginBottom:24}}>
      <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:sans,marginBottom:16}}>月度固定支出</div>
      <div style={{borderRadius:8,overflow:"hidden",border:`1px solid ${C.border}`}}>
        <TR header cells={[{text:"項目"},{text:"月支出",w:"120px"},{text:"年支出",w:"120px"},{text:"備註"}]} />
        {[["AI 工具","$1,980","$23,760","Claude+ChatGPT+Cursor"],["Figma Pro","$480","$5,760",""],["Google Workspace","$200","$2,400",""],["LinkedIn Premium","$990","$11,880","核心獲客"],["行政（記帳）","$500","$6,000",""],["勞健保","$3,500","$42,000","一人行號"],["雜支緩衝","$770","$9,240","10%"]].map((r,i)=><TR key={i} cells={r.map((t,j)=>({text:t,color:j===0?C.text:C.sub,mono:j>0&&j<3}))} />)}
        <TR cells={[{text:"合計",color:C.gold},{text:"$8,420",color:C.gold,mono:true,w:"120px"},{text:"$101,040",color:C.gold,mono:true,w:"120px"},{text:"年度約 NT$10.1 萬"}]} />
      </div>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24}}>
      {[{l:"年營收（基準）",v:"NT$240萬",c:C.green},{l:"年固定支出",v:"NT$10.1萬",c:C.rose},{l:"稅前淨收入",v:"NT$229.9萬",c:C.gold}].map((k,i)=>(
        <Card key={i} style={{textAlign:"center",padding:20}}>
          <div style={{fontSize:11,color:C.muted,fontFamily:sans,marginBottom:8}}>{k.l}</div>
          <div style={{fontSize:22,fontWeight:800,fontFamily:mono,color:k.c}}>{k.v}</div>
        </Card>
      ))}
    </div>
    <Card accent={C.gold}>
      <div style={{fontSize:12,fontWeight:700,color:C.gold,fontFamily:sans,marginBottom:8}}>💡 損益平衡點</div>
      <div style={{fontSize:12,color:C.sub,fontFamily:sans,lineHeight:1.8}}>月最低需求 NT$8 萬（生活+營運），每月只需完成衝刺包 32% 或維持 1 個 CPO 客戶即可。商業模式生存門檻低，但穩定成長需要持續獲客。</div>
    </Card>
  </div>;
}

// ═══ § 12 ROADMAP ═══
function Sec_Roadmap() {
  const phases = [
    {phase:"Phase 1 — 建設期",period:"第 1-30 天",color:C.blue,goal:"完成基礎建設",tasks:[["註冊一人行號","P0"],["開設商業帳戶","P0"],["域名 + Email","P0"],["Landing Page 上線","P0"],["訂閱必要工具","P0"],["標準合約範本","P0"],["Notion 客戶空間模板","P1"],["品牌 VI","P1"],["Calendly 設定","P1"],["Portfolio（ECHO、Aura、NexMed、Lumière）","P1"]]},
    {phase:"Phase 2 — 獲客期",period:"第 31-60 天",color:C.gold,goal:"取得前 1-2 個付費客戶",tasks:[["LinkedIn 檔案改造","P0"],["每週 2 篇 LinkedIn","P0"],["聯繫 20-30 位潛客","P0"],["≥5 場探索會議","P0"],["第 1 個付費客戶","P0"],["新創社群活動","P1"],["Sales Deck","P1"],["CRM（Notion）","P2"]]},
    {phase:"Phase 3 — 驗證期",period:"第 61-90 天",color:C.green,goal:"完成首批交付、優化流程",tasks:[["完成第 1 個衝刺包","P0"],["客戶推薦信","P0"],["覆盤 AI Cowork 效率","P0"],["定價調整評估","P1"],["可複製 SOP 整理","P1"],["第 1 份 Case Study","P1"],["Add-on 服務思考","P2"],["Q2 目標設定","P1"]]},
  ];
  return <div>
    <SectionTitle icon="🗺️" title="90 天啟動路線圖" sub="三個階段，截止日清清楚楚。" role={<RoleBadge emoji="🌿" name="馬魯克 COO" color={C.green}/>} />
    {phases.map((p,i)=>(
      <Card key={i} accent={p.color} style={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div><div style={{fontSize:16,fontWeight:800,color:p.color,fontFamily:sans}}>{p.phase}</div><div style={{fontSize:12,color:C.muted,fontFamily:mono,marginTop:2}}>{p.period}</div></div>
          <Badge color={p.color}>{p.goal}</Badge>
        </div>
        <div style={{borderRadius:8,overflow:"hidden",border:`1px solid ${C.border}`}}>
          <TR header cells={[{text:"任務"},{text:"優先級",w:"70px"}]} />
          {p.tasks.map((t,j)=><TR key={j} cells={[{text:t[0],color:C.text},{text:t[1],w:"70px",color:t[1]==="P0"?C.rose:t[1]==="P1"?C.gold:C.muted}]} />)}
        </div>
      </Card>
    ))}
  </div>;
}

// ═══ § 13 PRD TEMPLATE ═══
function Sec_PRD() {
  return <div>
    <SectionTitle icon="📝" title="PRD 標準模板" sub="每個專案的 PRD 都用這個結構。" role={<RoleBadge emoji="🧙" name="霍爾 CPO" color={C.gold}/>} />
    <Card accent={C.gold} glow={C.gold+"10"} style={{ marginBottom:24 }}>
      <div style={{fontSize:13,fontWeight:700,color:C.gold,fontFamily:sans,marginBottom:8}}>格式說明</div>
      <div style={{fontSize:12,color:C.sub,fontFamily:sans,lineHeight:1.8}}>
        主體：Markdown 格式（方便用 Claude 協作迭代）<br/>
        客戶交付：可轉 PDF 或放 Notion 供客戶閱讀<br/>
        命名規則：[客戶名稱]-PRD-v[版本].md
      </div>
    </Card>
    {[
      {n:"1",title:"產品概述",items:["產品願景（一句話）","目標用戶（Persona 摘要）","核心價值主張","成功指標 KPI"],c:C.blue},
      {n:"2",title:"市場背景",items:["市場機會摘要（從市場策略報告濃縮）","競品差異化定位"],c:C.blue},
      {n:"3",title:"功能需求",items:["P0 — Must Have（每個含 User Story + 驗收條件）","P1 — Should Have","P2 — Nice to Have","User Story 格式：As a [user], I want [action], so that [benefit]","驗收條件：Given [context], When [action], Then [result]"],c:C.gold},
      {n:"4",title:"User Flow",items:["核心流程描述（文字版或 Mermaid 圖）","註冊→首次使用→核心功能→留存"],c:C.gold},
      {n:"5",title:"頁面規格",items:["每個頁面：元素清單","互動邏輯","狀態說明（載入/空/錯誤/成功）","對應原型連結"],c:C.green},
      {n:"6",title:"技術規格",items:["建議技術棧","API 需求概述","第三方服務","資料模型概念"],c:C.green},
      {n:"7",title:"非功能需求",items:["性能要求","安全要求","可及性（Accessibility）"],c:C.violet},
      {n:"8",title:"開發估時與建議",items:["功能模組拆解 + 工時估算","建議 Sprint 規劃","預算範圍建議"],c:C.violet},
      {n:"9",title:"附錄",items:["Figma 原型連結","市場策略報告連結","訪談記錄摘要"],c:C.cyan},
    ].map((s,i)=>(
      <Card key={i} style={{marginBottom:8,padding:"14px 20px"}}>
        <div style={{display:"flex",gap:12,alignItems:"start"}}>
          <div style={{width:28,height:28,borderRadius:8,background:s.c+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:s.c,fontFamily:mono,flexShrink:0}}>{s.n}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:s.c,fontFamily:sans,marginBottom:6}}>{s.title}</div>
            {s.items.map((item,j)=><div key={j} style={{fontSize:12,color:C.sub,fontFamily:sans,padding:"1px 0"}}>{item}</div>)}
          </div>
        </div>
      </Card>
    ))}
    <Card accent={C.orange} style={{marginTop:16}}>
      <div style={{fontSize:12,fontWeight:700,color:C.orange,fontFamily:sans,marginBottom:8}}>📋 PRD 完整性 Checklist</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
        {["每個 P0 功能都有 User Story + 驗收條件","User Flow 覆蓋所有核心場景","頁面規格覆蓋所有原型頁面","技術規格可供工程師直接評估","估時覆蓋所有功能模組","Figma 原型連結正確可訪問"].map((t,i)=>
          <div key={i} style={{display:"flex",gap:6,fontSize:11,color:C.sub,fontFamily:sans,padding:"3px 0"}}><span style={{color:C.orange}}>□</span>{t}</div>
        )}
      </div>
    </Card>
  </div>;
}

// ═══ § 14 PROMPTS ═══
function Sec_Prompts() {
  const prompts = [
    {stage:"市場策略階段",color:C.blue,icon:"📊",
     prompt:`你是 Beyond Spec 的市場分析師。以下是客戶訪談紀錄：\n[貼上訪談紀錄]\n\n客戶背景：\n- 產業：[填入]\n- 想做的產品：[填入]\n- 預算範圍：[填入]\n\n請幫我產出：\n1. 5 個關鍵 Insight\n2. 3 個未被驗證的假設\n3. TAM/SAM/SOM 估算\n4. 5-8 家競品分析矩陣\n5. 初版 Persona（1-2 個）\n6. 市場機會 vs 風險摘要\n7. 需進一步驗證的問題\n\n格式：Markdown`},
    {stage:"產品策略階段",color:C.gold,icon:"🎯",
     prompt:`基於以下市場分析結論：\n[貼上市場策略報告]\n\n確認的目標 Persona：\n[貼上 Persona]\n\n請產出產品策略書初稿：\n1. 產品定位聲明（2-3 方向供選擇）\n2. MVP 功能清單（P0/P1/P2 + Impact vs Effort）\n3. 商業模式設計\n4. GTM 策略方向\n5. 成功指標 KPI\n6. User Story 拆解\n\n格式：Markdown`},
    {stage:"產品原型階段",color:C.green,icon:"🎨",
     prompt:`基於以下功能清單與 User Story：\n[貼上]\n\n客戶品牌偏好：[填入]\n\n請產出：\n1. 資訊架構（IA）樹狀圖\n2. 核心 User Flow\n3. 每頁元素清單與文案建議\n4. 互動邏輯說明\n5. 狀態設計（載入/空/錯誤）\n\n格式：Markdown，方便轉 Figma`},
    {stage:"PRD 彙整階段",color:C.violet,icon:"📝",
     prompt:`請基於以下資料彙整完整 PRD：\n\n市場策略摘要：[貼上]\n產品策略書：[貼上]\n原型頁面規格：[貼上]\n\n要求：\n- 使用 PRD 標準模板格式\n- 每個功能含 User Story + 驗收條件\n- 頁面規格含元素+互動+狀態\n- 完成後自行跑完整性 Checklist\n\n格式：Markdown`},
  ];
  return <div>
    <SectionTitle icon="🤖" title="Claude Prompt Template 庫" sub="貼入客戶資料，即可啟動各階段產出。" role={<RoleBadge emoji="🔥" name="卡西法 CTO" color={C.orange}/>} />
    <Card accent={C.gold} style={{ marginBottom:24 }}>
      <div style={{fontSize:12,color:C.sub,fontFamily:sans,lineHeight:1.8}}>
        每個階段有一組標準 Prompt。使用方式：複製 Prompt → 將 [方括號] 內容替換為客戶實際資料 → 貼入 Claude 執行 → Edward 審閱修改。
      </div>
    </Card>
    {prompts.map((p,i)=>(
      <Card key={i} accent={p.color} style={{marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <span style={{fontSize:20}}>{p.icon}</span>
          <div style={{fontSize:14,fontWeight:700,color:p.color,fontFamily:sans}}>{p.stage}</div>
        </div>
        <div style={{ padding:16, borderRadius:10, background:C.bg, border:`1px solid ${C.border}`, fontFamily:mono, fontSize:11, color:C.sub, lineHeight:1.8, whiteSpace:"pre-wrap" }}>
          {p.prompt}
        </div>
      </Card>
    ))}
  </div>;
}

// ═══ MAIN APP ═══
export default function App() {
  const [sec, setSec] = useState("exec");
  const R = {
    exec:Sec_Exec, brand:Sec_Brand, market:Sec_Market, service:Sec_Service,
    delivery:Sec_Delivery, cowork:Sec_Cowork, pricing:Sec_Pricing, tools:Sec_Tools,
    sop:Sec_SOP, risk:Sec_Risk, finance:Sec_Finance, roadmap:Sec_Roadmap,
    prd:Sec_PRD, prompts:Sec_Prompts,
  };
  const Comp = R[sec] || Sec_Exec;
  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:sans}}>
      <div style={{borderBottom:`1px solid ${C.border}`,background:C.card,position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"14px 32px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:36,height:36,borderRadius:10,background:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:C.bg}}>B</div>
            <div><div style={{fontSize:15,fontWeight:800}}>規格外工作室 — 商業計畫書 SSOT</div><div style={{fontSize:10,color:C.muted,fontFamily:mono,letterSpacing:"0.1em"}}>BEYOND SPEC · BUSINESS PLAN · v2.0 · 2026</div></div>
          </div>
          <div style={{display:"flex",gap:8}}><Badge color={C.gold}>🏰 移動城堡指揮部</Badge><Badge color={C.green}>v2.0 SSOT</Badge></div>
        </div>
      </div>
      <div style={{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"210px 1fr",minHeight:"calc(100vh - 60px)"}}>
        <div style={{borderRight:`1px solid ${C.border}`,padding:"20px 0",position:"sticky",top:60,height:"calc(100vh - 60px)",overflowY:"auto"}}>
          {SECTIONS.map(s=>(
            <button key={s.id} onClick={()=>setSec(s.id)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 16px",border:"none",cursor:"pointer",background:sec===s.id?C.gold+"12":"transparent",borderRight:sec===s.id?`2px solid ${C.gold}`:"2px solid transparent",color:sec===s.id?C.gold:C.sub,fontSize:12,fontFamily:sans,fontWeight:sec===s.id?700:400,textAlign:"left"}}>
              <span style={{fontSize:15}}>{s.icon}</span>{s.label}
            </button>
          ))}
          <div style={{padding:"16px",borderTop:`1px solid ${C.border}`,marginTop:12}}>
            <div style={{fontSize:10,color:C.muted,fontFamily:sans,lineHeight:1.6}}>
              🏰 移動城堡 AI 協力<br/>
              SSOT v2.0 · 2026-02-28<br/>
              台灣市場版 · 新台幣計價
            </div>
          </div>
        </div>
        <div style={{padding:"28px 36px",overflowY:"auto"}}><Comp/></div>
      </div>
    </div>
  );
}
