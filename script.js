/* =========================================================
   CHEYYAR HUB - BUS TIMINGS ENGINE (FULL PRODUCTION READY)
   - Dynamic Custom Autocomplete Dropdown (A-Z Filtered)
   - Universal Intermediate Stop Filtering & Direct Live Badges
   - Real-time Last Bus Alert Integration
   - 3-Clip Natural Voice AI Assistant (.ogg Engine)
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
         stageEl = $("stage"),
         upcomingToggle = $("upcoming-toggle"),
         langBtn = $("lang-btn"),
         langLabel = $("lang-label");
   
   let lang = "en";
   let activeRow = null, nextRow = null, lastNext = null;
   const signRows = {};
   
   document.documentElement.dataset.theme = "dark";
   
   /* =========================================================
      1. ROUTE SEQUENCES & OFFSETS (MINUTES)
      ========================================================= */
   
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
   
   const ROUTE_KANCHI_DIRECT = [
     "cheyyar", "puliyarambakkam", "valarpuram", "kiliyathur", "palu",
     "palli", "ermalnangal", "santhimedu", "mamandur", "dusi", "sevlimedu", "kanchipuram"
   ];
   
   const OFFSETS_KANCHI_DIRECT = {
     "cheyyar": 0, "puliyarambakkam": 8, "valarpuram": 14, "kiliyathur": 18,
     "palu": 22, "palli": 25, "ermalnangal": 29, "santhimedu": 32,
     "mamandur": 35, "dusi": 40, "sevlimedu": 47, "kanchipuram": 52
   };
   
   const ROUTE_KANCHI_VEMBAKKAM = [
     "cheyyar", "arani koot road", "duli", "pappanthangal", "sirugattur",
     "ramakrishnapuram", "hasanamapet", "perungattur", "alanthagal",
     "vembakkam", "pillanthangal", "kolivakkam", "iyyankkulam",
     "abdullapuram", "sevlimedu", "kanchipuram"
   ];
   
   const OFFSETS_KANCHI_VEMBAKKAM = {
     "cheyyar": 0, "arani koot road": 5, "duli": 9, "pappanthangal": 13,
     "sirugattur": 17, "ramakrishnapuram": 20, "hasanamapet": 24,
     "perungattur": 27, "alanthagal": 31, "vembakkam": 34,
     "pillanthangal": 38, "kolivakkam": 41, "iyyankkulam": 45,
     "abdullapuram": 48, "sevlimedu": 53, "kanchipuram": 57
   };
   
   const ROUTE_VANDAVASI_DIRECT = [
     "cheyyar", "anakavur", "erumaivetti", "kulamanthai", "eachur", "vandavasi"
   ];
   
   const OFFSETS_VANDAVASI = {
     "cheyyar": 0, "anakavur": 8, "erumaivetti": 15, "kulamanthai": 22, "eachur": 28, "vandavasi": 38
   };
   
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
   
   const ROUTE_KORUKKAI = ["cheyyar", "vellai", "kilathur", "eraiyur", "korukkai"];
   const OFFSETS_KORUKKAI = { "cheyyar": 0, "vellai": 7, "kilathur": 13, "eraiyur": 19, "korukkai": 25 };
   
   const ROUTE_THAVASI = ["cheyyar", "kilmattai", "thavasi"];
   const OFFSETS_THAVASI = { "cheyyar": 0, "kilmattai": 10, "thavasi": 20 };
   
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
   
   const ROUTE_PARASUR = ["cheyyar", "vellai", "mottur", "kilathur", "parasur"];
   const OFFSETS_PARASUR = { "cheyyar": 0, "vellai": 7, "mottur": 11, "kilathur": 15, "parasur": 22 };
   
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
     const allText = [
       r.routeKey || "",
       r.to || "",
       r.toTa || "",
       r.bus || "",
       r.busTa || "",
       r.via || "",
       r.viaTa || ""
     ].join(" ").toLowerCase();
   
     return allText.includes("vembakkam") || 
            allText.includes("வெம்பாக்கம்") || 
            allText.includes("perungattur") || 
            allText.includes("பெருங்கட்டூர்") ||
            allText.includes("hasanamapet") ||
            allText.includes("அசனமாபேட்டை") ||
            allText.includes("balasubramaniyar") ||
            allText.includes("பாலசுப்பிரமணியர்");
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
   
   function getOffsetTable(r) {
     const stops = getRouteStops(r);
     if (stops === ROUTE_VELLORE_SIVAJI) return OFFSETS_SIVAJI;
     if (stops === ROUTE_KANCHI_VEMBAKKAM) return OFFSETS_KANCHI_VEMBAKKAM;
     if (stops === ROUTE_KANCHI_DIRECT) return OFFSETS_KANCHI_DIRECT;
     if (stops === ROUTE_VANDAVASI_DIRECT) return OFFSETS_VANDAVASI;
     if (stops === ROUTE_ARANI_SV_NAGARAM) return OFFSETS_ARANI_SV_NAGARAM;
     if (stops === ROUTE_KORUKKAI) return OFFSETS_KORUKKAI;
     if (stops === ROUTE_THAVASI) return OFFSETS_THAVASI;
     if (stops === ROUTE_KALAVAI) return OFFSETS_KALAVAI;
     if (stops === ROUTE_PARASUR) return OFFSETS_PARASUR;
     if (stops === ROUTE_GINGEE) return OFFSETS_GINGEE;
     if (stops === ROUTE_PUDUCHERRY) return OFFSETS_PUDUCHERRY;
     return OFFSETS_ARCOT;
   }
   
   function getCalculatedTime(r, searchFrom) {
     if (!searchFrom) return { timeStr: r.time, min: r.min, isOffset: false, offsetMins: 0 };
     const q = searchFrom.toLowerCase().replace(/[\.\s-]/g, "").trim();
     const offsetTable = getOffsetTable(r);
   
     const matchedKey = Object.keys(offsetTable).find(k => {
       const cleanK = k.toLowerCase().replace(/[\.\s-]/g, "");
       return cleanK === q || cleanK.includes(q) || q.includes(cleanK);
     });
   
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
   
   /* =========================================================
      3. UNIVERSAL RETURN ROUTE ENGINE
      ========================================================= */
   
   const RETURN_PATTERNS = [
     { match: ["kanchi", "kanchipuram"], id: "kanchi_to_cheyyar", name: "Kanchi ➔ Cheyyar", tamil: "காஞ்சி ➔ செய்யாறு", travelMins: 55, haltMins: 20, from: "Kanchipuram", fromTa: "காஞ்சிபுரம்" },
     { match: ["arani"], id: "arani_to_cheyyar", name: "Arani ➔ Cheyyar", tamil: "ஆரணி ➔ செய்யாறு", travelMins: 50, haltMins: 15, from: "Arani", fromTa: "ஆரணி" },
     { match: ["vandavasi"], id: "vandavasi_to_cheyyar", name: "Vandavasi ➔ Cheyyar", tamil: "வந்தவாசி ➔ செய்யாறு", travelMins: 40, haltMins: 15, from: "Vandavasi", fromTa: "வந்தவாசி" },
     { match: ["arcot", "vellore"], id: "vellore_to_cheyyar", name: "Vellore ➔ Cheyyar", tamil: "வேலூர் ➔ செய்யாறு", travelMins: 95, haltMins: 25, from: "Vellore", fromTa: "வேலூர்" }
   ];
   
   RETURN_PATTERNS.forEach(cfg => {
     const existingKey = Object.keys(ROUTES).find(k => cfg.match.some(m => k.toLowerCase().includes(m)));
     if (existingKey && ROUTES[existingKey] && ROUTES[existingKey].rows) {
       const cycleOffset = cfg.travelMins + cfg.haltMins;
       const returnRows = ROUTES[existingKey].rows.map(r => {
         const returnMin = (r.min + cycleOffset) % 1440;
         const isViaChennai = (r.to || "").toLowerCase().includes("chennai") || (r.toTa || "").includes("சென்னை");
         const destName = isViaChennai ? "Cheyyar (from Chennai)" : "Cheyyar";
         const destNameTa = isViaChennai ? "செய்யாறு (சென்னை வழி)" : "செய்யாறு";
   
         return Object.assign({}, r, {
           min: returnMin,
           time: minToTimeStr(returnMin),
           from: cfg.from,
           fromTa: cfg.fromTa,
           to: destName,
           toTa: destNameTa,
           isReturnEstimated: true,
           routeKey: cfg.id
         });
       }).sort((a, b) => a.min - b.min);
   
       ROUTES[cfg.id] = {
         id: cfg.id,
         name: cfg.name,
         tamil: cfg.tamil,
         rows: returnRows
       };
     }
   });
   
   const IDS = Object.keys(ROUTES);
   let current = IDS[0];
   
   $("st-n").textContent = IDS.reduce((n, k) => n + ROUTES[k].rows.length, 0);
   $("st-r").textContent = IDS.length;
   
   /* =========================================================
      4. SMART AUTOCOMPLETE DROPDOWN (FAIL-SAFE & A-Z ONLY)
      ========================================================= */
   
   function populateLocationDatalists() {
     const allStops = new Set([
       "Cheyyar", "Kanchipuram", "Arani", "Vandavasi", "Vellore", "Arcot",
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
     ]);
   
     IDS.forEach(k => {
       ROUTES[k].rows.forEach(r => {
         if (r.from) allStops.add(r.from.trim());
         if (r.to) allStops.add(r.to.split("via")[0].split("→")[0].trim());
       });
     });
   
     const englishStops = Array.from(allStops)
       .filter(name => typeof name === "string" && !/[\u0B80-\u0BFF]/.test(name) && name.trim().length > 1)
       .map(name => name.trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" "));
   
     const sortedStops = Array.from(new Set(englishStops)).sort((a, b) => a.localeCompare(b));
   
     function attachSmartDropdown(inputEl, dropdownId) {
       if (!inputEl) return;
       const parent = inputEl.parentElement;
       parent.classList.add("autocomplete-box-wrapper");
   
       let dropdownEl = document.getElementById(dropdownId);
       if (!dropdownEl) {
         dropdownEl = document.createElement("div");
         dropdownEl.id = dropdownId;
         dropdownEl.className = "custom-autocomplete-dropdown";
         parent.appendChild(dropdownEl);
       }
   
       inputEl.addEventListener("input", () => {
         const val = inputEl.value.trim().toLowerCase();
         if (!val) {
           dropdownEl.style.display = "none";
           dropdownEl.innerHTML = "";
           return;
         }
   
         const matches = sortedStops.filter(s => s.toLowerCase().startsWith(val));
   
         if (matches.length > 0) {
           dropdownEl.innerHTML = matches.map(city => `
             <div class="autocomplete-item" data-val="${city}">
               <span>📍</span> ${city}
             </div>
           `).join("");
           dropdownEl.style.display = "block";
         } else {
           dropdownEl.style.display = "none";
         }
       });
   
       dropdownEl.addEventListener("mousedown", e => {
         const item = e.target.closest(".autocomplete-item");
         if (item) {
           inputEl.value = item.dataset.val;
           dropdownEl.style.display = "none";
           render();
         }
       });
   
       document.addEventListener("click", e => {
         if (!inputEl.contains(e.target) && !dropdownEl.contains(e.target)) {
           dropdownEl.style.display = "none";
         }
       });
     }
   
     attachSmartDropdown(fromEl, "from-dropdown");
     attachSmartDropdown(toEl, "to-dropdown");
   }
   
   /* =========================================================
      5. TRANSLATION & HELPERS
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
     if (diff < -10) return `<span class="countdown-badge departed">Departed</span>`;
     if (diff <= 5) return `<span class="countdown-badge urgent">🔥 in ${Math.max(0, diff)}m</span>`;
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
      6. VIRTUAL LIVE TRACKING POPUP MODAL (ACCURATE TIMELINE)
      ========================================================= */
   
   function generateLiveTimeline(r) {
     const currentMinutes = nowMin();
     let stops = [...getRouteStops(r)];
     const offsetTable = getOffsetTable(r);
   
     const totalTripTime = Math.max(...Object.values(offsetTable)) || 60;
     const isReturn = Boolean(r.isReturnEstimated);
     if (isReturn) stops = stops.reverse();
   
     const busBaseMin = r.min;
     const busEndMin = busBaseMin + totalTripTime;
   
     let currentStopName = ORIGIN(r);
     let statusMsg = "";
     let foundCurrent = false;
     let stopsHtml = "";
   
     stops.forEach((stopKey) => {
       const k = stopKey.toLowerCase().trim();
       let off = offsetTable[k] || 0;
       if (isReturn) off = totalTripTime - off;
   
       const stopArrivalMin = (busBaseMin + off) % 1440;
       const timeStr = minToTimeStr(stopArrivalMin);
   
       let stopClass = "upcoming";
       const cleanStopName = stopKey.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
   
       const currentDiff = (currentMinutes - (busBaseMin + off));
   
       if (currentDiff >= 0 && currentMinutes < busEndMin) {
         stopClass = "passed";
         currentStopName = cleanStopName;
       } else if (!foundCurrent && currentMinutes < (busBaseMin + off)) {
         stopClass = "current";
         foundCurrent = true;
         currentStopName = cleanStopName;
       }
   
       stopsHtml += `
         <div class="timeline-stop-item ${stopClass}">
           <span class="stop-dot"></span>
           <span class="stop-name">${cleanStopName} ${stopClass === 'current' ? '← (Approaching)' : ''}</span>
           <span class="stop-time">${timeStr}</span>
         </div>
       `;
     });
   
     if (currentMinutes < busBaseMin) {
       statusMsg = `Scheduled: Departs from ${ORIGIN(r)} in ${busBaseMin - currentMinutes} mins`;
     } else if (currentMinutes >= busEndMin) {
       statusMsg = `Trip Completed (Reached ${FINAL_TO(r)})`;
       currentStopName = FINAL_TO(r);
     } else {
       statusMsg = `🟢 Live on Route (Near ${currentStopName})`;
     }
   
     const html = `
       <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; font-weight:700; color:#a9aeba; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.06);">
         <span>${statusMsg}</span>
         <strong style="color:#ff8a52;">Trip Duration: ${totalTripTime} mins</strong>
       </div>
       <div class="timeline-stops-list">
         ${stopsHtml}
       </div>
     `;
   
     return { html, currentStopName, isCompleted: currentMinutes >= busEndMin, isUpcoming: currentMinutes < busBaseMin };
   }
   
   const trackerModal = $("tracker-modal");
   const closeTrackerBtn = $("close-tracker-modal");
   
   function openTrackerModal(r) {
     if (!trackerModal) return;
     const nameEl = $("t-popup-bus-name");
     const summaryEl = $("t-popup-route-summary");
     const contentEl = $("tracker-popup-content");
   
     const timelineData = generateLiveTimeline(r);
   
     if (nameEl) nameEl.textContent = BUS(r);
     
     if (summaryEl) {
       if (timelineData.isUpcoming) {
         summaryEl.innerHTML = `Starting from <strong>${ORIGIN(r)}</strong> ➔ ${FINAL_TO(r)} (${r.time})`;
       } else if (timelineData.isCompleted) {
         summaryEl.innerHTML = `Reached <strong>${FINAL_TO(r)}</strong> • Service Completed`;
       } else {
         summaryEl.innerHTML = `📍 Currently near <strong>${timelineData.currentStopName}</strong> ➔ ${FINAL_TO(r)}`;
       }
     }
   
     if (contentEl) contentEl.innerHTML = timelineData.html;
     trackerModal.style.display = "flex";
   }
   
   function closeTrackerModal() {
     if (trackerModal) trackerModal.style.display = "none";
   }
   
   if (closeTrackerBtn) closeTrackerBtn.onclick = closeTrackerModal;
   if (trackerModal) {
     trackerModal.onclick = e => {
       if (e.target === trackerModal) closeTrackerModal();
     };
   }
   
   /* =========================================================
      7. DIRECT LIVE MOVING STATUS BADGE GENERATOR
      ========================================================= */
   
   function getDirectLiveStatusBadge(r) {
     const currentMinutes = nowMin();
     let stops = [...getRouteStops(r)];
     const offsetTable = getOffsetTable(r);
   
     const totalTripTime = Math.max(...Object.values(offsetTable)) || 60;
     const isReturn = Boolean(r.isReturnEstimated);
     if (isReturn) stops = stops.reverse();
   
     const busStartMin = r.min;
     const busEndMin = busStartMin + totalTripTime;
   
     if (currentMinutes < busStartMin) {
       return `<span class="live-moving-badge departing-soon">⏳ At ${ORIGIN(r)}</span>`;
     }
     if (currentMinutes >= busEndMin) {
       return `<span class="live-moving-badge approaching-dest">🏁 Reached ${FINAL_TO(r)}</span>`;
     }
   
     let currentStop = ORIGIN(r);
     for (let i = 0; i < stops.length; i++) {
       const k = stops[i].toLowerCase().trim();
       let off = offsetTable[k] || 0;
       if (isReturn) off = totalTripTime - off;
   
       const stopArrivalMin = busStartMin + off;
       if (currentMinutes >= stopArrivalMin) {
         currentStop = stops[i].split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
       } else {
         break;
       }
     }
   
     return `
       <span class="live-moving-badge on-route">
         <span class="pulse-dot-small"></span>
         Near ${currentStop}
       </span>
     `;
   }
   
   /* =========================================================
      8. FILTER & RENDER ENGINE (DYNAMIC INTERMEDIATE FIX)
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
       const isSearchingFromCheyyar = qFrom && (qFrom.includes("cheyyar") || qFrom.includes("செய்யாறு"));
       const isSearchingToCheyyar = qTo && (qTo.includes("cheyyar") || qTo.includes("செய்யாறு"));
   
       if (isSearchingFromCheyyar && !isSearchingToCheyyar && r.isReturnEstimated) return false;
       if (isSearchingToCheyyar && !isSearchingFromCheyyar && !r.isReturnEstimated && r.from.toLowerCase().includes("cheyyar")) return false;
   
       const stopsList = getRouteStops(r);
       let stopsMapped = stopsList.map(s => s.toLowerCase());
       if (r.isReturnEstimated) stopsMapped = [...stopsMapped].reverse();
   
       const matchStop = (stopName, query) => {
         stopName = stopName.toLowerCase().trim();
         query = query.toLowerCase().trim();
         if ((query === "arani" || query === "ஆரணி") && stopName.includes("koot road")) return false;
         if ((query === "kalavai" || query === "கலவை") && stopName.includes("koot road")) return false;
         return stopName === query || stopName.includes(query);
       };
   
       let fromIdx = -1;
       if (qFrom) {
         fromIdx = stopsMapped.findIndex(s => matchStop(s, qFrom));
         const exactFromMatch = r.from.toLowerCase().includes(qFrom) || r.fromTa.toLowerCase().includes(qFrom);
         if (!exactFromMatch && fromIdx === -1) return false;
       }
   
       let toIdx = -1;
       if (qTo) {
         toIdx = stopsMapped.findIndex(s => matchStop(s, qTo));
         const exactToMatch = r.to.toLowerCase().includes(qTo) || r.toTa.toLowerCase().includes(qTo);
         if (!exactToMatch && toIdx === -1) return false;
       }
   
       if (qFrom && qTo && fromIdx !== -1 && toIdx !== -1) {
         if (fromIdx >= toIdx) return false;
       }
   
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
       const upcomingList = list.filter(r => {
         const offsetTable = getOffsetTable(r);
         const totalTripMins = Math.max(...Object.values(offsetTable)) || 60;
         const busEndMin = r.min + totalTripMins;
         return currentMinutes <= (busEndMin + 1);
       });
       list = upcomingList;
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
       td.textContent = (window.I18N && I18N[lang]) ? I18N[lang].empty : "No buses found matching criteria.";
       tr.appendChild(td);
       rowsEl.appendChild(tr);
       countEl.textContent = "0 buses";
       updateLastBusBanner();
       return;
     }
   
     const fragment = document.createDocumentFragment();
   
     list.forEach(r => {
       const tr = document.createElement("tr");
       tr.tabIndex = 0;
   
       const originalDeparture = r.time || minToTimeStr(r.min);
   
       const tdTime = document.createElement("td");
       tdTime.className = "td-time";
       tdTime.innerHTML = `
         <div class="mobile-time-group">
           <span>${r.displayTime}</span>
           <div class="badge-row-mobile">
             ${getCountdownBadge(r.displayMin)}
             ${getDirectLiveStatusBadge(r)}
           </div>
           ${(qFrom && r.isOffset) ? `
             <span class="mobile-departure-note">
               📍 At ${qFrom.toUpperCase()} • Departs Origin: ${originalDeparture}
             </span>
           ` : ''}
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
       } else if (isVembakkamRoute(r)) {
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
   
       const approxTag = r.isReturnEstimated 
         ? `<span class="approx-badge">~ Approx Return</span>` 
         : '';
   
       tdBus.innerHTML = `
         <div class="bus-name-row">
           <span>${BUS(r)}</span>
           ${routeBadge}
           ${approxTag}
         </div>
       `;
   
       if (r.verify) {
         const c = document.createElement("small");
         c.className = "chk";
         c.textContent = "⚠ " + (window.I18N && I18N[lang] ? I18N[lang].chk : "Verify board");
         tdBus.appendChild(c);
       }
   
       const liveTrackBtn = document.createElement("button");
       liveTrackBtn.type = "button";
       liveTrackBtn.className = "live-tracker-btn";
       liveTrackBtn.innerHTML = `<span class="pulse-radar"></span> Track Route`;
       
       liveTrackBtn.addEventListener("click", e => {
         e.stopPropagation();
         openTrackerModal(r);
       });
   
       tdBus.appendChild(liveTrackBtn);
   
       const tdFrom = document.createElement("td");
       tdFrom.className = "td-from";
       
       // Intermediate origin check (e.g. Vembakkam)
       if (qFrom && r.isOffset) {
         const cleanFromQuery = qFrom.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
         tdFrom.innerHTML = `<strong>${cleanFromQuery}</strong> <small style="display:block; font-size:10px; color:#838a9c;">(Orig: ${ORIGIN(r)})</small>`;
       } else {
         tdFrom.textContent = ORIGIN(r);
       }
   
       const tdDest = document.createElement("td");
       tdDest.className = "td-dest";
       
       if (qTo) {
         const cleanToQuery = qTo.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
         tdDest.innerHTML = `<strong>${cleanToQuery}</strong>`;
       } else {
         tdDest.textContent = FINAL_TO(r);
       }
   
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
     const countMsg = (window.I18N && I18N[lang] && I18N[lang].count) ? I18N[lang].count(list.length) : " buses";
     countEl.textContent = list.length + countMsg;
   
     if (!activeRow && list.length > 0) {
       activeRow = list[0];
       setActive(list[0]);
     } else if (activeRow && window.Bus3D && Bus3D.setSign) {
       Bus3D.setSign(current, DEST(activeRow), BUS(activeRow), activeRow.displayTime || activeRow.time);
     }
   
     updateLastBusBanner();
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
      9. CONTROLS, ROUTING & 3D TERMINAL MULTI-SIGN LOGIC
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
   
     const d1 = $("from-dropdown");
     const d2 = $("to-dropdown");
     if (d1) d1.style.display = "none";
     if (d2) d2.style.display = "none";
   
     const rows = ROUTES[k].rows;
     const now = nowMin();
     let upcoming = rows.find(r => r.min >= now) || rows[0];
     activeRow = upcoming;
     signRows[k] = upcoming;
   
     render();
     updateAllBusSigns();
     updateLastBusBanner();
   
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
     if (fromEl) fromEl.placeholder = lang === "ta" ? "புறப்படும் இடம் (எ.கா: Cheyyar)" : "e.g. Cheyyar";
     if (toEl) toEl.placeholder = lang === "ta" ? "சேரும் இடம் (எ.கா: Kanchipuram)" : "e.g. Kanchipuram";
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
   
   /* =========================================================
      10. LAST BUS ALERT ENGINE (EVENING 7:00 PM TO MIDNIGHT)
      ========================================================= */
   
   function updateLastBusBanner() {
     const alertEl = $("last-bus-alert");
     const detailsEl = $("last-bus-details");
     if (!alertEl || !detailsEl) return;
   
     const currentMinutes = nowMin();
     const isNightTime = currentMinutes >= (19 * 60) && currentMinutes <= 1439;
   
     if (!isNightTime) {
       alertEl.style.display = "none";
       return;
     }
   
     const activeRows = (ROUTES[current] && ROUTES[current].rows) ? ROUTES[current].rows : [];
     if (!activeRows.length) {
       alertEl.style.display = "none";
       return;
     }
   
     const lastBus = [...activeRows].sort((a, b) => b.min - a.min)[0];
     const diff = lastBus.min - currentMinutes;
   
     if (diff < -10) {
       detailsEl.innerHTML = `Tonight's last service (${BUS(lastBus)} to ${DEST(lastBus)}) has <strong>already departed</strong>.`;
       alertEl.classList.remove("urgent");
       alertEl.style.display = "flex";
     } else if (diff <= 45) {
       alertEl.classList.add("urgent");
       detailsEl.innerHTML = `Final bus to <strong>${DEST(lastBus)}</strong> (${BUS(lastBus)}) leaves at <strong>${lastBus.time}</strong> (🚨 in ${Math.max(0, diff)} mins)!`;
       alertEl.style.display = "flex";
     } else {
       alertEl.classList.remove("urgent");
       detailsEl.innerHTML = `Tonight's final service to <strong>${DEST(lastBus)}</strong> is at <strong>${lastBus.time}</strong> (${BUS(lastBus)}).`;
       alertEl.style.display = "flex";
     }
   }
   
   const closeAlertBtn = $("close-last-bus");
   if (closeAlertBtn) {
     closeAlertBtn.addEventListener("click", () => {
       const alertEl = $("last-bus-alert");
       if (alertEl) alertEl.style.display = "none";
     });
   }
   
   function debounce(fn, delay = 200) {
     let timer;
     return function (...args) {
       clearTimeout(timer);
       timer = setTimeout(() => fn.apply(this, args), delay);
     };
   }
   const debouncedRender = debounce(render, 200);
   
   fromEl.addEventListener("input", debouncedRender);
   toEl.addEventListener("input", debouncedRender);
   searchEl.addEventListener("input", debouncedRender);
   
   if (upcomingToggle) upcomingToggle.addEventListener("change", render);
   
   $("clear-from-btn").addEventListener("click", () => { 
     fromEl.value = ""; 
     const d = $("from-dropdown");
     if (d) d.style.display = "none";
     render(); 
   });
   
   $("clear-to-btn").addEventListener("click", () => { 
     toEl.value = ""; 
     const d = $("to-dropdown");
     if (d) d.style.display = "none";
     render(); 
   });
   
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
   
       const d1 = $("from-dropdown");
       const d2 = $("to-dropdown");
       if (d1) d1.style.display = "none";
       if (d2) d2.style.display = "none";
   
       render();
     });
   });
   
   $("clear-all-filters").addEventListener("click", () => {
     fromEl.value = "";
     toEl.value = "";
     searchEl.value = "";
     const d1 = $("from-dropdown");
     const d2 = $("to-dropdown");
     if (d1) d1.style.display = "none";
     if (d2) d2.style.display = "none";
     render();
   });
   
   /* =========================================================
      11. FIND NEXT BUS ACTION
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
   
/* =========================================================
   12. 3-CLIP SYNCHRONIZED AUDIO & TEXT VOICE ENGINE
   - Audio 1 (1.ogg) + Text 1 (Greeting)
   - Audio 2 (2.ogg) + Text 2 (Success)
   - Audio 3 (3.ogg) + Text 3 (Fallback)
   * Strict Rule: Audio mudiyura varai adhan text maraiaadhu!
   ========================================================= */

   const avatarWidget = $("ai-avatar-widget");
   const avatarBubble = $("voice-bubble");
   const avatarText = $("voice-bubble-text");
   
   let recognition = null;
   let currentAudio = null;
   let hasAutoTriggered = false;
   let silenceTimer = null;
   let isPlayingAudio = false;
   
   // Ungaloda Exact Audio Clips
   const AUDIO_CLIPS = {
     greeting: new Audio("audio/1.ogg"),
     success: new Audio("audio/2.ogg"),
     fallback: new Audio("audio/3.ogg")
   };
   
   // Strict Playback Controller with Text Binding
   function playAudioWithText(clipKey, textMessage, onFinished) {
     // Pazhaiya audio irundha stop pannuvom
     if (currentAudio) {
       currentAudio.pause();
       currentAudio.currentTime = 0;
     }
   
     // Bubble-ai open panni correct text-ai set pannuvom
     if (avatarBubble) avatarBubble.style.display = "block";
     if (avatarText) avatarText.textContent = textMessage;
   
     const audio = AUDIO_CLIPS[clipKey];
     if (!audio) {
       isPlayingAudio = false;
       if (onFinished) onFinished();
       return;
     }
   
     isPlayingAudio = true;
     currentAudio = audio;
     audio.currentTime = 0;
   
     if (avatarWidget) avatarWidget.classList.add("speaking");
   
     audio.play()
       .then(() => {
         audio.onended = () => {
           isPlayingAudio = false;
           currentAudio = null;
           if (avatarWidget) avatarWidget.classList.remove("speaking");
           // Audio complete aana piragu dhaan next callback trigger aagum
           if (onFinished) onFinished();
         };
       })
       .catch(() => {
         isPlayingAudio = false;
         currentAudio = null;
         if (avatarWidget) avatarWidget.classList.remove("speaking");
         if (onFinished) onFinished();
       });
   }
   
   function stopListening() {
     if (silenceTimer) {
       clearTimeout(silenceTimer);
       silenceTimer = null;
     }
     if (recognition) {
       try { recognition.abort(); } catch(e) {}
     }
     if (avatarWidget) avatarWidget.classList.remove("listening");
   }
   
   function handleFallback() {
     stopListening();
   
     // AUDIO 3 + TEXT 3: Fallback Audio mudiyum varai Text 3 mattume screen-la irukkum
     playAudioWithText(
       "fallback",
       "ஊரு நேம் சரியா சொல்லுங்க, எனக்கு கேக்கல!",
       () => {
         // Audio 3 mudindhavudan 2.5s kazhithu bubble close aagum
         setTimeout(() => {
           if (!isPlayingAudio && avatarBubble) {
             avatarBubble.style.display = "none";
           }
         }, 2500);
       }
     );
   }
   
   function startVoiceAssistant() {
     if (isPlayingAudio) return; // Oru audio play aagi irundhaa pudhusa start aagadhu
   
     // 1. AUDIO 1 + TEXT 1: Greeting mudiyum varaikkum Text 1 mattum dhaan screen-la irukkum
     playAudioWithText(
       "greeting",
       "வணக்கம்! இது உங்க செய்யார் பஸ் ஆப். உங்களுக்கு எந்த ஊருக்கு பஸ் பாக்கணும்?",
       () => {
         // AUDIO 1 FULL-AA MUDINDHA PINBU MATTUME MIC OPEN AAGUM
         const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
         if (!SpeechRecognition) {
           if (avatarText) avatarText.textContent = "Browser-la mic support illa.";
           return;
         }
   
         stopListening();
         let hasCapturedSpeech = false;
   
         recognition = new SpeechRecognition();
         recognition.lang = "ta-IN";
         recognition.interimResults = false;
   
         recognition.onstart = () => {
           if (avatarWidget) avatarWidget.classList.add("listening");
           // Audio 1 mudinja piragu dhaan mic text maaranum
           if (avatarText) avatarText.textContent = "கேட்கிறது... பேசுங்கள் (5s)...";
   
           // 5s silence wait timer
           silenceTimer = setTimeout(() => {
             if (!hasCapturedSpeech && !isPlayingAudio) {
               handleFallback();
             }
           }, 5000);
         };
   
         recognition.onresult = (e) => {
           if (isPlayingAudio) return;
   
           hasCapturedSpeech = true;
           if (silenceTimer) clearTimeout(silenceTimer);
   
           const transcript = e.results[0][0].transcript.toLowerCase().trim();
   
           let matchedCity = "";
           if (transcript.includes("kanchi") || transcript.includes("காஞ்சி")) matchedCity = "Kanchipuram";
           else if (transcript.includes("arani") || transcript.includes("ஆரணி")) matchedCity = "Arani";
           else if (transcript.includes("vellore") || transcript.includes("வேலூர்")) matchedCity = "Vellore";
           else if (transcript.includes("vandavasi") || transcript.includes("வந்தவாசி")) matchedCity = "Vandavasi";
           else if (transcript.includes("chennai") || transcript.includes("சென்னை")) matchedCity = "Chennai";
           else if (transcript.includes("vembakkam") || transcript.includes("வெம்பாக்கம்")) matchedCity = "Vembakkam";
           else if (transcript.includes("arcot") || transcript.includes("ஆற்காடு")) matchedCity = "Arcot";
           else if (transcript.includes("gingee") || transcript.includes("செஞ்சி")) matchedCity = "Gingee";
           else if (transcript.includes("puducherry") || transcript.includes("பாண்டி") || transcript.includes("புதுச்சேரி")) matchedCity = "Puducherry";
           else if (transcript.includes("kalavai") || transcript.includes("கலவை")) matchedCity = "Kalavai";
   
           if (matchedCity) {
             stopListening();
             fromEl.value = "Cheyyar";
             toEl.value = matchedCity;
             searchEl.value = "";
             render();
   
             // AUDIO 2 + TEXT 2: Success Audio mudiyum varaikkum Text 2 mattume screen-la irukkum
             playAudioWithText(
               "success",
               `நீங்க கேட்ட ${matchedCity} பஸ் டீடைல்ஸ் இதோ உங்களுக்காக!`,
               () => {
                 // Audio 2 mudindhadhum 3s kazhithu bubble close aagum
                 setTimeout(() => {
                   if (!isPlayingAudio && avatarBubble) {
                     avatarBubble.style.display = "none";
                   }
                 }, 3000);
               }
             );
           } else {
             handleFallback();
           }
         };
   
         recognition.onerror = (e) => {
           if (e.error === "no-speech" && !hasCapturedSpeech) return;
           if (!hasCapturedSpeech && !isPlayingAudio) handleFallback();
         };
   
         recognition.onend = () => {
           if (!hasCapturedSpeech && silenceTimer && !isPlayingAudio) {
             try { recognition.start(); } catch(err) {}
           }
         };
   
         try {
           recognition.start();
         } catch(err) {
           if (avatarWidget) avatarWidget.classList.remove("listening");
         }
       }
     );
   }
   // 3. Ultra-Smooth Drag & Drop Anywhere on Screen
   function makeWidgetDraggable(el) {
     if (!el) return;
     let isDragging = false;
     let startX, startY, initialLeft, initialTop;
     let hasMoved = false;
   
     function onPointerDown(e) {
       // Only drag with primary touch/click
       if (e.button !== undefined && e.button !== 0) return;
       isDragging = true;
       hasMoved = false;
   
       const clientX = e.touches ? e.touches[0].clientX : e.clientX;
       const clientY = e.touches ? e.touches[0].clientY : e.clientY;
   
       const rect = el.getBoundingClientRect();
       startX = clientX;
       startY = clientY;
       initialLeft = rect.left;
       initialTop = rect.top;
   
       // Switch to absolute positioning from current bounding rect
       el.style.bottom = "auto";
       el.style.right = "auto";
       el.style.left = `${initialLeft}px`;
       el.style.top = `${initialTop}px`;
   
       document.addEventListener("mousemove", onPointerMove, { passive: false });
       document.addEventListener("touchmove", onPointerMove, { passive: false });
       document.addEventListener("mouseup", onPointerUp);
       document.addEventListener("touchend", onPointerUp);
     }
   
     function onPointerMove(e) {
       if (!isDragging) return;
       const clientX = e.touches ? e.touches[0].clientX : e.clientX;
       const clientY = e.touches ? e.touches[0].clientY : e.clientY;
   
       const deltaX = clientX - startX;
       const deltaY = clientY - startY;
   
       if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
         hasMoved = true;
       }
   
       const maxX = window.innerWidth - el.offsetWidth - 10;
       const maxY = window.innerHeight - el.offsetHeight - 10;
   
       let newX = Math.min(Math.max(10, initialLeft + deltaX), maxX);
       let newY = Math.min(Math.max(10, initialTop + deltaY), maxY);
   
       el.style.left = `${newX}px`;
       el.style.top = `${newY}px`;
   
       e.preventDefault();
     }
   
     function onPointerUp() {
       isDragging = false;
       document.removeEventListener("mousemove", onPointerMove);
       document.removeEventListener("touchmove", onPointerMove);
       document.removeEventListener("mouseup", onPointerUp);
       document.removeEventListener("touchend", onPointerUp);
   
       // If user simply tapped without dragging, trigger assistant
       if (!hasMoved) {
         startVoiceAssistant();
       }
     }
   
     el.addEventListener("mousedown", onPointerDown);
     el.addEventListener("touchstart", onPointerDown, { passive: true });
   }
   
   makeWidgetDraggable(avatarWidget);
   
   // Initial Auto-Trigger on screen tap after splash screen ends
   document.addEventListener("click", () => {
     if (!hasAutoTriggered && document.body.classList.contains("app-ready")) {
       hasAutoTriggered = true;
       startVoiceAssistant();
     }
   }, { once: true });
   
   /* =========================================================
      13. APP LOADING & INITIALIZATION
      ========================================================= */
   
   function initLoadingScreen() {
     const splashEl = document.getElementById("app-loading-screen");
     const fillEl = document.getElementById("progress-fill");
     const numEl = document.getElementById("progress-num");
     if (!splashEl || !fillEl || !numEl) return;
   
     let progress = 0;
     const interval = setInterval(() => {
       progress += Math.floor(Math.random() * 4) + 2;
       if (progress >= 100) {
         progress = 100;
         clearInterval(interval);
         fillEl.style.width = "100%";
         numEl.textContent = "100%";
         setTimeout(() => {
           splashEl.classList.add("loaded");
           setTimeout(() => {
             splashEl.style.display = "none";
             document.body.classList.add("app-ready"); // Voice widget appear aagum
           }, 500);
         }, 400);
       } else {
         fillEl.style.width = progress + "%";
         numEl.textContent = progress + "%";
       }
     }, 35);
   }
   /* =========================================================
   14. STRICT APK-ONLY IN-APP UPDATE CHECK
   ========================================================= */

/* =========================================================
   IN-APP UPDATE ENGINE (WORKS ON BOTH OLD & NEW APK)
   ========================================================= */

// Old APK, New APK, matrum Mobile Browser-ai sariyaa identify seiyum function
function isInsideAnyApk() {
  const ua = navigator.userAgent || "";

  // 1. New APK check
  const isNewApk = Boolean(window.AndroidApp) || ua.includes("CheyyarBusAPK");

  // 2. Old APK check (Standard Android WebView-il '; wv' alladhu 'Version/4.0' irukkum)
  const isAndroid = /android/i.test(ua);
  const isWebView = ua.includes("; wv") || (isAndroid && ua.includes("Version/"));

  return isNewApk || isWebView;
}

const CURRENT_APP_VERSION = 2; // Pazhaiya APK version code

async function checkForAppUpdate() {
  // Website alladhu PC Chrome browser-il open seidhaal ingeye stop aagividum
  if (!isInsideAnyApk()) {
    return;
  }

  try {
    const res = await fetch("version.json?t=" + Date.now(), { cache: "no-store" });
    if (!res.ok) return;

    const data = await res.json();

    // version.json-il latestVersionCode 2 irundhaal mattum popup varum
    if (Number(data.latestVersionCode) > CURRENT_APP_VERSION) {
      showUpdateModal(data);
    }
  } catch (err) {
    console.error("Update check error:", err);
  }
}

function showUpdateModal(data) {
  // Modal already display aagirundhaa marubadiyum varaadhu
  if (document.getElementById("update-modal-backdrop")) return;

  const modal = document.createElement("div");
  modal.id = "update-modal-backdrop";
  modal.className = "modal-backdrop";
  modal.style.cssText = "display: flex !important; position: fixed !important; inset: 0 !important; background: rgba(0,0,0,0.85) !important; z-index: 99999999 !important; justify-content: center !important; align-items: center !important; padding: 20px !important;";

  modal.innerHTML = `
    <div style="background: #141721; border: 1px solid rgba(255, 92, 53, 0.4); border-radius: 20px; padding: 24px; max-width: 320px; width: 100%; text-align: center; box-shadow: 0 15px 40px rgba(0,0,0,0.8);">
      <div style="font-size: 42px; margin-bottom: 8px;">🚀</div>
      <h3 style="margin: 0; font-size: 20px; color: #ffffff; font-weight: 800;">New Update Available!</h3>
      <p style="font-size: 13px; color: #a9aeba; margin: 10px 0 18px; line-height: 1.5;">
        Version <strong>${data.latestVersionName || "1.1.0"}</strong><br>
        ${data.releaseNotes || "Performance improvements & new features."}
      </p>
      <button type="button" id="btn-update-apk" style="width: 100%; height: 44px; background: linear-gradient(135deg, #ff5c35, #ff7a45); color: #fff; font-weight: 700; border: none; border-radius: 12px; cursor: pointer; font-size: 15px; box-shadow: 0 6px 18px rgba(255, 92, 53, 0.4);">
        Update Now
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("btn-update-apk").addEventListener("click", () => {
    // New APK irundhaal Background Download Bridge execute aagum
    if (window.AndroidApp && typeof window.AndroidApp.downloadAndInstallApk === "function") {
      window.AndroidApp.downloadAndInstallApk(data.apkUrl);
      modal.remove();
    } else {
      // Old APK-il direct download link open aagum
      window.location.href = data.apkUrl;
    }
  });
}

// App start aagi 1.5 seconds-il check seiyum
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(checkForAppUpdate, 1500);
});
/* =========================================================
   REAL-TIME VISIT HIT COUNTER (AUTO INCREMENT ON EVERY VISIT)
   ========================================================= */

/* =========================================================
   FIRESTORE REAL-TIME ATOMIC VISITOR COUNTER
   ========================================================= */

// Unga Firebase Project Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCk-YR0KFQzHlFHs36ly4mV9u-S5aiXVwE",
  authDomain: "cheyyarbus.firebaseapp.com",
  projectId: "cheyyarbus",
  storageBucket: "cheyyarbus.firebasestorage.app",
  messagingSenderId: "593131650414",
  appId: "1:593131650414:web:61319e188fb60edb94157f"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

async function updateFirestoreLiveVisits() {
  const visitEl = document.getElementById("visit-count");
  if (!visitEl) return;

  const statsDocRef = db.collection("app_stats").doc("visitors");

  try {
    // 1. Session check: Orey user refresh pannikitte irundha repeat spam aagama irukka
    const hasVisitedThisSession = sessionStorage.getItem("cb_session_counted");

    if (!hasVisitedThisSession) {
      // Atomic Increment: Multiple devices ore nerathil open panninaalum race-condition illamal +1 aagum
      await statsDocRef.update({
        count: firebase.firestore.FieldValue.increment(1)
      });
      sessionStorage.setItem("cb_session_counted", "true");
    }

    // 2. Real-Time Snapshot Listener: Vera yaaru open panninaalum screen-la number udaney live-aa jump aagum
    statsDocRef.onSnapshot((doc) => {
      if (doc.exists) {
        const liveCount = doc.data().count || 0;
        visitEl.textContent = Number(liveCount).toLocaleString();
      }
    });

  } catch (error) {
    console.error("Firestore counter error:", error);
    // Offline alladhu doc illaatha podhu initial set seiyum fallback
    statsDocRef.set({ count: 1251 }, { merge: true });
  }
}

// App start aana udan run aagum
document.addEventListener("DOMContentLoaded", () => {
  updateFirestoreLiveVisits();
});
   
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