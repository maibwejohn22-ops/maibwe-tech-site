/* pile.js — « La pile » : the pinned exploded view (DESIGN.md § 9.2).
 *
 *  Reduced motion / no GSAP: nothing runs; CSS shows the static exploded diagram + chapters.
 *  < 900 px: the diagram opens once when it enters the screen; chapters rise once.
 *  ≥ 900 px: .pile--live → the visual is sticky (CSS) and the story is scrubbed:
 *    1 « Votre idée »    the layers are pressed together: one solid app
 *    2 « Les couches »   the layers separate, then one layer at a time is lit (label + list row)
 *    3 « Le lancement »  the layers close again; beams and store badges light up, a sheen crosses the screen
 *    4 « Le suivi »      the light calms down; a short pulse (≈ 4 s, stops by itself — WCAG 2.2.2)
 *    outro               a cream dome rises and becomes full-bleed (clip-path wipe into « services »)
 */
AJM.register('pile', function (api) {
  if (!api.motion) return;

  var gsap = api.gsap;
  var el = api.el;
  var GAP = 120, THICK = 10, BOX_H = 900;   // stack-box units, see pile.css (exploded gap, plate thickness)

  var layers = api.q('.pile__layer');       // top (k = 0, the screen) → bottom (k = 4, the server)
  var inners = api.q('.pile__layer-in');
  // yPercent of a layer's inner box: 0 = exploded (CSS position), closedY = pressed together.
  function closedY(i, node) {
    return (Number(node.parentNode.getAttribute('data-k')) - 2) * (THICK - GAP) / BOX_H * 100;
  }

  // Headline and outro statement: words rise once.
  [['#pile-title', '#pile-title'], ['.pile__statement', '.pile__statement']].forEach(function (pair) {
    var words = api.utils.splitWords(api.$(pair[0]), { mask: true });
    gsap.from(words, {
      yPercent: 110, duration: AJM.dur.reveal, ease: AJM.ease.out, stagger: 0.06,
      scrollTrigger: { trigger: api.$(pair[1]), start: 'top 80%', once: true }
    });
  });

  // Chapters: text rises once, when it actually comes into view. On desktop the text of
  // chapter 2 waits until the exploded stack has slid aside (see « explode » below), so the
  // two never overlap.
  // Created once, outside the breakpoint branches (a « once » trigger created inside a
  // matchMedia branch while the page is scrolled past it can break ScrollTrigger's refresh);
  // the start is a function, re-read at every refresh.
  var desktopMQ = window.matchMedia('(min-width: 900px)');
  api.q('.pile__chapter-in').forEach(function (inner, k) {
    gsap.fromTo(inner, { y: 32, opacity: 0 }, {
      y: 0, opacity: 1, duration: AJM.dur.reveal, ease: AJM.ease.out,
      scrollTrigger: {
        trigger: inner, once: true,
        start: function () { return desktopMQ.matches && k === 1 ? 'top 40%' : 'top 85%'; }
      }
    });
  });

  /* ---- Phones and tablets: no pinning, the diagram opens once. ---- */
  api.mm.add('(max-width: 899.98px)', function () {
    // fromTo, not from: never let GSAP read a start value from the live CSS state.
    gsap.timeline({ scrollTrigger: { trigger: api.$('.pile__stack'), start: 'top 72%', once: true } })
      .fromTo(inners, { yPercent: closedY }, { yPercent: 0, duration: AJM.dur.big, ease: AJM.ease.out, stagger: 0.05 })
      .fromTo(api.q('.pile__label'), { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: AJM.dur.ui, ease: AJM.ease.soft, stagger: 0.07 }, 0.55);
  });

  /* ---- Desktop: the sticky story. ---- */
  api.mm.add('(min-width: 900px)', function () {
    el.classList.add('pile--live');
    var ST = api.ScrollTrigger;
    var scrub = AJM.scrub;
    var stage = api.$('.pile__stage');
    var ch = api.q('.pile__chapter');
    var rows = api.q('.pile__row');
    var glow = api.$('.pile__glow');
    var beams = api.$('.pile__beams');
    var underHeader = function () { return 'top ' + AJM.headerHeight() + 'px'; };

    // 0. The stack settles as the stage arrives.
    var stack = api.$('.pile__stack');
    gsap.fromTo(stack, { yPercent: 10, scale: 0.94 }, {
      yPercent: 0, scale: 1, ease: 'none',
      scrollTrigger: { trigger: stage, start: 'top bottom', end: underHeader, scrub: scrub }
    });

    // 1. Pressed together → exploded, while chapter 2 arrives (its text only shows at the end).
    // How far the exploded stack slides left so that its right tip clears the (wider) chapter 2 text.
    var ch2Text = ch[1].querySelector('.pile__chapter-in');
    function shiftX() {
      var w = stack.offsetWidth;
      var target = ch2Text.getBoundingClientRect().left - 32 + 0.055 * w;   // the plates' right tips are at 94.5 % of the box
      return Math.min(0, target - (stack.offsetLeft + w));
    }
    var explode = { trigger: ch[1], start: 'top 85%', end: 'top 35%', scrub: scrub, invalidateOnRefresh: true };
    gsap.fromTo(inners, { yPercent: closedY }, { yPercent: 0, ease: 'none', scrollTrigger: explode });
    // …and slides a little to the left, to leave room for the list of layers on the right.
    gsap.fromTo(stack, { x: 0 }, { x: shiftX, ease: 'none', immediateRender: false, scrollTrigger: explode });

    // 2. One layer at a time, from the screen down to the server.
    var current = -2;
    function setActive(idx) {
      if (idx === current) return;
      current = idx;
      el.classList.toggle('pile--focus', idx >= 0);
      layers.forEach(function (layer) {
        var k = Number(layer.getAttribute('data-k'));
        layer.classList.toggle('is-active', k === idx);
        layer.classList.toggle('is-shown', idx >= 0 && k <= idx);
      });
      rows.forEach(function (row) {
        row.classList.toggle('is-active', Number(row.getAttribute('data-k')) === idx);
      });
    }
    function indexOf(self) { return self.isActive ? Math.min(4, Math.floor(self.progress * 5)) : -1; }
    ST.create({
      trigger: ch[1], start: 'top 22%', end: 'bottom 97%',
      onUpdate: function (self) { setActive(indexOf(self)); },
      onToggle: function (self) { setActive(indexOf(self)); }
    });

    // 3. One solid app again, then the launch. The layers close while the stack is still aside
    //    (the list of chapter 2 is still on screen); it only glides back to the centre once that
    //    list has scrolled above it, and the launch lights up while chapter 3 is read.
    var reclose = { trigger: ch[2], start: 'top 80%', end: 'top 45%', scrub: scrub };
    gsap.fromTo(inners, { yPercent: 0 }, { yPercent: closedY, ease: 'none', immediateRender: false, scrollTrigger: reclose });
    gsap.fromTo(stack, { x: shiftX }, {
      x: 0, ease: 'none', immediateRender: false,
      scrollTrigger: { trigger: ch[2], start: 'top 45%', end: 'top 15%', scrub: scrub, invalidateOnRefresh: true }
    });
    gsap.timeline({ scrollTrigger: { trigger: ch[2], start: 'top 30%', end: 'top -10%', scrub: scrub } })
      .fromTo(api.$('.pile__sheen span'), { xPercent: -100 }, { xPercent: 100, ease: 'none', duration: 0.8 }, 0)
      .fromTo(beams, { clipPath: 'inset(48% 0% 52% 0%)' }, { clipPath: 'inset(0% 0% 52% 0%)', ease: 'none', duration: 0.7 }, 0.1)
      .fromTo(glow, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.6 }, 0.1)
      .fromTo(api.q('.pile__badge'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, ease: 'none', duration: 0.3, stagger: 0.18 }, 0.35)
      .fromTo(api.q('.pile__badge-on'), { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.25, stagger: 0.18 }, 0.6);

    // 4. Follow-up: the launch light calms down; a short pulse plays, then stops by itself.
    gsap.fromTo([glow, beams], { opacity: 1 }, {
      opacity: 0.3, ease: 'none', immediateRender: false,
      scrollTrigger: { trigger: ch[3], start: 'top 90%', end: 'top 45%', scrub: scrub }
    });
    var rings = api.q('.pile__ring');
    var pulse = gsap.timeline({ paused: true })
      .fromTo(rings, { scale: 0.72 }, { scale: 1.1, duration: 2.8, ease: 'power2.out', stagger: 0.7 }, 0)
      .fromTo(rings, { opacity: 0 }, { opacity: 0.5, duration: 0.5, ease: 'power1.out', stagger: 0.7 }, 0)
      .to(rings, { opacity: 0, duration: 2.3, ease: 'power1.in', stagger: 0.7 }, 0.5);
    ST.create({
      trigger: ch[3], start: 'top 60%', end: 'bottom 30%',
      onEnter: function () { pulse.restart(); },
      onEnterBack: function () { pulse.restart(); },
      onLeave: function () { pulse.pause(0); },
      onLeaveBack: function () { pulse.pause(0); }
    });

    // 5. Outro: a cream dome (a half-disc) rises from under the stack, widens to the full
    //    screen, then flattens into a full-bleed cream page that flows into « services ».
    //    The whole outro is clipped (cream + statement), so the navy statement only ever sits
    //    on cream. The clip string is written by hand: GSAP cannot interpolate clip-path
    //    strings whose computed form drops the radii (« inset(0%) »). At the end the clip is
    //    removed, so no anti-aliased edge is left at the seam with « services ».
    //    Painted from a modifier, not onUpdate: when the page jumps past the outro (reload
    //    mid-page, refresh), ScrollTrigger sets the progress with events suppressed, and an
    //    onUpdate-driven clip would stay frozen half-open. Modifiers run on every render.
    var outro = api.$('.pile__outro');
    var dome = { p: 0 };
    function paintDome(p) {
      if (p >= 0.999) { outro.style.clipPath = 'none'; return; }
      var widen = Math.min(1, p / 0.7);                      // 0 → 1: the dome widens
      var flat = Math.max(0, (p - 0.7) / 0.3);              // 0 → 1: the dome flattens
      var side = (32 * (1 - widen)).toFixed(2) + '%';
      var r = ((18 + 32 * widen) * (1 - flat * flat)).toFixed(2) + 'vw';
      outro.style.clipPath = 'inset(0% ' + side + ' 0% ' + side + ' round ' + r + ' ' + r + ' 0vw 0vw)';
    }
    paintDome(0);
    gsap.to(dome, {
      p: 1, ease: 'none', lazy: false,
      modifiers: { p: function (v) { paintDome(Number(v)); return v; } },
      scrollTrigger: { trigger: outro, start: 'top bottom', end: 'top 20%', scrub: scrub }
    });

    return function () {
      setActive(-1);
      el.classList.remove('pile--live', 'pile--focus');
      outro.style.clipPath = '';
    };
  });
});
