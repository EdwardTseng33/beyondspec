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

  /* 身分由 identity.js（名冊鏡像）解析；不再寫死任何人。 */
  var _id = null;            // BPIdentity 身分快照
  var _me = { name: "", email: "", managerEmail: "" };  // 當前登入者（員工視角）
  var _view = "employee";    // 目前看哪張臉：employee | manager（僅在身分允許時可切）
  /* 雲端載入的資料 */
  var _mine = [];            // 我自己的申請
  var _forManager = [];      // 指派給我的單（主管視角）
  var _roster = [];          // 名冊鏡像
  var _loading = false;

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
    var bal = C.annualBalance({ employeeName: _me.name, employeeEmail: _me.email, hireDate: null }, new Date());
    var mine = _mine;
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
    // 「示範數字」改成獨立明顯提醒卡（不再是特休卡底部的小灰字），算薪的人一眼看到、不會把數字當真（med 痛點）
    html += "<div class=\"demo-note\">" + IC.info + "<span>特休天數依<b>到職日與勞基法年資</b>自動核算。你的特休基準正在與人資名冊同步中，數字會自動更新。</span></div>";

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
    // 合併兩段重複說明成一段條列，急著請假也能 3 秒看完（試用回饋 med）
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
    var pending = _forManager.filter(function(r){ return r.status === "pending"; });
    var html = "";

    /* 今日人力概況：改成『在崗 / 請假 / 總數』三段，主管批假最在意『今天還有幾個人在』（試用回饋 HIGH） */
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
    /* 接下來 7 天人力缺口：有人請假的日子才列，幫主管排隔天班（試用回饋 HIGH） */
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

    /* recently decided（解「核准後就消失、沒地方查核對」痛點） */
    var decided = _forManager.filter(function(r){ return r.status !== "pending"; });
    if (decided.length) {
      html += "<div class=\"section-title\"><span>近期已處理</span><span class=\"count-pill\">" + decided.length + " 件</span></div>";
      var show = decided.slice(0, 8);
      for (var k = 0; k < show.length; k++) {
        html += renderDecidedRow(show[k]);
      }
    }
    /* 團隊特休總覽：主管/算薪一眼看每人剩幾天（試用回饋 HIGH） */
    html += renderTeamAnnual();
    /* 特休折現：Pro 功能入口（原本完全看不到，月底算換錢找不到 — med） */
    html += "<div class=\"pro-entry\">"
         + "<div class=\"pro-entry-main\"><div class=\"pro-title\">" + IC.info + " 特休未休折現 <span class=\"pro-tag\">Pro</span></div>"
         + "<div class=\"pro-desc\">年底把員工沒休完的特休換算成工資，系統自動算金額。升級 Pro 後在這裡操作。</div></div>"
         + "</div>";
    /* 把「之後餵給薪資」改成具體說明：何時生效、去哪看、會算什麼（試用回饋 med — 模糊比沒說更不安） */
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

  /* 團隊特休總覽卡：列出每位成員剩餘 / 已用特休，主管算薪 / 排休一眼看（試用回饋 HIGH） */
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
  function renderFaceSwitch(){
    // 只有「同時是主管」的人才需要切換兩張臉；純員工不顯示切換、直接員工臉。
    var canManage = _id && _id.isManager;
    if (!canManage) {
      roleSwitchEl.innerHTML = "";
      roleHintEl.textContent = "員工視角：看自己的特休餘額、線上請假、追蹤申請狀態";
      return;
    }
    var emp = (_view === "employee") ? " active" : "";
    var mgr = (_view === "manager") ? " active" : "";
    roleSwitchEl.innerHTML =
      "<button class=\"role-btn" + emp + "\" data-view=\"employee\">" + IC.user + " 我的請假</button>" +
      "<button class=\"role-btn" + mgr + "\" data-view=\"manager\">" + IC.shield + " 待我批准</button>";
    roleHintEl.textContent = (_view === "employee")
      ? "員工視角：看自己的特休餘額、線上請假、追蹤申請狀態"
      : "主管視角：審核指派給你的請假（下方名字是申請人，不是你）";
    var btns = roleSwitchEl.querySelectorAll(".role-btn");
    for (var i = 0; i < btns.length; i++) {
      btns[i].onclick = function(){ _view = this.getAttribute("data-view"); render(); };
    }
  }

  function render(){
    var hr = new Date().getHours();
    var greet = (hr < 12) ? "早安" : (hr < 18) ? "午安" : "晚安";
    var showManager = (_view === "manager" && _id && _id.isManager);
    greetingEl.textContent = showManager
      ? "出勤管理 · " + (_me.name || "主管")
      : (greet + "，" + (_me.name || "同事"));
    renderFaceSwitch();
    if (_loading) {
      contentEl.innerHTML = "<div class=\"card empty-state\"><div class=\"empty-ico\">" + IC.clock + "</div><div class=\"empty-title\">載入中…</div><div class=\"empty-state-text\">正在從雲端讀取你的資料。</div></div>";
      return;
    }
    contentEl.innerHTML = showManager ? renderManager() : renderEmployee();
    if (window.BDPicker) { try { BDPicker.upgradeAll(contentEl); } catch (e) {} }
    if (showManager) bindManager(); else bindEmployee();
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
    if (!window.LeaveCloud || !LeaveCloud.ready()) { showToast("尚未連上雲端，請稍後再試", "err"); return; }
    var typeName = C.leaveTypeName(draft.leaveType);
    LeaveCloud.submit({
      employeeName: _me.name,
      employeeEmail: _me.email,
      managerEmail: _me.managerEmail,
      leaveType: draft.leaveType,
      startDate: draft.startDate,
      endDate: draft.endDate,
      hours: (hrs === "" ? null : Number(hrs)),
      reason: draft.reason
    }).then(function(res){
      if (res.ok) {
        showToast("已送出 " + typeName + " 申請，等待主管批准", "ok");
        draft = { leaveType: "annual", startDate: "", endDate: "", hours: "", reason: "" };
        reloadAll();
      } else {
        showToast(res.reason || "送出失敗，請再試一次", "err");
      }
      if (contentEl) { try { contentEl.scrollTop = 0; } catch (e) {} }
      if (window.scrollTo) { try { window.scrollTo(0, 0); } catch (e) {} }
    });
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
        var rec = findById(id);
        if (!rec) { showToast("找不到這筆申請", "err"); render(); return; }
        var dateStr = C.fmtDateZh(rec.startDate) + (rec.endDate !== rec.startDate ? " ─ " + C.fmtDateZh(rec.endDate) : "");
        if (act === "approve") {
          // 批假是有效力的動作 → 先確認，避免滑快誤觸（試用回饋）
          openModal({
            kind: "approve",
            title: "確定要核准嗎？",
            bodyHtml: "核准 <b>" + esc(rec.employeeName) + "</b> 的 <b>" + esc(C.leaveTypeName(rec.leaveType)) + "</b><br>" + esc(dateStr) + " · " + hoursLabel(rec),
            confirmLabel: "確定核准",
            onConfirm: function(){
              LeaveCloud.decide(id, "approved", _me.name, "").then(function(d){
                if (d.ok) showToast("已核准 " + rec.employeeName + " 的" + C.leaveTypeName(rec.leaveType) + "（已通知員工）", "ok");
                else showToast(d.reason, "err");
                reloadAll();
              });
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
              LeaveCloud.decide(id, "rejected", _me.name, note || "").then(function(d2){
                if (d2.ok) showToast("已退件 " + rec.employeeName + " 的申請（已通知員工）", "warn");
                else showToast(d2.reason, "err");
                reloadAll();
              });
            }
          });
        }
      };
    }
  }

  function findById(id){
    for (var i = 0; i < _forManager.length; i++) { if (_forManager[i].id === id) { return _forManager[i]; } }
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

  // ============ 身分 + 登入 overlay ============
  function showLoginOverlay(show){
    var ov = el("loginOverlay");
    var shell = el("appShell");
    if (ov) { ov.hidden = !show; }
    if (shell) { shell.style.visibility = show ? "hidden" : "visible"; }
  }
  function setLoginMsg(text, kind){
    var m = el("loginMsg");
    if (!m) return;
    if (!text) { m.hidden = true; return; }
    m.hidden = false;
    m.className = "login-msg " + (kind === "err" ? "err" : "info");
    m.innerHTML = text;
  }
  function bindLoginButton(){
    var btn = el("loginBtn");
    if (!btn) return;
    btn.onclick = function(){
      setLoginMsg("<span class=\"login-spinner\"></span>正在開啟 Google 登入…", "info");
      BPIdentity.signIn().then(function(){ setLoginMsg("", null); })
      ["catch"](function(err){
        var msg = (err && err.message) || "";
        if (/popup|cancel|closed/i.test(msg)) setLoginMsg("登入視窗被關掉了，再點一次。", "info");
        else if (/disallowed_useragent|user-agent/i.test(msg)) setLoginMsg("你正在 LINE / FB 內建瀏覽器中，請改用 Safari 或 Chrome 開啟。", "err");
        else setLoginMsg("登入沒成功：" + msg, "err");
      });
    };
  }
  function showGuidanceOverlay(show){
    var ov = el("guidanceOverlay");
    var shell = el("appShell");
    if (!show) { if (ov) ov.hidden = true; if (shell) shell.style.visibility = "visible"; return; }
    if (shell) shell.style.visibility = "hidden";
    var myEmail = (_id && _id.account) ? _id.account.email : "";
    var title, desc;
    if (_id && _id.errorKind === "network") { title = "現在連不上網路"; desc = "連上網路後重新整理這一頁就可以了。"; }
    else if (_id && _id.errorKind === "index-missing") { title = "系統正在開通中"; desc = "出勤資料庫索引尚未建立完成，請稍候或聯絡管理員。"; }
    else { title = "你的帳號還沒加入公司名冊"; desc = "請老闆在 BeyondPath「算薪水 → 員工檔案」把這個信箱填進你的資料，加好後重新整理就能用了。"; }
    if (!ov) { ov = document.createElement("div"); ov.id = "guidanceOverlay"; ov.className = "login-overlay"; document.body.appendChild(ov); }
    ov.hidden = false;
    var h = "<div class=\"login-card\">";
    h += "<div class=\"login-logo\">" + IC.shield + "</div>";
    h += "<div class=\"login-brand\">BeyondPath 出缺勤</div>";
    h += "<div class=\"login-title\">" + title + "</div>";
    h += "<div class=\"login-sub\">" + desc + "</div>";
    if (myEmail) {
      h += "<div class=\"guide-email-row\"><span class=\"guide-email\" id=\"guideEmail\">" + esc(myEmail) + "</span>";
      h += "<button class=\"guide-copy\" id=\"guideCopyBtn\">複製信箱</button></div>";
    }
    h += "<button class=\"login-btn\" id=\"guideRetryBtn\" style=\"margin-top:16px\">重新整理</button>";
    h += "<button class=\"guide-signout\" id=\"guideSignoutBtn\">換一個帳號登入</button>";
    h += "</div>";
    ov.innerHTML = h;
    var cb = el("guideCopyBtn"); if (cb) cb.onclick = function(){ _copyText(myEmail, cb); };
    var rb = el("guideRetryBtn"); if (rb) rb.onclick = function(){ try { location.reload(); } catch (e) {} };
    var sb = el("guideSignoutBtn"); if (sb) sb.onclick = function(){
      BPIdentity.signOut().then(function(){ _id = null; showGuidanceOverlay(false); showLoginOverlay(true); bindLoginButton(); });
    };
  }
  function _copyText(text, btn){
    function done(){ if (btn){ var o=btn.textContent; btn.textContent="已複製"; setTimeout(function(){ btn.textContent=o; },1500); } }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done)["catch"](function(){ _copyFallback(text,done); });
      else _copyFallback(text, done);
    } catch (e) { _copyFallback(text, done); }
  }
  function _copyFallback(text, done){
    try { var ta=document.createElement("textarea"); ta.value=text; ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); done(); } catch (e) {}
  }

  // ============ 雲端資料載入 ============
  function reloadAll(){
    if (_loading) { return; }
    if (!window.LeaveCloud || !LeaveCloud.ready()) { return; }
    _loading = true; render();
    var jobs = [ LeaveCloud.listMine(), LeaveCloud.listRoster() ];
    if (_id && _id.isManager) { jobs.push(LeaveCloud.listForManager()); } else { jobs.push(Promise.resolve({ ok:true, records:[] })); }
    Promise.all(jobs).then(function(res){
      _mine = (res[0] && res[0].records) ? res[0].records : [];
      _roster = (res[1] && res[1].roster) ? res[1].roster : [];
      _forManager = (res[2] && res[2].records) ? res[2].records : [];
      // 餵給 leave-core 純計算（特休餘額 / 當日人力 / 團隊總覽）
      // 員工餘額用自己的單；主管視角的人力 / 總覽用 manager 視野 + 名冊
      var combined = _mine.slice();
      for (var i=0;i<_forManager.length;i++){ var dup=false; for(var j=0;j<combined.length;j++){ if(combined[j].id===_forManager[i].id){dup=true;break;} } if(!dup) combined.push(_forManager[i]); }
      C.setRecords(combined);
      C.setRoster(_roster);
      _loading = false; render();
    })["catch"](function(){ _loading = false; render(); });
  }

  // ============ 身分變化 ============
  function onIdentityChange(s){
    _id = s;
    if (s.account) { _me = { name: s.employeeName || s.account.name, email: s.account.email, managerEmail: s.managerEmail || "" }; }
    if (window.LeaveCloud) { LeaveCloud.setContext(s.account, s.wsId); }
    if (!s.isSignedIn) {
      if (s.authResolved) { showGuidanceOverlay(false); showLoginOverlay(true); bindLoginButton(); if (!s.ready) setLoginMsg("連不上登入服務，連上網後重新整理即可。", "err"); }
      return;
    }
    if (s.resolving) { showLoginOverlay(false); showGuidanceOverlay(false); return; }
    if (s.friendly || s.errorKind) { showLoginOverlay(false); showGuidanceOverlay(true); return; }
    // 有身分：純員工預設員工臉；同時是主管的人預設也先看自己的請假
    showLoginOverlay(false); showGuidanceOverlay(false);
    if (!_id.isManager) { _view = "employee"; }
    reloadAll();
  }

  function boot(){
    contentEl = el("content"); toastEl = el("toast"); greetingEl = el("greeting");
    themeBtnEl = el("themeBtn"); roleSwitchEl = el("roleSwitch"); roleHintEl = el("roleHint");
    try { var t = localStorage.getItem("bp_att_theme"); if (t) document.documentElement.setAttribute("data-theme", t); } catch (e) {}
    if (themeBtnEl) themeBtnEl.onclick = toggleTheme;
    applyThemeIcon();
    bindLoginButton();
    showLoginOverlay(true);
    if (window.BPIdentity) {
      BPIdentity.onChange(onIdentityChange);
      BPIdentity.init();
    } else {
      setLoginMsg("系統元件載入失敗，請重新整理頁面。", "err");
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.__BP_LEAVE__ = {
    getIdentity: function(){ return _id; },
    getMine: function(){ return _mine; },
    getForManager: function(){ return _forManager; },
    core: C
  };
})();
