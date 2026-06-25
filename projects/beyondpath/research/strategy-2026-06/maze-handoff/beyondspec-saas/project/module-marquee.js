// Module marquee — two rows of module cards auto-scrolling in opposite directions.
// Self-contained web component (shadow DOM, plain JS). Pauses on hover; edge fade masks.
(function () {
  const IC = {
    pulse:'<path d="M3 12h4l2 5 4-10 2 5h6"/>',
    flask:'<path d="M9 3h6M10 3v6l-5.5 9.5A1.5 1.5 0 0 0 5.8 21h12.4a1.5 1.5 0 0 0 1.3-2.5L14 9V3"/>',
    clipboard:'<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9.5 4V3h5v1"/><path d="M8.5 12.5l2 2 4-4.5"/>',
    trending:'<path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/>',
    doc:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    check:'<path d="M4 7l2 2 3-3"/><path d="M4 16l2 2 3-3"/><path d="M13 7h7M13 17h7"/>',
    people:'<circle cx="9" cy="8" r="3"/><path d="M3.5 20c0-3 2.7-5 5.5-5s5.5 2 5.5 5"/><path d="M16 6.2a3 3 0 0 1 0 5.6"/><path d="M18.5 20c0-2-1-3.6-2.5-4.4"/>',
    dollar:'<path d="M12 2v20"/><path d="M16.5 6H10a3.5 3.5 0 0 0 0 7h4a3.5 3.5 0 0 1 0 7H7"/>',
    receipt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    calendar:'<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M8 3v4M16 3v4"/>',
    folder:'<path d="M3 7a2 2 0 0 1 2-2h3.5l2 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    chat:'<path d="M4 5h16v11H9l-4 4z"/><path d="M8 10h8M8 13h5"/>',
  };
  const LOCK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="flex:none;opacity:.8;"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';

  const CATS = {
    validate: { label:'驗證', color:'#199a55', tint:'#e7f3dd' },
    operate:  { label:'營運', color:'#0f9d8e', tint:'#e2f5f1' },
    sales:    { label:'業務', color:'#ff6b57', tint:'#ffeae5' },
    finance:  { label:'財務', color:'#d99500', tint:'#fcf1d8' },
    people:   { label:'出勤', color:'#7a5bff', tint:'#efeaff' },
  };
  const MODS = [
    { cat:'validate', name:'產品力診斷', sub:'這個方向值得做嗎?', icon:'pulse' },
    { cat:'validate', name:'Lab 研究',  sub:'用戶怎麼看我的產品?', icon:'flask' },
    { cat:'validate', name:'問卷引擎',  sub:'怎麼收集真實回饋?', icon:'clipboard' },
    { cat:'validate', name:'市場探測',  sub:'市場有多大?', icon:'trending' },
    { cat:'validate', name:'市場報告',  sub:'完整分析怎麼說?', icon:'doc' },
    { cat:'operate',  name:'任務中心',  sub:'今天該做什麼?', icon:'check' },
    { cat:'operate',  name:'營運戰情室', sub:'公司現在狀況怎樣?', icon:'pulse' },
    { cat:'operate',  name:'會議紀錄',  sub:'上次講了什麼?', icon:'chat' },
    { cat:'operate',  name:'文件庫',    sub:'那份合約在哪裡?', icon:'folder' },
    { cat:'sales',    name:'客戶管理',  sub:'這個人跟我們什麼關係?', icon:'people' },
    { cat:'sales',    name:'報價提案',  sub:'怎麼快速產一份報價?', icon:'doc' },
    { cat:'finance',  name:'收款管理',  sub:'錢收到了嗎?', icon:'dollar', lock:true },
    { cat:'finance',  name:'算薪水',    sub:'薪水算好了嗎?', icon:'receipt', lock:true },
    { cat:'people',   name:'出缺勤',    sub:'今天誰到了?', icon:'calendar' },
  ];
  const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const svg = (icon) => `<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[icon]}</svg>`;

  const card = (m) => {
    const c = CATS[m.cat];
    return `
      <div class="card" style="--accent:${c.color};--tint:${c.tint};">
        <span class="chip">${svg(m.icon)}</span>
        <span class="body">
          <span class="name">${esc(m.name)}${m.lock?LOCK:''}</span>
          <span class="sub">${esc(m.sub)}</span>
        </span>
        <span class="cat">${esc(c.label)}</span>
      </div>`;
  };

  class ModuleMarquee extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      this.style.display = 'block';
      const root = this.attachShadow({ mode:'open' });

      const rowA = MODS.slice(0, 7);
      const rowB = MODS.slice(7);
      const seqA = rowA.map(card).join('');
      const seqB = rowB.map(card).join('');

      root.innerHTML = `
        <style>
          :host{display:block;font-family:'Plus Jakarta Sans','Noto Sans TC',sans-serif;}
          *{box-sizing:border-box;}
          .wrap{max-width:1180px;margin:0 auto;}
          .head{text-align:center;max-width:680px;margin:0 auto clamp(26px,3.4vw,40px);}
          .marq{position:relative;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent);mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent);}
          .track{display:flex;gap:16px;width:max-content;padding:10px 0;}
          .track.a{animation:bmm-l 42s linear infinite;}
          .track.b{animation:bmm-r 46s linear infinite;}
          .marq:hover .track{animation-play-state:paused;}
          @keyframes bmm-l{from{transform:translateX(0)}to{transform:translateX(calc(-50% - 8px))}}
          @keyframes bmm-r{from{transform:translateX(calc(-50% - 8px))}to{transform:translateX(0)}}
          .card{flex:none;width:288px;display:flex;align-items:center;gap:14px;background:#fff;border:1px solid rgba(11,11,15,.07);border-radius:18px;padding:15px 18px;box-shadow:0 14px 34px -30px rgba(11,11,15,.5);transition:transform .3s ease,box-shadow .3s ease,border-color .3s ease;cursor:default;}
          .card:hover{transform:translateY(-5px);box-shadow:0 26px 46px -28px rgba(11,11,15,.35);border-color:var(--accent);}
          .chip{flex:none;width:44px;height:44px;border-radius:14px;background:var(--tint);color:var(--accent);display:flex;align-items:center;justify-content:center;transition:transform .35s cubic-bezier(.34,1.56,.64,1);}
          .card:hover .chip{transform:rotate(-6deg) scale(1.07);}
          .body{display:flex;flex-direction:column;min-width:0;flex:1;}
          .name{display:flex;align-items:center;gap:6px;font-size:16px;font-weight:800;letter-spacing:-.01em;color:#15140e;white-space:nowrap;}
          .sub{font-size:12.5px;color:#8a8f9c;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
          .cat{flex:none;font-size:11px;font-weight:800;letter-spacing:.04em;color:var(--accent);background:var(--tint);padding:4px 9px;border-radius:999px;white-space:nowrap;}
          .rows{display:flex;flex-direction:column;gap:16px;}
        </style>
        <div class="wrap">
          <div class="head">
            <div style="font-size:13px;font-weight:800;letter-spacing:.14em;color:#137a42;margin-bottom:13px;">ALL-IN-ONE · 14 模組</div>
            <h2 style="font-size:clamp(28px,4.4vw,52px);line-height:1.05;letter-spacing:-.035em;font-weight:800;margin:0 0 14px;text-wrap:balance;">一個平台,<span style="position:relative;white-space:nowrap;z-index:0;">轉個不停<span style="position:absolute;left:-2%;right:-2%;bottom:4%;height:30%;background:#d4ec5b;border-radius:6px;z-index:-1;transform:rotate(-1deg);"></span></span>。</h2>
            <p style="font-size:clamp(15px,1.6vw,18px);line-height:1.6;color:#5b6170;margin:0;text-wrap:pretty;">從驗證到營運,每個模組都在回答你心裡的那個問題。</p>
          </div>
          <div class="rows">
            <div class="marq"><div class="track a">${seqA}${seqA}</div></div>
            <div class="marq"><div class="track b">${seqB}${seqB}</div></div>
          </div>
        </div>`;
    }
  }

  if (!customElements.get('bs-module-marquee')) customElements.define('bs-module-marquee', ModuleMarquee);
})();
