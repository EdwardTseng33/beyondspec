/* BeyondPath attendance identity chain (identity.js) - shared by punch & leave
   Calcifer (CTO) - 2026-06-10 - production foundation
   Contract (Sophie ruling, roster-mirror approach):
   - master roster: owner-private users/{owner_uid}/payroll_employees/ (secret)
   - payroll writes slim mirror to workspaces/{ownerUid}/attendance_roster/{emailLower}
   - mirror fields only: name, email, managerEmail, isActive (emails lowercased)
   - identity SOLE source = mirror. never reads master roster or sensitive data.
   - wsId: collectionGroup attendance_roster where email == my email -> parent ws id (= owner uid)
     (was documentId()==email; Firestore rejects a single-segment docId on a collectionGroup
      query with a SYNCHRONOUS throw that escapes the promise chain -> half-rendered page.
      field query is index-safe; a missing index returns a catchable failed-precondition.)
   - NEEDS Firestore collectionGroup index on attendance_roster, field "email" ASC.
   - self not found -> friendly guidance page. never blank, never fake data.
   - HARD RULE: identity resolution is wrapped in try/catch so ANY error (sync OR async)
     lands on the friendly "system being set up" page. three states only:
     login / full content / guidance. a half-rendered screen must never exist.
   ES5 only (Safari 13). exposes window.BPIdentity only. */
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

  var _identity = {
    ready: false, authResolved: false, resolving: false, isSignedIn: false,
    account: null, wsId: null,
    isEmployee: false, isManager: false, isHR: false,
    employeeName: null, managerEmail: null,
    friendly: false, errorKind: null
  };

  var _listeners = [];
  function _notify() {
    var snap = _public();
    for (var i = 0; i < _listeners.length; i++) {
      try { _listeners[i](snap); } catch (e) {}
    }
  }
  function _public() {
    return {
      ready: _identity.ready, authResolved: _identity.authResolved,
      resolving: _identity.resolving, isSignedIn: _identity.isSignedIn,
      account: _identity.account, wsId: _identity.wsId,
      isEmployee: _identity.isEmployee, isManager: _identity.isManager, isHR: _identity.isHR,
      employeeName: _identity.employeeName, managerEmail: _identity.managerEmail,
      friendly: _identity.friendly, errorKind: _identity.errorKind
    };
  }
  function _sdkLoaded() {
    return typeof firebase !== 'undefined' && firebase.auth && firebase.firestore;
  }
  function _resetIdentityFlags() {
    _identity.wsId = null;
    _identity.isEmployee = false; _identity.isManager = false; _identity.isHR = false;
    _identity.employeeName = null; _identity.managerEmail = null;
    _identity.friendly = false; _identity.errorKind = null;
  }

  function _init() {
    if (!_sdkLoaded()) {
      _identity.ready = false; _identity.authResolved = true; _notify(); return;
    }
    try {
      if (!firebase.apps || !firebase.apps.length) { firebase.initializeApp(FIREBASE_CONFIG); }
      _identity.ready = true;
    } catch (e) {
      _identity.ready = false; _identity.authResolved = true; _notify(); return;
    }
    firebase.auth().onAuthStateChanged(function (fbUser) {
      // OUTERMOST NET: anything synchronous in here that throws must still land on a
      // resolved, friendly state. three states only: login / content / guidance.
      try {
        _identity.authResolved = true;
        if (fbUser) {
          var emailRaw = fbUser.email || '';
          _identity.isSignedIn = true;
          _identity.account = {
            email: emailRaw.toLowerCase(),
            rawEmail: emailRaw,
            name: fbUser.displayName || (emailRaw ? emailRaw.split('@')[0] : 'colleague'),
            uid: fbUser.uid,
            photoURL: fbUser.photoURL || ''
          };
          _resolveIdentity();
        } else {
          _identity.isSignedIn = false; _identity.account = null;
          _resetIdentityFlags(); _notify();
        }
      } catch (e) {
        _identity.resolving = false;
        _classifyError(e);
        if (!_identity.errorKind) { _identity.friendly = true; }
        _notify();
      }
    });
  }

  function _resolveIdentity() {
    if (!_identity.ready || !_identity.account) { _notify(); return; }
    // HARD GUARD: wrap the whole body. building/running a Firestore query can throw
    // SYNCHRONOUSLY (e.g. an illegal collectionGroup docId path), and that throw would
    // escape the promise chain below and stall the consumer on a half-rendered screen.
    // any sync error here -> friendly guidance page, never blank.
    try {
      var db = firebase.firestore();
      var myEmail = _identity.account.email;
      _resetIdentityFlags();
      _identity.resolving = true;
      _notify();
      // field query (NOT documentId): the mirror doc carries an 'email' field, so this is
      // index-safe and a missing index degrades to a catchable failed-precondition below.
      db.collectionGroup('attendance_roster')
        .where('email', '==', myEmail)
        .limit(5).get()
        .then(function (snap) {
          var selfDoc = null;
          snap.forEach(function (doc) {
            if (!selfDoc) {
              var d = doc.data() || {};
              if (d.isActive !== false) { selfDoc = doc; }
            }
          });
          if (!selfDoc) { return _resolveOwnerFallback(db, myEmail); }
          var selfData = selfDoc.data() || {};
          var wsId = _wsIdFromRosterRef(selfDoc.ref);
          _identity.wsId = wsId;
          _identity.isEmployee = true;
          _identity.employeeName = selfData.name || _identity.account.name;
          _identity.managerEmail = (selfData.managerEmail || '').toLowerCase() || null;
          return _resolveManagerAndHR(db, wsId, myEmail);
        })
        .then(function () { _identity.resolving = false; _notify(); })
        ['catch'](function (err) {
          // CG query failed. owner case: the attendance_roster read rule's first OR is
          // isAttendanceAdmin(wsId), which calls get() -- Firestore cannot statically
          // evaluate get()/exists() inside a read rule for a collectionGroup query, so the
          // whole rule rejects the CG query (permission-denied) even though our pure
          // resource.data.email==myEmail() OR exists. a permission-denied (or missing index)
          // here therefore does NOT prove 'not a member'. the owner is still reachable via
          // workspaces/{uid}, which _resolveOwnerFallback reads directly (no CG, no get()).
          // so try the owner fallback FIRST; only fall to the friendly page if that also
          // fails to recognise the account. errorKind stays classified for debug.
          // NOTE: employees who rely on the CG query to find their own wsId are still blocked
          // by this same rule limitation -- that needs a rules redesign (split the get() out
          // of the roster read rule) and is deferred to the second-wave architecture fix.
          var cgErr = err;
          _resolveOwnerFallback(db, myEmail)
            .then(function () {
              if (_identity.isHR || _identity.wsId) {
                // fallback recognised the account (owner/HR) -> clear any stale flags.
                _identity.friendly = false; _identity.errorKind = null;
              } else {
                // not an owner either -> keep the original CG error for debug context.
                _classifyError(cgErr);
              }
              _identity.resolving = false;
              _notify();
            })
            ['catch'](function () {
              // fallback itself threw (e.g. network) -> classify original CG error, friendly.
              _classifyError(cgErr);
              if (!_identity.errorKind) { _identity.friendly = true; }
              _identity.resolving = false;
              _notify();
            });
        });
    } catch (e) {
      // synchronous failure anywhere above (query construction, SDK state, etc.)
      _identity.resolving = false;
      _classifyError(e);
      if (!_identity.errorKind) { _identity.friendly = true; }
      _notify();
    }
  }

  function _wsIdFromRosterRef(ref) {
    try {
      var wsDoc = ref.parent && ref.parent.parent;
      return wsDoc ? wsDoc.id : null;
    } catch (e) { return null; }
  }

  function _resolveOwnerFallback(db, myEmail) {
    var myUid = _identity.account.uid;
    return db.collection('workspaces').doc(myUid).get()
      .then(function (wsSnap) {
        if (wsSnap.exists) {
          var w = wsSnap.data() || {};
          var isOwner = (w.owner || '').toLowerCase() === myEmail;
          var inAccess = _emailInList(myEmail, w.attendanceAccessEmails);
          if (isOwner || inAccess) {
            _identity.wsId = myUid;
            _identity.isHR = true;
            return _resolveManagerAndHR(db, myUid, myEmail);
          }
        }
        _identity.friendly = true;
        return null;
      })
      ['catch'](function () { _identity.friendly = true; return null; });
  }

  function _resolveManagerAndHR(db, wsId, myEmail) {
    if (!wsId) { return Promise.resolve(); }
    var p1 = db.collection('workspaces').doc(wsId)
      .collection('attendance_roster')
      .where('managerEmail', '==', myEmail).limit(1).get()
      .then(function (snap) { if (!snap.empty) { _identity.isManager = true; } })
      ['catch'](function () {});
    var p2 = db.collection('workspaces').doc(wsId).get()
      .then(function (wsSnap) {
        if (wsSnap.exists) {
          var w = wsSnap.data() || {};
          var isOwner = (w.owner || '').toLowerCase() === myEmail;
          var inAccess = _emailInList(myEmail, w.attendanceAccessEmails);
          if (isOwner || inAccess) { _identity.isHR = true; }
        }
      })
      ['catch'](function () {});
    return Promise.all([p1, p2]);
  }

  function _emailInList(email, list) {
    if (!list || typeof list.length !== 'number') return false;
    for (var i = 0; i < list.length; i++) {
      if (('' + list[i]).toLowerCase() === email) return true;
    }
    return false;
  }

  function _classifyError(err) {
    var code = (err && err.code) || '';
    var msg = (err && err.message) || '';
    if (code === 'permission-denied' || /permission/i.test(msg)) {
      _identity.errorKind = 'permission';
    } else if (code === 'unavailable' || /network|offline|unavailable/i.test(msg)) {
      _identity.errorKind = 'network';
    } else if (code === 'failed-precondition' || /index/i.test(msg)) {
      _identity.errorKind = 'index-missing';
      try { console.warn('[BPIdentity] needs attendance_roster collectionGroup index: ' + msg); } catch (e) {}
    } else {
      _identity.errorKind = null;
    }
  }

  var BPIdentity = {
    init: function () { _init(); },
    onChange: function (fn) {
      if (typeof fn === 'function') {
        _listeners.push(fn);
        try { fn(_public()); } catch (e) {}
      }
    },
    get: function () { return _public(); },
    isSignedIn: function () { return _identity.isSignedIn; },
    myEmail: function () { return _identity.account ? _identity.account.email : null; },
    myName: function () { return _identity.employeeName || (_identity.account ? _identity.account.name : null); },
    wsId: function () { return _identity.wsId; },
    signIn: function () {
      if (!_sdkLoaded() || !_identity.ready) {
        return Promise.reject(new Error('login service not ready, retry or check network.'));
      }
      var provider = new firebase.auth.GoogleAuthProvider();
      return firebase.auth().signInWithPopup(provider).then(function (r) { return r.user; });
    },
    signOut: function () {
      if (!_sdkLoaded()) return Promise.resolve();
      return firebase.auth().signOut();
    },
    nowMs: function () { return Date.now(); }
  };

  window.BPIdentity = BPIdentity;
})();
