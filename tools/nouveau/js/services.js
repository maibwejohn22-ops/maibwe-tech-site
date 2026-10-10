/* services — ARIA tabs (always, also in reduced motion) + quiet motion (only when allowed).
   Without JS the tablist stays hidden and the 8 services are stacked cards (see services.css). */
AJM.register('services', function (api) {
  var ui = api.$('.services__ui');
  var tablist = api.$('.services__tablist');
  var tabs = api.q('.services__tab');
  var box = api.$('.services__panels');
  if (!ui || !tablist || !tabs.length || !box) return;
  var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
  if (panels.some(function (p) { return !p; })) return;

  /* ---------- 1. Tabs: essential behaviour ------------------------------ */
  var current = 0;
  tabs.forEach(function (t, i) { if (t.getAttribute('aria-selected') === 'true') current = i; });

  tablist.hidden = false;
  ui.classList.add('services__ui--tabs');
  panels.forEach(function (p, i) {
    p.setAttribute('role', 'tabpanel');
    p.setAttribute('aria-labelledby', tabs[i].id);
  });

  var desktop = window.matchMedia('(min-width: 900px)');
  function setOrientation() {
    tablist.setAttribute('aria-orientation', desktop.matches ? 'vertical' : 'horizontal');
  }
  setOrientation();
  if (desktop.addEventListener) api.listen(desktop, 'change', setOrientation);

  function select(i, opts) {
    opts = opts || {};
    var n = tabs.length;
    i = ((i % n) + n) % n;
    var changed = i !== current;
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      panels[k].classList.toggle('services__panel--inactive', !on);
      if (on) panels[k].setAttribute('tabindex', '0');
      else panels[k].removeAttribute('tabindex');
    });
    current = i;
    if (opts.focus) tabs[i].focus();
    if (changed && opts.animate) animateIn(panels[i]);
    if (changed && opts.reveal) revealPanel();
  }

  // On phones the panel sits under the tiles: bring its top into view if it is off screen.
  function revealPanel() {
    if (desktop.matches) return;
    var r = box.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    if (r.top > vh - 140) {
      window.scrollBy({ top: r.top - vh * 0.3, behavior: api.motion ? 'smooth' : 'auto' });
    }
  }

  select(current);

  tabs.forEach(function (t, i) {
    api.listen(t, 'click', function () { select(i, { animate: true, reveal: true }); });
  });
  api.listen(tablist, 'keydown', function (e) {
    var i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    var next = null;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': next = i + 1; break;
      case 'ArrowLeft': case 'ArrowUp': next = i - 1; break;
      case 'Home': next = 0; break;
      case 'End': next = tabs.length - 1; break;
      default: return;
    }
    e.preventDefault();
    select(next, { focus: true, animate: true });
  });

  /* ---------- 2. Motion (skipped in reduced motion) --------------------- */
  var gsap = api.gsap;
  function animateIn(panel) {
    if (!api.motion || !panel) return;
    api.add(function () {
      var fill = panel.querySelector('.services__panel-title .wipe-text__fill');
      var art = panel.querySelector('.services__panel-art');
      var bits = panel.querySelectorAll('.services__panel-ico, .services__panel-desc, .services__panel-label, .services__panel-list li, .services__panel-tech');
      gsap.killTweensOf([fill, art].concat(Array.prototype.slice.call(bits)));
      if (fill) {
        gsap.fromTo(fill, { clipPath: 'inset(0 100% 0 0)' }, {
          clipPath: 'inset(0 0% 0 0)', duration: AJM.dur.big, ease: AJM.ease.out, clearProps: 'clipPath'
        });
      }
      if (art) {
        gsap.fromTo(art, { clipPath: 'circle(0% at 70% 70%)', rotation: -6, transformOrigin: '50% 50%' }, {
          clipPath: 'circle(72% at 50% 50%)', rotation: 0, duration: AJM.dur.big, ease: AJM.ease.out, clearProps: 'clipPath,transform'
        });
      }
      gsap.fromTo(bits, { y: 12, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, ease: AJM.ease.out, stagger: 0.04, clearProps: 'transform,opacity'
      });
    });
  }

  if (!api.motion) return;

  var titlebox = api.$('.services__titlebox');
  var ghost = api.$('.services__ghost');
  function em() { return parseFloat(window.getComputedStyle(ghost).fontSize) || 100; }

  if (ghost && titlebox) {
    // Desktop: the outline copy slides out from behind the title as you scroll (scrubbed).
    api.mm.add('(min-width: 900px)', function () {
      gsap.fromTo(ghost, { x: 0, y: 0 }, {
        x: function () { return em() * 0.03; },
        y: function () { return em() * 0.045; },
        ease: 'none',
        scrollTrigger: { trigger: titlebox, start: 'top 92%', end: 'top 35%', scrub: AJM.scrub, invalidateOnRefresh: true }
      });
    });
    // Phones: same idea, played once.
    api.mm.add('(max-width: 899.98px)', function () {
      gsap.fromTo(ghost, { x: 0, y: 0 }, {
        x: function () { return em() * 0.03; },
        y: function () { return em() * 0.045; },
        duration: AJM.dur.big, ease: AJM.ease.out, delay: 0.15,
        scrollTrigger: { trigger: titlebox, start: 'top 80%', once: true }
      });
    });
  }

  gsap.from(tabs, {
    y: 24, opacity: 0, duration: AJM.dur.reveal, ease: AJM.ease.out, stagger: 0.05,
    clearProps: 'transform,opacity',
    scrollTrigger: { trigger: tablist, start: 'top 85%', once: true }
  });
  gsap.from(box, {
    y: 40, opacity: 0, duration: AJM.dur.reveal, ease: AJM.ease.out,
    clearProps: 'transform,opacity',
    scrollTrigger: { trigger: ui, start: 'top 80%', once: true, onEnter: function () { animateIn(panels[current]); } }
  });
});
