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
    // 正式版：本地只當「離線暫存佇列」由 cloud.js 管，這裡不再種任何示範資料。
    // 保留極簡 list/append 介面僅供極端 fallback；雲端為唯一真相。
    var KEY = 'bp_attendance_punches_local_v2';
    function loadRaw(){
      try { var raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; }
      catch (e) { return []; }
    }
    function persist(arr){
      try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {}
    }
    return {
      list: function(){
        return loadRaw().sort(function(a, b){ return b.clockTimeMs - a.clockTimeMs; });
      },
      rawCount: function(){ return loadRaw().length; },
      clear: function(){ persist([]); }
    };
  })();

  var Settings = {
    company: '誠品物流（內湖）',
    site: { lat: 25.0784, lng: 121.5745, radiusM: 300 }
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
  // ── 身分 + 雲端狀態（身分由 identity.js 名冊鏡像解析；雲端為資料真相）──
  var _idState = null;          // BPIdentity 完整身分快照
  var _cloudReady = false;      // Firebase SDK + auth resolved
  var _cloudUser = null;        // 當前登入帳號物件 { email, name, uid, photoURL }
  var _cloudOnline = false;     // 最近一次讀寫雲端是否成功（決定顯示線上/離線）
  var _cloudRecords = [];       // 從雲端拉回的打卡紀錄（render 用這份）
  var _loadingRecords = false;
  var liveClockTimer = null;
  function el(id){ return document.getElementById(id); }
  function todayPunches(){
    var todayMs = ServerTime.now().getTime();
    var tk = dayKey(todayMs);
    return allRecords().filter(function(r){ return dayKey(r.clockTimeMs) === tk; });
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
    var all = allRecords();
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
  // 樂觀打卡（体験 S2-C/F/G/H + 防呆1/7）：
  //  1) 先擋重複打卡（防呆1：本機=雲端真相雙查）
  //  2) 立即顯示「完成」成功 toast（不等 GPS、不等雲端）→ 員工 3 秒內拿到回饋
  //  3) 背景跑 GPS（硬上限 5 秒，逾時不阻擋）→ 寫雲端（clockTime 用 server 時間）
  //  4) 只有「不在範圍 / 拿不到定位 / 雲端沒存到」才補一則狀態 toast；在範圍則不再二次打擾
  var _punching = false;
  function doPunch(type){
    if (!_cloudUser) { showToast('請先登入再打卡', 'warn'); return; }
    if (_punching) { return; }                       // 防連點兩次同一鈕
    // 防呆1：重複打卡擋下（今天同類型已打過）— S2-I
    var lastType = lastTodayType();
    if (type === 'in' && lastType === 'in') {
      var lastIn = _firstTodayTimeOf('in');
      showToast('你今天上班已經打過卡了' + (lastIn ? '（' + lastIn + '）' : ''), 'warn');
      return;
    }
    if (type === 'out' && lastType !== 'in') {
      showToast('要先打上班卡，才能打下班卡', 'warn');
      return;
    }
    _punching = true;
    var verb = (type === 'in') ? '上班打卡' : '下班打卡';
    var nowMs = BPCloud.nowMs();
    // ── 步驟 2：立即樂觀成功 toast（含時間）──
    showToast(verb + ' 完成 ' + fmtTime(nowMs), 'ok');
    // ── 步驟 3：背景 GPS（5 秒硬上限，逾時照常打卡）──
    _withGeo(function(geo){
      BPCloud.appendPunch({
        type: type,
        employeeEmail: _cloudUser.email,
        clockTimeMs: nowMs,
        distance: geo.distance,
        locationStatus: geo.locationStatus,
        isBackfill: false
      }).then(function(res){
        _punching = false;
        // ── 步驟 4：只有需要提醒時才補 toast ──
        if (!res.online) {
          showToast(res.message || (verb + ' 已存這台手機（離線），連上自動補傳'), 'warn');
        } else if (geo.locationStatus === 'out_of_range') {
          showToast('打卡成功，但偵測到你不在公司附近，已標記給 HR 確認', 'warn');
        } else if (geo.locationStatus === 'denied') {
          showToast('已打卡，沒抓到位置，已幫你標記', 'warn');
        } else if (geo.locationStatus === 'timeout' || geo.locationStatus === 'no_location') {
          showToast('已打卡，這次定位未完成，已照常記錄', 'warn');
        }
        // 在範圍（in_range）：成功 toast 已給，不再二次打擾
        reloadRecords(false);
        if (contentEl) { try { contentEl.scrollTop = 0; } catch (e) {} }
        if (window.scrollTo) { try { window.scrollTo(0, 0); } catch (e) {} }
      })['catch'](function(){
        _punching = false;
        showToast(verb + ' 送出時出了點問題，請截圖回報 HR', 'warn');
      });
    });
  }
  // 今天某類型第一筆的時間（給重複打卡 toast 顯示「09:03」）
  function _firstTodayTimeOf(type){
    var tp = todayPunches();
    var t = null;
    for (var i = 0; i < tp.length; i++) {
      if (tp[i].type === type) { t = tp[i].clockTimeMs; }   // tp 由新到舊，留最後一筆=最早
    }
    return t ? fmtTime(t) : null;
  }

  // 取得目前定位並對打卡點算距離；任何失敗都不擋打卡（樂觀流已先成功）。
  // 硬上限 5 秒（防呆7）：就算 geolocation 整個 hang 住，也一定在 5 秒內回 timeout 讓雲端照常寫。
  function _withGeo(cb){
    if (!navigator.geolocation) {
      cb({ distance: null, locationStatus: 'no_location' });
      return;
    }
    var done = false;
    function finish(result){ if (done) return; done = true; cb(result); }
    var capTimer = setTimeout(function(){ finish({ distance: null, locationStatus: 'timeout' }); }, 5000);
    function finishClear(result){ try { clearTimeout(capTimer); } catch (e) {} finish(result); }
    navigator.geolocation.getCurrentPosition(
      function(pos){
        try {
          var geo = Geo.resolveAgainstSite(pos.coords.latitude, pos.coords.longitude, Settings.site);
          finishClear(geo);
        } catch (e) {
          finishClear({ distance: null, locationStatus: 'no_location' });
        }
      },
      function(err){
        // 權限被拒（code 1）→ denied；其餘（逾時/取不到 code 2/3）→ timeout，文案不同
        var denied = err && err.code === 1;
        finishClear({ distance: null, locationStatus: denied ? 'denied' : 'timeout' });
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
    );
  }

  function doBackfill(){
    if (!_cloudUser) { showToast('請先登入再補打卡', 'warn'); return; }
    if (!backfillTimeStr) { showToast('請先選好補打卡的日期和時間', 'warn'); return; }
    var ms = new Date(backfillTimeStr).getTime();
    if (isNaN(ms)) { showToast('時間格式不正確，請重新選擇', 'warn'); return; }
    var nowMs = BPCloud.nowMs();
    if (ms > nowMs) { showToast('不能補打卡未來的時間，請確認日期和時間是否填對了', 'warn'); return; }
    var verb = (backfillType === 'in') ? '上班' : '下班';
    BPCloud.appendPunch({
      type: backfillType,
      employeeEmail: _cloudUser.email,
      clockTimeMs: ms,
      distance: null,
      locationStatus: 'no_location',
      isBackfill: true
    }).then(function(res){
      if (res.online) {
        showToast('補打卡申請已送出，HR 確認後生效（' + fmtDateFull(ms) + ' ' + fmtTime(ms) + ' ' + verb + '）', 'ok');
      } else {
        showToast(res.message || '補登已暫存（離線），連上自動補傳', 'warn');
      }
      backfillTimeStr = '';
      backfillOpen = false;
      reloadRecords(false);
      if (contentEl) { try { contentEl.scrollTop = 0; } catch (e) {} }
      if (window.scrollTo) { try { window.scrollTo(0, 0); } catch (e) {} }
    });
  }

  function render(){
    renderTopbarActions();
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
    // 已打卡上班但今日工時 0：明說「打卡成功、下班才結算」，免員工以為打卡沒成功 → 重複打卡（試用回饋痛點）
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
    //  試用回饋『已下班但上班鈕還亮紫、到底算不算下班』矛盾感。上班仍可點(可再開新班)但不強調。
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
    // 紀錄區標題附一句鎖頭說明（解試用回饋『每筆右邊鎖頭是什麼、敢不敢點』med），不必每列加字
    html += '<div class="section-title"><span>我的出勤紀錄</span>'
          + '<span class="rec-lock-note">' + IC.lock + ' 已送出的打卡不能改</span></div>';
    html += renderRecords();
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
    h += '    <button class="bf-submit" id="bfSubmit">' + IC.check + ' 送出補打卡申請</button>';
    h += '  </div>';
    h += '</details>';
    return h;
  }
  function renderRecords(){
    var records = allRecords();
    if (!records.length) {
      return '<div class="card empty-state">'
           + '<div class="empty-ico">' + IC.clock + '</div>'
           + '<div class="empty-title">今天是你在系統的第一天！</div>'
           + '<div class="empty-state-text">打卡就能開始累積紀錄。</div></div>';
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
          // 無定位：補登 → 標「手動補登」；即時打卡但沒拿到 GPS（拒絕/逾時）→ 中性「未記錄定位」，不暗示被質疑（試用回饋 low）
          locCls = 'out';
          if (item.isBackfill) {
            locLabel = '手動補登';
            metaHtml = '<span class="loc-tag ' + locCls + '">' + IC.calendar + locLabel + '</span>'
                     + '<span>&middot; 這筆未記錄定位</span>';
          } else {
            locLabel = '未記錄定位';
            metaHtml = '<span class="loc-tag ' + locCls + '">' + IC.mapPin + locLabel + '</span>'
                     + '<span>&middot; 這次定位沒完成，已照常記錄</span>';
          }
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
    var nm = (_cloudUser && _cloudUser.name) ? _cloudUser.name : '同事';
    if (greetingEl) greetingEl.textContent = g + '，' + nm;
  }
  // ════════════════════════════════════════════════════════════
  // 雲端 auth 整合
  // ════════════════════════════════════════════════════════════
  function showLoginOverlay(show){
    var ov = el('loginOverlay');
    if (ov) { ov.hidden = !show; }
    var shell = el('appShell');
    if (shell) { shell.style.visibility = show ? 'hidden' : 'visible'; }
  }
  function setLoginMsg(text, kind){
    var m = el('loginMsg');
    if (!m) return;
    if (!text) { m.hidden = true; return; }
    m.hidden = false;
    m.className = 'login-msg ' + (kind === 'err' ? 'err' : 'info');
    m.innerHTML = text;
  }
  function bindLoginButton(){
    var btn = el('loginBtn');
    if (!btn) return;
    btn.onclick = function(){
      setLoginMsg('<span class="login-spinner"></span>正在開啟 Google 登入…', 'info');
      BPIdentity.signIn().then(function(){
        // onChange 會接手後續（隱藏 overlay + 渲染）
        setLoginMsg('', null);
      })['catch'](function(err){
        var msg = (err && err.message) || '';
        if (/popup|cancel|closed/i.test(msg)) {
          setLoginMsg('登入視窗被關掉了，點上面按鈕再試一次。', 'info');
        } else if (/disallowed_useragent|user-agent/i.test(msg)) {
          setLoginMsg('你正在 LINE / FB 內建瀏覽器中，Google 不允許在這裡登入。請用 Safari 或 Chrome 開啟本頁。', 'err');
        } else {
          setLoginMsg('登入沒成功：' + msg + '。請再試一次或檢查網路。', 'err');
        }
      });
    };
  }
  function onIdentityChange(s){
    _idState = s;
    _cloudReady = s.ready;
    _cloudUser = s.account;  // { email, name, uid, photoURL }
    // 把 wsId 餵給資料層（cloud.js 不自己解 workspace、以名冊鏡像為準）
    if (window.BPCloud && BPCloud.setContext) {
      BPCloud.setContext(s.account, s.wsId);
    }
    if (!s.isSignedIn) {
      // 還沒登入：SDK resolved 顯示登入頁；沒 resolved 也顯示（不卡 loading）
      if (s.authResolved) {
        showGuidanceOverlay(false);
        showLoginOverlay(true);
        bindLoginButton();
        if (!s.ready) {
          setLoginMsg('連不上登入服務（可能是網路或擋了 Google）。連上網後重新整理即可。', 'err');
        }
      }
      return;
    }
    // 已登入：等身分解析完
    if (s.resolving) {
      showLoginOverlay(false);
      showGuidanceOverlay(false);
      return; // 解析中，畫面維持（避免閃）
    }
    // 解析完但「不在名冊」或錯誤 → 友善引導頁（不白屏、不假資料）
    if (s.friendly || s.errorKind) {
      showLoginOverlay(false);
      showGuidanceOverlay(true);
      return;
    }
    // 有身分（員工 / 主管 / HR 任一）→ 進打卡頁
    showLoginOverlay(false);
    showGuidanceOverlay(false);
    setGreeting();
    reloadRecords(true);
  }

  // 「不在名冊」友善引導頁：請老闆把這個信箱加進員工檔案（一鍵複製）
  function showGuidanceOverlay(show){
    var ov = el('guidanceOverlay');
    var shell = el('appShell');
    if (!show) {
      if (ov) { ov.hidden = true; }
      if (shell) { shell.style.visibility = 'visible'; }
      return;
    }
    if (shell) { shell.style.visibility = 'hidden'; }
    var myEmail = (_cloudUser && _cloudUser.email) ? _cloudUser.email : '';
    var s2 = _idState || {};
    var bodyTitle, bodyDesc;
    if (s2.errorKind === 'network') {
      bodyTitle = '現在連不上網路';
      bodyDesc = '連上網路後重新整理這一頁就可以了。';
    } else if (s2.errorKind === 'permission') {
      bodyTitle = '這個帳號還沒有打卡權限';
      bodyDesc = '請老闆把你的信箱加進公司名冊後，再重新整理。';
    } else if (s2.errorKind === 'index-missing') {
      bodyTitle = '系統正在開通中';
      bodyDesc = '公司端還有一步設定（出勤資料庫索引正在建立）。完成後重新整理這一頁就能打卡了。';
    } else {
      bodyTitle = '你的帳號還沒加入公司名冊';
      bodyDesc = '請老闆在 BeyondPath「算薪水 → 員工檔案」把這個信箱填進你的資料，加好後重新整理這一頁就能打卡了。';
    }
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'guidanceOverlay';
      ov.className = 'login-overlay';
      document.body.appendChild(ov);
    }
    ov.hidden = false;
    var html = '';
    html += '<div class="login-card">';
    html += '  <div class="login-logo">' + IC.lock + '</div>';
    html += '  <div class="login-brand">BeyondPath 出缺勤</div>';
    html += '  <div class="login-title">' + bodyTitle + '</div>';
    html += '  <div class="login-sub">' + bodyDesc + '</div>';
    if (myEmail) {
      html += '  <div class="guide-email-row">';
      html += '    <span class="guide-email" id="guideEmail">' + myEmail + '</span>';
      html += '    <button class="guide-copy" id="guideCopyBtn">複製信箱</button>';
      html += '  </div>';
    }
    html += '  <button class="login-btn" id="guideRetryBtn" style="margin-top:16px">重新整理</button>';
    html += '  <button class="guide-signout" id="guideSignoutBtn">換一個帳號登入</button>';
    html += '</div>';
    ov.innerHTML = html;
    var copyBtn = el('guideCopyBtn');
    if (copyBtn) copyBtn.onclick = function(){ _copyText(myEmail, copyBtn); };
    var retryBtn = el('guideRetryBtn');
    if (retryBtn) retryBtn.onclick = function(){ try { location.reload(); } catch (e) {} };
    var soBtn = el('guideSignoutBtn');
    if (soBtn) soBtn.onclick = function(){
      BPIdentity.signOut().then(function(){
        _cloudUser = null; _idState = null;
        showGuidanceOverlay(false); showLoginOverlay(true); bindLoginButton();
      });
    };
  }

  function _copyText(text, btn){
    function done(){ if (btn) { var o = btn.textContent; btn.textContent = '已複製'; setTimeout(function(){ btn.textContent = o; }, 1500); } }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done)['catch'](function(){ _copyFallback(text, done); });
      } else { _copyFallback(text, done); }
    } catch (e) { _copyFallback(text, done); }
  }
  function _copyFallback(text, done){
    try {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      done();
    } catch (e) {}
  }

    // 從雲端重拉紀錄 → 更新 _cloudRecords → 重繪
  function reloadRecords(showLoading){
    if (_loadingRecords) return;
    _loadingRecords = true;
    if (showLoading) { render(); }
    BPCloud.listPunches().then(function(res){
      _loadingRecords = false;
      _cloudOnline = res.online === true;
      _cloudRecords = res.records || [];
      render();
    })['catch'](function(){
      _loadingRecords = false;
      _cloudOnline = false;
      render();
    });
  }

  // 雲端紀錄當資料源（取代原本的 PunchStore.list 本地讀取）
  function allRecords(){ return _cloudRecords || []; }

  // 更新 topbar：使用者 chip + 雲端狀態 pill + 登出
  function renderTopbarActions(){
    var actions = document.querySelector('.topbar-actions');
    if (!actions) return;
    var html = '';
    if (_cloudUser) {
      var ava = _cloudUser.photoURL
        ? '<span class="uc-ava"><img src="' + _cloudUser.photoURL + '" referrerpolicy="no-referrer" alt=""></span>'
        : '<span class="uc-ava">' + ((_cloudUser.name || '?').charAt(0).toUpperCase()) + '</span>';
      var cloudPill = _cloudOnline
        ? '<span class="cloud-pill on">' + IC.check + ' 已連雲端</span>'
        : '<span class="cloud-pill off">' + IC.mapPin + ' 離線暫存</span>';
      html += cloudPill;
      html += '<span class="user-chip" title="' + (_cloudUser.email || '') + '">' + ava
            + '<span class="uc-name">' + (_cloudUser.name || '') + '</span></span>';
      html += '<button class="icon-btn" id="logoutBtn" title="登出" aria-label="登出">' + IC.logout + '</button>';
    }
    html += '<button class="icon-btn" id="themeBtn" title="切換深色模式" aria-label="切換深色模式">'
          + (document.documentElement.getAttribute('data-theme') === 'dark' ? IC.sun : IC.moon) + '</button>';
    actions.innerHTML = html;
    themeBtnEl = el('themeBtn');
    if (themeBtnEl) themeBtnEl.onclick = toggleTheme;
    var lo = el('logoutBtn');
    if (lo) lo.onclick = function(){
      BPIdentity.signOut().then(function(){
        _cloudUser = null; _idState = null; _cloudRecords = []; _cloudOnline = false;
        showGuidanceOverlay(false); showLoginOverlay(true); bindLoginButton();
      });
    };
  }

  // ── LINE / FB 等 App 內建瀏覽器偵測（S1-F）：Google OAuth 在這些 WebView 會被擋，
  //    與其讓員工卡在登入失敗，不如先引導他「用外部瀏覽器開啟」。自寫、不依賴主站。──
  function _isInAppBrowser(){
    var ua = navigator.userAgent || '';
    return /FBAN|FBAV|FB_IAB|Instagram|Line\/|LIFF|MicroMessenger|WeChat|Twitter|Snapchat|Pinterest|TikTok/i.test(ua);
  }
  function _showWebViewGuide(){
    var ov = el('loginOverlay');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'loginOverlay';
      ov.className = 'login-overlay';
      document.body.appendChild(ov);
    }
    ov.hidden = false;
    var shell = el('appShell');
    if (shell) { shell.style.visibility = 'hidden'; }
    var url = '';
    try { url = window.location.href; } catch (e) {}
    var html = '';
    html += '<div class="login-card">';
    html += '  <div class="login-logo">' + IC.login + '</div>';
    html += '  <div class="login-brand">BeyondPath 出缺勤</div>';
    html += '  <div class="login-title">請用瀏覽器開啟</div>';
    html += '  <div class="login-sub">這個畫面是從 LINE / FB 內建瀏覽器打開的，Google 登入在這裡沒辦法用——這不是你的問題。<br><br>請點畫面<b>右上角的 ··· （或分享鈕）</b>，選「<b>用預設瀏覽器開啟</b>」，就能正常登入打卡。</div>';
    if (url) {
      html += '  <div class="guide-email-row">';
      html += '    <span class="guide-email" id="guideUrl">' + url + '</span>';
      html += '    <button class="guide-copy" id="guideCopyUrlBtn">複製網址</button>';
      html += '  </div>';
      html += '  <div class="login-foot">複製不到也沒關係——直接照上面「···→用瀏覽器開啟」就好。</div>';
    }
    html += '</div>';
    ov.innerHTML = html;
    var cb = el('guideCopyUrlBtn');
    if (cb) cb.onclick = function(){ _copyText(url, cb); };
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
    // S1-F：App 內建瀏覽器 → 先給「用瀏覽器開啟」引導，不啟動 Firebase（OAuth 會被擋）
    if (_isInAppBrowser()) { _showWebViewGuide(); return; }
    bindLoginButton();
    // 先把畫面藏起來、等 auth 狀態決定顯示登入頁還是打卡頁（避免閃一下未登入的空畫面）
    showLoginOverlay(true);
    // 掛身分鏈監聽 + 啟動 Firebase（identity.js 統一管登入與身分；cloud.js 只管資料）
    if (window.BPIdentity) {
      if (window.BPCloud) { BPCloud.init(); }
      BPIdentity.onChange(onIdentityChange);
      BPIdentity.init();
    } else {
      setLoginMsg('系統元件載入失敗，請重新整理頁面。', 'err');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  window.__BP_ATT__ = {
    Geo: Geo, Settings: Settings,
    doPunch: doPunch, doBackfill: doBackfill,
    todayWorkMinutes: todayWorkMinutes,
    reloadRecords: reloadRecords,
    getIdentity: function(){ return _idState; },
    getRecords: function(){ return _cloudRecords; },
    setBackfill: function(timeStr, type){ backfillTimeStr = timeStr; backfillType = type || 'in'; }
  };
})();
