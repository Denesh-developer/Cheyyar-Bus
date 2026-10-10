/* Bus3DScene: TVK Themed Ultra-Premium Luxury Coach Cheyyar Bus Stand 3D Model
   Features:
   - TVK Livery: Deep Crimson Red (#b91c1c) with Vibrant Golden Yellow (#fbbf24) Belt
   - Top LED Board: Displays Bus Operator Name / Number (Balamurugan, Sri Ramajayam, etc.) on TOP in bold
   - Sub-line: Shows Route Destination (Destination) + Scheduled Time
   - Realistic Ground Shadow (Ambient Occlusion)
   - Aerodynamic High-Deck Luxury Coach with front windshield wipers
   - Sleek Elephant-Ear Mirrors (ORVMs) with indicator strips
   - Sculpted Rooftop AC unit with cooling fan discs & rear aerodynamic spoiler
   - Projector LED Headlights + Fog lamps + Chrome Grille with central emblem
   - Deep-dish Alloy wheels with tire rubber tread, 6-spoke rims, center cap & red brake calipers
   - Mobile GPU Acceleration: DPR locked to 1.0 on mobile for buttery smooth 60fps
*/
(function () {
  const FONT = "'Noto Sans Tamil','Space Grotesk','DM Sans',sans-serif";
  const cv = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  function fit(x, t, maxW, size, wt) {
    let s = size;
    do { x.font = wt + " " + s + "px " + FONT; s -= 4; } while (x.measureText(t).width > maxW && s > 18);
  }
  const B = { buses: {} };
  let need = () => {}, stationCv = null, stationTex = null;

  /* Sets the front Digital LED destination board:
     Displays BUS NAME on top, and DESTINATION + TIME below */
  B.setSign = (id, dest, bus, time) => {
    const b = B.buses[id]; if (!b) return;
    const x = b.ctx;

    const busTitle = (bus || dest || "CHEYYAR").toUpperCase();
    const destRoute = (dest || "").toUpperCase();

    // Dark Glossy LED Glass Background
    x.fillStyle = "#020305"; x.fillRect(0, 0, 1024, 256);

    // Subtle LED matrix grid background pattern
    x.fillStyle = "rgba(251, 191, 36, 0.06)";
    for (let py = 8; py < 248; py += 12) {
      for (let px = 8; px < 1016; px += 12) {
        x.fillRect(px, py, 4, 4);
      }
    }

    // Glowing TVK Golden-Yellow neon border frame
    x.strokeStyle = "rgba(251, 191, 36, 0.85)"; x.lineWidth = 8;
    x.strokeRect(8, 8, 1008, 240);

    // 1. TOP LINE: BUS OPERATOR NAME / NUMBER (Bold & Glowing Amber Gold)
    x.fillStyle = "#ffb703"; x.textAlign = "center"; x.textBaseline = "middle";
    x.shadowColor = "#f59e0b"; x.shadowBlur = 14;
    fit(x, busTitle, 940, 118, "800");
    x.fillText(busTitle, 512, 92);

    // 2. BOTTOM LINE: ROUTE / DESTINATION + TIME
    x.shadowBlur = 6; x.fillStyle = "#ffffff";
    const subText = (destRoute ? destRoute + "   •   " : "") + (time || "");
    fit(x, subText, 940, 56, "700");
    x.fillText(subText, 512, 194);

    x.shadowBlur = 0;
    b.tex.needsUpdate = true; need();
  };

  B.drawStation = () => {
    if (!stationCv) return;
    const x = stationCv.getContext("2d");
    const g = x.createLinearGradient(0, 0, 1280, 0);
    g.addColorStop(0, "#0a0c12"); g.addColorStop(0.5, "#161a24"); g.addColorStop(1, "#0a0c12");
    x.fillStyle = g; x.fillRect(0, 0, 1280, 160);
    x.strokeStyle = "#fbbf24"; x.lineWidth = 4;
    x.strokeRect(4, 4, 1272, 152);
    x.textAlign = "center"; x.textBaseline = "middle";
    x.fillStyle = "#fbbf24"; x.shadowColor = "#f59e0b"; x.shadowBlur = 12;
    fit(x, "CHEYYAR BUS TERMINUS", 1160, 72, "800"); x.fillText("CHEYYAR BUS TERMINUS", 640, 52);
    x.fillStyle = "#f6f7fb"; x.shadowBlur = 4;
    fit(x, "செய்யாறு பேருந்து நிலையம்", 1160, 50, "600"); x.fillText("செய்யாறு பேருந்து நிலையம்", 640, 118);
    x.shadowBlur = 0;
    stationTex.needsUpdate = true; need();
  };

  B.init = (stage, routes, onPick) => {
    if (!window.THREE) return false;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (e) { return false; }

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // GPU Optimization: DPR 1.0 on mobile to eliminate lag entirely!
    const isMobile = matchMedia("(max-width: 768px)").matches;
    renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5));
    if (renderer.outputEncoding) renderer.outputEncoding = THREE.sRGBEncoding || 3001;
    stage.insertBefore(renderer.domElement, stage.firstChild);

    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(32, 1, 0.1, 250);

    scene.add(new THREE.AmbientLight(0xffffff, 0.95));
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.35);
    keyLight.position.set(15, 22, 16); scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.6);
    fillLight.position.set(-16, 12, -14); scene.add(fillLight);
    const goldGlow = new THREE.DirectionalLight(0xf59e0b, 0.35);
    goldGlow.position.set(0, -6, 4); scene.add(goldGlow);

    const cache = {};
    const M = (c, o) => {
      const k = c + JSON.stringify(o || "");
      return cache[k] || (cache[k] = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.3, metalness: 0.25 }, o)));
    };
    const box = (g, w, h, l, m, x, y, z, rx, ry, rz) => {
      const s = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), m);
      s.position.set(x, y, z);
      if (rx) s.rotation.x = rx; if (ry) s.rotation.y = ry; if (rz) s.rotation.z = rz;
      g.add(s); return s;
    };
    const cyl = (g, rt, rb, h, seg, m, x, y, z, rx, ry, rz) => {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
      s.position.set(x, y, z);
      if (rx) s.rotation.x = rx; if (ry) s.rotation.y = ry; if (rz) s.rotation.z = rz;
      g.add(s); return s;
    };
    const plane = (w, h, map) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, transparent: true, side: THREE.DoubleSide }));

    /* --- Ground Drop Shadow Texture --- */
    const shadowCv = cv(256, 512), sctx = shadowCv.getContext("2d");
    const sg = sctx.createRadialGradient(128, 256, 40, 128, 256, 160);
    sg.addColorStop(0, "rgba(0,0,0,0.75)");
    sg.addColorStop(0.6, "rgba(0,0,0,0.35)");
    sg.addColorStop(1, "rgba(0,0,0,0)");
    sctx.fillStyle = sg; sctx.fillRect(0, 0, 256, 512);
    const shadowTex = new THREE.CanvasTexture(shadowCv);

    /* --- Terminal Architecture --- */
    const N = routes.length, SP = 3.8, W = Math.max(22, N * SP + 4);
    box(scene, W, 0.2, 18, M(0x0a0c10, { roughness: 0.85, metalness: 0.1 }), 0, -0.1, 0.2);
    box(scene, W, 0.45, 2.8, M(0x161a24, { roughness: 0.5 }), 0, 0.225, -5.6);
    box(scene, W, 0.05, 0.18, M(0xf59e0b, { roughness: 0.25 }), 0, 0.46, -4.2);
    box(scene, W + 0.6, 0.25, 4.4, M(0x10131a, { roughness: 0.35, metalness: 0.4 }), 0, 4.25, -5.2);
    box(scene, W + 0.6, 0.08, 0.08, M(0xf59e0b, { emissive: 0xf59e0b, emissiveIntensity: 1.3 }), 0, 4.12, -3.0);

    const np = Math.floor((W / 2 - 1) / 3.4);
    for (let i = -np; i <= np; i++) {
      box(scene, 0.24, 4.0, 0.24, M(0x242a38, { metalness: 0.6, roughness: 0.25 }), i * 3.4, 2.1, -4.8);
    }

    stationCv = cv(1280, 160); stationTex = new THREE.CanvasTexture(stationCv);
    const sSign = plane(8.6, 1.08, stationTex);
    sSign.position.set(0, 3.55, -2.95); scene.add(sSign);

    /* --- Wheel Assets --- */
    const tireGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.36, 28);
    const rimGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.38, 18);
    const hubGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.40, 14);
    const caliperGeo = new THREE.BoxGeometry(0.16, 0.24, 0.1);

    /* --- TVK Livery Luxury Coach Builder --- */
    function makeTVKBus(routeColor) {
      const g = new THREE.Group();

      const tvkRed = M(0xb91c1c, { roughness: 0.22, metalness: 0.35 });
      const tvkGold = M(0xfbbf24, { roughness: 0.20, metalness: 0.45 });
      const whiteMat = M(0xf8fafc, { roughness: 0.15, metalness: 0.1 });
      const darkMat = M(0x0a0c10, { roughness: 0.5 });
      const chromeMat = M(0xe2e8f0, { metalness: 0.95, roughness: 0.08 });
      const glassMat = M(0x0c1524, { roughness: 0.08, metalness: 0.85, transparent: true, opacity: 0.92 });

      // A. Ground Shadow
      const dropShadow = plane(3.4, 7.2, shadowTex);
      dropShadow.rotation.x = -Math.PI / 2;
      dropShadow.position.set(0, 0.015, 0.1);
      g.add(dropShadow);

      // B. Lower Chassis & Bumpers
      box(g, 2.4, 0.36, 6.4, darkMat, 0, 0.4, 0);
      box(g, 2.44, 0.42, 0.28, tvkRed, 0, 0.45, 3.25);
      box(g, 2.44, 0.42, 0.28, tvkRed, 0, 0.45, -3.25);

      // C. TVK Dual-Tone Body: Red - Gold - Red
      box(g, 2.38, 0.45, 6.4, tvkRed, 0, 0.72, 0);
      box(g, 2.39, 0.45, 6.42, tvkGold, 0, 1.08, 0);
      box(g, 2.38, 0.35, 6.4, tvkRed, 0, 1.40, 0);

      box(g, 2.41, 0.05, 6.44, chromeMat, 0, 0.86, 0);
      box(g, 2.41, 0.05, 6.44, chromeMat, 0, 1.30, 0);

      // D. Panoramic Glass Cabin
      box(g, 2.32, 1.05, 6.25, glassMat, 0, 2.05, 0);
      box(g, 2.30, 1.04, 0.14, glassMat, 0, 2.05, 3.16);

      // Wiper Blades
      box(g, 0.8, 0.04, 0.03, darkMat, -0.4, 1.62, 3.26, 0, 0, 0.15);
      box(g, 0.8, 0.04, 0.03, darkMat, 0.4, 1.62, 3.26, 0, 0, 0.15);

      // Pillars
      for (let i = -2; i <= 2; i++) {
        box(g, 2.39, 1.05, 0.09, tvkRed, 0, 2.05, i * 1.2);
      }

      // E. Roof Assembly & AC Pod
      box(g, 2.38, 0.32, 6.42, whiteMat, 0, 2.65, 0);
      box(g, 1.7, 0.28, 2.6, tvkGold, 0, 2.92, 0.2);
      box(g, 1.5, 0.06, 2.3, darkMat, 0, 3.08, 0.2);
      cyl(g, 0.32, 0.32, 0.05, 16, M(0x12151e), -0.4, 3.1, 0.4);
      cyl(g, 0.32, 0.32, 0.05, 16, M(0x12151e), 0.4, 3.1, 0.4);

      // F. Front Fascia
      box(g, 1.1, 0.32, 0.06, darkMat, 0, 0.78, 3.26);
      cyl(g, 0.11, 0.11, 0.07, 16, tvkGold, 0, 0.82, 3.3, Math.PI / 2, 0, 0);
      box(g, 1.6, 0.06, 0.08, tvkGold, 0, 0.62, 3.25);

      [-0.88, 0.88].forEach(x => {
        box(g, 0.4, 0.26, 0.07, darkMat, x, 0.9, 3.24);
        cyl(g, 0.09, 0.09, 0.08, 16, M(0xffffff, { emissive: 0xffffff, emissiveIntensity: 1.6 }), x + (x > 0 ? 0.07 : -0.07), 0.9, 3.27, Math.PI / 2, 0, 0);
        cyl(g, 0.07, 0.07, 0.08, 16, M(0xffd166, { emissive: 0xffaa00, emissiveIntensity: 1.2 }), x + (x > 0 ? -0.07 : 0.07), 0.9, 3.27, Math.PI / 2, 0, 0);
        box(g, 0.28, 0.08, 0.06, M(0xfbbf24, { emissive: 0xf59e0b, emissiveIntensity: 1.1 }), x, 0.64, 3.26);
      });

      // G. Rear Fascia
      box(g, 2.4, 0.14, 0.45, tvkRed, 0, 2.82, -3.3);
      [-0.96, 0.96].forEach(x => {
        box(g, 0.22, 0.65, 0.07, M(0xff1235, { emissive: 0xd90429, emissiveIntensity: 1.5 }), x, 1.2, -3.24);
      });
      [-0.7, 0.7].forEach(x => {
        cyl(g, 0.07, 0.07, 0.25, 16, chromeMat, x, 0.28, -3.35, Math.PI / 2, 0, 0);
      });

      // H. ORVM Mirrors
      [-1.38, 1.38].forEach((x, idx) => {
        const arm = box(g, 0.07, 0.07, 0.42, darkMat, x * 0.9, 2.26, 2.96);
        arm.rotation.y = idx === 0 ? 0.38 : -0.38;
        box(g, 0.15, 0.48, 0.26, tvkRed, x, 2.26, 3.22);
        box(g, 0.155, 0.12, 0.265, tvkGold, x, 2.26, 3.22);
        box(g, 0.02, 0.42, 0.20, chromeMat, x + (idx === 0 ? 0.08 : -0.08), 2.26, 3.20);
      });

      // I. Wheels with Red Calipers
      const tireMat = M(0x131518, { roughness: 0.92 });
      const rimMat = M(0xfcd34d, { metalness: 0.8, roughness: 0.2 });
      const hubMat = M(0x1e2430, { metalness: 0.6 });
      const caliperMat = M(0xb91c1c, { roughness: 0.4 });

      [[-1.22, 1.95], [1.22, 1.95], [-1.22, -1.95], [1.22, -1.95]].forEach(p => {
        const w = new THREE.Mesh(tireGeo, tireMat);
        w.rotation.z = Math.PI / 2; w.position.set(p[0], 0.48, p[1]);
        g.add(w);
        const r = new THREE.Mesh(rimGeo, rimMat);
        r.rotation.z = Math.PI / 2; r.position.set(p[0] + (p[0] > 0 ? 0.025 : -0.025), 0.48, p[1]);
        g.add(r);
        const h = new THREE.Mesh(hubGeo, hubMat);
        h.rotation.z = Math.PI / 2; h.position.set(p[0] + (p[0] > 0 ? 0.04 : -0.04), 0.48, p[1]);
        g.add(h);
        const c = new THREE.Mesh(caliperGeo, caliperMat);
        c.position.set(p[0] * 0.88, 0.58, p[1]);
        g.add(c);
      });

      // J. FRONT DIGITAL LED DESTINATION SCREEN (Mounted on Exterior Face)
      const c = cv(1024, 256), tex = new THREE.CanvasTexture(c);
      box(g, 2.16, 0.62, 0.06, darkMat, 0, 2.26, 3.26);
      box(g, 2.20, 0.04, 0.08, tvkGold, 0, 2.58, 3.28);
      box(g, 2.20, 0.04, 0.08, tvkGold, 0, 1.94, 3.28);

      const sign = plane(2.10, 0.54, tex);
      sign.position.set(0, 2.26, 3.32);
      g.add(sign);

      return { g, ctx: c.getContext("2d"), tex };
    }

    for (let i = 0; i <= N; i++) {
      box(scene, 0.12, 0.02, 8.4, M(0xffffff, { roughness: 0.35 }), (i - N / 2) * SP, 0.015, 0.4);
    }

    routes.forEach((r, i) => {
      const x = (i - (N - 1) / 2) * SP;
      const b = makeTVKBus(r.color || "#ff5c35");
      b.g.position.x = x; b.g.userData.id = r.id; b.x = x;
      scene.add(b.g);

      b.hl = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.38 }));
      b.hl.scale.set(3.3, 8.4, 1); b.hl.rotation.x = -Math.PI / 2;
      b.hl.position.set(x, 0.02, 0.4); b.hl.visible = false;
      scene.add(b.hl);

      const lc = cv(256, 96), lx = lc.getContext("2d");
      lx.fillStyle = "#0c0f17"; lx.fillRect(0, 0, 256, 96);
      lx.strokeStyle = "rgba(251, 191, 36, 0.45)"; lx.lineWidth = 4;
      lx.strokeRect(3, 3, 250, 90);
      lx.fillStyle = "#fbbf24"; lx.font = "800 50px " + FONT;
      lx.textAlign = "center"; lx.textBaseline = "middle";
      lx.fillText("BAY " + (r.bay || (i + 1)), 128, 48);
      
      const lab = plane(1.95, 0.74, new THREE.CanvasTexture(lc));
      lab.rotation.x = -Math.PI / 2; lab.position.set(x, 0.03, 4.9);
      scene.add(lab);

      B.buses[r.id] = b;
    });

    const st = { yaw: 0.32, pitch: 0.28, r: 21, tx: 0 }, goal = Object.assign({}, st);
    let sel = null, raf = 0, drag = false, first = true;
    const ovOne = () => Math.min(34, Math.max(16, 25 / cam.aspect));
    const ov = () => N > 4 ? Math.max(ovOne(), (W / 2 + 2) / (Math.tan(16 * Math.PI / 180) * cam.aspect)) : ovOne();

    const step = () => {
      raf = 0; let busy = drag;
      for (const k in st) {
        const d = goal[k] - st[k];
        if (Math.abs(d) > 0.002) {
          st[k] = reduce ? goal[k] : st[k] + d * 0.12; busy = true;
        } else {
          st[k] = goal[k];
        }
      }
      cam.position.set(
        st.tx + st.r * Math.sin(st.yaw) * Math.cos(st.pitch),
        1.45 + st.r * Math.sin(st.pitch),
        st.r * Math.cos(st.yaw) * Math.cos(st.pitch)
      );
      cam.lookAt(st.tx, 1.45, 0);
      renderer.render(scene, cam);

      if (first) {
        first = false;
        stage.classList.add("ready");
        const loader = stage.querySelector(".stage-loading");
        if (loader) loader.style.display = "none";
      }
      if (busy) raf = requestAnimationFrame(step);
    };

    need = () => { if (!raf) raf = requestAnimationFrame(step); };
    const frameR = () => { goal.r = sel ? ovOne() * 0.65 : ov(); };

    B.focus = id => {
      sel = id; const b = B.buses[id];
      for (const k in B.buses) B.buses[k].hl.visible = B.buses[k] === b;
      if (b) goal.tx = b.x;
      frameR(); need();
    };

    new ResizeObserver(() => {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      cam.aspect = w / h; cam.updateProjectionMatrix();
      frameR(); st.r = goal.r; need();
    }).observe(stage);

    const ray = new THREE.Raycaster(), v = new THREE.Vector2();
    let sx = 0, sy = 0, moved = 0;
    const pick = e => {
      const r = renderer.domElement.getBoundingClientRect();
      v.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(v, cam);
      const hit = ray.intersectObjects(Object.keys(B.buses).map(k => B.buses[k].g), true)[0];
      if (!hit) return;
      let o = hit.object;
      while (o && !o.userData.id) o = o.parent;
      if (o) onPick(o.userData.id);
    };

    stage.addEventListener("pointerdown", e => {
      drag = true; sx = e.clientX; sy = e.clientY; moved = 0;
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener("pointermove", e => {
      if (!drag) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      sx = e.clientX; sy = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
      goal.yaw = st.yaw += dx * 0.007;
      if (e.pointerType === "mouse") {
        goal.pitch = st.pitch = Math.min(0.85, Math.max(0.08, st.pitch + dy * 0.005));
      }
      need();
    });
    stage.addEventListener("pointerup", e => {
      drag = false;
      if (moved < 6) pick(e);
    });
    stage.addEventListener("pointercancel", () => { drag = false; });
    stage.addEventListener("dblclick", () => {
      sel = null; goal.tx = 0; goal.yaw = 0.32; frameR(); need();
    });
    stage.addEventListener("keydown", e => {
      const k = e.key, m = {
        ArrowLeft: ["yaw", -0.2], ArrowRight: ["yaw", 0.2],
        ArrowUp: ["pitch", 0.08], ArrowDown: ["pitch", -0.08],
        "+": ["r", -2], "=": ["r", -2], "-": ["r", 2]
      }[k];
      if (!m) return;
      e.preventDefault();
      goal[m[0]] += m[1];
      goal.pitch = Math.min(0.85, Math.max(0.08, goal.pitch));
      goal.r = Math.min(Math.max(40, ov()), Math.max(7, goal.r));
      need();
    });

    B.drawStation();
    if (document.fonts && document.fonts.load) {
      document.fonts.load("600 20px 'Noto Sans Tamil'", "செய்யாறு").then(B.drawStation).catch(() => {});
    }
    return true;
  };

  window.Bus3D = B;
})();