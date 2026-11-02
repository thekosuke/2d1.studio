/* One local collection, shared by EN/JA. No account or remote storage. */
window.initializeSavedObjects = ({catalog, show}) => {
  const t = window.SiteLanguage?.t || (text => text);
  const key = '2d1-fc-saved-v1';
  const ids = new Set(catalog.map(item => item.id));
  const parse = value => { try { const list = JSON.parse(value); return new Set(Array.isArray(list) ? list.filter(id => typeof id === 'string' && ids.has(id)) : []); } catch { return new Set(); } };
  let saved = new Set(), persistent = true, current = null;
  try { saved = parse(localStorage.getItem(key)); } catch { persistent = false; }
  const element = (tag, className, text) => { const node = document.createElement(tag); node.className = className; if (text) node.textContent = t(text); return node; };
  const button = (className, text) => { const node = element('button', className, text); node.type = 'button'; return node; };
  const heart = () => { const icon = element('span', 'pixel-heart'); icon.setAttribute('aria-hidden','true'); return icon; };
  const trigger = button('objects-saved-trigger');
  const count = element('span', 'objects-saved-count'); trigger.append(heart(), count);
  trigger.setAttribute('aria-expanded','false'); trigger.setAttribute('aria-haspopup', 'dialog'); trigger.setAttribute('aria-controls', 'objects-saved-dialog');
  document.querySelector('.objects-view-dock').append(trigger);
  const sheet = element('dialog', 'objects-saved-dialog'); sheet.id = 'objects-saved-dialog'; sheet.setAttribute('aria-labelledby', 'objects-saved-title');
  const header = element('header', 'objects-saved-header');
  const title = element('h2', '', 'Favorites'); title.id = 'objects-saved-title'; title.tabIndex = -1;
  const close = button('objects-saved-close'); close.setAttribute('aria-label',t('Close'));
  const cross = element('span','saved-cross'); cross.setAttribute('aria-hidden','true'); close.append(cross);
  header.append(title, close);
  const note = element('p', 'objects-saved-note');
  const list = element('div', 'objects-saved-list');
  const empty = element('p', 'objects-saved-empty', 'Nothing saved yet. Open an item and select the heart to keep it here.');
  const status = element('p', 'sr-only'); status.setAttribute('role', 'status');
  sheet.append(header, note, empty, list); document.body.append(sheet, status);
  const detail = document.getElementById('object-dialog');
  const save = button('objects-save'); save.append(heart()); save.setAttribute('aria-pressed', 'false');
  detail.querySelector('.objects-dialog-action').prepend(save);
  const update = () => {
    count.textContent = String(saved.size);
    trigger.setAttribute('aria-label',`${t('Favorites')} (${saved.size})`);
    save.setAttribute('aria-label',t(current && saved.has(current.id) ? 'Remove from saved items' : 'Save item')); 
    save.setAttribute('aria-pressed', String(!!current && saved.has(current.id)));
    note.textContent = t(persistent ? 'Saved in this browser only. Items do not sync across devices and are removed if you clear site data.' : 'Browser storage is unavailable. Your saved items will only last while this page is open.');
  };
  const toggle = item => {
    if (saved.has(item.id)) saved.delete(item.id); else saved.add(item.id);
    try { localStorage.setItem(key, JSON.stringify([...saved])); persistent = true; } catch { persistent = false; }
    update(); status.textContent = `${item.name}: ${t(saved.has(item.id) ? 'Saved' : 'Removed from saved items')}${persistent ? '' : '. ' + note.textContent}`;
  };
  const render = () => {
    list.replaceChildren(); empty.hidden = saved.size > 0;
    for (const id of saved) {
      const item = catalog.find(item => item.id === id);
      const card = element('article', 'objects-saved-card');
      const open = button('objects-saved-open'); open.setAttribute('aria-label', item.name);
      const image = element('img', ''); image.src = item.image; image.alt = ''; image.loading = 'lazy';
      open.append(image);
      open.addEventListener('click', () => show(item, open));
      const remove = button('objects-saved-remove', 'Remove from Favorites'); remove.setAttribute('aria-label', `${t('Remove from Favorites')}: ${item.name}`);
      remove.addEventListener('click', () => { const index = [...list.children].indexOf(card); toggle(item); render(); (list.children[index]?.querySelector('button') || list.lastElementChild?.querySelector('button') || close).focus(); });
      const overflow = button('objects-saved-overflow'); overflow.setAttribute('aria-label',`${t('Item options')}: ${item.name}`); overflow.setAttribute('aria-expanded','false');
      const dots = element('span','saved-dots'); dots.setAttribute('aria-hidden','true'); overflow.append(dots);
      const menu = element('div','objects-saved-menu'); menu.hidden = true;
      menu.append(remove);
      if(item.url || item.credit){ const link=element('a','objects-saved-product','View Product'); link.href=item.url || item.credit; link.target='_blank'; link.rel='noopener noreferrer'; const arrow=element('span','pixel-external'); arrow.setAttribute('aria-hidden','true'); link.append(arrow); menu.append(link); }
      overflow.addEventListener('click',()=>{const opening=menu.hidden; list.querySelectorAll('.objects-saved-menu').forEach(m=>m.hidden=true); list.querySelectorAll('.objects-saved-overflow').forEach(b=>b.setAttribute('aria-expanded','false')); menu.hidden=!opening; overflow.setAttribute('aria-expanded',String(opening)); if(opening){measureSweeps();remove.focus();}});
      menu.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();menu.hidden=true;overflow.setAttribute('aria-expanded','false');overflow.focus();}});
      card.append(open, overflow, menu); list.append(card);
    }
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let closing = false, sheetMotion;
  const positionSheet=()=>{
    const info=document.querySelector(".objects-info").getBoundingClientRect();
    const control=trigger.getBoundingClientRect();
    const language=document.querySelector(".objects-language").getBoundingClientRect();
    const gap=parseFloat(getComputedStyle(document.body).getPropertyValue("--finds-edge"))||16;
    sheet.style.setProperty("--favorites-top",`${info.bottom+gap}px`);
    sheet.style.setProperty("--favorites-right",`${innerWidth-control.right}px`);
    sheet.style.setProperty("--favorites-bottom",`${Math.max(0,innerHeight-language.bottom)}px`);
  };
  const popup = element('div','objects-save-popup'); popup.setAttribute('popover','manual');
  let popupTimer;
  const hidePopup=()=>{clearTimeout(popupTimer);if(popup.matches(':popover-open'))popup.hidePopover();};
  const shortcut = button('objects-save-shortcut','View My Favorites'); popup.append(shortcut); detail.append(popup);
  function openSheet(){
    hidePopup(); if(detail.open)detail.close();
    closing=false; sheetMotion?.cancel(); update(); render(); positionSheet();
    if(!sheet.open)sheet.showModal();
    trigger.setAttribute("aria-expanded","true");
    title.focus();
    if(!reduced.matches)sheetMotion=sheet.animate([{opacity:0,transform:'translateX(32px)',offset:0},{opacity:1,transform:'translateX(-8px)',offset:.6},{opacity:1,transform:'translateX(3px)',offset:.82},{opacity:1,transform:'translateX(0)',offset:1}],{duration:720,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});
  }
  function closeSheet(after){
    if(closing)return;
    sheetMotion?.cancel();
    const finish=()=>{sheet.close();closing=false;if(after)after();};
    // Product selection opens immediately, without waiting for dismissal motion.
    if(after || reduced.matches){finish();return;}
    closing=true;
    sheetMotion=sheet.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:'translateX(32px)'}],{duration:280,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});
    sheetMotion.onfinish=finish;
  }
  window.addEventListener('resize',()=>{if(sheet.open)positionSheet();});
  trigger.addEventListener('click',openSheet);
  shortcut.addEventListener('click',openSheet);
  close.addEventListener('click',()=>closeSheet());
  sheet.addEventListener('cancel',event=>{event.preventDefault();closeSheet();});
  sheet.addEventListener('click',event=>{
    const bounds=sheet.getBoundingClientRect();
    if(event.target===sheet && (event.clientX<bounds.left || event.clientX>bounds.right || event.clientY<bounds.top || event.clientY>bounds.bottom)){closeSheet();return;}
    if(!event.target.closest('.objects-saved-card')){ list.querySelectorAll('.objects-saved-menu').forEach(m=>m.hidden=true); list.querySelectorAll('.objects-saved-overflow').forEach(b=>b.setAttribute('aria-expanded','false')); }
  });
  sheet.addEventListener('close',()=>{trigger.setAttribute('aria-expanded','false');document.body.classList.remove('saved-collection-open');if(!detail.open)trigger.focus({preventScroll:true});});
  save.addEventListener('click',()=>{if(current){toggle(current);hidePopup();if(saved.has(current.id)){popup.showPopover();popupTimer=setTimeout(hidePopup,4000);}}});
  detail.addEventListener('close',()=>{hidePopup();if(sheet.open){render();title.focus({preventScroll:true});}});
  detail.addEventListener('objectshown', event => { current = event.detail; hidePopup(); update(); });
  window.addEventListener('storage', event => { if (event.key === key || event.key === null) { saved = parse(event.newValue); update(); if (sheet.open) render(); } });
  const measureSweeps = () => document.querySelectorAll('.objects-page button,.objects-dialog-link,.objects-saved-product').forEach(unit => {
    const box=unit.getBoundingClientRect();
    unit.style.setProperty('--fc-width',`${box.width}px`);
    unit.querySelectorAll('.pixel-heart,.saved-cross,.pixel-external,.saved-dots,.objects-dialog-close span,.objects-product-arrow span,.objects-peek-arrow,.objects-info>span:last-child').forEach(icon=>icon.style.setProperty('--fc-offset',`${icon.getBoundingClientRect().left-box.left}px`));
  });
  new MutationObserver(()=>requestAnimationFrame(measureSweeps)).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize',measureSweeps);
  document.fonts.ready.then(measureSweeps);
  update(); measureSweeps();
};
