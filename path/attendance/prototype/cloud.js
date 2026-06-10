/* ════════════════════════════════════════════════════════════════════
   BeyondPath 出缺勤 · 雲端接線層（cloud.js）
   卡西法（CTO）· 2026-06-10 · 正式版第一段：打卡頁接主站同一顆 Firebase
   - 與主站 app.html 同一個 Firebase 專案（beyond-business-ca9da）、Google 登入
   - 身分 + wsId 由 identity.js（名冊鏡像）統一解析後，透過 setContext 注入；
     cloud.js 本身不解 workspace、不建 workspace、不碰 memberEmails（契約：鏡像為唯一身分源）
   - 資料模型：workspaces/{wsId}/attendance_punches/{id}
   - clockTime 一律用 serverTimestamp（防改機）
   - 離線/讀不到/被拒絕：優雅處理不白屏，fallback localStorage 暫存佇列
   - 全 ES5（Safari 13 相容）。對外只暴露 window.BPCloud。
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var FIREBASE_CONFIG = {
    apiKey: 'AIzaSyCY8sF0PZc_BGhp3sgZpx64tZnDyBwa6Tg',
    authDomain: 'beyond-business-ca9da.firebaseapp.com',
    projectId: 'beyond-business-ca9da',
    storageBucket: 'beyond-business-ca9da.firebasestorage.app',
    messagingSenderId: '233160072382',
    appId: '1:233160072382:web:57cfbc089301d30cd912ef',
    measurementId: 'G-DVBEPK5DJK'
  };

  var OFFLINE_QUEUE_KEY = 'bp_attendance_offline_queue_v1';

  var _state = { ready: false, user: null, wsId: null, authResolved: false };
  var _authListeners = [];

  function _notifyAuth() {
    for (var i = 0; i < _authListeners.length; i++) {
      try { _authListeners[i](_publicAuthState()); } catch (e) {}
    }
  }

  function _publicAuthState() {
    return {
      ready: _state.ready,
      authResolved: _state.authResolved,
      isSignedIn: !!_state.user,
      user: _state.user,
      wsId: _state.wsId
    };
  }

  function _sdkLoaded() {
    return typeof firebase !== 'undefined' && firebase.auth && firebase.firestore;
  }

  function _init() {
    if (!_sdkLoaded()) {
      _state.ready = false;
      _state.authResolved = true;
      _notifyAuth();
      return;
    }
    try {
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      _state.ready = true;
      _state.authResolved = true;
    } catch (e) {
      _state.ready = false;
      _state.authResolved = true;
      _notifyAuth();
      return;
    }
    _notifyAuth();
  }

  // 由 identity.js 注入當前帳號 + wsId（名冊鏡像為唯一身分源；cloud.js 不自己解 workspace）。
  function _setContext(account, wsId) {
    _state.user = account || null;
    _state.wsId = wsId || null;
    _state.authResolved = true;
    _notifyAuth();
    if (_state.user && _state.wsId) { _flushOfflineQueue(); }
  }

  function _humanizeError(err) {
    var code = (err && err.code) || '';
    var msg = (err && err.message) || '';
    if (code === 'permission-denied' || /permission/i.test(msg)) {
      return '雲端目前不接受這筆資料（權限尚未開通）。已先存在這台手機，開通後會自動補傳。';
    }
    if (code === 'unavailable' || /network|offline|unavailable/i.test(msg)) {
      return '現在連不上網路，已先存在這台手機，連上後會自動補傳。';
    }
    if (code === 'unauthenticated') {
      return '登入逾時了，請重新登入後再打卡。';
    }
    return '雲端暫時無法儲存，已先存在這台手機，稍後會自動補傳。';
  }

  function _loadQueue() {
    try {
      var raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function _saveQueue(arr) {
    try { localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(arr)); } catch (e) {}
  }
  function _enqueueOffline(punch) {
    var q = _loadQueue();
    q.push(punch);
    _saveQueue(q);
  }
  function _flushOfflineQueue() {
    if (!_state.ready || !_state.user || !_state.wsId) return;
    var q = _loadQueue();
    if (!q.length) return;
    var db = firebase.firestore();
    var remaining = [];
    var done = 0;
    function checkDone() {
      done++;
      if (done >= q.length) {
        _saveQueue(remaining);
        if (remaining.length < q.length) { _notifyAuth(); }
      }
    }
    for (var i = 0; i < q.length; i++) {
      (function (item) {
        var docData = {
          type: item.type,
          employeeEmail: item.employeeEmail,
          clockTime: firebase.firestore.FieldValue.serverTimestamp(),
          intendedTimeMs: item.clockTimeMs,
          distance: (item.distance === undefined ? null : item.distance),
          locationStatus: item.locationStatus,
          isBackfill: true,
          source: 'offline-flush',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        db.collection('workspaces').doc(_state.wsId)
          .collection('attendance_punches').add(docData)
          .then(function () { checkDone(); })
          ['catch'](function () { remaining.push(item); checkDone(); });
      })(q[i]);
    }
  }

  var BPCloud = {

    init: function () { _init(); },

    setContext: function (account, wsId) { _setContext(account, wsId); },

    onAuthChange: function (fn) {
      if (typeof fn === 'function') {
        _authListeners.push(fn);
        try { fn(_publicAuthState()); } catch (e) {}
      }
    },

    getState: function () { return _publicAuthState(); },

    isSignedIn: function () { return !!_state.user; },

    signIn: function () {
      if (!_sdkLoaded() || !_state.ready) {
        return Promise.reject(new Error('Firebase 尚未就緒，請稍後再試或檢查網路。'));
      }
      var provider = new firebase.auth.GoogleAuthProvider();
      return firebase.auth().signInWithPopup(provider).then(function (result) {
        return result.user;
      });
    },

    signOut: function () {
      if (!_sdkLoaded()) return Promise.resolve();
      return firebase.auth().signOut();
    },

    appendPunch: function (punch) {
      if (!_state.ready || !_state.user || !_state.wsId) {
        _enqueueOffline(punch);
        return Promise.resolve({
          ok: true, online: false,
          message: '目前未連上雲端，已先存在這台手機，連上後會自動補傳。'
        });
      }
      var db = firebase.firestore();
      var docData = {
        type: punch.type,
        employeeEmail: punch.employeeEmail,
        clockTime: firebase.firestore.FieldValue.serverTimestamp(),
        distance: (punch.distance === undefined ? null : punch.distance),
        locationStatus: punch.locationStatus,
        isBackfill: punch.isBackfill === true,
        source: punch.isBackfill === true ? 'cloud-backfill' : 'cloud-punch',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      if (punch.isBackfill === true && punch.clockTimeMs) {
        docData.intendedTimeMs = punch.clockTimeMs;
      }
      return db.collection('workspaces').doc(_state.wsId)
        .collection('attendance_punches').add(docData)
        .then(function () { return { ok: true, online: true }; })
        ['catch'](function (err) {
          _enqueueOffline(punch);
          return { ok: true, online: false, message: _humanizeError(err) };
        });
    },

    listPunches: function () {
      if (!_state.ready || !_state.user || !_state.wsId) {
        return Promise.resolve({
          ok: false, online: false, records: [],
          message: '尚未連上雲端，先顯示這台手機的暫存紀錄。'
        });
      }
      var db = firebase.firestore();
      var myEmail = _state.user.email;
      return db.collection('workspaces').doc(_state.wsId)
        .collection('attendance_punches')
        .where('employeeEmail', '==', myEmail).get()
        .then(function (snap) {
          var records = [];
          snap.forEach(function (doc) {
            var d = doc.data();
            var clockMs = null;
            if (d.clockTime && typeof d.clockTime.toMillis === 'function') {
              clockMs = d.clockTime.toMillis();
            } else if (d.clockTime && d.clockTime.seconds) {
              clockMs = d.clockTime.seconds * 1000;
            }
            var displayMs = (d.isBackfill && d.intendedTimeMs) ? d.intendedTimeMs : clockMs;
            records.push({
              id: doc.id,
              type: d.type,
              employeeEmail: d.employeeEmail,
              clockTimeMs: displayMs,
              serverClockMs: clockMs,
              distance: (d.distance === undefined ? null : d.distance),
              locationStatus: d.locationStatus,
              isBackfill: d.isBackfill === true,
              source: d.source || ''
            });
          });
          records.sort(function (a, b) { return (b.clockTimeMs || 0) - (a.clockTimeMs || 0); });
          return { ok: true, online: true, records: records };
        })['catch'](function (err) {
          return { ok: false, online: false, records: [], message: _humanizeError(err) };
        });
    },

    offlineQueueCount: function () { return _loadQueue().length; },

    nowMs: function () { return Date.now(); }
  };

  window.BPCloud = BPCloud;
})();
