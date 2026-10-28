/* Escena 3D del caso "simulador de financiación": ficha, catálogo y financieras
   entran al simulador (cubo central); salen la cuota, la consulta a WhatsApp y la
   fila de la planilla. Basada en la escena de assets/js/sc-ecosistema.js.
   Three.js r128 (assets/js/three.r128.min.js). Marcado: #sc-eco-stage > canvas#sc-eco-scene + #sc-eco-labels. */
(function () {
  var stage = document.getElementById('sc-eco-stage');
  var canvas = document.getElementById('sc-eco-scene');
  var labelsEl = document.getElementById('sc-eco-labels');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var noHover = window.matchMedia('(hover: none)').matches;
  if (!window.THREE) { stage.classList.add('sc-eco-nogl'); return; }
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, preserveDrawingBuffer: !!window.SC_ECO_CAPTURE }); }
  catch (e) { stage.classList.add('sc-eco-nogl'); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var ORANGE = 0xF2801E;
  var scene = new THREE.Scene();
  var cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  var target = new THREE.Vector3(0.5, 0.4, 0.5);
  cam.position.set(14, 12.5, 14).add(target);
  cam.lookAt(target);

  scene.add(new THREE.HemisphereLight(0xe4ecf2, 0x0b0f14, 0.5));
  var sun = new THREE.DirectionalLight(0xffffff, 0.75);
  sun.position.set(-7, 15, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  var sc = sun.shadow.camera; sc.left = -13; sc.right = 13; sc.top = 13; sc.bottom = -13; sc.near = 1; sc.far = 45;
  sun.shadow.bias = -0.0008;
  scene.add(sun);
  var hubLight = new THREE.PointLight(ORANGE, 1.1, 8, 2);
  hubLight.position.set(0, 2.4, 0);
  scene.add(hubLight);

  var world = new THREE.Group();
  scene.add(world);

  /* ---------- texturas dibujadas en canvas ---------- */
  function tex(w, h, draw, linear) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    var t = new THREE.CanvasTexture(c);
    if (!linear) t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    return t;
  }
  function rr(x, X, Y, W, H, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + W, Y, X + W, Y + H, r); x.arcTo(X + W, Y + H, X, Y + H, r); x.arcTo(X, Y + H, X, Y, r); x.arcTo(X, Y, X + W, Y, r); x.closePath(); }
  var SANS = 'system-ui, -apple-system, Segoe UI, sans-serif';

  var glowTex = tex(128, 128, function (x, w) {
    var g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.22, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, w);
  }, true);
  var stripTex = tex(4, 64, function (x, w, h) {
    var g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  }, true);
  var beamTex = tex(4, 128, function (x, w, h) {
    var g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,1)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  }, true);

  function moto2d(x, X, Y, s, c) {
    // silueta de moto para las texturas
    x.save(); x.translate(X, Y); x.scale(s, s);
    x.lineWidth = 7; x.strokeStyle = '#1b232c';
    x.beginPath(); x.arc(-46, 22, 22, 0, 7); x.stroke(); x.beginPath(); x.arc(46, 22, 22, 0, 7); x.stroke();
    x.fillStyle = c; x.beginPath(); x.moveTo(-30, -6); x.lineTo(8, -14); x.lineTo(30, -4); x.lineTo(8, 10); x.lineTo(-24, 10); x.closePath(); x.fill();
    x.fillStyle = '#1b232c'; rr(x, -40, -18, 34, 9, 4); x.fill();
    x.lineWidth = 5; x.beginPath(); x.moveTo(30, -4); x.lineTo(46, 22); x.moveTo(26, -22); x.lineTo(34, -2); x.stroke();
    x.fillStyle = '#5b6672'; rr(x, -16, 6, 26, 16, 4); x.fill();
    x.restore();
  }
  var fichaTex = tex(512, 320, function (x, w, h) {
    x.fillStyle = '#f3f5f7'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, 44);
    x.fillStyle = '#1b232c'; x.font = '800 17px ' + SANS; x.fillText('MOTOS', 22, 28);
    x.fillStyle = '#c4cbd2'; [300, 350, 400].forEach(function (X) { rr(x, X, 18, 38, 8, 4); x.fill(); });
    x.fillStyle = '#ffffff'; rr(x, 18, 58, 236, 248, 12); x.fill();
    x.fillStyle = '#eef1f4'; rr(x, 30, 70, 212, 168, 10); x.fill();
    moto2d(x, 136, 150, 1.25, '#F2801E');
    x.fillStyle = '#c4cbd2'; [0, 1, 2].forEach(function (i) { rr(x, 30 + i * 74, 250, 64, 44, 7); x.fill(); });
    x.fillStyle = '#1b232c'; x.font = '700 21px ' + SANS; x.fillText('Moto 250 cc', 272, 88);
    x.fillStyle = '#8a939c'; x.font = '500 13px ' + SANS; x.fillText('0 km · Entrega inmediata', 272, 110);
    x.fillStyle = '#1b232c'; x.font = '800 30px ' + SANS; x.fillText('$ 4.850.000', 272, 156);
    x.fillStyle = '#e3e8ed'; rr(x, 272, 182, 222, 44, 9); x.fill();
    x.fillStyle = '#6d7a87'; x.font = '700 13px ' + SANS; x.fillText('AGREGAR AL CARRITO', 306, 209);
    x.fillStyle = '#F2801E'; rr(x, 272, 238, 222, 48, 9); x.fill();
    x.fillStyle = '#ffffff'; x.font = '800 15px ' + SANS; x.fillText('FINANCIÁ ESTA MOTO →', 292, 268);
  });
  var cuotaTex = tex(512, 300, function (x, w, h) {
    x.fillStyle = '#10151c'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#1b232c'; x.fillRect(0, 0, w, 44);
    x.fillStyle = '#F2801E'; rr(x, 16, 15, 14, 14, 4); x.fill();
    x.fillStyle = '#e8ecef'; x.font = '700 15px ' + SANS; x.fillText('Simulador de financiación', 40, 28);
    x.fillStyle = '#8a939c'; x.font = '600 15px ' + SANS; x.fillText('Cuota estimada · Financiera A', 30, 86);
    x.fillStyle = '#ffffff'; x.font = '800 64px ' + SANS; x.fillText('$ 350.000', 28, 158);
    x.fillStyle = '#F2801E'; x.font = '800 34px ' + SANS; x.fillText('× 12', 356, 156);
    x.fillStyle = '#1b232c'; rr(x, 28, 186, 220, 40, 8); x.fill(); rr(x, 262, 186, 222, 40, 8); x.fill();
    x.fillStyle = '#c2cad2'; x.font = '600 14px ' + SANS; x.fillText('Monto  $ 3.000.000', 42, 211); x.fillText('Financiera A ▾', 278, 211);
    x.fillStyle = '#25D366'; rr(x, 28, 240, 456, 42, 9); x.fill();
    x.fillStyle = '#0b141a'; x.font = '800 14px ' + SANS; x.fillText('ENVIAR CONSULTA POR WHATSAPP', 118, 266);
  });
  var chatTex = tex(256, 512, function (x, w, h) {
    x.fillStyle = '#0b141a'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#1f2c34'; x.fillRect(0, 0, w, 64);
    x.fillStyle = '#25D366'; x.beginPath(); x.arc(32, 34, 16, 0, 7); x.fill();
    x.fillStyle = '#e9edef'; x.font = '700 15px ' + SANS; x.fillText('Ventas', 58, 30);
    x.fillStyle = '#8696a0'; x.font = '500 11px ' + SANS; x.fillText('en línea', 58, 47);
    x.fillStyle = '#202c33'; rr(x, 12, 84, 216, 186, 10); x.fill();
    x.fillStyle = '#25D366'; x.font = '700 13px ' + SANS; x.fillText('Consulta de financiación', 24, 108);
    x.fillStyle = '#e9edef'; x.font = '500 13px ' + SANS;
    ['Moto: 250 cc', 'Monto: $ 3.000.000', 'Financiera A · 12 cuotas', 'Cuota: $ 350.000', 'Juan · 11 5555 5555'].forEach(function (t, i) { x.fillText(t, 24, 136 + i * 26); });
    x.fillStyle = '#005c4b'; rr(x, 84, 288, 158, 46, 10); x.fill();
    x.fillStyle = '#bfe9dc'; rr(x, 96, 302, 120, 8, 4); x.fill(); rr(x, 96, 318, 80, 8, 4); x.fill();
    x.fillStyle = '#202c33'; rr(x, 12, 350, 150, 40, 10); x.fill();
    x.fillStyle = '#9fb0b9'; rr(x, 24, 366, 110, 8, 4); x.fill();
  });
  // planilla: se le suma una fila cada vez que llega una consulta
  var sheetCanvas = document.createElement('canvas'); sheetCanvas.width = 512; sheetCanvas.height = 336;
  var sheetRows = 3, sheetTex = new THREE.CanvasTexture(sheetCanvas); sheetTex.encoding = THREE.sRGBEncoding; sheetTex.anisotropy = 4;
  var MOTOS = ['250 cc', '110 cc', '150 cc', '300 cc', '125 cc', '200 cc', '400 cc'], CUOTAS = ['350.000', '198.000', '264.000', '412.000', '221.000', '305.000', '488.000'];
  function drawSheet(hot) {
    var x = sheetCanvas.getContext('2d'), w = 512, h = 336;
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#0f9d58'; x.fillRect(0, 0, w, 42);
    x.fillStyle = '#ffffff'; x.font = '700 15px ' + SANS; x.fillText('Consultas de financiación', 18, 27);
    x.fillStyle = '#e6f4ea'; x.fillRect(0, 42, w, 30);
    x.fillStyle = '#137333'; x.font = '700 12px ' + SANS; x.fillText('FECHA', 18, 62); x.fillText('MOTO', 150, 62); x.fillText('FINANCIERA', 260, 62); x.fillText('CUOTA', 404, 62);
    var n = Math.min(sheetRows, 9);
    for (var i = 0; i < n; i++) {
      var Y = 72 + i * 29, k = (sheetRows - n + i), last = hot && i === n - 1;
      x.fillStyle = last ? '#fde3cc' : (i % 2 ? '#f7f9fa' : '#ffffff'); x.fillRect(0, Y, w, 29);
      x.fillStyle = '#3c4650'; x.font = '500 13px ' + SANS;
      x.fillText((10 + k % 18) + '/10 ' + (9 + k % 9) + ':' + (10 + (k * 7) % 49), 18, Y + 19);
      x.fillText(MOTOS[k % 7], 150, Y + 19); x.fillText('Financiera ' + 'ABC'[k % 3], 260, Y + 19); x.fillText('$ ' + CUOTAS[k % 7], 404, Y + 19);
      x.fillStyle = '#e3e8ed'; x.fillRect(0, Y + 28, w, 1);
    }
    sheetTex.needsUpdate = true;
  }
  drawSheet(false);
  function letterTex(L) {
    return tex(128, 64, function (x, w, h) { x.fillStyle = '#1b232c'; x.fillRect(0, 0, w, h); x.fillStyle = '#F2801E'; x.font = '800 40px ' + SANS; x.textAlign = 'center'; x.fillText(L, w / 2, 48); });
  }
  var dollarTex = tex(128, 128, function (x, w, h) { x.fillStyle = '#fff3e8'; x.fillRect(0, 0, w, h); x.fillStyle = '#F2801E'; x.font = '800 92px ' + SANS; x.textAlign = 'center'; x.fillText('$', w / 2, 98); });
  /* ---------- materiales y geometría ---------- */
  function std(c, o) { var p = { color: c, roughness: .62, metalness: .04 }; for (var k in o) p[k] = o[k]; return new THREE.MeshStandardMaterial(p); }
  var M = {
    white: std(0xeef1f3), light: std(0xc5cdd4), dark: std(0x1c242d), darker: std(0x0c1117),
    top: std(0x0e141b, { roughness: .4, metalness: .2 }), grass: std(0x4b765f), tree: std(0x5f9a76, { flatShading: true }),
    trunk: std(0x6b4f3a), road: std(0x151b22, { roughness: .9 }),
    warm: std(0xffd3a6, { emissive: 0xF2801E, emissiveIntensity: .45 }), orange: std(ORANGE, { roughness: .5 })
  };
  function mesh(g, m) { var o = new THREE.Mesh(g, m); o.castShadow = true; o.receiveShadow = true; return o; }
  function box(w, h, d, m) { return mesh(new THREE.BoxGeometry(w, h, d), m); }
  function add(parent, obj, x, y, z) { obj.position.set(x || 0, y || 0, z || 0); parent.add(obj); return obj; }
  function glowMat(o, c) { return new THREE.MeshBasicMaterial({ color: c || ORANGE, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false }); }
  function rbox(w, h, d, r) {
    var s = new THREE.Shape(), x = -w / 2, y = -d / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
    s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    var g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 6 });
    g.rotateX(-Math.PI / 2);
    return g;
  }
  function screen(w, h, map) {
    var g = new THREE.Group();
    add(g, box(w + .09, h + .09, .07, M.dark));
    add(g, new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: map })), 0, 0, .037);
    return g;
  }

  var TOP = .42;
  function platform(size) {
    var g = new THREE.Group();
    add(g, mesh(rbox(size, .3, size, .32), M.darker));
    var rim = add(g, new THREE.Mesh(rbox(size + .05, .05, size + .05, .34), new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, opacity: .7 })), 0, .2, 0);
    var top = add(g, mesh(rbox(size - .14, .12, size - .14, .26), M.top), 0, .3, 0);
    var halo = new THREE.Mesh(new THREE.PlaneGeometry(size * 2.1, size * 2.1), new THREE.MeshBasicMaterial({ map: glowTex, color: ORANGE, transparent: true, opacity: .13, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.rotation.x = -Math.PI / 2; add(g, halo, 0, .02, 0);
    g.userData.rim = rim; g.userData.halo = halo; g.userData.top = top;
    return g;
  }

  function oFicha() {
    var g = new THREE.Group();
    add(g, box(.72, .05, .42, M.light), 0, .025, 0);
    add(g, box(.1, .6, .08, M.light), 0, .32, -.06);
    add(g, screen(1.62, 1.01, fichaTex), 0, 1.06, 0);
    g.rotation.y = Math.PI / 4;
    return g;
  }
  function moto3d(color) {
    // moto armada con piezas simples, mirando hacia +x
    var g = new THREE.Group(), body = std(color, { roughness: .45, metalness: .15 });
    [-.42, .42].forEach(function (X) {
      var w = add(g, mesh(new THREE.TorusGeometry(.22, .075, 10, 28), M.dark), X, .3, 0);
      add(w, mesh(new THREE.CylinderGeometry(.11, .11, .05, 16), M.light)).rotation.x = Math.PI / 2;
    });
    add(g, box(.42, .2, .2, std(0x5b6672, { metalness: .5, roughness: .4 })), -.02, .36, 0);
    var tank = add(g, box(.42, .18, .26, body), .1, .6, 0); tank.rotation.z = -.12;
    add(g, box(.42, .08, .22, M.dark), -.26, .6, 0);
    add(g, box(.36, .12, .18, body), -.42, .56, 0).rotation.z = .25;
    var fork = add(g, box(.05, .5, .05, M.light), .37, .5, 0); fork.rotation.z = -.42;
    add(g, box(.05, .05, .5, M.dark), .3, .78, 0);
    add(g, box(.08, .1, .14, M.warm), .38, .7, 0);
    add(g, box(.42, .04, .04, M.light), -.3, .28, .1).rotation.z = .1;
    return g;
  }
  function oCatalogo() {
    var g = new THREE.Group();
    var disc = add(g, mesh(new THREE.CylinderGeometry(.82, .86, .08, 48), M.dark), 0, .04, 0);
    add(g, new THREE.Mesh(new THREE.RingGeometry(.83, .87, 64), glowMat(.6)), 0, .085, 0).rotation.x = -Math.PI / 2;
    var spin = add(g, new THREE.Group(), 0, .08, 0);
    add(spin, moto3d(ORANGE)).scale.setScalar(1.15);
    g.userData.spin = spin;
    var tag = add(g, new THREE.Group(), -.55, 1.45, .2);
    add(tag, screen(.62, .24, tex(256, 96, function (x, w, h) { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.fillStyle = '#1b232c'; x.font = '800 40px ' + SANS; x.fillText('$ 4.85M', 18, 64); }))).rotation.y = Math.PI / 4;
    g.userData.bob = tag; g.userData.bobY = 1.45;
    return g;
  }
  function bank(L) {
    var g = new THREE.Group();
    add(g, box(.9, .08, .66, M.light), 0, .04, 0);
    add(g, box(.8, .08, .58, M.white), 0, .12, 0);
    [-.3, -.1, .1, .3].forEach(function (X) { add(g, mesh(new THREE.CylinderGeometry(.045, .045, .48, 10), M.white), X, .4, .2); });
    add(g, box(.76, .48, .36, M.light), 0, .4, -.06);
    add(g, box(.86, .06, .62, M.white), 0, .67, 0);
    var s = new THREE.Shape(); s.moveTo(-.45, 0); s.lineTo(.45, 0); s.lineTo(0, .24); s.closePath();
    var pg = new THREE.ExtrudeGeometry(s, { depth: .6, bevelEnabled: false }); pg.translate(0, 0, -.3);
    add(g, mesh(pg, M.white), 0, .7, 0);
    add(g, new THREE.Mesh(new THREE.PlaneGeometry(.26, .13), new THREE.MeshBasicMaterial({ map: letterTex(L) })), 0, .78, .305);
    return g;
  }
  function oFinancieras() {
    var g = new THREE.Group();
    add(g, bank('A'), -.45, 0, .35).scale.setScalar(.8);
    add(g, bank('B'), .45, 0, .35).scale.setScalar(.8);
    add(g, bank('C'), 0, 0, -.45).scale.setScalar(.8);
    g.rotation.y = Math.PI / 4;
    return g;
  }
  function oCuota() {
    var g = new THREE.Group();
    add(g, box(.07, 1.05, .07, M.light), -.6, .52, -.05).rotation.x = .08;
    add(g, box(.07, 1.05, .07, M.light), .6, .52, -.05).rotation.x = .08;
    add(g, screen(1.62, .95, cuotaTex), 0, 1.15, .04).rotation.x = -.08;
    g.rotation.y = Math.PI / 4;
    return g;
  }
  function oPhone() {
    var g = new THREE.Group();
    add(g, box(.52, .07, .36, M.light), 0, .035, 0);
    var tilt = add(g, new THREE.Group(), 0, .07, 0); tilt.rotation.x = -.14;
    add(tilt, box(.76, 1.4, .09, M.dark), 0, .72, 0);
    add(tilt, new THREE.Mesh(new THREE.PlaneGeometry(.68, 1.3), new THREE.MeshBasicMaterial({ map: chatTex })), 0, .72, .047);
    var bubble = add(g, new THREE.Group(), .55, 1.75, .1);
    add(bubble, mesh(rbox(.5, .1, .34, .12), std(0x25D366, { emissive: 0x25D366, emissiveIntensity: .25 }))).rotation.x = Math.PI / 2;
    g.userData.bob = bubble; g.userData.bobY = 1.75;
    g.rotation.y = Math.PI / 4;
    return g;
  }
  function oVenta() {
    var g = new THREE.Group();
    add(g, mesh(rbox(1.78, .05, 1.78, .2), std(0x2a3540)), 0, 0, 0);
    var m = add(g, moto3d(ORANGE), -.05, .05, .1); m.rotation.y = Math.PI / 4;
    var tag = add(g, new THREE.Group(), 0, 1.55, 0);
    add(tag, screen(.86, .3, tex(256, 90, function (x, w, h) { x.fillStyle = '#F2801E'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffffff'; x.font = '800 44px ' + SANS; x.textAlign = 'center'; x.fillText('VENDIDA', w / 2, 62); }))).rotation.y = Math.PI / 4;
    g.userData.bob = tag; g.userData.bobY = 1.55;
    return g;
  }
  function oSheets() {
    var g = new THREE.Group();
    add(g, box(.07, 1.05, .07, M.light), -.6, .52, -.05).rotation.x = .08;
    add(g, box(.07, 1.05, .07, M.light), .6, .52, -.05).rotation.x = .08;
    add(g, screen(1.62, 1.06, sheetTex), 0, 1.2, .04).rotation.x = -.08;
    var badge = add(g, new THREE.Group(), .72, 1.95, .1);
    add(badge, mesh(rbox(.34, .08, .4, .06), std(0x0f9d58, { emissive: 0x0f9d58, emissiveIntensity: .25 }))).rotation.x = Math.PI / 2;
    g.userData.bob = badge; g.userData.bobY = 1.95;
    g.rotation.y = Math.PI / 4;
    return g;
  }
  /* ---------- centro ---------- */
  var hub = platform(3.0);
  world.add(hub);
  var plate = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), new THREE.MeshBasicMaterial({ color: 0xffe9d6, transparent: true, opacity: .92 }));
  plate.rotation.x = -Math.PI / 2; add(hub, plate, 0, TOP + .005, 0);
  var plateGlow = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), new THREE.MeshBasicMaterial({ map: glowTex, color: ORANGE, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }));
  plateGlow.rotation.x = -Math.PI / 2; add(hub, plateGlow, 0, TOP + .01, 0);
  var glass = add(hub, new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.75, 1.75), new THREE.MeshStandardMaterial({ color: 0xffd9b8, transparent: true, opacity: .1, roughness: .1, depthWrite: false })), 0, TOP + .9, 0);
  add(glass, new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.75, 1.75, 1.75)), new THREE.LineBasicMaterial({ color: 0xffc996, transparent: true, opacity: .6 })));
  var coreMat = std(0xfff3e8, { emissive: ORANGE, emissiveIntensity: .55, roughness: .3 });
  coreMat.map = dollarTex;
  var core = add(hub, mesh(new THREE.BoxGeometry(.62, .62, .62), coreMat), 0, TOP + 1.0, 0);
  var beam = add(hub, new THREE.Mesh(new THREE.CylinderGeometry(.95, .95, 2.8, 40, 1, true), new THREE.MeshBasicMaterial({ map: beamTex, color: ORANGE, transparent: true, opacity: .2, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })), 0, TOP + 1.4, 0);
  var motes = (function () {
    var n = 40, pos = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) { pos[i * 3] = (Math.random() - .5) * 1.5; pos[i * 3 + 1] = Math.random() * 1.6; pos[i * 3 + 2] = (Math.random() - .5) * 1.5; }
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return add(hub, new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffc48a, size: 2.2, sizeAttenuation: false, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false })), 0, TOP + .1, 0);
  })();

  /* ---------- bases ---------- */
  var NODES = [
    { key: 'ficha', label: 'Ficha de la moto', x: -3.8, z: 0, make: oFicha },
    { key: 'cat', label: 'Catálogo WooCommerce', x: -2.7, z: -2.8, make: oCatalogo },
    { key: 'fin', label: 'Financieras y tasas', x: 0, z: -3.8, make: oFinancieras },
    { key: 'cuota', label: 'Cuota calculada', x: 2.7, z: -2.8, make: oCuota },
    { key: 'wa', label: 'Consulta por WhatsApp', x: 3.8, z: 0, make: oPhone },
    { key: 'sheet', label: 'Planilla en Google Drive', x: 0, z: 3.8, make: oSheets },
    { key: 'venta', label: 'Venta cerrada', x: 2.8, z: 2.9, make: oVenta }
  ];
  var byKey = {};
  NODES.forEach(function (n, i) {
    n.size = 2.1;
    n.group = platform(n.size);
    n.group.position.set(n.x, 0, n.z);
    n.obj = n.make(); n.obj.position.y = TOP; n.group.add(n.obj);
    n.group.traverse(function (o) { o.userData.node = n; });
    n.delay = .25 + i * .11; n.lift = 0; n.hover = 0;
    world.add(n.group);
    var el = document.createElement('span'); el.className = 'sc-eco-lbl'; el.textContent = n.label; labelsEl.appendChild(el); n.el = el;
    byKey[n.key] = n;
  });
  hub.position.set(0, 0, 0); hub.userData.delay = 0;

  /* ---------- conexiones ---------- */
  var links = [];
  function link(a, b, dir) {
    var A = new THREE.Vector3(a.x, .04, a.z), B = new THREE.Vector3(b.x, .04, b.z);
    var len = A.distanceTo(B), g = new THREE.Group();
    g.position.copy(A); g.rotation.y = -Math.atan2(B.z - A.z, B.x - A.x);
    var core = new THREE.Mesh(new THREE.PlaneGeometry(len, .05), glowMat(.6)); core.geometry.translate(len / 2, 0, 0); core.rotation.x = -Math.PI / 2; g.add(core);
    var soft = new THREE.Mesh(new THREE.PlaneGeometry(len, .5), new THREE.MeshBasicMaterial({ map: stripTex, color: ORANGE, transparent: true, opacity: .14, blending: THREE.AdditiveBlending, depthWrite: false })); soft.geometry.translate(len / 2, 0, 0); soft.rotation.x = -Math.PI / 2; g.add(soft);
    g.scale.x = 0.0001; world.add(g);
    var l = { A: A, B: B, len: len, g: g, core: core, dir: dir, from: a, to: b, next: 1 + Math.random() * 2 };
    links.push(l); return l;
  }
  var H = { x: 0, z: 0, key: 'hub' };
  // entra: la ficha (con la moto elegida), el catálogo y las tasas; sale: la cuota, la consulta y la fila de la planilla
  ['ficha', 'cat', 'fin'].forEach(function (k) { link(H, byKey[k], -1); });
  link(H, byKey.cuota, 1); link(H, byKey.wa, 1); link(H, byKey.sheet, 1);
  link(byKey.cuota, byKey.wa, 0);
  link(byKey.wa, byKey.venta, 1);

  /* ---------- visitas que entran a la ficha ---------- */
  var adsTop = new THREE.Vector3(byKey.ficha.x, 1.25, byKey.ficha.z);
  var screenLeft = new THREE.Vector3(-1, 0, 1).normalize(), screenUp = new THREE.Vector3(-1, 0, -1).normalize();
  var streaks = [], N = 64;
  var lpos = new Float32Array(N * 6), lcol = new Float32Array(N * 6);
  for (var i = 0; i < N; i++) {
    var src = adsTop.clone().addScaledVector(screenLeft, 11 + Math.random() * 4).addScaledVector(screenUp, (Math.random() - .5) * 7);
    src.y = .2 + Math.random() * 4.2;
    var end = adsTop.clone().add(new THREE.Vector3((Math.random() - .5) * .3, (Math.random() - .5) * .5, (Math.random() - .5) * .3));
    streaks.push({ s: src, e: end, t: Math.random(), v: .25 + Math.random() * .35 });
    lpos.set([src.x, src.y, src.z, end.x, end.y, end.z], i * 6);
    lcol.set([0, 0, 0, .95, .5, .12], i * 6);
  }
  var lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.BufferAttribute(lpos, 3)); lg.setAttribute('color', new THREE.BufferAttribute(lcol, 3));
  var streakLines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: .45, blending: THREE.AdditiveBlending, depthWrite: false }));
  world.add(streakLines);
  var dotPos = new Float32Array(N * 3), dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
  var dots = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xffc48a, size: 3.2, sizeAttenuation: false, map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  world.add(dots);
  var wire = [];
  [[-6.2, 1.9, 2.4, .4], [-5.3, .9, 3.6, .3]].forEach(function (p) {
    var w = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(p[3], p[3], p[3])), new THREE.LineBasicMaterial({ color: 0xffc996, transparent: true, opacity: .55 }));
    w.position.set(p[0], p[1], p[2]); w.userData.y = p[1]; world.add(w); wire.push(w);
  });

  /* ---------- anillos y ruta ---------- */
  function ring(r, o, x, z) {
    var m = new THREE.Mesh(new THREE.RingGeometry(r, r + .025, 128), glowMat(o)); m.rotation.x = -Math.PI / 2; m.position.set(x || 0, .015, z || 0); world.add(m); return m;
  }
  ring(6.4, .07); ring(8.9, .045);
  var radar = [ring(1.4, .4, byKey.ficha.x, byKey.ficha.z), ring(1.4, .4, byKey.sheet.x, byKey.sheet.z)];
  var shadowFloor = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), new THREE.ShadowMaterial({ opacity: .32 }));
  shadowFloor.rotation.x = -Math.PI / 2; shadowFloor.receiveShadow = true; world.add(shadowFloor);
  var ROAD_X = 5.75;
  add(world, box(1.25, .04, 44, M.road), ROAD_X, .02, 0);
  for (var d = -21; d < 21; d += 1.1) add(world, new THREE.Mesh(new THREE.BoxGeometry(.06, .01, .45), new THREE.MeshBasicMaterial({ color: 0x6b7681 })), ROAD_X, .045, d);
  add(world, box(1.6, .03, .5, M.road), 4.6, .015, byKey.venta.z + .35);
  // la moto vendida sale a la ruta
  var van = moto3d(ORANGE); van.scale.setScalar(.8); van.rotation.y = Math.PI / 2; van.position.set(ROAD_X - .2, .06, 12); world.add(van);

  /* ---------- pulsos ---------- */
  var pulseMat = new THREE.SpriteMaterial({ map: glowTex, color: 0xffb36b, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  var pulses = [], hubFlash = 0;
  var packetGeo = new THREE.BoxGeometry(.16, .16, .16);
  function spawn(l) {
    var s = new THREE.Sprite(pulseMat.clone()); s.scale.set(.6, .6, 1); world.add(s);
    var p = { s: s, l: l, t: 0, v: 1.1 / (l.len / 3.8) * (.85 + Math.random() * .3) };
    if (l.dir === -1 && Math.random() < .35) { p.box = mesh(packetGeo, M.orange); world.add(p.box); }
    pulses.push(p);
  }

  /* ---------- interacción ---------- */
  var ray = new THREE.Raycaster(), mouse = new THREE.Vector2(9, 9), par = { x: 0, y: 0, tx: 0, ty: 0 }, hovered = null;
  canvas.addEventListener('pointermove', function (e) {
    var r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) / r.width * 2 - 1; mouse.y = -(e.clientY - r.top) / r.height * 2 + 1;
    par.tx = mouse.x; par.ty = mouse.y;
    if (reduce) render();
  });
  canvas.addEventListener('pointerleave', function () { mouse.set(9, 9); par.tx = par.ty = 0; });
  var pickables = []; NODES.forEach(function (n) { n.group.traverse(function (o) { if (o.isMesh && o.material.type !== 'MeshBasicMaterial') pickables.push(o); }); });

  /* ---------- tamaño ---------- */
  var W = 1, Hh = 1;
  function resize() {
    var r = stage.getBoundingClientRect(); W = Math.max(1, r.width); Hh = Math.max(1, r.height);
    renderer.setSize(W, Hh, false);
    var a = W / Hh, view = a < 1 ? 12.6 / a : 11.2;
    cam.left = -view * a / 2; cam.right = view * a / 2; cam.top = view / 2; cam.bottom = -view / 2;
    cam.updateProjectionMatrix();
  }
  window.addEventListener('resize', function () { resize(); if (reduce || !running) render(); });

  /* ---------- animación ---------- */
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function outBack(p) { var c = 1.4; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); }
  var T = reduce ? 30 : 0, last = performance.now(), running = true, raf = 0, v3 = new THREE.Vector3();

  function update(dt) {
    var intro = T;
    // entrada de las bases
    var hp = clamp(intro / .9); hub.position.y = (1 - outBack(hp)) * 6;
    NODES.forEach(function (n) {
      var p = clamp((intro - n.delay) / .85);
      n.hover += ((hovered === n ? 1 : 0) - n.hover) * Math.min(1, dt * 10);
      n.group.position.y = (1 - outBack(p)) * 6 + n.hover * .2;
      n.group.userData.rim.material.opacity = .45 + n.hover * .5;
      n.group.userData.halo.material.opacity = .1 + n.hover * .18;
      if (n.obj.userData.bob) n.obj.userData.bob.position.y = n.obj.userData.bobY + Math.sin(T * 2.2 + n.delay * 9) * .08;
      if (n.obj.userData.spin && !reduce) n.obj.userData.spin.rotation.y += dt * .6;
      if (n.obj.userData.leds) n.obj.userData.leds.forEach(function (l) { l.material.opacity = .35 + .65 * (Math.sin(T * 3 + l.userData.ph) > 0 ? 1 : .2); });
    });
    links.forEach(function (l) {
      var p = clamp((intro - 1.35) / .8); l.g.scale.x = Math.max(.0001, 1 - Math.pow(1 - p, 3));
      var lit = (hovered && (hovered === l.from || hovered === l.to)) ? 1 : 0;
      l.core.material.opacity = .45 + lit * .5;
      if (intro > 2.1 && l.dir !== 0 && !reduce) { l.next -= dt; if (l.next <= 0) { spawn(l); l.next = 1.4 + Math.random() * 2.6; } }
    });
    // centro
    core.rotation.x += dt * .5; core.rotation.y += dt * .7;
    core.position.y = TOP + 1.0 + Math.sin(T * 1.6) * .08;
    hubFlash = Math.max(0, hubFlash - dt * 2.2);
    coreMat.emissiveIntensity = .55 + hubFlash * .9;
    hubLight.intensity = 1.0 + hubFlash * 1.4 + Math.sin(T * 2) * .1;
    plateGlow.material.opacity = .5 + hubFlash * .3;
    beam.material.opacity = .16 + hubFlash * .14;
    motes.rotation.y += dt * .25;
    // tráfico
    for (var i = 0; i < N; i++) {
      var s = streaks[i]; if (!reduce) s.t += dt * s.v; if (s.t > 1) s.t -= 1;
      v3.copy(s.s).lerp(s.e, s.t * s.t);
      dotPos[i * 3] = v3.x; dotPos[i * 3 + 1] = v3.y; dotPos[i * 3 + 2] = v3.z;
    }
    dg.attributes.position.needsUpdate = true;
    wire.forEach(function (w, k) { w.rotation.x += dt * .3; w.rotation.y += dt * (.4 + k * .2); w.position.y = w.userData.y + Math.sin(T * 1.2 + k) * .15; });
    radar.forEach(function (r, k) { var q = ((T * .45 + k * .5) % 1); r.scale.setScalar(1 + q * .9); r.material.opacity = .35 * (1 - q); });
    // pulsos
    for (var j = pulses.length - 1; j >= 0; j--) {
      var p = pulses[j]; p.t += dt * p.v;
      var u = p.l.dir === -1 ? 1 - p.t : p.t;
      v3.copy(p.l.A).lerp(p.l.B, clamp(u)); v3.y = .16;
      p.s.position.copy(v3);
      p.s.material.opacity = Math.min(1, p.t * 6, (1 - p.t) * 6);
      if (p.box) { p.box.position.set(v3.x, .22 + Math.abs(Math.sin(p.t * 9)) * .05, v3.z); p.box.rotation.y += dt * 3; }
      if (p.t >= 1) {
        if (p.l.dir === -1) hubFlash = 1;
        if (p.l.to === byKey.sheet && p.l.dir === 1) { sheetRows++; drawSheet(true); }
        world.remove(p.s); p.s.material.dispose(); if (p.box) world.remove(p.box); pulses.splice(j, 1);
      }
    }
    // camioneta
    if (!reduce) { van.position.z -= dt * 1.6; if (van.position.z < -13) van.position.z = 13; }
    // parallax
    par.x += (par.tx - par.x) * Math.min(1, dt * 3); par.y += (par.ty - par.y) * Math.min(1, dt * 3);
    world.rotation.y = par.x * .07; world.position.y = par.y * .15;
  }

  function placeLabels() {
    var show = T > 1.2, touch = noHover;
    NODES.forEach(function (n) {
      v3.set(n.x + n.size * .5, n.group.position.y, n.z + n.size * .5).applyMatrix4(world.matrixWorld).project(cam);
      var px = (v3.x * .5 + .5) * W, py = (-v3.y * .5 + .5) * Hh;
      var c = new THREE.Vector3(n.x, n.group.position.y, n.z).applyMatrix4(world.matrixWorld).project(cam);
      var cx = (c.x * .5 + .5) * W;
      n.el.style.transform = 'translate(' + Math.round(cx) + 'px,' + Math.round(py + 6) + 'px) translateX(-50%)';
      n.el.style.opacity = show && (touch || hovered === n) ? 1 : 0;
      n.el.classList.toggle('on', hovered === n);
    });
  }

  function pick() {
    if (mouse.x > 2) { hovered = null; canvas.style.cursor = ''; return; }
    ray.setFromCamera(mouse, cam);
    var hit = ray.intersectObjects(pickables, false)[0];
    hovered = hit ? hit.object.userData.node : null;
    canvas.style.cursor = hovered ? 'pointer' : '';
  }

  function render() { cam.updateMatrixWorld(); world.updateMatrixWorld(); pick(); placeLabels(); renderer.render(scene, cam); }

  function frame(now) {
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    T += dt; update(dt); render();
    raf = running ? requestAnimationFrame(frame) : 0;
  }

  resize();
  function animar() {
    raf = requestAnimationFrame(frame);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        running = es[0].isIntersecting && !document.hidden;
        if (running && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
      }).observe(stage);
    }
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    });
  }
  if (reduce) {
    // con "reducir movimiento" la escena queda quieta, pero se puede reproducir a pedido
    update(0); render();
    var play = document.createElement('button'); play.type = 'button'; play.className = 'sc-eco-play';
    play.innerHTML = '<span aria-hidden="true">▶</span> Ver la animación';
    play.addEventListener('click', function () { reduce = false; play.remove(); last = performance.now(); animar(); });
    stage.appendChild(play);
  } else animar();
})();
