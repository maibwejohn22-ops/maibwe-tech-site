/* ponts — « Du Québec à la RDC ».
 * Motion only:
 *   - headline words rise once; intro + values reveal once;
 *   - the gold arc is revealed by a clip-path wipe (scrubbed left→right on ≥ 640 px,
 *     top→bottom once on phones), then a packet travels Québec ⇄ RDC (transform attribute
 *     only), driven by the scroll — no time loop (WCAG 2.2.2) — and pings the end it reaches;
 *   - « Pour qui » list becomes one long row moved by scroll (scrubbed x, no autoplay).
 * Reduced motion / no JS: static map fully drawn, wrapped list, no packet. */
AJM.register('ponts', function (api) {
  if (!api.motion) return; // reduced motion or no GSAP: static page

  var gsap = api.gsap;
  var U = api.utils;
  var map = api.$('.ponts__map');

  /* Headline, intro, caption, values ---------------------------------------- */
  var title = api.$('#ponts-title');
  gsap.from(U.splitWords(title, { mask: true }), {
    yPercent: 110, duration: AJM.dur.reveal, ease: AJM.ease.out, stagger: 0.06,
    scrollTrigger: { trigger: title, start: 'top 85%', once: true }
  });
  gsap.from(api.q('.ponts__lead, .ponts__question'), {
    y: 28, opacity: 0, duration: AJM.dur.reveal, ease: AJM.ease.out, stagger: 0.1,
    scrollTrigger: { trigger: api.$('.ponts__intro'), start: 'top 82%', once: true }
  });
  gsap.from(api.q('.ponts__place, .ponts__caption'), {
    y: 16, opacity: 0, duration: AJM.dur.reveal, ease: AJM.ease.out, stagger: 0.12,
    scrollTrigger: { trigger: map, start: 'top 70%', once: true }
  });
  gsap.from(api.q('.ponts__value'), {
    y: 30, opacity: 0, duration: AJM.dur.reveal, ease: AJM.ease.out, stagger: 0.08,
    scrollTrigger: { trigger: api.$('.ponts__values'), start: 'top 85%', once: true }
  });

  /* Arc reveal + travelling packet, per map variant ------------------------- */
  function bridge(variant, scrubbed) {
    var svg = api.$('.ponts__arcs.ponts__svg--' + variant);
    if (!svg) return null;
    var path = svg.querySelector('.ponts__arc--main');
    var packet = svg.querySelector('.ponts__packet');
    var pings = Array.prototype.slice.call(svg.querySelectorAll('.ponts__ping'));

    // Reveal the arcs layer with a clip-path wipe (never stroke-dashoffset).
    var from = variant === 'wide' ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 100% 0%)';
    if (scrubbed) {
      gsap.fromTo(svg, { clipPath: from }, {
        clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
        scrollTrigger: { trigger: map, start: 'top 85%', end: 'center 45%', scrub: AJM.scrub }
      });
    } else {
      gsap.fromTo(svg, { clipPath: from }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'power2.inOut',
        scrollTrigger: { trigger: map, start: 'top 75%', once: true }
      });
    }

    // Sample the arc once (SVG user units: independent of the rendered size).
    var len = path.getTotalLength();
    var pts = [];
    for (var i = 0; i <= 80; i++) {
      var p = path.getPointAtLength(len * i / 80);
      pts.push([p.x, p.y]);
    }
    var st = { t: 0 };
    function render() {
      var f = U.clamp(st.t, 0, 1) * (pts.length - 1);
      var j = Math.min(pts.length - 2, Math.floor(f));
      var u = f - j;
      packet.setAttribute('transform', 'translate(' +
        U.lerp(pts[j][0], pts[j + 1][0], u).toFixed(2) + ' ' + U.lerp(pts[j][1], pts[j + 1][1], u).toFixed(2) + ')');
    }
    var pingTweens = pings.map(function (el) {
      return gsap.fromTo(el, { scale: 1, opacity: 0.9 }, {
        scale: 2.4, opacity: 0, duration: 1.4, ease: 'power2.out', transformOrigin: '50% 50%',
        paused: true, immediateRender: false
      });
    });
    render();
    gsap.set(packet, { opacity: 1 });   // still hidden by the arcs layer's clip until revealed
    // The packet follows the scroll: Québec → RDC while the map crosses the screen (and back
    // when scrolling up). Each end pings once when the packet reaches it.
    var last = 0;                        // 0 = at Québec, 1 = at RDC, -1 = on the way
    var travel = gsap.to(st, {
      t: 1, ease: 'power1.inOut', lazy: false,
      modifiers: { t: function (v) {
        st.t = Number(v);
        render();
        var end = st.t >= 0.985 ? 1 : (st.t <= 0.015 ? 0 : -1);
        if (end !== -1 && last === -1) pingTweens[end].restart();   // arrived at an end
        last = end;
        return v;
      } },
      scrollTrigger: { trigger: map, start: 'top 65%', end: 'bottom 30%', scrub: AJM.scrub }
    });
    return function () { travel.kill(); packet.removeAttribute('transform'); };
  }
  api.mm.add('(min-width: 640px)', function () { return bridge('wide', true); });
  api.mm.add('(max-width: 639.98px)', function () { return bridge('tall', false); });

  /* « Pour qui » band: one row, moved horizontally by scroll ----------------- */
  var band = api.$('.ponts__band');
  var view = api.$('.ponts__band-view');
  var track = api.$('.ponts__band-track');
  band.classList.add('ponts__band--moving');
  gsap.fromTo(track, { x: 0 }, {
    x: function () { return -Math.max(0, track.scrollWidth - view.clientWidth); },
    ease: 'none',
    scrollTrigger: {
      trigger: band, start: 'top bottom', end: 'bottom top',
      scrub: AJM.scrub, invalidateOnRefresh: true
    }
  });
  AJM.refresh();

  return function cleanup() {
    band.classList.remove('ponts__band--moving');
  };
});
