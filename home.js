/* Home page: avatar faces, hero shader, headline fit, intro, bouncy labels */
(function () {
  const reduced = window.JJ && window.JJ.reduced;
  const SETTINGS = { gravity: 2, bounce: 0.12, shader: true };
  const hero = document.querySelector('.hero');
  const layer = document.querySelector('.tags');
  const canvas = document.querySelector('.hero canvas.gl');

  /* ---------- avatar faces: smile, wink, surprised, kiss, laugh ---------- */
  const faces = Array.prototype.slice.call(document.querySelectorAll('.avatar .face'));
  let face = 0;
  setInterval(() => {
    if (!faces.length) return;
    faces[face].classList.remove('on');
    face = (face + 1) % faces.length;
    faces[face].classList.add('on');
  }, 1600);

  /* ---------- WebGL hero background ---------- */
  function initShader() {
    const c = canvas; if (!c) return;
    const gl = c.getContext('webgl', { antialias: false, premultipliedAlpha: false, alpha: false });
    if (!gl) return;
    const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fs = [
      'precision mediump float;',
      'uniform vec2 r;uniform float t;uniform vec2 m;uniform float on;uniform float dk;',
      'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
      'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
      'return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
      'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}',
      'void main(){',
      ' vec2 uv=gl_FragCoord.xy/r;vec2 q=uv*vec2(r.x/r.y,1.);',
      ' float tt=t*on;',
      ' vec2 w=vec2(fbm(q*1.4+vec2(tt*.035,-tt*.02)),fbm(q*1.4+vec2(5.2,1.3)-tt*.03));',
      ' float f=fbm(q*1.6+w*1.8);',
      ' vec3 cream=mix(vec3(.980,.957,.890),vec3(.141,.063,.067),dk);vec3 butter=mix(vec3(.950,.900,.840),vec3(.235,.090,.098),dk);vec3 blush=mix(vec3(.935,.875,.825),vec3(.200,.075,.082),dk);',
      ' vec3 col=cream;',
      ' col=mix(col,butter,smoothstep(.52,.86,f)*.55);',
      ' col=mix(col,blush,smoothstep(.58,.9,fbm(q*1.1-w+tt*.02+3.))*.38);',
      ' vec2 mm=m*vec2(r.x/r.y,1.);float d=length(q-mm);',
      ' col=mix(col,butter,exp(-d*d*9.)*.55);',
      ' col=mix(col,cream,smoothstep(.55,1.,uv.y)*.35);',
      ' col+=(h(gl_FragCoord.xy+fract(t)*91.)-.5)*.045;',
      ' gl_FragColor=vec4(col,1.);',
      '}'
    ].join('\n');
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't'), uM = gl.getUniformLocation(pr, 'm'), uOn = gl.getUniformLocation(pr, 'on'), uDk = gl.getUniformLocation(pr, 'dk');
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const size = () => { c.width = Math.max(1, c.clientWidth * dpr * 0.75); c.height = Math.max(1, c.clientHeight * dpr * 0.75); gl.viewport(0, 0, c.width, c.height); };
    new ResizeObserver(size).observe(c); size();
    const mouse = { x: 0.7, y: 0.6, tx: 0.7, ty: 0.6 };
    window.addEventListener('pointermove', (e) => { const r = c.getBoundingClientRect(); mouse.tx = (e.clientX - r.left) / r.width; mouse.ty = 1 - (e.clientY - r.top) / r.height; }, { passive: true });
    let visible = true;
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(c);
    let dkv = document.documentElement.getAttribute('data-theme') === 'dark' ? 1 : 0;
    const t0 = performance.now();
    const draw = (now) => {
      requestAnimationFrame(draw);
      if (!visible) return;
      const on = SETTINGS.shader && !reduced ? 1 : 0;
      mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;
      dkv += ((document.documentElement.getAttribute('data-theme') === 'dark' ? 1 : 0) - dkv) * 0.08;
      gl.uniform2f(uR, c.width, c.height); gl.uniform1f(uT, (now - t0) / 1000); gl.uniform2f(uM, mouse.x, mouse.y); gl.uniform1f(uOn, on); gl.uniform1f(uDk, dkv);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    requestAnimationFrame(draw);
  }

  /* ---------- fit the headline: "Product Designer" on one line, clear of the label pile ---------- */
  function fitHeadline() {
    const h1 = document.querySelector('.headline'), l2 = document.querySelector('.headline .l2 .ln-i');
    if (!h1 || !l2 || !hero) return;
    const run = () => {
      h1.style.fontSize = '100px';
      const w100 = l2.offsetWidth, h100 = h1.offsetHeight;
      if (!w100 || !h100) return;
      let area = 0, tallest = 0;
      hero.querySelectorAll('.tag').forEach((t) => {
        area += (t.offsetWidth + 16) * (t.offsetHeight + 16);
        tallest = Math.max(tallest, t.offsetHeight + 16);
      });
      const W = hero.clientWidth || window.innerWidth;
      const pile = Math.max(tallest * 2, (area / W) * 1.6) + 20;
      const vh = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
      const heroRect = hero.getBoundingClientRect();
      const heroTop = heroRect.top + window.scrollY;
      const top = h1.getBoundingClientRect().top - heroRect.top;
      const avail = (vh - heroTop) - pile - top - 16;
      const narrow = W < 700;
      const byWidth = (100 * h1.clientWidth * (narrow ? 0.92 : 0.78)) / w100;
      const byHeight = (100 * avail * 0.9) / h100;
      h1.style.fontSize = Math.max(24, Math.min(156, byWidth, byHeight)) + 'px';
    };
    run();
    let raf;
    const onResize = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(run); };
    window.addEventListener('resize', onResize);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', onResize);
  }

  /* ---------- intro fade ---------- */
  function initIntro() {
    const gsap = window.gsap; if (!gsap || reduced) return;
    gsap.from(document.querySelectorAll('.hero .ln-i'), { opacity: 0, filter: 'blur(8px)', duration: 1.6, stagger: 0.35, ease: 'power2.out', clearProps: 'filter' });
  }

  /* ---------- Matter.js draggable labels ---------- */
  let physTries = 0;
  function initPhysics() {
    const M = window.Matter;
    if (!M || !hero || !layer) return;
    const probe = layer.querySelector('.tag');
    if (!probe || probe.offsetHeight < 24 || getComputedStyle(probe).position !== 'absolute') {
      if (++physTries < 180) requestAnimationFrame(initPhysics);
      return;
    }
    const els = Array.prototype.slice.call(layer.querySelectorAll('.tag'));
    const engine = M.Engine.create();
    engine.gravity.y = SETTINGS.gravity;
    engine.positionIterations = 16; engine.velocityIterations = 12; engine.constraintIterations = 4;
    let W = hero.clientWidth, H = hero.clientHeight;
    const T = 400, G = 16;
    const opts = { isStatic: true, friction: 0.4 };
    const floorY = () => {
      const vh = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
      const heroTop = hero.getBoundingClientRect().top + window.scrollY;
      return Math.max(160, Math.min(H, vh - heroTop));
    };
    let F = floorY();
    const ground = M.Bodies.rectangle(W / 2, F + T / 2, W * 4, T, opts);
    const left = M.Bodies.rectangle(-T / 2, 0, T, H * 6, opts);
    const right = M.Bodies.rectangle(W + T / 2, 0, T, H * 6, opts);
    const ceil = M.Bodies.rectangle(W / 2, -H * 1.2 - T / 2, W * 4, T, opts);
    M.Composite.add(engine.world, [ground, left, right, ceil]);

    const makeBody = (el, x, y, angle) => {
      const w = el.offsetWidth, h = el.offsetHeight;
      const b = M.Bodies.rectangle(x, y, w + G, h + G, {
        chamfer: { radius: (h + G) / 2 - 1 }, restitution: SETTINGS.bounce, friction: 0.7, frictionStatic: 1.2,
        frictionAir: 0.022, density: 0.005, angle: angle, slop: 0.005
      });
      M.Body.setInertia(b, b.inertia * 5);
      b.el = el; b.w = w; b.h = h;
      return b;
    };
    // spread across the full width in shuffled rows above the screen
    const order = els.slice().sort(() => Math.random() - 0.5);
    const rows = [[]]; let rowW = 0;
    order.forEach((el) => {
      const w = el.offsetWidth + G * 2;
      if (rowW + w > W - G * 2 && rows[rows.length - 1].length) { rows.push([]); rowW = 0; }
      rows[rows.length - 1].push(el); rowW += w;
    });
    const spawn = new Map();
    const rowH = Math.max.apply(null, els.map((el) => el.offsetHeight)) + G * 2;
    rows.forEach((row, r) => {
      const total = row.reduce((s, el) => s + el.offsetWidth, 0);
      const gap = (W - total) / (row.length + 1);
      let x = gap;
      row.forEach((el) => {
        const w = el.offsetWidth;
        spawn.set(el, { x: x + w / 2, y: -rowH * (r + 1) - Math.random() * 30 });
        x += w + gap;
      });
    });
    let bodies = els.map((el) => { const p = spawn.get(el); return makeBody(el, p.x, p.y, (Math.random() - 0.5) * 0.6); });
    M.Composite.add(engine.world, bodies);
    // release each label at a random moment within ~2s
    bodies.forEach((b) => { M.Body.setStatic(b, true); setTimeout(() => { if (b.isStatic) M.Body.setStatic(b, false); }, 900 + Math.random() * 1800); });
    // keep bodies matched to label size
    const tagRO = new ResizeObserver(() => {
      bodies = bodies.map((b) => {
        if (Math.abs(b.el.offsetWidth - b.w) < 2 && Math.abs(b.el.offsetHeight - b.h) < 2) return b;
        const nb = makeBody(b.el, b.position.x, b.position.y - 4, b.angle);
        M.Body.setVelocity(nb, b.velocity);
        M.Composite.remove(engine.world, b); M.Composite.add(engine.world, nb);
        return nb;
      });
    });
    els.forEach((el) => tagRO.observe(el));
    const bodyOf = (el) => bodies.find((x) => x.el === el);

    // ---- project labels: preview card, burgundy screen, drop circle, bloom into the case study
    const dz = hero.querySelector('.veil');
    const peekState = { el: null, card: null, held: false };
    const center = () => { const r = hero.getBoundingClientRect(); return { x: window.innerWidth / 2 - r.left, y: window.innerHeight / 2 - r.top }; };
    const positionPeek = () => {
      const b = bodyOf(peekState.el), card = peekState.card; if (!b || !card) return;
      const cw = card.offsetWidth, ch = card.offsetHeight;
      let x = b.position.x - cw / 2, y = b.position.y - b.h / 2 - ch - 14;
      if (y < 8) y = b.position.y + b.h / 2 + 14;
      x = Math.max(8, Math.min(W - cw - 8, x));
      card.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    };
    const hidePeek = (now) => {
      const card = peekState.card; if (!card) return;
      peekState.el = null; peekState.card = null;
      const inner = card.firstElementChild;
      if (window.gsap && !now) window.gsap.to(inner, { scale: 0.25, opacity: 0, duration: 0.25, ease: 'power2.in', overwrite: true, onComplete: () => { if (peekState.card !== card) card.style.visibility = 'hidden'; } });
      else { inner.style.opacity = 0; card.style.visibility = 'hidden'; }
    };
    const showPeek = (el) => {
      const id = el.getAttribute('data-proj'); if (!id) return;
      const card = hero.querySelector('.peek[data-proj="' + id + '"]'); if (!card) return;
      if (peekState.card === card) return;
      if (peekState.card) hidePeek(true);
      peekState.el = el; peekState.card = card; positionPeek();
      card.style.visibility = 'visible';
      if (window.gsap) window.gsap.fromTo(card.firstElementChild, { scale: 0.25, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.7)', overwrite: true });
      else card.firstElementChild.style.opacity = 1;
    };
    const zoneR = () => { const ring = dz && dz.querySelector('.ring'); return ring ? ring.offsetWidth / 2 + 10 : 120; };
    const inZone = (el) => { const b = bodyOf(el); if (!b) return false; const c = center(); return Math.hypot(b.position.x - c.x, b.position.y - c.y) < zoneR(); };
    const showDZ = (on) => {
      if (!dz) return;
      if (on) hero.setAttribute('data-holding', '');
      else setTimeout(() => { if (!peekState.held) hero.removeAttribute('data-holding'); }, 380);
      dz.setAttribute('data-on', on ? '1' : '0');
      if (!on) dz.removeAttribute('data-hot');
    };
    const go = (el) => {
      const link = document.querySelector('a.sr[data-proj="' + el.getAttribute('data-proj') + '"]');
      hidePeek(true);
      const gsap = window.gsap, burst = dz && dz.querySelector('.burst');
      const nav = () => { if (link) window.location.href = link.href; };
      if (!burst || !gsap || reduced) { nav(); return; }
      gsap.to(el, { opacity: 0, duration: 0.2 });
      const s = (Math.hypot(window.innerWidth, window.innerHeight) / burst.offsetWidth) * 1.1;
      gsap.set(burst, { xPercent: -50, yPercent: -50, scale: 1.1, visibility: 'visible' });
      gsap.to(burst, { scale: s, duration: 0.85, ease: 'expo.inOut', onComplete: nav });
    };
    // coming back with the browser's back button: reset the bloom
    window.addEventListener('pageshow', (e) => {
      if (!e.persisted) return;
      const burst = dz && dz.querySelector('.burst');
      if (burst && window.gsap) window.gsap.set(burst, { scale: 1, visibility: 'hidden' });
      els.forEach((el) => { el.style.opacity = ''; });
      showDZ(false);
    });
    const projDown = (el) => { if (!el.getAttribute('data-proj')) return; peekState.held = true; showPeek(el); showDZ(true); };
    const projMove = (el) => { if (!peekState.held || !dz || !el.getAttribute('data-proj')) return; if (inZone(el)) dz.setAttribute('data-hot', el.getAttribute('data-proj')); else dz.removeAttribute('data-hot'); };
    const projUp = (el) => {
      if (!el.getAttribute('data-proj')) return;
      peekState.held = false;
      if (inZone(el)) { go(el); return; }
      showDZ(false);
      if (!el.matches(':hover')) hidePeek();
    };

    // pointer drag (heavy feel)
    let drag = null;
    const toLocal = (e) => { const r = hero.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    els.forEach((el) => {
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const p = toLocal(e), cur = bodyOf(el); if (!cur) return;
        const c = M.Constraint.create({ pointA: p, bodyB: cur, pointB: { x: p.x - cur.position.x, y: p.y - cur.position.y }, stiffness: 0.035, damping: 0.25, length: 0 });
        M.Composite.add(engine.world, c);
        drag = { c: c, el: el };
        try { el.setPointerCapture(e.pointerId); } catch (err) {}
        el.setAttribute('data-held', '');
        projDown(el);
        if (window.gsap) window.gsap.to(el, { scale: 1.06, duration: 0.25 });
      });
      el.addEventListener('pointermove', (e) => { if (drag && drag.el === el) { drag.c.pointA = toLocal(e); projMove(el); } });
      const up = () => {
        const wasHeld = el.hasAttribute('data-held');
        el.removeAttribute('data-held');
        if (wasHeld) projUp(el);
        if (drag && drag.el === el) {
          M.Composite.remove(engine.world, drag.c); drag = null;
          const cur = bodyOf(el);
          if (cur) { M.Body.setVelocity(cur, { x: cur.velocity.x * 0.55, y: cur.velocity.y * 0.55 }); M.Body.setAngularVelocity(cur, cur.angularVelocity * 0.4); }
          if (window.gsap) window.gsap.to(el, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
        }
      };
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && !peekState.held) showPeek(el); });
      el.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !peekState.held && peekState.el === el) hidePeek(); });
    });

    // keep the walls and floor matched to the screen
    const fit = () => {
      W = hero.clientWidth; H = hero.clientHeight; F = floorY();
      M.Body.setPosition(ground, { x: W / 2, y: F + T / 2 });
      M.Body.setPosition(right, { x: W + T / 2, y: 0 });
      M.Body.setPosition(ceil, { x: W / 2, y: -H * 1.2 - T / 2 });
      bodies.forEach((b) => {
        if (b.position.x > W - b.w / 2) M.Body.setPosition(b, { x: W - b.w / 2 - 4, y: b.position.y });
        if (b.position.y > F - b.h / 2) M.Body.setPosition(b, { x: b.position.x, y: F - b.h - G });
      });
    };
    new ResizeObserver(fit).observe(hero);
    window.addEventListener('resize', fit);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', fit);
    let visible = true;
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(hero);

    let last = performance.now();
    const loop = (now) => {
      requestAnimationFrame(loop);
      if (!visible) { last = now; return; }
      const dt = Math.min(1000 / 30, now - last); last = now;
      M.Engine.update(engine, dt);
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        b.el.style.transform = 'translate(' + (b.position.x - b.w / 2) + 'px,' + (b.position.y - b.h / 2) + 'px) rotate(' + b.angle + 'rad)';
      }
      if (peekState.card) positionPeek();
    };
    setTimeout(() => requestAnimationFrame(loop), reduced ? 0 : 900);
  }

  initShader();
  const ready = document.fonts && document.fonts.load
    ? Promise.race([
        Promise.all([document.fonts.load('40px "Instrument Serif"'), document.fonts.load('40px "Young Serif"')]).then(() => document.fonts.ready),
        new Promise((r) => setTimeout(r, 2500))
      ])
    : Promise.resolve();
  /* ---------- hero headline: letters lift toward the cursor ---------- */
  function initHeroHover() {
    const gsap = window.gsap, hero = document.querySelector('.hero');
    if (!gsap || !hero || reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (!document.getElementById('jj-ch-style')) {
      const st = document.createElement('style'); st.id = 'jj-ch-style';
      st.textContent = '.headline .wd{display:inline-block;white-space:nowrap}.headline .ch{display:inline-block;will-change:transform;transform-origin:50% 80%}';
      document.head.appendChild(st);
    }
    const qs = Array.prototype.slice.call(hero.querySelectorAll('.headline .ch')).map((el) => ({
      el: el,
      y: gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3.out' }),
      r: gsap.quickTo(el, 'rotate', { duration: 0.55, ease: 'power3.out' }),
      s: gsap.quickTo(el, 'scale', { duration: 0.55, ease: 'power3.out' })
    }));
    if (!qs.length) return;
    const R = 220;
    const move = (e) => {
      for (const q of qs) {
        const b = q.el.getBoundingClientRect(), fs = b.height || 40;
        const cx = b.left + b.width / 2, cy = b.top + b.height / 2 - (gsap.getProperty(q.el, 'y') || 0);
        const dx = cx - e.clientX, dy = cy - e.clientY, d = Math.hypot(dx, dy);
        let t = Math.max(0, 1 - d / R); t = t * t * (3 - 2 * t);
        q.y(-0.12 * fs * t); q.r((dx / R) * 8 * t); q.s(1 + 0.05 * t);
      }
    };
    const leave = () => { for (const q of qs) { q.y(0); q.r(0); q.s(1); } };
    hero.addEventListener('pointermove', move);
    hero.addEventListener('pointerleave', leave);
  }

  ready.then(() => { fitHeadline(); initIntro(); initPhysics(); initHeroHover(); });
})();
