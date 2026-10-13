/* CheyyarBus extras: live countdown, "report a change", last-updated date, offline notice, service worker. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var lang = function () { return localStorage.getItem("cheyyar_bus_lang") || "en"; };
  var tr = function (en, ta) { return lang() === "ta" ? ta : en; };

  function nowMin() {
    var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return parseInt(p.find(function (x) { return x.type === t; }).value, 10); };
    return (g("hour") % 24) * 60 + g("minute");
  }

  /* 1. Live countdown inside the "Next Bus" box */
  function fmt(diff) {
    if (diff <= 0) return "now";
    if (diff < 60) return "in " + diff + " mins";
    var h = Math.floor(diff / 60), m = diff % 60;
    return "in " + h + "h" + (m ? " " + m + "m" : "");
  }
  function tickCountdown() {
    var n = nowMin();
    document.querySelectorAll("[data-cd-min]").forEach(function (el) {
      el.textContent = fmt(Number(el.getAttribute("data-cd-min")) - n);
    });
  }
  setInterval(tickCountdown, 15000);

  /* 2. Timetable last-updated date */
  function showUpdated() {
    var el = $("tt-updated"), u = window.TIMETABLE && window.TIMETABLE.updated;
    if (!el || !u) return;
    var d = new Date(u + "T00:00:00");
    if (isNaN(d)) return;
    var s = d.toLocaleDateString(lang() === "ta" ? "ta-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" });
    el.textContent = tr("Timetable last updated: ", "நேரப்பட்டியல் கடைசியாக புதுப்பிக்கப்பட்டது: ") + s;
    el.hidden = false;
  }

  /* 3. Offline notice */
  var toast;
  function showToast(msg, ms) {
    if (!toast) { toast = document.createElement("div"); toast.className = "cbx-toast"; toast.setAttribute("role", "status"); document.body.appendChild(toast); }
    toast.textContent = msg; toast.classList.add("show");
    clearTimeout(showToast.t);
    if (ms) showToast.t = setTimeout(function () { toast.classList.remove("show"); }, ms);
  }
  window.addEventListener("offline", function () { showToast(tr("You are offline. Showing the saved timetable.", "இணையம் இல்லை. சேமித்த நேரப்பட்டியல் காட்டப்படுகிறது."), 0); });
  window.addEventListener("online", function () { showToast(tr("Back online.", "மீண்டும் இணையம் இணைந்தது."), 2500); });

  /* 4. Report a change (writes to Firestore collection "reports") */
  var modal;
  function buildModal() {
    modal = document.createElement("div");
    modal.className = "cbx-backdrop"; modal.hidden = true;
    modal.innerHTML =
      '<div class="cbx-card" role="dialog" aria-modal="true" aria-labelledby="cbx-title">' +
      '<div class="cbx-head"><h3 id="cbx-title"></h3><button type="button" class="cbx-x" aria-label="Close">✕</button></div>' +
      '<label class="cbx-lbl" for="cbx-bus"></label><input id="cbx-bus" maxlength="60" autocomplete="off">' +
      '<label class="cbx-lbl" for="cbx-type"></label><select id="cbx-type"></select>' +
      '<label class="cbx-lbl" for="cbx-note"></label><textarea id="cbx-note" maxlength="200" rows="3"></textarea>' +
      '<p class="cbx-msg" id="cbx-msg" aria-live="polite"></p>' +
      '<button type="button" class="primary full" id="cbx-send"></button></div>';
    document.body.appendChild(modal);
    modal.addEventListener("click", function (e) { if (e.target === modal || e.target.classList.contains("cbx-x")) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) closeModal(); });
    $("cbx-send").addEventListener("click", sendReport);
  }
  function fillModalText() {
    $("cbx-title").textContent = tr("Report a bus change", "பேருந்து மாற்றத்தை தெரிவிக்கவும்");
    modal.querySelector('label[for="cbx-bus"]').textContent = tr("Bus no / time", "பேருந்து எண் / நேரம்");
    $("cbx-bus").placeholder = tr("e.g. 130 at 06:10 AM", "எ.கா. 130, 06:10 AM");
    modal.querySelector('label[for="cbx-type"]').textContent = tr("What changed?", "என்ன மாற்றம்?");
    var types = [["cancelled", "Bus cancelled", "பேருந்து ரத்து"], ["late", "Running late", "தாமதம்"], ["time", "Timing changed", "நேரம் மாற்றம்"], ["other", "Other", "மற்றவை"]];
    $("cbx-type").innerHTML = types.map(function (t) { return '<option value="' + t[0] + '">' + tr(t[1], t[2]) + "</option>"; }).join("");
    modal.querySelector('label[for="cbx-note"]').textContent = tr("Note (optional)", "குறிப்பு (விருப்பம்)");
    $("cbx-send").textContent = tr("Send report", "அனுப்பு");
  }
  function openModal() { if (!modal) buildModal(); fillModalText(); $("cbx-msg").textContent = ""; modal.hidden = false; $("cbx-bus").focus(); }
  function closeModal() { modal.hidden = true; }

  function getDb() {
    if (typeof firebase === "undefined" || !firebase.firestore) return null;
    if (!firebase.apps.length) {
      if (typeof firebaseConfig === "undefined") return null;
      firebase.initializeApp(firebaseConfig);
    }
    return firebase.firestore();
  }
  function sendReport() {
    var msg = $("cbx-msg"), bus = $("cbx-bus").value.trim(), note = $("cbx-note").value.trim();
    if (bus.length < 2) { msg.textContent = tr("Please enter the bus number or time.", "பேருந்து எண் அல்லது நேரத்தை உள்ளிடவும்."); return; }
    var last = Number(localStorage.getItem("cbx_last_report") || 0);
    if (Date.now() - last < 60000) { msg.textContent = tr("Please wait a minute before sending another report.", "இன்னொரு அறிக்கை அனுப்ப ஒரு நிமிடம் காத்திருக்கவும்."); return; }
    if (!navigator.onLine) { msg.textContent = tr("You are offline. Try again when online.", "இணையம் இல்லை. பின்னர் முயற்சிக்கவும்."); return; }
    var db = null;
    try { db = getDb(); } catch (e) { db = null; }
    if (!db) { msg.textContent = tr("Could not connect. Try again later.", "இணைக்க முடியவில்லை. பின்னர் முயற்சிக்கவும்."); return; }
    var btn = $("cbx-send"); btn.disabled = true;
    db.collection("reports").add({
      bus: bus.slice(0, 60), type: $("cbx-type").value, note: note.slice(0, 200),
      lang: lang(), createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function () {
      localStorage.setItem("cbx_last_report", String(Date.now()));
      $("cbx-bus").value = ""; $("cbx-note").value = "";
      closeModal(); showToast(tr("Thanks! Your report was sent.", "நன்றி! உங்கள் அறிக்கை அனுப்பப்பட்டது."), 3000);
    }).catch(function () {
      msg.textContent = tr("Could not send the report. Try again later.", "அறிக்கையை அனுப்ப முடியவில்லை. பின்னர் முயற்சிக்கவும்.");
    }).then(function () { btn.disabled = false; });
  }
  function addReportButton() {
    var row = document.querySelector(".hero-action-row");
    if (!row || $("cbx-open")) return;
    var b = document.createElement("button");
    b.type = "button"; b.id = "cbx-open"; b.className = "action-btn cbx-report-btn";
    b.textContent = "⚠ " + tr("Report a change", "மாற்றத்தை தெரிவி");
    b.addEventListener("click", openModal);
    row.appendChild(b);
  }

  /* language switch: refresh our own strings */
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("#lang-btn")) {
      setTimeout(function () {
        showUpdated();
        var sb = $("cbx-share"); if (sb) sb.textContent = "🔗 " + tr("Share search", "தேடலை பகிர்");
        renderPins();
        var b = $("cbx-open"); if (b) b.textContent = "⚠ " + tr("Report a change", "மாற்றத்தை தெரிவி");
        if (modal && !modal.hidden) fillModalText();
      }, 60);
    }
  });

  /* 5. Service worker (offline support) */
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }


  /* 6. Share a search link (?from=&to=&q=) */
  function baseUrl() { return location.protocol.indexOf("http") === 0 ? location.origin + location.pathname : "https://cheyyar-bus.vercel.app/"; }
  function buildShareUrl() {
    var p = new URLSearchParams();
    if (typeof fromEl !== "undefined" && fromEl && fromEl.value.trim()) p.set("from", fromEl.value.trim());
    if (typeof toEl !== "undefined" && toEl && toEl.value.trim()) p.set("to", toEl.value.trim());
    if (typeof searchEl !== "undefined" && searchEl && searchEl.value.trim()) p.set("q", searchEl.value.trim());
    var qs = p.toString();
    return baseUrl() + (qs ? "?" + qs : "");
  }
  function shareSearch() {
    var url = buildShareUrl(), title = "CheyyarBus", text = tr("Cheyyar bus timings", "செய்யாறு பேருந்து நேரங்கள்");
    if (navigator.share) { navigator.share({ title: title, text: text, url: url }).catch(function () {}); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { showToast(tr("Link copied.", "இணைப்பு நகலெடுக்கப்பட்டது."), 2500); }, function () { window.prompt(tr("Copy this link:", "இணைப்பை நகலெடுக்கவும்:"), url); });
    } else { window.prompt(tr("Copy this link:", "இணைப்பை நகலெடுக்கவும்:"), url); }
  }
  function addShareButton() {
    var row = document.querySelector(".chips-row");
    if (!row || $("cbx-share")) return;
    var b = document.createElement("button");
    b.type = "button"; b.id = "cbx-share"; b.className = "chip-btn";
    b.textContent = "🔗 " + tr("Share search", "தேடலை பகிர்");
    b.addEventListener("click", shareSearch);
    row.appendChild(b);
  }
  function applyUrlParams() {
    var p = new URLSearchParams(location.search), f = p.get("from"), t = p.get("to"), q = p.get("q");
    if (!f && !t && !q) return;
    function set(el, v) { if (el && v) { el.value = v.slice(0, 60); el.dispatchEvent(new Event("input", { bubbles: true })); } }
    try { set(fromEl, f); set(toEl, t); set(searchEl, q); } catch (err) { return; }
    ["from-dropdown", "to-dropdown"].forEach(function (id) { var d = $(id); if (d) d.style.display = "none"; });
    if (typeof render === "function") render();
    setTimeout(function () { if (typeof scrollToBusResults === "function") scrollToBusResults(); }, 2500);
  }

  /* 7. My Buses (pin a departure, kept on this device) */
  var PIN_KEY = "cbx_pins", MAX_PINS = 10;
  function loadPins() { try { var a = JSON.parse(localStorage.getItem(PIN_KEY) || "[]"); return Array.isArray(a) ? a : []; } catch (err) { return []; } }
  function savePins(a) { try { localStorage.setItem(PIN_KEY, JSON.stringify(a.slice(0, MAX_PINS))); } catch (err) {} }
  function keyOf(r) { return [r.routeKey || "", r.time || "", r.bus || ""].join("|"); }
  function isPinned(r) { return loadPins().indexOf(keyOf(r)) >= 0; }
  function setPinned(r, on) {
    var a = loadPins(), k = keyOf(r), i = a.indexOf(k);
    if (on && i < 0) {
      if (a.length >= MAX_PINS) { showToast(tr("You can pin up to 10 buses.", "10 பேருந்துகள் வரை பின் செய்யலாம்."), 2500); return false; }
      a.push(k);
    }
    if (!on && i >= 0) a.splice(i, 1);
    savePins(a); renderPins(); return true;
  }
  function makeButton(r) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "pin-btn";
    function paint() {
      var on = isPinned(r);
      b.textContent = on ? "★" : "☆";
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.title = on ? tr("Remove from My Buses", "எனது பேருந்துகளில் இருந்து நீக்கு") : tr("Add to My Buses", "எனது பேருந்துகளில் சேர்");
      b.setAttribute("aria-label", b.title);
    }
    paint();
    b.addEventListener("click", function (ev) {
      ev.stopPropagation();
      if (setPinned(r, !isPinned(r))) { paint(); if (r._el) r._el.classList.toggle("is-pinned", isPinned(r)); }
    });
    return b;
  }
  window.MyBus = { makeButton: makeButton, isPinned: isPinned };

  function cdText(min) {
    var diff = min - nowMin(), ta = lang() === "ta";
    if (diff < -5) return ta ? "நாளை" : "tomorrow";
    if (diff <= 0) return ta ? "இப்போது" : "now";
    if (diff < 60) return ta ? diff + " நிமிடத்தில்" : "in " + diff + " mins";
    var h = Math.floor(diff / 60), m = diff % 60;
    return ta ? h + " மணி" + (m ? " " + m + " நிமி" : "") + " கழித்து" : "in " + h + "h" + (m ? " " + m + "m" : "");
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function pinnedRows() {
    if (typeof ROUTES === "undefined" || typeof IDS === "undefined") return [];
    var keys = loadPins(), out = [];
    keys.forEach(function (k) {
      var found = null;
      IDS.some(function (id) { return ROUTES[id].rows.some(function (r) { if (keyOf(r) === k) { found = r; return true; } return false; }); });
      if (found) out.push(found);
    });
    out.sort(function (a, b) {
      var n = nowMin(), da = a.min - n, db = b.min - n;
      if (da < -5) da += 1440; if (db < -5) db += 1440;
      return da - db;
    });
    return out;
  }
  function renderPins() {
    var host = $("cbx-pins");
    if (!host) {
      var anchor = document.querySelector(".search-panel");
      if (!anchor) return;
      host = document.createElement("section"); host.id = "cbx-pins"; host.className = "cbx-pins"; host.hidden = true;
      anchor.parentNode.insertBefore(host, anchor);
      host.addEventListener("click", function (ev) {
        var rm = ev.target.closest && ev.target.closest("[data-unpin]");
        if (rm) { var a = loadPins(); a.splice(a.indexOf(rm.getAttribute("data-unpin")), 1); savePins(a); renderPins(); if (typeof render === "function") render(); }
      });
    }
    var rows = pinnedRows();
    if (!rows.length) { host.hidden = true; host.innerHTML = ""; return; }
    host.hidden = false;
    host.innerHTML = '<div class="cbx-pins-head">★ ' + tr("My Buses", "எனது பேருந்துகள்") + "</div>" +
      rows.map(function (r) {
        var bus = typeof BUS === "function" ? BUS(r) : r.bus, to = typeof FINAL_TO === "function" ? FINAL_TO(r) : r.to;
        return '<div class="cbx-pin-item"><div class="cbx-pin-main"><strong>' + esc(bus) + "</strong> → " + esc(to || "") +
          '</div><div class="cbx-pin-time">' + esc(r.displayTime || r.time) + ' · <span data-cd-pin="' + r.min + '">' + cdText(r.min) + "</span></div>" +
          '<button type="button" class="cbx-pin-x" data-unpin="' + esc(keyOf(r)) + '" aria-label="' + tr("Remove", "நீக்கு") + '">✕</button></div>';
      }).join("");
  }
  function tickPins() {
    document.querySelectorAll("[data-cd-pin]").forEach(function (el) { el.textContent = cdText(Number(el.getAttribute("data-cd-pin"))); });
  }
  setInterval(tickPins, 20000);

  function init() { addReportButton(); addShareButton(); showUpdated(); applyUrlParams(); renderPins(); if (typeof render === "function") render(); if (!navigator.onLine) window.dispatchEvent(new Event("offline")); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
