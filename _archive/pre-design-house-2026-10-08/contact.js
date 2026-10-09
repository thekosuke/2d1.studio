/* Contact ----------------------------------------------------------------------
 * "Contact us" (the bar, the footer, any link with data-contact) opens a native
 * dialog, on any page: this script adds it. Its pixel eyes open when it
 * arrives, look at whichever field you're in (and follow the text as you type),
 * squint at a mistake, look up while sending, and hop when it's done.
 * Submissions go to the endpoint in js/config.js, which writes to the Notion
 * "Form Submissions" database (see docs/CONTACT.md). Without an endpoint
 * nothing is sent, and the form says so. Without JavaScript the links open the
 * Notion form itself.
 */
(() => {
  const t = window.SiteLanguage?.t || (text => text);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!document.querySelector('#contact')) {
    document.body.insertAdjacentHTML('beforeend', `
    <dialog class="contact" id="contact" aria-labelledby="contact-title">
      <div class="contact-sheet">
        <div class="contact-head">
          <span class="contact-eyes" aria-hidden="true"><i></i><i></i></span>
          <button class="contact-close" type="button" data-close><span>Close</span><span class="contact-x" aria-hidden="true"></span></button>
        </div>
        <form class="contact-form" id="contact-form" novalidate>
          <h2 class="contact-title" id="contact-title">Say hello.</h2>
          <p class="contact-intro">Tell us a little about you and what you have in mind.</p>
          <p class="contact-notice">This form isn’t connected yet. Nothing you enter is sent or saved.</p>
          <div class="field">
            <label class="field-label" for="c-name">Full name <span class="req" aria-hidden="true"></span></label>
            <input class="field-input" id="c-name" name="name" type="text" autocomplete="name" required maxlength="120">
          </div>
          <div class="field">
            <label class="field-label" for="c-email">Email <span class="req" aria-hidden="true"></span></label>
            <input class="field-input" id="c-email" name="email" type="email" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false" required maxlength="254">
          </div>
          <div class="field">
            <label class="field-label" for="c-company">Company <span class="opt">Optional</span></label>
            <input class="field-input" id="c-company" name="company" type="text" autocomplete="organization" maxlength="120">
          </div>
          <fieldset class="field field-choice">
            <legend class="field-label">Category <span class="req" aria-hidden="true"></span></legend>
            <div class="chips">
              <label class="chip"><input type="radio" name="category" value="New Business" required><span>New Business</span></label>
              <label class="chip"><input type="radio" name="category" value="Media Inquiry"><span>Media Inquiry</span></label>
              <label class="chip"><input type="radio" name="category" value="Other"><span>Other</span></label>
            </div>
          </fieldset>
          <div class="field">
            <label class="field-label" for="c-message">Message <span class="req" aria-hidden="true"></span><span class="count-chars" aria-hidden="true"><span id="c-count">0</span>/2000</span></label>
            <textarea class="field-input field-area" id="c-message" name="message" rows="3" required maxlength="2000"></textarea>
          </div>
          <div class="field-trap" aria-hidden="true"><label for="c-website">Website</label><input id="c-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
          <div class="contact-foot">
            <button class="contact-send" type="submit"><span class="send-label">Send</span><span class="send-arrow" aria-hidden="true">→</span></button>
            <p class="contact-status" id="contact-status" role="status" aria-live="polite"></p>
          </div>
        </form>
        <div class="contact-done" hidden>
          <p class="contact-title contact-done-title" tabindex="-1">Thank you<span class="done-name"></span>.</p>
          <p class="contact-intro">Your message is in. We’ll get back to you within five business days.</p>
          <button class="contact-send" type="button" data-close><span class="send-label">Close</span></button>
        </div>
        <p class="contact-fallback" hidden>Our form isn’t connected yet, so nothing was sent. You can reach us through <a href="https://temporal-sight-127.notion.site/966aab52301b4588a1c875bf81ac421a?pvs=105" target="_blank" rel="noopener noreferrer">our Notion form<span class="sr-only"> (opens in a new tab)</span></a> instead.</p>
      </div>
    </dialog>`);
  }
  const contact = document.querySelector('#contact');
  window.SiteLanguage?.translate(contact);
  const contactForm = document.querySelector('#contact-form');
  if (contact && contactForm && typeof contact.showModal === 'function') {
    const eyes = contact.querySelector('.contact-eyes');
    const cStatus = contact.querySelector('#contact-status');
    const send = contactForm.querySelector('.contact-send');
    const sendLabel = send.querySelector('.send-label');
    const done = contact.querySelector('.contact-done');
    const fallback = contact.querySelector('.contact-fallback');
    const message = contactForm.querySelector('#c-message');
    const counter = contact.querySelector('#c-count');
    const fields = [...contactForm.querySelectorAll('.field-input, input[type="radio"]')];
    let sending = false, opener = null;

    const look = (x, y) => { eyes.style.setProperty('--lx', x.toFixed(2)); eyes.style.setProperty('--ly', y.toFixed(2)); };
    const mood = (name) => { eyes.dataset.mood = name || ''; };
    function glance(el) {
      const e = eyes.getBoundingClientRect(), r = el.getBoundingClientRect();
      let tx = r.left + Math.min(r.width, 24 + (el.value || '').length * 11);
      look(Math.max(-1, Math.min(1, (tx - (e.left + e.width / 2)) / 400)), Math.max(-1, Math.min(1, (r.top - e.bottom) / 500)));
    }

    function open(event) {
      if (event) { if (event.metaKey || event.ctrlKey || event.shiftKey || event.button > 0) return; event.preventDefault(); }
      opener = document.activeElement;
      contact.classList.remove('is-closing');
      contact.showModal();
      contact.querySelector('.contact-sheet').scrollTop = 0;
      document.documentElement.classList.add('has-dialog');
      mood('closed');
      window.setTimeout(() => mood(''), reducedMotion.matches ? 0 : 650);   // they open once it lands
      look(0, 0.4);
      if (!done.hidden) return;
      window.setTimeout(() => { if (contact.open) contactForm.querySelector('#c-name').focus({ preventScroll: true }); }, reducedMotion.matches ? 0 : 520);
    }
    function close() {
      if (!contact.open) return;
      if (reducedMotion.matches) { contact.close(); return; }
      contact.classList.add('is-closing');
      window.setTimeout(() => { contact.classList.remove('is-closing'); contact.close(); }, 380);
    }
    contact.addEventListener('close', () => { document.documentElement.classList.remove('has-dialog'); opener?.focus?.({ preventScroll: true }); });
    contact.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
    contact.addEventListener('click', (event) => { if (event.target === contact || event.target.closest('[data-close]')) close(); });
    document.querySelectorAll('[data-contact]').forEach((link) => link.addEventListener('click', open));

    fields.forEach((field) => {
      field.addEventListener('focus', () => glance(field));
      field.addEventListener('input', () => {
        glance(field);
        field.removeAttribute('aria-invalid');
        field.closest('.field')?.classList.remove('is-wrong');
        if (cStatus.dataset.state === 'error') { cStatus.textContent = ''; cStatus.dataset.state = ''; mood(''); }
        contactForm.classList.toggle('is-ready', contactForm.checkValidity());
      });
    });
    contactForm.querySelectorAll('input[type="radio"]').forEach((r) => r.addEventListener('change', () => {
      contactForm.classList.toggle('is-ready', contactForm.checkValidity());
      mood('happy'); window.setTimeout(() => mood(''), 500);
    }));
    // The message box grows with what you write.
    message.addEventListener('input', () => {
      counter.textContent = message.value.length;
      message.style.height = 'auto';
      message.style.height = `${Math.min(message.scrollHeight, 320)}px`;
    });

    const say = (text, state) => { cStatus.textContent = t(text); cStatus.dataset.state = state; };

    async function deliver(data) {
      const endpoint = window.TWO_D_ONE_CONFIG?.contactEndpoint;
      if (!endpoint) { const e = new Error('not-configured'); e.code = 'not-configured'; throw e; }
      const url = new URL(endpoint, window.location.origin);
      if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') throw new Error('The form is temporarily unavailable. Please try again later.');
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data), signal: controller.signal, credentials: 'omit' });
        if (response.status === 429) throw new Error('A few too many messages. Please wait a moment and try again.');
        if (response.status === 422) throw new Error('Something in the form needs another look. Please check your details.');
        if (!response.ok) throw new Error('We couldn’t send your message. Please try again in a moment.');
        const result = await response.json().catch(() => ({}));
        if (result?.status !== 'received') throw new Error('We couldn’t confirm your message was received. Please try again.');
      } finally {
        window.clearTimeout(timeout);
      }
    }

    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (sending) return;
      fallback.hidden = true;
      contactForm.querySelectorAll('.field-input').forEach((f) => { f.value = f.value.trim(); });
      const invalid = fields.find((f) => !f.checkValidity());
      if (invalid) {
        const field = invalid.closest('.field');
        field.classList.remove('is-wrong'); void field.offsetWidth; field.classList.add('is-wrong');
        invalid.setAttribute('aria-invalid', 'true');
        say(invalid.type === 'email' && invalid.value ? 'Please check your email address.' : invalid.type === 'radio' ? 'Please choose a category.' : t('Please fill in this required field.'), 'error');
        mood('squint');
        invalid.focus();
        return;
      }
      const data = Object.fromEntries(new FormData(contactForm));
      if (data.website) { say('Nothing was sent.', 'error'); return; } // a bot filled the hidden field
      delete data.website;
      sending = true;
      send.disabled = true;
      contactForm.setAttribute('aria-busy', 'true');
      sendLabel.textContent = t('Sending');
      contactForm.classList.add('is-sending');
      mood('up');
      say('One moment…', 'loading');
      try {
        await deliver(data);
        say('', '');
        done.querySelector('.done-name').textContent = window.SiteLanguage?.japanese ? '' : data.name ? `, ${data.name.split(/\s+/)[0]}` : '';
        contactForm.hidden = true;
        done.hidden = false;
        contactForm.reset();
        counter.textContent = '0';
        mood('hop');
        done.querySelector('.contact-done-title').focus();
      } catch (error) {
        if (error.code === 'not-configured') {
          say('', '');
          fallback.hidden = false;
          mood('shrug');
        } else {
          say(error.name === 'AbortError' ? 'That took a little too long. Please try again.' : error instanceof TypeError ? 'We couldn’t connect. Please try again in a moment.' : error.message, 'error');
          mood('squint');
        }
      } finally {
        sending = false;
        send.disabled = false;
        contactForm.removeAttribute('aria-busy');
        contactForm.classList.remove('is-sending');
        sendLabel.textContent = t('Send');
      }
    });
    // Reopening after a sent message starts a fresh form.
    contact.addEventListener('close', () => { if (!done.hidden) { done.hidden = true; contactForm.hidden = false; contactForm.classList.remove('is-ready'); } });
  }
})();
