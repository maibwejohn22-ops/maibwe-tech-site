/* donnees — « Le chemin de vos données ».
 * Motion only (nothing essential here):
 *   1. headline words rise; the diagram reveals once (desktop: SVG wipe; phones: the wire
 *      grows); each node shows its icon and its label together as it reaches the screen;
 *   2. a glowing packet travels node to node, driven by the scroll (no time loop, WCAG 2.2.2);
 *      each node pings when the packet reaches it;
 *   3. the decorative terminal types its lines once when it comes into view.
 * Reduced motion / no JS: static diagram, no packet, full terminal text. */
AJM.register('donnees', function (api) {
  if (!api.motion) return; // reduced motion or no GSAP: static page

  var gsap = api.gsap;
  var U = api.utils;
  var diagram = api.$('.donnees__diagram');
  var svg = api.$('.donnees__svg');
  var paths = api.q('.donnees__link');
  var nodes = api.q('.donnees__node');
  var icons = nodes.map(function (n) { return n.querySelector('.donnees__icon'); });
  var texts = nodes.map(function (n) { return n.querySelector('.donnees__node-text'); });
  var pings = nodes.map(function (n) { return n.querySelector('.donnees__ping'); });
  var cleanups = [];

  /* 1. Headline + intro ---------------------------------------------------- */
  var title = api.$('#donnees-title');
  gsap.from(U.splitWords(title, { mask: true }), {
    yPercent: 110, duration: AJM.dur.reveal, ease: AJM.ease.out, stagger: 0.06,
    scrollTrigger: { trigger: title, start: 'top 85%', once: true }
  });
  gsap.from(api.q('.donnees__head .lead'), {
    y: 24, opacity: 0, duration: AJM.dur.reveal, ease: AJM.ease.out, delay: 0.15,
    scrollTrigger: { trigger: title, start: 'top 85%', once: true }
  });

  /* 2. Diagram reveal (once; created outside the breakpoint branches). The SVG only shows on
        desktop and the vertical wire only on phones: animating the hidden one costs nothing.
        Each node shows its icon and its label together, when it reaches the screen. */
  gsap.fromTo(svg, { clipPath: 'inset(0% 100% 0% 0%)' }, {
    clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8, ease: 'power2.inOut',
    scrollTrigger: { trigger: diagram, start: 'top 78%', once: true }
  });
  gsap.fromTo(api.$('.donnees__wire'), { scaleY: 0 }, {
    scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: diagram, start: 'top 75%', end: 'bottom 60%', scrub: AJM.scrub }
  });
  gsap.from([api.$('.donnees__zone-frame'), api.$('.donnees__zone-label'), api.$('.donnees__https')], {
    opacity: 0, duration: AJM.dur.reveal, ease: AJM.ease.soft, stagger: 0.12,
    scrollTrigger: { trigger: api.$('.donnees__zone'), start: 'top 85%', once: true }
  });
  nodes.forEach(function (node, i) {
    gsap.timeline({ scrollTrigger: { trigger: node, start: 'top 88%', once: true } })
      .from(icons[i], { scale: 0.5, opacity: 0, duration: 0.7, ease: AJM.ease.out }, 0)
      .from(texts[i], { y: 10, opacity: 0, duration: 0.7, ease: AJM.ease.soft }, 0.05);
  });

  /* Packet route = one array of [x, y] samples per link, in px relative to the diagram box.
     Desktop: sampled from the SVG curves; phones: straight lines between icon centres. */
  var SAMPLES = 40;
  var route = null;
  var dirty = true;
  function measure() {
    var box = diagram.getBoundingClientRect();
    var segs = [];
    if (svg && window.getComputedStyle(svg).display !== 'none') {
      var sb = svg.getBoundingClientRect();
      var k = sb.width / 1200;
      var ox = sb.left - box.left;
      var oy = sb.top - box.top;
      paths.forEach(function (path) {
        var len = path.getTotalLength();
        var pts = [];
        for (var j = 0; j <= SAMPLES; j++) {
          var p = path.getPointAtLength(len * j / SAMPLES);
          pts.push([ox + p.x * k, oy + p.y * k]);
        }
        segs.push(pts);
      });
    } else {
      var c = icons.map(function (ic) {
        var r = ic.getBoundingClientRect();
        return [r.left - box.left + r.width / 2, r.top - box.top + r.height / 2];
      });
      for (var i = 0; i < c.length - 1; i++) segs.push([c[i], c[i + 1]]);
    }
    route = segs;
    dirty = false;
  }
  function pointAt(s) {
    var n = route.length;
    s = U.clamp(s, 0, n);
    var i = Math.min(n - 1, Math.floor(s));
    var pts = route[i];
    var f = (s - i) * (pts.length - 1);
    var j = Math.min(pts.length - 2, Math.floor(f));
    var u = f - j;
    return [U.lerp(pts[j][0], pts[j + 1][0], u), U.lerp(pts[j][1], pts[j + 1][1], u)];
  }
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function () { dirty = true; });
    ro.observe(diagram);
    cleanups.push(function () { ro.disconnect(); });
  } else {
    api.listen(window, 'resize', function () { dirty = true; });
  }

  // Arrival rings: one reusable tween per node.
  var pingTweens = pings.map(function (el) {
    return gsap.fromTo(el, { scale: 1, opacity: 0.85 },
      { scale: 1.75, opacity: 0, duration: 1.1, ease: 'power2.out', paused: true, immediateRender: false });
  });

  // One packet, moved by the scroll from « Vos utilisateurs » to « Sauvegarde chiffrée »
  // (and back when scrolling up). Painted from a modifier so a jump (reload, anchor) still
  // places it correctly.
  var packet = document.createElement('span');
  packet.className = 'donnees__packet';
  packet.setAttribute('aria-hidden', 'true');
  diagram.appendChild(packet);
  var setX = gsap.quickSetter(packet, 'x', 'px');
  var setY = gsap.quickSetter(packet, 'y', 'px');
  var N = paths.length;
  var flow = { s: 0 };
  var lastNode = 0;
  function paint(sv) {
    if (dirty || !route) measure();
    var p = pointAt(sv);
    setX(p[0]);
    setY(p[1]);
    packet.style.opacity = sv > 0.04 && sv < N - 0.04 ? '1' : '0';   // hidden under the end icons
    var near = Math.round(sv);
    var at = Math.abs(sv - near) < 0.04 ? near : -1;
    if (at >= 0 && at !== lastNode && lastNode === -1) pingTweens[at].restart();
    lastNode = at;
  }
  gsap.to(flow, {
    s: N, ease: 'none', lazy: false,
    modifiers: { s: function (v) { paint(Number(v)); return v; } },
    scrollTrigger: { trigger: diagram, start: 'top 60%', end: 'bottom 40%', scrub: AJM.scrub }
  });
  cleanups.push(function () { packet.remove(); });

  /* 3. Decorative terminal: types once ------------------------------------ */
  var term = api.$('.donnees__terminal');
  var lines = api.q('.donnees__term-line');
  var saved = lines.map(function (l) { return l.innerHTML; });
  cleanups.push(function () { lines.forEach(function (l, i) { l.innerHTML = saved[i]; }); });

  var caret = document.createElement('span');
  caret.className = 'donnees__caret';
  var typing = gsap.timeline({ paused: true });
  gsap.set(lines, { opacity: 0 });
  lines.forEach(function (line) {
    var cmd = line.querySelector('.donnees__cmd');
    if (cmd) {
      var full = cmd.textContent;
      var typed = document.createElement('span');
      var ghost = document.createElement('span');
      ghost.className = 'donnees__ghost';
      ghost.textContent = full;          // reserves the final size: no layout shift
      cmd.textContent = '';
      cmd.appendChild(typed);
      cmd.appendChild(ghost);
      var proxy = { n: 0 };
      typing.set(line, { opacity: 1 }, '+=0.25');
      typing.call(function () { cmd.insertBefore(caret, ghost); });
      typing.to(proxy, {
        n: full.length, duration: full.length * 0.035, ease: 'none',
        onUpdate: function () {
          var c = Math.round(proxy.n);
          typed.textContent = full.slice(0, c);
          ghost.textContent = full.slice(c);
        }
      }, '+=0.3');
    } else if (line.classList.contains('donnees__term-line--end')) {
      typing.set(line, { opacity: 1 }, '+=0.4');
      typing.call(function () {
        line.appendChild(caret);
        caret.classList.add('donnees__caret--blink');
      });
    } else {
      typing.set(line, { opacity: 1 }, '+=0.18');
    }
  });
  gsap.from(term, {
    y: 32, opacity: 0, duration: AJM.dur.reveal, ease: AJM.ease.out,
    scrollTrigger: {
      trigger: term, start: 'top 80%', once: true,
      onEnter: function () { typing.play(); }
    }
  });

  /* 4. Commitments --------------------------------------------------------- */
  gsap.from(api.q('.donnees__promise'), {
    y: 30, opacity: 0, duration: AJM.dur.reveal, ease: AJM.ease.out, stagger: 0.08,
    scrollTrigger: { trigger: api.$('.donnees__promises'), start: 'top 82%', once: true }
  });

  return function cleanup() {
    cleanups.slice().reverse().forEach(function (fn) { fn(); });
  };
});
