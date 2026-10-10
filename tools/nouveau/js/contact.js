/* contact — final call to action + contact form.
 * Essential behaviour (always, also in reduced motion): the form submit, ported from the live
 * site (public/assets/site.js, « Formulaire de contact »): honeypot + 3 s timer → silent fake
 * success for robots, length checks, more than 3 links refused, fetch to Web3Forms with
 * Accept: application/json, aria-busy on the button, messages in a polite live region, then a
 * success panel (focused) with « Envoyer un autre message ». Without JS the form posts normally.
 * Motion only: the mega headline rises word by word from a mask, then the lead, the form and the
 * e-mail follow; the e-mail underline draws with a scaleX wipe. */
AJM.register('contact', function (api) {
  setupForm(api);

  if (!api.motion) return; // reduced motion or no GSAP: static page

  var gsap = api.gsap;
  var title = api.$('#contact-title');
  var words = api.utils.splitWords(title, { mask: true });

  var tl = gsap.timeline({ scrollTrigger: { trigger: title, start: 'top 82%', once: true } });
  tl.from(words, { yPercent: 115, duration: 1.3, ease: AJM.ease.out, stagger: 0.09 }, 0)
    .from(api.q('.contact__lead, .contact__reassure, .contact__side > :not(.contact__mail)'), {
      y: 24, opacity: 0, duration: AJM.dur.reveal, ease: AJM.ease.out, stagger: 0.07, clearProps: 'transform,opacity'
    }, 0.45)
    .from(api.$('.contact__mail-text'), { y: 24, opacity: 0, duration: AJM.dur.reveal, ease: AJM.ease.out, clearProps: 'transform,opacity' }, 0.75)
    .fromTo(api.$('.contact__mail-line'), { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: AJM.ease.out }, 1.05);
  gsap.from(api.q('.contact__form > .contact__row, .contact__form > .contact__field, .contact__form > .contact__send, .contact__form > .contact__note'), {
    y: 20, opacity: 0, duration: AJM.dur.reveal, ease: AJM.ease.out, stagger: 0.06, clearProps: 'transform,opacity',
    scrollTrigger: { trigger: api.$('.contact__form'), start: 'top 85%', once: true }
  });
});

function setupForm(api) {
  var form = api.$('#contact-form');
  if (!form) return;
  var EMAIL = 'john@johnmaibwe.com';
  var status = api.$('#contact-status');
  var submit = api.$('#contact-submit');
  var submitLabel = api.$('.contact__submit-label');
  var success = api.$('#contact-success');
  var successTitle = api.$('#contact-success-title');
  var successText = api.$('#contact-success-text');
  var again = api.$('#contact-again');
  var nameField = api.$('#contact-nom');
  var messageField = api.$('#contact-message');
  var subjectField = api.$('#contact-sujet');
  var initialLabel = submitLabel.textContent;
  var loadedAt = Date.now();
  var sending = false;

  function say(text, isError) {
    status.textContent = text;
    status.classList.toggle('is-error', !!isError);
  }
  function showSuccess(name) {
    successText.textContent = 'Merci' + (name ? ' ' + name : '') +
      ' ! Nous avons bien reçu votre demande et vous répondrons rapidement, en langage clair.';
    form.hidden = true;
    success.hidden = false;
    successTitle.focus();
  }

  // Anti-spam, as on the live site (on top of Web3Forms' own filter): a robot fills the form in
  // less than 3 seconds or ticks the invisible box. Then the confirmation is shown WITHOUT
  // sending anything. A message with more than 3 links is refused with an explanation.
  api.listen(form, 'submit', function (e) {
    e.preventDefault();
    if (sending) return;
    var name = (nameField.value || '').trim();
    var trap = form.querySelector('[name="botcheck"]');
    if ((trap && trap.checked) || Date.now() - loadedAt < 3000) {
      showSuccess(name);
      return;
    }
    // The browser checks minlength only after keyboard input: check again here.
    var message = (messageField.value || '').trim();
    if (name.length < 2 || message.length < 20) {
      say('Merci de préciser votre nom (2 caractères minimum) et votre demande (20 caractères minimum).', true);
      return;
    }
    if ((message.match(/https?:\/\/|www\./gi) || []).length > 3) {
      say('Pour éviter les messages indésirables, limitez votre message à 3 liens. Vous pourrez nous envoyer les autres par courriel.', true);
      return;
    }
    say('', false);
    sending = true;
    submit.setAttribute('aria-busy', 'true');
    submitLabel.textContent = 'Envoi en cours…';

    var data = new FormData(form);
    // Subject of the e-mail received: the chosen category, to sort at a glance.
    data.set('subject', 'Nouveau message — ' + subjectField.value + ' — johnmaibwe.com (prototype)');

    fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.success) showSuccess(name);
        else say('Désolé, l’envoi a échoué. Réessayez dans un instant ou écrivez à ' + EMAIL + '.', true);
      })
      .catch(function () {
        say('Problème de connexion. Vérifiez votre réseau et réessayez.', true);
      })
      .then(function () {
        sending = false;
        submit.removeAttribute('aria-busy');
        submitLabel.textContent = initialLabel;
      });
  });

  api.listen(again, 'click', function () {
    form.reset();
    success.hidden = true;
    form.hidden = false;
    say('', false);
    loadedAt = Date.now();
    nameField.focus();
  });
}
