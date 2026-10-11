import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../js/mobile-nav.js',import.meta.url),'utf8');
const findsSource=readFileSync(new URL('../js/finds-menus.js',import.meta.url),'utf8');
class Element {
  handlers=new Map(); attributes=new Map(); properties=new Map(); classes=new Set(); children=[]; parent=null; inert=false;
  classList={add:(...names)=>names.forEach(name=>this.classes.add(name)),remove:(...names)=>names.forEach(name=>this.classes.delete(name)),contains:name=>this.classes.has(name),toggle:(name,on)=>on?this.classes.add(name):this.classes.delete(name)};
  style={setProperty:(key,value)=>this.properties.set(key,value)};
  addEventListener(name,fn){const handlers=this.handlers.get(name)||[];handlers.push(fn);this.handlers.set(name,handlers)}
  setAttribute(key,value){this.attributes.set(key,value)} getAttribute(key){return this.attributes.get(key)}
  get parentElement(){return this.parent}
  get nextSibling(){return this.parent?.children[this.parent.children.indexOf(this)+1]||null}
  append(...children){for(const child of children){if(child.parent)child.parent.children.splice(child.parent.children.indexOf(child),1);this.children.push(child);child.parent=this}}
  insertBefore(child,before){this.append(child);this.children.pop();this.children.splice(this.children.indexOf(before),0,child)}
  contains(target){return !!target&&(target===this||this.children.some(child=>child.contains(target)))}
  querySelector(selector){return this.selectors?.[selector]||null}
  querySelectorAll(selector){return this.children.flatMap(child=>[...((selector==='a,button'?(child.tagName==='A'||child.tagName==='BUTTON'):child.tagName==='A'&&!child.classes.has('mobile-nav-home')&&!child.attributes.has('hreflang'))?[child]:[]),...child.querySelectorAll(selector)])}
  closest(selector){if(selector==='a,button')return this.tagName==='A'||this.tagName==='BUTTON'?this:null;const name=selector.slice(1);return this.classes.has(name)?this:this.parent?.closest(selector)||null}
  dispatchEvent(event){this.handlers.get(event.type)?.forEach(fn=>fn(event))}
  emit(type,props={}){const event={type,target:this,currentTarget:this,pointerType:'mouse',button:0,defaultPrevented:false,preventDefault(){this.defaultPrevented=true},...props};this.dispatchEvent(event);return event}
}
function fixture(kind='home',mobileMode=true,reducedMode=false){
  const document=new Element(),window=new Element(),body=new Element(),trigger=new Element(),panel=new Element(),logo=new Element(),desktop=new Element(),container=new Element(),outside=new Element(),dialog=new Element(),heading=new Element(),mobile=new Element(),reduced=new Element(),language=new Element(),footer=new Element();
  body.classes.add(kind==='finds'?'objects-page':`${kind}-page`);
  panel.classes.add(kind==='finds'?'finds-page-nav':'page-nav');if(kind==='about')panel.classes.add('is-visible');
  trigger.classes.add('mobile-nav-toggle');trigger.tagName='BUTTON';trigger.setAttribute('aria-controls','navigation');
  mobile.matches=mobileMode;reduced.matches=reducedMode;
  const links=Array.from({length:kind==='finds'?7:6},(_,i)=>{const link=new Element();link.tagName=i===(kind==='finds'?6:5)?'BUTTON':'A';return link});
  if(kind==='finds')links[0].classes.add('mobile-nav-home');
  panel.append(...links);container.append(trigger,desktop,panel);body.append(container,logo,outside,dialog);dialog.append(heading);document.body=body;document.activeElement=outside;
  const languageHome=kind==='finds'?footer:body;
  if(kind==='finds')body.append(footer);
  const languageLinks=['en','ja'].map(locale=>{const link=new Element();link.tagName='A';link.setAttribute('hreflang',locale);return link});
  languageLinks[0].setAttribute('aria-current','page');language.append(...languageLinks);languageHome.append(language);
  const bySelector={'.mobile-nav-toggle':trigger,'.finds-home-trigger':kind==='finds'?desktop:null,'.site-logo':logo,'.finds-home-menu':kind==='finds'?container:null,'.language-switch, .objects-language':language};
  document.querySelector=selector=>selector==='dialog[open]'?(dialog.open?dialog:null):(bySelector[selector]||null);
  document.getElementById=id=>id==='navigation'?panel:null;
  container.selectors={'.finds-home-trigger':desktop,nav:panel};
  for(const element of [trigger,panel,logo,desktop,outside,heading,...links,...languageLinks])element.focus=()=>{document.activeElement=element;document.emit('focusin',{target:element});if(container.contains(element))container.emit('focusin',{target:element})};
  let serial=0,now=0;const timers=new Map();
  const context={document,window,Event:class{constructor(type){this.type=type}},matchMedia:query=>query.includes('max-width')?mobile:reduced,addEventListener:(...args)=>window.addEventListener(...args),setTimeout(fn,ms){timers.set(++serial,{fn,time:now+ms});return serial},clearTimeout(id){timers.delete(id)}};
  vm.runInNewContext(source,context);if(kind==='finds')vm.runInNewContext(findsSource,context);
  const advance=ms=>{now+=ms;for(const [id,timer] of timers)if(timer.time<=now){timers.delete(id);timer.fn()}};
  const resize=next=>{mobile.matches=next;mobile.emit('change')};
  const open=()=>{if(kind==='home')panel.mobileNavigation.setAvailable(true);trigger.focus();trigger.emit('click')};
  return {document,window,body,trigger,panel,links,language,languageLinks,languageHome,logo,desktop,container,outside,dialog,heading,mobile,reduced,timers,context,advance,resize,open};
}
for(const lang of ['en','ja'])for(const kind of ['home','about','finds']){
  const f=fixture(kind);const {panel,trigger,document,links}=f;
  assert.equal(panel.inert,true,`${lang}/${kind}: closed links inert`);
  assert.equal(trigger.getAttribute('aria-expanded'),'false');
  if(kind==='home'){trigger.emit('click');assert.equal(panel.inert,true);assert.equal(trigger.inert,true)}
  f.open();assert.equal(panel.inert,false);assert.equal(trigger.getAttribute('aria-expanded'),'true');
  const allLinks=[...links,...f.languageLinks];
  assert.equal(f.language.parentElement,panel);
  assert.deepEqual(allLinks.map(link=>link.properties.get('--mobile-nav-enter')),allLinks.map((_,i)=>`${i*44}ms`));
  assert.deepEqual(allLinks.map(link=>link.properties.get('--mobile-nav-exit')),allLinks.map((_,i)=>`${(allLinks.length-i-1)*44}ms`));
  for(let i=0;i<4;i++){
    trigger.emit('click');assert.equal(panel.inert,true);assert.equal(panel.classes.has('is-mobile-closing'),true);
    f.advance(80);trigger.emit('click');f.advance(700);assert.equal(panel.inert,false);assert.equal(panel.classes.has('is-mobile-closing'),false);
  }
  links[1].focus();assert.equal(document.emit('keydown',{key:'Escape'}).defaultPrevented,true);assert.equal(document.activeElement,trigger);assert.equal(panel.inert,true);
  trigger.emit('keydown',{key:'ArrowDown'});assert.equal(document.activeElement,links[0]);assert.equal(panel.inert,false);
  document.emit('pointerdown',{target:f.outside});assert.equal(panel.inert,true);assert.equal(document.activeElement,trigger);
  trigger.emit('click');links[2].focus();f.outside.focus();assert.equal(panel.inert,true);assert.equal(document.activeElement,f.outside);
  f.open();links[2].focus();panel.emit('click',{target:links[2]});assert.equal(panel.inert,true);assert.equal(document.activeElement,trigger);
  f.open();panel.emit('click',{target:links[2],metaKey:true});assert.equal(panel.inert,false); // Keep modified browser navigation.
  links[2].focus();f.resize(false);assert.equal(trigger.inert,true);assert.equal(trigger.getAttribute('aria-expanded'),'false');
  assert.equal(panel.inert,false,`${lang}/${kind}: desktop visible/focused navigation stays interactive`);
  if(kind==='finds'){assert.equal(document.activeElement,f.desktop);assert.equal(f.container.classes.has('is-open'),true)}
  f.resize(true);assert.equal(panel.inert,true);assert.equal(document.activeElement,trigger);assert.equal(f.container.classes.has('is-open'),false);
  f.open();f.dialog.open=true;f.heading.focus();assert.equal(panel.inert,true); // Native Info/Contact focus dismisses disclosure.
  trigger.emit('click');assert.equal(panel.inert,true);f.dialog.open=false;
  for(const event of ['pagehide','pageshow','popstate']){f.open();links[1].focus();f.window.emit(event);assert.equal(panel.inert,true);assert.equal(trigger.getAttribute('aria-expanded'),'false');assert.equal(f.timers.size,0)}
  f.open();trigger.emit('click');f.reduced.matches=true;f.reduced.emit('change');assert.equal(f.timers.size,0);assert.equal(panel.classes.has('is-mobile-closing'),false);
  f.open();trigger.emit('click');assert.equal(f.timers.size,0);
  if(kind==='home'){f.open();links[0].focus();panel.mobileNavigation.setAvailable(false);assert.equal(document.activeElement,f.logo);assert.equal(trigger.inert,true);assert.equal(panel.inert,true)}
  // Run the production Contact open handler after the nav's capture handoff.
  f.open();const contact=links.at(-1);contact.focus();panel.emit('click',{target:contact});
  const contactSource=readFileSync(new URL('../js/contact.js',import.meta.url),'utf8');
  const handler=contactSource.slice(contactSource.indexOf('    function open(event) {'),contactSource.indexOf("    document.querySelectorAll('[data-contact]')"));
  let returnTarget;
  vm.runInNewContext(handler+'\nopen(event);',{document,contact:f.dialog,event:{currentTarget:contact,button:0,preventDefault(){}},window:{SiteDrawer:{open(dialog,opener){dialog.open=true;returnTarget=opener;f.heading.focus()}}},mood(){},look(){}});
  assert.equal(document.activeElement,f.heading);assert.equal(panel.inert,true);
  f.dialog.open=false;returnTarget.focus({preventScroll:true});assert.equal(document.activeElement,trigger);
  f.dialog.open=true;f.heading.focus();f.resize(false);f.dialog.open=false;returnTarget.focus({preventScroll:true});assert.equal(document.activeElement,kind==='finds'?f.desktop:f.logo);
}
console.log('PASS mobile navigation: six locale/page fixtures, repeated/interrupted stagger, Escape/outside/Tab/link close, modifiers, focus-safe resize, native Info coexistence, Contact focus return through orientation, and history restoration.');

for(const kind of ['home','about','finds']){
  const f=fixture(kind,false);
  assert.equal(f.trigger.inert,true);
  f.trigger.emit('click');assert.equal(f.trigger.getAttribute('aria-expanded'),'false');
  if(kind==='finds'){
    f.container.emit('pointerenter');assert.equal(f.panel.inert,false);
    f.links[2].focus();f.resize(true);assert.equal(f.panel.inert,true);assert.equal(f.document.activeElement,f.trigger);
  }else{
    if(kind==='home')f.panel.mobileNavigation.setAvailable(true);
    assert.equal(f.panel.inert,false);
    f.links[0].focus();f.resize(true);assert.equal(f.panel.inert,true);assert.equal(f.document.activeElement,f.trigger);
  }
}

// Every page moves its original language landmark, preserving link identity and
// allowing the same native click/capture dismissal as the other menu items.
for(const locale of ['en','ja'])for(const kind of ['home','about','finds']){
  const f=fixture(kind,false),original=[...f.language.children];
  assert.equal(f.language.parentElement,f.languageHome);
  if(kind==='home')f.panel.mobileNavigation.setAvailable(true);
  f.languageLinks[1].focus();f.resize(true);
  assert.equal(f.document.activeElement,f.trigger);assert.equal(f.panel.inert,true);
  f.open();f.languageLinks[1].focus();
  const nativeClick=f.panel.emit('click',{target:f.languageLinks[1]});
  assert.equal(nativeClick.defaultPrevented,false);assert.equal(f.panel.inert,true);assert.equal(f.document.activeElement,f.trigger);
  f.open();const modified=f.panel.emit('click',{target:f.languageLinks[1],ctrlKey:true});
  assert.equal(modified.defaultPrevented,false);assert.equal(f.panel.inert,false);
  f.languageLinks[1].focus();f.resize(false);
  assert.equal(f.language.parentElement,f.languageHome);assert.equal(f.document.activeElement,f.languageLinks[1]);
  assert.ok(f.languageLinks.every(link=>!link.classes.has('mobile-nav-item')));
  for(let repeat=0;repeat<12;repeat++){f.resize(true);f.resize(false)}
  assert.deepEqual(f.language.children,original);assert.equal(f.languageHome.children.filter(child=>child===f.language).length,1);
  assert.equal(f.languageLinks[0].getAttribute('aria-current'),'page');
  f.resize(true);f.open();f.dialog.open=true;f.heading.focus();f.resize(false);f.resize(true);
  assert.equal(f.document.activeElement,f.heading);assert.equal(f.panel.inert,true);f.dialog.open=false;
  if(kind==='home'){
    f.open();f.languageLinks[0].focus();f.panel.mobileNavigation.setAvailable(false);
    assert.equal(f.document.activeElement,f.logo);assert.equal(f.language.inert,true);assert.equal(f.panel.inert,true);
    f.resize(false);assert.equal(f.language.parentElement,f.languageHome);assert.equal(f.language.inert,true);
    f.panel.mobileNavigation.setAvailable(true);assert.equal(f.language.inert,false);
  }
}
// Late additions use an explicit refresh, so initialization order never leaves
// links without timing or gives removed desktop controls mobile-only styles.
{
  const f=fixture('finds'),extra=new Element();extra.tagName='A';f.language.append(extra);f.panel.mobileNavigation.refreshItems();
  assert.equal(extra.properties.get('--mobile-nav-enter'),'396ms');assert.equal(extra.properties.get('--mobile-nav-exit'),'0ms');
  assert.equal(extra.classes.has('mobile-nav-item'),true);
  f.resize(false);assert.equal(extra.classes.has('mobile-nav-item'),false);
}

const css=readFileSync(new URL('../css/mobile-nav.css',import.meta.url),'utf8');
// Finds deliberately has no html.js bootstrap. Mobile visual states must be
// gated only by the shared controller's readiness marker, across all routes.
assert.doesNotMatch(css.replace(/\/\*[\s\S]*?\*\//g,''), /\.js\s/, 'mobile visibility cannot depend on a page-specific bootstrap');
const openPanelRule=css.match(/([^{}]+mobile-nav-panel:is\(\.is-mobile-open,\.is-mobile-closing\))\{([^}]+)\}/);
assert.ok(openPanelRule);assert.match(openPanelRule[1], /mobile-navigation-ready/);
assert.match(openPanelRule[2], /visibility:visible/);
const openItemRule=css.match(/([^{}]+mobile-nav-panel\.is-mobile-open \.mobile-nav-item)\{([^}]+)\}/);
assert.ok(openItemRule);assert.match(openItemRule[1], /mobile-navigation-ready/);
for(const declaration of ['opacity:1','visibility:visible','pointer-events:auto','transform:none'])assert.ok(openItemRule[2].includes(declaration), declaration);
assert.match(css,/@media\(max-width:767px\)/);assert.match(css,/min-height:44px/);assert.match(css,/safe-area-inset-top/);assert.match(css,/safe-area-inset-bottom/);assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(css,/\.mobile-nav-toggle,\.finds-page-nav \.mobile-nav-home\{display:none\}/);
assert.match(source,/max-width: 1023px\) and \(max-height: 500px\) and \(pointer: coarse/);
assert.match(css,/max-width:1023px\) and \(max-height:500px\) and \(pointer:coarse/);
assert.match(css,/:is\(\.home-page,\.about-page,\.objects-page\)\.mobile-navigation-ready \.mobile-nav-panel :is\(a,button\)\{[^}]*min-height:44px;[^}]*padding:6px 12px;[^}]*border:1px solid var\(--ink\);[^}]*background:var\(--white\);[^}]*font:400 12px\/1.4 var\(--font\)/);
assert.match(css,/\.page-nav-contact\)\{display:contents;margin:0;padding:0;border:0\}/);
assert.match(css,/mobile-nav-panel\{[^}]*gap:4px;[^}]*background:transparent/);
assert.doesNotMatch(css,/translateX\(12px\)|width:6px/,'mobile hover does not reintroduce Home-only squares or movement');
const homeSource=readFileSync(new URL('../js/walla.js',import.meta.url),'utf8');
assert.match(homeSource,/querySelector\('\.home-page \.language-switch'\)/);
assert.match(homeSource,/pageNav\.querySelectorAll\('a\[href\^="#"\]'\)/);
for(const route of ['index.html','about/index.html','objects/index.html','ja/index.html','ja/about/index.html','ja/objects/index.html']){
  const html=readFileSync(new URL(`../${route}`,import.meta.url),'utf8').replace(/<template\b[\s\S]*?<\/template>/g,'');
  if(route.includes('objects/')){assert.doesNotMatch(html,/<nav class="finds-page-nav"/);assert.match(html,/class="finds-home-trigger" href="\.\.\/"/);continue;}
  const button=html.match(/<button class="mobile-nav-toggle"[^>]*>/)?.[0];assert.ok(button,`${route}: hamburger`);
  assert.match(button,/type="button"/);assert.match(button,/aria-expanded="false"/);assert.match(button,new RegExp(`aria-label="${route.startsWith('ja/')?'ナビゲーションメニュー':'Navigation menu'}"`));
  const id=button.match(/aria-controls="([^"]+)"/)[1];const nav=html.match(new RegExp(`<nav[^>]*id="${id}"[^>]*>[\\s\\S]*?<\\/nav>`))?.[0];assert.ok(nav,`${route}: controlled nav`);
  assert.equal((nav.match(/href="[^"]*#connect"/g)||[]).length,0,`${route}: no Connect anchor`);assert.equal((nav.match(/data-contact/g)||[]).length,1);
  assert.match(html,/css\/mobile-nav.css\?v=3/);assert.match(html,/js\/mobile-nav.js\?v=2/);
  const language=html.match(/<nav class="(?:language-switch|objects-language)"[^>]*>[\s\S]*?<\/nav>/g);assert.equal(language?.length,1,`${route}: one original language landmark`);
  assert.equal((language[0].match(/hreflang="(?:en|ja)"/g)||[]).length,2);
  const page=route.includes('objects/')?'objects/':route.includes('about/')?'about/':'';
  const base=`https://preview.test/${route.replace(/index\.html$/,'')}`;
  for(const [,href,lang] of language[0].matchAll(/<a href="([^"]+)"[^>]*hreflang="(en|ja)"/g))assert.equal(new URL(href,base).pathname,`/${lang==='ja'?'ja/':''}${page}`);
  if(route.includes('objects/'))assert.match(nav,/class="mobile-nav-home" href="\.\.\/"/);
}
console.log('PASS shared mobile navigation: all six routes, one live EN/JA landmark, native clicks, stagger refresh, responsive/modal focus, Home reveal/current-language preservation, and consistent label/panel styling.');
