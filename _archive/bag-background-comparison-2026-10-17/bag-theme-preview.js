/* Temporary local comparison control; only the product sheet changes. */
(() => {
  if (!['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) return;
  const study = document.querySelector('.bag-study');
  if (!study) return;
  const status = document.createElement('span');
  status.className = 'sr-only';
  status.setAttribute('role', 'status');
  document.body.append(status);
  const japanese = document.documentElement.lang === 'ja';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'bag-theme-toggle';
  button.setAttribute('aria-controls', study.id);
  function label(light) {
    const text = japanese
      ? (light ? '背景を赤に' : '背景を白に')
      : (light ? 'Try red background' : 'Try white background');
    button.setAttribute('aria-label', text);
    button.title = text;
    button.classList.toggle('is-white', light);
  }
  label(false);
  document.body.append(button);
  button.addEventListener('click', () => {
    const light = study.classList.toggle('is-white-preview');
    label(light);
    status.textContent = japanese
      ? (light ? 'バッグ紹介：白背景' : 'バッグ紹介：赤背景')
      : (light ? 'Bag study: white background' : 'Bag study: red background');
    dispatchEvent(new Event('bag-theme-change'));
  });
})();
