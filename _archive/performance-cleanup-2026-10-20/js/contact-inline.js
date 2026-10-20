/* Inline contact. Nothing is sent or stored until an endpoint is configured. */
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('contact-status');
  const notice = document.getElementById('contact-notice');
  const button = form.querySelector('button');
  const controls = [...form.querySelectorAll('input,select,textarea,button')];
  const endpoint = window.TWO_D_ONE_CONFIG?.contactEndpoint;
  let pending = false;
  // A square settles beside filled fields; the message grows as you write.
  const fields = [...form.querySelectorAll('.field')];
  function reflect(field) {
    const input = field.querySelector('input,select,textarea');
    field.classList.toggle('is-filled', Boolean(input.value.trim()));
    if (input.tagName === 'TEXTAREA') {
      input.style.height = 'auto';
      input.style.height = `${input.scrollHeight + 1}px`;
    }
  }
  fields.forEach(field => {
    field.addEventListener('input', () => reflect(field));
    field.addEventListener('change', () => reflect(field));
  });
  form.addEventListener('reset', () => requestAnimationFrame(() => fields.forEach(reflect)));

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending) return;
    if (!endpoint) {
      status.textContent = 'This form isn’t connected yet. Nothing was sent or saved. Please use the contact form linked below.';
      return;
    }
    const data=Object.fromEntries(new FormData(form));
    Object.keys(data).forEach(key => data[key]=data[key].trim());
    if (!data.name || !data.message) { status.textContent='Please add your name and message.'; return; }
    let url;
    try { url=new URL(endpoint,location.origin); } catch { status.textContent='The form is unavailable. Please use the contact form linked below.'; return; }
    if (url.protocol!=='https:' && !['localhost','127.0.0.1'].includes(url.hostname)) { status.textContent='The form is unavailable. Please use the contact form linked below.'; return; }
    pending=true; button.disabled=true; form.setAttribute('aria-busy','true');
    form.querySelectorAll('input,textarea').forEach(el=>el.readOnly=true);
    form.querySelector('select').disabled=true;
    status.textContent='Sending…';
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),15000);
    try {
      const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data),credentials:'omit',signal:controller.signal});
      const result=await response.json().catch(()=>({}));
      if (!response.ok || result.status!=='received') throw new Error('unconfirmed');
      status.textContent='Thank you. Your message has been received.';
      form.reset();
    } catch {
      status.textContent='We couldn’t confirm your message was received. Please try again or use the contact form linked below.';
      notice.hidden=false;
      notice.firstChild.textContent='You can also get in touch through ';
    } finally {
      clearTimeout(timeout); pending=false; button.disabled=false; form.removeAttribute('aria-busy');
      form.querySelectorAll('input,textarea').forEach(el=>el.readOnly=false);
      form.querySelector('select').disabled=false;
    }
  });
  controls.forEach(el=>el.disabled=false);
  if (endpoint) notice.hidden=true;
})();
