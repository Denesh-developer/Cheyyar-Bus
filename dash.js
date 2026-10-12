/* =========================================================
   CHEYYAR BUS - DASHBOARD ADD-ON (dash.js)
   - Live digital clock (IST)
   - First & Last bus (all routes / selected route)
   - Departing in next 30 minutes
   - Bus detail popup (all trips of the same bus, pin, share,
     copy link, reminder, notify, show on 3D)
   Needs script.js globals: ROUTES, IDS, current, lang, nowMin,
   minToTimeStr, BUS, ORIGIN, FINAL_TO, selectRoute, setActive
   ========================================================= */
   (function () {
    "use strict";
  
    var $d = function (id) { return document.getElementById(id); };
    var LS_PINS = "cb_pins";
  
    /* ---------- labels ---------- */
    var L = {
      en: {
        clock: "Current time", flTitle: "First & last bus", scopeAll: "All routes", scopeRoute: "This route",
        first: "First bus", last: "Last bus", buses: "buses", nextTitle: "Departing in next 30 min",
        noNext: "No buses in the next 30 minutes", nextUp: "Next bus", trips: "trips", details: "Details",
        tripsToday: "trips today", otherDeps: "Other departures of this bus", verify: "Verify timing",
        platform: "Platform", unverified: "unverified", pin: "Pin this bus", unpin: "Pinned",
        wa: "WhatsApp", copy: "Copy link", remind: "Add reminder", notify: "Notify me", show3d: "Show on 3D",
        copied: "Link copied", copyFail: "Could not copy link", departed: "Departed", now: "now",
        min: "min", h: "h", inL: "in", tomorrow: "tomorrow", reminderOpen: "Opening calendar…",
        notifyOn: "You'll get an alert 10 min before (keep the app open)",
        notifyNow: "Bus leaves very soon!", notifyDenied: "Notification permission blocked",
        notifyNA: "Notifications not supported here", gone: "This bus has already left",
        busAt: "Bus leaving at", ist: "IST", pinAdded: "Pinned", pinRemoved: "Unpinned"
      },
      ta: {
        clock: "தற்போதைய நேரம்", flTitle: "முதல் & கடைசி பஸ்", scopeAll: "அனைத்து வழிகள்", scopeRoute: "இந்த வழி",
        first: "முதல் பஸ்", last: "கடைசி பஸ்", buses: "பஸ்கள்", nextTitle: "அடுத்த 30 நிமிடத்தில் புறப்படும் பஸ்கள்",
        noNext: "அடுத்த 30 நிமிடத்தில் பஸ் இல்லை", nextUp: "அடுத்த பஸ்", trips: "நேரங்கள்", details: "விவரம்",
        tripsToday: "நேரங்கள் இன்று", otherDeps: "இந்த பஸ்ஸின் மற்ற நேரங்கள்", verify: "நேரத்தை சரிபார்க்கவும்",
        platform: "பிளாட்பாரம்", unverified: "உறுதியில்லை", pin: "பின் செய்", unpin: "பின் செய்யப்பட்டது",
        wa: "WhatsApp", copy: "லிங்க் காப்பி", remind: "நினைவூட்டல் சேர்", notify: "எனக்கு தெரிவி",
        show3d: "3D-யில் காட்டு", copied: "லிங்க் காப்பி ஆனது", copyFail: "லிங்க் காப்பி ஆகவில்லை",
        departed: "புறப்பட்டது", now: "இப்போது", min: "நிமி", h: "மணி", inL: "", tomorrow: "நாளை",
        reminderOpen: "Calendar திறக்கிறது…", notifyOn: "10 நிமிடம் முன் தெரிவிக்கப்படும் (app திறந்திருக்கணும்)",
        notifyNow: "பஸ் இன்னும் சிறிது நேரத்தில் புறப்படும்!", notifyDenied: "Notification அனுமதி மறுக்கப்பட்டது",
        notifyNA: "இங்கே Notification வேலை செய்யாது", gone: "இந்த பஸ் ஏற்கனவே புறப்பட்டது",
        busAt: "பஸ் புறப்படும் நேரம்", ist: "IST", pinAdded: "பின் செய்யப்பட்டது", pinRemoved: "பின் நீக்கப்பட்டது"
      }
    };
    function curLang() { return (typeof lang !== "undefined" && lang === "ta") ? "ta" : "en"; }
    function t(k) { var d = L[curLang()]; return d[k] != null ? d[k] : (L.en[k] != null ? L.en[k] : k); }
  
    /* ---------- small helpers ---------- */
    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }
    function cap(s) { return String(s || "").split(" ").map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); }).join(" "); }
    function placeEn(s) { return String(s || "").split(/\s+via\s+|\(|→|➔|,|\//i)[0].trim(); }
    function placeTa(s) { return String(s || "").split(/\s*வழி|\(|→|➔|,|\//)[0].trim(); }
    function norm(s) { return String(s || "").toLowerCase().replace(/\s+/g, " ").trim(); }
    function pad(n) { return n < 10 ? "0" + n : "" + n; }
  
    function tparts(min) {
      var m = ((min % 1440) + 1440) % 1440, h = Math.floor(m / 60), mm = m % 60;
      return { t: ((h % 12) || 12) + ":" + pad(mm), ap: h >= 12 ? "PM" : "AM" };
    }
  
    function inText(diff) {
      if (diff <= 0) return t("now");
      var x = diff < 60 ? diff + " " + t("min")
        : Math.floor(diff / 60) + " " + t("h") + (diff % 60 ? " " + (diff % 60) + " " + t("min") : "");
      return curLang() === "ta" ? x + "-ல்" : t("inL") + " " + x;
    }
  
    function destKey(r) { return placeEn(r.to).toLowerCase(); }
    function destLabel(r) {
      if (curLang() === "ta") { var ta = placeTa(r.toTa); if (ta) return ta; }
      return cap(placeEn(r.to)) || "—";
    }
    function originLabel(r) { return ORIGIN(r) || r.from || ""; }
    function busCode(r) {
      var m = String(r.bus || "").match(/\b([A-Za-z]{0,3}-?\d{1,4}[A-Za-z]?)\b/);
      if (m) return m[1].toUpperCase();
      return String(r.bus || "Bus").split(/\s+/)[0].slice(0, 7);
    }
    function gk(r) { return norm(r.bus || r.busTa) + "|" + destKey(r); }
    function rowId(r) { return r.routeKey + "|" + r.time + "|" + (r.bus || ""); }
  
    /* ---------- data index (built lazily from ROUTES) ---------- */
    var _all = null, _groups = null, _byId = null;
    function build() {
      if (_all) return;
      _all = []; _groups = {}; _byId = {};
      IDS.forEach(function (k) { ROUTES[k].rows.forEach(function (r) { _all.push(r); }); });
      _all.sort(function (a, b) { return a.min - b.min; });
      _all.forEach(function (r) {
        var g = gk(r);
        (_groups[g] = _groups[g] || []).push(r);
        _byId[rowId(r)] = r;
      });
    }
    function groupOf(r) { build(); return _groups[gk(r)] || [r]; }
    function canon(r) {
      build();
      for (var i = 0; i < _all.length; i++) {
        var x = _all[i];
        if (x.routeKey === r.routeKey && x.min === r.min && x.bus === r.bus && x.to === r.to) return x;
      }
      return r;
    }
  
    /* ---------- pins ---------- */
    function getPins() { try { return JSON.parse(localStorage.getItem(LS_PINS) || "[]"); } catch (e) { return []; } }
    function setPins(a) { try { localStorage.setItem(LS_PINS, JSON.stringify(a)); } catch (e) {} }
    function isPinned(r) { return getPins().indexOf(gk(r)) >= 0; }
    function togglePin(key) {
      var p = getPins(), i = p.indexOf(key);
      if (i >= 0) p.splice(i, 1); else p.push(key);
      setPins(p);
      return i < 0;
    }
  
    /* ---------- icons ---------- */
    function ic(path, fill) {
      return '<svg viewBox="0 0 24 24" width="16" height="16" fill="' + (fill ? "currentColor" : "none") +
        '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + path + "</svg>";
    }
    var ICON = {
      star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
      wa: '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.7-5.4A8.4 8.4 0 1 1 21 11.5z"/>',
      link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
      cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
      bell: '<path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16z"/><path d="M10 21h4"/>',
      cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>'
    };
  
    /* ---------- IST clock ---------- */
    var clockFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    function istNow() {
      var p = clockFmt.formatToParts(new Date());
      var g = function (ty) { return parseInt(p.filter(function (x) { return x.type === ty; })[0].value, 10); };
      return { h: g("hour") % 24, m: g("minute"), s: g("second") };
    }
    function dateText() {
      return new Intl.DateTimeFormat(curLang() === "ta" ? "ta-IN" : "en-IN", {
        timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long", year: "numeric"
      }).format(new Date());
    }
  
    /* ---------- state ---------- */
    var state = { scope: "all" };
    var modalRow = null, modalEl = null, rootEl = null, lastMinute = -1;
    var notifyTimers = {};
  
    /* ---------- skeleton ---------- */
    function skeleton() {
      return '' +
        '<div class="dash-grid">' +
          '<div class="dash-left">' +
            '<div class="dash-card dash-clock-card">' +
              '<div class="dash-eyebrow"><span id="dk-clock"></span> · <span id="dk-ist"></span></div>' +
              '<div class="dash-clock" id="dash-clock" aria-live="off">' +
                '<span id="dc-h">--</span><span class="dc-sep">:</span><span id="dc-m">--</span>' +
                '<span class="dc-sep">:</span><span class="dc-s" id="dc-s">--</span><span class="dc-ap" id="dc-ap"></span>' +
              '</div>' +
              '<div class="dash-date" id="dash-date"></div>' +
            '</div>' +
            '<div class="dash-card">' +
              '<div class="dash-card-head">' +
                '<div class="dash-eyebrow" id="dk-fl"></div>' +
                '<div class="dash-seg">' +
                  '<button type="button" data-scope="all" id="dk-sc-all"></button>' +
                  '<button type="button" data-scope="route" id="dk-sc-route"></button>' +
                '</div>' +
              '</div>' +
              '<div class="dash-fl-grid" id="dash-fl"></div>' +
            '</div>' +
          '</div>' +
          '<div class="dash-card dash-next-card">' +
            '<div class="dash-card-head"><h3 id="dk-next"></h3><span class="dash-pill" id="dash-next-count"></span></div>' +
            '<div class="dash-next-list" id="dash-next-list"></div>' +
          '</div>' +
        '</div>';
    }
  
    function renderStatic() {
      var set = function (id, k) { var e = $d(id); if (e) e.textContent = t(k); };
      set("dk-clock", "clock"); set("dk-ist", "ist"); set("dk-fl", "flTitle");
      set("dk-sc-all", "scopeAll"); set("dk-sc-route", "scopeRoute"); set("dk-next", "nextTitle");
      var d = $d("dash-date"); if (d) d.textContent = dateText();
      rootEl.querySelectorAll("[data-scope]").forEach(function (b) {
        b.classList.toggle("on", b.dataset.scope === state.scope);
      });
    }
  
    /* ---------- clock ---------- */
    function tick() {
      if (!rootEl) return;
      var n = istNow();
      var h12 = (n.h % 12) || 12;
      $d("dc-h").textContent = pad(h12);
      $d("dc-m").textContent = pad(n.m);
      $d("dc-s").textContent = pad(n.s);
      $d("dc-ap").textContent = n.h >= 12 ? "PM" : "AM";
      var stamp = n.h * 60 + n.m;
      if (stamp !== lastMinute) {
        var first = lastMinute === -1;
        lastMinute = stamp;
        if (!first) refreshMinute();
        if (n.h === 0 && n.m === 0) { var d = $d("dash-date"); if (d) d.textContent = dateText(); }
      }
    }
  
    /* ---------- first & last ---------- */
    function renderFirstLast() {
      var rows = (state.scope === "route" && ROUTES[current]) ? ROUTES[current].rows : _all;
      var box = $d("dash-fl");
      if (!rows || !rows.length) { box.innerHTML = ""; return; }
      var now = nowMin();
      function card(label, r, cls) {
        var tp = tparts(r.min), diff = r.min - now;
        var status = diff < 0 ? t("departed") : inText(diff);
        return '<button type="button" class="dash-fl-item ' + cls + '" data-open="' + esc(rowId(r)) + '">' +
          '<span class="fl-label">' + label + '</span>' +
          '<span class="fl-time">' + tp.t + '<small>' + tp.ap + '</small></span>' +
          '<span class="fl-sub">' + esc(BUS(r)) + ' · ' + esc(destLabel(r)) + '</span>' +
          '<span class="fl-status' + (diff < 0 ? " gone" : "") + '">' + esc(status) + '</span>' +
          '</button>';
      }
      box.innerHTML = card(t("first"), rows[0], "fl-first") + card(t("last"), rows[rows.length - 1], "fl-last");
    }
  
    /* ---------- next 30 minutes ---------- */
    function nextItem(r, inLabel, cls) {
      var tp = tparts(r.min);
      return '<button type="button" class="dash-next-item" data-open="' + esc(rowId(r)) + '">' +
        '<span class="dn-time">' + tp.t + '<small>' + tp.ap + '</small></span>' +
        '<span class="dn-main"><b>' + esc(destLabel(r)) + '</b><i>' + esc(BUS(r)) + '</i></span>' +
        '<span class="dn-in ' + (cls || "") + '">' + esc(inLabel) + '</span></button>';
    }
    function renderNext30() {
      var now = nowMin();
      var list = _all.filter(function (r) { return r.min >= now && r.min <= now + 30; });
      $d("dash-next-count").textContent = list.length + " " + t("buses");
      var box = $d("dash-next-list");
      if (!list.length) {
        var nx = null;
        for (var i = 0; i < _all.length; i++) { if (_all[i].min > now + 30) { nx = _all[i]; break; } }
        var extra = "";
        if (nx) extra = nextItem(nx, inText(nx.min - now), "");
        else if (_all.length) extra = nextItem(_all[0], t("tomorrow"), "");
        box.innerHTML = '<div class="dash-empty">' + t("noNext") + '</div>' +
          (extra ? '<div class="dash-eyebrow dn-up">' + t("nextUp") + '</div>' + extra : "");
        return;
      }
      box.innerHTML = list.map(function (r) {
        var diff = r.min - now;
        return nextItem(r, inText(diff), diff <= 5 ? "urgent" : (diff <= 15 ? "soon" : ""));
      }).join("");
    }
  
    /* ---------- refreshers ---------- */
    function refreshMinute() {
      build();
      renderFirstLast(); renderNext30();
      if (modalRow) renderModal();
    }
    function refreshAll() {
      build();
      renderStatic(); renderFirstLast(); renderNext30();
      if (modalRow) renderModal();
    }
  
    /* ---------- toast ---------- */
    var toastTimer = null;
    function toast(msg) {
      var el = $d("dash-toast"); if (!el) return;
      el.textContent = msg; el.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2600);
    }
  
    /* ---------- bus popup ---------- */
    function renderModal() {
      var r = modalRow; if (!r) return;
      var g = groupOf(r), now = nowMin(), diff = r.min - now, tp = tparts(r.min);
      var pinned = isPinned(r);
      var inLine = diff >= 0 ? inText(diff) : t("departed");
      var via = curLang() === "ta" && r.viaTa ? r.viaTa : r.via;
      var chips = g.map(function (x) {
        var p = tparts(x.min);
        return '<button type="button" class="dm-chip' + (x === r ? " cur" : "") + (x.min < now ? " past" : "") + '" data-switch="' + esc(rowId(x)) + '">' + p.t + " " + p.ap + "</button>";
      }).join("");
      modalEl.innerHTML =
        '<div class="dm-card" role="dialog" aria-modal="true">' +
          '<div class="dm-top"><span class="dm-badge">' + esc(busCode(r)) + '</span>' +
          '<button type="button" class="dm-close" data-close="1" aria-label="Close">✕</button></div>' +
          '<div class="dm-time">' + tp.t + '<small>' + tp.ap + '</small></div>' +
          '<div class="dm-meta">' + esc(inLine) + ' · ' + esc(BUS(r)) +
            (r.verify ? ' <span class="dm-verify">⚠ ' + t("verify") + '</span>' : "") + '</div>' +
          '<div class="dm-route"><b>' + esc(originLabel(r)) + '</b><span class="dm-dash"></span><b>' + esc(FINAL_TO(r) || destLabel(r)) + '</b></div>' +
          (via ? '<div class="dm-via">' + esc(via) + '</div>' : "") +
          (r.platform ? '<div class="dm-plat">' + t("platform") + (r.verify ? " (" + t("unverified") + ")" : "") + ' <strong>' + esc(r.platform) + '</strong></div>' : "") +
          '<div class="dm-sec">' + t("otherDeps") + ' <em>' + g.length + ' ' + t("tripsToday") + '</em></div>' +
          '<div class="dm-chips">' + chips + '</div>' +
          '<div class="dm-actions">' +
            '<button type="button" class="dm-btn' + (pinned ? " on" : "") + '" data-act="pin">' + ic(ICON.star, pinned) + (pinned ? t("unpin") : t("pin")) + '</button>' +
            '<button type="button" class="dm-btn" data-act="wa">' + ic(ICON.wa) + t("wa") + '</button>' +
            '<button type="button" class="dm-btn" data-act="copy">' + ic(ICON.link) + t("copy") + '</button>' +
            '<button type="button" class="dm-btn" data-act="remind">' + ic(ICON.cal) + t("remind") + '</button>' +
            '<button type="button" class="dm-btn" data-act="notify">' + ic(ICON.bell) + t("notify") + '</button>' +
            '<button type="button" class="dm-btn" data-act="3d">' + ic(ICON.cube) + t("show3d") + '</button>' +
          '</div>' +
        '</div>';
    }
  
    function openModal(x) {
      build();
      var r = typeof x === "string" ? _byId[x] : canon(x);
      if (!r) return;
      modalRow = r;
      renderModal();
      modalEl.style.display = "flex";
      document.body.style.overflow = "hidden";
    }
    function closeModal() {
      modalRow = null;
      modalEl.style.display = "none";
      document.body.style.overflow = "";
      if (location.hash.indexOf("#bus=") === 0) {
        try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
      }
    }
  
    /* ---------- actions ---------- */
    function routeText(r) { return originLabel(r) + " ➔ " + (FINAL_TO(r) || destLabel(r)); }
    function shareWhatsApp(r) {
      var times = groupOf(r).map(function (x) { var p = tparts(x.min); return p.t + " " + p.ap; }).join(", ");
      var tp = tparts(r.min);
      var text = "🚌 *Cheyyar Bus Timings*\n📍 *Route:* " + routeText(r) + "\n🕒 *Time:* " + tp.t + " " + tp.ap +
        "\n🚍 *Bus:* " + BUS(r) + "\n🗓 *All trips:* " + times + "\n\nLive on Cheyyar Bus Hub!";
      window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent(text), "_blank");
    }
    function legacyCopy(text) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text; ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
        document.body.appendChild(ta); ta.focus(); ta.select();
        var ok = document.execCommand("copy"); document.body.removeChild(ta); return ok;
      } catch (e) { return false; }
    }
    function copyLink(r) {
      var url = location.href.split("#")[0] + "#bus=" + encodeURIComponent(rowId(r));
      var done = function (ok) { toast(ok ? t("copied") : t("copyFail")); };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(legacyCopy(url)); });
          return;
        }
      } catch (e) {}
      done(legacyCopy(url));
    }
    function openExternal(url) {
      try { if (window.AndroidApp && typeof window.AndroidApp.openExternal === "function") { window.AndroidApp.openExternal(url); return; } } catch (e) {}
      window.open(url, "_blank");
    }
    function addReminder(r) {
      var parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" })
        .format(new Date()).split("-").map(Number);
      var d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      if (r.min < nowMin()) d.setUTCDate(d.getUTCDate() + 1);
      var ymd = d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate());
      var hm = function (m) { m = Math.min(m, 1439); return pad(Math.floor(m / 60)) + pad(m % 60) + "00"; };
      var tp = tparts(r.min);
      var url = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
        "&text=" + encodeURIComponent("🚌 " + BUS(r) + " → " + destLabel(r)) +
        "&dates=" + ymd + "T" + hm(r.min) + "/" + ymd + "T" + hm(r.min + 15) +
        "&ctz=" + encodeURIComponent("Asia/Kolkata") +
        "&details=" + encodeURIComponent(routeText(r) + " • " + tp.t + " " + tp.ap + "\nCheyyar Bus Hub") +
        "&location=" + encodeURIComponent(originLabel(r));
      toast(t("reminderOpen"));
      openExternal(url);
    }
    function fireAlert(r, msg) {
      toast("🚌 " + msg);
      try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) {}
      try { new Notification("🚌 " + BUS(r) + " → " + destLabel(r), { body: msg }); } catch (e) {}
    }
    function notifyMe(r) {
      if (!("Notification" in window)) { toast(t("notifyNA")); return; }
      var go = function (perm) {
        if (perm !== "granted") { toast(t("notifyDenied")); return; }
        var n = istNow(), nowSec = (n.h * 60 + n.m) * 60 + n.s;
        var leaveSec = r.min * 60;
        if (leaveSec <= nowSec) { toast(t("gone")); return; }
        var delay = Math.max(0, (leaveSec - 600) - nowSec) * 1000;
        var id = rowId(r);
        clearTimeout(notifyTimers[id]);
        var tp = tparts(r.min);
        notifyTimers[id] = setTimeout(function () { fireAlert(r, t("busAt") + " " + tp.t + " " + tp.ap); }, delay);
        if (delay === 0) fireAlert(r, t("notifyNow")); else toast(t("notifyOn"));
      };
      try {
        if (Notification.permission === "default") {
          var p = Notification.requestPermission(function (x) { go(x); });
          if (p && p.then) p.then(go);
        } else go(Notification.permission);
      } catch (e) { toast(t("notifyNA")); }
    }
    function show3D(r) {
      closeModal();
      try {
        selectRoute(r.routeKey);
        setActive(r);
        var st = $d("stage");
        if (st) st.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (e) { console.warn("show on 3D failed:", e); }
    }
  
    /* ---------- events ---------- */
    function onRootClick(e) {
      var el = e.target;
      var sc = el.closest("[data-scope]");
      if (sc) { state.scope = sc.dataset.scope; renderStatic(); renderFirstLast(); return; }
      var op = el.closest("[data-open]");
      if (op) openModal(op.dataset.open);
    }
  
    function onModalClick(e) {
      var el = e.target;
      if (el === modalEl || el.closest("[data-close]")) { closeModal(); return; }
      var sw = el.closest("[data-switch]");
      if (sw) { openModal(sw.dataset.switch); return; }
      var act = el.closest("[data-act]");
      if (!act || !modalRow) return;
      var r = modalRow;
      switch (act.dataset.act) {
        case "pin": var added = togglePin(gk(r)); toast(added ? t("pinAdded") : t("pinRemoved")); renderModal(); break;
        case "wa": shareWhatsApp(r); break;
        case "copy": copyLink(r); break;
        case "remind": addReminder(r); break;
        case "notify": notifyMe(r); break;
        case "3d": show3D(r); break;
      }
    }
  
    function openFromHash() {
      var m = /^#bus=(.+)$/.exec(location.hash || "");
      if (!m) return;
      var id; try { id = decodeURIComponent(m[1]); } catch (e) { return; }
      var tries = 0;
      var iv = setInterval(function () {
        tries++;
        if (document.body.classList.contains("app-ready") || tries > 30) {
          clearInterval(iv);
          build();
          if (_byId[id]) openModal(id);
        }
      }, 300);
    }
  
    /* ---------- init ---------- */
    function init() {
      var mount = $d("dash-root");
      if (!mount || typeof ROUTES === "undefined") return;
      build();
      rootEl = mount;
      rootEl.innerHTML = '<section class="dash-section">' + skeleton() + "</section>";
      modalEl = document.createElement("div");
      modalEl.id = "dash-modal"; modalEl.className = "dash-modal-backdrop"; modalEl.style.display = "none";
      document.body.appendChild(modalEl);
      var toastEl = document.createElement("div");
      toastEl.id = "dash-toast"; toastEl.className = "dash-toast"; document.body.appendChild(toastEl);
  
      rootEl.addEventListener("click", onRootClick);
      modalEl.addEventListener("click", onModalClick);
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && modalRow) closeModal(); });
  
      // route tab click -> "This route" first/last follows it
      document.addEventListener("click", function (e) {
        if (e.target.closest && e.target.closest(".tab")) setTimeout(function () { renderFirstLast(); }, 0);
      }, true);
  
      // language switch (script.js sets <html lang>)
      new MutationObserver(function () { refreshAll(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  
      refreshAll();
      tick();
      setInterval(tick, 1000);
      openFromHash();
    }
  
    /* button for the existing timetable rows (called from script.js render) */
    function makeTimesButton(r) {
      var g = groupOf(r);
      var b = document.createElement("button");
      b.type = "button";
      b.className = "dash-times-btn";
      b.innerHTML = "🕒 <span>" + (g.length > 1 ? g.length + " " + t("trips") : t("details")) + "</span>";
      b.addEventListener("click", function (e) { e.stopPropagation(); openModal(r); });
      return b;
    }
  
    window.Dash = { makeTimesButton: makeTimesButton, open: openModal, refresh: refreshAll };
  
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  })();