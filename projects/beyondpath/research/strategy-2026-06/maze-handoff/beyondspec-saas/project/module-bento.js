// Category-filtered bento grid for the 14 modules.
// Self-contained web component (shadow DOM, plain JS). Filter pills emphasize a
// category's tiles and dim the rest — layout stays fixed, only emphasis animates.
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
  const LOCK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="flex:none;opacity:.85;"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';

  const CATS = {
    validate: { label:'驗證', en:'Validate', color:'#199a55', tint:'#e7f3dd', tag:'從想法到證據,先確認值不值得做' },
    operate:  { label:'營運', en:'Operate',  color:'#0f9d8e', tint:'#e2f5f1', tag:'任務、文件、戰情室,團隊跑在同一條線上' },
    sales:    { label:'業務', en:'Sales',    color:'#ff6b57', tint:'#ffeae5', tag:'從第一次接觸到成交,關係不漏接' },
    finance:  { label:'財務', en:'Finance',  color:'#d99500', tint:'#fcf1d8', tag:'收款與薪資,數字自己對好' },
    people:   { label:'出勤', en:'People',   color:'#7a5bff', tint:'#efeaff', tag:'誰到了、誰請假,一眼看完' },
  };
  const ALL_TAG = '一個平台,涵蓋公司營運的每一個環節';

  // feat: 'green' | 'dark' make a 2x2 hero tile
  const MODS = [
    { cat:'validate', name:'產品力診斷', sub:'這個方向值得做嗎?', icon:'pulse', feat:'green' },
    { cat:'operate',  name:'營運戰情室', sub:'公司現在狀況怎樣?', icon:'pulse', feat:'dark' },
    { cat:'validate', name:'Lab 研究',  sub:'用戶怎麼看我的產品?', icon:'flask' },
    { cat:'validate', name:'問卷引擎',  sub:'怎麼收集真實回饋?', icon:'clipboard' },
    { cat:'validate', name:'市場探測',  sub:'市場有多大?', icon:'trending' },
    { cat:'validate', name:'市場報告',  sub:'完整分析怎麼說?', icon:'doc' },
    { cat:'operate',  name:'任務中心',  sub:'今天該做什麼?', icon:'check' },
    { cat:'sales',    name:'客戶管理',  sub:'這個人跟我們什麼關係?', icon:'people' },
    { cat:'sales',    name:'報價提案',  sub:'怎麼快速產一份報價?', icon:'doc' },
    { cat:'finance',  name:'收款管理',  sub:'錢收到了嗎?', icon:'dollar', lock:true },
    { cat:'finance',  name:'算薪水',    sub:'薪水算好了嗎?', icon:'receipt', lock:true },
    { cat:'people',   name:'出缺勤',    sub:'今天誰到了?', icon:'calendar' },
    { cat:'operate',  name:'會議紀錄',  sub:'上次講了什麼?', icon:'chat' },
    { cat:'operate',  name:'文件庫',    sub:'那份合約在哪裡?', icon:'folder' },
  ];
  const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const pad = (n) => String(n+1).padStart(2,'0');
  const svg = (icon, sz, sw) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw||2}" stroke-linecap="round" stroke-linejoin="round">${IC[icon]}</svg>`;

  class ModuleBento extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      this.style.display = 'block';
      const root = this.attachShadow({ mode:'open' });
      this._active = 'all';

      const tile = (m, i) => {
        const c = CATS[m.cat];
        if (m.feat === 'green') {
          return `
          <button data-tile="${i}" data-cat="${m.cat}" type="button" class="tile feat" style="grid-column:span 2;grid-row:span 2;background:linear-gradient(150deg,#f1f9e8,#e7f3dd);color:#15140e;align-items:flex-start;justify-content:space-between;">
            <div class="tilehead" style="width:100%;display:flex;align-items:center;justify-content:space-between;">
              <span class="chip" style="background:#fff;color:${c.color};width:54px;height:54px;border-radius:17px;">${svg(m.icon,27,2.1)}</span>
              <span class="pill2" style="background:${c.color};color:#fff;">最常被打開</span>
            </div>
            <div style="text-align:left;">
              <div style="display:flex;align-items:center;gap:8px;font-size:clamp(21px,2.2vw,27px);font-weight:800;letter-spacing:-.02em;">${esc(m.name)}</div>
              <div style="font-size:14.5px;font-weight:600;color:#4a6b40;margin-top:6px;">${esc(m.sub)}</div>
              <div style="display:flex;gap:6px;margin-top:16px;">
                <span class="spark" style="background:${c.color};height:60%;"></span><span class="spark" style="background:${c.color};opacity:.55;height:78%;"></span><span class="spark" style="background:${c.color};height:42%;"></span><span class="spark" style="background:${c.color};opacity:.55;height:90%;"></span><span class="spark" style="background:${c.color};height:66%;"></span><span class="spark" style="background:#15140e;height:100%;"></span>
              </div>
            </div>
            <span class="ghost" style="color:rgba(25,154,85,.1);">${pad(i)}</span>
          </button>`;
        }
        if (m.feat === 'dark') {
          return `
          <button data-tile="${i}" data-cat="${m.cat}" type="button" class="tile feat dark" style="grid-column:span 2;grid-row:span 2;background:#0b0b0f;color:#fff;align-items:flex-start;justify-content:space-between;">
            <div class="tilehead" style="width:100%;display:flex;align-items:center;justify-content:space-between;">
              <span class="chip" style="background:rgba(212,236,91,.16);color:#d4ec5b;width:54px;height:54px;border-radius:17px;">${svg(m.icon,27,2.1)}</span>
              <span class="pill2" style="background:rgba(212,236,91,.16);color:#d4ec5b;"><span style="width:6px;height:6px;border-radius:50%;background:#d4ec5b;display:inline-block;animation:bnt-pulse 1.4s ease-in-out infinite;margin-right:6px;"></span>即時</span>
            </div>
            <div style="text-align:left;width:100%;">
              <div style="font-size:clamp(21px,2.2vw,27px);font-weight:800;letter-spacing:-.02em;">${esc(m.name)}</div>
              <div style="font-size:14.5px;font-weight:600;color:rgba(255,255,255,.6);margin-top:6px;">${esc(m.sub)}</div>
              <div style="display:flex;align-items:flex-end;gap:5px;height:42px;margin-top:16px;">
                <span class="bar" style="background:#33333d;height:46%;"></span><span class="bar" style="background:#33333d;height:68%;"></span><span class="bar" style="background:#33333d;height:54%;"></span><span class="bar" style="background:#33333d;height:80%;"></span><span class="bar" style="background:#199a55;height:92%;"></span><span class="bar" style="background:#d4ec5b;height:100%;"></span><span class="bar" style="background:#33333d;height:60%;"></span><span class="bar" style="background:#33333d;height:74%;"></span>
              </div>
            </div>
            <span class="ghost" style="color:rgba(255,255,255,.05);">${pad(i)}</span>
          </button>`;
        }
        return `
          <button data-tile="${i}" data-cat="${m.cat}" type="button" class="tile" style="background:#fff;color:#15140e;align-items:flex-start;justify-content:space-between;">
            <div class="tilehead" style="width:100%;display:flex;align-items:center;justify-content:space-between;">
              <span class="chip" style="background:${c.tint};color:${c.color};">${svg(m.icon,20,2)}</span>
              <span class="catdot" style="background:${c.color};"></span>
            </div>
            <div style="text-align:left;">
              <div style="display:flex;align-items:center;gap:6px;font-size:16px;font-weight:800;letter-spacing:-.01em;">${esc(m.name)}${m.lock?LOCK:''}</div>
              <div class="sub" style="font-size:12.5px;color:#8a8f9c;margin-top:3px;">${esc(m.sub)}</div>
            </div>
            <span class="ghost sm" style="color:rgba(11,11,15,.05);">${pad(i)}</span>
          </button>`;
      };

      const pills = [['all','全部']].concat(Object.keys(CATS).map(k=>[k,CATS[k].label]))
        .map(([k,lab])=>{
          const on = k==='all';
          const col = k==='all' ? '#15140e' : CATS[k].color;
          const dot = k==='all' ? '' : `<span class="pdot" style="background:${on?'#fff':col};"></span>`;
          return `<button data-pill="${k}" data-col="${col}" type="button" class="pill ${on?'on':''}" style="${on?`background:${col};color:#fff;`:''}">${dot}${esc(lab)}</button>`;
        }).join('');

      root.innerHTML = `
        <style>
          :host{display:block;font-family:'Plus Jakarta Sans','Noto Sans TC',sans-serif;}
          *{box-sizing:border-box;}
          .wrap{max-width:1120px;margin:0 auto;}
          .pills{display:flex;flex-wrap:wrap;gap:9px;justify-content:center;margin-bottom:10px;}
          .pill{display:inline-flex;align-items:center;gap:7px;font-family:inherit;font-size:14px;font-weight:800;color:#3c4150;background:#fff;border:1px solid rgba(11,11,15,.1);border-radius:999px;padding:9px 17px;cursor:pointer;transition:transform .18s ease,background .25s ease,color .25s ease,border-color .25s ease,box-shadow .25s ease;white-space:nowrap;}
          .pill:hover{transform:translateY(-2px);}
          .pdot{width:8px;height:8px;border-radius:50%;transition:background .25s ease;}
          .cap{text-align:center;font-size:14px;font-weight:600;color:#5b6170;min-height:21px;margin-bottom:24px;transition:opacity .3s ease;}
          .cap b{color:#15140e;font-weight:800;}
          .grid{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:150px;grid-auto-flow:row dense;gap:14px;}
          .tile{position:relative;overflow:hidden;display:flex;flex-direction:column;border:1px solid rgba(11,11,15,.07);border-radius:22px;padding:18px;cursor:pointer;font-family:inherit;text-align:left;box-shadow:0 16px 38px -34px rgba(11,11,15,.5);transition:transform .45s cubic-bezier(.16,.84,.44,1),opacity .45s ease,filter .45s ease,box-shadow .3s ease;}
          .tile.feat{padding:24px;}
          .tile:hover{transform:translateY(-5px);box-shadow:0 30px 54px -30px rgba(11,11,15,.32);}
          .chip{flex:none;width:40px;height:40px;border-radius:13px;display:flex;align-items:center;justify-content:center;transition:transform .4s cubic-bezier(.34,1.56,.64,1);}
          .tile:hover .chip{transform:rotate(-6deg) scale(1.06);}
          .catdot{width:9px;height:9px;border-radius:50%;}
          .pill2{font-size:11.5px;font-weight:800;letter-spacing:.02em;padding:5px 11px;border-radius:999px;display:inline-flex;align-items:center;white-space:nowrap;}
          .spark{width:9px;border-radius:4px;align-self:flex-end;}
          .bar{width:9px;border-radius:4px;}
          .ghost{position:absolute;right:14px;bottom:-6px;font-size:78px;line-height:1;font-weight:800;letter-spacing:-.04em;pointer-events:none;}
          .ghost.sm{font-size:54px;right:11px;bottom:-2px;}
          .tile.dim{opacity:.4;filter:grayscale(.85);transform:scale(.97);}
          .tile.hot{box-shadow:0 22px 46px -26px rgba(11,11,15,.4);}
          @keyframes bnt-pulse{0%,100%{opacity:1}50%{opacity:.3}}
          @media(max-width:900px){.grid{grid-template-columns:repeat(2,1fr);grid-auto-rows:140px;}}
          @media(max-width:560px){.grid{grid-template-columns:repeat(2,1fr);}.tile.feat{grid-column:span 2 !important;grid-row:span 2 !important;}}
        </style>
        <div class="wrap">
          <div style="text-align:center;max-width:680px;margin:0 auto clamp(22px,3vw,30px);">
            <div style="font-size:13px;font-weight:800;letter-spacing:.14em;color:#137a42;margin-bottom:13px;">ALL-IN-ONE · 14 模組</div>
            <h2 style="font-size:clamp(28px,4.4vw,52px);line-height:1.05;letter-spacing:-.035em;font-weight:800;margin:0 0 14px;text-wrap:balance;">一張地圖,<span style="position:relative;white-space:nowrap;z-index:0;">看完整間公司<span style="position:absolute;left:-2%;right:-2%;bottom:4%;height:30%;background:#d4ec5b;border-radius:6px;z-index:-1;transform:rotate(-1deg);"></span></span>。</h2>
          </div>
          <div class="pills">${pills}</div>
          <div class="cap" data-cap><b>14 個模組</b> · ${ALL_TAG}</div>
          <div class="grid" data-grid>${MODS.map(tile).join('')}</div>
        </div>`;

      this._root = root;
      this._tiles = [...root.querySelectorAll('[data-tile]')];
      this._pills = [...root.querySelectorAll('[data-pill]')];
      this._cap = root.querySelector('[data-cap]');

      this._pills.forEach(p => p.addEventListener('click', () => this._filter(p.getAttribute('data-pill'))));
      this._tiles.forEach(t => t.addEventListener('click', () => this._filter(t.getAttribute('data-cat'))));
    }

    _filter(key) {
      this._active = key;
      // pills
      this._pills.forEach(p => {
        const k = p.getAttribute('data-pill'), col = p.getAttribute('data-col'), on = k===key;
        p.classList.toggle('on', on);
        p.style.background = on ? col : '#fff';
        p.style.color = on ? '#fff' : '#3c4150';
        p.style.borderColor = on ? col : 'rgba(11,11,15,.1)';
        p.style.boxShadow = on ? '0 14px 30px -18px '+col : 'none';
        const dot = p.querySelector('.pdot'); if (dot) dot.style.background = on ? '#fff' : col;
      });
      // tiles
      this._tiles.forEach(t => {
        const match = key==='all' || t.getAttribute('data-cat')===key;
        t.classList.toggle('dim', !match);
        t.classList.toggle('hot', key!=='all' && match);
      });
      // caption
      const c = CATS[key];
      const n = key==='all' ? MODS.length : MODS.filter(m=>m.cat===key).length;
      this._cap.style.opacity = '0';
      clearTimeout(this._capT);
      this._capT = setTimeout(() => {
        this._cap.innerHTML = key==='all'
          ? `<b>14 個模組</b> · ${ALL_TAG}`
          : `<b style="color:${c.color};">${c.label} · ${n} 個模組</b> · ${c.tag}`;
        this._cap.style.opacity = '1';
      }, 160);
    }
  }

  if (!customElements.get('bs-module-bento')) customElements.define('bs-module-bento', ModuleBento);
})();
