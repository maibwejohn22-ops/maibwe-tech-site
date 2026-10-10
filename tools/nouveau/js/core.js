/* core.js — AJM prototype micro-framework (see tools/nouveau/DESIGN.md, « core.js API »).
 *
 *   AJM.register('apps', function (api) {
 *     // essential, non-motion behaviour first (tabs, menus…): always runs
 *     if (!api.motion) return;            // reduced motion or GSAP missing → stop here
 *     api.gsap.from(api.q('.apps__card'), { y: 40, opacity: 0, stagger: 0.08,
 *       scrollTrigger: { trigger: api.el, start: 'top 75%', once: true } });
 *     return function cleanup() { … };    // optional
 *   });
 *
 * Inits run once the DOM is parsed, in page order, each inside its own gsap.context()
 * scoped to its <section>. When the reduced-motion preference changes live, every
 * section is torn down (contexts reverted, cleanups called, split/counter DOM restored)
 * and initialised again with the new value.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var gsap = window.gsap || null;
  var ST = window.ScrollTrigger || null;
  if (gsap && ST) {
    gsap.registerPlugin(ST);
    // No automatic refresh on DOMContentLoaded / load: a refresh resets the scroll position
    // while it measures, which cancels a smooth anchor scroll in progress (or the browser's
    // jump to a #fragment). core.js refreshes itself, only once scrolling has stopped.
    ST.config({ ignoreMobileResize: true, autoRefreshEvents: 'visibilitychange,resize' });
  } else {
    console.warn('[AJM] GSAP/ScrollTrigger not loaded: motion disabled, content stays static.');
  }

  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var registry = [];
  var restorers = [];
  var started = false;

  // ?motion=reduced (or ?motion=full) forces the mode, for testing/screenshots:
  // the in-app browser cannot emulate prefers-reduced-motion.
  var forced = /[?&]motion=(reduced|full)\b/.exec(window.location.search);
  var forcedReduced = forced ? forced[1] === 'reduced' : null;

  var AJM = window.AJM = {
    reduced: forcedReduced !== null ? forcedReduced : !!(mq && mq.matches),
    gsap: gsap,
    ScrollTrigger: ST,
    sections: ['hero', 'pile', 'services', 'apps', 'donnees', 'chiffres', 'methode', 'ponts', 'contact'],
    breakpoints: { sm: 640, md: 900, lg: 1100, xl: 1280 },
    // Shared motion vocabulary (DESIGN.md § 8). Use these, not ad-hoc values.
    ease: { out: 'expo.out', soft: 'power3.out', inOut: 'power2.inOut', none: 'none' },
    dur: { micro: 0.2, ui: 0.45, reveal: 0.9, big: 1.4 },
    scrub: 0.6,
    register: register,
    refresh: refresh,
    setReduced: setReduced,
    headerHeight: headerHeight,
    utils: {}
  };

  function setMotionAttr() {
    root.setAttribute('data-motion', AJM.reduced ? 'reduced' : 'full');
  }
  setMotionAttr();

  /* ------------------------------------------------------------------ */
  /* Registry                                                            */
  /* ------------------------------------------------------------------ */
  function register(id, init) {
    if (typeof id !== 'string' || typeof init !== 'function') {
      console.error('[AJM] register(id, initFn) expects a section id and a function.');
      return;
    }
    for (var i = 0; i < registry.length; i++) {
      if (registry[i].id === id) {
        console.error('[AJM] section "' + id + '" registered twice; second call ignored.');
        return;
      }
    }
    var entry = { id: id, init: init, cleanups: [], ctx: null, mm: null };
    registry.push(entry);
    if (started) { runOne(entry); refresh(); }
  }

  function domOrder(a, b) {
    var ea = document.getElementById(a.id);
    var eb = document.getElementById(b.id);
    if (!ea || !eb) return 0;
    return ea.compareDocumentPosition(eb) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  }

  function runOne(entry) {
    var el = document.getElementById(entry.id);
    if (!el) {
      console.warn('[AJM] register("' + entry.id + '"): no element with id="' + entry.id + '".');
      return;
    }
    entry.cleanups = [];
    entry.mm = gsap ? gsap.matchMedia() : null;
    var api = {
      id: entry.id,
      el: el,
      reduced: AJM.reduced,
      motion: !AJM.reduced && !!(gsap && ST),
      gsap: gsap,
      ScrollTrigger: ST,
      mm: entry.mm,
      utils: AJM.utils,
      $: function (sel) { return el.querySelector(sel); },
      q: function (sel) { return Array.prototype.slice.call(el.querySelectorAll(sel)); },
      /* Run fn inside this section's gsap.context (for animations created later, e.g. in a click handler). */
      add: function (fn) { return entry.ctx ? entry.ctx.add(fn) : fn(); },
      onCleanup: function (fn) { entry.cleanups.push(fn); },
      listen: function (target, type, fn, opts) {
        target.addEventListener(type, fn, opts);
        entry.cleanups.push(function () { target.removeEventListener(type, fn, opts); });
      }
    };
    try {
      var ret;
      if (gsap) {
        entry.ctx = gsap.context(function () { ret = entry.init(api); }, el);
      } else {
        ret = entry.init(api);
      }
      if (typeof ret === 'function') entry.cleanups.push(ret);
    } catch (err) {
      console.error('[AJM] section "' + entry.id + '" failed to initialise:', err);
    }
  }

  function runAll() {
    registry.sort(domOrder).forEach(runOne);
    refresh();
  }

  function teardownAll() {
    registry.slice().reverse().forEach(function (entry) {
      entry.cleanups.slice().reverse().forEach(function (fn) {
        try { fn(); } catch (err) { console.error('[AJM] cleanup of "' + entry.id + '" failed:', err); }
      });
      entry.cleanups = [];
      if (entry.mm) { entry.mm.revert(); entry.mm = null; }
      if (entry.ctx) { entry.ctx.revert(); entry.ctx = null; }
    });
    while (restorers.length) {
      try { restorers.pop()(); } catch (err) { console.error('[AJM] restore failed:', err); }
    }
  }

  function setReduced(value) {
    teardownAll();
    AJM.reduced = !!value;
    setMotionAttr();
    runAll();
  }
  function onMotionPreferenceChange() {
    if (forcedReduced !== null) return;      // ?motion= wins over the OS setting
    setReduced(mq.matches);
  }
  if (mq) {
    if (mq.addEventListener) mq.addEventListener('change', onMotionPreferenceChange);
    else if (mq.addListener) mq.addListener(onMotionPreferenceChange);
  }

  /* ------------------------------------------------------------------ */
  /* ScrollTrigger refresh (fonts, images, load)                         */
  /* ------------------------------------------------------------------ */
  var refreshTimer = 0;
  var lastScroll = 0;
  window.addEventListener('scroll', function () { lastScroll = Date.now(); }, { passive: true });
  function refresh() {
    if (!ST) return;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(function run() {
      // Never while the page is scrolling (e.g. a smooth anchor scroll): wait until it stops.
      if (Date.now() - lastScroll < 250) { refreshTimer = setTimeout(run, 250); return; }
      ST.refresh();
    }, 80);
  }

  function headerHeight() {
    var h = document.getElementById('site-header');
    return h ? h.offsetHeight : 0;
  }

  // Every <img> has width/height and sits in a fixed-ratio frame, so image loads never move
  // the layout: only fonts and the window load event are worth a refresh.
  function watchLateLayout() {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    if (document.readyState === 'complete') refresh();
    else window.addEventListener('load', refresh, { once: true });
  }

  /* A deep link (/nouveau/#methode) opened in a new tab: the first refreshes reset the scroll
     position before or after the browser jumps to the fragment. Go back to the target after
     each refresh, until the visitor scrolls by themselves (or 3 s after load). */
  function keepHashTarget() {
    if (!ST || location.hash.length < 2) return;
    var target = null;
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (err) { target = null; }
    if (!target) return;
    var moved = false;
    function stop() { moved = true; }
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (type) {
      window.addEventListener(type, stop, { once: true, passive: true });
    });
    function jump() {
      if (moved) return;
      var prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';            // instant, whatever the CSS says
      target.scrollIntoView(true);                   // scroll-padding-top keeps it under the header
      root.style.scrollBehavior = prev;
    }
    ST.addEventListener('refresh', jump);
    function release() { setTimeout(function () { ST.removeEventListener('refresh', jump); }, 3000); }
    if (document.readyState === 'complete') release();
    else window.addEventListener('load', release, { once: true });
  }

  /* ------------------------------------------------------------------ */
  /* Header: scrolled state, theme under the bar, current link, menu     */
  /* ------------------------------------------------------------------ */
  var THEME_TO_HEADER = { dark: 'dark', ink: 'dark', navy: 'dark', cream: 'light', gold: 'gold' };

  function initHeader() {
    var header = document.getElementById('site-header');
    if (!header || !('IntersectionObserver' in window)) return;

    // 1. data-at-top while the 8 px sentinel at the very top is visible (transparent bar).
    var sentinel = document.getElementById('top');
    if (sentinel) {
      new IntersectionObserver(function (entries) {
        header.toggleAttribute('data-at-top', entries[0].isIntersecting);
      }).observe(sentinel);
    }

    // 2. theme of whatever block sits under the middle of the bar. Sections are the
    //    top-level blocks; a themed block nested inside a section (e.g. the cream outro at
    //    the end of « pile ») wins while it is under the bar: of all the blocks crossing the
    //    probe line, the last one in document order (= the innermost) sets the theme.
    var sections = Array.prototype.slice.call(
      document.querySelectorAll('main > [data-theme], body > footer[data-theme]')
    );
    var themed = Array.prototype.slice.call(
      document.querySelectorAll('main [data-theme], body > footer[data-theme]')
    );
    var themeIO = null;
    var under = [];
    var lastW = 0;
    var lastH = 0;
    function applyTheme() {
      var top = null;
      under.forEach(function (el) {
        if (!top || (top.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)) top = el;
      });
      if (top) header.setAttribute('data-on', THEME_TO_HEADER[top.getAttribute('data-theme')] || 'dark');
    }
    function observeThemes() {
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      if (themeIO && vw === lastW && Math.abs(vh - lastH) < 120) return;
      lastW = vw;
      lastH = vh;
      if (themeIO) themeIO.disconnect();
      under = [];
      var probe = Math.round(header.offsetHeight / 2);
      themeIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var i = under.indexOf(e.target);
          if (e.isIntersecting && i < 0) under.push(e.target);
          else if (!e.isIntersecting && i >= 0) under.splice(i, 1);
        });
        applyTheme();
      }, { rootMargin: (-probe) + 'px 0px ' + (-(vh - probe - 1)) + 'px 0px' });
      themed.forEach(function (el) { themeIO.observe(el); });
    }
    observeThemes();
    var resizeTimer = 0;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(observeThemes, 150);
    });

    // 3. current section link (aria-current) — band at 45 % of the viewport.
    var links = Array.prototype.slice.call(header.querySelectorAll('.site-nav__link[href^="#"]'));
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    function setCurrent(id) {
      links.forEach(function (a) {
        if (byId[id] === a) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setCurrent(e.target.id); });
    }, { rootMargin: '-45% 0px -54% 0px' });
    sections.forEach(function (el) { navIO.observe(el); });

    // 4. menu toggle (< 1100 px)
    var toggle = header.querySelector('.site-header__toggle');
    var menu = document.getElementById('site-menu');
    if (!toggle || !menu) return;
    var label = toggle.querySelector('.site-header__toggle-label');
    function isOpen() { return toggle.getAttribute('aria-expanded') === 'true'; }
    function setOpen(open, returnFocus) {
      header.toggleAttribute('data-menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Fermer' : 'Menu';
      if (open) {
        var first = menu.querySelector('a');
        if (first) setTimeout(function () { first.focus(); }, 30);
      } else if (returnFocus) {
        toggle.focus();
      }
    }
    toggle.addEventListener('click', function () { setOpen(!isOpen(), false); });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a') && isOpen()) setOpen(false, false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) setOpen(false, true);
    });
    document.addEventListener('click', function (e) {
      if (isOpen() && !header.contains(e.target)) setOpen(false, false);
    });
    // Tabbing past the last link of the open menu closes it (no dropdown left over the page).
    header.addEventListener('focusout', function (e) {
      if (isOpen() && e.relatedTarget && !header.contains(e.relatedTarget)) setOpen(false, false);
    });
    var desktop = window.matchMedia('(min-width: 1100px)');
    var onDesktop = function (e) { if (e.matches && isOpen()) setOpen(false, false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onDesktop);
    else if (desktop.addListener) desktop.addListener(onDesktop);
  }

  /* ------------------------------------------------------------------ */
  /* Utils                                                               */
  /* ------------------------------------------------------------------ */
  var U = AJM.utils;

  U.clamp = function (v, min, max) { return Math.min(max, Math.max(min, v)); };
  U.lerp = function (a, b, t) { return a + (b - a) * t; };
  U.mapRange = function (v, inMin, inMax, outMin, outMax) {
    return outMin + (U.clamp((v - inMin) / (inMax - inMin), 0, 1)) * (outMax - outMin);
  };
  U.isFinePointer = function () {
    return !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  };

  /* inView(el, cb, {once = true, rootMargin = '0px 0px -15% 0px', threshold = 0})
     cb(entry) when el enters the viewport. Returns a disconnect function. */
  U.inView = function (el, cb, opts) {
    opts = opts || {};
    var once = opts.once !== false;
    if (!('IntersectionObserver' in window)) { cb(null); return function () {}; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          cb(e);
          if (once) io.disconnect();
        } else if (opts.onLeave) {
          opts.onLeave(e);
        }
      });
    }, { rootMargin: opts.rootMargin || '0px 0px -15% 0px', threshold: opts.threshold || 0 });
    io.observe(el);
    return function () { io.disconnect(); };
  };

  /* pauseWhenHidden(el, animation) — play a looping tween/timeline only while el is on
     screen and the tab is visible. Returns a stop function (call it from cleanup). */
  U.pauseWhenHidden = function (el, anim) {
    var visible = false;
    function sync() {
      if (visible && !document.hidden) anim.play(); else anim.pause();
    }
    var stopIO = U.inView(el, function () { visible = true; sync(); }, {
      once: false, rootMargin: '0px', onLeave: function () { visible = false; sync(); }
    });
    document.addEventListener('visibilitychange', sync);
    anim.pause();
    return function () { stopIO(); document.removeEventListener('visibilitychange', sync); };
  };

  /* splitWords(el, {mask: false}) → array of .split-word__inner spans.
     Screen readers get the original sentence (sr-only); the visual copy is aria-hidden.
     Only for headings/paragraphs made of text + <em>/<strong>/<span>/<br>, never links.
     Idempotent; restored automatically on teardown. */
  U.splitWords = function (el, opts) {
    if (!el) return [];
    if (el.__ajmSplit) return el.__ajmSplit;
    opts = opts || {};
    var original = el.innerHTML;
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    var visual = document.createElement('span');
    visual.className = 'split';
    visual.setAttribute('aria-hidden', 'true');
    var words = [];
    (function walk(node, into) {
      Array.prototype.forEach.call(node.childNodes, function (child) {
        if (child.nodeType === 3) {
          // Split on breakable white space only: a non-breaking space (« couche&nbsp;— ») keeps
          // its two sides together in one word.
          child.textContent.split(/([^\S\u00A0\u202F]+)/).forEach(function (part) {
            if (!part) return;
            if (/^[^\S\u00A0\u202F]+$/.test(part)) { into.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span');
            w.className = 'split-word' + (opts.mask ? ' split-word--mask' : '');
            var inner = document.createElement('span');
            inner.className = 'split-word__inner';
            inner.textContent = part;
            w.appendChild(inner);
            into.appendChild(w);
            words.push(inner);
          });
        } else if (child.nodeType === 1) {
          var clone = child.cloneNode(false);
          clone.removeAttribute('id');
          if (child.tagName !== 'BR') walk(child, clone);
          into.appendChild(clone);
        }
      });
    })(el, visual);
    var sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = text;
    el.innerHTML = '';
    el.appendChild(sr);
    el.appendChild(visual);
    el.__ajmSplit = words;
    restorers.push(function () { el.innerHTML = original; delete el.__ajmSplit; });
    return words;
  };

  /* rollingCounter(el, {duration = 1.8, stagger = 0.12, ease = 'expo.out'})
     el holds the real final text, e.g. <span class="…">360</span> or « 7 ». Digits become
     vertical 0–9 strips moved with transform only (odometer). Screen readers read the
     original text. Returns { play(delay), set(progress) }; the visual starts at zero, so
     only call it when motion is allowed. Idempotent; restored on teardown. */
  U.rollingCounter = function (el, opts) {
    if (!el) return null;
    if (el.__ajmRoll) return el.__ajmRoll;
    opts = opts || {};
    var original = el.innerHTML;
    var text = el.textContent.trim();
    var visual = document.createElement('span');
    visual.className = 'roll';
    visual.setAttribute('aria-hidden', 'true');
    var strips = [];
    text.split('').forEach(function (ch) {
      var cell = document.createElement('span');
      if (/[0-9]/.test(ch)) {
        cell.className = 'roll__digit';
        var strip = document.createElement('span');
        strip.className = 'roll__strip';
        for (var loop = 0; loop < 2; loop++) {
          for (var d = 0; d <= 9; d++) {
            var s = document.createElement('span');
            s.textContent = String(d);
            strip.appendChild(s);
          }
        }
        cell.appendChild(strip);
        strips.push({ strip: strip, target: -((10 + Number(ch)) / 20) * 100 });
      } else {
        cell.className = 'roll__char';
        cell.textContent = ch === ' ' ? ' ' : ch;
      }
      visual.appendChild(cell);
    });
    var sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = text;
    el.innerHTML = '';
    el.appendChild(sr);
    el.appendChild(visual);

    var duration = opts.duration || 1.8;
    var stagger = opts.stagger == null ? 0.12 : opts.stagger;
    var ease = opts.ease || 'expo.out';
    var api = {
      el: el,
      play: function (delay) {
        if (!gsap) { api.set(1); return null; }
        var n = strips.length;
        var tl = gsap.timeline({ delay: delay || 0 });
        strips.forEach(function (s, i) {   // units digit first, then tens, hundreds…
          tl.fromTo(s.strip, { yPercent: 0 }, { yPercent: s.target, duration: duration, ease: ease }, (n - 1 - i) * stagger);
        });
        return tl;
      },
      set: function (progress) {
        strips.forEach(function (s) {
          var y = s.target * U.clamp(progress, 0, 1);
          if (gsap) gsap.set(s.strip, { yPercent: y });
          else s.strip.style.transform = 'translateY(' + y + '%)';
        });
      }
    };
    el.__ajmRoll = api;
    restorers.push(function () { el.innerHTML = original; delete el.__ajmRoll; });
    return api;
  };

  /* countUp(el, {to, from = 0, duration = 1.6, decimals = 0}) — simple text count-up
     (rewrites textContent; prefer rollingCounter for big numbers). Ends on el's real text. */
  U.countUp = function (el, opts) {
    if (!el || !gsap) return null;
    opts = opts || {};
    var finalText = el.textContent;
    var to = opts.to != null ? opts.to : parseFloat(finalText.replace(/[^\d.,-]/g, '').replace(',', '.'));
    var obj = { v: opts.from || 0 };
    var fmt = new Intl.NumberFormat('fr-CA', { maximumFractionDigits: opts.decimals || 0, minimumFractionDigits: opts.decimals || 0 });
    restorers.push(function () { el.textContent = finalText; });
    return gsap.to(obj, {
      v: to, duration: opts.duration || 1.6, ease: opts.ease || 'power3.out',
      onUpdate: function () { el.textContent = fmt.format(obj.v); },
      onComplete: function () { el.textContent = finalText; }
    });
  };

  /* ------------------------------------------------------------------ */
  /* Start                                                               */
  /* ------------------------------------------------------------------ */
  function start() {
    if (started) return;
    started = true;
    initHeader();
    keepHashTarget();
    runAll();
    watchLateLayout();
  }
  // This file is deferred: section files concatenated after it register synchronously,
  // so wait for DOMContentLoaded (or the next microtask if it already passed).
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    Promise.resolve().then(start);
  }
})();
