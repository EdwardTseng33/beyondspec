/*!
 * BeyondPath DatePicker - 自動升級器 (Auto-Upgrader) v1.2.1
 * 自包含 JS + CSS。載入後自動把頁面所有 input[type=date] / [type=datetime-local]
 * 升級成漂亮日曆/時間選擇器：隱藏原生輸入、疊上自製 UI、選完寫回原 input.value
 * 並派發 input/change 事件，所以原本算薪邏輯讀得到值、零破壞。
 *
 * v1.1.0 新增：datetime-local 升級含「優雅時間選擇」(常用時刻 chip + 時/分雙滾輪
 * 24 小時制)，取代原生「12/56/下午」三欄盲調。寫回格式 yyyy-mm-ddThh:mm。
 *
 * v1.2.0 精修：① 年份改單欄可捲長清單(1950~今+5)+開啟自動置中當前年，遠年 1-2 下即達；
 * ② 時間欄加寬 208px + chip 改 2+1 grid + 時:分以等高 align-center 幾何對齊(解擠/歪)；
 * ③ 浮層改 position:fixed 純 viewport 座標(根治 transform/scroll 父層下彈飛 ~280px)，
 *    桌面也加淡 backdrop + 鎖背景捲動。全程吃既有 token，零破壞算薪邏輯。
 *
 * 用法：
 *   <script src="shared/datepicker.js"></script>
 *   <script>BDPicker.init();</script>
 *
 * 配色全吃頁面 CSS 變數 (--primary / --bg-card / --ink ...)，暗色 [data-theme=dark] 自動跟。
 * 純 ES5 寫法 (var / function)，Safari 13 相容。
 */
(function (global) {
  "use strict";

  if (global.BDPicker) { return; }

  var WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
  var STYLE_ID = "bdp-style";
  var openInstance = null;

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  // v1.2.2 robust「顯示動畫」啟動：不單靠 requestAnimationFrame。
  // 背景分頁 / 重載 / 截圖等情境 rAF 會被節流甚至凍結 → bdp-show 永遠加不上去
  // → 浮層卡在 opacity:0 半透明、底層內容透出疊在一起（女巫 Gate 1 CRITICAL 根因）。
  // 解法：先強制 reflow，再用「雙 rAF + setTimeout 兌底」三保險加上 class，任一管道生效即可。
  function applyShow(el) {
    if (!el) { return; }
    /* eslint-disable no-unused-expressions */
    el.offsetHeight; // 強制 reflow，讓初始 opacity:0 先落地，後續加 class 才有 transition
    var done = false;
    function go() {
      if (done || !el) { return; }
      done = true;
      el.classList.add("bdp-show");
    }
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(function () { requestAnimationFrame(go); });
    }
    // 兌底：rAF 被節流 / 凍結時，計時器仍會在前景化後立即補上（且 50ms 後保證執行）
    setTimeout(go, 50);
  }

  // 解析 yyyy-mm-dd 或 yyyy-mm-ddThh:mm。含時間者帶回時分
  function parseISO(str) {
    if (!str) { return null; }
    var m = String(str).match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
    if (!m) { return null; }
    var hh = m[4] != null ? parseInt(m[4], 10) : 0;
    var mm = m[5] != null ? parseInt(m[5], 10) : 0;
    var d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10), hh, mm);
    if (isNaN(d.getTime())) { return null; }
    return d;
  }

  function toISO(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  // 含時間 ISO：對齊 app.js localDatetimeValue，避免 new Date() NaN
  function toISODT(d) {
    return toISO(d) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function fmtDisplay(d) {
    // v1.2.2 較精簡格式（去全形括號）→ 兩個日期欄並排時不易被截斷（女巫 + 多位試用者反映「週幾」被切掉）
    return d.getFullYear() + " 年 " + (d.getMonth() + 1) + " 月 " + d.getDate() + " 日 週" + WEEKDAYS[d.getDay()];
  }

  function fmtDisplayDT(d) {
    return fmtDisplay(d) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  // 解析 min/max 屬性 → Date（含時間）
  function parseBound(str) { return parseISO(str); }

  // d 是否早於某日界線 (僅比日)
  function dayBefore(d, bound) {
    if (!bound) { return false; }
    var a = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var b = new Date(bound.getFullYear(), bound.getMonth(), bound.getDate());
    return a.getTime() < b.getTime();
  }
  function dayAfter(d, bound) {
    if (!bound) { return false; }
    var a = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var b = new Date(bound.getFullYear(), bound.getMonth(), bound.getDate());
    return a.getTime() > b.getTime();
  }

  function fireEvents(input) {
    var ev1, ev2;
    try {
      ev1 = new Event("input", { bubbles: true });
      ev2 = new Event("change", { bubbles: true });
    } catch (e) {
      ev1 = document.createEvent("HTMLEvents"); ev1.initEvent("input", true, false);
      ev2 = document.createEvent("HTMLEvents"); ev2.initEvent("change", true, false);
    }
    input.dispatchEvent(ev1);
    input.dispatchEvent(ev2);
  }

  /* ---------- CSS 注入 (吃頁面 CSS 變數，暗色自動跟) ---------- */
  function injectCSS() {
    if (document.getElementById(STYLE_ID)) { return; }
    var css = [
      ".bdp-field{",
      "  display:inline-flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;",
      "  min-height:42px;padding:9px 12px;cursor:pointer;text-align:left;",
      "  font:inherit;font-size:var(--text-body,14px);color:var(--ink,#111122);",
      "  background:var(--bg-input,#fff);border:1px solid var(--border,#E2E2EA);",
      "  border-radius:var(--r-sm,10px);transition:border-color .15s,box-shadow .15s;",
      "  -webkit-user-select:none;user-select:none;}",
      ".bdp-field:hover{border-color:var(--border-hover,#CCCCD6);}",
      ".bdp-field.bdp-open,.bdp-field:focus-visible,.bdp-field:focus{",
      "  outline:none;border-color:var(--primary,#7C5CFC);",
      "  box-shadow:0 0 0 3px var(--primary-light,rgba(124,92,252,.14));}",
      ".bdp-field .bdp-val{flex:1 1 auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
      ".bdp-field .bdp-val.bdp-empty{color:var(--ink-placeholder,#9999AA);}",
      ".bdp-field .bdp-ico{flex:0 0 auto;width:18px;height:18px;color:var(--ink-muted,#66667A);}",
      ".bdp-field:hover .bdp-ico,.bdp-field.bdp-open .bdp-ico{color:var(--primary,#7C5CFC);}",
      ".bdp-native{position:absolute!important;opacity:0!important;width:1px!important;height:1px!important;",
      "  padding:0!important;margin:-1px!important;border:0!important;overflow:hidden!important;",
      "  clip:rect(0 0 0 0)!important;pointer-events:none!important;}",
      // v1.2.2 CRITICAL 根治：移除「進場 opacity/transform 動畫」。',
      // 任何 time-based 動畫(animation/transition/rAF)在背景分頁 / 截圖 / 凍結時會卡在初幀(opacity:0)，',
      // 導致浮層半透明、底層內容透出疊在一起(女巫 Gate 1 頭號 blocker)。',
      // 改為瞬時顯示(opacity:1, transform:none)，永遠完整可讀；犧牲 160ms 淡入換取絕對穩定，值得。',
      ".bdp-pop{position:fixed;z-index:99999;box-sizing:border-box;padding:14px;",
      "  background-color:var(--bg-app,#F5F5F8);",
      "  background-image:linear-gradient(var(--bg-card,#fff),var(--bg-card,#fff));",
      "  border:1px solid var(--border,#E2E2EA);",
      "  border-radius:var(--r-md,14px);box-shadow:var(--shadow-xl,0 12px 40px rgba(0,0,0,.10));",
      "  font-size:var(--text-body,14px);color:var(--ink,#111122);",
      "  opacity:1;transform:none;transform-origin:top center;}",
      // 進場動畫只掛在 .bdp-show（applyShow 會加）。沒加到 = 維持 base 完整可見（opacity:1）→ throttle/凍結也不會半透明",
      ".bdp-pop.bdp-show{opacity:1;transform:none;}",
      ".bdp-pop.bdp-has-time{width:auto;}",
      ".bdp-body{display:flex;gap:14px;align-items:stretch;}",
      ".bdp-cal-wrap{width:312px;flex:0 0 auto;}",
      ".bdp-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}",
      ".bdp-title{flex:1;text-align:center;font-weight:var(--fw-title,700);font-size:var(--text-card-title,15px);",
      "  color:var(--ink,#111122);cursor:pointer;padding:6px 8px;border-radius:var(--r-sm,10px);",
      "  transition:background .12s;-webkit-user-select:none;user-select:none;}",
      ".bdp-title:hover{background:var(--bg-hover,#E8E8EC);}",
      ".bdp-nav{flex:0 0 auto;width:34px;height:34px;display:flex;align-items:center;justify-content:center;",
      "  border:none;background:transparent;border-radius:var(--r-sm,10px);cursor:pointer;",
      "  color:var(--ink-sec,#44445E);transition:background .12s,color .12s;}",
      ".bdp-nav:hover{background:var(--bg-hover,#E8E8EC);color:var(--primary,#7C5CFC);}",
      ".bdp-nav svg{width:18px;height:18px;}",
      ".bdp-nav:disabled{opacity:.3;cursor:default;}"
    ].join("\n");
    var styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    styleEl.type = "text/css";
    styleEl.appendChild(document.createTextNode(css + "\n" + injectCSS2() + "\n" + injectCSS3()));
    (document.head || document.documentElement).appendChild(styleEl);
  }

  function injectCSS2() {
    return [
      ".bdp-wk{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px;}",
      ".bdp-wk span{text-align:center;font-size:var(--text-micro,11px);font-weight:600;",
      "  color:var(--ink-muted,#66667A);padding:6px 0;}",
      ".bdp-wk span.bdp-wend{color:var(--rose,#C76B7A);}",
      ".bdp-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;}",
      ".bdp-day{aspect-ratio:1/1;min-height:38px;display:flex;align-items:center;justify-content:center;",
      "  border:none;background:transparent;border-radius:var(--r-sm,10px);cursor:pointer;",
      "  font:inherit;font-size:var(--text-body,14px);color:var(--ink,#111122);",
      "  transition:background .12s,color .12s;position:relative;}",
      ".bdp-day:hover{background:var(--primary-light,rgba(124,92,252,.14));}",
      ".bdp-day.bdp-out{color:var(--ink-dim,#9999AA);}",
      ".bdp-day.bdp-wend{color:var(--rose,#C76B7A);}",
      ".bdp-day.bdp-today{font-weight:700;}",
      ".bdp-day.bdp-today::after{content:'';position:absolute;bottom:5px;left:50%;transform:translateX(-50%);",
      "  width:4px;height:4px;border-radius:50%;background:var(--primary,#7C5CFC);}",
      ".bdp-day.bdp-sel{background:var(--primary,#7C5CFC);color:#fff;font-weight:700;}",
      ".bdp-day.bdp-sel::after{background:#fff;}",
      ".bdp-day.bdp-sel:hover{background:var(--primary-hover,#6A4BE8);}",
      ".bdp-day.bdp-disabled{color:var(--ink-dim,#9999AA);cursor:not-allowed;opacity:.45;}",
      ".bdp-day.bdp-disabled:hover{background:transparent;}",
      "/* disabled 壓過週末色：未來週末日統一轉灰，不留淡紅模糊態（女巫色彩 med） */",
      ".bdp-day.bdp-disabled.bdp-wend{color:var(--ink-dim,#9999AA);}",
      ".bdp-day:focus-visible{outline:2px solid var(--primary,#7C5CFC);outline-offset:-2px;}",
      ".bdp-ft{display:flex;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border,#E2E2EA);}",
      ".bdp-btn{flex:1;padding:9px 12px;border-radius:var(--r-sm,10px);cursor:pointer;font:inherit;",
      "  font-size:var(--text-caption,13px);font-weight:600;transition:background .12s,border-color .12s;}",
      ".bdp-btn-clear{background:transparent;border:1px solid var(--border,#E2E2EA);color:var(--ink-sec,#44445E);}",
      ".bdp-btn-clear:hover{background:var(--bg-hover,#E8E8EC);border-color:var(--border-hover,#CCCCD6);}",
      ".bdp-btn-today{background:transparent;border:1px solid var(--border,#E2E2EA);color:var(--ink-sec,#44445E);}",
      ".bdp-btn-today:hover{background:var(--bg-hover,#E8E8EC);border-color:var(--border-hover,#CCCCD6);}",
      ".bdp-btn-ok{background:var(--primary,#7C5CFC);border:1px solid var(--primary,#7C5CFC);color:#fff;}",
      ".bdp-btn-ok:hover{background:var(--primary-hover,#6A4BE8);}",
      ".bdp-pick{display:none;}",
      ".bdp-pop.bdp-mode-y .bdp-cal,.bdp-pop.bdp-mode-m .bdp-cal{display:none;}",
      ".bdp-pop.bdp-mode-y .bdp-pick-y,.bdp-pop.bdp-mode-m .bdp-pick-m{display:block;}",
      ".bdp-pick-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;max-height:230px;overflow:auto;}",
      ".bdp-pick-cell{padding:11px 4px;text-align:center;border:none;background:transparent;cursor:pointer;",
      "  border-radius:var(--r-sm,10px);font:inherit;font-size:var(--text-caption,13px);color:var(--ink,#111122);",
      "  transition:background .12s,color .12s;}",
      ".bdp-pick-cell:hover{background:var(--primary-light,rgba(124,92,252,.14));}",
      ".bdp-pick-cell.bdp-cur{background:var(--primary,#7C5CFC);color:#fff;font-weight:700;}",
      "/* v1.2 年份單欄長清單：雙 class 後代特異度勝原 .bdp-pick-grid 單 class grid，只覆寫年那份 */",
      ".bdp-pick-y .bdp-pick-grid{display:block;grid-template-columns:none;max-height:264px;",
      "  overflow-y:auto;-webkit-overflow-scrolling:touch;padding:2px;}",
      ".bdp-pick-y .bdp-pick-cell{display:block;width:100%;padding:11px 4px;text-align:center;",
      "  font-size:var(--text-body,14px);border-radius:var(--r-sm,10px);}",
      ".bdp-pick-y .bdp-pick-cell.bdp-cur{background:var(--primary,#7C5CFC);color:#fff;font-weight:700;}",
      // v1.2.2 backdrop 預設即可見（opacity:1）+ @keyframes 淡入，不靠 JS 加 class（throttle-proof）",
      ".bdp-backdrop{position:fixed;inset:0;z-index:99998;background:var(--bg-overlay,rgba(0,0,0,.45));",
      "  opacity:1;}",
      ".bdp-backdrop.bdp-show{opacity:1;}",
      "@media (max-width:480px){",
      "  .bdp-pop{position:fixed!important;left:0!important;right:0!important;bottom:0!important;top:auto!important;",
      "    width:100%!important;border-radius:var(--r-xl,24px) var(--r-xl,24px) 0 0;padding:18px 16px 24px;",
      "    transform:none;transform-origin:bottom center;max-height:92vh;overflow-y:auto;}",
      "  .bdp-pop.bdp-show{transform:none;}",
      "  .bdp-body{flex-direction:column;gap:0;}",
      "  .bdp-cal-wrap{width:100%;}",
      "  .bdp-day{min-height:44px;}",
      "  .bdp-nav{width:44px;height:44px;}",
      "  .bdp-btn{padding:13px 12px;}",
      "  .bdp-pick-y .bdp-pick-grid{max-height:320px;}",
      "  .bdp-pick-y .bdp-pick-cell{padding:14px 4px;min-height:48px;}",
      "  .bdp-grab{width:36px;height:4px;border-radius:2px;background:var(--border-hover,#CCCCD6);",
      "    margin:0 auto 14px;}",
      "}",
      "@media (min-width:481px){.bdp-grab{display:none;}",
      "  .bdp-backdrop{background:rgba(17,17,34,.32);}}"
    ].join("\n");
  }

  /* ---------- 時間層 CSS (v1.2 拉開呼吸 + 時:分置中對齊，全吃 token) ---------- */
  function injectCSS3() {
    return [
      ".bdp-time{flex:0 0 auto;width:208px;display:flex;flex-direction:column;",
      "  border-left:1px solid var(--border,#E2E2EA);padding-left:18px;}",
      ".bdp-time-hd{font-size:var(--text-micro,11px);font-weight:600;color:var(--ink-muted,#66667A);",
      "  margin-bottom:12px;text-align:center;letter-spacing:.04em;}",
      ".bdp-chips{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;}",
      ".bdp-chip{min-height:38px;padding:8px 6px;border-radius:var(--r-sm,10px);",
      "  border:1px solid var(--border,#E2E2EA);background:transparent;cursor:pointer;font:inherit;",
      "  font-size:var(--text-caption,13px);font-weight:600;color:var(--ink-sec,#44445E);",
      "  display:flex;align-items:center;justify-content:center;white-space:nowrap;",
      "  transition:border-color .12s,background .12s,color .12s;}",
      ".bdp-chip-now{grid-column:1 / -1;}",
      ".bdp-chip:hover{border-color:var(--primary,#7C5CFC);color:var(--primary,#7C5CFC);}",
      ".bdp-chip.bdp-chip-on{background:var(--primary,#7C5CFC);border-color:var(--primary,#7C5CFC);color:#fff;}",
      ".bdp-wheels{display:flex;align-items:center;justify-content:center;gap:6px;position:relative;",
      "  flex:1 1 auto;padding:4px 0;}",
      ".bdp-wheel{position:relative;width:64px;height:132px;overflow:hidden;border-radius:var(--r-md,14px);",
      "  background:var(--bg-input,#fff);border:1px solid var(--border,#E2E2EA);}",
      ".bdp-wheel:focus-visible{outline:2px solid var(--primary,#7C5CFC);outline-offset:1px;}",
      ".bdp-wheel-band{position:absolute;left:0;right:0;top:44px;height:44px;pointer-events:none;",
      "  border-top:1px solid var(--primary-light,rgba(124,92,252,.3));",
      "  border-bottom:1px solid var(--primary-light,rgba(124,92,252,.3));background:rgba(124,92,252,.06);}",
      "/* 滾輪上下漸層遮罩：暗示可上下滾還有更多數字（女巫可發現性 med · 桌面尤其） */",
      ".bdp-wheel::before,.bdp-wheel::after{content:'';position:absolute;left:0;right:0;height:40px;",
      "  pointer-events:none;z-index:2;}",
      ".bdp-wheel::before{top:0;background:linear-gradient(to bottom,var(--bg-input,#fff),rgba(255,255,255,0));}",
      ".bdp-wheel::after{bottom:0;background:linear-gradient(to top,var(--bg-input,#fff),rgba(255,255,255,0));}",
      "/* 暗色：fade 用暗底色（rgba 透明端對齊深色，免出現白邊） */",
      "[data-theme=\"dark\"] .bdp-wheel::before{background:linear-gradient(to bottom,var(--bg-input,#13131C),rgba(19,19,28,0));}",
      "[data-theme=\"dark\"] .bdp-wheel::after{background:linear-gradient(to top,var(--bg-input,#13131C),rgba(19,19,28,0));}",
      ".bdp-wheel-list{position:absolute;left:0;right:0;top:0;transition:transform .18s var(--ease-out,cubic-bezier(.4,0,.2,1));}",
      ".bdp-wheel-item{height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;",
      "  font-size:var(--text-body,14px);color:var(--ink-dim,#9999AA);transition:color .15s,font-size .15s,opacity .15s;",
      "  -webkit-user-select:none;user-select:none;}",
      ".bdp-wheel-item.bdp-w-sel{font-size:var(--text-lg,22px);font-weight:700;color:var(--primary,#7C5CFC);}",
      ".bdp-wheel-item.bdp-w-near{color:var(--ink-sec,#44445E);font-size:15px;}",
      ".bdp-wheel-item.bdp-w-dis{color:var(--ink-dim,#9999AA);opacity:.35;cursor:not-allowed;}",
      ".bdp-colon{display:flex;align-items:center;justify-content:center;height:132px;width:18px;",
      "  font-size:var(--text-lg,22px);line-height:1;color:var(--ink-muted,#66667A);font-weight:700;",
      "  flex:0 0 auto;transform:translateY(-1px);}",
      "@media (max-width:480px){",
      "  .bdp-time{width:100%;border-left:none;border-top:1px solid var(--border,#E2E2EA);",
      "    padding-left:0;padding-top:16px;margin-top:16px;}",
      "  .bdp-chip{min-height:46px;}",
      "  .bdp-chips{gap:10px;margin-bottom:16px;}",
      "  .bdp-wheels{gap:10px;padding:8px 0;}",
      "  .bdp-wheel{width:72px;}",
      "  .bdp-colon{width:22px;}",
      "  .bdp-wheel-item{cursor:pointer;}",
      "}"
    ].join("\n");
  }

  /* ---------- SVG icons ---------- */
  var ICO_CAL = "<svg class='bdp-ico' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='4' width='18' height='18' rx='2'/><line x1='16' y1='2' x2='16' y2='6'/><line x1='8' y1='2' x2='8' y2='6'/><line x1='3' y1='10' x2='21' y2='10'/></svg>";
  var ICO_CLK = "<svg class='bdp-ico' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='9'/><polyline points='12 7 12 12 15 14'/></svg>";
  var ICO_PREV = "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='15 18 9 12 15 6'/></svg>";
  var ICO_NEXT = "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='9 18 15 12 9 6'/></svg>";

  /* ---------- 升級單一 input ---------- */
  function upgrade(input) {
    if (input.getAttribute("data-bdp") === "1") { return; }
    input.setAttribute("data-bdp", "1");
    input.classList.add("bdp-native");
    input.setAttribute("tabindex", "-1");
    input.setAttribute("aria-hidden", "true");

    var hasTime = (input.type === "datetime-local");

    var field = document.createElement("button");
    field.type = "button";
    field.className = "bdp-field";
    field.setAttribute("aria-haspopup", "dialog");
    var valSpan = document.createElement("span");
    valSpan.className = "bdp-val";
    field.appendChild(valSpan);
    field.insertAdjacentHTML("beforeend", hasTime ? ICO_CLK : ICO_CAL);

    if (input.nextSibling) {
      input.parentNode.insertBefore(field, input.nextSibling);
    } else {
      input.parentNode.appendChild(field);
    }

    var inst = {
      input: input,
      field: field,
      valSpan: valSpan,
      hasTime: hasTime,
      pop: null,
      backdrop: null,
      view: null,
      selected: null,
      hour: 9,
      minute: 0,
      isOpen: false
    };

    function readBounds() {
      inst.min = parseBound(input.getAttribute("min"));
      inst.max = parseBound(input.getAttribute("max"));
    }
    readBounds();
    inst.readBounds = readBounds;

    function syncDisplay() {
      var d = parseISO(input.value);
      inst.selected = d;
      if (d) {
        if (hasTime) {
          inst.hour = d.getHours();
          inst.minute = d.getMinutes();
          valSpan.textContent = fmtDisplayDT(d);
        } else {
          valSpan.textContent = fmtDisplay(d);
        }
        valSpan.classList.remove("bdp-empty");
      } else {
        valSpan.textContent = input.getAttribute("data-placeholder") || (hasTime ? "選擇日期與時間" : "選擇日期");
        valSpan.classList.add("bdp-empty");
      }
    }
    syncDisplay();
    inst.syncDisplay = syncDisplay;

    input.addEventListener("change", function () { if (!inst.isOpen) { readBounds(); syncDisplay(); } });

    field.addEventListener("click", function (e) { e.preventDefault(); toggle(inst); });
    field.addEventListener("keydown", function (e) {
      var k = e.key;
      if (k === "Enter" || k === " " || k === "ArrowDown") { e.preventDefault(); open(inst); }
    });

    input._bdp = inst;
    return inst;
  }

  /* ---------- 建浮層 DOM ---------- */
  function buildPop(inst) {
    var pop = document.createElement("div");
    pop.className = "bdp-pop" + (inst.hasTime ? " bdp-has-time" : "");
    pop.setAttribute("role", "dialog");
    pop.setAttribute("aria-label", inst.hasTime ? "選擇日期與時間" : "選擇日期");

    var html = "";
    html += "<div class='bdp-grab'></div>";
    html += "<div class='bdp-body'>";
    html += "<div class='bdp-cal-wrap'>";
    html += "<div class='bdp-hd'>";
    html += "<button type='button' class='bdp-nav bdp-prev' aria-label='上個月'>" + ICO_PREV + "</button>";
    html += "<div class='bdp-title' tabindex='0' role='button' aria-label='選擇年月'></div>";
    html += "<button type='button' class='bdp-nav bdp-next' aria-label='下個月'>" + ICO_NEXT + "</button>";
    html += "</div>";
    html += "<div class='bdp-cal'>";
    html += "<div class='bdp-wk'></div>";
    html += "<div class='bdp-grid' role='grid'></div>";
    html += "</div>";
    html += "<div class='bdp-pick bdp-pick-y'><div class='bdp-pick-grid'></div></div>";
    html += "<div class='bdp-pick bdp-pick-m'><div class='bdp-pick-grid'></div></div>";
    html += "</div>"; // /cal-wrap
    if (inst.hasTime) {
      html += "<div class='bdp-time'>";
      html += "<div class='bdp-time-hd'>時間（24 小時制）</div>";
      html += "<div class='bdp-chips'>";
      html += "<button type='button' class='bdp-chip' data-h='9' data-m='0'>上班 09:00</button>";
      html += "<button type='button' class='bdp-chip' data-h='18' data-m='0'>下班 18:00</button>";
      html += "<button type='button' class='bdp-chip bdp-chip-now'>現在</button>";
      html += "</div>";
      html += "<div class='bdp-wheels'>";
      html += "<div class='bdp-wheel bdp-wheel-h' tabindex='0' role='spinbutton' aria-label='時'>";
      html += "<div class='bdp-wheel-band'></div><div class='bdp-wheel-list'></div></div>";
      html += "<div class='bdp-colon'>:</div>";
      html += "<div class='bdp-wheel bdp-wheel-m' tabindex='0' role='spinbutton' aria-label='分'>";
      html += "<div class='bdp-wheel-band'></div><div class='bdp-wheel-list'></div></div>";
      html += "</div>";
      html += "</div>"; // /time
    }
    html += "</div>"; // /body
    html += "<div class='bdp-ft'>";
    html += "<button type='button' class='bdp-btn bdp-btn-clear'>清除</button>";
    html += "<button type='button' class='bdp-btn bdp-btn-today'>今天</button>";
    if (inst.hasTime) {
      html += "<button type='button' class='bdp-btn bdp-btn-ok'>確定</button>";
    }
    html += "</div>";
    pop.innerHTML = html;

    var wk = pop.querySelector(".bdp-wk");
    for (var i = 0; i < 7; i++) {
      var sp = document.createElement("span");
      sp.textContent = WEEKDAYS[i];
      if (i === 0 || i === 6) { sp.className = "bdp-wend"; }
      wk.appendChild(sp);
    }

    inst.pop = pop;
    inst.elTitle = pop.querySelector(".bdp-title");
    inst.elGrid = pop.querySelector(".bdp-grid");
    inst.elPrev = pop.querySelector(".bdp-prev");
    inst.elNext = pop.querySelector(".bdp-next");

    // v1.2.2 導覽改 mode-aware：日曆模式翻月、月份模式翻年、年份模式翻一頁年（不再固定 shiftMonth 亂跳）
    inst.elPrev.addEventListener("click", function (e) { e.preventDefault(); navStep(inst, -1); });
    inst.elNext.addEventListener("click", function (e) { e.preventDefault(); navStep(inst, 1); });
    // v1.2.2 標題點擊 = 逐級放大（日→月→年），單一 handler（移除 render/renderMonthPick 內重複 onclick 綁定，根治「點標題直接選日期關閉 / 直跳年份」）
    inst.elTitle.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); cycleMode(inst); });
    inst.elTitle.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); cycleMode(inst); }
    });
    pop.querySelector(".bdp-btn-clear").addEventListener("click", function (e) {
      e.preventDefault(); pickClear(inst);
    });
    pop.querySelector(".bdp-btn-today").addEventListener("click", function (e) {
      e.preventDefault(); jumpToday(inst);
    });
    if (inst.hasTime) { buildTimeEvents(inst); }
    pop.addEventListener("keydown", function (e) { onPopKey(inst, e); });

    return pop;
  }

  /* ---------- 時間滾輪 (時/分 24h，含 max 未來約束) ---------- */
  // 選定日是否 = max 同一天 (需限制時分不超過 max)
  function maxSameDayAsSel(inst) {
    if (!inst.max || !inst.selected) { return false; }
    return sameDay(inst.selected, inst.max);
  }
  // 某 (h,m) 在選定日是否超過 max → 不可選
  function timeOverMax(inst, h, m) {
    if (!maxSameDayAsSel(inst)) { return false; }
    var mh = inst.max.getHours(), mm = inst.max.getMinutes();
    if (h > mh) { return true; }
    if (h === mh && m > mm) { return true; }
    return false;
  }

  function renderWheel(inst, kind) {
    var isH = (kind === "h");
    var listEl = inst.pop.querySelector(isH ? ".bdp-wheel-h .bdp-wheel-list" : ".bdp-wheel-m .bdp-wheel-list");
    var count = isH ? 24 : 60;
    var cur = isH ? inst.hour : inst.minute;
    listEl.innerHTML = "";
    for (var i = 0; i < count; i++) {
      var it = document.createElement("div");
      it.className = "bdp-wheel-item";
      it.textContent = pad(i);
      it.setAttribute("data-v", i);
      var dis = isH ? timeOverMax(inst, i, 0) : timeOverMax(inst, inst.hour, i);
      if (i === cur) { it.className += " bdp-w-sel"; }
      else if (i === cur - 1 || i === cur + 1) { it.className += " bdp-w-near"; }
      if (dis) { it.className += " bdp-w-dis"; }
      (function (v, disabled) {
        it.addEventListener("click", function () {
          if (disabled) { return; }
          if (isH) { setTime(inst, v, inst.minute); } else { setTime(inst, inst.hour, v); }
        });
      })(i, dis);
      listEl.appendChild(it);
    }
    // 置中選中行：每行 44px，band 在 top 44，list 平移使選中對齊 band
    listEl.style.transform = "translateY(" + (44 - cur * 44) + "px)";
  }

  function renderWheels(inst) {
    renderWheel(inst, "h");
    renderWheel(inst, "m");
    syncChips(inst);
  }

  function setTime(inst, h, m) {
    // 約束 max：若超過則夾到 max
    if (maxSameDayAsSel(inst)) {
      var mh = inst.max.getHours(), mm = inst.max.getMinutes();
      if (h > mh || (h === mh && m > mm)) { h = mh; m = mm; }
    }
    inst.hour = h; inst.minute = m;
    renderWheels(inst);
  }

  function syncChips(inst) {
    var chips = inst.pop.querySelectorAll(".bdp-chip");
    for (var i = 0; i < chips.length; i++) {
      var c = chips[i];
      if (c.className.indexOf("bdp-chip-now") >= 0) { c.className = c.className.replace(" bdp-chip-on", ""); continue; }
      var ch = parseInt(c.getAttribute("data-h"), 10);
      var cm = parseInt(c.getAttribute("data-m"), 10);
      if (ch === inst.hour && cm === inst.minute) {
        if (c.className.indexOf("bdp-chip-on") < 0) { c.className += " bdp-chip-on"; }
      } else {
        c.className = c.className.replace(" bdp-chip-on", "");
      }
    }
  }

  function buildTimeEvents(inst) {
    var chips = inst.pop.querySelectorAll(".bdp-chip");
    for (var i = 0; i < chips.length; i++) {
      (function (c) {
        c.addEventListener("click", function (e) {
          e.preventDefault();
          if (c.className.indexOf("bdp-chip-now") >= 0) {
            var now = new Date();
            if (!inst.selected) { selectDay(inst, new Date(now.getFullYear(), now.getMonth(), now.getDate())); }
            setTime(inst, now.getHours(), now.getMinutes());
          } else {
            setTime(inst, parseInt(c.getAttribute("data-h"), 10), parseInt(c.getAttribute("data-m"), 10));
          }
        });
      })(chips[i]);
    }
    // 滾輪：滑鼠滾輪上下捲
    bindWheelScroll(inst, ".bdp-wheel-h", "h");
    bindWheelScroll(inst, ".bdp-wheel-m", "m");
  }

  function bindWheelScroll(inst, sel, kind) {
    var w = inst.pop.querySelector(sel);
    w.addEventListener("wheel", function (e) {
      e.preventDefault();
      var dir = e.deltaY > 0 ? 1 : -1;
      stepWheel(inst, kind, dir);
    }, { passive: false });
    w.addEventListener("keydown", function (e) {
      if (e.key === "ArrowUp") { e.preventDefault(); stepWheel(inst, kind, -1); }
      else if (e.key === "ArrowDown") { e.preventDefault(); stepWheel(inst, kind, 1); }
    });
  }

  function stepWheel(inst, kind, dir) {
    if (kind === "h") {
      var h = (inst.hour + dir + 24) % 24;
      setTime(inst, h, inst.minute);
    } else {
      var m = (inst.minute + dir + 60) % 60;
      setTime(inst, inst.hour, m);
    }
  }

  /* ---------- 渲染日曆主體 (含 min/max disabled) ---------- */
  function dayDisabled(inst, d) {
    return dayBefore(d, inst.min) || dayAfter(d, inst.max);
  }

  function render(inst) {
    var view = inst.view;
    var y = view.getFullYear(), mo = view.getMonth();
    inst.elTitle.textContent = y + " 年 " + (mo + 1) + " 月";
    // v1.2.2 不再於此處重綁 onclick（標題 click 由 buildPop 單一 addEventListener 處理 cycleMode）

    var first = new Date(y, mo, 1);
    var startDow = first.getDay();
    var gridStart = new Date(y, mo, 1 - startDow);
    var today = new Date();

    var grid = inst.elGrid;
    grid.innerHTML = "";
    for (var i = 0; i < 42; i++) {
      var d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "bdp-day";
      btn.textContent = d.getDate();
      btn.setAttribute("data-iso", toISO(d));
      btn.setAttribute("tabindex", "-1");
      var dow = d.getDay();
      var dis = dayDisabled(inst, d);
      if (d.getMonth() !== mo) { btn.className += " bdp-out"; }
      if (dow === 0 || dow === 6) { btn.className += " bdp-wend"; }
      if (sameDay(d, today)) { btn.className += " bdp-today"; }
      if (dis) {
        btn.className += " bdp-disabled";
        btn.setAttribute("aria-disabled", "true");
      }
      if (inst.selected && sameDay(d, inst.selected)) {
        btn.className += " bdp-sel";
        btn.setAttribute("tabindex", "0");
        btn.setAttribute("aria-selected", "true");
      }
      (function (dd, disabled) {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          if (disabled) { return; }
          onDayClick(inst, dd);
        });
      })(d, dis);
      grid.appendChild(btn);
    }
    if (!grid.querySelector(".bdp-day[tabindex='0']")) {
      var t = grid.querySelector(".bdp-today:not(.bdp-disabled)") ||
              grid.querySelector(".bdp-day:not(.bdp-out):not(.bdp-disabled)");
      if (t) { t.setAttribute("tabindex", "0"); }
    }
  }

  function shiftMonth(inst, delta) {
    inst.view = new Date(inst.view.getFullYear(), inst.view.getMonth() + delta, 1);
    render(inst);
  }

  /* ---------- 年月快速選擇（v1.2.2 乾淨狀態機：日 → 月 → 年，導覽與標題單一真相） ---------- */
  // 目前模式：'d' 日曆 / 'm' 月份 / 'y' 年份
  function currentMode(inst) {
    var cl = inst.pop.classList;
    if (cl.contains("bdp-mode-y")) { return "y"; }
    if (cl.contains("bdp-mode-m")) { return "m"; }
    return "d";
  }

  // 統一設定模式（classList，避免字串拼接重複 class / regex 漏字）
  function setMode(inst, mode) {
    var cl = inst.pop.classList;
    cl.remove("bdp-mode-m");
    cl.remove("bdp-mode-y");
    if (mode === "m") { cl.add("bdp-mode-m"); renderMonthPick(inst); }
    else if (mode === "y") { cl.add("bdp-mode-y"); renderYearPick(inst); }
    else { render(inst); } // 回日曆
    syncTitle(inst);
  }

  // 保留舊名（鍵盤等呼叫點），但語義改為「切到該模式」而非 toggle，避免重複點擊抵消
  function toggleMode(inst, mode) { setMode(inst, mode); }

  // 標題點擊：逐級放大 日→月→年；年模式再點則收回日曆。單一入口，根治雙 handler 衝突
  function cycleMode(inst) {
    var m = currentMode(inst);
    if (m === "d") { setMode(inst, "m"); }
    else if (m === "m") { setMode(inst, "y"); }
    else { setMode(inst, "d"); }
  }

  // 依目前模式更新標題文字（年/月模式只顯示年；日模式顯示年+月）
  function syncTitle(inst) {
    var y = inst.view.getFullYear(), mo = inst.view.getMonth();
    var m = currentMode(inst);
    if (m === "d") { inst.elTitle.textContent = y + " 年 " + (mo + 1) + " 月"; }
    else { inst.elTitle.textContent = y + " 年"; }
  }

  // 導覽箭頭：mode-aware。日→翻月、月→翻年、年→翻一頁年（12 年），不再固定 shiftMonth 亂跳
  function navStep(inst, dir) {
    var m = currentMode(inst);
    if (m === "d") {
      inst.view = new Date(inst.view.getFullYear(), inst.view.getMonth() + dir, 1);
      render(inst);
      syncTitle(inst);
    } else if (m === "m") {
      inst.view = new Date(inst.view.getFullYear() + dir, inst.view.getMonth(), 1);
      renderMonthPick(inst);
      syncTitle(inst);
    } else { // year list：翻一頁（12 年），重繪並把當前頁置中
      inst.view = new Date(inst.view.getFullYear() + dir * 12, inst.view.getMonth(), 1);
      renderYearPick(inst);
      syncTitle(inst);
    }
  }

  function shiftMonth(inst, delta) {
    inst.view = new Date(inst.view.getFullYear(), inst.view.getMonth() + delta, 1);
    render(inst);
    syncTitle(inst);
  }

  function renderMonthPick(inst) {
    var wrap = inst.pop.querySelector(".bdp-pick-m .bdp-pick-grid");
    wrap.innerHTML = "";
    var curMo = inst.view.getMonth();
    for (var i = 0; i < 12; i++) {
      var c = document.createElement("button");
      c.type = "button";
      c.className = "bdp-pick-cell" + (i === curMo ? " bdp-cur" : "");
      c.textContent = (i + 1) + " 月";
      (function (mi) {
        c.addEventListener("click", function (e) {
          e.preventDefault(); e.stopPropagation();
          inst.view = new Date(inst.view.getFullYear(), mi, 1);
          setMode(inst, "d"); // 選月後回日曆（classList 乾淨切換）
        });
      })(i);
      wrap.appendChild(c);
    }
    syncTitle(inst);
  }

  function renderYearPick(inst) {
    var wrap = inst.pop.querySelector(".bdp-pick-y .bdp-pick-grid");
    wrap.innerHTML = "";
    wrap.setAttribute("role", "listbox");
    wrap.setAttribute("aria-label", "選擇年份");
    var curY = inst.view.getFullYear();
    // 動態範圍：吃 min/max attr，否則 1950 ~ 今年+5（補打卡 / 到職日 / 出生年都涵蓋）
    var lo = 1950, hi = (new Date()).getFullYear() + 5;
    if (inst.min) { lo = Math.max(lo, inst.min.getFullYear()); }
    if (inst.max) { hi = Math.min(hi, inst.max.getFullYear()); }
    if (curY < lo) { lo = curY; }
    if (curY > hi) { hi = curY; }
    var curCell = null;
    for (var yy = lo; yy <= hi; yy++) {
      var c = document.createElement("button");
      c.type = "button";
      c.className = "bdp-pick-cell" + (yy === curY ? " bdp-cur" : "");
      c.textContent = yy + " 年";
      c.setAttribute("data-y", yy);
      c.setAttribute("role", "option");
      c.setAttribute("aria-selected", yy === curY ? "true" : "false");
      c.setAttribute("tabindex", yy === curY ? "0" : "-1");
      (function (yv) {
        c.addEventListener("click", function (e) {
          e.preventDefault(); e.stopPropagation();
          inst.view = new Date(yv, inst.view.getMonth(), 1);
          setMode(inst, "m"); // 選年後進月份選擇（classList 乾淨切換，根治 regex 漏字 → 年選成 2014 的 bug）
        });
      })(yy);
      if (yy === curY) { curCell = c; }
      wrap.appendChild(c);
    }
    syncTitle(inst);
    // 當前年捲到容器中央，遠年用戶一推即達。三保險補各種 reflow 時序（無 smooth → 同步瞬時生效）
    if (curCell) {
      var centerFn = function () {
        var vh = wrap.clientHeight || 264;
        var top = curCell.offsetTop - (vh / 2) + (curCell.offsetHeight / 2);
        wrap.scrollTop = Math.max(0, top);
      };
      centerFn();
      if (typeof requestAnimationFrame === "function") { requestAnimationFrame(centerFn); }
      setTimeout(function () {
        centerFn();
        try { curCell.focus({ preventScroll: true }); } catch (e) {}
      }, 180);
    }
  }

  /* ---------- 選定 → 寫回 input.value + 派發事件 (零破壞算薪邏輯) ---------- */
  // 純日期：選日即寫回並關閉
  function writeDate(inst, d) {
    inst.input.value = d ? toISO(d) : "";
    inst.selected = d;
    inst.syncDisplay();
    fireEvents(inst.input);
  }
  // 含時間：合併日 + 時分寫回 yyyy-mm-ddThh:mm
  function writeDateTime(inst) {
    if (!inst.selected) { return; }
    var d = new Date(inst.selected.getFullYear(), inst.selected.getMonth(), inst.selected.getDate(), inst.hour, inst.minute);
    inst.input.value = toISODT(d);
    inst.selected = d;
    inst.syncDisplay();
    fireEvents(inst.input);
  }

  // 日格點擊：純日期模式選即關；含時間模式只選日不關，留著調時間
  function onDayClick(inst, d) {
    if (inst.hasTime) {
      selectDay(inst, d);
    } else {
      inst.selected = d;
      writeDate(inst, d);
      close(inst);
    }
  }

  // 含時間：標記選定日 (不寫回、不關)，重畫日曆高亮 + 重算時間 max 約束
  function selectDay(inst, d) {
    inst.selected = new Date(d.getFullYear(), d.getMonth(), d.getDate(), inst.hour, inst.minute);
    render(inst);
    renderWheels(inst); // max 同日約束可能變化
  }

  function pickClear(inst) {
    inst.selected = null;
    writeDate(inst, null);
    close(inst);
  }

  function jumpToday(inst) {
    var now = new Date();
    if (dayDisabled(inst, now)) {
      // 今天超出範圍 → 僅把 view 移到本月，不選
      inst.view = new Date(now.getFullYear(), now.getMonth(), 1);
      render(inst);
      return;
    }
    if (inst.hasTime) {
      selectDay(inst, now);
      inst.view = new Date(now.getFullYear(), now.getMonth(), 1);
      render(inst);
      renderWheels(inst);
    } else {
      inst.selected = now;
      writeDate(inst, now);
      close(inst);
    }
  }

  // 含時間「確定」：合併寫回並關閉
  function commitTime(inst) {
    if (!inst.selected) {
      // 未選日 → 預設今天 (若未超範圍)
      var now = new Date();
      if (!dayDisabled(inst, now)) { inst.selected = now; }
      else { return; }
    }
    writeDateTime(inst);
    close(inst);
  }

  /* ---------- 定位浮層 (fixed viewport 座標，根治 transform/scroll 父層飄移) ---------- */
  function positionPop(inst) {
    if (window.innerWidth <= 480) { return; }
    var r = inst.field.getBoundingClientRect();
    var pop = inst.pop;
    var ph = pop.offsetHeight || 360;
    var pw = pop.offsetWidth || 312;
    var vw = window.innerWidth, vh = window.innerHeight;
    var GAP = 6, MARGIN = 8;

    // 預設：貼欄位下緣
    var top = r.bottom + GAP;
    var left = r.left;

    // 下方空間不足且上方夠 → 翻到欄位上緣
    if (top + ph + MARGIN > vh && r.top - ph - GAP > MARGIN) {
      top = r.top - ph - GAP;
    }
    // 仍超出底部（上下都不夠）→ 夾在視窗內
    if (top + ph + MARGIN > vh) { top = Math.max(MARGIN, vh - ph - MARGIN); }
    if (top < MARGIN) { top = MARGIN; }

    // 水平：左對齊欄位，右超出則右對齊欄位，再夾進視窗
    if (left + pw > vw - MARGIN) { left = r.right - pw; }
    if (left < MARGIN) { left = MARGIN; }

    pop.style.top = top + "px";
    pop.style.left = left + "px"; // fixed：純 viewport，不加 scroll offset
  }

  function open(inst) {
    if (inst.isOpen) { return; }
    if (openInstance && openInstance !== inst) { close(openInstance); }
    if (inst.readBounds) { inst.readBounds(); }
    if (!inst.pop) {
      buildPop(inst);
      if (inst.hasTime) {
        inst.pop.querySelector(".bdp-btn-ok").addEventListener("click", function (e) {
          e.preventDefault(); commitTime(inst);
        });
      }
    }

    inst.view = inst.selected ? new Date(inst.selected.getFullYear(), inst.selected.getMonth(), 1) : new Date();
    // v1.2.2 用 className 重設 base（清掉上次殘留的 bdp-show / bdp-mode-*），之後一律 classList 操作避免重複 class
    inst.pop.className = "bdp-pop" + (inst.hasTime ? " bdp-has-time" : "");
    render(inst);
    if (inst.hasTime) { renderWheels(inst); }

    // backdrop 手機 + 桌面都建（深淺由 CSS media query 決定，提供點外關閉 + 聚焦）
    var bd = document.createElement("div");
    bd.className = "bdp-backdrop";
    bd.addEventListener("click", function () { close(inst); });
    document.body.appendChild(bd);
    inst.backdrop = bd;
    document.body.appendChild(inst.pop);
    positionPop(inst);

    // v1.2.2 robust 顯示：reflow + 雙 rAF + setTimeout 兌底（取代脆弱的單一 rAF）
    applyShow(inst.pop);
    applyShow(inst.backdrop);

    inst.field.classList.add("bdp-open");
    inst.field.setAttribute("aria-expanded", "true");
    inst.isOpen = true;
    openInstance = inst;

    setTimeout(function () {
      var f = inst.elGrid.querySelector(".bdp-day[tabindex='0']");
      if (f) { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } }
    }, 30);

    // 開啟鎖背景捲動：配 backdrop 浮層穩貼欄位，省 scroll reposition 抖動
    // v1.2.2 先記住捲動位置，關閉時還原 → 根治「選完日期頁面捲回頂部」(Peter 痛點)
    inst._prevOverflow = document.body.style.overflow;
    inst._savedScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    document.body.style.overflow = "hidden";
    // 浮層開啟 → 標記 body，讓底部導覽 pointer-events:none，根治誤觸跳頁穿透
    if (document.body.classList) { document.body.classList.add("overlay-open"); }

    inst._reposition = function () { positionPop(inst); };
    window.addEventListener("resize", inst._reposition);
    window.addEventListener("scroll", inst._reposition, true);
  }

  function close(inst) {
    if (!inst.isOpen || !inst.pop) { return; }
    inst.isOpen = false;
    if (openInstance === inst) { openInstance = null; }
    inst.field.classList.remove("bdp-open");
    inst.field.setAttribute("aria-expanded", "false");
    document.body.style.overflow = inst._prevOverflow || ""; // 還原背景捲動
    if (document.body.classList) { document.body.classList.remove("overlay-open"); } // 還原底部導覽可點
    // v1.2.2 還原捲動位置，避免 overflow 切換造成的跳頂
    if (inst._savedScrollY != null) {
      var sy = inst._savedScrollY;
      try { window.scrollTo(0, sy); } catch (e) {}
      // 部分瀏覽器在 reflow 後才生效，次幀補一次
      setTimeout(function () { try { window.scrollTo(0, sy); } catch (e) {} }, 0);
    }
    window.removeEventListener("resize", inst._reposition);
    window.removeEventListener("scroll", inst._reposition, true);

    var pop = inst.pop, bd = inst.backdrop;
    pop.classList.remove("bdp-show");
    if (bd) { bd.classList.remove("bdp-show"); }
    inst.backdrop = null;
    setTimeout(function () {
      if (pop.parentNode) { pop.parentNode.removeChild(pop); }
      if (bd && bd.parentNode) { bd.parentNode.removeChild(bd); }
    }, 200);
    try { inst.field.focus({ preventScroll: true }); } catch (e) { try { inst.field.focus(); } catch (e2) {} }
  }

  function toggle(inst) { if (inst.isOpen) { close(inst); } else { open(inst); } }

  /* ---------- 浮層鍵盤導航 ---------- */
  function onPopKey(inst, e) {
    var k = e.key;
    if (k === "Escape") { e.preventDefault(); close(inst); return; }
    if (inst.pop.className.indexOf("bdp-mode-y") >= 0) { yearKeyNav(inst, e); return; }
    if (inst.pop.className.indexOf("bdp-mode") >= 0) { return; }

    var active = document.activeElement;
    // 時間滾輪聚焦時的 ↑↓ 已由滾輪自身處理，這裡只管日格
    if (!active || active.className.indexOf("bdp-day") < 0) { return; }
    var iso = active.getAttribute("data-iso");
    var cur = parseISO(iso);
    if (!cur) { return; }
    var delta = 0;
    if (k === "ArrowLeft") { delta = -1; }
    else if (k === "ArrowRight") { delta = 1; }
    else if (k === "ArrowUp") { delta = -7; }
    else if (k === "ArrowDown") { delta = 7; }
    else if (k === "Enter" || k === " ") {
      e.preventDefault();
      if (!dayDisabled(inst, cur)) { onDayClick(inst, cur); }
      return;
    }
    else if (k === "PageUp") { e.preventDefault(); shiftMonth(inst, -1); focusFirst(inst); return; }
    else if (k === "PageDown") { e.preventDefault(); shiftMonth(inst, 1); focusFirst(inst); return; }
    else { return; }

    e.preventDefault();
    var next = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + delta);
    if (next.getMonth() !== inst.view.getMonth() || next.getFullYear() !== inst.view.getFullYear()) {
      inst.view = new Date(next.getFullYear(), next.getMonth(), 1);
      render(inst);
    }
    var target = inst.elGrid.querySelector(".bdp-day[data-iso='" + toISO(next) + "']");
    if (target) {
      var prev = inst.elGrid.querySelector(".bdp-day[tabindex='0']");
      if (prev) { prev.setAttribute("tabindex", "-1"); }
      target.setAttribute("tabindex", "0");
      target.focus();
    }
  }

  function focusFirst(inst) {
    setTimeout(function () {
      var f = inst.elGrid.querySelector(".bdp-day[tabindex='0']") ||
              inst.elGrid.querySelector(".bdp-day:not(.bdp-out):not(.bdp-disabled)");
      if (f) { f.setAttribute("tabindex", "0"); f.focus(); }
    }, 10);
  }

  // 年清單鍵盤導航：↑↓ 移動 focus、Enter 選定、Home/End 跳首尾、PageUp/Down ±10 年
  function yearKeyNav(inst, e) {
    var k = e.key;
    var wrap = inst.pop.querySelector(".bdp-pick-y .bdp-pick-grid");
    if (!wrap) { return; }
    var cells = wrap.querySelectorAll(".bdp-pick-cell");
    if (!cells.length) { return; }
    var idx = -1, i;
    for (i = 0; i < cells.length; i++) {
      if (cells[i] === document.activeElement) { idx = i; break; }
    }
    if (idx < 0) {
      for (i = 0; i < cells.length; i++) {
        if (cells[i].className.indexOf("bdp-cur") >= 0) { idx = i; break; }
      }
      if (idx < 0) { idx = 0; }
    }
    var next = idx;
    if (k === "ArrowDown") { next = Math.min(cells.length - 1, idx + 1); }
    else if (k === "ArrowUp") { next = Math.max(0, idx - 1); }
    else if (k === "PageDown") { next = Math.min(cells.length - 1, idx + 10); }
    else if (k === "PageUp") { next = Math.max(0, idx - 10); }
    else if (k === "Home") { next = 0; }
    else if (k === "End") { next = cells.length - 1; }
    else if (k === "Enter" || k === " ") { e.preventDefault(); cells[idx].click(); return; }
    else { return; }
    e.preventDefault();
    for (i = 0; i < cells.length; i++) { cells[i].setAttribute("tabindex", "-1"); }
    cells[next].setAttribute("tabindex", "0");
    cells[next].focus();
    if (cells[next].scrollIntoView) { cells[next].scrollIntoView({ block: "center" }); }
  }

  /* ---------- 全域：點外部關閉 ---------- */
  document.addEventListener("mousedown", function (e) {
    if (!openInstance) { return; }
    var t = e.target;
    if (openInstance.pop && openInstance.pop.contains(t)) { return; }
    if (openInstance.field && openInstance.field.contains(t)) { return; }
    if (openInstance.backdrop && openInstance.backdrop === t) { return; }
    close(openInstance);
  }, true);

  /* ---------- 升級全頁 + 監聽動態插入 ---------- */
  function upgradeAll(root) {
    root = root || document;
    var nodes = root.querySelectorAll("input[type=date]:not([data-bdp]),input[type=datetime-local]:not([data-bdp])");
    var n = 0;
    for (var i = 0; i < nodes.length; i++) {
      // v1.1.0：datetime-local 不再跳過，改升級含時間層
      upgrade(nodes[i]); n++;
    }
    return n;
  }

  var observer = null;
  function startObserver() {
    if (observer || !global.MutationObserver) { return; }
    observer = new MutationObserver(function (muts) {
      var need = false;
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].addedNodes && muts[i].addedNodes.length) { need = true; break; }
      }
      if (need) { upgradeAll(document); }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init(opts) {
    injectCSS();
    function go() {
      upgradeAll(document);
      startObserver();
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", go);
    } else {
      go();
    }
    return BDPicker;
  }

  /* ---------- export ---------- */
  var BDPicker = {
    init: init,
    upgradeAll: upgradeAll,
    upgrade: upgrade,
    version: "1.2.1"
  };
  global.BDPicker = BDPicker;

})(typeof window !== "undefined" ? window : this);
