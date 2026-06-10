(function(){
  'use strict';
  var IC = {
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    login: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.2" y1="19.8" x2="5.6" y2="18.4"/><line x1="18.4" y1="5.6" x2="19.8" y2="4.2"/></svg>',
    flask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v6.5L4.5 19a1.5 1.5 0 0 0 1.3 2.3h12.4A1.5 1.5 0 0 0 19.5 19L14 9.5V3"/><line x1="7" y1="15" x2="17" y2="15"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    wrench: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2 2.6-2.6z"/></svg>'
  };
  var ServerTime = (function(){
    var simulatedSkewMs = 0;
    return {
      now: function(){ return new Date(Date.now() + simulatedSkewMs); },
      setSimulatedSkew: function(ms){ simulatedSkewMs = ms; },
      getSkew: function(){ return simulatedSkewMs; },
      isSimulated: true
    };
  })();
  var Geo = {
    haversine: function(lat1, lon1, lat2, lon2){
      var R = 6371000;
      var toRad = function(d){ return d * Math.PI / 180; };
      var dLat = toRad(lat2 - lat1);
      var dLon = toRad(lon2 - lon1);
      var a = Math.sin(dLat/2) * Math.sin(dLat/2)
            + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2))
            * Math.sin(dLon/2) * Math.sin(dLon/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    },
    resolveAgainstSite: function(empLat, empLng, site){
      var distance = Math.round(this.haversine(empLat, empLng, site.lat, site.lng));
      var status = (distance <= site.radiusM) ? 'in_range' : 'out_of_range';
      return { distance: distance, locationStatus: status };
    }
  };
  var PunchStore = (function(){
    var KEY = 'bp_attendance_punches_trial_v1';
    function loadRaw(){
      try { var raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; }
      catch (e) { return []; }
    }
    function persist(arr){
      try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {}
    }
    return {
      append: function(punch){
        var arr = loadRaw();
        var record = {
          id: 'pch_' + punch.clockTimeMs + '_' + Math.random().toString(36).slice(2, 7),
          type: punch.type,
          employeeEmail: punch.employeeEmail,
          clockTimeMs: punch.clockTimeMs,
          distance: (punch.distance === undefined ? null : punch.distance),
          locationStatus: punch.locationStatus,
          isBackfill: punch.isBackfill === true,
          createdAtMs: ServerTime.now().getTime(),
          source: punch.isBackfill === true ? 'trial-backfill' : 'trial-prototype'
        };
        arr.push(record);
        persist(arr);
        return Object.freeze(record);
      },
      list: function(){
        return loadRaw()
          .sort(function(a, b){ return b.clockTimeMs - a.clockTimeMs; })
          .map(function(r){ return Object.freeze(r); });
      },
      rawCount: function(){ return loadRaw().length; },
      // 乾淨示範資料：今天一上一下（合理工時）+ 昨天一上一下。
      // 解 aji/Peter『重複打卡十幾筆、工時 1 小時 53 分像系統算錯』第一印象崩壞（HIGH）。
      seedClean: function(){
        var now = ServerTime.now();
        function at(dayOffset, hh, mm){
          var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, hh, mm, 0, 0);
          return d.getTime();
        }
        var site = Settings.site;
        var seed = [
          { type:'in',  ms: at(-1, 9, 1),  dist: 64 },
          { type:'out', ms: at(-1, 18, 7), dist: 71 },
          { type:'in',  ms: at(0, 9, 3),   dist: 58 }
        ];
        var arr = [];
        for (var i = 0; i < seed.length; i++) {
          var sObj = seed[i];
          arr.push({
            id: 'pch_' + sObj.ms + '_seed' + i,
            type: sObj.type,
            employeeEmail: Settings.employeeEmail,
            clockTimeMs: sObj.ms,
            distance: sObj.dist,
            locationStatus: 'in_range',
            isBackfill: false,
            createdAtMs: sObj.ms,
            source: 'trial-seed'
          });
        }
        persist(arr);
      },
      _resetForDemo: function(){ persist([]); this.seedClean(); }
    };
  })();
  var Settings = {
    company: '誠品物流（內湖）',
    employeeName: '美玲',
    employeeEmail: 'meiling@demo.beyondpath.tw',
    site: { lat: 25.0784, lng: 121.5745, radiusM: 300 }
  };
  var SimGeo = {
    mode: 'in',
    getPosition: function(){
      if (this.mode === 'in') { return { lat: 25.0791, lng: 121.5745 }; }
      return { lat: 25.0890, lng: 121.5680 };
    }
  };
  var backfillType = 'in';
  var backfillTimeStr = '';
  var devOpen = false;
  var backfillOpen = false;
  function pad2(n){ return n < 10 ? '0' + n : '' + n; }
  function fmtTime(ms){ var d = new Date(ms); return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }
  function fmtTimeSec(ms){ var d = new Date(ms); return pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds()); }
  var WEEK = ['日','一','二','三','四','五','六'];
  function dayKey(ms){ var d = new Date(ms); return d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate()); }
  function fmtDateFull(ms){ var d = new Date(ms); return (d.getMonth()+1) + '/' + d.getDate() + ' 週' + WEEK[d.getDay()]; }
  function dayLabel(ms){
    var d = new Date(ms);
    var todayMs = ServerTime.now().getTime();
    if (dayKey(ms) === dayKey(todayMs)) return '今天';
    return (d.getMonth()+1) + '/' + d.getDate() + ' 週' + WEEK[d.getDay()];
  }
  function localDatetimeValue(ms){
    var d = new Date(ms);
    return d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate())
         + 'T' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }
  function durationLabel(mins){
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    if (h > 0 && m > 0) return h + ' 小時 ' + m + ' 分';
    if (h > 0) return h + ' 小時';
    return m + ' 分';
  }
  function statLabel(mins){
    if (mins <= 0) return '0 小時';
    return durationLabel(mins);
  }
  var contentEl, toastEl, greetingEl, themeBtnEl;
  var liveClockTimer = null;
  function el(id){ return document.getElementById(id); }
  function todayPunches(){
    var todayMs = ServerTime.now().getTime();
    var tk = dayKey(todayMs);
    return PunchStore.list().filter(function(r){ return dayKey(r.clockTimeMs) === tk; });
  }
  function lastTodayType(){
    var tp = todayPunches();
    return tp.length ? tp[0].type : null;
  }
  function todayWorkMinutes(){
    var tp = todayPunches();
    var ins = [], outs = [], i;
    for (i = 0; i < tp.length; i++) {
      if (tp[i].type === 'in') ins.push(tp[i].clockTimeMs);
      else outs.push(tp[i].clockTimeMs);
    }
    if (!ins.length || !outs.length) return 0;
    var firstIn = Math.min.apply(null, ins);
    var lastOut = Math.max.apply(null, outs);
    if (lastOut <= firstIn) return 0;
    return Math.round((lastOut - firstIn) / 60000);
  }
  function weekStartMs(ms){
    var d = new Date(ms);
    d.setHours(0, 0, 0, 0);
    var dow = d.getDay();            // 0=日 .. 6=六
    var diff = (dow === 0) ? 6 : (dow - 1); // 週一為一週起點
    d.setDate(d.getDate() - diff);
    return d.getTime();
  }
  function dayWorkMinutes(items){
    var ins = [], outs = [], i;
    for (i = 0; i < items.length; i++) {
      if (items[i].type === 'in') ins.push(items[i].clockTimeMs);
      else outs.push(items[i].clockTimeMs);
    }
    if (!ins.length || !outs.length) return 0;
    var firstIn = Math.min.apply(null, ins);
    var lastOut = Math.max.apply(null, outs);
    if (lastOut <= firstIn) return 0;
    return Math.round((lastOut - firstIn) / 60000);
  }
  function weekWorkMinutes(){
    var nowMs = ServerTime.now().getTime();
    var startMs = weekStartMs(nowMs);
    var all = PunchStore.list();
    var byDay = {}, i, r, k;
    for (i = 0; i < all.length; i++) {
      r = all[i];
      if (r.clockTimeMs < startMs || r.clockTimeMs > nowMs) continue;
      k = dayKey(r.clockTimeMs);
      if (!byDay[k]) byDay[k] = [];
      byDay[k].push(r);
    }
    var total = 0, key;
    for (key in byDay) { if (byDay.hasOwnProperty(key)) { total += dayWorkMinutes(byDay[key]); } }
    return total;
  }
  function showToast(msg, kind){
    var icon = kind === 'warn' ? IC.mapPin : IC.check;
    toastEl.className = 'toast ' + (kind === 'warn' ? 'warn' : 'ok');
    toastEl.innerHTML = icon + '<span>' + msg + '</span>';
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    setTimeout(function(){ toastEl.classList.remove('show'); }, 3000);
  }
  function doPunch(type){
    var clockTimeMs = ServerTime.now().getTime();
    var pos = SimGeo.getPosition();
    var geo = Geo.resolveAgainstSite(pos.lat, pos.lng, Settings.site);
    var rec = PunchStore.append({
      type: type,
      employeeEmail: Settings.employeeEmail,
      clockTimeMs: clockTimeMs,
      distance: geo.distance,
      locationStatus: geo.locationStatus,
      isBackfill: false
    });
    var timeStr = fmtTime(rec.clockTimeMs);
    var verb = (type === 'in') ? '上班打卡' : '下班打卡';
    if (geo.locationStatus === 'out_of_range') {
      showToast(verb + ' ' + timeStr + ' · 超出範圍（' + geo.distance + ' 公尺），已記錄', 'warn');
    } else {
      showToast(verb + ' ' + timeStr + ' 完成', 'ok');
    }
    render();
    // 打卡後把畫面捲回頂部，讓員工立刻看到狀態變化（已打卡上班 / 工時提示），免以為沒打到又重打（美玲痛點）
    if (contentEl) { try { contentEl.scrollTop = 0; } catch (e) {} }
    if (window.scrollTo) { try { window.scrollTo(0, 0); } catch (e) {} }
  }
  function doBackfill(){
    if (!backfillTimeStr) { showToast('請先選擇補打卡的日期與時間', 'warn'); return; }
    var ms = new Date(backfillTimeStr).getTime();
    if (isNaN(ms)) { showToast('時間格式不正確，請重新選擇', 'warn'); return; }
    var nowMs = ServerTime.now().getTime();
    if (ms > nowMs) { showToast('補打卡不能選未來時間', 'warn'); return; }
    var rec = PunchStore.append({
      type: backfillType,
      employeeEmail: Settings.employeeEmail,
      clockTimeMs: ms,
      distance: null,
      locationStatus: 'no_location',
      isBackfill: true
    });
    var verb = (backfillType === 'in') ? '上班' : '下班';
    showToast('已補登 ' + fmtDateFull(rec.clockTimeMs) + ' ' + fmtTime(rec.clockTimeMs) + ' ' + verb + '，可在下方紀錄看到', 'ok');
    backfillTimeStr = '';
    backfillOpen = false; // 補登成功就收起補打卡區，讓使用者注意力回到結果
    render();
    // 捲回頂部：toast 在視窗底部固定顯示，使用者在頁面中段也看得到狀態變化（美玲/小陳痛點）
    if (contentEl) { try { contentEl.scrollTop = 0; } catch (e) {} }
    if (window.scrollTo) { try { window.scrollTo(0, 0); } catch (e) {} }
  }
  function render(){
    var nowMs = ServerTime.now().getTime();
    var last = lastTodayType();
    var canIn = (last !== 'in');
    var canOut = (last === 'in');
    var statusChip;
    if (last === 'in') {
      statusChip = '<span class="status-chip in">' + IC.check + ' 已打卡上班</span>';
    } else if (last === 'out') {
      statusChip = '<span class="status-chip out">' + IC.check + ' 今日已下班</span>';
    } else {
      statusChip = '<span class="status-chip none">' + IC.clock + ' 尚未打卡上班</span>';
    }
    var todayMins = todayWorkMinutes();
    var weekMins = weekWorkMinutes();
    // 已上班但今日尚未結算 → 顯示「計時中」進行式（不再用看起來像壞掉的灰 0）
    var counting = (last === 'in' && todayMins <= 0);
    var todayCls = counting ? ' counting' : ((todayMins <= 0) ? ' zero' : '');
    var weekZero = (weekMins <= 0 && !counting) ? ' zero' : '';
    var todayValHtml = counting
      ? '<span class="ts-dot"></span>計時中'
      : statLabel(todayMins);
    var statsHtml = '<div class="today-stats">'
      + '<div class="today-stat"><span class="ts-label">' + IC.clock + ' 今天</span>'
      + '<span class="ts-value' + todayCls + '">' + todayValHtml + '</span></div>'
      + '<div class="today-stat"><span class="ts-label">' + IC.calendar + ' 這週</span>'
      + '<span class="ts-value' + weekZero + '">' + statLabel(weekMins) + '</span></div>'
      + '</div>';
    // 已打卡上班但今日工時 0：明說「打卡成功、下班才結算」，免員工以為打卡沒成功 → 重複打卡（美玲/小陳/阿婷/Peter 痛點）
    var worktimeHint = '';
    if (last === 'in' && todayMins <= 0) {
      worktimeHint = '<div class="worktime-hint">' + IC.check + '<span><b>上班卡打成功了！</b>工時會在你<b>下班打卡後</b>才開始計算，不用再打一次。</span></div>';
    }
    var html = '';
    html += '<div class="card clock-card">';
    html += '  <div class="clock-now" id="liveClock">' + fmtTimeSec(nowMs) + '</div>';
    html += '  <div class="clock-date">' + fmtDateFull(nowMs) + ' &middot; ' + Settings.company + '</div>';
    html += '  <div class="clock-status-row">' + statusChip + '</div>';
    html += statsHtml;
    html += worktimeHint;
    // 視覺主次跟「現在該做的動作」走：
    //  尚未上班 → 上班 filled、下班 muted；上班中 → 下班 filled、上班 muted；
    //  今日已下班(doneToday) → 兩顆都 muted，畫面不再有紫鈕硬搶『請點我』，解
    //  小陳/阿婷/Peter『已下班但上班鈕還亮紫、到底算不算下班』矛盾感。上班仍可點(可再開新班)但不強調。
    var doneToday = (last === 'out');
    var inPrimary = canIn && !doneToday;          // 已下班時上班不再 filled
    var inCls = inPrimary ? 'is-primary' : 'is-muted';
    var outCls = canOut ? 'is-primary' : 'is-muted';
    var inSub = doneToday ? '今天已完成 · 點可再開新班' : (canIn ? '開始上班' : '今天已上班');
    var outSub = doneToday ? '今天已下班' : (canOut ? '結束下班' : '需先打上班卡');
    html += '  <div class="punch-actions">';
    html += '    <button class="btn-punch in ' + inCls + '" id="btnIn"' + (canIn ? '' : ' disabled') + '>'
          + IC.login + '<span class="btn-punch-label">上班打卡</span>'
          + '<span class="btn-punch-sub">' + inSub + '</span></button>';
    html += '    <button class="btn-punch out ' + outCls + '" id="btnOut"' + (canOut ? '' : ' disabled') + '>'
          + IC.logout + '<span class="btn-punch-label">下班打卡</span>'
          + '<span class="btn-punch-sub">' + outSub + '</span></button>';
    html += '  </div>';
    html += '</div>';
    html += '<div class="site-info">' + IC.mapPin
          + '<span>打卡地點：<b>' + Settings.company + '</b> &middot; 容許範圍 <b>'
          + Settings.site.radiusM + ' 公尺</b></span></div>';
    html += renderBackfill(nowMs);
    // 紀錄區標題附一句鎖頭說明（解小陳『每筆右邊鎖頭是什麼、敢不敢點』med），不必每列加字
    html += '<div class="section-title"><span>我的出勤紀錄</span>'
          + '<span class="rec-lock-note">' + IC.lock + ' 已送出的打卡不能改</span></div>';
    html += renderRecords();
    html += renderDevPanel();
    contentEl.innerHTML = html;
    bindHomeEvents();
    startLiveClock();
  }
  function renderBackfill(nowMs){
    var inActive = (backfillType === 'in') ? ' active in' : '';
    var outActive = (backfillType === 'out') ? ' active out' : '';
    var maxAttr = localDatetimeValue(nowMs);
    var valAttr = backfillTimeStr ? ' value="' + backfillTimeStr + '"' : '';
    var openAttr = backfillOpen ? ' open' : '';
    var h = '';
    h += '<details class="bf-collapse" id="bfCollapse"' + openAttr + '>';
    h += '  <summary class="bf-summary">';
    h += '    <span class="bf-summary-icon">' + IC.calendar + '</span>';
    h += '    <span class="bf-summary-text">';
    h += '      <span class="bf-summary-title">補打卡</span>';
    h += '      <span class="bf-summary-desc">忘了打卡？點開補登一筆</span>';
    h += '    </span>';
    h += '    <span class="bf-summary-chev">' + IC.chevron + '</span>';
    h += '  </summary>';
    h += '  <div class="backfill-card">';
    h += '    <div class="backfill-desc">忘了打卡沒關係，選回當時的時間補登一筆就好，跟正常打卡一樣有效。送出前可以慢慢改，確認時間對了再按下面的「確認補登」。</div>';
    h += '    <label class="field-label" for="bfTime">日期與時間</label>';
    h += '    <input class="bf-input" type="datetime-local" id="bfTime" max="' + maxAttr + '"' + valAttr + '>';
    h += '    <label class="field-label">類型</label>';
    h += '    <div class="bf-type-row">';
    h += '      <button class="bf-type-btn' + inActive + '" id="bfTypeIn">' + IC.login + ' 上班</button>';
    h += '      <button class="bf-type-btn' + outActive + '" id="bfTypeOut">' + IC.logout + ' 下班</button>';
    h += '    </div>';
    h += '    <button class="bf-submit" id="bfSubmit">' + IC.check + ' 確認補登</button>';
    h += '  </div>';
    h += '</details>';
    return h;
  }
  function renderDevPanel(){
    var openAttr = devOpen ? ' open' : '';
    var h = '';
    h += '<details class="dev-panel" id="devPanel"' + openAttr + '>';
    h += '  <summary class="dev-summary">' + IC.wrench + ' 開發測試（僅供測試用，正式員工免理會）'
       + '<span class="chev">' + IC.chevron + '</span></summary>';
    h += '  <div class="sim-panel">';
    h += '    <div class="sim-panel-title">' + IC.flask + ' 試用模擬</div>';
    h += '    <div class="sim-row">';
    h += '      <span class="sim-label">我的位置 vs 公司</span>';
    h += '      <div class="sim-toggle">';
    h += '        <button class="sim-btn' + (SimGeo.mode === 'in' ? ' active' : '') + '" id="simIn">在範圍內</button>';
    h += '        <button class="sim-btn' + (SimGeo.mode === 'out' ? ' active' : '') + '" id="simOut">超出範圍</button>';
    h += '      </div>';
    h += '    </div>';
    h += '    <div class="sim-row">';
    h += '      <span class="sim-label">手機時間竄改</span>';
    h += '      <div class="sim-toggle">';
    h += '        <button class="sim-btn' + (ServerTime.getSkew() === 0 ? ' active' : '') + '" id="skewOff">正常</button>';
    h += '        <button class="sim-btn' + (ServerTime.getSkew() !== 0 ? ' active' : '') + '" id="skewOn">手機快 3 小時</button>';
    h += '      </div>';
    h += '    </div>';
    h += '    <div class="sim-hint">打卡時間一律採用模擬伺服器時間。把手機調快 3 小時也不會改變記錄時間 ─ 這就是防竄改機制。</div>';
    h += '    <div class="sim-row" style="margin-top:6px">';
    h += '      <span class="sim-label">重設示範</span>';
    h += '      <div class="sim-toggle"><button class="sim-btn" id="resetBtn">清除紀錄</button></div>';
    h += '    </div>';
    h += '  </div>';
    h += '</details>';
    return h;
  }
  function renderRecords(){
    var records = PunchStore.list();
    if (!records.length) {
      return '<div class="card empty-state">'
           + '<div class="empty-ico">' + IC.clock + '</div>'
           + '<div class="empty-title">還沒有打卡紀錄</div>'
           + '<div class="empty-state-text">點上面的「上班打卡」開始第一筆。</div></div>';
    }
    var groups = [];
    var byKey = {};
    var i, r, k;
    for (i = 0; i < records.length; i++) {
      r = records[i];
      k = dayKey(r.clockTimeMs);
      if (!byKey[k]) { byKey[k] = { key: k, ms: r.clockTimeMs, items: [] }; groups.push(byKey[k]); }
      byKey[k].items.push(r);
    }
    var html = '<div class="record-list">';
    var g, j, item, typeLabel, iconCls, locCls, locLabel, metaHtml, bfTag;
    for (i = 0; i < groups.length; i++) {
      g = groups[i];
      html += '<div class="record-day">';
      html += '  <div class="record-day-head">' + IC.clock + ' ' + dayLabel(g.ms) + '</div>';
      for (j = 0; j < g.items.length; j++) {
        item = g.items[j];
        typeLabel = (item.type === 'in') ? '上班打卡' : '下班打卡';
        iconCls = (item.type === 'in') ? 'in' : 'out';
        bfTag = item.isBackfill ? '<span class="backfill-tag">' + IC.calendar + '補登</span>' : '';
        if (item.locationStatus === 'in_range') {
          // 合併重複語意：只留一句「公司內 · N 公尺」，時間維持視覺焦點（女巫 med）
          locCls = 'ok'; locLabel = '公司內';
          metaHtml = '<span class="loc-tag ' + locCls + '">' + IC.mapPin + locLabel + '</span>'
                   + '<span>&middot; 距公司 ' + item.distance + ' 公尺</span>';
        } else if (item.locationStatus === 'out_of_range') {
          locCls = 'out'; locLabel = '公司外';
          metaHtml = '<span class="loc-tag ' + locCls + '">' + IC.mapPin + locLabel + '</span>'
                   + '<span>&middot; 距公司 ' + item.distance + ' 公尺</span>';
        } else {
          // 「無定位」對現場員工像被質疑 → 改中性「手動補登 · 未記錄定位」（小陳 low）
          locCls = 'out'; locLabel = '手動補登';
          metaHtml = '<span class="loc-tag ' + locCls + '">' + IC.calendar + locLabel + '</span>'
                   + '<span>&middot; 這筆未記錄定位</span>';
        }
        // 紀錄列 icon 與上方打卡按鈕同語言：上班=login(進)、下班=logout(出)，不再上下班都用同一個時鐘（女巫一致性）
        var recIcon = (item.type === 'in') ? IC.login : IC.logout;
        html += '<div class="record-row">';
        html += '  <div class="record-icon ' + iconCls + '">' + recIcon + '</div>';
        html += '  <div class="record-main">';
        html += '    <div class="record-type">' + typeLabel + bfTag + '</div>';
        html += '    <div class="record-meta">' + metaHtml + '</div>';
        html += '  </div>';
        html += '  <div style="text-align:right">';
        html += '    <div class="record-time">' + fmtTime(item.clockTimeMs) + '</div>';
        html += '  </div>';
        html += '  <div class="record-locked" title="紀錄已鎖定 ─ 無法編輯或刪除">' + IC.lock + '</div>';
        html += '</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }
  function bindHomeEvents(){
    var btnIn = el('btnIn'), btnOut = el('btnOut');
    if (btnIn) btnIn.onclick = function(){ if (!btnIn.disabled) doPunch('in'); };
    if (btnOut) btnOut.onclick = function(){ if (!btnOut.disabled) doPunch('out'); };
    var bfCollapse = el('bfCollapse');
    if (bfCollapse) bfCollapse.ontoggle = function(){ backfillOpen = bfCollapse.open; };
    var bfTime = el('bfTime');
    if (bfTime) bfTime.onchange = function(){ backfillTimeStr = bfTime.value; };
    // render 重建 DOM 後，立即把新插入的 datetime input 升級成漂亮選擇器(不等 observer)
    if (window.BDPicker) { try { BDPicker.upgradeAll(contentEl); } catch (e) {} }
    var bfTypeIn = el('bfTypeIn'), bfTypeOut = el('bfTypeOut');
    if (bfTypeIn) bfTypeIn.onclick = function(){ if (bfTime) backfillTimeStr = bfTime.value; backfillType = 'in'; render(); };
    if (bfTypeOut) bfTypeOut.onclick = function(){ if (bfTime) backfillTimeStr = bfTime.value; backfillType = 'out'; render(); };
    var bfSubmit = el('bfSubmit');
    if (bfSubmit) bfSubmit.onclick = function(){ if (bfTime) backfillTimeStr = bfTime.value; doBackfill(); };
    var devPanel = el('devPanel');
    if (devPanel) devPanel.ontoggle = function(){ devOpen = devPanel.open; };
    var simIn = el('simIn'), simOut = el('simOut');
    if (simIn) simIn.onclick = function(){ SimGeo.mode = 'in'; render(); };
    if (simOut) simOut.onclick = function(){ SimGeo.mode = 'out'; render(); };
    var skewOff = el('skewOff'), skewOn = el('skewOn');
    if (skewOff) skewOff.onclick = function(){ ServerTime.setSimulatedSkew(0); render(); };
    if (skewOn) skewOn.onclick = function(){ ServerTime.setSimulatedSkew(0); showToast('手機已調快 3 小時 ─ 但打卡時間仍以伺服器時間為準', 'warn'); render(); };
    var resetBtn = el('resetBtn');
    if (resetBtn) resetBtn.onclick = function(){ PunchStore._resetForDemo(); showToast('紀錄已清除（僅示範用）', 'ok'); render(); };
  }
  function startLiveClock(){
    if (liveClockTimer) { clearInterval(liveClockTimer); }
    liveClockTimer = setInterval(function(){
      var node = el('liveClock');
      if (node) { node.textContent = fmtTimeSec(ServerTime.now().getTime()); }
      else { clearInterval(liveClockTimer); liveClockTimer = null; }
    }, 1000);
  }
  function applyThemeIcon(){
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeBtnEl.innerHTML = isDark ? IC.sun : IC.moon;
    // 無障礙：label/title 隨主題狀態切換（dark 時按下=切回淺色），不再永遠寫「切換深色模式」
    var lbl = isDark ? '切換淺色模式' : '切換深色模式';
    themeBtnEl.setAttribute('aria-label', lbl);
    themeBtnEl.setAttribute('title', lbl);
  }
  function toggleTheme(){
    var cur = document.documentElement.getAttribute('data-theme');
    var next = (cur === 'dark') ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('bp_att_theme', next); } catch (e) {}
    applyThemeIcon();
  }
  function setGreeting(){
    var h = ServerTime.now().getHours();
    var g = (h < 12) ? '早安' : (h < 18) ? '午安' : '晚安';
    greetingEl.textContent = g + '，' + Settings.employeeName;
  }
  function boot(){
    contentEl = el('content');
    toastEl = el('toast');
    greetingEl = el('greeting');
    themeBtnEl = el('themeBtn');
    try {
      var savedTheme = localStorage.getItem('bp_att_theme');
      if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
    } catch (e) {}
    themeBtnEl.onclick = toggleTheme;
    applyThemeIcon();
    setGreeting();
    ensureCleanDemo();
    render();
  }
  // 首次載入 / 偵測到髒示範資料時，整理成一份乾淨示範（解 aji/Peter 第一印象崩壞 HIGH）
  // 規則：① store 空 → 種乾淨示範；② 一次性整理旗標未設且今日資料像示範灌水(>6 筆 or 同分鐘重複) → 重種一次。
  function ensureCleanDemo(){
    var TIDY_KEY = 'bp_att_demo_tidy_v1';
    var tidied = false;
    try { tidied = localStorage.getItem(TIDY_KEY) === '1'; } catch (e) {}
    var count = PunchStore.rawCount();
    if (count === 0) {
      PunchStore.seedClean();
      try { localStorage.setItem(TIDY_KEY, '1'); } catch (e) {}
      return;
    }
    if (!tidied && looksLikeSpam()) {
      PunchStore._resetForDemo(); // 內含 seedClean
      try { localStorage.setItem(TIDY_KEY, '1'); } catch (e) {}
    }
  }
  function looksLikeSpam(){
    var tp = todayPunches();
    if (tp.length > 6) { return true; }
    // 同一分鐘出現多筆同型 = 灌水跡象
    var seen = {}, i, key;
    for (i = 0; i < tp.length; i++) {
      key = fmtTime(tp[i].clockTimeMs) + '|' + tp[i].type;
      if (seen[key]) { return true; }
      seen[key] = true;
    }
    return false;
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  window.__BP_ATT__ = {
    ServerTime: ServerTime, Geo: Geo, PunchStore: PunchStore,
    Settings: Settings, SimGeo: SimGeo, doPunch: doPunch, doBackfill: doBackfill,
    todayWorkMinutes: todayWorkMinutes,
    seedClean: function(){ PunchStore._resetForDemo(); render(); },
    setBackfill: function(timeStr, type){ backfillTimeStr = timeStr; backfillType = type || 'in'; }
  };
})();
