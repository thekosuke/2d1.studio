/* Infinite, virtualized shelf. A finite collection repeats in every direction. */
(() => {
  const page = document.querySelector('.objects-page');
  const canvas = document.getElementById('objects-canvas');
  const collection = document.getElementById('objects-collection');
  if (!page || !canvas || !collection) return;
  const t = window.SiteLanguage?.t || (text => text);
  const cards = [...collection.querySelectorAll('[data-object]')];
  const catalog = cards.map(card => ({
    id:card.dataset.object, category:card.dataset.category, tags:JSON.parse(card.dataset.tags),
    name:card.querySelector('h2').textContent, brand:card.querySelector('.object-brand').textContent,
    image:card.querySelector('img').getAttribute('src'), alt:card.querySelector('img').alt,
    url:card.querySelector('.object-open').href, description:card.querySelector('.object-description').textContent,
    credit:card.querySelector('.object-source').href, card
  }));
  const layer = canvas.querySelector('.objects-layer');
  const empty = canvas.querySelector('.objects-empty');
  const categoryButtons = [...document.querySelectorAll('[data-category-filter]')];
  const tags = document.getElementById('objects-tag');
  const status = document.getElementById('objects-status');
  const viewButtons = [...document.querySelectorAll('[data-view]')];
  const dialog = document.getElementById('object-dialog');
  const close = dialog.querySelector('[data-close]');
  let active = catalog, category = 'all', tag = 'all', list = false;
  let x = 0, y = 0, cell = 280, row = 324, frame = 0, gesture = null, suppressClick = false, returnFocus = null;
  const mod = (value, divisor) => ((value % divisor) + divisor) % divisor;
  const indexAt = (column, line, count) => mod(column + line * (Math.ceil(Math.sqrt(count)) + 1), count);
  const tileKey = (column, line) => `${column}:${line}`;
  const tiles = new Map();
  function draw() {
    frame = 0;
    if (list || !active.length) return;
    const width = canvas.clientWidth, height = canvas.clientHeight;
    cell = width <= 600 ? 184 : width <= 1000 ? 240 : 280;
    row = cell + (width <= 600 ? 48 : 52);
    canvas.style.setProperty('--object-cell',`${cell}px`);
    const firstColumn = Math.floor(-x/cell)-1, firstRow = Math.floor(-y/row)-1;
    const wanted = new Set();
    for(let line=firstRow;line<=firstRow+Math.ceil(height/row)+2;line++) {
      for(let column=firstColumn;column<=firstColumn+Math.ceil(width/cell)+2;column++) {
        const key=tileKey(column,line), item=active[indexAt(column,line,active.length)];wanted.add(key);
        let tile=tiles.get(key);
        if(!tile){
          tile=document.createElement('figure');tile.className='objects-tile';tile.dataset.object=item.id;
          const image=document.createElement('img');image.src=item.image;image.alt='';image.draggable=false;image.decoding='async';
          const caption=document.createElement('figcaption'),brand=document.createElement('span');brand.textContent=item.brand;caption.append(brand,document.createTextNode(item.name));
          tile.append(image,caption);layer.append(tile);tiles.set(key,tile);
        }
        tile.style.transform=`translate(${column*cell+x}px,${line*row+y}px)`;
      }
    }
    for(const [key,tile] of tiles)if(!wanted.has(key)){tile.remove();tiles.delete(key);}
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
  function clearTiles(){for(const tile of tiles.values())tile.remove();tiles.clear();}
  function reset(){x=canvas.clientWidth<=600?12:24;y=16;clearTiles();schedule();}
  function filter(){
    cancelGesture();
    active=catalog.filter(item=>(category==='all'||item.category===category)&&(tag==='all'||item.tags.includes(tag)));
    cards.forEach(card=>card.hidden=!active.some(item=>item.id===card.dataset.object));
    status.textContent=`${active.length} ${t('objects')}`;
    empty.hidden=active.length>0;
    document.querySelector('.objects-list-empty').hidden=active.length>0||!list;
    categoryButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.categoryFilter===category)));
    reset();
  }
  function setView(value){
    cancelGesture();list=value==='list';page.classList.toggle('objects-list',list);
    viewButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===value)));
    document.querySelector('.objects-list-empty').hidden=active.length>0||!list;
    if(!list)reset();
  }
  function show(item, trigger){
    if(!item)return;
    returnFocus=trigger;
    dialog.querySelector('.objects-dialog-image').src=item.image;
    dialog.querySelector('.objects-dialog-image').alt=item.alt;
    dialog.querySelector('.objects-dialog-title').textContent=item.name;
    dialog.querySelector('.objects-dialog-brand').textContent=item.brand;
    dialog.querySelector('.objects-dialog-description').textContent=item.description;
    const badges=dialog.querySelector('.objects-dialog-tags');badges.replaceChildren();
    for(const name of item.tags){const badge=document.createElement('span');badge.textContent=t(name);badges.append(badge);}
    dialog.querySelector('.objects-dialog-link').href=item.url;
    dialog.querySelector('.objects-dialog-credit a').href=item.credit;
    dialog.showModal();close.focus({preventScroll:true});
  }
  function cancelGesture(event){
    if(!gesture||(event?.pointerId!=null&&event.pointerId!==gesture.id))return;
    const id=gesture.id;gesture=null;page.classList.remove('objects-dragging');canvas.classList.remove('is-dragging');
    if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
  }
  canvas.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button!==0||event.target.closest('button'))return;
    gesture={id:event.pointerId,x:event.clientX,y:event.clientY,startX:x,startY:y,moved:false};suppressClick=false;
  });
  canvas.addEventListener('pointermove',event=>{
    if(!gesture||event.pointerId!==gesture.id)return;
    const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
    if(!gesture.moved&&Math.hypot(dx,dy)<6)return;
    if(!gesture.moved){gesture.moved=true;suppressClick=true;canvas.setPointerCapture(event.pointerId);canvas.classList.add('is-dragging');}
    x=gesture.startX+dx;y=gesture.startY+dy;schedule();
  },{passive:true});
  canvas.addEventListener('pointerup',event=>{cancelGesture(event);});
  canvas.addEventListener('pointercancel',event=>{suppressClick=true;cancelGesture(event);});
  canvas.addEventListener('lostpointercapture',event=>{if(event.target===canvas)cancelGesture(event);});
  window.addEventListener('pointerup',event=>cancelGesture(event));
  window.addEventListener('pointercancel',event=>{suppressClick=true;cancelGesture(event);});
  window.addEventListener('blur',()=>cancelGesture());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelGesture();});
  canvas.addEventListener('click',event=>{
    if(suppressClick){suppressClick=false;return;}
    const tile=event.target.closest('[data-object]');if(tile)show(catalog.find(item=>item.id===tile.dataset.object),canvas);
  });
  canvas.addEventListener('wheel',event=>{
    if(event.ctrlKey||event.metaKey)return;
    event.preventDefault();const unit=event.deltaMode===1?16:event.deltaMode===2?canvas.clientHeight:1;
    x-=event.deltaX*unit;y-=event.deltaY*unit;schedule();
  },{passive:false});
  canvas.addEventListener('keydown',event=>{
    if(event.target!==canvas)return;
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','Enter',' '].includes(event.key))event.preventDefault();else return;
    if(event.key==='Home'){reset();return;}
    if(event.key==='Enter'||event.key===' '){
      if(active.length)show(active[indexAt(Math.floor((canvas.clientWidth/2-x)/cell),Math.floor((canvas.clientHeight/2-y)/row),active.length)],canvas);return;
    }
    const step=event.shiftKey?cell:cell/2;
    if(event.key==='ArrowLeft')x+=step;if(event.key==='ArrowRight')x-=step;
    if(event.key==='ArrowUp')y+=step;if(event.key==='ArrowDown')y-=step;schedule();
  });
  collection.addEventListener('click',event=>{
    const link=event.target.closest('.object-open');if(!link||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
    event.preventDefault();show(catalog.find(item=>item.card.contains(link)),link);
  });
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{returnFocus?.focus({preventScroll:true});returnFocus=null;});
  categoryButtons.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.categoryFilter;filter();}));
  tags.addEventListener('change',()=>{tag=tags.value;filter();});
  document.querySelectorAll('[data-reset-filters]').forEach(button=>button.addEventListener('click',()=>{category=tag='all';tags.value='all';filter();}));
  viewButtons.forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
  document.querySelector('[data-reset-view]').addEventListener('click',reset);
  new ResizeObserver(schedule).observe(canvas);
  document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();setView('list');collection.tabIndex=-1;collection.focus();});
  page.classList.add('objects-ready');filter();
})();
