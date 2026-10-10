/* hero — the intro is pure CSS (css/hero.css). Here, motion only:
 *   1. phone: real screenshots replace each other with a clip-path wipe + app name chip;
 *   2. glyphs float on slow out-of-phase loops (a gentle orbit);
 *   3. pause button (WCAG 2.2.2) + loops pause off screen / in a hidden tab;
 *   4. desktop: scrubbed on scroll, the object turns into the shared iso angle of the « pile »;
 *   5. desktop with a mouse: the object leans toward the pointer, glyph layers drift by depth.
 * Reduced motion / no GSAP: nothing runs, the pause button stays hidden, the page is static. */
AJM.register('hero', function (api) {
  if (!api.motion) return;

  var gsap = api.gsap;
  var el = api.el;
  var visual = api.$('.hero__visual');
  var pauseBtn = api.$('.hero__pause');
  var loops = [];
  var userPaused = false;

  /* 0. Phones: the object sits below the fold, so its CSS intro (settle + glyph burst)
        is held until it scrolls into view instead of playing unseen. */
  if (visual.getBoundingClientRect().top > window.innerHeight * 0.8) {
    el.classList.add('hero--defer');
    var stopDefer = api.utils.inView(visual, function () { el.classList.remove('hero--defer'); },
      { rootMargin: '0px 0px -25% 0px' });
    api.onCleanup(function () { stopDefer(); el.classList.remove('hero--defer'); });
  }

  /* 1. Phone screen cycle: Église Connect, Campus RDC, VillageMap RDC, TELEPromptCam Pro, and
        back. Each next screen wipes up from the bottom; to come back to the first one (the
        bottom of the stack), the last screen is wiped away the same way. The chip's name list
        ends with a copy of the first name, so its loop is seamless. */
  var screens = api.q('.hero__screen');
  var names = api.$('.hero__chip-names');
  var bar = api.$('.hero__chip-bar');
  if (screens.length > 1 && names && bar) {
    // Hidden screens are clipped, so lazy loading would only start during their wipe.
    screens.forEach(function (img) { img.loading = 'eager'; });
    var HOLD = 3.6;
    var WIPE = 1.1;
    var HIDDEN = 'inset(100% 0% 0% 0%)';
    var SHOWN = 'inset(0% 0% 0% 0%)';
    var GONE = 'inset(0% 0% 100% 0%)';
    var n = screens.length;
    var nNames = names.children.length;
    var cycle = gsap.timeline({ repeat: -1, paused: true });
    cycle.set(screens.slice(1), { clipPath: HIDDEN }, 0).set(names, { yPercent: 0 }, 0);
    for (var k = 0; k < n; k++) {
      var t = k * HOLD;
      var at = t + HOLD - WIPE;
      cycle.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: HOLD - 0.2, ease: 'none' }, t);
      if (k < n - 1) {
        cycle.fromTo(screens[k + 1], { clipPath: HIDDEN },
          { clipPath: SHOWN, duration: WIPE, ease: 'expo.inOut', immediateRender: false }, at);
      } else {
        cycle.set(screens.slice(1, n - 1), { clipPath: HIDDEN }, at);   // under the last one
        cycle.fromTo(screens[n - 1], { clipPath: SHOWN },
          { clipPath: GONE, duration: WIPE, ease: 'expo.inOut', immediateRender: false }, at);
      }
      cycle.to(names, { yPercent: -100 * Math.min(k + 1, nNames - 1) / nNames, duration: 0.7, ease: AJM.ease.out },
        t + HOLD - WIPE * 0.5);
    }
    loops.push(cycle);
  }

  /* 2. Glyph float: x and y yoyo with different periods → small Lissajous orbits.
        Started at mid-progress (offset 0) so nothing jumps after the CSS burst. */
  api.q('.hero__glyph-in').forEach(function (g, i) {
    var ax = 5 + (i % 3) * 3;
    var ay = 7 + (i % 4) * 2.5;
    var tx = gsap.fromTo(g, { x: -ax }, { x: ax, duration: 4.6 + (i % 5) * 0.8, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true });
    var ty = gsap.fromTo(g, { y: -ay, rotation: -2.5 }, { y: ay, rotation: 2.5, duration: 3.8 + (i % 4) * 0.9, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true });
    tx.progress(0.5);
    ty.progress(0.5);
    loops.push(tx, ty);
  });

  /* 3. Pause: by the visitor (button) or automatically when not visible. */
  var group = {
    play: function () { if (!userPaused) loops.forEach(function (a) { a.play(); }); },
    pause: function () { loops.forEach(function (a) { a.pause(); }); }
  };
  api.onCleanup(api.utils.pauseWhenHidden(visual, group));

  if (pauseBtn) {
    pauseBtn.hidden = false;
    api.listen(pauseBtn, 'click', function () {
      userPaused = !userPaused;
      pauseBtn.setAttribute('aria-pressed', String(userPaused));
      el.classList.toggle('hero--paused', userPaused);
      if (userPaused) group.pause(); else group.play();
    });
    api.onCleanup(function () {
      pauseBtn.hidden = true;
      pauseBtn.setAttribute('aria-pressed', 'false');
      el.classList.remove('hero--paused');
    });
  }

  /* 4. Desktop scroll scrub: the object scrolls at about half speed (so the change is seen)
        and turns from its rest pose into the iso angle (rotateX 55, rotateZ -38); the phone
        lifts off the laptop like the first layers of the pile. Text and glyphs drift up. */
  api.mm.add('(min-width: 900px)', function () {
    var tl = gsap.timeline({
      defaults: { ease: 'none', duration: 1 },
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: AJM.scrub, invalidateOnRefresh: true }
    });
    var lag = function () { return el.offsetHeight * 0.4; };
    // The rig drifts slightly left while it turns, so the phone never leaves the screen on the
    // right (its corner swings outward in the iso angle).
    var TX = -13;
    tl.fromTo(visual, { y: 0 }, { y: lag }, 0)
      .fromTo(api.$('.hero__rig'),
        { '--rx': 6, '--ry': -14, '--rz': 0, '--s': 1, '--tx': 0, '--ty': 0, '--pz': 64 },
        { '--rx': 55, '--ry': 0, '--rz': -38, '--s': 0.86, '--tx': TX, '--ty': 14, '--pz': 130, duration: 0.5 }, 0)
      .fromTo(api.$('.hero__controls'), { y: 0 }, { y: function () { return -lag(); } }, 0) // leaves with the page
      .to(api.$('.hero__chip'), { opacity: 0, duration: 0.25 }, 0.1)
      .to(api.$('.hero__text'), { y: -90 }, 0)
      .to(api.$('.hero__depth--far'), { y: -90 }, 0)
      .to(api.$('.hero__depth--near'), { y: -220 }, 0)
      .to(api.$('.hero__rings'), { rotation: 12, scale: 1.1, transformOrigin: '50% 50%' }, 0)
      .to(api.$('.hero__cue'), { opacity: 0, duration: 0.12 }, 0);
  });

  /* 5. Pointer parallax (desktop, fine pointer). Reads only the pointer position. */
  api.mm.add('(min-width: 900px) and (hover: hover) and (pointer: fine)', function () {
    var opts = { duration: 1.2, ease: AJM.ease.soft };
    var tilt = api.$('.hero__tilt');
    var near = api.$('.hero__par--near');
    var far = api.$('.hero__par--far');
    var rX = gsap.quickTo(tilt, 'rotationX', opts);
    var rY = gsap.quickTo(tilt, 'rotationY', opts);
    var nX = gsap.quickTo(near, 'x', opts);
    var nY = gsap.quickTo(near, 'y', opts);
    var fX = gsap.quickTo(far, 'x', opts);
    var fY = gsap.quickTo(far, 'y', opts);
    function to(nx, ny) {
      rY(nx * 5); rX(-ny * 3.5);
      nX(nx * 18); nY(ny * 12);
      fX(nx * 8); fY(ny * 5);
    }
    function move(e) {
      if (userPaused) return;
      to(e.clientX / window.innerWidth * 2 - 1, e.clientY / window.innerHeight * 2 - 1);
    }
    function reset() { to(0, 0); }
    el.addEventListener('pointermove', move, { passive: true });
    el.addEventListener('pointerleave', reset);
    return function () {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', reset);
    };
  });
});
