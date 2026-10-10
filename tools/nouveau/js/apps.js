/* apps.js — « Nos applications ».
 * Calm version (no JS / reduced motion): the CSS grid, nothing to do here.
 * Motion: adds .apps--rail.
 *   ≥ 900 px wide and ≥ 680 px tall: the stage is sticky (CSS) and the vertical scroll moves the
 *   track sideways (scrubbed). Each phone turns slightly and its giant outline number drifts
 *   (parallax through containerAnimation). Keyboard focus inside the track scrolls the page so the
 *   focused card is centred (the stage clips, the browser cannot scroll it into view itself).
 *   Smaller screens: native swipe row (CSS scroll-snap) + a short reveal.
 */
AJM.register('apps', function (api) {
  if (!api.motion) return;

  var gsap = api.gsap;
  var ST = api.ScrollTrigger;
  var U = api.utils;
  var el = api.el;
  var rail = api.$('.apps__rail');
  var stage = api.$('.apps__stage');
  var track = api.$('.apps__track');
  var list = api.$('.apps__list');
  var items = api.q('.apps__item');
  var fill = api.$('.apps__bar-fill');

  el.classList.add('apps--rail');
  api.onCleanup(function () {
    el.classList.remove('apps--rail');
    rail.style.height = '';
  });

  // Cards slide in from off-screen, where native lazy-loading would wait too long: load the
  // screenshots as soon as the section approaches.
  // (The second screens, .apps__alt, only show on hover/focus: not worth loading on touch screens.)
  api.onCleanup(U.inView(el, function () {
    var sel = U.isFinePointer() ? 'img[loading="lazy"]' : 'img[loading="lazy"]:not(.apps__alt)';
    api.q(sel).forEach(function (img) { img.loading = 'eager'; });
  }, { rootMargin: '100% 0px 100% 0px' }));

  // Headline: words rise from a mask, then the lead and hint.
  var words = U.splitWords(api.$('.apps__title'), { mask: true });
  var intro = gsap.timeline({ scrollTrigger: { trigger: api.$('.apps__intro'), start: 'top 80%', once: true } });
  intro.from(api.$('.apps__intro .eyebrow'), { y: 16, opacity: 0, duration: AJM.dur.ui, ease: AJM.ease.out })
    .from(words, { yPercent: 110, duration: AJM.dur.reveal, ease: AJM.ease.out, stagger: 0.06 }, 0.05)
    .from(api.q('.apps__lead, .apps__hint'), { y: 24, opacity: 0, duration: AJM.dur.reveal, ease: AJM.ease.out, stagger: 0.08 }, 0.3);

  /* ---- Desktop: pinned horizontal gallery ---- */
  api.mm.add('(min-width: 900px) and (min-height: 680px)', function () {
    var dist = 0;
    var hold = 0;

    // The rail is as tall as the stage plus the horizontal distance to travel, plus a short
    // hold at the start (the intro is read before the track moves), so the sticky stage stays
    // put exactly while the track crosses. Re-measured before every refresh.
    function measure() {
      dist = Math.max(0, Math.round(track.scrollWidth - stage.clientWidth));
      hold = Math.round(window.innerHeight * 0.3);
      rail.style.height = (stage.offsetHeight + dist + hold) + 'px';
    }
    measure();
    ST.addEventListener('refreshInit', measure);

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: rail,
        start: function () { return 'top ' + (AJM.headerHeight() - hold) + 'px'; },
        end: 'bottom bottom',
        scrub: AJM.scrub,
        invalidateOnRefresh: true
      }
    });
    // Whole pixels keep the text of the moving track crisp.
    tl.to(track, { x: function () { return -dist; }, modifiers: { x: gsap.utils.unitize(Math.round) } }, 0)
      .fromTo(fill, { scaleX: 0 }, { scaleX: 1 }, 0);

    items.forEach(function (item) {
      var range = { trigger: item, containerAnimation: tl, start: 'left right', end: 'right left', scrub: true };
      gsap.fromTo(item.querySelector('.apps__num'), { xPercent: 28 }, { xPercent: -28, ease: 'none', scrollTrigger: range });
      gsap.fromTo(item.querySelector('.apps__tilt'), { rotationY: -16 }, {
        rotationY: 16, ease: 'none', scrollTrigger: Object.assign({}, range)
      });
    });

    function onFocus(e) {
      if (!dist || !tl.scrollTrigger) return;
      var target = e.target;
      var keyboard = true;                                    // keyboard only
      try { keyboard = target.matches(':focus-visible'); } catch (err) { keyboard = true; }   // Safari < 15.4
      if (!keyboard) return;
      var card = target.closest('.apps__item, .apps__outro');
      if (!card) return;
      var st = tl.scrollTrigger;
      var offset = card.getBoundingClientRect().left - track.getBoundingClientRect().left;
      var p = U.clamp((offset + card.offsetWidth / 2 - stage.clientWidth / 2) / dist, 0, 1);
      var y = Math.round(st.start + p * (st.end - st.start));
      if (Math.abs(window.scrollY - y) > 2) window.scrollTo({ top: y, behavior: 'instant' });
    }
    track.addEventListener('focusin', onFocus);

    return function () {
      ST.removeEventListener('refreshInit', measure);
      track.removeEventListener('focusin', onFocus);
      rail.style.height = '';
    };
  });

  /* ---- Small screens: swipe row, short reveal of the first cards ---- */
  api.mm.add('(max-width: 899.98px), (max-height: 679.98px)', function () {
    gsap.from(items.slice(0, 2), {
      x: 48, opacity: 0, duration: AJM.dur.reveal, ease: AJM.ease.out, stagger: 0.1,
      scrollTrigger: { trigger: list, start: 'top 85%', once: true }
    });
  });
});
