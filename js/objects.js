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
    imageClass:card.querySelector('img').className, image:card.querySelector('img').getAttribute('src'), alt:card.querySelector('img').alt,
    imageSrcset:card.querySelector('img').getAttribute('srcset') || '',
    url:card.querySelector('.object-open').getAttribute('href'), description:card.querySelector('.object-description').textContent,
    gallery:[...card.querySelector('.object-gallery').content.querySelectorAll('img')],
    credit:card.querySelector('.object-source').href, card
  }));
  const layer = canvas.querySelector('.objects-layer');
  const empty = canvas.querySelector('.objects-empty');
  const categoryButtons = [...document.querySelectorAll('[data-category-filter]')];
  const status = document.getElementById('objects-status');
  const dialog = document.getElementById('object-dialog');
  const close = dialog.querySelector('[data-close]');
  let active = catalog, category = 'all', list = false;
  let x = 0, y = 0, cell = 280, row = 324, frame = 0, gesture = null, suppressClick = false, returnFocus = null;
  const zoomInput=document.getElementById('objects-zoom');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let zoom=0, focusMode=false, focusColumn=0, focusRow=0, motion=null, motionFrame=0, wheelTimer=0;
  const geometry=(width,value,height=canvas.clientHeight)=>{const small=Math.min(width<=600?112:144,Math.max(48,height*.2)),large=Math.max(small,Math.min(width*.72,height*.64,Math.max(64,height-192),640)),size=small+(large-small)*value/100;return {cell:size,row:size+52};};
  const mod = (value, divisor) => ((value % divisor) + divisor) % divisor;
  const indexAt = (column, line, count) => mod(column + line * (Math.ceil(Math.sqrt(count)) + 1), count);
  const tileKey = (column, line) => `${column}:${line}`;
  const tiles = new Map();
  const nearest=()=>({column:Math.round((canvas.clientWidth/2-x)/cell-.5),line:Math.round((canvas.clientHeight/2-y-cell/2)/row)});
  function stopMotion(){if(motionFrame)cancelAnimationFrame(motionFrame);motionFrame=0;motion=null;clearTimeout(wheelTimer);wheelTimer=0;}
  function pose(target,animate=true){
    stopMotion();
    if(!animate||reduced.matches){({x,y,cell,row}=target);schedule();return;}
    motion={from:{x,y,cell,row},target,start:null};
    const tick=now=>{
      if(!motion)return;
      if(motion.start===null)motion.start=now;
      const progress=Math.min(1,(now-motion.start)/560),ease=1-Math.pow(1-progress,3);
      for(const key of ['x','y','cell','row']){const value=motion.from[key]+(motion.target[key]-motion.from[key])*ease;if(key==='x')x=value;else if(key==='y')y=value;else if(key==='cell')cell=value;else row=value;}
      schedule();
      if(progress<1)motionFrame=requestAnimationFrame(tick);else{motion=null;motionFrame=0;}
    };
    motionFrame=requestAnimationFrame(tick);
  }
  function focusAt(column,line,animate=true){
    if(!active.length)return;
    focusColumn=column;focusRow=line;
    const size=geometry(canvas.clientWidth,zoom);
    pose({x:(canvas.clientWidth-size.cell)/2-column*size.cell,y:(canvas.clientHeight-size.cell)/2-line*size.row,...size},animate);
    const item=active[indexAt(column,line,active.length)];
    document.getElementById('objects-focus-status').textContent=`${item.brand}, ${item.name}`;
  }
  function settleGeometry(animate=false){
    const size=geometry(canvas.clientWidth,zoom);if(Math.abs(cell-size.cell)<.01&&Math.abs(row-size.row)<.01)return;
    if(focusMode){focusAt(focusColumn,focusRow,animate);return;}
    const cx=canvas.clientWidth/2,cy=canvas.clientHeight/2,worldX=(cx-x)/cell,worldY=(cy-y-cell/2)/row;
    pose({x:cx-worldX*size.cell,y:cy-size.cell/2-worldY*size.row,...size},animate);
  }
  function announceCenter(){
    if(!active.length)return;const center=nearest(),item=active[indexAt(focusMode?focusColumn:center.column,focusMode?focusRow:center.line,active.length)];
    const live=document.getElementById('objects-focus-status'),label=`${item.brand}, ${item.name}`;if(live.textContent!==label)live.textContent=label;
  }
  function draw(){
    frame=0;if(list||!active.length)return;
    const width=canvas.clientWidth,height=canvas.clientHeight;
    canvas.style.setProperty('--object-cell',`${cell}px`);
    const firstColumn=Math.floor(-x/cell)-1,firstRow=Math.floor(-y/row)-1,wanted=new Set();
    for(let line=firstRow;line<=firstRow+Math.ceil(height/row)+2;line++)for(let column=firstColumn;column<=firstColumn+Math.ceil(width/cell)+2;column++){
      const key=tileKey(column,line),item=active[indexAt(column,line,active.length)];wanted.add(key);
      let tile=tiles.get(key);if(!tile){tile=createTile(item);layer.append(tile);tiles.set(key,tile);}
      tile.dataset.column=column;tile.dataset.line=line;
      // Select a sharp source for the rendered square as zoom changes.
      const image=tile.querySelector('img'), imageSize=`${Math.ceil(cell-48)}px`;
      if(image.sizes!==imageSize)image.sizes=imageSize;
      tile.classList.toggle('is-focused',focusMode&&column===focusColumn&&line===focusRow);
      tile.style.transform=`translate(${column*cell+x}px,${line*row+y}px)`;
    }
    for(const [key,tile] of tiles)if(!wanted.has(key)){tile.remove();tiles.delete(key);}
  }
  function createTile(item){
    const tile=document.createElement('figure');tile.className='objects-tile';tile.dataset.object=item.id;
    const image=document.createElement('img');image.sizes=`${Math.ceil(cell-48)}px`;if(item.imageSrcset)image.srcset=item.imageSrcset;image.src=item.image;image.alt='';image.draggable=false;image.decoding='async';image.className=item.imageClass||'';
    const caption=document.createElement('figcaption'),brand=document.createElement('span');brand.textContent=item.brand;caption.append(brand,document.createTextNode(item.name));
    tile.append(image,caption);return tile;
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
  function clearTiles(){for(const tile of tiles.values())tile.remove();tiles.clear();}
  function reset(){stopMotion();({cell,row}=geometry(canvas.clientWidth,zoom));x=(canvas.clientWidth-cell)/2;y=(canvas.clientHeight-cell)/2;focusColumn=focusRow=0;clearTiles();schedule();}
  function setZoom(value){
    cancelGesture();stopMotion();const center=nearest(),cx=canvas.clientWidth/2,cy=canvas.clientHeight/2;
    const worldX=(cx-x)/cell,worldY=(cy-y-cell/2)/row;
    zoom=Math.max(0,Math.min(100,value));focusMode=zoom===100;
    page.classList.toggle('objects-focused',focusMode);page.classList.toggle('objects-min-zoom',zoom===0);page.classList.toggle('objects-show-labels',zoom>=50);
    zoomInput.setAttribute('aria-valuetext',focusMode?t('Focused canvas'):`${zoom}% ${t('Canvas')}`);
    canvas.setAttribute('aria-label',t(focusMode?'Focused object canvas':'Infinite object grid'));
    document.getElementById('objects-instructions').textContent=t(focusMode?'Select a neighboring image in any direction to center it. Select the centered image to open details. Arrow keys move between neighbors.':'Drag in any direction to explore. Arrow keys move the grid. Enter opens the object at the center.');
    if(focusMode)focusAt(center.column,center.line);
    else{const size=geometry(canvas.clientWidth,zoom);pose({x:cx-worldX*size.cell,y:cy-size.cell/2-worldY*size.row,...size});}
  }
  function filter(){
    cancelGesture();stopMotion();active=catalog.filter(item=>category==='all'||item.category===category);
    cards.forEach(card=>card.hidden=!active.some(item=>item.id===card.dataset.object));
    status.textContent=`${active.length} ${t('objects')}`;empty.hidden=active.length>0;
    document.querySelector('.objects-list-empty').hidden=active.length>0||!list;
    categoryButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.categoryFilter===category)));
    reset();
  }
  const purchaseButton=dialog.querySelector('.objects-purchased-button'),purchaseStatus=document.getElementById('objects-purchased-status');
  const purchaseRetry=dialog.querySelector('[data-purchased-retry]');
  let purchaseGeneration=0,purchaseItem=null,purchased=false,purchasePending=false;
  function purchaseData(data){if(!Number.isSafeInteger(data.count)||data.count<0||typeof data.purchased!=='boolean')throw new Error('Invalid purchase response');return data;}
  function paintPurchase(data){purchased=data.purchased;purchaseButton.setAttribute('aria-pressed',String(purchased));purchaseButton.textContent=t(purchased?'I have it ✓':'I have it');purchaseStatus.textContent=t(data.count===1?'Owned by {count} user':'Owned by {count} users').replace('{count}',String(data.count));purchaseButton.disabled=false;purchaseRetry.hidden=true;}
  async function loadPurchased(item){
    const generation=++purchaseGeneration;purchaseItem=item;purchasePending=true;purchaseButton.disabled=true;purchaseButton.setAttribute('aria-pressed','false');purchaseButton.textContent=t('I have it');purchaseStatus.textContent=t('Loading shared count…');purchaseRetry.hidden=true;
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
  let detailItem=null, detailTransition=0, detailBusy=false;
  const detailSheet=dialog.querySelector('.objects-dialog-scroll');
  function paintDetailNavigation(item) {
    detailItem=item;
    const index=active.indexOf(item);
    dialog.querySelectorAll('[data-product-step]').forEach(button=>{
      const step=Number(button.dataset.productStep),neighbor=active[mod(index+step,active.length)];
      button.hidden=active.length<2;
      const image=document.createElement('img');image.src=neighbor.image;image.alt='';
      const label=document.createElement('span');label.textContent=neighbor.brand+' — '+neighbor.name;
      button.setAttribute('aria-label',t(step<0?'Previous product':'Next product')+': '+neighbor.name);
      button.replaceChildren(image,label);
    });
  }
  dialog.querySelectorAll('[data-product-step]').forEach(button=>button.addEventListener('click',async()=>{
    if(detailBusy||!detailItem||active.length<2)return;
    detailBusy=true;
    const token=++detailTransition,step=Number(button.dataset.productStep);
    const item=active[mod(active.indexOf(detailItem)+step,active.length)];
    const duration=reduced.matches?0:260;
    await detailSheet.animate([{transform:'translateY(0)',opacity:1},{transform:`translateY(${-step*80}px)`,opacity:0}],{duration,easing:'cubic-bezier(.4,0,1,1)'}).finished.catch(()=>{});
    if(token!==detailTransition||!dialog.open)return;
    show(item,returnFocus);
    const title=dialog.querySelector('.objects-dialog-title');title.tabIndex=-1;title.focus({preventScroll:true});
    await detailSheet.animate([{transform:`translateY(${step*80}px)`,opacity:0},{transform:'translateY(0)',opacity:1}],{duration:reduced.matches?0:420,easing:'cubic-bezier(.2,.8,.2,1)'}).finished.catch(()=>{});
    if(token===detailTransition)detailBusy=false;
  }));
  function show(item, trigger){
    if(!item)return;
    cancelGesture();stopMotion();if(focusMode)focusAt(focusColumn,focusRow,false);else settleGeometry();
    returnFocus=trigger;
    const photos=item.gallery.map((photo,index)=>{
      const image=photo.cloneNode(true);
      image.className='objects-dialog-image';
      image.loading=index===0?'eager':'lazy';
      return image;
    });
    dialog.querySelector('.objects-dialog-photo').replaceChildren(...photos);
    dialog.querySelector('.objects-dialog-title').textContent=item.name;
    dialog.querySelector('.objects-dialog-brand').textContent=item.brand;
    dialog.querySelector('.objects-dialog-description').textContent=item.description;
    const badges=dialog.querySelector('.objects-dialog-tags');badges.replaceChildren();
    for(const name of item.tags){const badge=document.createElement('span');badge.textContent=t(name);badges.append(badge);}
    const productLink=dialog.querySelector('.objects-dialog-link');
    productLink.hidden=!item.url;
    if(item.url)productLink.href=item.url;else productLink.removeAttribute('href');
    dialog.querySelector('.objects-dialog-availability').hidden=!!item.url;
    const sources=[...new Set([item.credit,...item.gallery.map(photo=>photo.dataset.source)].filter(Boolean))];
    dialog.querySelector('.objects-dialog-sources').replaceChildren(...sources.map(url=>{
      const link=document.createElement('a');
      link.href=url;link.target='_blank';link.rel='noopener noreferrer';
      link.textContent=new URL(url).hostname.replace(/^www\./,'');
      return link;
    }));
    loadPurchased(item);if(!dialog.open)dialog.showModal();
    paintDetailNavigation(item);
    dialog.querySelector('.objects-dialog-scroll').scrollTop=0;
    dialog.querySelector('.objects-dialog-copy').scrollTop=0;
    close.focus({preventScroll:true});
  }
  function cancelGesture(event){
    if(!gesture||(event?.pointerId!=null&&event.pointerId!==gesture.id))return;
    const id=gesture.id;gesture=null;schedule();page.classList.remove('objects-dragging');canvas.classList.remove('is-dragging');
    if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
  }
  canvas.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button!==0||event.target.closest('button'))return;
    stopMotion();gesture={id:event.pointerId,x:event.clientX,y:event.clientY,startX:x,startY:y,moved:false};suppressClick=false;
  });
  canvas.addEventListener('pointermove',event=>{
    if(!gesture||event.pointerId!==gesture.id)return;
    const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
    if(!gesture.moved&&Math.hypot(dx,dy)<6)return;
    if(!gesture.moved){gesture.moved=true;suppressClick=true;canvas.setPointerCapture(event.pointerId);canvas.classList.add('is-dragging');}
    x=gesture.startX+dx;y=gesture.startY+dy;schedule();
  },{passive:true});
  canvas.addEventListener('pointerup',event=>{const snap=gesture&&event.pointerId===gesture.id&&gesture.moved&&focusMode;cancelGesture(event);if(snap){const center=nearest();focusAt(center.column,center.line);}else settleGeometry(true);});
  canvas.addEventListener('pointercancel',event=>{suppressClick=true;cancelGesture(event);settleGeometry();});
  canvas.addEventListener('lostpointercapture',event=>{if(event.target===canvas)cancelGesture(event);});
  window.addEventListener('pointerup',event=>cancelGesture(event));
  window.addEventListener('pointercancel',event=>{suppressClick=true;cancelGesture(event);});
  window.addEventListener('blur',()=>{cancelGesture();stopMotion();settleGeometry();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelGesture();stopMotion();settleGeometry();}});
  canvas.addEventListener('click',event=>{
    if(suppressClick){suppressClick=false;return;}
    const tile=event.target.closest('[data-object]');if(!tile)return;
    if(focusMode){const column=Number(tile.dataset.column),line=Number(tile.dataset.line);const target=geometry(canvas.clientWidth,zoom),centered=Math.abs(x+column*cell+cell/2-canvas.clientWidth/2)<1&&Math.abs(y+line*row+cell/2-canvas.clientHeight/2)<1&&Math.abs(cell-target.cell)<1;if(column!==focusColumn||line!==focusRow||motion||!centered){focusAt(column,line);return;}}
    show(catalog.find(item=>item.id===tile.dataset.object),canvas);
  });
  canvas.addEventListener('wheel',event=>{
    if(event.ctrlKey||event.metaKey)return;
    event.preventDefault();const unit=event.deltaMode===1?16:event.deltaMode===2?canvas.clientHeight:1;
    stopMotion();x-=event.deltaX*unit;y-=event.deltaY*unit;schedule();
    wheelTimer=setTimeout(()=>{if(focusMode){const center=nearest();focusAt(center.column,center.line);}else settleGeometry(true);},140);
  },{passive:false});
  canvas.addEventListener('focus',announceCenter);
  canvas.addEventListener('keydown',event=>{
    if(event.target!==canvas)return;
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','Enter',' '].includes(event.key))event.preventDefault();else return;
    if(event.key==='Home'){reset();return;}
    if(event.key==='Enter'||event.key===' '){
      if(active.length)show(active[indexAt(focusMode?focusColumn:nearest().column,focusMode?focusRow:nearest().line,active.length)],canvas);return;
    }
    if(focusMode){focusAt(focusColumn+(event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0),focusRow+(event.key==='ArrowDown'?1:event.key==='ArrowUp'?-1:0));return;}
    stopMotion();
    const step=event.shiftKey?cell:cell/2;
    if(event.key==='ArrowLeft')x+=step;if(event.key==='ArrowRight')x-=step;
    if(event.key==='ArrowUp')y+=step;if(event.key==='ArrowDown')y-=step;schedule();announceCenter();
  });
  collection.addEventListener('click',event=>{
    const link=event.target.closest('.object-open');if(!link||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
    event.preventDefault();show(catalog.find(item=>item.card.contains(link)),link);
  });
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{detailTransition++;detailBusy=false;detailSheet.getAnimations().forEach(animation=>animation.cancel());purchaseGeneration++;returnFocus?.focus({preventScroll:true});returnFocus=null;});
  categoryButtons.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.categoryFilter;filter();}));
  document.querySelectorAll('[data-reset-filters]').forEach(button=>button.addEventListener('click',()=>{category='all';filter();}));
  document.querySelector('[data-reset-view]').addEventListener('click',reset);
  zoomInput.addEventListener('input',()=>setZoom(Number(zoomInput.value)));
  document.querySelectorAll('[data-zoom-step]').forEach(button=>button.addEventListener('click',()=>{
    zoomInput.value=String(Math.max(0,Math.min(100,zoom+Number(button.dataset.zoomStep))));
    setZoom(Number(zoomInput.value));
  }));
  const infoButton=document.querySelector('.objects-info'),infoDialog=document.getElementById('objects-info-dialog');
  const infoSeenKey='2d1-finds-info-dismissed-v1';
  const openInfo=()=>{if(dialog.open||infoDialog.open)return;cancelGesture();stopMotion();settleGeometry();infoDialog.showModal();infoDialog.querySelector('button').focus();};
  infoButton.addEventListener('click',openInfo);
  infoDialog.querySelector('[data-info-close]').addEventListener('click',()=>infoDialog.close());
  infoDialog.addEventListener('close',()=>{try{localStorage.setItem(infoSeenKey,'1');}catch{}infoButton.focus({preventScroll:true});});
  infoDialog.addEventListener('click',event=>{if(event.target===infoDialog){const b=infoDialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)infoDialog.close();}});
  let measuredWidth=0,measuredHeight=0;
  new ResizeObserver(()=>{
    const width=canvas.clientWidth,height=canvas.clientHeight;if(!width||!height)return;
    cancelGesture();stopMotion();
    if(!measuredWidth)reset();
    else if(focusMode)focusAt(focusColumn,focusRow,false);
    else{const centerX=(measuredWidth/2-x)/cell,centerY=(measuredHeight/2-y-cell/2)/row;({cell,row}=geometry(width,zoom,height));x=width/2-centerX*cell;y=height/2-cell/2-centerY*row;schedule();}
    measuredWidth=width;measuredHeight=height;
  }).observe(canvas);
  reduced.addEventListener('change',()=>{if(reduced.matches&&motion)pose(motion.target,false);});
  document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();canvas.focus();});
  page.classList.add('objects-ready','objects-min-zoom');filter();
  let infoSeen=false;try{infoSeen=localStorage.getItem(infoSeenKey)==='1';}catch{}
  if(!infoSeen)openInfo();
})();
