/* chiffres.js — « AJM en chiffres ».
 * Calm version (no JS / reduced motion): solid gold, final numbers — nothing to do.
 * Motion:
 *   - signature: the section turns ink and the gold field grows from an inset rounded card to
 *     full bleed (clip-path, scrubbed from « top bottom » to « top 25% »);
 *   - the pale ring turns slowly with the scroll (desktop);
 *   - text appears only once the gold covers it (so ink text never sits on ink);
 *   - each number rolls like an odometer, once, when its cell enters the screen.
 */
AJM.register('chiffres', function (api) {
  if (!api.motion) return;

  var gsap = api.gsap;
  var ST = api.ScrollTrigger;
  var U = api.utils;
  var el = api.el;
  var bg = api.$('.chiffres__bg');
  var ring = api.$('.chiffres__ring');
  var items = api.q('.chiffres__item');

  el.classList.add('chiffres--wipe');
  api.onCleanup(function () { el.classList.remove('chiffres--wipe'); });

  /* ---- Gold wipe + ring ---- */
  api.mm.add({ wide: '(min-width: 900px)', narrow: '(max-width: 899.98px)' }, function (ctx) {
    var from = ctx.conditions.wide ? 'inset(12% 5% 12% 5% round 40px)' : 'inset(5% 3% 5% 3% round 24px)';
    gsap.fromTo(bg, { clipPath: from }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px)',
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 25%', scrub: AJM.scrub }
    });
    if (ctx.conditions.wide) {
      gsap.fromTo(ring, { rotation: -30, scale: 0.86 }, {
        rotation: 30, scale: 1, ease: 'none', transformOrigin: '50% 50%',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: AJM.scrub }
      });
    }
  });

  /* ---- Headline (once, after ~half of the wipe) ---- */
  var words = U.splitWords(api.$('.chiffres__title'), { mask: true });
  gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 60%', once: true } })
    .from(api.$('.chiffres__head .eyebrow'), { y: 16, opacity: 0, duration: AJM.dur.ui, ease: AJM.ease.out })
    .from(words, { yPercent: 110, duration: AJM.dur.reveal, ease: AJM.ease.out, stagger: 0.06 }, 0.05);

  /* ---- Figures: reveal + odometer, once per row ---- */
  var counters = items.map(function (item) {
    return U.rollingCounter(item.querySelector('.chiffres__value'), { duration: 1.8, stagger: 0.14 });
  });
  gsap.set(items, { opacity: 0, y: 32 });
  ST.batch(items, {
    start: 'top 88%',
    once: true,
    onEnter: function (batch) {
      api.add(function () {
        gsap.to(batch, { opacity: 1, y: 0, duration: AJM.dur.reveal, ease: AJM.ease.out, stagger: 0.1, overwrite: true });
        batch.forEach(function (item, i) {
          var c = counters[items.indexOf(item)];
          if (c) c.play(0.1 + i * 0.1);
        });
      });
    }
  });

  gsap.from(api.$('.chiffres__note'), {
    y: 16, opacity: 0, duration: AJM.dur.reveal, ease: AJM.ease.out,
    scrollTrigger: { trigger: api.$('.chiffres__note'), start: 'top 95%', once: true }
  });
});
