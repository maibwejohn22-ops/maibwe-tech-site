/* Applications John Maibwe (AJM) — scripts partagés par / (FR) et /en/ (EN).
   La langue de la page est lue sur <html lang="…"> ; les textes de l'assistant et
   du formulaire sont choisis en conséquence. Aucun appel externe hormis Web3Forms. */
(function () {
  var LANG = (document.documentElement.lang || 'fr').slice(0, 2) === 'en' ? 'en' : 'fr';

  // Police Montserrat : préchargée dans <head> (rel="preload"), appliquée ici pour ne pas
  // bloquer le premier affichage (et sans script inline, interdit par la CSP).
  var fontCss = document.getElementById('font-css');
  if (fontCss) fontCss.rel = 'stylesheet';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----- Coordonnées -----
  // WhatsApp : indiquer le numéro au format international, chiffres seulement
  // (ex. '15145551234'). Tant qu'il est vide, aucun bouton WhatsApp n'est affiché.
  var WHATSAPP_NUMBER = '';
  var EMAIL = 'john@johnmaibwe.com';

  var T = {
    fr: {
      greeting: 'Bonjour ! 👋 Je suis l’assistant d’<strong>Applications John Maibwe</strong>. Comment puis-je vous aider aujourd’hui ?',
      fallback: 'Bonne question ! Je n’ai pas la réponse exacte ici, mais John l’aura : écrivez à <a href="mailto:' + EMAIL + '">' + EMAIL + '</a> ou décrivez votre besoin dans le <a href="#contact">formulaire de contact</a>.',
      suggestions: { 'Nos services': 'service', 'Nos produits': 'produit', 'Prix et devis': 'prix', 'Délais de livraison': 'délai', 'Vous joindre': 'contact' },
      answers: [
        { k: ['service', 'offre', 'faites', 'faire'], t: 'Nous développons des applications web, des applications iOS et Android, des logiciels sur mesure, des solutions d’intelligence artificielle et d’automatisation, des bases de données et solutions infonuagiques, et nous accompagnons la transformation numérique des organisations. <a href="#services">Voir nos services</a>' },
        { k: ['produit', 'villagemap', 'campus', 'église', 'eglise', 'paroisse', 'castor', 'zembo', 'adprotectx', 'promptcam'], t: 'Nos produits : Église Connect, Castor IA, Campus RDC, VillageMap RDC, Zembo Music AI, AdProtectX et PromptCam. Chaque fiche indique clairement s’il est disponible ou encore en développement. <a href="#produits">Découvrir nos produits</a>' },
        { k: ['prix', 'coût', 'cout', 'combien', 'devis', 'tarif', 'budget'], t: 'Chaque projet est unique : le prix dépend de vos besoins. Nous offrons une <strong>évaluation gratuite</strong> et un devis clair avant tout engagement — sans surprise. <a href="#contact">Demander un devis</a>' },
        { k: ['délai', 'delai', 'temps', 'livraison', 'rapide', 'quand'], t: 'Un site vitrine se livre en quelques semaines ; une application ou un logiciel sur mesure prend plus de temps selon la portée. Nous donnons un échéancier réaliste dès le départ — et nous le respectons.' },
        { k: ['intelligence', ' ia', 'ia ', 'ai ', 'chatgpt', 'automatis'], t: 'Nous intégrons l’intelligence artificielle là où elle fait gagner du temps : assistants, tri et rédaction de documents, automatisation de processus et connexions entre vos outils. <a href="#services">En savoir plus</a>' },
        { k: ['site', 'vitrine', 'web'], t: 'Nous créons des sites et des applications web modernes, rapides et crédibles — hébergement et nom de domaine pris en charge. <a href="#services">En savoir plus</a>' },
        { k: ['mobile', 'ios', 'android', 'téléphone', 'telephone', 'application', 'app '], t: 'Nous concevons des applications iOS et Android sur mesure : conception, développement, publication sur l’App Store et Google Play, puis maintenance. <a href="#produits">Voir des exemples</a>' },
        { k: ['logiciel', 'mesure', 'base de données', 'donnée', 'donnee', 'cloud', 'nuage'], t: 'Quand les outils génériques ne suffisent plus, nous construisons exactement ce qu’il vous faut : bases de données, portails internes, solutions infonuagiques sécurisées. <a href="#services">Nos services</a>' },
        { k: ['hébergement', 'hebergement', 'domaine', 'courriel pro'], t: 'Oui ! Nous prenons en charge le nom de domaine, l’hébergement, les courriels professionnels et la mise en ligne. Rien de technique à gérer de votre côté.' },
        { k: ['contact', 'courriel', 'email', 'joindre', 'whatsapp', 'rejoindre', 'écrire', 'ecrire'], t: 'Écrivez-nous à <a href="mailto:' + EMAIL + '">' + EMAIL + '</a> ou décrivez votre projet dans le <a href="#contact">formulaire de contact</a> — nous répondons rapidement.' },
        { k: ['québec', 'quebec', 'international', 'où', 'ou êtes', 'basé', 'base', 'canada'], t: 'Applications John Maibwe est basée au Québec, au Canada, et ouverte au monde : nous accompagnons des organisations partout au Canada et à l’international, avec rencontres à distance et suivi en ligne.' },
        { k: ['bonjour', 'salut', 'allo', 'hello', 'bonsoir'], t: 'Bonjour ! 👋 Ravi de vous accueillir chez Applications John Maibwe. Posez-moi une question sur nos services, nos produits, nos prix ou nos délais — ou choisissez une suggestion ci-dessous.' },
        { k: ['merci'], t: 'Avec plaisir ! N’hésitez pas si vous avez d’autres questions — ou écrivez-nous via le <a href="#contact">formulaire de contact</a>. À bientôt !' }
      ],
      formNoKey: 'Le formulaire sera actif dès que la clé Web3Forms sera configurée. En attendant, écrivez à ' + EMAIL + '.',
      formSending: 'Envoi en cours…',
      formThanks: function (nom) { return 'Merci ' + (nom || '') + ' ! Nous avons bien reçu votre demande et vous répondrons rapidement, en langage clair.'; },
      formFailed: 'Désolé, l’envoi a échoué. Réessayez dans un instant ou écrivez à ' + EMAIL + '.',
      formNetwork: 'Problème de connexion. Vérifiez votre réseau et réessayez.',
      waText: 'Bonjour John, je vous contacte depuis johnmaibwe.com au sujet d’un projet.'
    },
    en: {
      greeting: 'Hello! 👋 I’m the <strong>Applications John Maibwe</strong> assistant. How can I help you today?',
      fallback: 'Good question! I don’t have the exact answer here, but John will: email <a href="mailto:' + EMAIL + '">' + EMAIL + '</a> or describe your needs in the <a href="#contact">contact form</a>.',
      suggestions: { 'Our services': 'service', 'Our products': 'product', 'Pricing & quotes': 'price', 'Timelines': 'timeline', 'Contact us': 'contact' },
      answers: [
        { k: ['service', 'offer', 'what do you do'], t: 'We build web applications, iOS and Android apps, custom software, artificial intelligence and automation solutions, databases and cloud solutions, and we support organizations through their digital transformation. <a href="#services">See our services</a>' },
        { k: ['product', 'villagemap', 'campus', 'église', 'eglise', 'church', 'parish', 'castor', 'zembo', 'adprotectx', 'promptcam'], t: 'Our products: Église Connect, Castor IA, Campus RDC, VillageMap RDC, Zembo Music AI, AdProtectX and PromptCam. Each card clearly shows whether it is available or still in development. <a href="#produits">Explore our products</a>' },
        { k: ['price', 'cost', 'how much', 'quote', 'rate', 'budget'], t: 'Every project is unique: the price depends on your needs. We offer a <strong>free assessment</strong> and a clear quote before any commitment — no surprises. <a href="#contact">Request a quote</a>' },
        { k: ['timeline', 'time', 'delivery', 'fast', 'when', 'long'], t: 'A business website usually ships within a few weeks; a mobile app or custom software takes longer depending on scope. We give you a realistic schedule from day one — and we stick to it.' },
        { k: ['artificial', ' ai', 'ai ', 'chatgpt', 'automat'], t: 'We bring artificial intelligence where it saves real time: assistants, document sorting and drafting, process automation and connections between your tools. <a href="#services">Learn more</a>' },
        { k: ['website', 'site', 'web'], t: 'We build modern, fast and credible websites and web apps — hosting and domain name included. <a href="#services">Learn more</a>' },
        { k: ['mobile', 'ios', 'android', 'phone', 'app'], t: 'We design custom iOS and Android apps: design, development, publishing on the App Store and Google Play, then maintenance. <a href="#produits">See examples</a>' },
        { k: ['software', 'custom', 'database', 'data', 'cloud'], t: 'When off-the-shelf tools aren’t enough, we build exactly what you need: databases, internal portals and secure cloud solutions. <a href="#services">Our services</a>' },
        { k: ['hosting', 'domain', 'business email'], t: 'Yes! We take care of the domain name, hosting, business email and launch. Nothing technical for you to manage.' },
        { k: ['contact', 'email', 'reach', 'whatsapp', 'write', 'call'], t: 'Email us at <a href="mailto:' + EMAIL + '">' + EMAIL + '</a> or describe your project in the <a href="#contact">contact form</a> — we reply quickly.' },
        { k: ['québec', 'quebec', 'international', 'where', 'based', 'canada', 'located'], t: 'Applications John Maibwe is based in Québec, Canada, and open to the world: we work with organizations across Canada and internationally, with remote meetings and online follow-up.' },
        { k: ['hello', 'hi ', 'hey', 'good morning', 'bonjour'], t: 'Hello! 👋 Welcome to Applications John Maibwe. Ask me about our services, products, pricing or timelines — or pick a suggestion below.' },
        { k: ['thank'], t: 'You’re welcome! Feel free to ask anything else — or write to us through the <a href="#contact">contact form</a>. Talk soon!' }
      ],
      formNoKey: 'The form will be active as soon as the Web3Forms key is configured. Meanwhile, email ' + EMAIL + '.',
      formSending: 'Sending…',
      formThanks: function (nom) { return 'Thank you ' + (nom || '') + '! We received your request and will get back to you shortly, in plain language.'; },
      formFailed: 'Sorry, sending failed. Please try again in a moment or email ' + EMAIL + '.',
      formNetwork: 'Connection problem. Check your network and try again.',
      waText: 'Hello John, I’m reaching out from johnmaibwe.com about a project.'
    }
  }[LANG];

  // ----- WhatsApp (seulement si un numéro est configuré) -----
  if (WHATSAPP_NUMBER) {
    var waUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(T.waText);
    document.querySelectorAll('[data-wa]').forEach(function (el) {
      if (el.tagName === 'A') el.href = waUrl;
      el.querySelectorAll('a').forEach(function (a) { a.href = waUrl; });
      el.hidden = false;
    });
  }

  // ----- Assistant (chatbot 100 % côté client) -----
  (function () {
    var widget = document.getElementById('chatWidget');
    if (!widget) return;
    var fab = document.getElementById('chatFab');
    var closeBtn = document.getElementById('chatClose');
    var msgs = document.getElementById('chatMsgs');
    var quick = document.getElementById('chatQuick');
    var form = document.getElementById('chatForm');
    var input = document.getElementById('chatText');
    var started = false;

    function repondre(question) {
      var q = ' ' + question.toLowerCase() + ' ';
      var meilleur = null, score = 0;
      for (var i = 0; i < T.answers.length; i++) {
        var s = 0;
        for (var j = 0; j < T.answers[i].k.length; j++) {
          if (q.indexOf(T.answers[i].k[j]) !== -1) s++;
        }
        if (s > score) { score = s; meilleur = T.answers[i]; }
      }
      return meilleur ? meilleur.t : T.fallback;
    }

    function ajouter(type, html) {
      var div = document.createElement('div');
      div.className = 'msg ' + (type === 'bot' ? 'msg-bot' : 'msg-user');
      if (type === 'bot') { div.innerHTML = html; } else { div.textContent = html; }
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
      return div;
    }

    function botRepond(question) {
      var typing = document.createElement('div');
      typing.className = 'msg msg-bot msg-typing';
      typing.innerHTML = '<i></i><i></i><i></i>';
      msgs.appendChild(typing);
      msgs.scrollTop = msgs.scrollHeight;
      setTimeout(function () {
        typing.remove();
        ajouter('bot', repondre(question));
      }, reduced ? 120 : 650);
    }

    function demarrer() {
      if (started) return;
      started = true;
      ajouter('bot', T.greeting);
      Object.keys(T.suggestions).forEach(function (s) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = s;
        b.addEventListener('click', function () {
          ajouter('user', s);
          botRepond(T.suggestions[s]);
        });
        quick.appendChild(b);
      });
    }

    function basculer(ouvrir) {
      widget.classList.toggle('chat-open', ouvrir);
      fab.setAttribute('aria-expanded', ouvrir ? 'true' : 'false');
      if (ouvrir) { demarrer(); setTimeout(function () { input.focus(); }, 250); }
    }

    fab.addEventListener('click', function () { basculer(!widget.classList.contains('chat-open')); });
    closeBtn.addEventListener('click', function () { basculer(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && widget.classList.contains('chat-open')) basculer(false);
    });
    msgs.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') basculer(false);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var texte = input.value.trim();
      if (!texte) return;
      input.value = '';
      ajouter('user', texte);
      botRepond(texte);
    });
  })();

  // ----- Bascule thème clair / sombre (mémorisé) -----
  var root = document.querySelector('body-root');
  var themeBtn = document.getElementById('themeToggle');
  function appliquerTheme(sombre) {
    root.classList.toggle('dark', sombre);
    if (themeBtn) themeBtn.setAttribute('aria-pressed', sombre ? 'true' : 'false');
  }
  // Aucun choix enregistré → mode CLAIR par défaut (on ignore volontairement la
  // préférence système prefers-color-scheme). Le choix manuel est ensuite mémorisé.
  // « mt-theme » : clé de l'ancien site, reprise pour ne pas perdre le choix des visiteurs.
  var choix = null;
  try { choix = localStorage.getItem('ajm-theme') || localStorage.getItem('mt-theme'); } catch (e) {}
  appliquerTheme(choix === 'dark');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var sombre = !root.classList.contains('dark');
      appliquerTheme(sombre);
      try { localStorage.setItem('ajm-theme', sombre ? 'dark' : 'light'); } catch (e) {}
    });
  }

  // ----- Header : ombre au défilement + bouton retour en haut -----
  var nav = document.getElementById('siteNav');
  var toTop = document.getElementById('toTop');
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('scrolled', y > 10);
    toTop.classList.toggle('show', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });

  // ----- Menu mobile -----
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // ----- Héros : slider automatique -----
  var slides = document.querySelectorAll('.hero-slide');
  var dots = document.querySelectorAll('.hero-dot');
  var current = 0, timer = null;
  function goTo(i) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (i + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }
  function startTimer() {
    if (reduced) return;
    clearInterval(timer);
    timer = setInterval(function () { goTo(current + 1); }, 5200);
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { goTo(i); startTimer(); });
  });
  startTimer();

  // Barres de progression du héros
  requestAnimationFrame(function () {
    setTimeout(function () { document.querySelector('.hero').classList.add('loaded'); }, 300);
  });

  // ----- Révélations au défilement -----
  var items = document.querySelectorAll('[data-anim]');
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  // ----- Compteurs animés -----
  var counters = document.querySelectorAll('.count');
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    if (reduced) { el.textContent = target; return; }
    var start = null, dur = 1600;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    // JS actif + animations : on repart de 0 pour l'effet de comptage (sans JS,
    // la vraie valeur reste affichée dans le HTML). Réduit-mouvement : on garde la vraie valeur.
    if (!reduced) counters.forEach(function (el) { el.textContent = '0'; });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute('data-target'); });
  }

  // ----- FAQ accordéon -----
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (other) {
        other.classList.remove('open');
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-a').style.maxHeight = '0px';
      });
      if (!isOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  // ----- Formulaire de contact → envoi sécurisé via Web3Forms -----
  // La clé d'accès (champ caché "access_key") route les messages vers la boîte
  // configurée sur web3forms.com. Aucune adresse n'apparaît dans ce code d'envoi.
  var cform = document.getElementById('contactForm');
  if (cform) {
    var statusEl = document.getElementById('formStatus');
    var submitBtn = document.getElementById('formSubmit');
    var successEl = document.getElementById('formSuccess');

    var afficherStatut = function (texte, erreur) {
      statusEl.textContent = texte;
      statusEl.classList.toggle('error', !!erreur);
      statusEl.classList.add('show');
    };

    cform.addEventListener('submit', function (e) {
      e.preventDefault();
      var cle = cform.querySelector('[name="access_key"]').value;
      if (!cle || cle.indexOf('VOTRE_CLE') === 0) {
        afficherStatut(T.formNoKey, false);
        return;
      }
      statusEl.classList.remove('show', 'error');
      submitBtn.setAttribute('aria-busy', 'true');
      var texteInitial = submitBtn.textContent;
      submitBtn.textContent = T.formSending;
      var nom = (document.getElementById('f-nom').value || '').trim();

      fetch(cform.action, { method: 'POST', body: new FormData(cform), headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.success) {
            document.getElementById('successText').textContent = T.formThanks(nom);
            cform.style.display = 'none';
            successEl.classList.add('show');
            successEl.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
          } else {
            afficherStatut(T.formFailed, true);
          }
        })
        .catch(function () {
          afficherStatut(T.formNetwork, true);
        })
        .then(function () {
          submitBtn.removeAttribute('aria-busy');
          submitBtn.textContent = texteInitial;
        });
    });

    var successReset = document.getElementById('successReset');
    if (successReset) {
      successReset.addEventListener('click', function () {
        cform.reset();
        successEl.classList.remove('show');
        cform.style.display = '';
        statusEl.classList.remove('show', 'error');
        document.getElementById('f-nom').focus();
      });
    }
  }
})();
