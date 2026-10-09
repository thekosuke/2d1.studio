/* Relationship Advice intake preview: no endpoint, storage, or transmission. */
(() => {
  const t = window.SiteLanguage?.t || (text => text);
  const dialog = document.getElementById('profile-dialog');
  const form = document.getElementById('profile-form');
  if (!dialog || !form || typeof dialog.showModal !== 'function') return;
  document.querySelectorAll('[data-profile]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      window.SiteDrawer.open(dialog, link);
    });
  });
  form.querySelector('button[type="submit"]').disabled = false;
  form.addEventListener('submit', event => {
    event.preventDefault();
    document.getElementById('profile-status').textContent = t('Profile submission isn’t connected yet. Nothing was sent or saved.');
  });
})();
