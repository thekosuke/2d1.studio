/* Project detail stays on Work: native modal focus and the shared drawer motion. */
(() => {
 const dialog=document.getElementById('work-dialog');
 if(!dialog||typeof dialog.showModal!=='function'||!window.SiteDrawer)return;
 const content=dialog.querySelector('.work-detail-content');
 document.querySelectorAll('.work-project').forEach(project=>{
  const trigger=project.querySelector('summary');
  trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','work-dialog');
  trigger.addEventListener('click',event=>{
   event.preventDefault();
   content.replaceChildren(project.querySelector('.work-project-content').cloneNode(true));
   const heading=content.querySelector('.contact-title');heading.id='work-dialog-title';
   window.SiteDrawer.open(dialog,trigger);
  });
 });
})();
