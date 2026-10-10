/* =========================================================
   CHEYYAR HUB - BUS TIMINGS ENGINE (ULTRA PERFORMANCE)
   Routes Included:
   - Vellore (SH-5 Arcot & Sivaji Special)
   - Kanchipuram (Direct SH-116 & Vembakkam)
   - Vandavasi (Direct SH-115)
   - Arani (via S.V Nagaram)
   - Korukkai (கொரக்கை)
   - Thavasi (தவசி)
   - Kalavai (கலவை)
   - Parasur (பாராசூர்)
   - Gingee (செஞ்சி)
   - Puducherry (புதுச்சேரி)
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
         upcomingToggle = $("upcoming-toggle"),
         langBtn = $("lang-btn"),
         langLabel = $("lang-label");
   
   let lang = "en";
   let activeRow = null, nextRow = null, lastNext = null;
   const signRows = {};
   
   document.documentElement.dataset.theme = "dark";
   
   /* =========================================================
      1. ROUTE SEQUENCES & APPROXIMATE OFFSETS (MINUTES)
      ========================================================= */
   
   /* 1. Vellore Route 1 (Regular Arcot SH-5) */
   const ROUTE_VELLORE_ARCOT = [
     "cheyyar", "arani koot road", "duli", "pappanthangal", "sirugattur",
     "moranam", "randam", "mecheri", "kalavai koot road", "chinnakukundi",
     "puduppadi", "poongodu", "mupathykatti", "arcot", "melvisharam",
     "arapakkam", "perumugai", "sathuvacheri", "kaadhidhapettai", "thottapalayam", "vellore"
   ];
   
   const OFFSETS_ARCOT = {
     "cheyyar": 0, "arani koot road": 7, "duli": 13, "pappanthangal": 18,
     "sirugattur": 24, "moranam": 28, "randam": 33, "mecheri": 37,
     "kalavai koot road": 42, "chinnakukundi": 45, "puduppadi": 48,
     "poongodu": 51, "mupathykatti": 54, "arcot": 58, "melvisharam": 66,
     "arapakkam": 72, "perumugai": 78, "sathuvacheri": 84,
     "kaadhidhapettai": 88, "thottapalayam": 92, "vellore": 96
   };
   
   /* 2. Vellore Route 2 (Sivaji Special Route) */
   const ROUTE_VELLORE_SIVAJI = [
     "cheyyar", "arani koot road", "duli", "pappanthangal", "sirugattur",
     "moranam", "randam", "mecheri", "kalavai koot road", "k velur",
     "sembedu", "ozhalai", "athithangal", "muppaduvetti", "mupathykatti",
     "arcot", "melvisharam", "arapakkam", "perumugai", "sathuvacheri",
     "kaadhidhapettai", "thottapalayam", "vellore"
   ];
   
   const OFFSETS_SIVAJI = {
     "cheyyar": 0, "arani koot road": 7, "duli": 13, "pappanthangal": 18,
     "sirugattur": 24, "moranam": 28, "randam": 33, "mecheri": 37,
     "kalavai koot road": 42, "k velur": 46, "sembedu": 50,
     "ozhalai": 55, "athithangal": 60, "muppaduvetti": 64,
     "mupathykatti": 67, "arcot": 72, "melvisharam": 80,
     "arapakkam": 86, "perumugai": 92, "sathuvacheri": 98,
     "kaadhidhapettai": 102, "thottapalayam": 106, "vellore": 110
   };
   
   /* 3. Kanchipuram Route 1 (Direct via Mamandur / Dusi) */
   const ROUTE_KANCHI_DIRECT = [
     "cheyyar", "puliyarambakkam", "valarpuram", "kiliyathur", "palu",
     "palli", "ermalnangal", "santhimedu", "mamandur", "dusi", "sevlimedu", "kanchipuram"
   ];
   
   const OFFSETS_KANCHI_DIRECT = {
     "cheyyar": 0, "puliyarambakkam": 8, "valarpuram": 14, "kiliyathur": 18,
     "palu": 22, "palli": 25, "ermalnangal": 29, "santhimedu": 32,
     "mamandur": 35, "dusi": 40, "sevlimedu": 47, "kanchipuram": 52
   };
   
   /* 4. Kanchipuram Route 2 (via Vembakkam) */
   const ROUTE_KANCHI_VEMBAKKAM = [
     "cheyyar", "arani koot road", "duli", "pappanthangal", "sirugattur",
     "ramakrishnapuram", "hasanamapet", "perungattur", "alanthagal",
     "vembakkam", "pillanthangal", "kolivakkam", "iyyankkulam",
     "abdullapuram", "sevlimedu", "kanchipuram"
   ];
   
   const OFFSETS_KANCHI_VEMBAKKAM = {
     "cheyyar": 0, "arani koot road": 7, "duli": 13, "pappanthangal": 18,
     "sirugattur": 24, "ramakrishnapuram": 28, "hasanamapet": 33,
     "perungattur": 38, "alanthagal": 43, "vembakkam": 48,
     "pillanthangal": 53, "kolivakkam": 58, "iyyankkulam": 63,
     "abdullapuram": 68, "sevlimedu": 74, "kanchipuram": 80
   };
   
   /* 5. Vandavasi Route (Direct) */
   const ROUTE_VANDAVASI_DIRECT = [
     "cheyyar", "anakavur", "erumaivetti", "kulamanthai", "eachur", "vandavasi"
   ];
   
   const OFFSETS_VANDAVASI = {
     "cheyyar": 0, "anakavur": 8, "erumaivetti": 15, "kulamanthai": 22, "eachur": 28, "vandavasi": 38
   };
   
   /* 6. Arani Route (via S.V Nagaram) */
   const ROUTE_ARANI_SV_NAGARAM = [
     "cheyyar", "arani koot road", "vadathandalam", "arugavoor", "perupallam",
     "thandarai", "vadugapattu", "thattachari", "mambakkam", "nethapakkam",
     "s.v nagaram", "arani"
   ];
   
   const OFFSETS_ARANI_SV_NAGARAM = {
     "cheyyar": 0, "arani koot road": 7, "vadathandalam": 12, "arugavoor": 16,
     "perupallam": 20, "thandarai": 24, "vadugapattu": 28, "thattachari": 32,
     "mambakkam": 37, "nethapakkam": 41, "s.v nagaram": 45, "arani": 50
   };
   
   /* 7. Korukkai Route (கொரக்கை) */
   const ROUTE_KORUKKAI = [
     "cheyyar", "vellai", "kilathur", "eraiyur", "korukkai"
   ];
   
   const OFFSETS_KORUKKAI = {
     "cheyyar": 0, "vellai": 7, "kilathur": 13, "eraiyur": 19, "korukkai": 25
   };
   
   /* 8. Thavasi Route (தவசி) */
   const ROUTE_THAVASI = [
     "cheyyar", "kilmattai", "thavasi"
   ];
   
   const OFFSETS_THAVASI = {
     "cheyyar": 0, "kilmattai": 10, "thavasi": 20
   };
   
   /* 9. Kalavai Route (கலவை) */
   const ROUTE_KALAVAI = [
     "cheyyar", "arani koot road", "duli", "pappanthangal", "sirugattur",
     "moranam", "randam", "mecheri", "kalavai koot road", "kaniyanthangal",
     "allalacheri", "kalavai"
   ];
   
   const OFFSETS_KALAVAI = {
     "cheyyar": 0, "arani koot road": 7, "duli": 13, "pappanthangal": 18,
     "sirugattur": 24, "moranam": 28, "randam": 33, "mecheri": 37,
     "kalavai koot road": 42, "kaniyanthangal": 46, "allalacheri": 51, "kalavai": 56
   };
   
   /* 10. Parasur Route (பாராசூர்) */
   const ROUTE_PARASUR = [
     "cheyyar", "vellai", "mottur", "kilathur", "parasur"
   ];
   
   const OFFSETS_PARASUR = {
     "cheyyar": 0, "vellai": 7, "mottur": 11, "kilathur": 15, "parasur": 22
   };
   
   /* 11. Cheyyar to Gingee Route (செஞ்சி) */
   const ROUTE_GINGEE = [
     "cheyyar", "anakavur", "erumaivetti", "kulamanthai", "eachur", "vandavasi",
     "navalpakkam", "thellar", "dadapuram", "naduvanandal", "nattarmangalam",
     "senjikottai", "gingee"
   ];
   
   const OFFSETS_GINGEE = {
     "cheyyar": 0, "anakavur": 8, "erumaivetti": 15, "kulamanthai": 22, "eachur": 28,
     "vandavasi": 38, "navalpakkam": 45, "thellar": 53, "dadapuram": 62,
     "naduvanandal": 72, "nattarmangalam": 80, "senjikottai": 88, "gingee": 95
   };
   
   /* 12. Cheyyar to Puducherry Route (புதுச்சேரி) */
   const ROUTE_PUDUCHERRY = [
     "cheyyar", "anakavur", "erumaivetti", "kulamanthai", "eachur", "vandavasi",
     "navalpakkam", "thellar", "salavadi", "tindivanam", "aadthur", "omandur",
     "kiliyanur", "andiyarpalayam", "puducherry"
   ];
   
   const OFFSETS_PUDUCHERRY = {
     "cheyyar": 0, "anakavur": 8, "erumaivetti": 15, "kulamanthai": 22, "eachur": 28,
     "vandavasi": 38, "navalpakkam": 45, "thellar": 53, "salavadi": 64,
     "tindivanam": 78, "aadthur": 88, "omandur": 98, "kiliyanur": 108,
     "andiyarpalayam": 118, "puducherry": 130
   };
   
   /* =========================================================
      2. DATA & ROUTE INITIALIZATION
      ========================================================= */
   
   const DATA = window.TIMETABLE;
   if (!DATA || !DATA.routes) {
     rowsEl.innerHTML = '<tr><td colspan="6" class="empty-cell">Timetable data failed to load</td></tr>';
     throw new Error("data/timetable.js did not load");
   }
   
   const toMin = t => {
     if (!t) return 0;
     const m = /(\d+)[:.](\d+)\s*(AM|PM)?/i.exec(t);
     if (!m) return 0;
     let h = parseInt(m[1], 10);
     let min = parseInt(m[2], 10);
     const isPM = m[3] ? m[3].toUpperCase() === "PM" : false;
     const isAM = m[3] ? m[3].toUpperCase() === "AM" : false;
   
     if (isPM && h < 12) h += 12;
     if (isAM && h === 12) h = 0;
     return h * 60 + min;
   };
   
   function minToTimeStr(totalMinutes) {
     let mins = ((totalMinutes % 1440) + 1440) % 1440;
     let h = Math.floor(mins / 60);
     let m = mins % 60;
     const ampm = h >= 12 ? "PM" : "AM";
     h = h % 12;
     if (h === 0) h = 12;
     const mm = m < 10 ? "0" + m : m;
     return `${h}:${mm} ${ampm}`;
   }
   
   function getFromTo(r) {
     let from = (r.from || "Cheyyar").trim();
     let to = (r.to || r.dest || "").trim();
     let fromTa = (r.fromTa || "செய்யாறு").trim();
     let toTa = (r.toTa || r.destTa || "").trim();
   
     if (to.includes("→")) {
       const parts = to.split("→").map(s => s.trim());
       from = parts[0];
       to = parts[1];
     }
     if (toTa.includes("→")) {
       const partsTa = toTa.split("→").map(s => s.trim());
       fromTa = partsTa[0];
       toTa = partsTa[1];
     }
     return { from, to, fromTa, toTa };
   }
   
   function isSivajiBus(r) {
     const name = ((r.bus || "") + " " + (r.busTa || "")).toLowerCase();
     const dest = ((r.to || "") + " " + (r.dest || "")).toLowerCase();
     return name.includes("sivaji") || name.includes("சிவாஜி") || dest.includes("வழி கலவை");
   }
   
   function isVembakkamRoute(r) {
     const rKey = (r.routeKey || "").toLowerCase();
     const dest = ((r.to || "") + " " + (r.toTa || "")).toLowerCase();
     return rKey.includes("vembakkam") || dest.includes("vembakkam") || dest.includes("வெம்பாக்கம்") || dest.includes("பெருங்கட்டூர்");
   }
   
   function getRouteStops(r) {
     if (r.stops && Array.isArray(r.stops)) return r.stops;
     
     if (isSivajiBus(r)) return ROUTE_VELLORE_SIVAJI;
     if (isVembakkamRoute(r)) return ROUTE_KANCHI_VEMBAKKAM;
   
     const rKey = (r.routeKey || "").toLowerCase();
     const toCity = (r.to || "").toLowerCase();
     const toCityTa = (r.toTa || "").toLowerCase();
   
     if (rKey.includes("puducherry") || toCity.includes("puducherry") || toCityTa.includes("புதுச்சேரி") || toCity.includes("pondicherry") || toCityTa.includes("பாண்டிச்சேரி")) {
       return ROUTE_PUDUCHERRY;
     }
     if (rKey.includes("gingee") || rKey.includes("senji") || toCity.includes("gingee") || toCityTa.includes("செஞ்சி")) {
       return ROUTE_GINGEE;
     }
     if (rKey.includes("parasur") || toCity.includes("parasur") || toCityTa.includes("பாராசூர்")) {
       return ROUTE_PARASUR;
     }
     if (rKey.includes("korkai") || rKey.includes("korukkai") || toCity.includes("korukkai") || toCityTa.includes("கொரக்கை") || toCityTa.includes("கொர்க்கை")) {
       return ROUTE_KORUKKAI;
     }
     if (rKey.includes("kalavai") || toCity.includes("kalavai") || toCityTa.includes("கலவை")) {
       return ROUTE_KALAVAI;
     }
     if (rKey.includes("thavasi") || toCity.includes("thavasi") || toCityTa.includes("தவசி")) {
       return ROUTE_THAVASI;
     }
     if (rKey.includes("arani") || toCity.includes("arani") || toCityTa.includes("ஆரணி") ||
         toCity.includes("salem") || toCityTa.includes("சேலம்") ||
         toCity.includes("tiruvannamalai") || toCityTa.includes("திருவண்ணாமலை") ||
         toCity.includes("polur") || toCityTa.includes("போளூர்")) {
       return ROUTE_ARANI_SV_NAGARAM;
     }
     if (rKey.includes("vandavasi") || toCity.includes("vandavasi") || toCityTa.includes("வந்தவாசி")) {
       return ROUTE_VANDAVASI_DIRECT;
     }
     if (rKey.includes("kanchipuram") || toCity.includes("kanchipuram") || toCityTa.includes("காஞ்சிபுரம்") || toCity.includes("chennai") || toCityTa.includes("சென்னை")) {
       return ROUTE_KANCHI_DIRECT;
     }
     if (rKey.includes("arcot") || toCity.includes("vellore") || toCityTa.includes("வேலூர்") || toCity.includes("arcot") || toCityTa.includes("ஆற்காடு")) {
       return ROUTE_VELLORE_ARCOT;
     }
   
     return [r.from, r.to].filter(Boolean);
   }
   
   function getCalculatedTime(r, searchFrom) {
     if (!searchFrom) return { timeStr: r.time, min: r.min, isOffset: false, offsetMins: 0 };
     const q = searchFrom.toLowerCase().trim();
   
     let offsetTable = OFFSETS_ARCOT;
     const stops = getRouteStops(r);
   
     if (stops === ROUTE_VELLORE_SIVAJI) offsetTable = OFFSETS_SIVAJI;
     else if (stops === ROUTE_KANCHI_VEMBAKKAM) offsetTable = OFFSETS_KANCHI_VEMBAKKAM;
     else if (stops === ROUTE_KANCHI_DIRECT) offsetTable = OFFSETS_KANCHI_DIRECT;
     else if (stops === ROUTE_VANDAVASI_DIRECT) offsetTable = OFFSETS_VANDAVASI;
     else if (stops === ROUTE_ARANI_SV_NAGARAM) offsetTable = OFFSETS_ARANI_SV_NAGARAM;
     else if (stops === ROUTE_KORUKKAI) offsetTable = OFFSETS_KORUKKAI;
     else if (stops === ROUTE_THAVASI) offsetTable = OFFSETS_THAVASI;
     else if (stops === ROUTE_KALAVAI) offsetTable = OFFSETS_KALAVAI;
     else if (stops === ROUTE_PARASUR) offsetTable = OFFSETS_PARASUR;
     else if (stops === ROUTE_GINGEE) offsetTable = OFFSETS_GINGEE;
     else if (stops === ROUTE_PUDUCHERRY) offsetTable = OFFSETS_PUDUCHERRY;
   
     const matchedKey = Object.keys(offsetTable).find(k => k.includes(q) || q.includes(k));
     if (!matchedKey || offsetTable[matchedKey] === 0) {
       return { timeStr: r.time, min: r.min, isOffset: false, offsetMins: 0 };
     }
   
     const offset = Number(offsetTable[matchedKey]) || 0;
     const newMin = r.min + offset;
     return { timeStr: minToTimeStr(newMin), min: newMin, isOffset: true, offsetMins: offset };
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
           toTa: loc.toTa,
           routeKey: r.id
         });
       }).sort((a, b) => a.min - b.min)
     });
   });
   
   const IDS = Object.keys(ROUTES);
   let current = IDS[0];
   
   $("st-n").textContent = IDS.reduce((n, k) => n + ROUTES[k].rows.length, 0);
   $("st-r").textContent = IDS.length;
   
   /* =========================================================
      3. LOCATION AUTO-COMPLETE SUGGESTIONS
      ========================================================= */
   
   function populateLocationDatalists() {
     const fromSet = new Set(["Cheyyar", "செய்யாறு"]);
     const toSet = new Set();
   
     const allStops = Array.from(new Set([
       ...ROUTE_VELLORE_ARCOT,
       ...ROUTE_VELLORE_SIVAJI,
       ...ROUTE_KANCHI_DIRECT,
       ...ROUTE_KANCHI_VEMBAKKAM,
       ...ROUTE_VANDAVASI_DIRECT,
       ...ROUTE_ARANI_SV_NAGARAM,
       ...ROUTE_KORUKKAI,
       ...ROUTE_THAVASI,
       ...ROUTE_KALAVAI,
       ...ROUTE_PARASUR,
       ...ROUTE_GINGEE,
       ...ROUTE_PUDUCHERRY
     ]));
   
     allStops.forEach(s => {
       const formatted = s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
       fromSet.add(formatted);
       toSet.add(formatted);
     });
   
     IDS.forEach(k => {
       ROUTES[k].rows.forEach(r => {
         if (r.from) { fromSet.add(r.from); fromSet.add(r.fromTa); }
         if (r.to) { toSet.add(r.to.split("via")[0].trim()); toSet.add(r.toTa.split("வழி")[0].trim()); }
       });
     });
   
     fromList.innerHTML = Array.from(fromSet).filter(Boolean).map(l => `<option value="${l}">`).join("");
     toList.innerHTML = Array.from(toSet).filter(Boolean).map(l => `<option value="${l}">`).join("");
   }
   
   /* =========================================================
      4. TRANSLATION & HELPERS
      ========================================================= */
   
   function T(text, l) {
     if ((l || lang) !== "ta") return text;
     let out = (text || "").replace(/via ([A-Za-z]+)/g, "$1 வழி");
     if (window.TA_WORDS) {
       TA_WORDS.forEach(w => { out = out.split(w[0]).join(w[1]); });
     }
     return out;
   }
   
   const BUS = (r, l) => (l || lang) === "ta" && r.busTa ? r.busTa : T(r.bus, l);
   const DEST = (r, l) => (l || lang) === "ta" && r.toTa ? r.toTa : T(r.to, l);
   const ORIGIN = (r, l) => (l || lang) === "ta" ? r.fromTa : r.from;
   const FINAL_TO = (r, l) => (l || lang) === "ta" ? r.toTa : r.to;
   
   function nowMin() {
     const p = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
     const g = t => parseInt(p.find(x => x.type === t).value, 10);
     return (g("hour") % 24) * 60 + g("minute");
   }
   
   function getCountdownBadge(busMin) {
     const now = nowMin();
     let diff = busMin - now;
     if (diff < 0) return `<span class="countdown-badge departed">Departed</span>`;
     if (diff <= 5) return `<span class="countdown-badge urgent">🔥 in ${diff}m</span>`;
     if (diff <= 60) return `<span class="countdown-badge soon">🟢 in ${diff}m</span>`;
     const hrs = Math.floor(diff / 60);
     const mins = diff % 60;
     return `<span class="countdown-badge upcoming">⏳ in ${hrs}h ${mins > 0 ? mins + 'm' : ''}</span>`;
   }
   
   function shareOnWhatsApp(e, r, displayFrom, displayTo, displayTime) {
     e.stopPropagation();
     const text = `🚌 *Cheyyar Bus Timings*\n📍 *Route:* ${displayFrom} ➔ ${displayTo}\n🕒 *Time:* ${displayTime}\n🚍 *Bus:* ${BUS(r)}\n\nLive on Cheyyar Bus Hub!`;
     window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
   }
   
   /* =========================================================
      5. STRICT FILTER & RENDER ENGINE
      ========================================================= */
   
   function render() {
     const qFrom = fromEl ? fromEl.value.trim().toLowerCase() : "";
     const qTo = toEl ? toEl.value.trim().toLowerCase() : "";
     const qExtra = searchEl ? searchEl.value.trim().toLowerCase() : "";
     const showUpcomingOnly = upcomingToggle ? upcomingToggle.checked : true;
     const currentMinutes = nowMin();
   
     const isSearchActive = Boolean(qTo || qExtra || (qFrom && !qFrom.includes("cheyyar") && !qFrom.includes("செய்யாறு")));
   
     let targetRows = [];
     if (isSearchActive) {
       IDS.forEach(k => {
         ROUTES[k].rows.forEach(r => targetRows.push(r));
       });
     } else {
       targetRows = ROUTES[current].rows;
     }
   
     tabsEl.querySelectorAll(".tab").forEach(b => {
       b.setAttribute("aria-selected", !isSearchActive && b.dataset.key === current);
     });
   
     let list = targetRows.filter(r => {
       const stopsList = getRouteStops(r).map(s => s.toLowerCase());
   
       const matchStop = (stopName, query) => {
         stopName = stopName.toLowerCase().trim();
         query = query.toLowerCase().trim();
         
         if ((query === "arani" || query === "ஆரணி") && stopName.includes("koot road")) {
           return false;
         }
         if ((query === "kalavai" || query === "கலவை") && stopName.includes("koot road")) {
           return false;
         }
         return stopName === query || stopName.includes(query);
       };
   
       // 1. STRICT FROM VALIDATION
       let fromIdx = 0;
       if (qFrom) {
         const isCheyyarQ = qFrom.includes("cheyyar") || qFrom.includes("செய்யாறு");
         const isBusFromCheyyar = r.from.toLowerCase().includes("cheyyar") || r.fromTa.includes("செய்யாறு");
   
         fromIdx = stopsList.findIndex(s => matchStop(s, qFrom));
         const exactFromMatch = r.from.toLowerCase().includes(qFrom) || r.fromTa.toLowerCase().includes(qFrom);
   
         if (!exactFromMatch && fromIdx === -1 && !(isCheyyarQ && isBusFromCheyyar)) {
           return false;
         }
       }
   
       // 2. STRICT TO VALIDATION
       let toIdx = stopsList.length - 1;
       if (qTo) {
         toIdx = stopsList.findIndex(s => matchStop(s, qTo));
         
         let exactToMatch = r.to.toLowerCase().includes(qTo) || r.toTa.toLowerCase().includes(qTo);
         if ((qTo === "arani" || qTo === "ஆரணி") && (r.to.toLowerCase().includes("koot road") || r.toTa.includes("கூட்ரோடு"))) {
           exactToMatch = false;
         }
   
         if (!exactToMatch && toIdx === -1) {
           return false;
         }
   
         const busStartsFromSearchedTarget = r.from.toLowerCase().includes(qTo) || r.fromTa.toLowerCase().includes(qTo);
         if (busStartsFromSearchedTarget && !exactToMatch) {
           return false;
         }
       }
   
       // 3. DIRECTION VALIDATION
       if (qFrom && qTo && fromIdx !== -1 && toIdx !== -1) {
         if (fromIdx >= toIdx) return false;
       }
   
       // 4. EXTRA KEYWORD CHECK
       if (qExtra) {
         const rowText = [r.time, r.bus, r.busTa, r.from, r.to, r.fromTa, r.toTa].join(" ").toLowerCase();
         if (!rowText.includes(qExtra)) return false;
       }
   
       return true;
     });
   
     list = list.map(r => {
       const tCalc = getCalculatedTime(r, qFrom);
       return Object.assign({}, r, {
         displayTime: tCalc.timeStr,
         displayMin: tCalc.min,
         isOffset: tCalc.isOffset,
         offsetMins: tCalc.offsetMins
       });
     });
   
     if (showUpcomingOnly) {
       const upcomingList = list.filter(r => r.displayMin >= currentMinutes);
       if (upcomingList.length > 0) list = upcomingList;
     }
   
     list.sort((a, b) => a.displayMin - b.displayMin);
   
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
   
     const fragment = document.createDocumentFragment();
   
     list.forEach(r => {
       const tr = document.createElement("tr");
       tr.tabIndex = 0;
   
       const tdTime = document.createElement("td");
       tdTime.className = "td-time";
       tdTime.innerHTML = `
         <div class="mobile-time-group">
           <span>${r.displayTime}</span>
           ${getCountdownBadge(r.displayMin)}
           ${r.isOffset ? `<small style="display:block; font-size:10px; color:#ff7a45; font-weight:600;">(+${r.offsetMins}m from Cheyyar)</small>` : ''}
         </div>
       `;
   
       const tdBus = document.createElement("td");
       tdBus.className = "td-bus";
   
       const isSivaji = isSivajiBus(r);
       const busDest = ((r.to || "") + " " + (r.toTa || "")).toLowerCase();
       const routeId = (r.routeKey || "").toLowerCase();
   
       let routeBadge = "";
       if (isSivaji) {
         routeBadge = `<span class="route-tag tag-sivaji">📍 வழி: K.வேலூர் / செம்பேடு</span>`;
       } else if (routeId.includes("korkai") || routeId.includes("korukkai")) {
         routeBadge = `<span class="route-tag tag-korkai">📍 வழி: கொரக்கை</span>`;
       } else if (routeId.includes("arani")) {
         routeBadge = `<span class="route-tag tag-arani">📍 வழி: S.V நகரம்</span>`;
       } else if (routeId.includes("parasur") || busDest.includes("parasur") || busDest.includes("பாராசூர்")) {
         routeBadge = `<span class="route-tag tag-parasur">📍 வழி: பாராசூர்</span>`;
       } else if (routeId.includes("gingee") || routeId.includes("senji") || busDest.includes("gingee") || busDest.includes("செஞ்சி")) {
         routeBadge = `<span class="route-tag tag-gingee">📍 வழி: வந்தவாசி ➔ செஞ்சி</span>`;
       } else if (routeId.includes("puducherry") || busDest.includes("puducherry") || busDest.includes("புதுச்சேரி")) {
         routeBadge = `<span class="route-tag tag-puducherry">📍 வழி: திண்டிவனம் ➔ பாண்டி</span>`;
       } else if (routeId.includes("vembakkam") || busDest.includes("vembakkam") || busDest.includes("பெருங்கட்டூர்")) {
         routeBadge = `<span class="route-tag tag-vembakkam">📍 வழி: வெம்பாக்கம்</span>`;
       } else if (routeId.includes("arcot") || busDest.includes("vellore") || busDest.includes("வேலூர்") || busDest.includes("arcot") || busDest.includes("ஆற்காடு")) {
         routeBadge = `<span class="route-tag tag-arcot">📍 வழி: SH-5 ஆற்காடு பைபாஸ்</span>`;
       } else if (routeId.includes("thavasi") || busDest.includes("thavasi") || busDest.includes("தவசி")) {
         routeBadge = `<span class="route-tag tag-thavasi">📍 வழி: தவசி</span>`;
       } else if (routeId.includes("kalavai") || busDest.includes("kalavai") || busDest.includes("கலவை")) {
         routeBadge = `<span class="route-tag tag-kalavai">📍 வழி: கலவை</span>`;
       } else if (routeId.includes("kanchipuram") || busDest.includes("dusi") || busDest.includes("mamandur") || busDest.includes("kanchipuram") || busDest.includes("காஞ்சிபுரம்")) {
         routeBadge = `<span class="route-tag tag-kanchi">📍 வழி: மாமண்டூர் / தூசி</span>`;
       }
   
       tdBus.innerHTML = `
         <div class="bus-name-row">
           <span>${BUS(r)}</span>
           ${routeBadge}
         </div>
       `;
   
       if (r.verify) {
         const c = document.createElement("small");
         c.className = "chk";
         c.textContent = "⚠ " + I18N[lang].chk;
         tdBus.appendChild(c);
       }
   
       const tdFrom = document.createElement("td");
       tdFrom.className = "td-from";
       tdFrom.textContent = ORIGIN(r);
   
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
       waBtn.addEventListener("click", e => shareOnWhatsApp(e, r, tdFrom.textContent, tdDest.textContent, r.displayTime));
       tdAction.appendChild(waBtn);
       tr.appendChild(tdAction);
   
       if (r === activeRow) tr.classList.add("active");
       tr.addEventListener("click", () => setActive(r));
   
       r._el = tr;
       fragment.appendChild(tr);
     });
   
     rowsEl.appendChild(fragment);
     countEl.textContent = list.length + I18N[lang].count(list.length);
   
     if (!activeRow && list.length > 0) {
       activeRow = list[0];
       setActive(list[0]);
     } else if (activeRow && window.Bus3D && Bus3D.setSign) {
       Bus3D.setSign(current, DEST(activeRow), BUS(activeRow), activeRow.displayTime || activeRow.time);
     }
   }
   
   function setActive(r) {
     activeRow = r;
     signRows[current] = r;
     rowsEl.querySelectorAll("tr.active").forEach(e => e.classList.remove("active"));
     if (r._el) r._el.classList.add("active");
     if (window.Bus3D && Bus3D.setSign) {
       Bus3D.setSign(current, DEST(r), BUS(r), r.displayTime || r.time);
       Bus3D.focus(current);
     }
   }
   
   /* =========================================================
      6. CONTROLS, ROUTING & 3D TERMINAL MULTI-SIGN LOGIC
      ========================================================= */
   
   function updateAllBusSigns() {
     if (!window.Bus3D || !Bus3D.setSign) return;
   
     const now = nowMin();
   
     IDS.forEach(routeKey => {
       const routeData = ROUTES[routeKey];
       if (!routeData || !routeData.rows || routeData.rows.length === 0) return;
   
       const upcomingBus = routeData.rows.find(r => r.min >= now) || routeData.rows[0];
   
       if (upcomingBus) {
         Bus3D.setSign(
           routeKey,
           DEST(upcomingBus),
           BUS(upcomingBus),
           upcomingBus.displayTime || upcomingBus.time
         );
       }
     });
   }
   
   function selectRoute(k) {
     current = k;
     fromEl.value = "";
     toEl.value = "";
     searchEl.value = "";
     nextRow = null;
     lastNext = null;
     msgEl.textContent = "";
   
     const rows = ROUTES[k].rows;
     const now = nowMin();
     let upcoming = rows.find(r => r.min >= now) || rows[0];
     activeRow = upcoming;
     signRows[k] = upcoming;
   
     render();
     updateAllBusSigns();
   
     if (window.Bus3D && Bus3D.focus) {
       Bus3D.focus(k);
     }
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
   
   function updateLanguageUI() {
     if (fromEl) fromEl.placeholder = lang === "ta" ? "புறப்படும் இடம் (எ.கா: செய்யாறு)" : "e.g. Cheyyar / செய்யாறு";
     if (toEl) toEl.placeholder = lang === "ta" ? "சேரும் இடம் (எ.கா: காஞ்சிபுரம் / ஆரணி)" : "e.g. Kanchipuram / சென்னை / Arani";
     if (searchEl) searchEl.placeholder = lang === "ta" ? "பஸ் எண் / நேரம் (எ.கா: 130, T59)" : "Filter by No (e.g. 130, 438, T59)";
   
     const nextBtn = $("next-btn");
     if (nextBtn) {
       nextBtn.innerHTML = lang === "ta" ? `⚡ அடுத்த பஸ்` : `⚡ Find Next Bus`;
     }
   
     const heroTitle = document.querySelector(".hero-title");
     if (heroTitle) {
       heroTitle.textContent = lang === "ta" ? "செய்யாறு பேருந்து கால அட்டவணை" : "Plan Your Journey From Cheyyar";
     }
   }
   
   function applyLanguage(newLang) {
     lang = newLang;
     document.documentElement.lang = lang;
     localStorage.setItem("cheyyar_bus_lang", lang);
   
     if (langLabel) {
       langLabel.textContent = lang === "en" ? "தமிழ்" : "English";
     }
   
     updateLanguageUI();
     populateLocationDatalists();
     buildTabs();
     render();
     updateAllBusSigns();
   }
   
   if (langBtn) {
     langBtn.addEventListener("click", e => {
       e.preventDefault();
       const nextLang = lang === "en" ? "ta" : "en";
       applyLanguage(nextLang);
     });
   }
   
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
   
   if (upcomingToggle) upcomingToggle.addEventListener("change", render);
   
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
       fromEl.value = "Cheyyar";
       searchEl.value = "";
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
   
   /* =========================================================
      7. FIND NEXT BUS CLICK ACTION
      ========================================================= */
   $("next-btn").addEventListener("click", () => {
     fromEl.value = "";
     toEl.value = "";
     searchEl.value = "";
   
     const rows = ROUTES[current].rows;
     const now = nowMin();
   
     let r = rows.find(x => x.min >= now);
     let isTomorrow = false;
   
     if (!r) {
       r = rows[0];
       isTomorrow = true;
     }
   
     nextRow = r;
     lastNext = { r, isTomorrow };
   
     render();
     setActive(r);
   
     if (window.Bus3D) {
       if (Bus3D.setSign) {
         Bus3D.setSign(current, DEST(r), BUS(r), r.displayTime || r.time);
       }
       if (Bus3D.focus) {
         Bus3D.focus(current);
       }
     }
   
     if (msgEl) {
       const diff = r.min - now;
       const timeText = isTomorrow 
         ? `Tomorrow at ${r.displayTime || r.time}` 
         : `${r.displayTime || r.time} (${diff > 0 ? 'in ' + diff + ' mins' : 'now'})`;
   
       msgEl.innerHTML = `
         <div style="background: rgba(255, 122, 69, 0.15); border: 1px solid #ff7a45; padding: 10px 14px; border-radius: 8px; margin: 12px 0; color: #ff7a45; font-weight: 600;">
           ⚡ Next Bus: <strong>${BUS(r)}</strong> to <strong>${DEST(r)}</strong> • Departure: <strong>${timeText}</strong>
         </div>
       `;
     }
   
     setTimeout(() => {
       if (r._el) {
         r._el.scrollIntoView({ block: "center", behavior: "smooth" });
         r._el.classList.add("active-highlight");
         setTimeout(() => r._el.classList.remove("active-highlight"), 2500);
       }
     }, 100);
   });
   
   $("theme-btn").addEventListener("click", () => {
     const root = document.documentElement;
     root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
   });
   
   const devModal = $("dev-modal");
   const openDevBtn = $("open-dev-modal");
   const closeDevBtn = $("close-dev-modal");
   const closeDevBtnAction = $("close-dev-modal-btn");
   
   if (openDevBtn && devModal) openDevBtn.addEventListener("click", () => { devModal.style.display = "flex"; });
   if (closeDevBtn && devModal) closeDevBtn.addEventListener("click", () => { devModal.style.display = "none"; });
   if (closeDevBtnAction && devModal) closeDevBtnAction.addEventListener("click", () => { devModal.style.display = "none"; });
   if (devModal) devModal.addEventListener("click", e => { if (e.target === devModal) devModal.style.display = "none"; });
   
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
   
   /* =========================================================
      8. REAL-TIME AUTO UPDATE & INITIALIZATION
      ========================================================= */
   
   setInterval(() => {
     const now = nowMin();
     if (activeRow && activeRow.min < now) {
       const rows = ROUTES[current].rows;
       const nextBus = rows.find(r => r.min >= now) || rows[0];
       if (nextBus) {
         activeRow = nextBus;
       }
     }
     updateAllBusSigns();
     render();
   }, 60000);
   
   initLoadingScreen();
   const ok = window.Bus3D ? Bus3D.init(stageEl, DATA.routes, selectRoute) : false;
   if (ok) {
     stageEl.classList.add("ready");
     const loader = stageEl.querySelector(".stage-loading");
     if (loader) loader.style.display = "none";
   }
   
   const storedLang = localStorage.getItem("cheyyar_bus_lang") || "en";
   applyLanguage(storedLang);
   selectRoute(current);