/* BeyondPath attendance leave/approval/annual-leave core engine (prototype, ES5) */
(function (root) {
  "use strict";

  var LEAVE_TYPES = [
    { id: "annual",      name: "特休",   paid: true,  affectsBalance: true  },
    { id: "sick",        name: "病假",   paid: false, affectsBalance: false },
    { id: "personal",    name: "事假",   paid: false, affectsBalance: false },
    { id: "marriage",    name: "婚假",   paid: true,  affectsBalance: false },
    { id: "bereavement", name: "喪假",   paid: true,  affectsBalance: false },
    { id: "official",    name: "公假",   paid: true,  affectsBalance: false },
    { id: "menstrual",   name: "生理假", paid: false, affectsBalance: false }
  ];
  function leaveTypeName(id) {
    for (var i = 0; i < LEAVE_TYPES.length; i++) {
      if (LEAVE_TYPES[i].id === id) return LEAVE_TYPES[i].name;
    }
    return id;
  }

  var SENIORITY_TABLE = [
    { minMonths: 6,   days: 3  },
    { minMonths: 12,  days: 7  },
    { minMonths: 24,  days: 10 },
    { minMonths: 36,  days: 14 },
    { minMonths: 60,  days: 15 },
    { minMonths: 120, days: 16 }
  ];
  var SENIORITY_MAX_DAYS = 30;
  var SENIORITY_10Y_BASE_DAYS = 15;

  function monthsBetween(hireDate, asOf) {
    var months = (asOf.getFullYear() - hireDate.getFullYear()) * 12
               + (asOf.getMonth() - hireDate.getMonth());
    if (asOf.getDate() < hireDate.getDate()) months -= 1;
    return months < 0 ? 0 : months;
  }

  function annualEntitlement(hireDateStr, asOf) {
    var hire = parseDate(hireDateStr);
    if (!hire) return 0;
    var ref = asOf || new Date();
    var months = monthsBetween(hire, ref);
    if (months < 6) return 0;
    if (months >= 120) {
      var fullYears = Math.floor(months / 12);
      var extra = fullYears - 10;
      var days = SENIORITY_10Y_BASE_DAYS + 1 + extra;
      return Math.min(days, SENIORITY_MAX_DAYS);
    }
    var hit = 0;
    for (var i = 0; i < SENIORITY_TABLE.length; i++) {
      if (months >= SENIORITY_TABLE[i].minMonths) hit = SENIORITY_TABLE[i].days;
    }
    return hit;
  }

  function pad2(n) { return n < 10 ? "0" + n : "" + n; }
  function parseDate(s) {
    if (!s) return null;
    var d = new Date(s.length <= 10 ? (s + "T00:00:00") : s);
    return isNaN(d.getTime()) ? null : d;
  }
  function dateKey(d) {
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }
  var WEEK = ["日", "一", "二", "三", "四", "五", "六"];
  function fmtDateZh(s) {
    var d = parseDate(s);
    if (!d) return s;
    return (d.getMonth() + 1) + "/" + d.getDate() + " 週" + WEEK[d.getDay()];
  }
  function dayKeysInRange(startStr, endStr) {
    var s = parseDate(startStr), e = parseDate(endStr);
    if (!s || !e) return [];
    if (e < s) { var t = s; s = e; e = t; }
    var keys = [];
    var cur = new Date(s.getFullYear(), s.getMonth(), s.getDate());
    var end = new Date(e.getFullYear(), e.getMonth(), e.getDate());
    var guard = 0;
    while (cur <= end && guard < 400) {
      keys.push(dateKey(cur));
      cur.setDate(cur.getDate() + 1);
      guard++;
    }
    return keys;
  }
  function defaultHours(startStr, endStr) {
    return dayKeysInRange(startStr, endStr).length * 8;
  }

  var STATUS = { PENDING: "pending", APPROVED: "approved", REJECTED: "rejected" };
  function statusName(s) {
    if (s === STATUS.APPROVED) return "已核准";
    if (s === STATUS.REJECTED) return "已退件";
    return "待批准";
  }
  function canTransition(from, to) {
    if (from !== STATUS.PENDING) return false;
    return to === STATUS.APPROVED || to === STATUS.REJECTED;
  }

  // 雲端為真相：請假紀錄由 leave-cloud.js 載入後注入這裡，純計算函式都吃這份。
  var _records = [];            // 全部相關 record（前端已轉形狀）
  var _roster = [];             // 名冊鏡像 [{name,email,managerEmail,isActive}]
  function setRecords(arr) { _records = arr ? arr.slice() : []; }
  function setRoster(arr) { _roster = arr ? arr.slice() : []; }
  function allRecords() { return _records.slice(); }
  function listApprovedRecords() {
    return _records.filter(function (r) { return r.status === STATUS.APPROVED; });
  }

  function annualUsedDays(email, year) {
    var approved = listApprovedRecords();
    var used = 0;
    for (var i = 0; i < approved.length; i++) {
      var r = approved[i];
      if (r.employeeEmail !== email) continue;
      if (r.leaveType !== "annual") continue;
      var sd = parseDate(r.startDate);
      if (!sd) continue;
      if (year && sd.getFullYear() !== year) continue;
      var hrs = (r.hours !== null && !isNaN(r.hours)) ? r.hours : defaultHours(r.startDate, r.endDate);
      used += hrs / 8;
    }
    return Math.round(used * 100) / 100;
  }
  function annualBalance(emp, asOf) {
    var ref = asOf || new Date();
    var year = ref.getFullYear();
    var entitled = annualEntitlement(emp.hireDate, ref);
    var used = annualUsedDays(emp.employeeEmail, year);
    var remaining = Math.round((entitled - used) * 100) / 100;
    if (remaining < 0) remaining = 0;
    return { entitled: entitled, used: used, remaining: remaining, year: year };
  }
  function approvedCountOnDay(dayKeyStr, excludeEmail) {
    var approved = listApprovedRecords();
    var names = [];
    for (var i = 0; i < approved.length; i++) {
      var r = approved[i];
      if (excludeEmail && r.employeeEmail === excludeEmail) continue;
      var keys = dayKeysInRange(r.startDate, r.endDate);
      for (var j = 0; j < keys.length; j++) {
        if (keys[j] === dayKeyStr) { names.push(r.employeeName + "（" + leaveTypeName(r.leaveType) + "）"); break; }
      }
    }
    return { count: names.length, names: names };
  }
  function overlapForRequest(req) {
    var keys = dayKeysInRange(req.startDate, req.endDate);
    var perDay = [];
    var peak = 0, peakNames = [];
    for (var i = 0; i < keys.length; i++) {
      var info = approvedCountOnDay(keys[i], req.employeeEmail);
      perDay.push({ dayKey: keys[i], count: info.count, names: info.names });
      if (info.count > peak) { peak = info.count; peakNames = info.names; }
    }
    return { perDay: perDay, peak: peak, peakNames: peakNames, days: keys.length };
  }

  /* === 團隊名冊（示範）：主管視角需要『今天誰在 / 誰請假 / 各人特休還剩幾天』，
     原本只有當日請假數，沒有在崗人力與團隊特休總覽（試用回饋 HIGH）。 === */
  // TEAM 改由名冊鏡像注入（setRoster）；以下函式皆以 _roster 為準。
  function teamSize() { return _roster.length; }
  // 今日在崗概況：總人數 / 今天請假人數 / 在崗人數 + 請假名單
  function todayHeadcount(dayKeyStr) {
    var info = approvedCountOnDay(dayKeyStr, null);
    var total = _roster.length;
    var onLeave = info.count;
    var present = total - onLeave;
    if (present < 0) present = 0;
    return { total: total, present: present, onLeave: onLeave, leaveNames: info.names };
  }
  // 團隊特休總覽：每位成員剩餘天數（給主管算薪 / 排休一眼看）
  function teamAnnualOverview(asOf) {
    var ref = asOf || new Date();
    var rows = [];
    for (var i = 0; i < _roster.length; i++) {
      // 鏡像不含到職日（敏感留在名冊本體）→ 特休基準後續接；這版以申請單累計，entitled 暫以 0 顯示佔位。
      var emp = { employeeName: _roster[i].name, employeeEmail: _roster[i].email, hireDate: _roster[i].hireDate || null };
      var b = annualBalance(emp, ref);
      rows.push({ employeeName: emp.employeeName, employeeEmail: emp.employeeEmail,
        entitled: b.entitled, used: b.used, remaining: b.remaining });
    }
    return rows;
  }
  // 接下來 N 天有核准請假的日子（給主管看人力缺口；只列有人請假的日）
  function upcomingLeave(days) {
    var n = days || 7;
    var out = [];
    var base = new Date();
    for (var d = 0; d < n; d++) {
      var day = new Date(base.getFullYear(), base.getMonth(), base.getDate() + d);
      var key = dateKey(day);
      var info = approvedCountOnDay(key, null);
      if (info.count > 0) {
        out.push({ dayKey: key, label: fmtDateZh(key), count: info.count, names: info.names,
          present: Math.max(0, _roster.length - info.count) });
      }
    }
    return out;
  }

  var API = {
    LEAVE_TYPES: LEAVE_TYPES, STATUS: STATUS, SENIORITY_TABLE: SENIORITY_TABLE,
    leaveTypeName: leaveTypeName, statusName: statusName, canTransition: canTransition,
    parseDate: parseDate, dateKey: dateKey, fmtDateZh: fmtDateZh,
    dayKeysInRange: dayKeysInRange, defaultHours: defaultHours, monthsBetween: monthsBetween,
    annualEntitlement: annualEntitlement, annualUsedDays: annualUsedDays, annualBalance: annualBalance,
    approvedCountOnDay: approvedCountOnDay, overlapForRequest: overlapForRequest,
    setRecords: setRecords, setRoster: setRoster, allRecords: allRecords, listApprovedRecords: listApprovedRecords,
    teamSize: teamSize, todayHeadcount: todayHeadcount, teamAnnualOverview: teamAnnualOverview, upcomingLeave: upcomingLeave
  };
  if (typeof module !== "undefined" && module.exports) { module.exports = API; }
  root.LeaveCore = API;
})(typeof window !== "undefined" ? window : this);
