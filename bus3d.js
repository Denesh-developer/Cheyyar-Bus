/* Bus3DScene - "Ember Transit" premium luxury coach terminal
   Same public API as before: Bus3D.init / setSign / focus / drawStation

   What's new
   - Studio HDR reflections (procedural PMREM environment) on paint, glass, chrome & floor
   - Clear-coat crimson / brushed-gold livery, rounded (extruded + bevelled) body panels
   - Dot-matrix LED destination board: bus name, destination, gold time pill, glass sheen
   - Spoked alloy wheels with chrome lip + red calipers, ORVMs, grille slats, door, side lettering
   - Headlight / tail-light glow, floor beams, per-bay light pools, glossy wet-look floor
   - ACES filmic tone mapping, depth fog, gentle idle camera drift (desktop only, pauses off-screen)
   - Mobile: DPR 1, standard materials, no idle animation (battery + FPS friendly)
*/
(function () {
  const FONT = "'Noto Sans Tamil','Space Grotesk','DM Sans',sans-serif";
  const cv = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  function fit(x, t, maxW, size, wt) {
    let s = size;
    do { x.font = wt + " " + s + "px " + FONT; s -= 4; } while (x.measureText(t).width > maxW && s > 18);
  }
  function rr(x, px, py, w, h, r) {
    x.beginPath();
    x.moveTo(px + r, py);
    x.lineTo(px + w - r, py); x.quadraticCurveTo(px + w, py, px + w, py + r);
    x.lineTo(px + w, py + h - r); x.quadraticCurveTo(px + w, py + h, px + w - r, py + h);
    x.lineTo(px + r, py + h); x.quadraticCurveTo(px, py + h, px, py + h - r);
    x.lineTo(px, py + r); x.quadraticCurveTo(px, py, px + r, py);
    x.closePath();
  }

  const B = { buses: {} };
  let need = () => {}, stationCv = null, stationTex = null;

  /* ---------- Front LED destination board ---------- */
  B.setSign = (id, dest, bus, time) => {
    const b = B.buses[id]; if (!b) return;
    const x = b.ctx, W = 1024, H = 256;
    const busTitle = (bus || dest || "CHEYYAR").toUpperCase();
    const destRoute = (dest || "").toUpperCase();

    x.shadowBlur = 0; x.textAlign = "center"; x.textBaseline = "middle";

    // black glass
    const bg = x.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#080a10"); bg.addColorStop(1, "#010203");
    x.fillStyle = bg; x.fillRect(0, 0, W, H);

    // dim unlit LED matrix
    x.fillStyle = "rgba(251,191,36,0.07)";
    for (let py = 10; py < H - 6; py += 12) {
      for (let px = 10; px < W - 6; px += 12) x.fillRect(px, py, 5, 5);
    }

    // line 1: bus name / number
    x.fillStyle = "#ffb703"; x.shadowColor = "#f59e0b"; x.shadowBlur = 20;
    fit(x, busTitle, 900, 112, "800");
    x.fillText(busTitle, 512, 80);

    // divider
    x.shadowBlur = 0;
    const dv = x.createLinearGradient(48, 0, 976, 0);
    dv.addColorStop(0, "rgba(251,191,36,0)"); dv.addColorStop(0.5, "rgba(251,191,36,0.55)"); dv.addColorStop(1, "rgba(251,191,36,0)");
    x.fillStyle = dv; x.fillRect(48, 136, 928, 2);

    // time pill (right)
    let pillW = 0;
    if (time) {
      x.font = "800 52px " + FONT;
      pillW = Math.ceil(x.measureText(time).width) + 46;
      const px = 976 - pillW, py = 158;
      const pg = x.createLinearGradient(px, py, px + pillW, py + 70);
      pg.addColorStop(0, "#fde68a"); pg.addColorStop(1, "#f59e0b");
      x.shadowColor = "rgba(245,158,11,0.8)"; x.shadowBlur = 16;
      x.fillStyle = pg; rr(x, px, py, pillW, 70, 20); x.fill();
      x.shadowBlur = 0;
      x.fillStyle = "#1c1204"; x.textAlign = "center";
      x.fillText(time, px + pillW / 2, py + 37);
    }

    // line 2: destination
    x.textAlign = "left"; x.fillStyle = "#ffffff";
    x.shadowColor = "rgba(255,255,255,0.55)"; x.shadowBlur = 10;
    fit(x, destRoute, 928 - pillW - (pillW ? 26 : 0), 58, "700");
    x.fillText(destRoute, 52, 194);
    x.shadowBlur = 0;

    // LED grid mask (scanlines + column gaps)
    x.fillStyle = "rgba(0,0,0,0.26)";
    for (let py = 0; py < H; py += 4) x.fillRect(0, py, W, 1);
    x.fillStyle = "rgba(0,0,0,0.16)";
    for (let px = 0; px < W; px += 4) x.fillRect(px, 0, 1, H);

    // glass sheen
    const sh = x.createLinearGradient(0, 0, W, H * 0.8);
    sh.addColorStop(0, "rgba(255,255,255,0.13)"); sh.addColorStop(0.42, "rgba(255,255,255,0)");
    x.fillStyle = sh; x.fillRect(0, 0, W, H * 0.62);

    // gold frame
    const fg = x.createLinearGradient(0, 0, W, 0);
    fg.addColorStop(0, "#fde68a"); fg.addColorStop(0.5, "#d9a21b"); fg.addColorStop(1, "#fde68a");
    x.strokeStyle = fg; x.lineWidth = 7; rr(x, 6, 6, W - 12, H - 12, 18); x.stroke();

    b.tex.needsUpdate = true; need();
  };

  /* ---------- Terminal name board ---------- */
  B.drawStation = () => {
    if (!stationCv) return;
    const x = stationCv.getContext("2d"), W = 1280, H = 160;
    const g = x.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, "#07080d"); g.addColorStop(0.5, "#161b27"); g.addColorStop(1, "#07080d");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    const fg = x.createLinearGradient(0, 0, W, 0);
    fg.addColorStop(0, "#fde68a"); fg.addColorStop(0.5, "#d9a21b"); fg.addColorStop(1, "#fde68a");
    x.strokeStyle = fg; x.lineWidth = 5; rr(x, 5, 5, W - 10, H - 10, 22); x.stroke();
    x.textAlign = "center"; x.textBaseline = "middle";
    x.fillStyle = "#fbbf24"; x.shadowColor = "#f59e0b"; x.shadowBlur = 16;
    fit(x, "CHEYYAR BUS TERMINUS", 1160, 72, "800"); x.fillText("CHEYYAR BUS TERMINUS", 640, 52);
    x.fillStyle = "#f6f7fb"; x.shadowColor = "rgba(255,255,255,0.4)"; x.shadowBlur = 6;
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
    const isMobile = matchMedia("(max-width: 768px)").matches;
    renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.75));
    if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
    if (THREE.ACESFilmicToneMapping) { renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.18; }
    stage.insertBefore(renderer.domElement, stage.firstChild);
    const maxAniso = renderer.capabilities && renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1;

    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(32, 1, 0.1, 250);
    scene.fog = new THREE.Fog(0x06070b, 34, 82);

    const tex = (c, srgb) => {
      const t = new THREE.CanvasTexture(c);
      if (srgb !== false && THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
      t.anisotropy = Math.min(8, maxAniso);
      return t;
    };

    /* ----- procedural studio environment (reflections) ----- */
    let hasEnv = false;
    try {
      const pm = new THREE.PMREMGenerator(renderer);
      const es = new THREE.Scene();
      const ec = cv(512, 256), ex = ec.getContext("2d");
      const eg = ex.createLinearGradient(0, 0, 0, 256);
      eg.addColorStop(0, "#222b40"); eg.addColorStop(0.46, "#0b0e16");
      eg.addColorStop(0.5, "#2b1b12"); eg.addColorStop(1, "#040507");
      ex.fillStyle = eg; ex.fillRect(0, 0, 512, 256);
      es.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.MeshBasicMaterial({ map: tex(ec), side: THREE.BackSide })));
      const panel = (w, h, col, px, py, pz) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide }));
        m.position.set(px, py, pz); m.lookAt(0, 0, 0); es.add(m);
      };
      panel(34, 11, new THREE.Color(6, 6, 6.6), 0, 34, 6);
      panel(8, 26, new THREE.Color(5.2, 4.5, 3.8), 36, 10, 10);
      panel(6, 24, new THREE.Color(2.2, 3.3, 5.8), -36, 8, -6);
      panel(26, 5, new THREE.Color(5.2, 2.3, 0.9), 0, 6, -38);
      panel(18, 5, new THREE.Color(4, 4, 4.2), 0, 5, 40);
      const rt = pm.fromScene(es, 0.03);
      scene.environment = rt.texture;
      pm.dispose();
      hasEnv = true;
    } catch (e) { hasEnv = false; }

    const amb = new THREE.AmbientLight(0xffffff, hasEnv ? 0.3 : 0.95); scene.add(amb);
    const keyLight = new THREE.DirectionalLight(0xfff4e6, hasEnv ? 1.5 : 1.35);
    keyLight.position.set(15, 22, 16); scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x6aa5ff, 0.45);
    fillLight.position.set(-16, 12, -14); scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0xff7a45, 0.8);
    rimLight.position.set(-4, 7, -22); scene.add(rimLight);
    const goldGlow = new THREE.DirectionalLight(0xf59e0b, 0.28);
    goldGlow.position.set(0, -6, 4); scene.add(goldGlow);

    /* ----- materials & geometry caches ----- */
    const cache = {};
    const keep = ["roughness", "metalness", "emissive", "emissiveIntensity", "transparent", "opacity", "envMapIntensity"];
    const M = (c, o) => {
      const k = "s" + c + JSON.stringify(o || "");
      return cache[k] || (cache[k] = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.3, metalness: 0.25 }, o)));
    };
    const P = (c, o) => {
      if (isMobile || !THREE.MeshPhysicalMaterial) {
        const s = {}; Object.keys(o || {}).forEach(k => { if (keep.indexOf(k) > -1) s[k] = o[k]; });
        return M(c, s);
      }
      const k = "p" + c + JSON.stringify(o || "");
      return cache[k] || (cache[k] = new THREE.MeshPhysicalMaterial(Object.assign({ color: c, roughness: 0.3, metalness: 0.25 }, o)));
    };
    const GC = {};
    const geo = (k, f) => GC[k] || (GC[k] = f());
    const noRay = o => { o.raycast = () => {}; return o; };

    const box = (g, w, h, l, m, x, y, z, rx, ry, rz) => {
      const s = new THREE.Mesh(geo("b" + [w, h, l].join("_"), () => new THREE.BoxGeometry(w, h, l)), m);
      s.position.set(x, y, z);
      if (rx) s.rotation.x = rx; if (ry) s.rotation.y = ry; if (rz) s.rotation.z = rz;
      g.add(s); return s;
    };
    const cyl = (g, rt, rb, h, seg, m, x, y, z, rx, ry, rz) => {
      const s = new THREE.Mesh(geo("c" + [rt, rb, h, seg].join("_"), () => new THREE.CylinderGeometry(rt, rb, h, seg)), m);
      s.position.set(x, y, z);
      if (rx) s.rotation.x = rx; if (ry) s.rotation.y = ry; if (rz) s.rotation.z = rz;
      g.add(s); return s;
    };
    /* rounded box: rounded cross-section (XY), extruded along Z with a small bevel */
    const rgeo = (w, h, l, r) => geo("r" + [w, h, l, r].join("_"), () => {
      const bs = Math.min(0.035, r * 0.45), bt = 0.03;
      const hw = (w - 2 * bs) / 2, hh = (h - 2 * bs) / 2, q = Math.max(0.005, r - bs);
      const s = new THREE.Shape();
      s.moveTo(-hw + q, -hh);
      s.lineTo(hw - q, -hh); s.quadraticCurveTo(hw, -hh, hw, -hh + q);
      s.lineTo(hw, hh - q); s.quadraticCurveTo(hw, hh, hw - q, hh);
      s.lineTo(-hw + q, hh); s.quadraticCurveTo(-hw, hh, -hw, hh - q);
      s.lineTo(-hw, -hh + q); s.quadraticCurveTo(-hw, -hh, -hw + q, -hh);
      const depth = Math.max(0.01, l - 2 * bt);
      const eg = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: bt, bevelSize: bs, bevelSegments: 2, curveSegments: 6 });
      eg.translate(0, 0, -depth / 2);
      return eg;
    });
    const rb = (g, w, h, l, r, m, x, y, z) => {
      const s = new THREE.Mesh(rgeo(w, h, l, r), m);
      s.position.set(x, y, z); g.add(s); return s;
    };
    const plane = (w, h, map, extra) => new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial(Object.assign({ map, transparent: true, side: THREE.DoubleSide, toneMapped: false }, extra))
    );

    /* ----- shared textures ----- */
    const radial = (size, stops) => {
      const c = cv(size, size), x = c.getContext("2d");
      const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      stops.forEach(s => g.addColorStop(s[0], s[1]));
      x.fillStyle = g; x.fillRect(0, 0, size, size);
      return tex(c, false);
    };
    const glowTex = radial(128, [[0, "rgba(255,255,255,1)"], [0.25, "rgba(255,255,255,0.45)"], [1, "rgba(255,255,255,0)"]]);
    const poolTex = radial(256, [[0, "rgba(255,230,190,0.55)"], [0.55, "rgba(255,170,90,0.16)"], [1, "rgba(255,140,60,0)"]]);
    const hlTex = (() => {
      const c = cv(256, 512), x = c.getContext("2d");
      const g = x.createRadialGradient(128, 256, 20, 128, 256, 250);
      g.addColorStop(0, "rgba(255,200,90,0.95)"); g.addColorStop(0.5, "rgba(255,130,50,0.45)"); g.addColorStop(1, "rgba(255,92,53,0)");
      x.fillStyle = g; x.fillRect(0, 0, 256, 512);
      return tex(c, false);
    })();
    const shadowTex = (() => {
      const c = cv(256, 512), x = c.getContext("2d");
      const g = x.createRadialGradient(128, 256, 30, 128, 256, 170);
      g.addColorStop(0, "rgba(0,0,0,0.9)"); g.addColorStop(0.55, "rgba(0,0,0,0.45)"); g.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = g; x.fillRect(0, 0, 256, 512);
      return tex(c, false);
    })();
    const beamTex = (() => {
      const c = cv(64, 128), x = c.getContext("2d");
      const g = x.createLinearGradient(0, 0, 0, 128);
      g.addColorStop(0, "rgba(255,244,214,0.75)"); g.addColorStop(1, "rgba(255,244,214,0)");
      x.fillStyle = g; x.fillRect(0, 0, 64, 128);
      const m = x.createLinearGradient(0, 0, 64, 0);
      m.addColorStop(0, "rgba(0,0,0,1)"); m.addColorStop(0.5, "rgba(0,0,0,0)"); m.addColorStop(1, "rgba(0,0,0,1)");
      x.globalCompositeOperation = "destination-out"; x.fillStyle = m; x.fillRect(0, 0, 64, 128);
      return tex(c, false);
    })();
    const gridTex = (() => {
      const c = cv(128, 128), x = c.getContext("2d");
      x.strokeStyle = "rgba(255,255,255,0.9)"; x.lineWidth = 2; x.strokeRect(0, 0, 128, 128);
      const t = tex(c, false);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    })();
    const sideTex = (() => {
      const c = cv(1024, 96), x = c.getContext("2d");
      x.textAlign = "center"; x.textBaseline = "middle";
      const g = x.createLinearGradient(0, 0, 1024, 0);
      g.addColorStop(0, "#fde68a"); g.addColorStop(0.5, "#f3b73a"); g.addColorStop(1, "#fde68a");
      x.fillStyle = g; x.font = "800 46px " + FONT;
      x.fillText("CHEYYAR  BUS  HUB   •   செய்யாறு", 512, 50);
      return tex(c);
    })();

    const addGlow = (g, x, y, z, s, color, op) => {
      const k = "g" + color + op;
      const mat = cache[k] || (cache[k] = new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
      const sp = noRay(new THREE.Sprite(mat));
      sp.scale.set(s, s, 1); sp.position.set(x, y, z); g.add(sp); return sp;
    };

    /* ----- Terminal architecture ----- */
    const N = routes.length, SP = 3.8, W = Math.max(22, N * SP + 4);
    const metalDark = M(0x1a1f2c, { metalness: 0.85, roughness: 0.22 });
    const amberStrip = M(0xf59e0b, { emissive: 0xf59e0b, emissiveIntensity: 1.5 });

    // glossy wet-look floor + faint grid
    box(scene, W, 0.2, 18, M(0x08090d, { roughness: 0.3, metalness: 0.75 }), 0, -0.1, 0.2);
    const gridPlane = noRay(new THREE.Mesh(new THREE.PlaneGeometry(W, 18), new THREE.MeshBasicMaterial({ map: gridTex, transparent: true, opacity: 0.07, depthWrite: false, toneMapped: false, color: 0xffb066 })));
    gridTex.repeat.set(W / 1.9, 9.5);
    gridPlane.rotation.x = -Math.PI / 2; gridPlane.position.set(0, 0.004, 0.2); scene.add(gridPlane);

    // back platform, wall & canopy
    box(scene, W, 0.45, 2.8, M(0x151925, { roughness: 0.35, metalness: 0.6 }), 0, 0.225, -5.6);
    box(scene, W, 0.05, 0.12, amberStrip, 0, 0.47, -4.18);
    box(scene, W + 0.6, 4.6, 0.2, M(0x0b0d14, { metalness: 0.9, roughness: 0.16 }), 0, 2.3, -7.0);
    box(scene, W + 0.6, 0.28, 4.6, M(0x0f121a, { roughness: 0.28, metalness: 0.75 }), 0, 4.3, -5.2);
    box(scene, W + 0.6, 0.08, 0.08, amberStrip, 0, 4.14, -2.92);
    box(scene, W, 0.05, 0.3, M(0xffffff, { emissive: 0xfff1d6, emissiveIntensity: 1.4 }), 0, 4.14, -4.2);
    box(scene, W, 0.05, 0.3, M(0xffffff, { emissive: 0xfff1d6, emissiveIntensity: 1.4 }), 0, 4.14, -6.0);

    const np = Math.floor((W / 2 - 1) / 3.4);
    for (let i = -np; i <= np; i++) {
      box(scene, 0.24, 4.0, 0.24, metalDark, i * 3.4, 2.1, -4.8);
      box(scene, 0.34, 0.12, 0.34, M(0xf59e0b, { emissive: 0xf59e0b, emissiveIntensity: 0.9 }), i * 3.4, 0.07, -4.8);
    }

    stationCv = cv(1280, 160); stationTex = tex(stationCv);
    const sSign = plane(8.6, 1.08, stationTex);
    sSign.position.set(0, 3.55, -2.95); scene.add(sSign);

    /* ----- Wheel assets ----- */
    const tireGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.36, 32);
    const sideGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.38, 28);
    const lipGeo = new THREE.TorusGeometry(0.33, 0.03, 8, 28);
    const hubGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
    const spokeGeo = new THREE.BoxGeometry(0.035, 0.6, 0.07);
    const caliperGeo = new THREE.BoxGeometry(0.1, 0.22, 0.2);

    /* ----- Livery coach builder ----- */
    function makeCoach() {
      const g = new THREE.Group();

      const red = P(0xa3141c, { roughness: 0.3, metalness: 0.5, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.25 });
      const gold = P(0xe7ae28, { roughness: 0.2, metalness: 0.92, clearcoat: 0.6, clearcoatRoughness: 0.1, envMapIntensity: 1.35 });
      const white = P(0xf3f5f9, { roughness: 0.22, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.1 });
      const dark = M(0x090b10, { roughness: 0.5, metalness: 0.3 });
      const chrome = M(0xe8edf5, { metalness: 1, roughness: 0.06, envMapIntensity: 1.6 });
      const glass = M(0x0a1220, { roughness: 0.04, metalness: 0.95, envMapIntensity: 1.5 });

      // contact shadow
      const dropShadow = noRay(plane(3.5, 7.4, shadowTex, { toneMapped: false }));
      dropShadow.rotation.x = -Math.PI / 2; dropShadow.position.set(0, 0.012, 0.1); g.add(dropShadow);

      // light pool under the bay
      const pool = noRay(plane(5.2, 9.2, poolTex, { blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55 }));
      pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.02, 0.5); g.add(pool);

      // chassis & bumpers
      box(g, 2.4, 0.34, 6.4, dark, 0, 0.4, 0);
      rb(g, 2.46, 0.4, 0.32, 0.1, red, 0, 0.46, 3.24);
      rb(g, 2.46, 0.4, 0.32, 0.1, red, 0, 0.46, -3.24);
      box(g, 1.3, 0.05, 0.1, chrome, 0, 0.3, 3.4);

      // dual-tone body: red / gold / red + chrome beltlines
      rb(g, 2.38, 0.45, 6.4, 0.06, red, 0, 0.72, 0);
      rb(g, 2.4, 0.44, 6.42, 0.05, gold, 0, 1.08, 0);
      rb(g, 2.38, 0.36, 6.4, 0.06, red, 0, 1.4, 0);
      box(g, 2.43, 0.035, 6.46, chrome, 0, 0.87, 0);
      box(g, 2.43, 0.035, 6.46, chrome, 0, 1.3, 0);

      // glass cabin, windscreen & pillars
      rb(g, 2.32, 1.05, 6.25, 0.16, glass, 0, 2.05, 0);
      rb(g, 2.26, 0.98, 0.14, 0.12, glass, 0, 2.05, 3.17);
      for (let i = -2; i <= 2; i++) rb(g, 2.39, 1.05, 0.08, 0.03, red, 0, 2.05, i * 1.2);
      box(g, 0.9, 0.035, 0.03, dark, -0.5, 1.64, 3.26, 0, 0, 0.12);
      box(g, 0.9, 0.035, 0.03, dark, 0.5, 1.64, 3.26, 0, 0, -0.12);

      // passenger door (left side, +x)
      rb(g, 0.05, 1.5, 1.0, 0.03, dark, 1.19, 1.6, 2.15);
      box(g, 0.03, 1.5, 0.03, chrome, 1.215, 1.6, 2.15);
      box(g, 0.03, 0.03, 1.02, chrome, 1.215, 2.36, 2.15);

      // roof, AC pod, rear spoiler
      rb(g, 2.38, 0.32, 6.42, 0.15, white, 0, 2.65, 0);
      rb(g, 1.7, 0.28, 2.6, 0.1, gold, 0, 2.92, 0.2);
      rb(g, 1.5, 0.06, 2.3, 0.03, dark, 0, 3.08, 0.2);
      [-0.4, 0.4].forEach(x => {
        cyl(g, 0.32, 0.32, 0.05, 20, M(0x10131c, { metalness: 0.6, roughness: 0.4 }), x, 3.1, 0.4);
        const ring = new THREE.Mesh(geo("ring", () => new THREE.TorusGeometry(0.31, 0.015, 6, 24)), chrome);
        ring.rotation.x = Math.PI / 2; ring.position.set(x, 3.13, 0.4); g.add(ring);
        cyl(g, 0.05, 0.05, 0.06, 10, chrome, x, 3.12, 0.4);
      });
      rb(g, 2.4, 0.14, 0.46, 0.05, red, 0, 2.84, -3.3);

      // front fascia: grille, slats, emblem
      rb(g, 1.2, 0.34, 0.06, 0.04, dark, 0, 0.78, 3.27);
      for (let i = 0; i < 4; i++) box(g, 1.1, 0.018, 0.02, chrome, 0, 0.67 + i * 0.075, 3.31);
      cyl(g, 0.12, 0.12, 0.05, 20, gold, 0, 0.86, 3.32, Math.PI / 2, 0, 0);
      cyl(g, 0.07, 0.07, 0.06, 16, M(0x1a0c0c, { metalness: 0.5 }), 0, 0.86, 3.325, Math.PI / 2, 0, 0);
      rb(g, 1.7, 0.06, 0.08, 0.02, gold, 0, 0.56, 3.27);

      // headlights (projector + DRL) with glow
      [-0.9, 0.9].forEach(x => {
        rb(g, 0.46, 0.24, 0.08, 0.06, dark, x, 0.92, 3.25);
        cyl(g, 0.085, 0.085, 0.08, 20, M(0xffffff, { emissive: 0xffffff, emissiveIntensity: 2.2 }), x + (x > 0 ? 0.08 : -0.08), 0.92, 3.29, Math.PI / 2, 0, 0);
        cyl(g, 0.12, 0.12, 0.03, 20, chrome, x + (x > 0 ? 0.08 : -0.08), 0.92, 3.28, Math.PI / 2, 0, 0);
        box(g, 0.22, 0.035, 0.05, M(0xffd166, { emissive: 0xffb703, emissiveIntensity: 2 }), x + (x > 0 ? -0.07 : 0.07), 0.99, 3.3);
        box(g, 0.3, 0.07, 0.06, M(0xfbbf24, { emissive: 0xf59e0b, emissiveIntensity: 1.3 }), x, 0.64, 3.28);
        addGlow(g, x + (x > 0 ? 0.08 : -0.08), 0.92, 3.4, 1.05, 0xfff1d0, 0.7);
        const beam = noRay(plane(0.9, 1.7, beamTex, { blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55 }));
        beam.rotation.x = -Math.PI / 2; beam.position.set(x * 0.9, 0.03, 4.2); g.add(beam);
      });

      // rear lights
      [-0.96, 0.96].forEach(x => {
        box(g, 0.22, 0.66, 0.07, M(0xff1235, { emissive: 0xd90429, emissiveIntensity: 1.8 }), x, 1.2, -3.26);
        addGlow(g, x, 1.2, -3.4, 0.9, 0xff2244, 0.6);
      });
      [-0.7, 0.7].forEach(x => cyl(g, 0.07, 0.07, 0.25, 16, chrome, x, 0.28, -3.36, Math.PI / 2, 0, 0));

      // side lettering (shared texture)
      [1, -1].forEach(s => {
        const t = plane(3.9, 0.34, sideTex, { transparent: true });
        t.rotation.y = s * Math.PI / 2; t.position.set(s * 1.196, 1.4, -0.7);
        noRay(t); g.add(t);
      });

      // ORVM mirrors
      [-1.38, 1.38].forEach((x, idx) => {
        const arm = box(g, 0.07, 0.07, 0.42, dark, x * 0.9, 2.26, 2.96);
        arm.rotation.y = idx === 0 ? 0.38 : -0.38;
        rb(g, 0.15, 0.48, 0.26, 0.05, red, x, 2.26, 3.22);
        box(g, 0.158, 0.1, 0.266, gold, x, 2.26, 3.22);
        box(g, 0.02, 0.42, 0.2, chrome, x + (idx === 0 ? 0.08 : -0.08), 2.26, 3.2);
        box(g, 0.03, 0.03, 0.2, M(0xffa500, { emissive: 0xffa500, emissiveIntensity: 1.6 }), x, 2.5, 3.22);
      });

      // wheels
      const tireMat = M(0x101215, { roughness: 0.9, metalness: 0.05 });
      const rimMat = P(0xf0c24a, { metalness: 1, roughness: 0.16, envMapIntensity: 1.5 });
      const hubMat = M(0x151a24, { metalness: 0.7, roughness: 0.3 });
      const caliperMat = M(0xc2181f, { roughness: 0.35, metalness: 0.4 });
      [[-1.22, 1.95], [1.22, 1.95], [-1.22, -1.95], [1.22, -1.95]].forEach(p => {
        const side = p[0] > 0 ? 1 : -1;
        const w = new THREE.Group(); w.position.set(p[0], 0.48, p[1]);
        const tire = new THREE.Mesh(tireGeo, tireMat); tire.rotation.z = Math.PI / 2; w.add(tire);
        const rim = new THREE.Mesh(sideGeo, M(0x0c0e13, { roughness: 0.5, metalness: 0.6 })); rim.rotation.z = Math.PI / 2; rim.scale.set(1, 0.9, 1); w.add(rim);
        const lip = new THREE.Mesh(lipGeo, rimMat); lip.rotation.y = Math.PI / 2; lip.position.x = side * 0.19; w.add(lip);
        for (let k = 0; k < 3; k++) {
          const sp = new THREE.Mesh(spokeGeo, rimMat);
          sp.position.x = side * 0.185; sp.rotation.x = k * Math.PI / 3; w.add(sp);
        }
        const hub = new THREE.Mesh(hubGeo, hubMat); hub.rotation.z = Math.PI / 2; hub.position.x = side * 0.2; w.add(hub);
        const cal = new THREE.Mesh(caliperGeo, caliperMat); cal.position.set(side * 0.1, 0.16, 0); w.add(cal);
        g.add(w);
      });

      // front LED destination screen
      const c = cv(1024, 256), t = tex(c);
      rb(g, 2.18, 0.64, 0.07, 0.05, dark, 0, 2.26, 3.26);
      box(g, 2.22, 0.035, 0.09, gold, 0, 2.59, 3.28);
      box(g, 2.22, 0.035, 0.09, gold, 0, 1.93, 3.28);
      const sign = plane(2.1, 0.525, t);
      sign.position.set(0, 2.26, 3.31); g.add(sign);

      return { g, ctx: c.getContext("2d"), tex: t };
    }

    // bay dividers (glowing amber)
    for (let i = 0; i <= N; i++) {
      box(scene, 0.07, 0.02, 8.4, M(0xf59e0b, { emissive: 0xf59e0b, emissiveIntensity: 0.95, roughness: 0.4 }), (i - N / 2) * SP, 0.014, 0.4);
    }

    routes.forEach((r, i) => {
      const x = (i - (N - 1) / 2) * SP;
      const b = makeCoach();
      b.g.position.x = x; b.g.userData.id = r.id; b.x = x;
      scene.add(b.g);

      // selection plate
      b.hl = noRay(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: hlTex, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })));
      b.hl.scale.set(3.9, 9.2, 1); b.hl.rotation.x = -Math.PI / 2;
      b.hl.position.set(x, 0.03, 0.4); b.hl.visible = false;
      scene.add(b.hl);

      // bay number plate on the floor
      const lc = cv(256, 96), lx = lc.getContext("2d");
      const lg = lx.createLinearGradient(0, 0, 0, 96);
      lg.addColorStop(0, "#161b27"); lg.addColorStop(1, "#080a10");
      lx.fillStyle = lg; rr(lx, 3, 3, 250, 90, 16); lx.fill();
      lx.strokeStyle = "rgba(251,191,36,0.7)"; lx.lineWidth = 4; rr(lx, 3, 3, 250, 90, 16); lx.stroke();
      lx.fillStyle = "#fbbf24"; lx.font = "800 48px " + FONT;
      lx.textAlign = "center"; lx.textBaseline = "middle";
      lx.shadowColor = "#f59e0b"; lx.shadowBlur = 10;
      lx.fillText("BAY " + (r.bay || (i + 1)), 128, 50);
      const lab = noRay(plane(1.95, 0.74, tex(lc)));
      lab.rotation.x = -Math.PI / 2; lab.position.set(x, 0.035, 5.7);
      scene.add(lab);

      B.buses[r.id] = b;
    });

    /* ----- camera, interaction, render loop ----- */
    const st = { yaw: 0.32, pitch: 0.28, r: 21, tx: 0 }, goal = Object.assign({}, st);
    let sel = null, raf = 0, drag = false, first = true, last = 0, vis = true;
    const ovOne = () => Math.min(34, Math.max(16, 25 / cam.aspect));
    const ov = () => N > 4 ? Math.max(ovOne(), (W / 2 + 2) / (Math.tan(16 * Math.PI / 180) * cam.aspect)) : ovOne();
    const idleOn = () => !reduce && !isMobile && vis && !document.hidden;

    const step = now => {
      raf = 0; let moving = drag;
      for (const k in st) {
        const d = goal[k] - st[k];
        if (Math.abs(d) > 0.002) {
          st[k] = reduce ? goal[k] : st[k] + d * 0.12; moving = true;
        } else {
          st[k] = goal[k];
        }
      }
      const idle = idleOn();
      if (!moving && idle && now - last < 32) { raf = requestAnimationFrame(step); return; }
      last = now;

      const yaw = st.yaw + (idle && !drag ? Math.sin(now * 0.00032) * 0.075 : 0);
      cam.position.set(
        st.tx + st.r * Math.sin(yaw) * Math.cos(st.pitch),
        1.45 + st.r * Math.sin(st.pitch),
        st.r * Math.cos(yaw) * Math.cos(st.pitch)
      );
      cam.lookAt(st.tx, 1.45, 0);

      if (sel && B.buses[sel]) B.buses[sel].hl.material.opacity = idle ? 0.5 + 0.14 * Math.sin(now * 0.0028) : 0.55;
      renderer.render(scene, cam);

      if (first) {
        first = false;
        stage.classList.add("ready");
        const loader = stage.querySelector(".stage-loading");
        if (loader) loader.style.display = "none";
      }
      if (moving || idle) raf = requestAnimationFrame(step);
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

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) need(); }).observe(stage);
    }
    document.addEventListener("visibilitychange", () => need());

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
      need();
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