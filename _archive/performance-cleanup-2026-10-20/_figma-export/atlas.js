(async()=>{
 await document.fonts.ready;
 const lang=document.documentElement.lang, w=innerWidth, h=w<768?844:900;
 const t=window.SiteLanguage?.t||((v)=>v);
 document.documentElement.style.setProperty('--screen-width',w+'px');
 document.documentElement.style.setProperty('--viewport-width',w+'px');
 const home=document.body.cloneNode(true);
 const aboutText=await (await fetch(lang==='ja'?'/ja/about/':'/about/')).text();
 const about=new DOMParser().parseFromString(aboutText,'text/html').body;
 // Resolve asset URLs before moving markup away from its original document.
 home.querySelectorAll('img').forEach(n=>n.src=new URL(n.getAttribute('src'),document.baseURI));
 about.querySelectorAll('img').forEach(n=>n.src=new URL(n.getAttribute('src'),location.origin+(lang==='ja'?'/ja/about/':'/about/')));
 const contact=home.querySelector('#contact').cloneNode(true), profile=home.querySelector('#profile-dialog').cloneNode(true);
 for(const source of [home,about]){
   source.querySelectorAll('script,noscript,template,dialog,.skip-link,.tote-canvas').forEach(n=>n.remove());
   source.querySelectorAll('.ink').forEach(n=>n.replaceWith(document.createTextNode(n.textContent)));
   source.normalize();
 }
 document.body.replaceChildren();document.body.className='atlas';
 let serial=0;
 function board(name,source,full=false,height){
  const b=document.createElement('section');b.className='export-board';b.setAttribute('aria-label',name);
  const label=document.createElement('h2');label.className='export-label';label.textContent=String(++serial).padStart(2,'0')+' / '+lang.toUpperCase()+' / '+w+' / '+name;b.append(label);
  const c=document.createElement('div');c.className='export-content '+(source?.className||'')+(full?' full-page':'');
  if(source)c.append(...[...source.childNodes].map(n=>n.cloneNode(true)));
  if(height)c.style.height=height+'px';
  b.append(c);document.body.append(b);return c;
 }
 function logo(c,docked=false){const l=c.querySelector('.site-logo');if(l){l.classList.remove('is-awake','is-glancing','is-blinking');l.style.width=(docked?96:w<768?200:240)+'px';l.style.transform=`translate(-50%, ${docked?16:w<768?160:256}px)`;l.style.top='0';l.style.left='50%';}const cap=c.querySelector('.brand-caption');if(cap){cap.style.transform='none';cap.style.opacity=docked?'0':'1';}}
 let c=board('Home — complete page / fully revealed typography',home,true);logo(c);
 for(const open of [false,true]){c=board(open?'About — expanded / full essay':'About — TL;DR / folded',about,true);const eb=c.querySelector('.essay-body');eb.className='essay-body '+(open?'is-open is-done':'is-folded');c.querySelector('.essay-more').hidden=open;}
 for(const [kind,template] of [['Contact',contact],['Profile',profile]]){
  // Actual viewport composition with the page behind the floating card.
  c=board(kind+' — floating card / initial viewport',home,false,h);logo(c,true);c.querySelector('.masthead').remove();c.querySelector('main').style.transform='translateY(-80px)';c.append(template.cloneNode(true));
  for(const state of ['All fields','Focus + filled','Validation','Not connected']){
   c=board(kind+' — '+state,null,false);c.style.width=(w<768?w:w/2)+'px';c.parentElement.style.width=c.style.width;
   const d=template.cloneNode(true);d.classList.add('export-fullform');c.append(d);
   d.querySelector('.contact-close').remove();
   if(state==='Focus + filled'){
    const name=d.querySelector('input[name=name]');name.value=lang==='ja'?'山田 はな':'Hana Yamada';name.setAttribute('value',name.value);name.closest('.field').classList.add('export-focused');
    const em=d.querySelector('input[type=email]');em.value='hana@example.com';em.setAttribute('value',em.value);
    const radio=d.querySelector('input[type=radio]');if(radio){radio.checked=true;radio.setAttribute('checked','');}
   }
   if(state==='Validation'){
    d.querySelector('input').classList.add('export-invalid');d.querySelector('input').closest('.field').classList.add('export-focused');
    const st=d.querySelector('.contact-status');if(kind==='Contact'){st.textContent=t('Please fill in this required field.');st.dataset.state='error';}else{d.querySelector('input').classList.remove('export-invalid');c.parentElement.querySelector('.export-label').textContent+=' / native browser prompt excluded';}
   }
   if(state==='Not connected'){
    const fallback=d.querySelector('.contact-fallback');if(fallback)fallback.hidden=false;
    else d.querySelector('.contact-status').textContent=t('Profile submission isn’t connected yet. Nothing was sent or saved.');
   }
  }
 }
 for(const state of ['Default','Focused','Not connected']){
  c=board('Connect — '+state,null);c.classList.add('section-stack');c.style.paddingInline='24px';const el=home.querySelector('#connect').cloneNode(true);el.classList.remove('section-stack');el.classList.add('section-stack-inner');c.append(el);
  if(state!=='Default'){el.querySelector('input').classList.add('export-focused');el.querySelector('#connect-status').hidden=false;}
  if(state==='Not connected')el.querySelector('#connect-status').textContent=t('Signup isn’t connected yet. Your email was not sent or saved.');
 }
 for(const state of ['Rest','Eyes peek','Blink','Docked']){
  c=board('Logo — '+state,home,false,state==='Docked'?220:w<768?450:680);c.querySelector('main').remove();c.querySelector('.site-footer').remove();c.querySelector('.language-switch').remove();logo(c,state==='Docked');const l=c.querySelector('.site-logo');if(state==='Eyes peek'||state==='Blink')l.classList.add('is-awake');if(state==='Blink')l.classList.add('is-blinking');if(state!=='Docked')c.querySelector('.page-nav').remove();
 }
 c=board('Intro — reading ink / midway',null);const intro=home.querySelector('.intro').cloneNode(true);intro.classList.add('is-inking');c.append(intro);const walker=document.createTreeWalker(intro.querySelector('h1'),NodeFilter.SHOW_TEXT), nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);let count=0;for(const node of nodes){const parts=node.textContent.split(/(\s+)/);const frag=document.createDocumentFragment();for(const part of parts){if(!part.trim()){frag.append(part);continue;}const span=document.createElement('span');span.textContent=part;span.style.opacity=++count<35?'1':'.25';frag.append(span);}node.replaceWith(frag);}
 c=board('Buttons — default / hover / keyboard focus',null);c.style.padding='40px 24px';for(const style of ['','export-hover','export-focused']){const row=home.querySelector('.button-stack').cloneNode(true);row.style.marginBottom='24px';row.querySelectorAll('a').forEach(a=>{if(style)a.classList.add(style);if(style==='export-focused'){a.style.outline='2px solid var(--red)';a.style.outlineOffset='6px';}});c.append(row);}
 // Supply every carousel image even when it sits outside the initial strip crop.
 c=board('Studio — complete artwork strip',null);c.append(home.querySelector('.work-set').cloneNode(true));c.style.width=(w<768?11*269:11*277)+'px';c.parentElement.style.width=c.style.width;
 // Capture discrete 3D assets only; the surrounding UI remains editable.
 try {
  const {mountTote}=await import('/_figma-export/tote-capture.js');
  const stage=document.createElement('div');stage.style.cssText='position:fixed;left:0;top:0;width:540px;height:405px;opacity:0;pointer-events:none';document.body.append(stage);
  const model=mountTote({stage,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)'),presentation:'contained'});
  for(const [name,yaw,xray] of [['Front / rest',0,0],['Cursor left / right side',-Math.PI*.75,0],['Cursor right / left side',Math.PI*.75,0],['Hover / X-ray',0,1]]){
   c=board('Tote — '+name,null);c.style.padding='40px 24px';
   const img=new Image();img.src=model.snapshot(1080,810,yaw,xray);img.style.cssText='display:block;width:100%;max-width:540px;margin:auto';img.alt=name;c.append(img);await img.decode();
  }
  stage.remove();
 } catch(error) {document.documentElement.dataset.toteError=String(error);}
 document.title='2D1 · '
+lang.toUpperCase()+' · '+w+' · screens and states';
 document.documentElement.dataset.exportReady='true';
})();
