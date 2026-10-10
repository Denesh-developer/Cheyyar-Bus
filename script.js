/* =========================================================
   CHEYYAR HUB - BUS TIMINGS ENGINE (ULTRA PERFORMANCE)
   Features:
   - High-speed Debounced Cross-Route Search
   - DocumentFragment batch rendering (0% typing lag)
   - Real-time departure countdown tags (auto-updates every minute)
   - One-click WhatsApp schedule share
   - Next Bus IST Calculator & 3D TVK Model Synchronization
   ========================================================= */

   const $ = id => document.getElementById(id);
   const tabsEl = $("tabs"),
         rowsEl = $("rows"),
         searchEl = $("search"),
         fromEl = $("from-search"),
         toEl = $("to-search"),
         swapBtn = $("swap-btn"),
         countEl = $("count"),
         msgEl = $("next-msg"),
         fromList = $("from-list"),
         toList = $("to-list"),
         stageEl = $("stage"),
         upcomingToggle = $("upcoming-toggle");
   
   const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
   let lang = "en"; // Default English
   let activeRow = null, nextRow = null, lastNext = null;
   const signRows = {};
   let fresh = true;
   
   document.documentElement.dataset.theme = "dark";
   
   /* ---------- Data Parsing ---------- */
   const DATA = window.TIMETABLE;
   if (!DATA || !DATA.routes) {
     rowsEl.innerHTML = '<tr><td colspan="6" class="empty-cell">Timetable data failed to load</td></tr>';
     throw new Error("data/timetable.js did not load");
   }
   
   const toMin = t => {
     const m = /(\d+):(\d+)\s*(AM|PM)/.exec(t);
     if (!m) return 0;
     return (parseInt(m[1], 10) % 12) * 60 + parseInt(m[2], 10) + (m[3] === "PM" ? 720 : 0);
   };
   
   /* Helper to parse From and To cleanly for every bus entry */
   function getFromTo(r) {
     let from = "Cheyyar", to = r.dest || "";
     let fromTa = "செய்யாறு", toTa = r.destTa || "";
   
     if (r.dest && r.dest.includes("→")) {
       const parts = r.dest.split("→").map(s => s.trim());
       from = parts[0];
       to = parts[1];
     }
     if (r.destTa && r.destTa.includes("→")) {
       const partsTa = r.destTa.split("→").map(s => s.trim());
       fromTa = partsTa[0];
       toTa = partsTa[1];
     }
   
     return { from, to, fromTa, toTa };
   }
   
   const ROUTES = {};
   DATA.routes.forEach(r => {
     ROUTES[r.id] = Object.assign({}, r, {
       rows: r.entries.map(e => {
         const loc = getFromTo(e);
         return Object.assign({}, e, {
           min: toMin(e.time),
           from: loc.from,
           to: loc.to,
           fromTa: loc.fromTa,
           toTa: loc.toTa
         });
       }).sort((a, b) => a.min - b.min)
     });
   });
   
   const IDS = Object.keys(ROUTES);
   let current = IDS[0];
   
   /* Counter stats */
   $("st-n").textContent = IDS.reduce((n, k) => n + ROUTES[k].rows.length, 0);
   $("st-r").textContent = IDS.length;
   
   /* ---------- Auto-suggest Datalists ---------- */
   function populateLocationDatalists() {
     const fromSet = new Set(["Cheyyar", "செய்யாறு"]);
     const toSet = new Set();
   
     IDS.forEach(k => {
       ROUTES[k].rows.forEach(r => {
         if (r.from) { fromSet.add(r.from); fromSet.add(r.fromTa); }
         if (r.to) { toSet.add(r.to.split("via")[0].trim()); toSet.add(r.toTa.split("வழி")[0].trim()); }
       });
     });
   
     fromList.innerHTML = Array.from(fromSet).filter(Boolean).map(l => `<option value="${l}">`).join("");
     toList.innerHTML = Array.from(toSet).filter(Boolean).map(l => `<option value="${l}">`).join("");
   }
   
   /* ---------- Language Translations ---------- */
   function T(text, l) {
     if ((l || lang) !== "ta") return text;
     let out = text.replace(/via ([A-Za-z]+)/g, "$1 வழி");
     if (window.TA_WORDS) {
       TA_WORDS.forEach(w => { out = out.split(w[0]).join(w[1]); });
     }
     return out;
   }
   
   const BUS = (r, l) => (l || lang) === "ta" && r.busTa ? r.busTa : T(r.bus, l);
   const DEST = (r, l) => (l || lang) === "ta" && r.destTa ? r.destTa : T(r.dest, l);
   const ORIGIN = (r, l) => (l || lang) === "ta" ? r.fromTa : r.from;
   const FINAL_TO = (r, l) => (l || lang) === "ta" ? r.toTa : r.to;
   
   function showNextMsg() {
     if (!lastNext) return;
     const r = { time: lastNext.r.time, bus: BUS(lastNext.r), dest: DEST(lastNext.r) };
     msgEl.textContent = lastNext.tomorrow ? I18N[lang].tomMsg(r) : I18N[lang].nextMsg(r);
   }
   
   function drawAll() {
     IDS.forEach(id => {
       const r = signRows[id] || ROUTES[id].rows[0];
       if (window.Bus3D && Bus3D.setSign && r) {
         Bus3D.setSign(id, DEST(r), BUS(r), r.time);
       }
     });
   }
   
   function applyLang() {
     const d = I18N[lang];
     document.documentElement.lang = lang;
     document.querySelectorAll("[data-i18n]").forEach(e => {
       if (d[e.dataset.i18n]) e.textContent = d[e.dataset.i18n];
     });
     $("lang-label").textContent = lang === "en" ? "தமிழ்" : "English";
     buildTabs();
     render();
     showNextMsg();
     drawAll();
   }
   
   $("lang-btn").addEventListener("click", () => {
     lang = lang === "en" ? "ta" : "en";
     applyLang();
   });
   
   /* ---------- Route Tabs ---------- */
   function selectRoute(k) {
     current = k;
     nextRow = null;
     lastNext = null;
     msgEl.textContent = "";
     fresh = true;
     activeRow = signRows[k] || null;
     render();
     if (window.Bus3D && Bus3D.focus) Bus3D.focus(k);
   }
   
   function buildTabs() {
     tabsEl.innerHTML = "";
     IDS.forEach(k => {
       const b = document.createElement("button");
       b.className = "tab";
       b.type = "button";
       b.setAttribute("role", "tab");
       b.setAttribute("aria-selected", k === current);
       b.dataset.key = k;
       b.append(lang === "ta" ? ROUTES[k].tamil : ROUTES[k].name);
       const s = document.createElement("small");
       s.textContent = lang === "ta" ? ROUTES[k].name : ROUTES[k].tamil;
       b.appendChild(s);
       b.addEventListener("click", () => selectRoute(k));
       tabsEl.appendChild(b);
     });
   }
   
   function haystack(r) {
     return r._h || (r._h = [
       r.time, r.bus, r.dest, r.from, r.to,
       BUS(r, "ta"), DEST(r, "ta"), r.fromTa, r.toTa,
       r.platform || ""
     ].join(" ").toLowerCase());
   }
   
   /* ---------- Current Time in IST (Minutes) ---------- */
   function nowMin() {
     const p = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
     const g = t => parseInt(p.find(x => x.type === t).value, 10);
     return (g("hour") % 24) * 60 + g("minute");
   }
   
   /* ---------- Live Countdown Calculation ---------- */
   function getCountdownBadge(busMin) {
     const now = nowMin();
     let diff = busMin - now;
   
     if (diff < 0) {
       return `<span class="countdown-badge departed">Departed</span>`;
     } else if (diff <= 5) {
       return `<span class="countdown-badge urgent">🔥 in ${diff}m</span>`;
     } else if (diff <= 60) {
       return `<span class="countdown-badge soon">🟢 in ${diff}m</span>`;
     } else {
       const hrs = Math.floor(diff / 60);
       const mins = diff % 60;
       return `<span class="countdown-badge upcoming">⏳ in ${hrs}h ${mins > 0 ? mins + 'm' : ''}</span>`;
     }
   }
   
   /* ---------- WhatsApp Share Handler ---------- */
   function shareOnWhatsApp(e, r) {
     e.stopPropagation();
     const busName = BUS(r);
     const fromCity = ORIGIN(r);
     const toCity = FINAL_TO(r);
     const timeStr = r.time;
   
     const text = `🚌 *Cheyyar Bus Timings*\n📍 *Route:* ${fromCity} ➔ ${toCity}\n🕒 *Time:* ${timeStr}\n🚍 *Bus:* ${busName}\n\nLive schedule at Cheyyar Bus Hub!`;
     const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
     window.open(url, "_blank");
   }
   
   /* ---------- Render Engine (DocumentFragment Batch for 0% Lag) ---------- */
   function render() {
     const qFrom = fromEl ? fromEl.value.trim().toLowerCase() : "";
     const qTo = toEl ? toEl.value.trim().toLowerCase() : "";
     const qExtra = searchEl ? searchEl.value.trim().toLowerCase() : "";
     const showUpcomingOnly = upcomingToggle ? upcomingToggle.checked : true;
     const currentMinutes = nowMin();
   
     const isGlobalSearch = Boolean(qFrom || qTo || qExtra);
   
     let targetRows = [];
     if (isGlobalSearch) {
       IDS.forEach(k => {
         ROUTES[k].rows.forEach(r => {
           targetRows.push(Object.assign({}, r, { routeKey: k }));
         });
       });
     } else {
       targetRows = ROUTES[current].rows.map(r => Object.assign({}, r, { routeKey: current }));
     }
   
     tabsEl.querySelectorAll(".tab").forEach(b => {
       b.setAttribute("aria-selected", !isGlobalSearch && b.dataset.key === current);
     });
   
     let list = targetRows.filter(r => {
       // 1. From Location check
       if (qFrom) {
         const isFromCheyyarQuery = qFrom.includes("cheyyar") || qFrom.includes("செய்யாறு");
         const isBusFromCheyyar = r.from.toLowerCase().includes("cheyyar") || r.fromTa.includes("செய்யாறு");
   
         const matchFrom = r.from.toLowerCase().includes(qFrom) ||
                           r.fromTa.toLowerCase().includes(qFrom) ||
                           (isFromCheyyarQuery && isBusFromCheyyar);
         if (!matchFrom) return false;
       }
   
       // 2. To Location check
       if (qTo) {
         const matchTo = r.to.toLowerCase().includes(qTo) ||
                         r.toTa.toLowerCase().includes(qTo) ||
                         r.dest.toLowerCase().includes(qTo) ||
                         r.destTa.toLowerCase().includes(qTo);
         if (!matchTo) return false;
       }
   
       // 3. Extra keywords check
       if (qExtra && !haystack(r).includes(qExtra)) {
         return false;
       }
   
       return true;
     });
   
     // Upcoming buses filter
     if (showUpcomingOnly) {
       const upcomingList = list.filter(r => r.min >= currentMinutes);
       if (upcomingList.length > 0) {
         list = upcomingList;
       }
     }
   
     list.sort((a, b) => a.min - b.min);
   
     const hasPlat = list.some(r => r.platform);
     $("th-plat").hidden = !hasPlat;
     rowsEl.innerHTML = "";
   
     if (!list.length) {
       const tr = document.createElement("tr");
       const td = document.createElement("td");
       td.colSpan = hasPlat ? 6 : 5;
       td.className = "empty-cell";
       td.textContent = I18N[lang].empty;
       tr.appendChild(td);
       rowsEl.appendChild(tr);
       countEl.textContent = "0" + I18N[lang].count(0);
       return;
     }
   
     // Use DocumentFragment for zero-lag batch DOM injection
     const fragment = document.createDocumentFragment();
   
     list.forEach(r => {
       const tr = document.createElement("tr");
       tr.tabIndex = 0;
   
       // Time cell with live badge
       const tdTime = document.createElement("td");
       tdTime.className = "td-time";
       tdTime.innerHTML = `
         <div class="mobile-time-group">
           <span>${r.time}</span>
           ${getCountdownBadge(r.min)}
         </div>
       `;
   
       // Bus operator / Number
       const tdBus = document.createElement("td");
       tdBus.className = "td-bus";
       tdBus.textContent = BUS(r);
       if (r.verify) {
         const c = document.createElement("small");
         c.className = "chk";
         c.textContent = "⚠ " + I18N[lang].chk;
         tdBus.appendChild(c);
       }
   
       // Origin
       const tdFrom = document.createElement("td");
       tdFrom.className = "td-from";
       tdFrom.textContent = ORIGIN(r);
   
       // Destination
       const tdDest = document.createElement("td");
       tdDest.className = "td-dest";
       tdDest.textContent = FINAL_TO(r);
   
       tr.appendChild(tdTime);
       tr.appendChild(tdBus);
       tr.appendChild(tdFrom);
       tr.appendChild(tdDest);
   
       if (hasPlat) {
         const tdPlat = document.createElement("td");
         tdPlat.className = "td-plat";
         tdPlat.textContent = r.platform || "–";
         tr.appendChild(tdPlat);
       }
   
       // WhatsApp Share Button
       const tdAction = document.createElement("td");
       tdAction.className = "td-action";
   
       const waBtn = document.createElement("button");
       waBtn.type = "button";
       waBtn.className = "btn-whatsapp-share";
       waBtn.title = "Share on WhatsApp";
       waBtn.setAttribute("aria-label", "Share bus timing on WhatsApp");
       waBtn.innerHTML = `
         <svg viewBox="0 0 24 24">
           <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.32a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.19-.09-1.12-.55-1.3-.61-.17-.06-.3-.09-.43.09-.13.19-.49.61-.6.74-.11.13-.23.15-.42.06-.19-.09-.81-.3-1.55-.95-.57-.51-.96-1.14-1.07-1.33-.11-.19-.01-.3.08-.39.09-.08.19-.23.29-.34.1-.11.13-.19.19-.32.06-.13.03-.25-.01-.34-.05-.09-.43-1.04-.59-1.42-.16-.38-.32-.33-.43-.33h-.37c-.13 0-.34.05-.51.23s-.68.66-.68 1.61.69 1.87.79 2c.1.13 1.36 2.08 3.3 2.91.46.2.82.32 1.1.41.46.15.89.13 1.22.08.37-.06 1.12-.46 1.28-.9.16-.45.16-.83.11-.91-.04-.09-.17-.15-.36-.25"/>
         </svg>
       `;
       waBtn.addEventListener("click", e => shareOnWhatsApp(e, r));
       tdAction.appendChild(waBtn);
       tr.appendChild(tdAction);
   
       if (r === activeRow) tr.classList.add("active");
   
       tr.addEventListener("click", () => {
         if (r.routeKey && r.routeKey !== current) {
           current = r.routeKey;
           tabsEl.querySelectorAll(".tab").forEach(b => b.setAttribute("aria-selected", b.dataset.key === current));
         }
         setActive(r);
       });
   
       r._el = tr;
       fragment.appendChild(tr);
     });
   
     rowsEl.appendChild(fragment);
     countEl.textContent = list.length + I18N[lang].count(list.length);
   }
   
   function setActive(r) {
     activeRow = r;
     signRows[current] = r;
     rowsEl.querySelectorAll("tr.active").forEach(e => e.classList.remove("active"));
     if (r._el) r._el.classList.add("active");
     if (window.Bus3D && Bus3D.setSign) {
       Bus3D.setSign(current, DEST(r), BUS(r), r.time);
       Bus3D.focus(current);
     }
   }
   
   /* Fast Debounce to eliminate typing lag */
   function debounce(fn, delay = 150) {
     let timer;
     return function (...args) {
       clearTimeout(timer);
       timer = setTimeout(() => fn.apply(this, args), delay);
     };
   }
   const debouncedRender = debounce(render, 150);
   
   fromEl.addEventListener("input", debouncedRender);
   toEl.addEventListener("input", debouncedRender);
   searchEl.addEventListener("input", debouncedRender);
   
   if (upcomingToggle) {
     upcomingToggle.addEventListener("change", render);
   }
   
   $("clear-from-btn").addEventListener("click", () => { fromEl.value = ""; render(); });
   $("clear-to-btn").addEventListener("click", () => { toEl.value = ""; render(); });
   
   swapBtn.addEventListener("click", () => {
     const tmp = fromEl.value;
     fromEl.value = toEl.value;
     toEl.value = tmp;
     render();
   });
   
   document.querySelectorAll(".chip-btn[data-city]").forEach(chip => {
     chip.addEventListener("click", () => {
       toEl.value = chip.dataset.city;
       render();
     });
   });
   
   $("clear-all-filters").addEventListener("click", () => {
     fromEl.value = "";
     toEl.value = "";
     searchEl.value = "";
     render();
   });
   
   /* Next Bus Button Handler */
   $("next-btn").addEventListener("click", () => {
     fromEl.value = "";
     toEl.value = "";
     searchEl.value = "";
     const rows = ROUTES[current].rows, now = nowMin();
     let r = rows.find(x => x.min >= now), tomorrow = false;
     if (!r) { r = rows[0]; tomorrow = true; }
     nextRow = r;
     lastNext = { r, tomorrow };
     showNextMsg();
     render();
     setActive(r);
     if (r._el) r._el.scrollIntoView({ block: "center", behavior: "smooth" });
   });
   
   /* Theme Switcher */
   $("theme-btn").addEventListener("click", () => {
     const root = document.documentElement;
     const isDark = root.dataset.theme === "dark";
     root.dataset.theme = isDark ? "light" : "dark";
   });
   
   /* Developer Modal Controls */
   const devModal = $("dev-modal");
   const openDevBtn = $("open-dev-modal");
   const closeDevBtn = $("close-dev-modal");
   const closeDevBtnAction = $("close-dev-modal-btn");
   
   if (openDevBtn && devModal) {
     openDevBtn.addEventListener("click", () => { devModal.style.display = "flex"; });
   }
   if (closeDevBtn && devModal) {
     closeDevBtn.addEventListener("click", () => { devModal.style.display = "none"; });
   }
   if (closeDevBtnAction && devModal) {
     closeDevBtnAction.addEventListener("click", () => { devModal.style.display = "none"; });
   }
   if (devModal) {
     devModal.addEventListener("click", e => {
       if (e.target === devModal) devModal.style.display = "none";
     });
   }
   
   /* Splash Screen Progress Timer */
   function initLoadingScreen() {
     const splashEl = document.getElementById("app-loading-screen");
     const fillEl = document.getElementById("progress-fill");
     const numEl = document.getElementById("progress-num");
   
     if (!splashEl || !fillEl || !numEl) return;
   
     let progress = 0;
     const interval = setInterval(() => {
       progress += Math.floor(Math.random() * 9) + 4;
       if (progress >= 100) {
         progress = 100;
         clearInterval(interval);
         fillEl.style.width = "100%";
         numEl.textContent = "100%";
         setTimeout(() => {
           splashEl.classList.add("loaded");
           setTimeout(() => splashEl.remove(), 600);
         }, 300);
       } else {
         fillEl.style.width = progress + "%";
         numEl.textContent = progress + "%";
       }
     }, 40);
   }
   
   // Auto-refresh countdown every 60 seconds
   setInterval(() => {
     render();
   }, 60000);
   
   /* Initialize */
   initLoadingScreen();
   populateLocationDatalists();
   const ok = window.Bus3D ? Bus3D.init(stageEl, DATA.routes, selectRoute) : false;
   if (ok) {
     stageEl.classList.add("ready");
     const loader = stageEl.querySelector(".stage-loading");
     if (loader) loader.style.display = "none";
   }
   applyLang();
   if (ok && Bus3D.focus) Bus3D.focus(current);