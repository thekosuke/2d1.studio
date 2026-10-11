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
  let active = [], category = 'all', list = false, searchQuery = '', selectedTag = '';
  const searchInput=document.getElementById('objects-search');
  let x = 0, y = 0, cell = 280, row = 324, frame = 0, gesture = null, suppressClick = false, returnFocus = null;
  const zoomInput=document.getElementById('objects-zoom');
  const zoomButtons=[...document.querySelectorAll('[data-zoom-step]')];
  const zoomStatus=document.getElementById('objects-zoom-status');
  const mobileZoom=matchMedia('(max-width:767px), (max-width:1023px) and (max-height:500px) and (pointer:coarse)');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let zoom=0, focusMode=false, focusColumn=0, focusRow=0, motion=null, motionFrame=0, wheelTimer=0;
  const geometry=(width,value,height=canvas.clientHeight)=>{const small=Math.min(width<=600?112:144,Math.max(48,height*.2)),large=Math.max(small,Math.min(width*.72,height*.64,Math.max(64,height-192),640)),size=small+(large-small)*value/100;return {cell:size,row:size+52};};
  const mod = (value, divisor) => ((value % divisor) + divisor) % divisor;
  const indexAt = (column, line, count) => mod(column + line * (Math.ceil(Math.sqrt(count)) + 1), count);
  function shuffleForCanvas(items, random = Math.random) {
    const count=items.length;
    if(count<2)return items.slice();
    // These are the real repeating map's right, down, and two diagonal edges.
    // A linear brand shuffle misses vertical neighbors and wrap boundaries.
    const directions=[[1,0,4],[0,1,4],[-1,1,1],[1,1,1]];
    const neighbors=Array.from({length:count},()=>new Map());
    for(let a=0;a<count;a++)for(const [column,line,weight] of directions){
      const b=mod(a+indexAt(column,line,count),count);
      if(a===b)continue; // A small collection can repeat itself in a neighbor.
      neighbors[a].set(b,(neighbors[a].get(b)||0)+weight);
      neighbors[b].set(a,(neighbors[b].get(a)||0)+weight);
    }
    // Collaborations also share a brand with that brand's individual products.
    const brands=items.map(item=>String(item.brand||'').toLowerCase().split(/\s*×\s*/).map(name=>name.trim()).filter(Boolean));
    const related=brands.map(keys=>brands.map(other=>Number(keys.some(key=>other.includes(key)))));
    const shuffled=()=>{
      const order=Array.from({length:count},(_,index)=>index);
      for(let a=count-1;a>0;a--){const b=Math.floor(random()*(a+1));[order[a],order[b]]=[order[b],order[a]];}
      return order;
    };
    const score=order=>order.reduce((total,item,a)=>{
      for(const [b,weight] of neighbors[a])if(b>a)total+=weight*related[item][order[b]];
      return total;
    },0);
    const swapCost=(order,a,b)=>{
      let change=0;
      for(const [neighbor,weight] of neighbors[a])if(neighbor!==b)change+=weight*(related[order[b]][order[neighbor]]-related[order[a]][order[neighbor]]);
      for(const [neighbor,weight] of neighbors[b])if(neighbor!==a)change+=weight*(related[order[a]][order[neighbor]]-related[order[b]][order[neighbor]]);
      return change;
    };
    let best=null,bestScore=Infinity;
    // Bounded randomized alternatives avoid one prescribed pattern. Only
    // improving swaps are kept; dominant brands remain present when repeats
    // are unavoidable. Cardinal neighbors matter more than diagonals.
    for(let attempt=0;attempt<4;attempt++){
      const order=shuffled();let total=score(order);
      for(let pass=0;pass<4&&total>0;pass++){
        let improved=false;
        for(const a of shuffled()){
          if(![...neighbors[a]].some(([b])=>related[order[a]][order[b]]))continue;
          let change=0,choice=-1,ties=0;
          for(let b=0;b<count;b++){
            const delta=swapCost(order,a,b);
            if(delta<change){change=delta;choice=b;ties=1;}
            else if(delta===change&&delta<0&&random()<1/++ties)choice=b;
          }
          if(choice<0)continue;
          [order[a],order[choice]]=[order[choice],order[a]];total+=change;improved=true;
        }
        if(!improved)break;
      }
      if(total<bestScore){best=order;bestScore=total;}
      if(bestScore===0)break;
    }
    return best.map(index=>items[index]);
  }
  function createVisitOrders(items, random = Math.random) {
    const orders=new Map();
    for(const value of new Set(['all',...items.map(item=>item.category)])){
      orders.set(value,shuffleForCanvas(items.filter(item=>value==='all'||item.category===value),random));
    }
    return orders;
  }
  // Generate once per document load, then reuse across filters, motion and dialogs.
  const visitOrders=createVisitOrders(catalog);
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
    const width=canvas.clientWidth,height=canvas.clientHeight,center=nearest();
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
      tile.classList.toggle('is-keyboard-target',column===(focusMode?focusColumn:center.column)&&line===(focusMode?focusRow:center.line));
      tile.style.transform=`translate(${column*cell+x}px,${line*row+y}px)`;
    }
    for(const [key,tile] of tiles)if(!wanted.has(key)){tile.remove();tiles.delete(key);}
  }
  function createTile(item){
    const tile=document.createElement('figure');tile.className='objects-tile';tile.dataset.object=item.id;
    const image=document.createElement('img');image.sizes=`${Math.ceil(cell-48)}px`;if(item.imageSrcset)image.srcset=item.imageSrcset;image.src=item.image;image.alt='';image.draggable=false;image.decoding='async';image.className=item.imageClass||'';
    const caption=document.createElement('figcaption'),brand=document.createElement('span');brand.textContent=item.brand;caption.append(document.createTextNode(item.name),brand);
    tile.append(image,caption);return tile;
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
  function clearTiles(){for(const tile of tiles.values())tile.remove();tiles.clear();}
  function reset(){cancelGesture();stopMotion();({cell,row}=geometry(canvas.clientWidth,zoom));x=(canvas.clientWidth-cell)/2;y=(canvas.clientHeight-cell)/2;focusColumn=focusRow=0;clearTiles();schedule();}
  function updateZoomControls(){
    const description=focusMode?t('Focused canvas'):`${Math.round(zoom)}% ${t('Canvas')}`;
    zoomInput.value=String(zoom);
    zoomInput.setAttribute('aria-valuetext',description);
    zoomStatus.textContent=focusMode?`100% ${description}`:description;
    zoomButtons.forEach(button=>button.setAttribute('aria-disabled',String(Number(button.dataset.zoomStep)<0?zoom===0:zoom===100)));
  }
  function updateZoomLayout(){
    // One live range in the same keyboard order at every width. Keeping the
    // node in place also preserves focus and its value through rotation.
    zoomInput.hidden=false;zoomInput.disabled=false;zoomInput.tabIndex=0;
    zoomStatus.setAttribute('aria-live','off');
    updateZoomControls();
  }
  function updateCanvasZoom(value){
    zoom=Math.max(0,Math.min(100,value));focusMode=zoom===100;
    page.classList.toggle('objects-focused',focusMode);page.classList.toggle('objects-min-zoom',zoom===0);page.classList.toggle('objects-show-labels',zoom>=50);
    updateZoomControls();
    canvas.setAttribute('aria-label',t(focusMode?'Focused object canvas':'Infinite object grid'));
    document.getElementById('objects-instructions').textContent=t(focusMode?'Select a neighboring image in any direction to center it. Select the centered image to open details. Arrow keys move between neighbors.':'Drag in any direction to explore. Arrow keys move the grid. Enter opens the object at the center.');
  }
  function setZoom(value){
    if(!Number.isFinite(value))return;
    cancelGesture();stopMotion();const center=nearest(),cx=canvas.clientWidth/2,cy=canvas.clientHeight/2;
    const worldX=(cx-x)/cell,worldY=(cy-y-cell/2)/row;
    updateCanvasZoom(value);
    if(focusMode)focusAt(center.column,center.line);
    else{const size=geometry(canvas.clientWidth,zoom);pose({x:cx-worldX*size.cell,y:cy-size.cell/2-worldY*size.row,...size});}
  }
  function filter(){
    cancelGesture();stopMotion();active=(visitOrders.get(category)||[]).filter(item=>(!selectedTag||item.tags.includes(selectedTag))&&searchQuery.split(/\s+/).every(word=>[item.name,item.brand,item.description,item.category,...item.tags].join(' ').normalize('NFKC').toLocaleLowerCase().includes(word)));
    cards.forEach(card=>card.hidden=!active.some(item=>item.id===card.dataset.object));
    status.textContent=`${active.length} ${t('objects')}`;empty.hidden=active.length>0;
    document.querySelector('.objects-list-empty').hidden=active.length>0||!list;
    categoryButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.categoryFilter===category)));
    reset();
  }
  const purchaseButton=dialog.querySelector('.objects-purchased-button'),purchaseStatus=document.getElementById('objects-purchased-status');
  let purchaseGeneration=0,purchaseItem=null,purchased=false,purchasePending=false;
  function purchaseData(data){if(!Number.isSafeInteger(data.count)||data.count<0||typeof data.purchased!=='boolean')throw new Error('Invalid purchase response');return data;}
  function paintPurchase(data){purchased=data.purchased;purchaseButton.setAttribute('aria-pressed',String(purchased));purchaseButton.textContent=t(purchased?'I have it ✓':'I have it');purchaseStatus.textContent=t(data.count===1?'Owned by {count} user':'Owned by {count} users').replace('{count}',String(data.count));purchaseButton.disabled=false;}
  async function loadPurchased(item){
    const generation=++purchaseGeneration;purchaseItem=item;purchasePending=true;purchaseButton.disabled=true;purchaseButton.setAttribute('aria-pressed','false');purchaseButton.textContent=t('I have it');purchaseStatus.textContent=t('Loading shared count…');
    try{const response=await fetch(`/api/purchased?product=${encodeURIComponent(item.id)}`,{credentials:'same-origin',cache:'no-store'});if(!response.ok)throw new Error('Unavailable');const data=purchaseData(await response.json());if(generation===purchaseGeneration)paintPurchase(data);}
    catch{if(generation===purchaseGeneration){purchaseStatus.textContent='';}}
    finally{if(generation===purchaseGeneration)purchasePending=false;}
  }
  purchaseButton.addEventListener('click',async()=>{
    if(purchasePending||!purchaseItem)return;
    const generation=purchaseGeneration,item=purchaseItem,desired=!purchased;purchasePending=true;purchaseButton.disabled=true;purchaseStatus.textContent=t('Saving…');
    try{const response=await fetch('/api/purchased',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({product:item.id,purchased:desired})});if(!response.ok)throw new Error('Unavailable');const data=purchaseData(await response.json());if(generation===purchaseGeneration)paintPurchase(data);}
    catch{if(generation===purchaseGeneration){purchaseStatus.textContent=t('Could not confirm the change.');}}
    finally{if(generation===purchaseGeneration)purchasePending=false;}
  });
  let detailItem=null, detailTransition=0, detailBusy=false, detailGhost=null, detailAnimations=[];
  const detailSheet=dialog.querySelector('.objects-dialog-scroll');
  const detailPhotos=dialog.querySelector('.objects-dialog-photo');
  const detailPhotoCount=dialog.querySelector('.objects-photo-count');
  const detailPhotoStatus=dialog.querySelector('.objects-photo-status');
  const detailMobile=matchMedia('(max-width:767px), (max-width:1023px) and (max-height:500px) and (pointer:coarse)');
  const detailFooter=dialog.querySelector('.objects-dialog-footer');
  const detailFooterAction=dialog.querySelector('.objects-dialog-footer-action');
  const detailProductArrows=dialog.querySelector('.objects-product-arrows');
  const detailAction=dialog.querySelector('.objects-dialog-action');
  const detailCredit=dialog.querySelector('.objects-dialog-credit');
  const detailProductButtons=[...dialog.querySelectorAll('[data-product-step]')];
  let detailPhotoImages=[],detailPhotoIndex=0,detailPhotoWidth=0,detailPhotoLoop=false;
  let detailPhotoTarget=null,detailPhotoTimer=0,detailPhotoGeneration=0;
  let detailPhotoTap=null;
  const detailPhotoPointers=new Set(),detailPhotoTouches=new Set();
  const detailPhotoHeld=()=>detailPhotoPointers.size||detailPhotoTouches.size;
  const photoLabel=(text,index)=>t(text).replace('{number}',String(index+1)).replace('{count}',String(detailPhotoImages.length));
  detailSheet.addEventListener('scroll',()=>{
    if(detailMobile.matches||!detailPhotoImages.length)return;
    const viewport=detailSheet.getBoundingClientRect(),center=viewport.top+viewport.height/2;
    let nearestIndex=0,distance=Infinity;
    detailPhotoImages.forEach((image,index)=>{const rect=image.getBoundingClientRect(),delta=Math.abs(rect.top+rect.height/2-center);if(delta<distance){distance=delta;nearestIndex=index;}});
    detailPhotoIndex=nearestIndex;paintDetailPhoto();
  },{passive:true});
  function paintDetailPhoto(announce=false){
    detailPhotoCount.textContent=`${detailPhotoIndex+1}/${detailPhotoImages.length}`;
    if(announce&&detailPhotoLoop){
      const label=photoLabel('Photo {number} of {count}',detailPhotoIndex);
      // Rebasing loop copies can fire another scrollend; announce only a change.
      if(detailPhotoStatus.textContent!==label)detailPhotoStatus.textContent=label;
    }
  }
  function cancelDetailPhotos(){
    detailPhotoGeneration++;clearTimeout(detailPhotoTimer);detailPhotoTimer=0;
    detailPhotoTarget=null;detailPhotoTap=null;detailPhotoPointers.clear();detailPhotoTouches.clear();
    // Cancel an in-flight native smooth scroll before closing/replacing the sheet.
    detailPhotos.scrollTo({left:detailPhotos.scrollLeft,behavior:'instant'});
  }
  function jumpDetailPhoto(left){
    // Rebase to identical pixels, never animate backward through the whole gallery.
    // Disable snapping for the synchronous move (also safe during interrupted motion).
    detailPhotos.style.scrollSnapType='none';
    detailPhotos.scrollTo({left,behavior:'instant'});
    detailPhotos.getBoundingClientRect();
    detailPhotos.style.scrollSnapType='';
  }
  function settleDetailPhoto(){
    if(!dialog.open||!detailPhotoLoop||!detailPhotoWidth||detailPhotoHeld())return;
    clearTimeout(detailPhotoTimer);detailPhotoTimer=0;detailPhotoTarget=null;
    detailPhotoIndex=mod(Math.round(detailPhotos.scrollLeft/detailPhotoWidth),detailPhotoImages.length);
    const left=(detailPhotoImages.length+detailPhotoIndex)*detailPhotoWidth;
    if(Math.abs(detailPhotos.scrollLeft-left)>.5)jumpDetailPhoto(left);
    paintDetailPhoto(true);
  }
  function queueDetailPhotoSettle(){
    clearTimeout(detailPhotoTimer);
    if(!dialog.open||!detailPhotoLoop||detailPhotoHeld())return;
    const generation=detailPhotoGeneration,left=detailPhotos.scrollLeft;
    // Safari versions without scrollend still settle, but never interrupt a held
    // touch or moving momentum. A new product/close invalidates every callback.
    detailPhotoTimer=setTimeout(()=>{
      if(generation!==detailPhotoGeneration)return;
      detailPhotoTimer=0;
      if(Math.abs(detailPhotos.scrollLeft-left)>.5){queueDetailPhotoSettle();return;}
      settleDetailPhoto();
    },160);
  }
  function positionDetailPhotos(){
    detailPhotoWidth=detailPhotos.clientWidth;
    if(!dialog.open||!detailPhotoWidth)return;
    jumpDetailPhoto(detailPhotoLoop?(detailPhotoImages.length+detailPhotoIndex)*detailPhotoWidth:0);
  }
  function updateDetailPhotos(){
    const loop=detailMobile.matches&&detailPhotoImages.length>1;
    // A breakpoint change can precede ResizeObserver during native smoothing.
    // Keep its intended real photo before canceling the old-width command.
    if(detailPhotoTarget!==null&&detailPhotoImages.length)detailPhotoIndex=mod(detailPhotoTarget,detailPhotoImages.length);
    if(!loop&&detailPhotoLoop&&document.activeElement===detailPhotos){
      const title=dialog.querySelector('.objects-dialog-title');title.tabIndex=-1;title.focus({preventScroll:true});
    }
    cancelDetailPhotos();
    if(loop!==detailPhotoLoop||!detailPhotos.children.length){
      detailPhotoLoop=loop;
      const duplicates=()=>detailPhotoImages.map(photo=>{
        const image=photo.cloneNode(true);
        image.classList.add('objects-photo-clone');image.setAttribute('aria-hidden','true');
        image.removeAttribute('id');image.alt='';image.inert=true;image.tabIndex=-1;image.loading='lazy';
        return image;
      });
      // All copies retain the exact same source URLs and lazy loading. They add
      // no new assets or network endpoints; only the middle set is accessible.
      detailPhotos.replaceChildren(...(loop?[...duplicates(),...detailPhotoImages,...duplicates()]:detailPhotoImages));
    }
    detailPhotos.tabIndex=detailPhotoImages.length>1?0:-1;detailPhotoCount.hidden=detailPhotoImages.length===0;
    detailPhotos.classList.toggle('is-interactive',loop);
    if(loop){
      detailPhotos.setAttribute('aria-description',t('Swipe, tap the photo to advance, or use Left and Right arrow keys to browse photos. Home and End select the first and last photo.'));
      detailPhotos.setAttribute('aria-keyshortcuts','ArrowLeft ArrowRight Home End');
    }else{
      detailPhotos.removeAttribute('aria-description');detailPhotos.removeAttribute('aria-keyshortcuts');detailPhotoStatus.textContent='';
    }
    positionDetailPhotos();paintDetailPhoto();
  }
  function renderDetailPhotos(photos){
    cancelDetailPhotos();detailPhotoImages=photos;detailPhotoIndex=0;detailPhotoLoop=false;
    detailPhotos.replaceChildren();detailPhotoStatus.textContent='';
    updateDetailPhotos();
  }
  function moveDetailPhoto(step,index){
    if(!dialog.open||!detailPhotoLoop||!detailPhotoWidth||detailPhotoHeld())return;
    clearTimeout(detailPhotoTimer);detailPhotoGeneration++;
    const count=detailPhotoImages.length;
    let position=detailPhotos.scrollLeft/detailPhotoWidth;
    const previous=detailPhotoTarget??Math.round(position);
    const next=step?mod(previous+step,count):index;
    // Consecutive taps count from their intended destination even mid-animation.
    // Recenter the current equivalent copy only when outside the middle set.
    const cycles=Math.floor(position/count)-1;
    if(cycles){position-=cycles*count;jumpDetailPhoto(position*detailPhotoWidth);}
    let target=count+next;
    if(step>0&&target<=position+.001)target+=count;
    else if(step<0&&target>=position-.001)target-=count;
    else if(!step){
      if(target-position>count/2)target-=count;
      else if(position-target>count/2)target+=count;
    }
    detailPhotoTarget=target;
    detailPhotos.scrollTo({left:target*detailPhotoWidth,behavior:reduced.matches?'instant':'smooth'});
    if(reduced.matches)settleDetailPhoto();else queueDetailPhotoSettle();
  }
  detailMobile.addEventListener('change',()=>{updateDetailLayout();updateDetailPhotos();});
  new ResizeObserver(()=>{
    if(!dialog.open||detailPhotos.clientWidth===detailPhotoWidth)return;
    // Keep the selected (or commanded) real photo across rotation/reflow.
    if(detailPhotoTarget!==null)detailPhotoIndex=mod(detailPhotoTarget,detailPhotoImages.length);
    cancelDetailPhotos();positionDetailPhotos();paintDetailPhoto(true);
  }).observe(detailPhotos);
  detailPhotos.addEventListener('scroll',()=>{
    if(!dialog.open||!detailPhotoLoop||!detailPhotoWidth||detailPhotos.clientWidth!==detailPhotoWidth)return;
    if(detailPhotoTap&&Math.abs(detailPhotos.scrollLeft-detailPhotoTap.left)>2)detailPhotoTap.valid=false;
    detailPhotoIndex=mod(Math.round(detailPhotos.scrollLeft/detailPhotoWidth),detailPhotoImages.length);
    paintDetailPhoto();queueDetailPhotoSettle();
  },{passive:true});
  detailPhotos.addEventListener('scrollend',()=>{
    if(detailPhotoTarget!==null&&Math.abs(detailPhotos.scrollLeft-detailPhotoTarget*detailPhotoWidth)>1){queueDetailPhotoSettle();return;}
    settleDetailPhoto();
  });
  function beginDetailPhotoGesture(){
    if(!detailPhotoLoop)return;
    clearTimeout(detailPhotoTimer);detailPhotoGeneration++;
    // Stop an interrupted smooth command at its current pixels. A clean tap
    // remembers that command, while a swipe takes over from this exact position.
    if(!detailPhotoHeld()&&detailPhotoTarget!==null)jumpDetailPhoto(detailPhotos.scrollLeft);
    detailPhotoTarget=null;
    // Rapid successive swipes may start before scrollend/debounce runs. Restore
    // runway at touch-down, keeping the exact fractional view and both directions.
    if(!detailPhotoHeld()&&detailPhotoLoop&&detailPhotoWidth){
      const position=detailPhotos.scrollLeft/detailPhotoWidth,count=detailPhotoImages.length;
      const cycles=Math.floor(position/count)-1;
      if(cycles)jumpDetailPhoto((position-cycles*count)*detailPhotoWidth);
    }
  }
  function startDetailPhotoTap(point,command,pointerId=null,touchId=null){
    detailPhotoTap={x:point.clientX,y:point.clientY,left:detailPhotos.scrollLeft,top:detailPhotos.getBoundingClientRect().top,command,pointerId,touchId,pointerType:point.pointerType||'touch',valid:Number.isFinite(point.clientX)&&Number.isFinite(point.clientY)};
  }
  function checkDetailPhotoTap(point){
    if(detailPhotoTap&&Math.hypot(point.clientX-detailPhotoTap.x,point.clientY-detailPhotoTap.y)>8)detailPhotoTap.valid=false;
  }
  detailPhotos.addEventListener('pointerdown',event=>{
    if(!detailPhotoLoop)return;
    const held=detailPhotoHeld(),command=detailPhotoTarget;
    const continuesTouch=detailPhotoTap&&detailPhotoTap.pointerId===null&&detailPhotoTap.touchId!==null&&detailPhotoTouches.size===1&&!detailPhotoPointers.size&&event.pointerType==='touch'&&event.isPrimary&&event.button===0;
    beginDetailPhotoGesture();detailPhotoPointers.add(event.pointerId);
    if(continuesTouch){detailPhotoTap.pointerId=event.pointerId;checkDetailPhotoTap(event);return;}
    if(held||!event.isPrimary||event.button!==0){if(detailPhotoTap)detailPhotoTap.valid=false;return;}
    startDetailPhotoTap(event,command,event.pointerId);
  },{passive:true});
  // Browsers cancel Pointer Events when native scrolling takes over, even
  // while the finger is still down. Touch IDs keep loop rebasing suspended
  // through that handoff and through multi-touch/pinch gestures.
  detailPhotos.addEventListener('touchstart',event=>{
    if(!detailPhotoLoop)return;
    const held=detailPhotoHeld(),command=detailPhotoTarget;
    const continuesPointer=detailPhotoTap&&detailPhotoTap.pointerType==='touch'&&detailPhotoTap.pointerId!==null&&detailPhotoTap.touchId===null&&detailPhotoPointers.size===1&&!detailPhotoTouches.size&&event.changedTouches.length===1;
    beginDetailPhotoGesture();
    for(const touch of event.changedTouches)detailPhotoTouches.add(touch.identifier);
    const touch=event.changedTouches[0];
    if(continuesPointer){detailPhotoTap.touchId=touch.identifier;checkDetailPhotoTap(touch);}
    else if(!held&&event.changedTouches.length===1)startDetailPhotoTap(touch,command,null,touch.identifier);
    else if(detailPhotoTap)detailPhotoTap.valid=false;
    if(event.touches?.length>1&&detailPhotoTap)detailPhotoTap.valid=false;
  },{passive:true});
  window.addEventListener('pointermove',event=>{
    if(detailPhotoTap?.pointerId===event.pointerId)checkDetailPhotoTap(event);
  },{passive:true});
  window.addEventListener('touchmove',event=>{
    if(event.touches?.length>1&&detailPhotoTap)detailPhotoTap.valid=false;
    for(const touch of event.changedTouches)if(detailPhotoTap?.touchId===touch.identifier)checkDetailPhotoTap(touch);
  },{passive:true});
  window.addEventListener('touchstart',event=>{
    // A second finger can land outside the photo while beginning a pinch.
    if(!detailPhotoHeld()||!event.touches||event.touches.length<2)return;
    for(const touch of event.touches)detailPhotoTouches.add(touch.identifier);
    if(detailPhotoTap)detailPhotoTap.valid=false;
  },{passive:true});
  const releaseDetailPhotoTouch=event=>{
    for(const touch of event.changedTouches){
      if(detailPhotoTap?.touchId===touch.identifier){checkDetailPhotoTap(touch);if(event.type==='touchcancel')detailPhotoTap.valid=false;}
      detailPhotoTouches.delete(touch.identifier);
    }
    queueDetailPhotoSettle();
  };
  window.addEventListener('touchend',releaseDetailPhotoTouch,{passive:true});
  window.addEventListener('touchcancel',releaseDetailPhotoTouch,{passive:true});
  const releaseDetailPhoto=event=>{
    if(!detailPhotoPointers.delete(event.pointerId))return;
    if(detailPhotoTap?.pointerId===event.pointerId){checkDetailPhotoTap(event);if(event.type==='pointercancel')detailPhotoTap.valid=false;}
    queueDetailPhotoSettle();
  };
  window.addEventListener('pointerup',releaseDetailPhoto,{passive:true});
  window.addEventListener('pointercancel',releaseDetailPhoto,{passive:true});
  detailPhotos.addEventListener('wheel',()=>{detailPhotoTap=null;detailPhotoTarget=null;queueDetailPhotoSettle();},{passive:true});
  window.addEventListener('blur',()=>{detailPhotoTap=null;detailPhotoPointers.clear();detailPhotoTouches.clear();settleDetailPhoto();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){detailPhotoTap=null;detailPhotoPointers.clear();detailPhotoTouches.clear();settleDetailPhoto();}});
  reduced.addEventListener('change',()=>{
    if(!reduced.matches||!detailPhotoLoop)return;
    if(detailPhotoTarget!==null)jumpDetailPhoto(detailPhotoTarget*detailPhotoWidth);
    settleDetailPhoto();
  });
  function advanceVerticalPhoto(){
    if(detailPhotoImages.length<2)return;
    detailPhotoIndex=mod(detailPhotoIndex+1,detailPhotoImages.length);
    const sheet=detailSheet.getBoundingClientRect(),photo=detailPhotoImages[detailPhotoIndex].getBoundingClientRect();
    detailSheet.scrollTo({top:detailSheet.scrollTop+photo.top-sheet.top,behavior:reduced.matches?'instant':'smooth'});
    paintDetailPhoto(true);
  }
  detailPhotos.addEventListener('click',event=>{
    if(!detailMobile.matches){
      if(event.button!==0||event.defaultPrevented)return;
      const index=detailPhotoImages.indexOf(event.target);if(index<0)return;
      event.stopPropagation();detailPhotoIndex=index;advanceVerticalPhoto();return;
    }
    if(!detailPhotoLoop)return;
    event.stopPropagation();
    const tap=detailPhotoTap;detailPhotoTap=null;
    if(!tap?.valid||detailPhotoHeld()||event.button!==0||event.defaultPrevented)return;
    const bounds=detailPhotos.getBoundingClientRect();
    if(Math.hypot(event.clientX-tap.x,event.clientY-tap.y)>8||Math.abs(bounds.top-tap.top)>2||Math.abs(detailPhotos.scrollLeft-tap.left)>2)return;
    // Only a clean click activates the halves. Native swipe, vertical scrolling,
    // pinch, pointer cancellation and their compatibility clicks never page again.
    detailPhotoTarget=tap.command;
    moveDetailPhoto(1);
  });
  detailPhotos.addEventListener('keydown',event=>{
    if(!detailMobile.matches&&event.target===detailPhotos&&['Enter',' '].includes(event.key)){event.preventDefault();advanceVerticalPhoto();return;}
    if(event.target!==detailPhotos||!detailPhotoLoop||event.altKey||event.ctrlKey||event.metaKey)return;
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();event.stopPropagation();
    if(event.key==='Home'||event.key==='End')moveDetailPhoto(0,event.key==='Home'?0:detailPhotoImages.length-1);
    else moveDetailPhoto(event.key==='ArrowRight'?1:-1);
  });
  updateDetailPhotos();
  function updateDetailLayout(){
    // Reflow can happen during a slide. Keep the current product, remove obsolete
    // geometry, and move the single live action without duplicating its state.
    cancelDetailTransition();
    const focused=document.activeElement,mobile=detailMobile.matches;
    const focusedStep=focused?.dataset?.productStep;
    const focusedAction=detailAction.contains(focused);
    if(mobile)detailFooterAction.append(detailAction);else detailCredit.before(detailAction);
    detailFooter.hidden=!mobile;detailFooter.inert=!mobile;
    detailProductArrows.hidden=active.length<2;
    detailProductButtons.forEach(button=>{
      const footerButton=button.hasAttribute('data-product-arrow');
      button.hidden=active.length<2||(footerButton?!mobile:mobile);
    });
    if(!dialog.open)return;
    if(focusedAction)focused.focus({preventScroll:true});
    else if(focusedStep){
      const replacement=detailProductButtons.find(button=>button.dataset.productStep===focusedStep&&!button.hidden);
      if(replacement)replacement.focus({preventScroll:true});else close.focus({preventScroll:true});
    }
  }
  updateDetailLayout();
  // Rotation can stay inside the phone media query. A resized sheet must not
  // keep sliding with the old viewport's dimensions or its outgoing clone.
  new ResizeObserver(()=>{if(dialog.open&&detailBusy)cancelDetailTransition();}).observe(detailSheet);
  function paintDetailNavigation(item) {
    detailItem=item;
    detailProductArrows.hidden=active.length<2;
    const index=active.indexOf(item);
    detailProductButtons.forEach(button=>{
      const step=Number(button.dataset.productStep),neighbor=active[mod(index+step,active.length)];
      const footerButton=button.hasAttribute('data-product-arrow');
      button.hidden=active.length<2||(footerButton?!detailMobile.matches:detailMobile.matches);
      if(!neighbor)return;
      button.setAttribute('aria-label',t(step<0?'Previous product':'Next product')+': '+neighbor.name);
      if(footerButton)return;
      const image=document.createElement('img');image.src=neighbor.image;image.alt='';
      const label=document.createElement('span');label.textContent=neighbor.brand+' — '+neighbor.name;
      button.replaceChildren(image,label);
    });
  }
  function cancelDetailTransition(){
    detailTransition++;detailBusy=false;
    detailAnimations.forEach(animation=>animation.cancel());detailAnimations=[];
    detailGhost?.remove();detailGhost=null;detailSheet.inert=false;
    dialog.classList.remove('is-sliding');
    detailProductButtons.forEach(button=>button.disabled=false);
  }
  detailProductButtons.forEach(button=>button.addEventListener('click',async()=>{
    if(!dialog.open||!detailItem||active.length<2||button.hidden)return;
    // Product controls remain usable during a slide. A new tap
    // commits from the current product and cancels the obsolete visual motion.
    if(detailBusy)cancelDetailTransition();
    detailBusy=true;
    const token=++detailTransition,step=Number(button.dataset.productStep);
    const item=active[mod(active.indexOf(detailItem)+step,active.length)];
    const target=detailSheet.getBoundingClientRect();
    if(!reduced.matches){
      // The outgoing sheet is visual only: no duplicate IDs, controls or live regions.
      detailGhost=detailSheet.cloneNode(true);
      detailGhost.removeAttribute('id');detailGhost.setAttribute('aria-hidden','true');detailGhost.inert=true;
      detailGhost.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
      detailGhost.querySelectorAll('[role="status"],[aria-live]').forEach(node=>{node.removeAttribute('role');node.removeAttribute('aria-live');});
      detailGhost.classList.add('objects-detail-ghost');
      const bounds=dialog.getBoundingClientRect();
      Object.assign(detailGhost.style,{left:`${target.left-bounds.left}px`,top:`${target.top-bounds.top}px`,width:`${target.width}px`,height:`${target.height}px`});
      dialog.append(detailGhost);
      detailGhost.scrollTop=detailSheet.scrollTop;
      detailGhost.querySelector('.objects-dialog-copy').scrollTop=dialog.querySelector('.objects-dialog-copy').scrollTop;
      detailGhost.querySelector('.objects-dialog-photo').scrollLeft=detailPhotos.scrollLeft;
    }
    // Switch ownership generation immediately so an older response cannot repaint the new card.
    show(item,returnFocus,false);
    const title=dialog.querySelector('.objects-dialog-title');title.tabIndex=-1;
    const focusAfter=()=>{
      if(document.activeElement!==button&&!detailSheet.contains(document.activeElement))return;
      (detailMobile.matches?button:title).focus({preventScroll:true});
    };
    if(reduced.matches){detailBusy=false;focusAfter();return;}
    dialog.classList.add('is-sliding');detailSheet.inert=true;
    // Both full-size cards move by one sheet width on the same timeline. Their
    // touching edges stay together; the dialog clips them and its footer stays put.
    const distance=step*target.width;
    const options={duration:640,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'};
    detailAnimations=[
      detailGhost.animate([
        {transform:'translateX(0px)'},
        {transform:`translateX(${-distance}px)`}
      ],options),
      detailSheet.animate([
        {transform:`translateX(${distance}px)`},
        {transform:'translateX(0px)'}
      ],options)
    ];
    await Promise.all(detailAnimations.map(animation=>animation.finished.catch(()=>{})));
    if(token!==detailTransition||!dialog.open)return;
    detailAnimations.forEach(animation=>animation.cancel());detailAnimations=[];
    detailGhost?.remove();detailGhost=null;detailSheet.inert=false;
    dialog.classList.remove('is-sliding');detailBusy=false;
    detailProductButtons.forEach(button=>button.disabled=false);
    focusAfter();
  }));
  function show(item, trigger,focusClose=true){
    if(!item)return;
    // close is queued by the browser: discard the old slide before a fast reopen.
    if(!dialog.open)cancelDetailTransition();
    cancelGesture();stopMotion();if(focusMode)focusAt(focusColumn,focusRow,false);else settleGeometry();
    returnFocus=trigger;
    const photos=item.gallery.map((photo,index)=>{
      const image=photo.cloneNode(true);
      image.className='objects-dialog-image';
      image.loading=index===0?'eager':'lazy';
      return image;
    });
    renderDetailPhotos(photos);
    detailPhotos.setAttribute('aria-label',t('Product photographs')+': '+item.name);
    dialog.querySelector('.objects-dialog-title').textContent=item.name;
    dialog.querySelector('.objects-dialog-brand').textContent=item.brand;
    dialog.querySelector('.objects-dialog-description').textContent=item.description;
    const badges=dialog.querySelector('.objects-dialog-tags');badges.replaceChildren();
    for(const name of item.tags){const badge=document.createElement('button');badge.type='button';badge.textContent=t(name);badge.addEventListener('click',()=>{dialog.close();category='all';selectedTag=name;searchQuery='';if(searchInput)searchInput.value=t(name);filter();searchInput?.focus({preventScroll:true});});badges.append(badge);}
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
    positionDetailPhotos();
    if(focusClose)close.focus({preventScroll:true});
  }
  const canvasPointers=new Map();
  let canvasPinch=null,canvasGestureCancelled=false;
  function releaseCanvasPointer(id){try{if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);}catch{}}
  function cancelGesture(event){
    if(event?.pointerId!=null&&!canvasPointers.has(event.pointerId))return;
    if(canvasPointers.size)suppressClick=true;
    gesture=null;canvasPinch=null;canvasGestureCancelled=canvasPointers.size>0;
    // Retain the remaining IDs until release, so an interrupted two-finger
    // gesture cannot turn into a new tap before both fingers have lifted.
    if(event?.pointerId!=null)canvasPointers.delete(event.pointerId);
    for(const id of canvasPointers.keys())releaseCanvasPointer(id);
    if(event?.pointerId!=null)releaseCanvasPointer(event.pointerId);
    page.classList.remove('objects-dragging');canvas.classList.remove('is-dragging');schedule();
  }
  function interruptCanvasGesture(event){
    if(event?.pointerId!=null&&!canvasPointers.has(event.pointerId))return;
    cancelGesture(event);stopMotion();
    if(focusMode){const center=nearest();focusAt(center.column,center.line,false);}else settleGeometry();
  }
  function captureCanvasPointer(id){
    try{canvas.setPointerCapture(id);return true;}catch{interruptCanvasGesture();return false;}
  }
  function canvasPinchPoints(){
    const [a,b]=canvasPointers.values(),bounds=canvas.getBoundingClientRect();
    return {x:(a.clientX+b.clientX)/2-bounds.left,y:(a.clientY+b.clientY)/2-bounds.top,distance:Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY)};
  }
  function rebaseCanvasGesture(){
    gesture=null;canvasPinch=null;
    if(canvasPointers.size===2){const point=canvasPinchPoints();canvasPinch={...point,cell,worldX:(point.x-x)/cell,worldY:(point.y-y-cell/2)/row};}
    else if(canvasPointers.size===1){const [id,point]=canvasPointers.entries().next().value;gesture={id,x:point.clientX,y:point.clientY,startX:x,startY:y,moved:suppressClick};}
  }
  function moveCanvasPointer(event){
    if(!canvasPointers.has(event.pointerId)||!Number.isFinite(event.clientX)||!Number.isFinite(event.clientY))return;
    canvasPointers.set(event.pointerId,{...canvasPointers.get(event.pointerId),clientX:event.clientX,clientY:event.clientY});
    if(canvasGestureCancelled)return;
    if(document.querySelector('dialog[open]')){interruptCanvasGesture();return;}
    if(canvasPointers.size===2&&canvasPinch){
      const next=canvasPinchPoints(),previous=canvasPinch;
      // A fixed scale/anchor baseline avoids drift when each finger's move
      // arrives separately, especially while a two-finger pan hits a limit.
      if(previous.distance<2||next.distance<2){rebaseCanvasGesture();return;}
      const min=geometry(canvas.clientWidth,0).cell,max=geometry(canvas.clientWidth,100).cell;
      const size=Math.max(min,Math.min(max,previous.cell*next.distance/previous.distance));
      updateCanvasZoom(max>min?(size-min)/(max-min)*100:zoom);
      const target=geometry(canvas.clientWidth,zoom);
      pose({x:next.x-previous.worldX*target.cell,y:next.y-target.cell/2-previous.worldY*target.row,...target},false);
      // Keep the fingers' anchor even at maximum; center the nearest object
      // only after the entire gesture finishes, not when either finger lifts.
      if(focusMode){const center=nearest();focusColumn=center.column;focusRow=center.line;}
      return;
    }
    if(!gesture||event.pointerId!==gesture.id)return;
    const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
    if(!gesture.moved&&Math.hypot(dx,dy)<6)return;
    if(!gesture.moved){gesture.moved=true;suppressClick=true;if(!captureCanvasPointer(event.pointerId))return;canvas.classList.add('is-dragging');}
    x=gesture.startX+dx;y=gesture.startY+dy;schedule();
  }
  canvas.addEventListener('pointerdown',event=>{
    if(event.button!==0||event.target.closest('button,a,input,select,textarea,[role="button"]')||document.querySelector('dialog[open]')||!Number.isFinite(event.clientX)||!Number.isFinite(event.clientY))return;
    // A new primary pointer also recovers from a blur/hidden-tab interruption
    // whose releases the browser did not deliver.
    if(event.isPrimary&&canvasGestureCancelled){canvasPointers.clear();canvasGestureCancelled=false;}
    if(canvasPointers.has(event.pointerId)||(!event.isPrimary&&!canvasPointers.size))return;
    if(canvasPointers.size&&(event.pointerType!=='touch'||[...canvasPointers.values()].some(point=>point.pointerType!=='touch')))return;
    if(!canvasPointers.size){stopMotion();suppressClick=false;canvasGestureCancelled=false;}
    canvasPointers.set(event.pointerId,{clientX:event.clientX,clientY:event.clientY,pointerType:event.pointerType});
    if(canvasGestureCancelled)return;
    if(canvasPointers.size>1){
      suppressClick=true;canvas.classList.add('is-dragging');
      for(const id of canvasPointers.keys())if(!captureCanvasPointer(id))return;
    }
    // Three or more fingers pause the gesture. Returning to two (or one)
    // starts from the current pose and positions, with no scale/pan jump.
    rebaseCanvasGesture();
  });
  canvas.addEventListener('pointermove',moveCanvasPointer,{passive:true});
  function endCanvasPointer(event){
    if(!canvasPointers.has(event.pointerId))return;
    moveCanvasPointer(event);canvasPointers.delete(event.pointerId);releaseCanvasPointer(event.pointerId);
    if(canvasGestureCancelled){if(!canvasPointers.size)canvasGestureCancelled=false;return;}
    if(canvasPointers.size){rebaseCanvasGesture();return;}
    gesture=null;canvasPinch=null;page.classList.remove('objects-dragging');canvas.classList.remove('is-dragging');
    if(focusMode&&suppressClick){const center=nearest();focusAt(center.column,center.line);}else settleGeometry(true);
  }
  canvas.addEventListener('pointerup',endCanvasPointer);
  canvas.addEventListener('pointercancel',interruptCanvasGesture);
  canvas.addEventListener('lostpointercapture',event=>{if(event.target===canvas&&!canvasGestureCancelled)interruptCanvasGesture(event);});
  window.addEventListener('pointerup',endCanvasPointer);
  window.addEventListener('pointercancel',interruptCanvasGesture);
  window.addEventListener('blur',()=>interruptCanvasGesture());
  window.addEventListener('orientationchange',()=>interruptCanvasGesture());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)interruptCanvasGesture();});
  document.addEventListener('focusin',()=>{if(canvasPointers.size&&document.querySelector('dialog[open]'))interruptCanvasGesture();});
  canvas.addEventListener('click',event=>{
    if(suppressClick||canvasPointers.size>1)return;
    const tile=event.target.closest('[data-object]');if(!tile)return;
    if(focusMode){const column=Number(tile.dataset.column),line=Number(tile.dataset.line);const target=geometry(canvas.clientWidth,zoom),centered=Math.abs(x+column*cell+cell/2-canvas.clientWidth/2)<1&&Math.abs(y+line*row+cell/2-canvas.clientHeight/2)<1&&Math.abs(cell-target.cell)<1;if(column!==focusColumn||line!==focusRow||motion||!centered){focusAt(column,line);return;}}
    show(catalog.find(item=>item.id===tile.dataset.object),canvas);
  });
  function pinchCanvas(value,clientX,clientY){
    if(!Number.isFinite(value)||!active.length)return;
    cancelGesture();stopMotion();
    const bounds=canvas.getBoundingClientRect(),cx=clientX-bounds.left,cy=clientY-bounds.top;
    const worldX=(cx-x)/cell,worldY=(cy-y-cell/2)/row;
    updateCanvasZoom(value);
    const size=geometry(canvas.clientWidth,zoom);
    pose({x:cx-worldX*size.cell,y:cy-size.cell/2-worldY*size.row,...size},false);
    if(focusMode){const center=nearest();focusColumn=center.column;focusRow=center.line;}
  }
  let trackpadGesture=null;
  canvas.addEventListener('gesturestart',event=>{event.preventDefault();trackpadGesture={zoom,scale:event.scale||1};},{passive:false});
  canvas.addEventListener('gesturechange',event=>{if(!trackpadGesture)return;event.preventDefault();pinchCanvas(trackpadGesture.zoom+Math.log(event.scale/trackpadGesture.scale)*60,event.clientX,event.clientY);},{passive:false});
  canvas.addEventListener('gestureend',event=>{event.preventDefault();trackpadGesture=null;if(focusMode)settleGeometry(true);},{passive:false});
  canvas.addEventListener('wheel',event=>{
    if(event.ctrlKey){event.preventDefault();if(!trackpadGesture){const unit=event.deltaMode===1?16:event.deltaMode===2?canvas.clientHeight:1;pinchCanvas(zoom-event.deltaY*unit*.4,event.clientX,event.clientY);}return;}
    if(event.metaKey)return;
    if(canvasPointers.size)return;
    event.preventDefault();const unit=event.deltaMode===1?16:event.deltaMode===2?canvas.clientHeight:1;
    stopMotion();x-=event.deltaX*unit;y-=event.deltaY*unit;schedule();
    wheelTimer=setTimeout(()=>{if(focusMode){const center=nearest();focusAt(center.column,center.line);}else settleGeometry(true);},140);
  },{passive:false});
  canvas.addEventListener('focus',announceCenter);
  canvas.addEventListener('keydown',event=>{
    if(event.target!==canvas)return;
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','Enter',' '].includes(event.key))event.preventDefault();else return;
    cancelGesture();
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
  dialog.addEventListener('close',()=>{if(dialog.open)return;cancelDetailTransition();cancelDetailPhotos();purchaseGeneration++;returnFocus?.focus({preventScroll:true});returnFocus=null;});
  if(searchInput)searchInput.disabled=false;
  searchInput?.addEventListener('input',()=>{selectedTag='';searchQuery=searchInput.value.normalize('NFKC').trim().toLocaleLowerCase();filter();});
  categoryButtons.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.categoryFilter;filter();}));
  document.querySelectorAll('[data-reset-filters]').forEach(button=>button.addEventListener('click',()=>{category='all';selectedTag='';searchQuery='';if(searchInput)searchInput.value='';filter();}));
  document.querySelector('[data-reset-view]').addEventListener('click',reset);
  zoomInput.addEventListener('input',()=>setZoom(Number(zoomInput.value)));
  zoomButtons.forEach(button=>button.addEventListener('click',()=>{
    const direction=Number(button.dataset.zoomStep);
    if((direction<0&&zoom===0)||(direction>0&&zoom===100))return;
    setZoom(zoom+(mobileZoom.matches?Math.sign(direction)*25:direction));
  }));
  mobileZoom.addEventListener('change',updateZoomLayout);updateZoomLayout();
  const infoButton=document.querySelector('.objects-info'),infoDialog=document.getElementById('objects-info-dialog');
  const infoSeenKey='2d1-finds-info-dismissed-v1';
  const syncInfo=()=>{infoButton.lastElementChild.textContent=infoDialog.open?'−':'+';infoButton.setAttribute('aria-expanded',String(infoDialog.open));};
  const positionInfo=()=>{const rect=infoButton.getBoundingClientRect();infoDialog.style.setProperty('--info-top',`${rect.bottom+8}px`);};
  const openInfo=()=>{if(dialog.open||infoDialog.open)return;cancelGesture();stopMotion();settleGeometry();positionInfo();infoDialog.show();syncInfo();infoDialog.scrollTop=0;};
  infoButton.addEventListener('click',()=>{if(infoDialog.open)infoDialog.close();else openInfo();});
  document.addEventListener('pointerdown',event=>{if(infoDialog.open&&!infoDialog.contains(event.target)&&!infoButton.contains(event.target))infoDialog.close();});
  infoDialog.addEventListener('keydown',event=>{if(event.key==='Escape')infoDialog.close();});
  infoButton.addEventListener('keydown',event=>{if(event.key==='Escape'&&infoDialog.open)infoDialog.close();});
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{if(infoDialog.open)positionInfo();}).observe(infoButton);
  infoDialog.addEventListener('close',()=>{if(infoDialog.open)return;syncInfo();try{localStorage.setItem(infoSeenKey,'1');}catch{}infoButton.focus({preventScroll:true});});
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
  reduced.addEventListener('change',()=>{if(reduced.matches){if(motion)pose(motion.target,false);detailAnimations.forEach(animation=>animation.finish());}});
  document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();canvas.focus();});
  page.classList.add('objects-ready','objects-min-zoom');filter();
  let infoSeen=false;try{infoSeen=localStorage.getItem(infoSeenKey)==='1';}catch{}
  if(reduced.matches){if(!infoSeen)openInfo();}
  else{
    page.classList.add('finds-entering');
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const images=[...layer.querySelectorAll('.objects-tile img')].filter(image=>{const r=image.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;});
      const duration=760;
      // A ripple from the center: each object hops into place with a little tilt.
      const ranked=images.map(image=>{const r=image.getBoundingClientRect();return {image,distance:Math.hypot((r.left+r.width/2-innerWidth/2)/cell,(r.top+r.height/2-innerHeight/2)/row)};}).sort((a,b)=>a.distance-b.distance);
      ranked.forEach(({image},index)=>{
        const tilt=index%2?6:-6;
        image.animate([
          {opacity:0,transform:`translateY(32px) rotate(${tilt}deg) scale(.72)`,offset:0},
          {opacity:1,transform:`translateY(-8px) rotate(${-tilt*.3}deg) scale(1.04)`,offset:.6},
          {opacity:1,transform:'translateY(3px) rotate(0deg) scale(.99)',offset:.82},
          {opacity:1,transform:'translateY(0) rotate(0deg) scale(1)',offset:1}
        ],{duration,delay:Math.min(index*32,640),easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'});
      });
      setTimeout(()=>{page.classList.remove('finds-entering');page.classList.add('finds-controls-enter');setTimeout(()=>{page.classList.remove('finds-controls-enter');if(!infoSeen)openInfo();},480);},duration+Math.min(Math.max(0,images.length-1)*32,640));
    }));
  }
})();
