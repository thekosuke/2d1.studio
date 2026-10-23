/* Temporary, local-preview typography controls. Remove this script to retire. */
(() => {
  // Embedded Shop previews show the collection, without authoring controls.
  if (new URLSearchParams(location.search).has('shop-preview')) return;
  if (!['localhost','127.0.0.1','::1'].includes(location.hostname)) return;
  const host=document.createElement('div');host.id='type-tuner';host.setAttribute('translate','no');
  host.style.cssText='position:fixed!important;left:12px!important;bottom:max(12px,env(safe-area-inset-bottom))!important;z-index:2147483647!important;';
  const ui=host.attachShadow({mode:'open'});
  ui.innerHTML=`<style>
    :host{all:initial}*{box-sizing:border-box}section{width:248px;max-width:calc(100vw - 24px);max-height:calc(100dvh - 24px);overflow:auto;background:#FAF0E6;color:#320505;border:1px solid #320505;padding:12px;font:400 13px/1.4 'SC Walla',Arial,sans-serif;letter-spacing:0;text-align:left}
    header{display:flex;align-items:center;justify-content:space-between;gap:16px;font-weight:500;font-size:11px;letter-spacing:.05em}button,input,textarea{font:inherit;color:inherit;border-radius:0;outline:none;box-shadow:none}button{border:0;background:none;padding:6px 0;cursor:pointer;text-align:left}button:hover,button:focus-visible{color:#FF2B00}button:disabled{opacity:.4;cursor:default}header button{padding:0 4px;font-size:18px;line-height:1}
    #pick{margin-top:12px;border:1px solid currentColor;padding:7px 10px;width:100%}#pick[aria-pressed=true]{background:#320505;color:#FAF0E6}#selected{font-size:11px;opacity:.7;margin:10px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}fieldset{border:0;margin:0;padding:0;display:grid;gap:8px}label{display:grid;grid-template-columns:1fr 80px;align-items:center;gap:12px}input{width:80px;min-width:0;background:transparent;border:0;border-bottom:1px solid #b9a7a0;padding:3px 0 3px 6px;text-align:right}input:focus{border-color:#FF2B00;background:#fff}input:disabled{opacity:.4}footer{display:flex;align-items:center;justify-content:space-between;margin-top:14px}#save{background:#320505;color:#FAF0E6;padding:7px 18px;font-size:11px;letter-spacing:.06em}#save:is(:hover,:focus-visible){background:#FF2B00}#status{font-size:11px;margin:10px 0 0;line-height:1.4}textarea{width:100%;height:120px;margin-top:8px;padding:6px;border:1px solid #320505;background:white;font-size:11px}textarea:focus{border-color:#FF2B00}[hidden]{display:none!important}
    section.is-collapsed{width:44px;height:44px;padding:0;overflow:hidden}
    section.is-collapsed header{width:100%;height:100%;gap:0}
    section.is-collapsed .panel-label{display:none}
    section.is-collapsed #toggle{display:grid;place-items:center;width:100%;height:100%;padding:0;font-size:16px;letter-spacing:0}
  </style><section aria-label="Temporary typography controls"><header><span class="panel-label">TYPE SETTINGS</span><button id="toggle" aria-label="Collapse typography controls" aria-expanded="true">−</button></header><div id="body"><button id="pick" aria-pressed="false">Select text ↗</button><p id="selected">Choose text on the page</p><fieldset disabled><label>Size · px<input aria-label="Font size" name="font-size" type="number" min="8" max="240" step="1"></label><label>Weight<input aria-label="Font weight" name="font-weight" type="number" min="100" max="900" step="100"></label><label>Spacing · em<input aria-label="Letter spacing" name="letter-spacing" type="number" min="-.2" max=".5" step=".005"></label><label>Line height<input aria-label="Line height" name="line-height" type="number" min=".7" max="3" step=".05"></label></fieldset><footer><button id="reset" disabled>Reset</button><button id="save" disabled>SAVE</button></footer><p id="status" role="status" hidden></p><textarea id="export" aria-label="Saved typography request" readonly hidden></textarea></div></section>`;
  document.body.append(host);
  if(document.body.classList.contains('objects-page'))host.style.setProperty('bottom','max(72px,calc(env(safe-area-inset-bottom) + 64px))','important');
  const $=id=>ui.getElementById(id),fields=[...ui.querySelectorAll('input')],changes=new Map();
  const marker=document.createElement('div');marker.setAttribute('aria-hidden','true');marker.style.cssText='position:fixed;pointer-events:none;border:1px dashed #FF2B00;z-index:2147483646;display:none;';document.body.append(marker);
  let target=null,picking=false,marked=null,peers=[],groupKey=null,groupStyle=null;
  const memberGroups=new WeakMap(),groups=new Map();
  const textSelector='h1,h2,h3,h4,h5,h6,p,dt,dd,label,figcaption,a,button,summary,li';
  const signature=el=>{const s=getComputedStyle(el);return Object.fromEntries(['font-family','font-size','font-weight','font-style','letter-spacing','line-height','text-transform'].map(k=>[k,s.getPropertyValue(k)]));};
  const selector=el=>{const parts=[];for(let node=el;node&&node!==document.body;node=node.parentElement){if(node.id){parts.unshift('#'+CSS.escape(node.id));break}const tag=node.localName,siblings=[...node.parentElement.children].filter(n=>n.localName===tag);parts.unshift(tag+(siblings.length>1?`:nth-of-type(${siblings.indexOf(node)+1})`:''));}return parts.join(' > ')};
  function box(el){marked=el;if(!el){marker.style.display='none';return}const b=el.getBoundingClientRect();Object.assign(marker.style,{display:'block',left:`${b.left-3}px`,top:`${b.top-3}px`,width:`${b.width+6}px`,height:`${b.height+6}px`})}
  function status(text){$('status').hidden=false;$('status').textContent=text}
  function arm(next){picking=next;$('pick').setAttribute('aria-pressed',String(next));$('pick').textContent=next?'Click text · Esc to cancel':'Select text ↗';box(next?null:target)}
  function candidate(node){if(!(node instanceof Element)||host.contains(node)||node===marker)return null;return node.closest('h1,h2,h3,h4,h5,h6,p,dt,dd,label,figcaption')||node.closest('a,button,summary,li');}
  function select(el){
    target=el;arm(false);
    const named=el.getAttribute('data-type-style');
    const existing=memberGroups.get(el);
    groupStyle=existing?.originalStyle||signature(el);
    groupKey=existing?.key||(named?'named:'+named:'computed:'+JSON.stringify(groupStyle));
    if(!groups.has(groupKey)){
      const members=[...document.querySelectorAll(textSelector)].filter(other=>{
        if(other===el)return true;
        if(!other.textContent.trim()||other.closest('#type-tuner')||candidate(other)!==other)return false;
        return named?other.getAttribute('data-type-style')===named:!other.hasAttribute('data-type-style')&&JSON.stringify(signature(other))===JSON.stringify(groupStyle);
      });
      const group={key:groupKey,name:named||'Matching typography',originalStyle:groupStyle,members};
      groups.set(groupKey,group);members.forEach(member=>memberGroups.set(member,group));
    }
    peers=groups.get(groupKey).members;
    const style=getComputedStyle(el),size=parseFloat(style.fontSize);const values={'font-size':size,'font-weight':parseFloat(style.fontWeight)||400,'letter-spacing':style.letterSpacing==='normal'?0:parseFloat(style.letterSpacing)/size,'line-height':style.lineHeight==='normal'?1.2:parseFloat(style.lineHeight)/size};fields.forEach(f=>f.value=+values[f.name].toFixed(3));$('selected').textContent=`${peers.length} ${peers.length===1?'text':'texts'} · ${groups.get(groupKey).name}`;$('selected').title=el.textContent.trim().replace(/\s+/g,' ').slice(0,160);ui.querySelector('fieldset').disabled=false;$('reset').disabled=false;}
  $('pick').addEventListener('click',()=>arm(!picking));
  document.addEventListener('pointerover',e=>{if(picking&&!e.composedPath().includes(host))box(candidate(e.target))},true);
  document.addEventListener('click',e=>{if(!picking||e.composedPath().includes(host))return;e.preventDefault();e.stopImmediatePropagation();const el=candidate(e.target);if(el)select(el);},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&picking){e.preventDefault();e.stopImmediatePropagation();arm(false);}},true);
  ui.addEventListener('input',e=>{
    const field=e.target;if(!target||!fields.includes(field)||!field.validity.valid||field.value==='')return;
    if(!changes.has(groupKey))changes.set(groupKey,{group:groups.get(groupKey),original:new Map(),styles:{}});
    const change=changes.get(groupKey),property=field.name;
    const value=field.value+(property==='font-size'?'px':property==='letter-spacing'?'em':'');
    peers.forEach(member=>{
      if(!change.original.has(member))change.original.set(member,new Map());
      const originals=change.original.get(member);
      if(!originals.has(property))originals.set(property,{value:member.style.getPropertyValue(property),priority:member.style.getPropertyPriority(property)});
      member.style.setProperty(property,value,'important');
    });
    change.styles[property]=value;$('save').disabled=false;$('status').hidden=true;$('export').hidden=true;box(target);
  });
  $('reset').addEventListener('click',()=>{const change=changes.get(groupKey);if(change){change.original.forEach((properties,member)=>properties.forEach((old,key)=>old.value?member.style.setProperty(key,old.value,old.priority):member.style.removeProperty(key)));changes.delete(groupKey);}select(target);$('save').disabled=!changes.size;status('Shared style reset.');});
  const collapseKey='2d1-type-tuner-collapsed';
  let initiallyClosed=matchMedia('(max-width:767px)').matches;
  try{const saved=sessionStorage.getItem(collapseKey);if(saved!==null)initiallyClosed=saved==='true'}catch{}
  function setCollapsed(closed){ui.querySelector('section').classList.toggle('is-collapsed',closed);$('body').hidden=closed;$('toggle').textContent=closed?'Aa':'−';$('toggle').setAttribute('aria-expanded',String(!closed));$('toggle').setAttribute('aria-label',`${closed?'Expand':'Collapse'} typography controls`)}
  setCollapsed(initiallyClosed);
  $('toggle').addEventListener('click',()=>{const closed=!$('body').hidden;try{sessionStorage.setItem(collapseKey,String(closed))}catch{};setCollapsed(closed);if(closed){arm(false);box(null)}else box(target)});
  $('save').addEventListener('click',async()=>{
    const records=[...changes.values()].map(({group,styles})=>({sharedStyle:group.name,styleKey:group.key,originalComputedStyle:group.originalStyle,matchingElements:group.members.map(member=>({selector:selector(member),text:member.textContent.trim().replace(/\s+/g,' ').slice(0,160)})),styles}));
    const snapshot={route:location.pathname,language:document.documentElement.lang,viewport:{width:innerWidth,height:innerHeight},changes:records};
    const prompt='Please apply these saved typography settings to the website source. Apply each change to ALL text using the same shared typography style, including other routes where it is used. Use sharedStyle, originalComputedStyle, text and matchingElements to locate the style. Update shared CSS rules or tokens rather than individual elements; preserve responsive layouts and the corresponding language route.\n\n'+JSON.stringify(snapshot,null,2);
    try{localStorage.setItem('2d1-type-tuner-saved',JSON.stringify(snapshot))}catch{}
    $('export').value=prompt;
    try{await navigator.clipboard.writeText(prompt);status(`Copied ${records.length} ${records.length===1?'style':'styles'}. Paste into this chat to apply.`);$('export').hidden=true}catch{$('export').hidden=false;$('export').focus();$('export').select();status('Copy the request below and paste it into this chat.');}
  });
  // Native modal dialogs need the controls in their top layer too.
  function mount(){const dialogs=[...document.querySelectorAll('dialog[open]')],parent=dialogs.at(-1)||document.body;if(host.parentElement!==parent){parent.append(host,marker);box(target)}}
  new MutationObserver(mount).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  let queued=false;const redraw=()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;if(marked)box(marked)})}};addEventListener('scroll',redraw,{capture:true,passive:true});addEventListener('resize',redraw);mount();
})();
