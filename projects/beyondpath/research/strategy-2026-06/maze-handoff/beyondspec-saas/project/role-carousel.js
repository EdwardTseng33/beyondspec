// Self-contained role accordion web component.
// Six roles shown side-by-side as expanding vertical panels; hover or auto-cycle
// expands one into a full portrait + quote. Renders in shadow DOM (so nested
// <image-slot> persistence keeps working) and handles all interaction in plain JS.
(function () {
  const ROLES = [
    { fg: '#199a55', solid: '#199a55', title: '創辦人 / 產品經理', en: 'Founder / PM', quote: '我不知道這方向值不值得做,就埋頭做了半年。', tag: '產品力診斷', slotId: 'bs-role-1' },
    { fg: '#0f9d8e', solid: '#0f9d8e', title: '專案經理', en: 'Project Manager', quote: '進度散在 LINE、Excel、我腦袋裡,每天追到心累。', tag: '任務看板 + 專案', slotId: 'bs-role-2' },
    { fg: '#ff6b57', solid: '#ff6b57', title: '業務', en: 'Sales', quote: '客戶聊到哪、報價追到哪,全靠記性,漏掉就丟單。', tag: '客戶 CRM + 報價', slotId: 'bs-role-3' },
    { fg: '#7a5bff', solid: '#7a5bff', title: 'HR / 行政', en: 'People Ops', quote: '每月算薪、勞健保、排班,手動算到半夜。', tag: '算薪 + 出缺勤', slotId: 'bs-role-4' },
    { fg: '#d99500', solid: '#d99500', title: '財務 / 會計', en: 'Finance', quote: '錢到底收到了沒?月底對帳對到眼花。', tag: '收款管理', slotId: 'bs-role-5' },
    { fg: '#137a42', solid: '#137a42', title: '老闆', en: 'Owner', quote: '公司現在到底好不好,沒人能給我一個畫面。', tag: '營運戰情室', slotId: 'bs-role-6' },
  ];
  const PAD = (n) => String(n + 1).padStart(2, '0');
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const DUR = 4200;

  class RoleCarousel extends HTMLElement {
    connectedCallback() {
      if (this._built) { this._startTimer(); return; }
      this._built = true;
      this.style.display = 'block';
      const root = this.attachShadow({ mode: 'open' });

      const panels = ROLES.map((r, i) => {
        const on = i === 0;
        return `
        <div data-rc-panel="${i}" style="position:relative;flex-grow:${on ? 5 : 1};flex-basis:0;min-width:62px;border-radius:24px;overflow:hidden;cursor:pointer;transition:flex-grow .65s cubic-bezier(.16,.84,.44,1);">
          <image-slot id="${esc(r.slotId)}" shape="rounded" radius="24" placeholder="拖入人像照片" style="position:absolute;inset:0;width:100%;height:100%;"></image-slot>
          <div data-rc-fill style="position:absolute;inset:0;background:${r.solid};opacity:${on ? 0 : 1};transition:opacity .6s ease;pointer-events:none;"></div>
          <div data-rc-grad style="position:absolute;inset:0;background:linear-gradient(to top,rgba(16,15,10,.9) 6%,rgba(16,15,10,.34) 46%,transparent 78%);opacity:${on ? 1 : 0};transition:opacity .6s ease;pointer-events:none;"></div>

          <!-- collapsed face -->
          <div data-rc-coll style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:space-between;padding:16px 0;opacity:${on ? 0 : 1};transition:opacity .4s ease;pointer-events:none;">
            <div style="font-size:14px;font-weight:800;letter-spacing:.06em;color:rgba(255,255,255,.95);text-align:center;">${PAD(i)}</div>
            <div style="display:flex;justify-content:center;"><span style="writing-mode:vertical-rl;text-orientation:mixed;font-size:clamp(15px,1.6vw,18px);font-weight:800;letter-spacing:.08em;color:#fff;white-space:nowrap;">${esc(r.title)}</span></div>
            <div style="width:18px;height:3px;border-radius:99px;background:rgba(255,255,255,.55);margin:0 auto;"></div>
          </div>

          <!-- expanded face -->
          <div data-rc-exp style="position:absolute;inset:0;opacity:${on ? 1 : 0};transition:opacity .55s ease ${on ? '.12s' : '0s'};pointer-events:none;">
            <div style="position:absolute;left:24px;top:22px;display:flex;align-items:center;gap:10px;">
              <span style="font-size:13px;font-weight:800;letter-spacing:.14em;color:rgba(255,255,255,.92);background:rgba(255,255,255,.16);backdrop-filter:blur(6px);padding:6px 12px;border-radius:999px;">${PAD(i)}</span>
              <span style="display:inline-flex;align-items:center;font-size:13px;font-weight:800;color:#fff;background:${r.solid};padding:7px 14px;border-radius:999px;white-space:nowrap;">${esc(r.title)}</span>
              <span style="font-size:12px;font-weight:700;letter-spacing:.05em;color:rgba(255,255,255,.6);white-space:nowrap;">${esc(r.en)}</span>
            </div>
            <div style="position:absolute;left:24px;right:24px;bottom:26px;color:#fff;">
              <span style="display:block;width:32px;height:3px;border-radius:99px;background:#d4ec5b;margin-bottom:16px;"></span>
              <p style="font-size:clamp(19px,2.1vw,27px);line-height:1.4;font-weight:800;letter-spacing:-.01em;margin:0 0 18px;max-width:30ch;text-wrap:pretty;">「${esc(r.quote)}」</p>
              <span style="display:inline-flex;align-items:center;gap:7px;font-size:13.5px;font-weight:800;color:#15140e;background:#d4ec5b;padding:9px 16px;border-radius:999px;white-space:nowrap;"><span style="width:6px;height:6px;border-radius:50%;background:#15140e;"></span>${esc(r.tag)}</span>
            </div>
          </div>
        </div>`;
      }).join('');

      root.innerHTML = `
        <style>:host{display:block;font-family:'Plus Jakarta Sans','Noto Sans TC',sans-serif;}*{box-sizing:border-box;}</style>
        <div data-rc-track style="display:flex;gap:10px;height:clamp(420px,50vw,560px);max-width:1080px;margin:0 auto;">${panels}</div>`;

      this._track = root.querySelector('[data-rc-track]');
      this._panels = [...root.querySelectorAll('[data-rc-panel]')];
      this._active = 0;
      this._paused = false;

      this._panels.forEach((p, i) => {
        p.addEventListener('mouseenter', () => { this._paused = true; this._setActive(i); });
        p.addEventListener('click', () => { this._paused = true; this._setActive(i); });
      });
      this._track.addEventListener('mouseleave', () => {
        this._paused = false;
        clearTimeout(this._resumeT);
        this._resumeT = setTimeout(() => { if (!this._paused) this._setActive((this._active + 1) % ROLES.length); }, 600);
      });

      this._startTimer();
    }

    _startTimer() {
      clearInterval(this._timer);
      this._timer = setInterval(() => {
        if (this._paused) return;
        this._setActive((this._active + 1) % ROLES.length);
      }, DUR);
    }

    _setActive(n) {
      if (n === this._active && this._initDone) return;
      this._initDone = true;
      this._active = n;
      this._panels.forEach((p, i) => {
        const on = i === n;
        p.style.flexGrow = on ? '5' : '1';
        const fill = p.querySelector('[data-rc-fill]'); if (fill) fill.style.opacity = on ? '0' : '1';
        const grad = p.querySelector('[data-rc-grad]'); if (grad) grad.style.opacity = on ? '1' : '0';
        const coll = p.querySelector('[data-rc-coll]'); if (coll) coll.style.opacity = on ? '0' : '1';
        const exp = p.querySelector('[data-rc-exp]'); if (exp) { exp.style.opacity = on ? '1' : '0'; exp.style.transitionDelay = on ? '.12s' : '0s'; }
      });
    }

    disconnectedCallback() { clearInterval(this._timer); clearTimeout(this._resumeT); }
  }

  if (!customElements.get('bs-role-carousel')) customElements.define('bs-role-carousel', RoleCarousel);
})();
