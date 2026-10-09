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
  const zoomInput=document.getElementById('objects-zoom'), zoomLabel=document.getElementById('objects-zoom-mode');
  const slideControls=document.querySelector('.objects-slide-controls');
  let zoom=35, carousel=false, slideIndex=0, slideDrag=0, lastWheel=0;
  const geometry=(width,value)=>{const size=width<=600?128+value*2.3:160+value*4;return {cell:size,row:size+(width<=600?48:52)};};
  const mod = (value, divisor) => ((value % divisor) + divisor) % divisor;
  const indexAt = (column, line, count) => mod(column + line * (Math.ceil(Math.sqrt(count)) + 1), count);
  const tileKey = (column, line) => `${column}:${line}`;
  const tiles = new Map();
  function draw() {
    frame = 0;
    if (list || !active.length) return;
    const width = canvas.clientWidth, height = canvas.clientHeight;
    if(carousel){
      const size=Math.min(width*.86,720), picture=Math.min(height*.64,size-64);
      canvas.style.setProperty('--object-cell',`${size}px`);canvas.style.setProperty('--object-image',`${picture}px`);
      for(let position=-1;position<=1;position++){
        const item=active[mod(slideIndex+position,active.length)],key=`slide:${position}`;
        let tile=tiles.get(key);
        if(!tile){tile=createTile(item);layer.append(tile);tiles.set(key,tile);}
        tile.style.transform=`translate(${(width-size)/2+position*width+slideDrag}px,${(height-picture-96)/2}px)`;
      }
      const current=active[mod(slideIndex,active.length)],announcement=`${mod(slideIndex,active.length)+1} / ${active.length} — ${current.brand}, ${current.name}`;
      const live=document.getElementById('objects-slide-status');if(live.textContent!==announcement)live.textContent=announcement;
      return;
    }
    ({cell,row}=geometry(width,zoom));
    canvas.style.setProperty('--object-cell',`${cell}px`);
    const firstColumn = Math.floor(-x/cell)-1, firstRow = Math.floor(-y/row)-1;
    const wanted = new Set();
    for(let line=firstRow;line<=firstRow+Math.ceil(height/row)+2;line++) {
      for(let column=firstColumn;column<=firstColumn+Math.ceil(width/cell)+2;column++) {
        const key=tileKey(column,line), item=active[indexAt(column,line,active.length)];wanted.add(key);
        let tile=tiles.get(key);
        if(!tile){
          tile=createTile(item);layer.append(tile);tiles.set(key,tile);
        }
        tile.style.transform=`translate(${column*cell+x}px,${line*row+y}px)`;
      }
    }
    for(const [key,tile] of tiles)if(!wanted.has(key)){tile.remove();tiles.delete(key);}
  }
  function createTile(item){
    const tile=document.createElement('figure');tile.className='objects-tile';tile.dataset.object=item.id;
    const image=document.createElement('img');image.src=item.image;image.alt='';image.draggable=false;image.decoding='async';
    const caption=document.createElement('figcaption'),brand=document.createElement('span');brand.textContent=item.brand;caption.append(brand,document.createTextNode(item.name));
    tile.append(image,caption);return tile;
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
  function clearTiles(){for(const tile of tiles.values())tile.remove();tiles.clear();}
  function reset(){
    ({cell,row}=geometry(canvas.clientWidth,zoom));x=(canvas.clientWidth-cell)/2;y=(canvas.clientHeight-row)/2;
    slideIndex=0;slideDrag=0;clearTiles();schedule();
  }
  function advance(direction){if(!active.length)return;slideIndex=mod(slideIndex+direction,active.length);slideDrag=0;clearTiles();schedule();}
  function setZoom(value){
    cancelGesture();const oldCell=cell,oldRow=row,cx=canvas.clientWidth/2,cy=canvas.clientHeight/2;
    const centerItem=active.length?indexAt(Math.floor((cx-x)/cell),Math.floor((cy-y)/row),active.length):0;
    const wasCarousel=carousel;zoom=Math.max(0,Math.min(100,value));carousel=zoom===100;
    if(carousel&&!wasCarousel)slideIndex=centerItem;
    ({cell,row}=geometry(canvas.clientWidth,zoom));
    if(wasCarousel&&!carousel){x=(canvas.clientWidth-cell)/2-slideIndex*cell;y=(canvas.clientHeight-row)/2;}
    else if(!carousel){x=cx-(cx-x)*cell/oldCell;y=cy-(cy-y)*row/oldRow;}
    slideDrag=0;page.classList.toggle('objects-carousel',carousel);
    zoomLabel.textContent=t(carousel?'Slides':'Grid');zoomInput.setAttribute('aria-valuetext',carousel?t('One object at a time'):`${zoom}% ${t('Grid')}`);
    canvas.setAttribute('aria-label',t(carousel?'Object carousel':'Infinite object grid'));
    document.getElementById('objects-instructions').textContent=t(carousel?'Swipe horizontally or use Left and Right arrows to change objects. Enter opens the selected object.':'Drag in any direction to explore. Arrow keys move the grid. Enter opens the object at the center. Use List for all objects in reading order.');
    slideControls.hidden=!carousel||!active.length||list;clearTiles();schedule();
  }
  function filter(){
    cancelGesture();
    active=catalog.filter(item=>(category==='all'||item.category===category)&&(tag==='all'||item.tags.includes(tag)));
    cards.forEach(card=>card.hidden=!active.some(item=>item.id===card.dataset.object));
    status.textContent=`${active.length} ${t('objects')}`;
    empty.hidden=active.length>0;
    slideControls.hidden=!carousel||!active.length||list;
    document.querySelector('.objects-list-empty').hidden=active.length>0||!list;
    categoryButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.categoryFilter===category)));
    reset();
  }
  function setView(value){
    cancelGesture();list=value==='list';page.classList.toggle('objects-list',list);
    viewButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===value)));
    document.querySelector('.objects-list-empty').hidden=active.length>0||!list;
    slideControls.hidden=!carousel||!active.length||list;
    if(!list)reset();
  }
  const purchaseButton=dialog.querySelector('.objects-purchased-button'),purchaseStatus=document.getElementById('objects-purchased-status');
  const purchaseRetry=dialog.querySelector('[data-purchased-retry]');
  let purchaseGeneration=0,purchaseItem=null,purchased=false,purchasePending=false;
  function purchaseData(data){if(!Number.isSafeInteger(data.count)||data.count<0||typeof data.purchased!=='boolean')throw new Error('Invalid purchase response');return data;}
  function paintPurchase(data){purchased=data.purchased;purchaseButton.setAttribute('aria-pressed',String(purchased));purchaseButton.textContent=t(purchased?'Purchased ✓':'Purchased');purchaseStatus.textContent=`${t('Purchased count')}: ${data.count}`;purchaseButton.disabled=false;purchaseRetry.hidden=true;}
  async function loadPurchased(item){
    const generation=++purchaseGeneration;purchaseItem=item;purchasePending=true;purchaseButton.disabled=true;purchaseButton.setAttribute('aria-pressed','false');purchaseButton.textContent=t('Purchased');purchaseStatus.textContent=t('Loading shared count…');purchaseRetry.hidden=true;
    try{const response=await fetch(`/api/purchased?product=${encodeURIComponent(item.id)}`,{credentials:'same-origin',cache:'no-store'});if(!response.ok)throw new Error('Unavailable');const data=purchaseData(await response.json());if(generation===purchaseGeneration)paintPurchase(data);}
    catch{if(generation===purchaseGeneration){purchaseStatus.textContent=t('Shared count unavailable. Nothing is recorded by this page.');purchaseRetry.hidden=false;}}
    finally{if(generation===purchaseGeneration)purchasePending=false;}
  }
  purchaseButton.addEventListener('click',async()=>{
    if(purchasePending||!purchaseItem)return;
    const generation=purchaseGeneration,item=purchaseItem,desired=!purchased;purchasePending=true;purchaseButton.disabled=true;purchaseStatus.textContent=t('Saving…');
    try{const response=await fetch('/api/purchased',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({product:item.id,purchased:desired})});if(!response.ok)throw new Error('Unavailable');const data=purchaseData(await response.json());if(generation===purchaseGeneration)paintPurchase(data);}
    catch{if(generation===purchaseGeneration){purchaseStatus.textContent=t('Could not confirm the change. Reload the count before trying again.');purchaseRetry.hidden=false;}}
    finally{if(generation===purchaseGeneration)purchasePending=false;}
  });
  purchaseRetry.addEventListener('click',()=>{if(purchaseItem&&!purchasePending)loadPurchased(purchaseItem);});
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
    loadPurchased(item);dialog.showModal();close.focus({preventScroll:true});
  }
  function cancelGesture(event){
    if(!gesture||(event?.pointerId!=null&&event.pointerId!==gesture.id))return;
    const id=gesture.id;gesture=null;slideDrag=0;schedule();page.classList.remove('objects-dragging');canvas.classList.remove('is-dragging');
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
    if(carousel)slideDrag=Math.max(-canvas.clientWidth,Math.min(canvas.clientWidth,dx));
    else{x=gesture.startX+dx;y=gesture.startY+dy;}schedule();
  },{passive:true});
  canvas.addEventListener('pointerup',event=>{if(gesture&&event.pointerId===gesture.id&&carousel){if(Math.abs(slideDrag)>canvas.clientWidth*.12)advance(slideDrag>0?-1:1);else{slideDrag=0;schedule();}}cancelGesture(event);});
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
    if(carousel){const delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;if(delta&&performance.now()-lastWheel>300){advance(delta>0?1:-1);lastWheel=performance.now();}return;}
    x-=event.deltaX*unit;y-=event.deltaY*unit;schedule();
  },{passive:false});
  canvas.addEventListener('keydown',event=>{
    if(event.target!==canvas)return;
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','Enter',' '].includes(event.key))event.preventDefault();else return;
    if(event.key==='Home'){reset();return;}
    if(event.key==='Enter'||event.key===' '){
      if(active.length)show(active[carousel?mod(slideIndex,active.length):indexAt(Math.floor((canvas.clientWidth/2-x)/cell),Math.floor((canvas.clientHeight/2-y)/row),active.length)],canvas);return;
    }
    if(carousel){if(event.key==='ArrowLeft')advance(-1);if(event.key==='ArrowRight')advance(1);return;}
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
  dialog.addEventListener('close',()=>{purchaseGeneration++;returnFocus?.focus({preventScroll:true});returnFocus=null;});
  categoryButtons.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.categoryFilter;filter();}));
  tags.addEventListener('change',()=>{tag=tags.value;filter();});
  document.querySelectorAll('[data-reset-filters]').forEach(button=>button.addEventListener('click',()=>{category=tag='all';tags.value='all';filter();}));
  viewButtons.forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
  document.querySelector('[data-reset-view]').addEventListener('click',reset);
  zoomInput.addEventListener('input',()=>setZoom(Number(zoomInput.value)));
  document.querySelectorAll('[data-slide]').forEach(button=>button.addEventListener('click',()=>advance(Number(button.dataset.slide))));
  const infoButton=document.querySelector('.objects-info'),infoDialog=document.getElementById('objects-info-dialog');
  infoButton.addEventListener('click',()=>{cancelGesture();infoDialog.showModal();infoDialog.querySelector('button').focus();});
  infoDialog.querySelector('[data-info-close]').addEventListener('click',()=>infoDialog.close());
  infoDialog.addEventListener('close',()=>infoButton.focus({preventScroll:true}));
  infoDialog.addEventListener('click',event=>{if(event.target===infoDialog){const b=infoDialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)infoDialog.close();}});
  let measuredWidth=0,measuredHeight=0;
  new ResizeObserver(()=>{
    const width=canvas.clientWidth,height=canvas.clientHeight;if(!width||!height)return;
    cancelGesture();
    if(!measuredWidth){reset();}
    else if(!carousel){const centerX=(measuredWidth/2-x)/cell,centerY=(measuredHeight/2-y)/row;({cell,row}=geometry(width,zoom));x=width/2-centerX*cell;y=height/2-centerY*row;clearTiles();schedule();}
    else{clearTiles();schedule();}
    measuredWidth=width;measuredHeight=height;
  }).observe(canvas);
  document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();setView('list');collection.tabIndex=-1;collection.focus();});
  page.classList.add('objects-ready');filter();
})();
