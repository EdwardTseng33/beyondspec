/* ============================================================
   BeyondPath attendance leave - cloud data layer (leave-cloud.js)
   Calcifer (CTO) - 2026-06-10 - production foundation

   Replaces localStorage LeaveStore. Talks to Firestore:
     workspaces/{wsId}/leave_requests/{id}
   Fields (lowercase emails):
     applicantEmail, applicantName, managerEmail, type,
     start, end, reason, status[pending|approved|rejected],
     decidedBy, decidedAt, createdAt, hours(optional)

   Roster mirror (read-only here) for team views:
     workspaces/{wsId}/attendance_roster/{emailLower}
       { name, email, managerEmail, isActive }

   wsId + identity injected from identity.js via setContext.
   ES5 only. exposes window.LeaveCloud. */
(function () {
  'use strict';

  var _ctx = { wsId: null, email: null, name: null };

  function _db() {
    try { if (typeof firebase !== 'undefined' && firebase.firestore) return firebase.firestore(); }
    catch (e) {}
    return null;
  }
  function _ts() {
    try { return firebase.firestore.FieldValue.serverTimestamp(); } catch (e) { return new Date().toISOString(); }
  }
  function _col() {
    var db = _db();
    if (!db || !_ctx.wsId) return null;
    return db.collection('workspaces').doc(_ctx.wsId).collection('leave_requests');
  }
  function _rosterCol() {
    var db = _db();
    if (!db || !_ctx.wsId) return null;
    return db.collection('workspaces').doc(_ctx.wsId).collection('attendance_roster');
  }

  function _humanErr(err) {
    var code = (err && err.code) || '';
    var msg = (err && err.message) || '';
    if (code === 'permission-denied' || /permission/i.test(msg)) return '雲端目前不接受這個動作（權限未開通），請聯絡管理員。';
    if (code === 'unavailable' || /network|offline|unavailable/i.test(msg)) return '現在連不上網路，請連上後再試。';
    if (code === 'unauthenticated') return '登入逾時了，請重新登入。';
    return '雲端暫時無法處理，請稍後再試。';
  }

  // doc -> 統一前端 record 形狀（時間轉 ms，沿用既有 UI 欄位名）
  function _toRecord(doc) {
    var d = doc.data() || {};
    function ms(v) {
      if (v && typeof v.toMillis === 'function') return v.toMillis();
      if (v && v.seconds) return v.seconds * 1000;
      return null;
    }
    return {
      id: doc.id,
      employeeName: d.applicantName || '',
      employeeEmail: d.applicantEmail || '',
      managerEmail: d.managerEmail || '',
      leaveType: d.type || 'annual',
      startDate: d.start || '',
      endDate: d.end || '',
      hours: (d.hours === undefined || d.hours === null) ? null : Number(d.hours),
      reason: d.reason || '',
      status: d.status || 'pending',
      createdAtMs: ms(d.createdAt) || Date.now(),
      decidedAtMs: ms(d.decidedAt),
      decidedBy: d.decidedBy || null,
      decisionNote: d.decisionNote || ''
    };
  }

  var LeaveCloud = {
    setContext: function (account, wsId) {
      _ctx.wsId = wsId || null;
      _ctx.email = account ? account.email : null;
      _ctx.name = account ? (account.name || '') : null;
    },
    ready: function () { return !!(_db() && _ctx.wsId); },

    // 員工送出申請（status 一律 pending；不可自批）
    submit: function (req) {
      var col = _col();
      if (!col) return Promise.reject(new Error('尚未連上雲端'));
      var data = {
        applicantEmail: (req.employeeEmail || _ctx.email || '').toLowerCase(),
        applicantName: req.employeeName || _ctx.name || '',
        managerEmail: (req.managerEmail || '').toLowerCase(),
        type: req.leaveType || 'annual',
        start: req.startDate || '',
        end: req.endDate || req.startDate || '',
        hours: (req.hours === undefined || req.hours === null) ? null : Number(req.hours),
        reason: req.reason || '',
        status: 'pending',
        decidedBy: null,
        decidedAt: null,
        createdAt: _ts()
      };
      return col.add(data).then(function (ref) {
        return { ok: true, id: ref.id };
      })['catch'](function (err) {
        return { ok: false, reason: _humanErr(err) };
      });
    },

    // 主管裁決（approve / reject）
    decide: function (id, toStatus, deciderName, note) {
      var col = _col();
      if (!col) return Promise.reject(new Error('尚未連上雲端'));
      var patch = {
        status: toStatus,
        decidedBy: deciderName || _ctx.name || '主管',
        decidedAt: _ts(),
        decisionNote: note || ''
      };
      return col.doc(id).update(patch).then(function () {
        return { ok: true };
      })['catch'](function (err) {
        return { ok: false, reason: _humanErr(err) };
      });
    },

    // 員工取消自己的待批單
    cancel: function (id) {
      var col = _col();
      if (!col) return Promise.reject(new Error('尚未連上雲端'));
      return col.doc(id).update({ status: 'canceled' }).then(function () {
        return { ok: true };
      })['catch'](function (err) {
        return { ok: false, reason: _humanErr(err) };
      });
    },

    // 讀我自己的申請（員工視角）
    listMine: function () {
      var col = _col();
      var myEmail = (_ctx.email || '').toLowerCase();
      if (!col || !myEmail) return Promise.resolve({ ok: false, records: [], reason: '尚未連上雲端' });
      return col.where('applicantEmail', '==', myEmail).get().then(function (snap) {
        var out = [];
        snap.forEach(function (doc) { out.push(_toRecord(doc)); });
        out.sort(function (a, b) { return b.createdAtMs - a.createdAtMs; });
        return { ok: true, records: out };
      })['catch'](function (err) {
        return { ok: false, records: [], reason: _humanErr(err) };
      });
    },

    // 讀指派給我的單（主管視角）：managerEmail == 我
    listForManager: function () {
      var col = _col();
      var myEmail = (_ctx.email || '').toLowerCase();
      if (!col || !myEmail) return Promise.resolve({ ok: false, records: [], reason: '尚未連上雲端' });
      return col.where('managerEmail', '==', myEmail).get().then(function (snap) {
        var out = [];
        snap.forEach(function (doc) { out.push(_toRecord(doc)); });
        out.sort(function (a, b) { return b.createdAtMs - a.createdAtMs; });
        return { ok: true, records: out };
      })['catch'](function (err) {
        return { ok: false, records: [], reason: _humanErr(err) };
      });
    },

    // 讀名冊鏡像（團隊總覽 / 當日人力用）。回 [{name,email,managerEmail,isActive}]
    listRoster: function () {
      var col = _rosterCol();
      if (!col) return Promise.resolve({ ok: false, roster: [], reason: '尚未連上雲端' });
      return col.get().then(function (snap) {
        var out = [];
        snap.forEach(function (doc) {
          var d = doc.data() || {};
          if (d.isActive === false) return;
          out.push({
            name: d.name || doc.id,
            email: (d.email || doc.id || '').toLowerCase(),
            managerEmail: (d.managerEmail || '').toLowerCase(),
            isActive: d.isActive !== false
          });
        });
        return { ok: true, roster: out };
      })['catch'](function (err) {
        return { ok: false, roster: [], reason: _humanErr(err) };
      });
    }
  };

  window.LeaveCloud = LeaveCloud;
})();
