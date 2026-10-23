/* i18n.js — every user-visible string written by JavaScript, one dictionary per language.
 *
 * The language comes from <html lang="fr-CA"> / <html lang="en-CA"> (first two letters);
 * anything else falls back to French. build.py places this file right after core.js.
 *
 *   AJM.t('formSending')            → 'Envoi en cours…'   (or the English string on /en/)
 *   AJM.t('formThanks', 'Marie')    → functions receive the extra arguments
 *   AJM.lang   'fr' | 'en'          AJM.locale   'fr-CA' | 'en-CA' (for Intl)
 *
 * Text that already lives in the HTML is translated in the HTML, not here: the terminal lines
 * (sections/en/donnees.html), counter values and labels (sections/en/chiffres.html), the pause
 * button's accessible name (sections/en/hero.html), menu links and footer (page.en.html)…
 *
 * Translators: keep the keys and the function signatures; translate only the strings.
 * A key missing from `en` falls back to French (with a console warning).
 */
var EMAIL = 'john@johnmaibwe.com';

var STRINGS = {
  fr: {
    /* Header « Menu » button (< 1100 px), label while closed / open */
    menuOpen: 'Menu',
    menuClose: 'Fermer',
    /* Hero pause button tooltip (title). Its accessible name stays the sr-only text in
       sections/hero.html, and aria-pressed says whether the animations are paused. */
    heroPause: 'Mettre les animations en pause',
    heroResume: 'Relancer les animations',
    /* Contact form (contact.js) — same wording as the previous live site (site.js) */
    formSending: 'Envoi en cours…',
    formTooShort: 'Merci de préciser votre nom (2 caractères minimum) et votre demande (20 caractères minimum).',
    formTooManyLinks: 'Pour éviter les messages indésirables, limitez votre message à 3 liens. Vous pourrez nous envoyer les autres par courriel.',
    formFailed: 'Désolé, l’envoi a échoué. Réessayez dans un instant ou écrivez à ' + EMAIL + '.',
    formNetwork: 'Problème de connexion. Vérifiez votre réseau et réessayez.',
    formThanks: function (name) {
      return 'Merci' + (name ? ' ' + name : '') + ' ! Nous avons bien reçu votre demande et vous répondrons rapidement, en langage clair.';
    },
    /* Subject of the e-mail John receives (Web3Forms): the chosen topic, to sort at a glance. */
    formSubject: function (topic) { return 'Nouveau message — ' + topic + ' — johnmaibwe.com'; }
  },

  en: {
    menuOpen: 'Menu',
    menuClose: 'Close',
    heroPause: 'Pause animations',        // same text as the sr-only name in sections/en/hero.html
    heroResume: 'Resume animations',
    /* Contact form: the English strings of the previous live /en/ page (site.js), already
       approved. The subject format is fixed: John's mailbox sorts on it. */
    formSending: 'Sending…',
    formTooShort: 'Please enter your name (at least 2 characters) and describe your request (at least 20 characters).',
    formTooManyLinks: 'To keep spam out, please include at most 3 links. You can email us the others.',
    formFailed: 'Sorry, sending failed. Please try again in a moment or email ' + EMAIL + '.',
    formNetwork: 'Connection problem. Check your network and try again.',
    formThanks: function (name) {
      return 'Thank you' + (name ? ', ' + name : '') + '! We’ve received your request and will get back to you shortly, in plain language.';
    },
    formSubject: function (topic) { return 'New message (EN) — ' + topic + ' — johnmaibwe.com'; }
  }
};

var root = document.documentElement;
var lang = (root.getAttribute('lang') || 'fr').slice(0, 2).toLowerCase();
if (!STRINGS[lang]) lang = 'fr';

AJM.lang = lang;
AJM.locale = root.getAttribute('lang') || (lang === 'en' ? 'en-CA' : 'fr-CA');
AJM.strings = STRINGS[lang];
AJM.t = function (key) {
  var value = STRINGS[lang][key];
  if (value === undefined) {
    value = STRINGS.fr[key];
    console.warn('[AJM] i18n: no "' + lang + '" string for "' + key + '", using French.');
  }
  if (typeof value === 'function') return value.apply(null, Array.prototype.slice.call(arguments, 1));
  return value === undefined ? key : value;
};
