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
        var b = $("cbx-open"); if (b) b.textContent = "⚠ " + tr("Report a change", "மாற்றத்தை தெரிவி");
        if (modal && !modal.hidden) fillModalText();
      }, 60);
    }
  });

  /* 5. Service worker (offline support) */
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }

  function init() { addReportButton(); showUpdated(); if (!navigator.onLine) window.dispatchEvent(new Event("offline")); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
