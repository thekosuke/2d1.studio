/* The photo's native disclosure enhances to an undimmed, nonmodal side sheet. */
(() => {
  const disclosure = document.querySelector('.tote-specifications');
  if (!disclosure || !window.HTMLDialogElement) return;
  const trigger = disclosure.querySelector('summary');
  const sheet = disclosure.querySelector('.tote-spec-sheet');
  const dialog = document.createElement('dialog');
  dialog.id = 'tote-spec-dialog';
  dialog.className = 'tote-spec-dialog';
  dialog.setAttribute('aria-labelledby', 'tote-spec-title');
  dialog.append(sheet);
  document.body.append(dialog);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = trigger.className;
  const label = document.createElement('span');
  label.className = 'tote-spec-label';
  label.textContent = trigger.textContent;
  button.append(label);
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-controls', dialog.id);
  button.setAttribute('aria-expanded', 'false');
  disclosure.replaceWith(button);
  const closeButton = sheet.querySelector('[data-close]');
  const heading = sheet.querySelector('.contact-title');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let closeTimer;
  heading.tabIndex = -1;
  closeButton.hidden = false;
  function open() {
    clearTimeout(closeTimer);
    dialog.classList.remove('is-closing');
    if (!dialog.open) dialog.show();
    sheet.querySelector('.tote-spec-content').scrollTop = 0;
    dialog.getBoundingClientRect();
    dialog.classList.add('is-visible');
    button.setAttribute('aria-expanded', 'true');
    heading.focus({preventScroll:true});
  }
  function close(restoreFocus = true) {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    dialog.classList.add('is-closing');
    dialog.classList.remove('is-visible');
    button.setAttribute('aria-expanded', 'false');
    if (restoreFocus) button.focus({preventScroll:true});
    const finish = () => {
      dialog.close();
      dialog.classList.remove('is-closing');
      sheet.querySelectorAll('details[open]').forEach(detail => { detail.open = false; });
    };
    if (reduced.matches) finish();
    else closeTimer = setTimeout(finish, parseFloat(getComputedStyle(dialog).transitionDuration) * 1000 + 30);
  }
  button.addEventListener('click', () => dialog.open && !dialog.classList.contains('is-closing') ? close() : open());
  closeButton.addEventListener('click', () => close());
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dialog.open) { event.preventDefault(); close(); }
  });
  document.addEventListener('pointerdown', event => {
    if (dialog.open && !dialog.contains(event.target) && !button.contains(event.target)) close(false);
  });
})();

/* Match each fixed navigation item to the visible part of the tote photo. */
(() => {
  const photo=document.querySelector('.bag-lifestyle');
  if(!photo)return;
  const lead=document.querySelector('.bag-study-lead');
  const copy=document.querySelector('.bag-product-copy');
  const controls=[...document.querySelectorAll('.page-nav a,.mobile-nav-toggle')];
  let pending=false;
  function paint(){
    pending=false;
    const box=photo.getBoundingClientRect();
    const top=Math.max(box.top,lead?.getBoundingClientRect().bottom??box.top);
    const bottom=Math.min(box.bottom,copy?.getBoundingClientRect().top??box.bottom);
    controls.forEach(control=>{
      const rect=control.getBoundingClientRect(),y=rect.top+rect.height/2;
      control.classList.toggle('on-bag-photo',y>=top&&y<bottom);
    });
  }
  function schedule(){if(!pending){pending=true;requestAnimationFrame(paint);}}
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);
  new ResizeObserver(schedule).observe(photo);
  paint();
})();
