/* Relationship Advice intake preview: no endpoint, storage, or transmission. */
(() => {
  const t = window.SiteLanguage?.t || (text => text);
  const dialog = document.getElementById('profile-dialog');
  const form = document.getElementById('profile-form');
  if (!dialog || !form || typeof dialog.showModal !== 'function') return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let opener, closing;
  document.querySelectorAll('[data-profile]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      clearTimeout(closing);
      dialog.classList.remove('is-closing');
      dialog.showModal();
      document.documentElement.classList.add('has-dialog');
      dialog.querySelector('.contact-sheet').scrollTop = 0;
      form.querySelector('input').focus({preventScroll:true});
    });
  });
  function close() {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    if (reduced.matches) { dialog.close(); return; }
    dialog.classList.add('is-closing');
    closing = setTimeout(() => { dialog.close(); dialog.classList.remove('is-closing'); }, 380);
  }
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('click', event => { if (event.target === dialog || event.target.closest('[data-profile-close]')) close(); });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('has-dialog');
    opener?.focus({preventScroll:true});
  });
  form.querySelector('button[type="submit"]').disabled = false;
  form.addEventListener('submit', event => {
    event.preventDefault();
    document.getElementById('profile-status').textContent = t('Profile submission isn’t connected yet. Nothing was sent or saved.');
  });
})();
