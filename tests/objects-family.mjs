import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const source=read('../js/objects.js');
const products=JSON.parse(read('../data/objects.json'));
const assignments=JSON.parse(read('../data/object-families.json'));
assert.deepEqual(Object.keys(assignments).sort(),products.map(item=>item.id).sort());
const catalog=products.map(item=>({...item,family:assignments[item.id]}));
const ja=JSON.parse(read('../locales/ja.json'));
const families=['Characters','Companions','Classics','Oddities','Rituals'];
assert.ok(catalog.length>0);
for(const item of catalog)assert.ok(families.includes(item.family),`Missing/unknown family on ${item.id}`);
for(const family of families){assert.ok(catalog.some(item=>item.family===family));assert.ok(ja[family]);}
assert.ok(ja.Family);
const lookup=JSON.parse(source.match(/^  const objectFamilies = (.*);$/m)[1]);
assert.deepEqual(lookup,assignments,'generated runtime lookup matches curated data exactly');
assert.ok(source.includes('family:objectFamilies[card.dataset.object]'));
for(const route of ['../finds/index.html','../ja/finds/index.html']){
  const html=read(route);
  for(const item of catalog){
    const card=html.match(new RegExp(`<article[^>]*data-object="${item.id}"[^>]*>`))?.[0];
    assert.ok(card,`${route}: missing ${item.id}`);
    assert.ok(!card.includes('data-family='),'static catalog does not duplicate family metadata');
  }
}

// Exercise the real production controller with a minimal DOM fixture. This is
// unit/controller coverage, not a replacement for rendered-browser QA.
function fixture(language){
  let context;
  class Element{
    children=[];attrs={};handlers={};dataset={};hidden=false;inert=false;style={};title='';ownText='';value='';
    classList={add(){}};
    constructor(tag='div'){this.tag=tag;}
    get textContent(){return this.ownText+this.children.map(child=>child.textContent).join('');}
    set textContent(value){this.ownText=value;this.children=[];}
    append(...children){this.children.push(...children);}
    replaceChildren(...children){this.children=children;this.ownText='';}
    setAttribute(key,value){this.attrs[key]=value;}
    addEventListener(name,handler){this.handlers[name]=handler;}
    emit(name,event={}){this.handlers[name]?.(event);}
    querySelectorAll(tag){return this.children.flatMap(child=>[...(child.tag===tag?[child]:[]),...child.querySelectorAll(tag)]);}
    focus(){context.document.activeElement=this;}
    blur(){context.document.activeElement=null;}
    closest(){return wrap;}
  }
  const suggestions=new Element(),wrap=new Element(),searchInput=new Element('input'),resetButton=new Element('button');
  suggestions.hidden=true;
  const cards=catalog.map(item=>{const card=new Element();card.dataset.object=item.id;return card;});
  const listEmpty=new Element();
  context={catalog,cards,active:[],category:'all',list:false,searchQuery:'',selectedTag:'',
    selectedFamilies:new Set(),selectedCategories:new Set(),selectedColors:new Set(),
    searchInput,categoryButtons:[],status:new Element(),empty:new Element(),reduced:{matches:true},
    visitOrders:new Map([['all',catalog]]),cancelGesture(){},stopMotion(){},reset(){},
    t:text=>language==='ja'?(ja[text]||text):text,
    document:{activeElement:null,addEventListener(){},getElementById:()=>suggestions,
      createElement:tag=>new Element(tag),createTextNode:text=>{const node=new Element('#text');node.textContent=text;return node;},
      querySelector:()=>listEmpty,querySelectorAll:()=>[resetButton]}};
  vm.createContext(context);
  const filtering=source.slice(source.indexOf('  function filter(){'),source.indexOf('  const purchaseButton='));
  const controls=source.slice(source.indexOf('  const suggestions='),source.indexOf("  document.querySelector('[data-reset-view]')"));
  vm.runInContext(filtering+controls,context);
  const row=label=>suggestions.children.find(item=>item.attrs['aria-label']===context.t(label));
  const button=(group,value)=>row(group).children.find(item=>item.tag==='button'&&(item.title===context.t(value)||item.textContent.replace(' ×','')===context.t(value)));
  const activeIds=()=>context.active.map(item=>item.id);
  const expectActive=expected=>assert.deepEqual(Array.from(activeIds()),expected.map(item=>item.id));
  searchInput.emit('focus');context.filter();
  return {context,suggestions,searchInput,resetButton,cards,row,button,expectActive};
}
for(const language of ['en','ja']){
  const f=fixture(language),c=f.context;
  assert.deepEqual(f.suggestions.children.map(row=>row.attrs['aria-label']),['Family','Category','Color'].map(c.t));
  assert.deepEqual(f.row('Family').children.slice(1).map(button=>button.textContent),families.map(c.t));
  assert.equal(f.suggestions.hidden,false);
  f.expectActive(catalog);
  f.button('Family',families[0]).emit('click');
  f.expectActive(catalog.filter(item=>item.family===families[0]));
  assert.equal(f.button('Family',families[0]).attrs['aria-pressed'],'true');
  assert.equal(c.document.activeElement,f.button('Family',families[0]),'rerender restores selected button focus');
  f.button('Family',families[1]).emit('click');
  f.expectActive(catalog.filter(item=>families.slice(0,2).includes(item.family)));
  assert.equal(c.selectedFamilies.size,2,'multi-family selections are independent and OR together');
  const sample=catalog.find(item=>item.family===families[0]&&item.tags.length&&item.colors.length);
  const tag=sample.tags[0],color=sample.colors[0];
  f.button('Category',tag).emit('click');f.button('Color',color).emit('click');
  const intersect=catalog.filter(item=>families.slice(0,2).includes(item.family)&&item.tags.includes(tag)&&item.colors.includes(color));
  f.expectActive(intersect);
  assert.equal(c.selectedFamilies.size,2);assert.ok(c.selectedCategories.has(tag));assert.ok(c.selectedColors.has(color));
  f.searchInput.value=sample.brand;f.searchInput.emit('input');
  assert.ok(c.active.some(item=>item.id===sample.id),'text search intersects selected facets');
  for(const item of c.active)assert.ok(intersect.some(expected=>item.id===expected.id));
  f.searchInput.value='definitely-no-such-object-197348';f.searchInput.emit('input');
  assert.equal(c.active.length,0);assert.equal(c.empty.hidden,false);
  assert.ok(f.cards.every(card=>card.hidden));
  f.resetButton.emit('click');f.expectActive(catalog);
  assert.equal(c.selectedFamilies.size+c.selectedCategories.size+c.selectedColors.size,0);
  assert.equal(f.searchInput.value,'');assert.equal(c.empty.hidden,true);
  for(const family of families){
    f.searchInput.value=c.t(family);f.searchInput.emit('input');
    assert.ok(c.active.length>0,`search recognizes ${language} family text`);
    assert.ok(catalog.filter(item=>item.family===family).every(item=>c.active.some(active=>active.id===item.id)));
  }
  f.resetButton.emit('click');f.button('Family',families[0]).emit('click');f.button('Family',families[0]).emit('click');
  f.expectActive(catalog);assert.equal(f.button('Family',families[0]).attrs['aria-pressed'],'false');
  f.searchInput.closest().emit('keydown',{key:'Escape'});assert.equal(f.suggestions.hidden,true);
  f.searchInput.emit('focus');assert.equal(f.suggestions.hidden,false);assert.equal(f.suggestions.inert,false);
}
console.log(`PASS Family controller: ${catalog.length} EN/JA catalog cards, five localized suggestions, independent multi-select OR, Category/Color/text intersection, toggling, focus, empty/reset state and Escape/reopen. Rendered-browser QA is separate.`);
