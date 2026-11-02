/* Contact ----------------------------------------------------------------------
 * "Contact us" (the bar, the footer, any link with data-contact) opens a native
 * dialog, on any page: this script adds it. Its pixel eyes open when it
 * arrives, look at whichever field you're in (and follow the text as you type),
 * squint at a mistake, look up while sending, and hop when it's done.
 * Submissions go to the endpoint in js/config.js, which writes to the Notion
 * "2D1 Website Inquiries" database (see docs/CONTACT.md). Without an endpoint
 * nothing is sent, and the form says so. Without JavaScript the links open the
 * email fallback.
 */
(() => {
  if (!document.querySelector('#contact') && !document.querySelector('[data-contact]')) return;
  const t = window.SiteLanguage?.t || (text => text);
  if (!document.querySelector('#contact')) {
    document.body.insertAdjacentHTML('beforeend', `
    <dialog class="contact" id="contact" aria-labelledby="contact-title">
      <div class="contact-sheet">
        <div class="contact-head">
          <span class="contact-eyes" aria-hidden="true"><i></i><i></i></span>
          <button class="contact-close" type="button" data-close><span>Close</span><span class="contact-x" aria-hidden="true"></span></button>
        </div>
        <form class="contact-form" id="contact-form" novalidate>
          <h2 class="contact-title" id="contact-title">Hello.</h2>
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
              <label class="chip"><input type="radio" name="category" value="Collaboration"><span>Collaboration</span></label>
              <label class="chip"><input type="radio" name="category" value="Other"><span>Other</span></label>
            </div>
          </fieldset>
          <div class="field">
            <label class="field-label" for="c-message">Message <span class="req" aria-hidden="true"></span><span class="count-chars" aria-hidden="true"><span id="c-count">0</span>/2000</span></label>
            <textarea class="field-input field-area" id="c-message" name="message" rows="3" required maxlength="2000" placeholder="What’s on your mind?"></textarea>
          </div>
          <div class="field-trap" aria-hidden="true"><label for="c-website">Website</label><input id="c-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
          <p class="contact-privacy" hidden>We use your details to respond to your inquiry. <a href="${window.SiteLanguage?.japanese ? '/ja/privacy/' : '/privacy/'}" target="_blank" rel="noopener noreferrer" aria-label="Privacy (opens in a new tab)">How we handle your information</a>${window.SiteLanguage?.japanese ? 'をご確認ください。' : '.'}</p>
          <div class="contact-foot">
            <button class="contact-send intro-cta" type="submit"><span class="send-label">Send</span><span class="send-arrow pixel-arrow" aria-hidden="true"></span></button>
            <p class="contact-status" id="contact-status" role="status" aria-live="polite"></p>
          </div>
        </form>
        <div class="contact-done" hidden>
          <p class="contact-title contact-done-title" tabindex="-1">Thank you<span class="done-name"></span>${window.SiteLanguage?.japanese ? '。' : '.'}</p>
          <p class="contact-intro">Your message is in. We’ll get back to you within five business days.</p>
          <button class="contact-send intro-cta" type="button" data-close><span class="send-label">Close</span></button>
        </div>
        <p class="contact-fallback" hidden>This form is not connected yet. Nothing was sent. Please email <a href="mailto:kosuke@2d1.studio">kosuke@2d1.studio</a> instead.</p>
      </div>
    </dialog>`);
  }
  const contact = document.querySelector('#contact');
  window.SiteLanguage?.translate(contact);
  const contactForm = document.querySelector('#contact-form');
  if (contact && contactForm && (typeof contact.showModal === 'function' || contact.classList.contains('contact-page-form'))) {
    const eyes = contact.querySelector('.contact-eyes');
    const cStatus = contact.querySelector('#contact-status');
    const send = contactForm.querySelector('.contact-send');
    send.disabled = false; // Static contact pages keep submission disabled without JavaScript.
    const sendLabel = send.querySelector('.send-label');
    const done = contact.querySelector('.contact-done');
    const fallback = contact.querySelector('.contact-fallback');
    const message = contactForm.querySelector('#c-message');
    const counter = contact.querySelector('#c-count');
    const messagePrompts = {
      'New Business': 'Tell us about your project, what you need, and your timeline.',
      'Media Inquiry': 'Tell us about your publication, inquiry, and deadline.',
      'Collaboration': 'Tell us about the collaboration you have in mind.',
      'Other': 'What’s on your mind?'
    };
    const updateMessagePrompt = () => {
      const category = contactForm.querySelector('input[name="category"]:checked')?.value;
      message.placeholder = t(messagePrompts[category] || 'What’s on your mind?');
    };
    updateMessagePrompt();
    contactForm.addEventListener('reset', () => queueMicrotask(updateMessagePrompt));

    const fields = [...contactForm.querySelectorAll('.field-input, input[type="radio"]')];
    let sending = false, opener = null;
    let submissionId = null, submissionFingerprint = ''; // Memory only; keep retry identity after an uncertain response.

    const look = (x, y) => { eyes.style.setProperty('--lx', x.toFixed(2)); eyes.style.setProperty('--ly', y.toFixed(2)); };
    const mood = (name) => { eyes.dataset.mood = name || ''; };
    function glance(el) {
      const e = eyes.getBoundingClientRect(), r = el.getBoundingClientRect();
      let tx = r.left + Math.min(r.width, 24 + (el.value || '').length * 11);
      look(Math.max(-1, Math.min(1, (tx - (e.left + e.width / 2)) / 400)), Math.max(-1, Math.min(1, (r.top - e.bottom) / 500)));
    }

    function open(event) {
      if (event) { if (event.metaKey || event.ctrlKey || event.shiftKey || event.button > 0) return; event.preventDefault(); }
      const navigation = event?.currentTarget?.closest('.mobile-nav-panel')?.mobileNavigation;
      opener = navigation?.active ? navigation.returnFocus : document.activeElement;
      window.SiteDrawer.open(contact, opener);
      mood('');
      look(0, 0.4);
    }
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
    if (contact.classList.contains('contact-page-form')) {
      contactForm.querySelectorAll('input[type="radio"]').forEach(r => {
        let wasSelected=false;
        const remember=()=>{wasSelected=r.checked;};
        r.closest('label').addEventListener('pointerdown',remember);
        r.addEventListener('keydown',event=>{if(event.key===' ')remember();});
        r.addEventListener('click',()=>{
          if(wasSelected){r.checked=false;r.dispatchEvent(new Event('change',{bubbles:true}));}
          wasSelected=false;
        });
      });
    }
    contactForm.querySelectorAll('input[type="radio"]').forEach((r) => r.addEventListener('change', () => {
      updateMessagePrompt();
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
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 15000);
      try {
        let endpoint = window.TWO_D_ONE_CONFIG?.contactEndpoint;
        if (!endpoint) {
          // A static preview stays unconnected. The Worker advertises readiness
          // only after its secret, retry ledger and Notion mail automation are configured.
          let readiness;
          try {
            const check = await fetch('/api/contact/config', {headers:{Accept:'application/json'}, signal:controller.signal, credentials:'omit', cache:'no-store'});
            if(check.ok)readiness = await check.json();
          } catch(error) { if(error.name === 'AbortError') throw error; }
          if(readiness?.status === 'ready')endpoint = '/api/contact';
        }
        if (!endpoint) { const e = new Error('not-configured'); e.code = 'not-configured'; throw e; }
        const url = new URL(endpoint, window.location.origin);
        if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') throw new Error('The form is temporarily unavailable. Please try again later.');
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data), signal: controller.signal, credentials: 'omit' });
        const result = await response.json().catch(() => ({}));
        if (result.error === 'CONTACT_NOT_CONFIGURED') { const e = new Error('not-configured'); e.code = 'not-configured'; throw e; }
        if (response.status === 429) throw new Error('A few too many messages. Please wait a moment and try again.');
        if (response.status === 422) throw new Error('Something in the form needs another look. Please check your details.');
        if (result.error === 'SUBMISSION_IN_PROGRESS') throw new Error('Your message is still being processed. Please wait a minute before trying again.');
        if (!response.ok) throw new Error('We couldn’t confirm your message was received. Please try again.');
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
      data.language = document.documentElement.lang === 'ja' ? 'ja' : 'en';
      data.sourceUrl = location.origin + location.pathname;
      const fingerprint = JSON.stringify(data);
      if (fingerprint !== submissionFingerprint || !submissionId) {
        // randomUUID is secure-context-only; getRandomValues also works on
        // the private HTTP phone preview. Keep cryptographic UUIDv4 retry IDs.
        const bytes = crypto.getRandomValues(new Uint8Array(16));
        bytes[6] = (bytes[6] & 15) | 64;
        bytes[8] = (bytes[8] & 63) | 128;
        const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
        submissionId = `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
        submissionFingerprint = fingerprint;
      }
      data.submissionId = submissionId;
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
        submissionId = null; submissionFingerprint = '';
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
