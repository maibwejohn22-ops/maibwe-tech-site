/* methode — the path through the 4 steps.
   Always (also in reduced motion): the path is computed from the real position of the step
   nodes and drawn statically (ResizeObserver keeps it in sync with the layout).
   Motion only: the drawn part follows the scroll (clip-path on the « ink » SVG + a pen dot
   moved by transform), nodes light up, prompt numbers wipe from outline to filled, and the
   chapter bar shows the current step and the progress through it. */
AJM.register('methode', function (api) {
  var track = api.$('.methode__track');
  if (!track) return;
  var svgs = api.q('.methode__path');
  var basePath = api.$('.methode__path--base path');
  var inkSvg = api.$('.methode__path--ink');
  var inkPath = inkSvg && inkSvg.querySelector('path');
  var pen = api.$('.methode__pen');
  var steps = api.q('.methode__step');
  var nodes = steps.map(function (s) { return s.querySelector('.methode__node'); });
  var fills = steps.map(function (s) { return s.querySelector('.methode__num .wipe-text__fill'); });
  var endNode = api.$('.methode__end');
  var arrive = api.$('.methode__arrive');
  var journey = api.$('.methode__journey');
  var links = api.q('.methode__bar-link');
  var bars = links.map(function (a) { return a.querySelector('.methode__bar-fill'); });
  if (!basePath || !inkPath || !pen || !endNode || steps.length < 2 || nodes.some(function (n) { return !n; })) return;

  var clamp = AJM.utils.clamp;
  var live = false;
  var geo = null;
  var proxy = { p: 0 };
  var last = { y: null, cur: null, arrived: null, reached: [], fill: [], bar: [] };

  /* ---------- geometry (layout positions, transforms ignored) ------------ */
  function centerIn(el) {
    var x = el.offsetWidth / 2;
    var y = el.offsetHeight / 2;
    while (el && el !== track) {
      x += el.offsetLeft;
      y += el.offsetTop;
      el = el.offsetParent;
    }
    return el === track ? { x: x, y: y } : null;
  }
  function r1(v) { return Math.round(v * 10) / 10; }

  function build() {
    var W = track.clientWidth;
    var H = track.clientHeight;
    if (!W || !H) return;
    var pts = nodes.map(centerIn);
    var end = centerIn(endNode);
    if (!end || pts.some(function (p) { return !p; })) return;
    var all = pts.concat([end]);

    // Straight in from the top, then vertical-tangent cubic curves from node to node:
    // y only ever increases, so a horizontal clip edge reveals it like a pen stroke.
    var d = 'M' + r1(all[0].x) + ' 0L' + r1(all[0].x) + ' ' + r1(all[0].y);
    for (var i = 1; i < all.length; i++) {
      var a = all[i - 1];
      var b = all[i];
      var h = (b.y - a.y) / 2;
      d += 'C' + r1(a.x) + ' ' + r1(a.y + h) + ' ' + r1(b.x) + ' ' + r1(b.y - h) + ' ' + r1(b.x) + ' ' + r1(b.y);
    }
    svgs.forEach(function (s) { s.setAttribute('viewBox', '0 0 ' + W + ' ' + H); });
    basePath.setAttribute('d', d);
    inkPath.setAttribute('d', d);

    // Lookup table y → x for the pen (the path is monotonic in y).
    var len = inkPath.getTotalLength();
    var n = Math.max(32, Math.ceil(len / 6));
    var xs = [];
    var ys = [];
    for (var k = 0; k <= n; k++) {
      var p = inkPath.getPointAtLength((len * k) / n);
      xs.push(p.x);
      ys.push(p.y);
    }
    geo = { H: H, endY: end.y, nodeY: pts.map(function (p) { return p.y; }), xs: xs, ys: ys };
    last.y = null;
    render();
  }

  function xAt(y) {
    var ys = geo.ys;
    var lo = 0;
    var hi = ys.length - 1;
    if (y <= ys[lo]) return geo.xs[lo];
    if (y >= ys[hi]) return geo.xs[hi];
    while (hi - lo > 1) {
      var mid = (lo + hi) >> 1;
      if (ys[mid] < y) lo = mid; else hi = mid;
    }
    var t = (y - ys[lo]) / ((ys[hi] - ys[lo]) || 1);
    return geo.xs[lo] + (geo.xs[hi] - geo.xs[lo]) * t;
  }

  /* ---------- per-frame update (writes transform / clip-path only) ------ */
  function render() {
    if (!live || !geo) return;
    var y = proxy.p * geo.endY;
    if (last.y !== null && Math.abs(y - last.y) < 0.2) return;
    last.y = y;

    inkSvg.style.clipPath = 'inset(0 0 ' + Math.max(0, geo.H - y).toFixed(1) + 'px 0)';
    pen.style.transform = 'translate3d(' + xAt(y).toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';

    var cur = -1;
    for (var i = 0; i < steps.length; i++) {
      var ny = geo.nodeY[i];
      var reached = y >= ny - 2;
      if (reached) cur = i;
      if (last.reached[i] !== reached) {
        steps[i].classList.toggle('is-reached', reached);
        last.reached[i] = reached;
      }
      // The step number fills (left → right) while the pen travels past it.
      var f = Math.round(clamp((y - (ny - 150)) / 210, 0, 1) * 1000) / 10;
      if (fills[i] && last.fill[i] !== f) {
        // Fully filled = no clip at all: the tight letter-spacing makes the last digit overflow
        // its box, and a clip at the box edge would leave a sliver of outline there.
        fills[i].style.clipPath = f >= 100 ? 'none' : 'inset(0 ' + (100 - f) + '% 0 0)';
        last.fill[i] = f;
      }
      if (bars[i]) {
        var next = i + 1 < steps.length ? geo.nodeY[i + 1] : geo.endY;
        var b = Math.round(clamp((y - ny) / ((next - ny) || 1), 0, 1) * 1000) / 1000;
        if (last.bar[i] !== b) {
          bars[i].style.transform = 'scaleX(' + b + ')';
          last.bar[i] = b;
        }
      }
    }
    var arrived = y >= geo.endY - 2;
    if (arrive && last.arrived !== arrived) {
      arrive.classList.toggle('is-reached', arrived);
      if (journey) journey.classList.toggle('methode__journey--arrived', arrived);
      last.arrived = arrived;
    }
    if (last.cur !== cur) {
      last.cur = cur;
      steps.forEach(function (s, k) { s.classList.toggle('is-current', k === cur); });
      var active = Math.max(cur, 0);
      links.forEach(function (a, k) {
        if (k === active) a.setAttribute('aria-current', 'step');
        else a.removeAttribute('aria-current');
      });
    }
  }

  /* ---------- keep the path in sync with the layout ---------------------- */
  var raf = 0;
  function schedule() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(build);
  }
  var ro = null;
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(schedule);
    ro.observe(track);
  } else {
    api.listen(window, 'resize', schedule);
  }
  build();
  api.onCleanup(function () {
    cancelAnimationFrame(raf);
    if (ro) ro.disconnect();
  });

  if (!api.motion) return;

  /* ---------- motion ------------------------------------------------------ */
  var gsap = api.gsap;
  live = true;
  api.el.classList.add('methode--live');
  api.onCleanup(function () {
    live = false;
    api.el.classList.remove('methode--live');
    inkSvg.style.clipPath = '';
    pen.style.transform = '';
    fills.forEach(function (f) { if (f) f.style.clipPath = ''; });
    bars.forEach(function (b) { if (b) b.style.transform = ''; });
    steps.forEach(function (s) { s.classList.remove('is-reached', 'is-current'); });
    if (arrive) arrive.classList.remove('is-reached');
    if (journey) journey.classList.remove('methode__journey--arrived');
    links.forEach(function (a) { a.removeAttribute('aria-current'); });
    last = { y: null, cur: null, arrived: null, reached: [], fill: [], bar: [] };
  });

  // The pen sits on a line at 60 % of the viewport: it starts when the track's top reaches
  // that line and arrives when the end node does (scrubbed, native scrolling).
  // Rendered from a modifier rather than onUpdate: when ScrollTrigger jumps the progress with
  // events suppressed (reload mid-page, refresh), the drawing still follows.
  gsap.to(proxy, {
    p: 1,
    ease: 'none',
    lazy: false,
    modifiers: { p: function (v) { proxy.p = Number(v); render(); return v; } },
    scrollTrigger: {
      trigger: track,
      start: 'top 60%',
      endTrigger: endNode,
      end: 'center 60%',
      scrub: AJM.scrub
    }
  });
  render();

  // Quiet reveals, once.
  steps.forEach(function (s) {
    gsap.from(s.querySelectorAll('.methode__body > *'), {
      y: 30, opacity: 0, duration: AJM.dur.reveal, ease: AJM.ease.out, stagger: 0.07,
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: s, start: 'top 82%', once: true }
    });
  });
  var faqs = api.q('.methode__faq');
  if (faqs.length) {
    gsap.from(faqs, {
      y: 24, opacity: 0, duration: AJM.dur.reveal, ease: AJM.ease.out, stagger: 0.06,
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: api.$('.methode__faqs'), start: 'top 85%', once: true }
    });
  }
});
