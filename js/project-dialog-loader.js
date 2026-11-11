/* Reconnect the original project dialog to the current Studio cards. */
(async () => {
  if (!document.body.classList.contains('practice-home')) return;
  const links = [...document.querySelectorAll('.practice-card-link')].filter(a => /\/work\/[^/]+\/$/.test(a.pathname));
  if (!links.length) return;
  let ready = false, failed = false;
  const pending = new Map();
  const load = href => {
    if (!pending.has(href)) pending.set(href, fetch(href).then(response => {
      if (!response.ok) throw new Error('Project unavailable');
      return response.text();
    }).then(html => new DOMParser().parseFromString(html, 'text/html')));
    return pending.get(href);
  };
  const intercept = async event => {
    const link = event.target.closest('.practice-card-link');
    if (!links.includes(link) || ready || failed || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();event.stopImmediatePropagation();
    await setup;
    if (ready) link.click(); else location.assign(link.href);
  };
  document.addEventListener('click', intercept, true);
  const setup = (async () => {
    try {
      const documents = await Promise.all(links.map(a => load(a.href)));
      links.forEach((link, index) => {
        const story = documents[index].querySelector('.work-project-content');
        if (!story) throw new Error('Missing project story');
        const holder = document.createElement('div');holder.hidden = true;holder.style.setProperty('display','none','important');
        holder.append(document.importNode(story, true));
        // Resolve assets against the original project URL before moving the DOM.
        holder.querySelectorAll('[src],[href],[poster]').forEach(el => {
          for (const attr of ['src','href','poster']) if (el.hasAttribute(attr)) el.setAttribute(attr,new URL(el.getAttribute(attr),link.href).href);
        });
        const card=link.closest('.practice-card');card.classList.add('work-project');card.dataset.projectId=link.pathname.split('/').filter(Boolean).at(-1);
        card.append(holder);
      });
      const dialog=document.createElement('dialog');dialog.id='work-dialog';dialog.className='work-dialog';dialog.setAttribute('aria-labelledby','work-dialog-title');
      dialog.innerHTML='<div class="work-dialog-bar"><div class="work-breadcrumb-slot"></div><button class="work-close" aria-label="Close project"><span aria-hidden="true"></span></button></div><div class="work-detail-content"></div>';
      document.body.append(dialog);
      await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='/js/work.js?v=62';script.onload=resolve;script.onerror=reject;document.body.append(script)});
      ready=true;
    } catch { failed=true; }
  })();
})();
