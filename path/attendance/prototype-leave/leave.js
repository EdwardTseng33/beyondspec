/* BeyondPath attendance leave UI (prototype, ES5). Two faces share one localStorage. */
(function () {
  "use strict";
  var C = window.LeaveCore;

  var IC = {
    leaf: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z\"/><path d=\"M2 21c0-3 1.85-5.36 5.08-6\"/></svg>",
    user: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/></svg>",
    shield: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/></svg>",
    calendar: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/><line x1=\"16\" y1=\"2\" x2=\"16\" y2=\"6\"/><line x1=\"8\" y1=\"2\" x2=\"8\" y2=\"6\"/><line x1=\"3\" y1=\"10\" x2=\"21\" y2=\"10\"/></svg>",
    send: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"22\" y1=\"2\" x2=\"11\" y2=\"13\"/><polygon points=\"22 2 15 22 11 13 2 9 22 2\"/></svg>",
    check: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"20 6 9 17 4 12\"/></svg>",
    x: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/></svg>",
    clock: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/></svg>",
    hourglass: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 22h14M5 2h14M17 22v-4.17a2 2 0 0 0-.59-1.42L12 12l-4.41 4.41A2 2 0 0 0 7 17.83V22M7 2v4.17a2 2 0 0 0 .59 1.42L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2\"/></svg>",
    info: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"12\" y1=\"16\" x2=\"12\" y2=\"12\"/><line x1=\"12\" y1=\"8\" x2=\"12.01\" y2=\"8\"/></svg>",
    users: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"/><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"/></svg>",
    inbox: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"22 12 16 12 14 15 10 15 8 12 2 12\"/><path d=\"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z\"/></svg>",
    moon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z\"/></svg>",
    sun: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"5\"/><line x1=\"12\" y1=\"1\" x2=\"12\" y2=\"3\"/><line x1=\"12\" y1=\"21\" x2=\"12\" y2=\"23\"/><line x1=\"4.2\" y1=\"4.2\" x2=\"5.6\" y2=\"5.6\"/><line x1=\"18.4\" y1=\"18.4\" x2=\"19.8\" y2=\"19.8\"/><line x1=\"1\" y1=\"12\" x2=\"3\" y2=\"12\"/><line x1=\"21\" y1=\"12\" x2=\"23\" y2=\"12\"/><line x1=\"4.2\" y1=\"19.8\" x2=\"5.6\" y2=\"18.4\"/><line x1=\"18.4\" y1=\"5.6\" x2=\"19.8\" y2=\"4.2\"/></svg>"
  };

  /* demo: current employee (the logged-in one on the employee face) */
  var ME = { employeeName: "美玲", employeeEmail: "meiling@demo.beyondpath.tw", hireDate: "2024-06-01" };
  var MANAGER_NAME = "Peter";

  /* view state */
  var role = "employee";     // employee | manager
  var draft = { leaveType: "annual", startDate: "", endDate: "", hours: "", reason: "" };

  var contentEl, toastEl, greetingEl, themeBtnEl, roleSwitchEl, roleHintEl;
  function el(id){ return document.getElementById(id); }
  function esc(s){ return ("" + (s == null ? "" : s)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;"); }
  function pad2(n){ return n < 10 ? "0" + n : "" + n; }
  function fmtClock(ms){ var d = new Date(ms); return pad2(d.getHours()) + ":" + pad2(d.getMinutes()); }
  function todayKey(){ var d = new Date(); return d.getFullYear() + "-" + pad2(d.getMonth()+1) + "-" + pad2(d.getDate()); }
  function relWhen(ms){
    var diff = Date.now() - ms;
    var m = Math.floor(diff/60000);
    if (m < 1) return "剛剛";
    if (m < 60) return m + " 分鐘前";
    var h = Math.floor(m/60);
    if (h < 24) return h + " 小時前";
    return Math.floor(h/24) + " 天前";
  }
  function hoursLabel(rec){
    var h = (rec.hours != null && !isNaN(rec.hours)) ? rec.hours : C.defaultHours(rec.startDate, rec.endDate);
    var days = Math.round((h/8)*100)/100;
    return h + " 小時（約 " + days + " 天）";
  }
  function showToast(msg, kind){
    var icon = kind === "warn" ? IC.info : (kind === "err" ? IC.x : IC.check);
    toastEl.className = "toast " + (kind === "warn" ? "warn" : (kind === "err" ? "err" : "ok"));
    toastEl.innerHTML = icon + "<span>" + esc(msg) + "</span>";
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    setTimeout(function(){ toastEl.classList.remove("show"); }, 3200);
  }

  /* ============ EMPLOYEE FACE ============ */
  function renderEmployee(){
    var bal = C.annualBalance(ME, new Date());
    var mine = C.LeaveStore.listByEmployee(ME.employeeEmail);
    var html = "";

    /* balance hero (employee first thing -- 幫員工不管員工) */
    html += "<div class=\"balance-card\">";
    html += "  <div class=\"balance-top\">" + IC.leaf + " 我的特休餘額 · " + bal.year + " 年</div>";
    html += "  <div class=\"balance-remain\">" + bal.remaining + "<small>天可休</small></div>";
    html += "  <div class=\"balance-sub\">";
    html += "    <div class=\"balance-sub-item\"><div class=\"balance-sub-num\">" + bal.entitled + "</div><div class=\"balance-sub-label\">今年給你（天）</div></div>";
    html += "    <div class=\"balance-sub-item\"><div class=\"balance-sub-num\">" + bal.used + "</div><div class=\"balance-sub-label\">已使用（天）</div></div>";
    html += "  </div>";
    html += "</div>";
    // 「示範數字」改成獨立明顯提醒卡（不再是特休卡底部的小灰字），算薪的美玲/阿志一眼看到、不會把數字當真（med 痛點）
    html += "<div class=\"demo-note\">" + IC.info + "<span><b>這是試用示範數字</b>（到職日先用 " + esc(ME.hireDate) + "）。正式上線後，到職日由人資設定，特休天數依<b>勞基法年資</b>自動核算。</span></div>";

    /* leave request form */
    html += renderLeaveForm();

    /* my requests */
    html += "<div class=\"section-title\"><span>我的請假紀錄</span>" + (mine.length ? "<span class=\"count-pill\">" + mine.length + " 筆</span>" : "") + "</div>";
    html += renderMyRequests(mine);
    return html;
  }

  function renderLeaveForm(){
    var h = "";
    h += "<div class=\"card\">";
    h += "  <div class=\"card-head\">" + IC.calendar + " 我要請假</div>";
    h += "  <div class=\"card-desc\">填好送出，主管核准後你會收到通知，特休餘額也會自動更新。</div>";
    h += "  <label class=\"field-label\">假別</label>";
    h += "  <div class=\"type-grid\">";
    for (var i = 0; i < C.LEAVE_TYPES.length; i++) {
      var t = C.LEAVE_TYPES[i];
      var act = (draft.leaveType === t.id) ? " active" : "";
      h += "<button type=\"button\" class=\"type-chip" + act + "\" data-type=\"" + t.id + "\">" + esc(t.name) + "</button>";
    }
    h += "  </div>";
    h += "  <div class=\"date-row\">";
    h += "    <div><label class=\"field-label\" for=\"lvStart\">開始日期</label><input class=\"lv-input\" type=\"date\" id=\"lvStart\" value=\"" + esc(draft.startDate) + "\"></div>";
    h += "    <div><label class=\"field-label\" for=\"lvEnd\">結束日期</label><input class=\"lv-input\" type=\"date\" id=\"lvEnd\" value=\"" + esc(draft.endDate) + "\"></div>";
    h += "  </div>";
    h += "  <label class=\"field-label\" for=\"lvHours\">時數（請整天免填）</label>";
    h += "  <input class=\"lv-input\" type=\"number\" id=\"lvHours\" min=\"1\" step=\"1\" inputmode=\"numeric\" placeholder=\"整天免填，系統自動算每天 8 小時\" value=\"" + esc(draft.hours) + "\">";
    // 合併兩段重複說明成一段條列，急著請假也能 3 秒看完（小陳/阿婷 med）
    h += "  <div class=\"field-hint\">" + IC.info + "<span>"
         + "<b>請整天</b>：時數留空（系統自動每天 8 小時）。<br>"
         + "<b>只請一天</b>：結束日期免填。<br>"
         + "<b>請半天</b>：開始 / 結束選同一天，時數填 4。"
         + "</span></div>";
    h += "  <label class=\"field-label\" for=\"lvReason\">事由（選填）</label>";
    h += "  <textarea class=\"lv-textarea\" id=\"lvReason\" placeholder=\"簡單說明即可\">" + esc(draft.reason) + "</textarea>";
    h += "  <button class=\"lv-submit\" id=\"lvSubmit\">" + IC.send + " 送出申請</button>";
    h += "</div>";
    return h;
  }

  function badgeFor(status){
    if (status === "approved") return "<span class=\"badge approved\">" + IC.check + " 已核准</span>";
    if (status === "rejected") return "<span class=\"badge rejected\">" + IC.x + " 已退件</span>";
    return "<span class=\"badge pending\">" + IC.hourglass + " 待批准</span>";
  }

  function renderMyRequests(list){
    if (!list.length) {
      return "<div class=\"card empty-state\"><div class=\"empty-ico\">" + IC.calendar + "</div><div class=\"empty-title\">還沒有請假紀錄</div><div class=\"empty-state-text\">上面填一張送出看看。</div></div>";
    }
    var h = "";
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      var isAnnual = (r.leaveType === "annual");
      var dateStr = C.fmtDateZh(r.startDate) + (r.endDate !== r.startDate ? " ─ " + C.fmtDateZh(r.endDate) : "");
      h += "<div class=\"lv-row\">";
      h += "  <div class=\"lv-row-icon " + (isAnnual ? "annual" : "other") + "\">" + esc(C.leaveTypeName(r.leaveType)) + "</div>";
      h += "  <div class=\"lv-row-main\">";
      h += "    <div class=\"lv-row-title\">" + esc(C.leaveTypeName(r.leaveType)) + " " + badgeFor(r.status) + "</div>";
      h += "    <div class=\"lv-row-meta\">" + esc(dateStr) + " · " + hoursLabel(r) + "</div>";
      if (r.reason) h += "    <div class=\"lv-row-meta reason\">事由：" + esc(r.reason) + "</div>";
      if (r.status === "rejected" && r.decisionNote) h += "    <div class=\"lv-row-meta reason\">退件原因：" + esc(r.decisionNote) + "</div>";
      if (r.status !== "pending" && r.decidedBy) h += "    <div class=\"lv-row-meta\">由 " + esc(r.decidedBy) + " · " + relWhen(r.decidedAtMs) + "處理</div>";
      h += "  </div>";
      h += "</div>";
    }
    return h;
  }

  /* ============ MANAGER FACE ============ */
  function renderManager(){
    var pending = C.LeaveStore.listPending();
    var html = "";

    /* 今日人力概況：改成『在崗 / 請假 / 總數』三段，主管批假最在意『今天還有幾個人在』（aji/Peter HIGH） */
    var tk = todayKey();
    var hc = C.todayHeadcount(tk);
    html += "<div class=\"today-card\">";
    html += "  <div class=\"card-head\">" + IC.users + " 今日人力概況</div>";
    html += "  <div class=\"hc-row\">";
    html += "    <div class=\"hc-cell\"><div class=\"hc-num present\">" + hc.present + "</div><div class=\"hc-lbl\">今天在崗</div></div>";
    html += "    <div class=\"hc-cell\"><div class=\"hc-num leave\">" + hc.onLeave + "</div><div class=\"hc-lbl\">今天請假</div></div>";
    html += "    <div class=\"hc-cell\"><div class=\"hc-num total\">" + hc.total + "</div><div class=\"hc-lbl\">團隊總數</div></div>";
    html += "  </div>";
    if (hc.onLeave > 0) {
      html += "  <div class=\"today-names\">今天請假：" + esc(hc.leaveNames.join("、")) + "</div>";
    } else {
      html += "  <div class=\"today-names\">今天全員到齊，沒有人請假。</div>";
    }
    /* 接下來 7 天人力缺口：有人請假的日子才列，幫主管排隔天班（Peter HIGH） */
    var up = C.upcomingLeave(7);
    html += "  <div class=\"upcoming\">";
    html += "    <div class=\"upcoming-hd\">" + IC.calendar + " 接下來 7 天請假</div>";
    if (!up.length) {
      html += "    <div class=\"upcoming-empty\">這 7 天目前沒有人請假。</div>";
    } else {
      for (var u = 0; u < up.length; u++) {
        html += "    <div class=\"upcoming-row\"><span class=\"up-day\">" + esc(up[u].label) + "</span>"
             + "<span class=\"up-info\">在崗 " + up[u].present + " 人 · 請假 " + esc(up[u].names.join("、")) + "</span></div>";
      }
    }
    html += "  </div>";
    html += "</div>";

    /* pending approvals */
    html += "<div class=\"section-title\"><span>待我批准</span>" + (pending.length ? "<span class=\"count-pill\">" + pending.length + " 件</span>" : "") + "</div>";
    if (!pending.length) {
      html += "<div class=\"card empty-state\"><div class=\"empty-ico\">" + IC.inbox + "</div><div class=\"empty-title\">目前沒有待批准的請假</div><div class=\"empty-state-text\">有新申請會出現在這裡，並通知你。</div></div>";
    } else {
      for (var i = 0; i < pending.length; i++) {
        html += renderApprovalCard(pending[i]);
      }
    }

    /* recently decided（解「核准後就消失、沒地方查核對」痛點 — 阿志） */
    var decided = C.LeaveStore.list().filter(function(r){ return r.status !== "pending"; });
    if (decided.length) {
      html += "<div class=\"section-title\"><span>近期已處理</span><span class=\"count-pill\">" + decided.length + " 件</span></div>";
      var show = decided.slice(0, 8);
      for (var k = 0; k < show.length; k++) {
        html += renderDecidedRow(show[k]);
      }
    }
    /* 團隊特休總覽：主管/算薪一眼看每人剩幾天（美玲/aji HIGH，原本要跨頁查） */
    html += renderTeamAnnual();
    /* 特休折現：Pro 功能入口（原本完全看不到，aji 月底要算換錢找不到 — med） */
    html += "<div class=\"pro-entry\">"
         + "<div class=\"pro-entry-main\"><div class=\"pro-title\">" + IC.info + " 特休未休折現 <span class=\"pro-tag\">Pro</span></div>"
         + "<div class=\"pro-desc\">年底把員工沒休完的特休換算成工資，系統自動算金額。升級 Pro 後在這裡操作。</div></div>"
         + "</div>";
    /* 把「之後餵給薪資」改成具體說明：何時生效、去哪看、會算什麼（aji med — 模糊比沒說更不安） */
    html += "<div class=\"divider-note\">核准後這筆假會<b>立刻記到該員工的出勤</b>；月底結算時，特休 / 請假時數會<b>自動帶進薪資試算</b>，你可在「薪資」頁逐筆核對。員工也會收到核准通知。</div>";
    return html;
  }

  function renderDecidedRow(r){
    var isAnnual = (r.leaveType === "annual");
    var dateStr = C.fmtDateZh(r.startDate) + (r.endDate !== r.startDate ? " ─ " + C.fmtDateZh(r.endDate) : "");
    var h = "";
    h += "<div class=\"lv-row\">";
    h += "  <div class=\"lv-row-icon " + (isAnnual ? "annual" : "other") + "\">" + esc(C.leaveTypeName(r.leaveType)) + "</div>";
    h += "  <div class=\"lv-row-main\">";
    h += "    <div class=\"lv-row-title\">" + esc(r.employeeName) + " · " + esc(C.leaveTypeName(r.leaveType)) + " " + badgeFor(r.status) + "</div>";
    h += "    <div class=\"lv-row-meta\">" + esc(dateStr) + " · " + hoursLabel(r) + "</div>";
    if (r.status === "rejected" && r.decisionNote) h += "    <div class=\"lv-row-meta reason\">退件原因：" + esc(r.decisionNote) + "</div>";
    if (r.decidedBy) h += "    <div class=\"lv-row-meta\">由 " + esc(r.decidedBy) + " · " + relWhen(r.decidedAtMs) + "處理</div>";
    h += "  </div>";
    h += "</div>";
    return h;
  }

  /* 團隊特休總覽卡：列出每位成員剩餘 / 已用特休，主管算薪 / 排休一眼看（美玲/aji HIGH） */
  function renderTeamAnnual(){
    var rows = C.teamAnnualOverview(new Date());
    var h = "";
    h += "<div class=\"section-title\"><span>團隊特休總覽</span><span class=\"count-pill\">" + rows.length + " 人</span></div>";
    h += "<div class=\"card team-annual\">";
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var low = (r.remaining <= 1);
      h += "  <div class=\"ta-row\">";
      h += "    <div class=\"ta-name\">" + esc(r.employeeName) + "</div>";
      h += "    <div class=\"ta-bar-wrap\"><div class=\"ta-bar\" style=\"width:" + (r.entitled > 0 ? Math.round(r.used / r.entitled * 100) : 0) + "%\"></div></div>";
      h += "    <div class=\"ta-remain" + (low ? " low" : "") + "\">剩 <b>" + r.remaining + "</b> 天<span class=\"ta-of\">/ " + r.entitled + "</span></div>";
      h += "  </div>";
    }
    h += "  <div class=\"ta-foot\">數字依到職日與勞基法年資自動核算（示範資料）。</div>";
    h += "</div>";
    return h;
  }

  function renderApprovalCard(r){
    var initial = (r.employeeName || "?").charAt(0);
    var dateStr = C.fmtDateZh(r.startDate) + (r.endDate !== r.startDate ? " ─ " + C.fmtDateZh(r.endDate) : "");
    /* staffing on the requested days (the headline turnip wanted) */
    var ov = C.overlapForRequest(r);
    var staffCls = ov.peak > 0 ? "warn" : "clear";
    var staffMsg;
    if (ov.peak === 0) {
      staffMsg = "申請期間目前沒有其他人請假，人力充足。";
    } else if (ov.days === 1) {
      staffMsg = "當天已有 " + ov.peak + " 人請假：" + ov.peakNames.join("、");
    } else {
      staffMsg = "申請期間單日最多已有 " + ov.peak + " 人請假（" + ov.peakNames.join("、") + "），請評估人力。";
    }

    var h = "";
    h += "<div class=\"appr-card\" data-id=\"" + r.id + "\">";
    h += "  <div class=\"appr-head\">";
    h += "    <div class=\"appr-avatar\">" + esc(initial) + "</div>";
    h += "    <div class=\"appr-who\"><div class=\"appr-name\">" + esc(r.employeeName) + "</div><div class=\"appr-when\">" + relWhen(r.createdAtMs) + "申請</div></div>";
    h += "    " + badgeFor(r.status);
    h += "  </div>";
    h += "  <div class=\"appr-detail\"><b>" + esc(C.leaveTypeName(r.leaveType)) + "</b> · " + esc(dateStr) + " · " + hoursLabel(r) + (r.reason ? "<br>事由：" + esc(r.reason) : "") + "</div>";
    h += "  <div class=\"appr-staffing " + staffCls + "\">" + IC.users + "<span>" + esc(staffMsg) + "</span></div>";
    h += "  <div class=\"appr-actions\">";
    h += "    <button class=\"appr-btn approve\" data-act=\"approve\" data-id=\"" + r.id + "\">" + IC.check + " 核准</button>";
    h += "    <button class=\"appr-btn reject\" data-act=\"reject\" data-id=\"" + r.id + "\">" + IC.x + " 退件</button>";
    h += "  </div>";
    h += "</div>";
    return h;
  }

  /* ============ RENDER DISPATCH + EVENTS ============ */
  function renderRoleSwitch(){
    var emp = (role === "employee") ? " active" : "";
    var mgr = (role === "manager") ? " active" : "";
    roleSwitchEl.innerHTML =
      "<button class=\"role-btn" + emp + "\" data-role=\"employee\">" + IC.user + " 員工（美玲）</button>" +
      "<button class=\"role-btn" + mgr + "\" data-role=\"manager\">" + IC.shield + " 主管（Peter）</button>";
    roleHintEl.textContent = (role === "employee")
      ? "員工視角：看自己的特休餘額、線上請假、追蹤申請狀態"
      : "主管視角：你正以「" + MANAGER_NAME + "」身分審核底下員工的請假（下方名字是申請人，不是你）";
    var btns = roleSwitchEl.querySelectorAll(".role-btn");
    for (var i = 0; i < btns.length; i++) {
      btns[i].onclick = function(){ role = this.getAttribute("data-role"); render(); };
    }
  }

  function render(){
    var hr = new Date().getHours();
    var greet = (hr < 12) ? "早安" : (hr < 18) ? "午安" : "晚安";
    greetingEl.textContent = (role === "employee") ? (greet + "，" + ME.employeeName) : ("出勤管理 · " + MANAGER_NAME);
    renderRoleSwitch();
    contentEl.innerHTML = (role === "employee") ? renderEmployee() : renderManager();
    // render 後立即同步升級新插入的日期欄位，不等 MutationObserver（async）。
    // 根治『re-render 後短暫空窗點欄位沒反應、像壞掉』(Peter/aji/阿婷『點欄位沒開、跳頁、壞掉』根因之一)。
    if (window.BDPicker) { try { BDPicker.upgradeAll(contentEl); } catch (e) {} }
    if (role === "employee") bindEmployee(); else bindManager();
  }

  function readDraftFromDom(){
    var s = el("lvStart"), e = el("lvEnd"), hh = el("lvHours"), rs = el("lvReason");
    if (s) draft.startDate = s.value;
    if (e) draft.endDate = e.value;
    if (hh) draft.hours = hh.value;
    if (rs) draft.reason = rs.value;
  }

  function bindEmployee(){
    var chips = contentEl.querySelectorAll(".type-chip");
    for (var i = 0; i < chips.length; i++) {
      chips[i].onclick = function(){ readDraftFromDom(); draft.leaveType = this.getAttribute("data-type"); render(); };
    }
    var sub = el("lvSubmit");
    if (sub) sub.onclick = doSubmit;
  }

  function doSubmit(){
    readDraftFromDom();
    if (!draft.startDate) { showToast("請選擇開始日期", "warn"); return; }
    if (!draft.endDate) { draft.endDate = draft.startDate; }
    var sd = C.parseDate(draft.startDate), ed = C.parseDate(draft.endDate);
    if (!sd || !ed) { showToast("日期格式不正確", "warn"); return; }
    if (ed < sd) { showToast("結束日期不能早於開始日期", "warn"); return; }
    var hrs = draft.hours;
    if (hrs !== "" && (isNaN(Number(hrs)) || Number(hrs) <= 0)) { showToast("時數請填正整數，或留空用預設", "warn"); return; }
    var rec = C.LeaveStore.submit({
      employeeName: ME.employeeName,
      employeeEmail: ME.employeeEmail,
      leaveType: draft.leaveType,
      startDate: draft.startDate,
      endDate: draft.endDate,
      hours: (hrs === "" ? null : Number(hrs)),
      reason: draft.reason
    });
    showToast("已送出 " + C.leaveTypeName(rec.leaveType) + " 申請，等待主管批准", "ok");
    draft = { leaveType: "annual", startDate: "", endDate: "", hours: "", reason: "" };
    render();
    // 送出後捲回頂部：讓使用者看到 toast + 下方「我的請假紀錄」多一筆「待批准」，確認真的送出了
    // （小陳/Peter「送出後不確定成功沒、表單就清空」HIGH）
    if (contentEl) { try { contentEl.scrollTop = 0; } catch (e) {} }
    if (window.scrollTo) { try { window.scrollTo(0, 0); } catch (e) {} }
  }

  /* ---------- 自製確認對話框（取代 window.prompt / confirm 的原生灰窗，統一紫系 UI） ---------- */
  function closeModal(){
    var root = el("modalRoot");
    if (root) { root.innerHTML = ""; }
    if (document.body.classList) { document.body.classList.remove("overlay-open"); } // 還原底部導覽可點
    document.removeEventListener("keydown", modalKeyHandler, true);
  }
  function modalKeyHandler(e){
    if (e.key === "Escape") { e.preventDefault(); closeModal(); }
  }
  // opts: {kind:'approve'|'reject', title, bodyHtml, withNote, confirmLabel, onConfirm(note)}
  function openModal(opts){
    var root = el("modalRoot");
    if (!root) { return; }
    var kind = opts.kind || "approve";
    var confirmCls = (kind === "reject") ? "confirm-reject" : "confirm-approve";
    var confirmIco = (kind === "reject") ? IC.x : IC.check;
    var h = "";
    h += "<div class=\"modal-backdrop\" id=\"modalBackdrop\">";
    h += "  <div class=\"modal-card\" role=\"dialog\" aria-modal=\"true\">";
    h += "    <div class=\"modal-title " + kind + "\">" + (kind === "reject" ? IC.x : IC.check) + "<span>" + esc(opts.title) + "</span></div>";
    h += "    <div class=\"modal-body\">" + opts.bodyHtml + "</div>";
    if (opts.withNote) {
      h += "    <textarea class=\"modal-textarea\" id=\"modalNote\" placeholder=\"退件原因（選填，員工會看到）\"></textarea>";
    }
    h += "    <div class=\"modal-actions\">";
    h += "      <button class=\"modal-btn cancel\" id=\"modalCancel\">取消</button>";
    h += "      <button class=\"modal-btn " + confirmCls + "\" id=\"modalConfirm\">" + confirmIco + " " + esc(opts.confirmLabel) + "</button>";
    h += "    </div>";
    h += "  </div>";
    h += "</div>";
    root.innerHTML = h;
    if (document.body.classList) { document.body.classList.add("overlay-open"); } // 確認框開啟 → 底部導覽不可點，防誤觸跳頁
    document.addEventListener("keydown", modalKeyHandler, true);
    el("modalBackdrop").addEventListener("click", function(e){ if (e.target === this) { closeModal(); } });
    el("modalCancel").onclick = closeModal;
    el("modalConfirm").onclick = function(){
      var note = "";
      var nt = el("modalNote");
      if (nt) { note = nt.value || ""; }
      closeModal();
      if (opts.onConfirm) { opts.onConfirm(note); }
    };
    var first = el("modalNote") || el("modalConfirm");
    if (first) { try { first.focus(); } catch (e) {} }
  }

  function bindManager(){
    var btns = contentEl.querySelectorAll(".appr-btn");
    for (var i = 0; i < btns.length; i++) {
      btns[i].onclick = function(){
        var id = this.getAttribute("data-id");
        var act = this.getAttribute("data-act");
        var rec = findPending(id);
        if (!rec) { showToast("找不到這筆申請", "err"); render(); return; }
        var dateStr = C.fmtDateZh(rec.startDate) + (rec.endDate !== rec.startDate ? " ─ " + C.fmtDateZh(rec.endDate) : "");
        if (act === "approve") {
          // 批假是有效力的動作 → 先確認，避免滑快誤觸（Peter 痛點）
          openModal({
            kind: "approve",
            title: "確定要核准嗎？",
            bodyHtml: "核准 <b>" + esc(rec.employeeName) + "</b> 的 <b>" + esc(C.leaveTypeName(rec.leaveType)) + "</b><br>" + esc(dateStr) + " · " + hoursLabel(rec),
            confirmLabel: "確定核准",
            onConfirm: function(){
              var d = C.LeaveStore.decide(id, "approved", MANAGER_NAME, "");
              if (d.ok) showToast("已核准 " + d.record.employeeName + " 的" + C.leaveTypeName(d.record.leaveType) + "（已通知員工）", "ok");
              else showToast(d.reason, "err");
              render();
            }
          });
        } else {
          openModal({
            kind: "reject",
            title: "退件這張申請",
            bodyHtml: "退件 <b>" + esc(rec.employeeName) + "</b> 的 <b>" + esc(C.leaveTypeName(rec.leaveType)) + "</b><br>" + esc(dateStr) + " · " + hoursLabel(rec),
            withNote: true,
            confirmLabel: "確定退件",
            onConfirm: function(note){
              var d2 = C.LeaveStore.decide(id, "rejected", MANAGER_NAME, note || "");
              if (d2.ok) showToast("已退件 " + d2.record.employeeName + " 的申請（已通知員工）", "warn");
              else showToast(d2.reason, "err");
              render();
            }
          });
        }
      };
    }
  }

  function findPending(id){
    var list = C.LeaveStore.listPending();
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) { return list[i]; } }
    // 也找已決的（理論上按鈕只在 pending 出現，但保險）
    var all = C.LeaveStore.list();
    for (var j = 0; j < all.length; j++) { if (all[j].id === id) { return all[j]; } }
    return null;
  }

  /* theme */
  function applyThemeIcon(){
    var isDark = document.documentElement.getAttribute("data-theme") === "dark";
    themeBtnEl.innerHTML = isDark ? IC.sun : IC.moon;
    // 無障礙：label/title 隨主題狀態切換（女巫 med，兩頁一致）
    var lbl = isDark ? "切換淺色模式" : "切換深色模式";
    themeBtnEl.setAttribute("aria-label", lbl);
    themeBtnEl.setAttribute("title", lbl);
  }
  function toggleTheme(){
    var cur = document.documentElement.getAttribute("data-theme");
    var next = (cur === "dark") ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("bp_att_theme", next); } catch (e) {}
    applyThemeIcon();
  }

  // 相對日期工具：用今天為基準算 yyyy-mm-dd，讓示範資料永遠落在合理區間（今天 / 接下來幾天）
  function relDate(offset){
    var d = new Date();
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + offset);
    return d.getFullYear() + "-" + pad2(d.getMonth()+1) + "-" + pad2(d.getDate());
  }
  // 首次載入種一份乾淨示範：一筆今天的已核准假(讓今日人力概況有數字) + 一筆 3 天後待批准(讓主管有事可批 + 接下來7天有料)
  function seedDemoIfEmpty(){
    var FLAG = "bp_leave_demo_seed_v1";
    var seeded = false;
    try { seeded = localStorage.getItem(FLAG) === "1"; } catch (e) {}
    if (seeded) { return; }
    if (C.LeaveStore.list().length > 0) { try { localStorage.setItem(FLAG, "1"); } catch (e) {} return; }
    // 今天：小華事假已核准（今日人力概況顯示請假 1 / 在崗 4）
    var a = C.LeaveStore.submit({ employeeName:"小華", employeeEmail:"hua@demo.beyondpath.tw", leaveType:"personal", startDate:relDate(0), endDate:relDate(0), hours:null, reason:"家裡有事" });
    C.LeaveStore.decide(a.id, "approved", MANAGER_NAME, "");
    // 3 天後：婉婷特休已核准（接下來 7 天請假預覽有料）
    var b = C.LeaveStore.submit({ employeeName:"婉婷", employeeEmail:"wan@demo.beyondpath.tw", leaveType:"annual", startDate:relDate(3), endDate:relDate(3), hours:null, reason:"" });
    C.LeaveStore.decide(b.id, "approved", MANAGER_NAME, "");
    // 一筆待批准：阿明特休（讓主管視角有一張卡可以批 / 退）
    C.LeaveStore.submit({ employeeName:"阿明", employeeEmail:"ming@demo.beyondpath.tw", leaveType:"annual", startDate:relDate(5), endDate:relDate(6), hours:null, reason:"連假出遊" });
    try { localStorage.setItem(FLAG, "1"); } catch (e) {}
  }
  function boot(){
    contentEl = el("content"); toastEl = el("toast"); greetingEl = el("greeting");
    themeBtnEl = el("themeBtn"); roleSwitchEl = el("roleSwitch"); roleHintEl = el("roleHint");
    try { var t = localStorage.getItem("bp_att_theme"); if (t) document.documentElement.setAttribute("data-theme", t); } catch (e) {}
    themeBtnEl.onclick = toggleTheme;
    applyThemeIcon();
    seedDemoIfEmpty();
    render();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.__BP_LEAVE__ = {
    setRole: function(r){ role = r; render(); },
    me: ME, core: C,
    seedDemo: function(){
      C.LeaveStore._resetForDemo();
      var a = C.LeaveStore.submit({ employeeName:"美玲", employeeEmail:ME.employeeEmail, leaveType:"annual", startDate:"2026-06-20", endDate:"2026-06-20", hours:8, reason:"家裡有事" });
      C.LeaveStore.decide(a.id, "approved", MANAGER_NAME, "");
      C.LeaveStore.submit({ employeeName:"小華", employeeEmail:"hua@demo.beyondpath.tw", leaveType:"sick", startDate:"2026-06-20", endDate:"2026-06-21", hours:16, reason:"感冒看醫生" });
      render();
    }
  };
})();
