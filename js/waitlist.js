/* Design preview only. A dedicated waitlist endpoint must be agreed before launch. */
(() => {
  const form = document.getElementById('waitlist-form');
  if (!form) return;
  const status = document.getElementById('waitlist-status');
  form.addEventListener('submit', event => {
    event.preventDefault();
    status.textContent = 'The waitlist isn’t open yet. Your email wasn’t sent or saved.';
  });
  form.querySelectorAll('input,button').forEach(control => { control.disabled = false; });
})();
