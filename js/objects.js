/* Infinite, virtualized shelf. A finite collection repeats in every direction. */
(() => {
  const page = document.querySelector('.objects-page');
  const canvas = document.getElementById('objects-canvas');
  const collection = document.getElementById('objects-collection');
  if (!page || !canvas || !collection) return;
  const reportPerformance=new URLSearchParams(location.search).has('finds-perf');
  const startedAt=performance.now();
  let firstPhotoAt=null;
  const t = window.SiteLanguage?.t || (text => text);
  // Generated from data/object-families.json; edit the assignments there.
  const objectFamilies = {"hay-miz-dark-green":"Rituals","stokke-tripp-trapp-warm-red":"Classics","alessi-anna-g-black":"Characters","alessi-ossidiana-black":"Rituals","dusen-everybody-wall-clock":"Companions","bruna-bonbon-mini-orange":"Characters","playforever-viglietta-jasper":"Oddities","brutto-sally-pepe":"Rituals","nintendo-pikmin-vases":"Characters","arms-flying-robi-persi":"Oddities","alessi-9090":"Classics","arwenn-cloud-clock":"Oddities","craighill-chroma-scissors-primary":"Companions","craighill-swingtop-lighter":"Rituals","alessi-twergi-es19-yellow":"Rituals","block-design-play-tin":"Oddities","herman-miller-girard-throw":"Companions","hay-regn-umbrella-gray-blue":"Classics","moodulo-pop-culture-act-ii":"Oddities","homeinfun-storage-stool":"Oddities","odd-universe-peepers":"Characters","atonemo-nts-radio-player":"Companions","not-boring-camera-app":"Companions","not-boring-weather-app":"Companions","not-boring-camera-art-model":"Oddities","mkbhd-color-picker-stickers":"Companions","mkbhd-overlay-deskpad":"Companions","bobo-choses-bolder-belt-pouch":"Companions","hungry-market-initial-c-cap":"Companions","daypa-kun-backpack-blue":"Characters","lego-piranha-plant-71426":"Characters","iwate-canning-gift-stock":"Rituals","mint-hug-shakers":"Characters","subu-originals-f-line-black":"Classics","sharge-discho":"Oddities","fairphone-gen-6-plus":"Companions","cwandt-high-speed-jump-rope":"Rituals","ikea-forlunda-red":"Companions","nendo-shoe-horn":"Rituals","mr-maria-first-light-snoopy":"Characters","flos-snoopy-black":"Companions","magis-spun":"Oddities","magis-air-chair-red":"Classics","hay-table-clock-black":"Classics","muji-wall-mounted-cd-player":"Classics","groove-x-lovot-3":"Characters","teenage-engineering-grip-car":"Oddities","cliik-press-glass-family-pack":"Classics","yoto-player-4":"Rituals","freckle-phone-orange":"Oddities","loop-cocoon-berry":"Companions","magis-linnut-sulo-s":"Characters","flowerpot-vp9-zesty-orange":"Companions","b-line-boby-34-paprika":"Classics","hey-bag-green-lines":"Companions","hey-classic-cap":"Classics","alessi-la-conica":"Classics","memphis-first":"Oddities","bosa-most-illustrious-achille":"Characters","pedrali-frida-752":"Classics","qeeboo-rabbit-chair-light-blue":"Characters","alessi-magic-bunny-black":"Characters","alessi-girotondo-round-tray":"Characters","baggu-standard-pop-pink-happy":"Characters","anya-hindmarch-eyes-tote":"Characters","heinz-tomato-ketchup":"Classics","panic-playdate":"Companions","kinto-water-bottle-300ml":"Classics","topologie-6mm-rope-strap":"Classics","yoki-pillar-blue":"Oddities","gispen-dombo-red":"Oddities","vitra-eames-elephant-orange":"Characters","detail-nasa-snow-globe":"Oddities","carpenter-hamburger-coaster":"Oddities","super7-beams-charlie-brown":"Characters","running-press-ufo-cow":"Characters","notabag-original-red":"Classics","cotopaxi-kapai-del-dia":"Companions","kay-bojesen-songbird-sunshine":"Characters","vitra-nelson-night-clock":"Companions","palaset-im-ok-fantti-elephant-bank":"Characters","ichendorf-desert-plants-cactus-amber":"Rituals","curaprox-cs-smart":"Classics","soholm-cafe-reversible-tote":"Classics","tecta-cat-black":"Characters","kikkerland-inkerie-jewelry-case":"Companions","muji-porcelain-toothbrush-stand":"Classics","best-years-knitted-triceratops":"Characters","kay-bojesen-monkey-mini-vintage-blue":"Characters","muji-smooth-gel-knock-pen":"Classics","actus-deco-dot-photo-frame":"Companions","actus-object-flower-vase":"Rituals","iwachu-cat-candle-stand":"Characters","aptone-mix-match":"Oddities","seiko-diver-alarm-clock":"Oddities","seiko-stadium-clock":"Oddities","nahe-packing-pouch":"Classics","heim-egg-spoon":"Rituals","maul-m8-calculator":"Classics","may-bookends":"Companions","alessi-dede":"Characters","andlight-slab-series":"Rituals","flos-mayday":"Classics","alessi-sleek":"Classics","samira-boon-furoshiki-card-case":"Companions","floyd-cabin-aluminum":"Companions","jellycat-amuseables-basketball":"Characters","tobeus-pick-up":"Oddities"};
  const cards = [...collection.querySelectorAll('[data-object]')];
  const catalog = cards.map(card => ({
    id:card.dataset.object, family:objectFamilies[card.dataset.object], category:card.dataset.category, tags:JSON.parse(card.dataset.tags), colors:JSON.parse(card.dataset.colors||'[]'),displayColors:JSON.parse(card.dataset.displayColors||'[]'),
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
  const selectedFamilies=new Set(),selectedCategories=new Set(),selectedColors=new Set();
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
  const shopPreview=new URLSearchParams(location.search).has('shop-preview');
  let previewSeed=21026;
  const previewRandom=()=>{previewSeed=(Math.imul(previewSeed,1664525)+1013904223)>>>0;return previewSeed/4294967296};
  const visitOrders=createVisitOrders(catalog,shopPreview?previewRandom:Math.random);
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
    // Request the final sharp source once during a zoom, rather than each
    // intermediate animation size. Never undersize the currently drawn square.
    const sourceCell=Math.max(cell,motion?.target.cell||cell);
    const imageSize=shopPreview?'320px':`${Math.ceil((sourceCell-(width<=600?32:48))/32)*32}px`;
    canvas.style.setProperty('--object-cell',`${cell}px`);
    const firstColumn=Math.floor(-x/cell)-1,firstRow=Math.floor(-y/row)-1,wanted=new Set();
    for(let line=firstRow;line<=firstRow+Math.ceil(height/row)+2;line++)for(let column=firstColumn;column<=firstColumn+Math.ceil(width/cell)+2;column++){
      const key=tileKey(column,line),item=active[indexAt(column,line,active.length)];wanted.add(key);
      let tile=tiles.get(key);if(!tile){tile=createTile(item);layer.append(tile);tiles.set(key,tile);}
      if(shopPreview)tile.style.removeProperty('display');
      tile.dataset.column=column;tile.dataset.line=line;
      // Select a sharp source for the rendered square as zoom changes.
      const image=tile.querySelector('img');
      // Keep virtual overscan tiles, but don't fetch photos outside the viewport.
      const left=column*cell+x,top=line*row+y;
      if(!image.getAttribute('src')&&left+cell>0&&left<width&&top+cell>0&&top<height){
        const source=tile._item;image.sizes=imageSize;
        if(source.imageSrcset)image.srcset=source.imageSrcset;
        image.src=source.image;
      }
      if(image.sizes!==imageSize)image.sizes=imageSize;
      tile.classList.toggle('is-focused',focusMode&&column===focusColumn&&line===focusRow);
      tile.classList.toggle('is-keyboard-target',column===(focusMode?focusColumn:center.column)&&line===(focusMode?focusRow:center.line));
      tile.style.transform=`translate(${column*cell+x}px,${line*row+y}px)`;
    }
    // The preview always retraces the same centered zoom. Retain its decoded
    // tiles instead of rebuilding them when the view widens again.
    for(const [key,tile] of tiles)if(!wanted.has(key)){
      if(shopPreview)tile.style.display='none';
      else{tile.remove();tiles.delete(key);}
    }
  }
  function createTile(item){
    const tile=document.createElement('figure');tile.className='objects-tile';tile.dataset.object=item.id;tile._item=item;
    const image=document.createElement('img');image.alt='';image.draggable=false;image.decoding='async';image.className=item.imageClass||'';
    const caption=document.createElement('figcaption'),brand=document.createElement('span');brand.textContent=item.brand;caption.append(document.createTextNode(item.name),brand);
    tile.append(image,caption);
    return tile;
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
    cancelGesture();stopMotion();active=(visitOrders.get(category)||[]).filter(item=>(!selectedFamilies.size||selectedFamilies.has(item.family))&&(!selectedTag||item.tags.includes(selectedTag))&&(!selectedCategories.size||item.tags.some(tag=>selectedCategories.has(tag)))&&(!selectedColors.size||item.colors.some(color=>selectedColors.has(color)))&&searchQuery.split(/\s+/).every(word=>[item.name,item.brand,item.description,item.category,item.family,t(item.family),...item.tags,...item.tags.map(t),...item.colors,...item.colors.map(t)].join(' ').normalize('NFKC').toLocaleLowerCase().includes(word)));
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
    if(mobile)detailFooterAction.append(detailAction);else dialog.querySelector('.objects-detail-summary').append(detailAction);
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
      const image=document.createElement('img');image.sizes='96px';if(neighbor.imageSrcset)image.srcset=neighbor.imageSrcset;image.src=neighbor.image;image.alt='';image.decoding='async';
      const label=document.createElement('span');label.textContent=neighbor.brand+' — '+neighbor.name;
      const arrow=document.createElement('span');arrow.className='objects-peek-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent=step<0?'←':'→';button.replaceChildren(image,label,arrow);
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
    const swatches=dialog.querySelector('.objects-detail-colors');swatches.replaceChildren();
    for(const color of item.displayColors.slice(0,5)){const swatch=document.createElement('span');swatch.style.background=color.hex;swatch.title=t(color.name);swatch.setAttribute('role','img');swatch.setAttribute('aria-label',t(color.name));swatches.append(swatch);}
    const sources=[...new Set([item.credit,...item.gallery.map(photo=>photo.dataset.source)].filter(Boolean))];
    dialog.querySelector('.objects-dialog-sources').replaceChildren(...sources.filter((url,index,all)=>all.findIndex(other=>new URL(other).hostname===new URL(url).hostname)===index).map(url=>{
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
  // Consume the complete dismissal gesture before canvas drag or product handlers.
  let popupDismissPointer=null,popupDismissClick=false;
  canvas.addEventListener('pointerdown',event=>{
    const sheet=document.getElementById('objects-info-dialog');
    const filters=document.getElementById('objects-search-suggestions');
    popupDismissPointer=null;popupDismissClick=false;
    if(!sheet?.open&&(!filters||filters.hidden))return;
    popupDismissPointer=event.pointerId;popupDismissClick=true;
    if(sheet?.open)closeInfo();
    if(filters)closeSuggestions();
    searchInput?.blur();event.preventDefault();event.stopImmediatePropagation();
  },true);
  const consumePopupPointer=event=>{
    if(event.pointerId!==popupDismissPointer)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(event.type==='pointercancel'){popupDismissPointer=null;popupDismissClick=false;}
  };
  canvas.addEventListener('pointermove',consumePopupPointer,true);
  canvas.addEventListener('pointerup',consumePopupPointer,true);
  canvas.addEventListener('pointercancel',consumePopupPointer,true);
  canvas.addEventListener('click',event=>{
    if(popupDismissClick){popupDismissPointer=null;popupDismissClick=false;event.preventDefault();event.stopImmediatePropagation();}
  },true);
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
  const suggestions=document.getElementById('objects-search-suggestions');
  const suggestionGroups=[['Family',['Characters','Companions','Classics','Oddities','Rituals']],['Category',[...new Set(catalog.flatMap(item=>item.tags))]],['Color',[...new Set(catalog.flatMap(item=>item.colors))]]];
  const normalize=value=>value.normalize('NFKC').trim().toLocaleLowerCase();
  const renderSuggestions=()=>{
    if(!suggestions)return;
    suggestions.replaceChildren();
    for(const [label,values] of suggestionGroups){
      const matches=label==='Family'?values:values.slice().sort((a,b)=>a.localeCompare(b)).slice(0,24);
      if(!matches.length)continue;
      const row=document.createElement('div'),heading=document.createElement('p');heading.textContent=t(label);row.setAttribute('role','group');row.setAttribute('aria-label',t(label));row.append(heading);
      for(const value of matches){const button=document.createElement('button');button.type='button';const selected=label==='Family'?selectedFamilies:label==='Category'?selectedCategories:selectedColors;
        button.setAttribute('aria-pressed',String(selected.has(value)));
        if(label==='Color'){
          button.classList.add('search-color-button');
          const swatch=document.createElement('span');swatch.className='search-color-swatch';swatch.style.background={Black:'#16161A',Blue:'#2458A6',Brown:'#765138',Gray:'#929292',Green:'#48834C',Orange:'#E9762C',Pink:'#E38BAE',Purple:'#86609C',Red:'#FF2B00',Silver:'#BFC3C6',White:'#FFFFFF',Yellow:'#EEDC51'}[value];button.append(swatch);button.setAttribute('aria-label',t(value));button.title=t(value);
        }else button.append(document.createTextNode(t(value)));
        button.addEventListener('click',()=>{category='all';selectedTag='';if(selected.has(value))selected.delete(value);else selected.add(value);filter();renderSuggestions();suggestions.hidden=false;const replacement=[...suggestions.querySelectorAll('button')].find(b=>b.title===t(value)||b.textContent===t(value));replacement?.focus({preventScroll:true});});row.append(button);}
      suggestions.append(row);
    }
  };
  let suggestionMotion=null,suggestionsClosing=false;
  function closeSuggestions(){
    if(!suggestions||suggestions.hidden||suggestionsClosing)return;
    if(reduced.matches){suggestionMotion?.cancel();suggestionMotion=null;suggestions.hidden=true;suggestionsClosing=false;return;}
    suggestionsClosing=true;suggestions.inert=true;
    const current=getComputedStyle(suggestions);
    const start={opacity:current.opacity,transform:current.transform};
    suggestionMotion?.cancel();
    suggestionMotion=suggestions.animate([start,{opacity:0,transform:'translateY(-24px)'}],{duration:280,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});
    suggestionMotion.onfinish=()=>{if(suggestionsClosing){suggestions.hidden=true;suggestionsClosing=false;suggestionMotion.cancel();suggestionMotion=null;}};
  }
  searchInput?.addEventListener('focus',()=>{
    renderSuggestions();suggestions.inert=false;
    if(suggestionsClosing){
      const current=getComputedStyle(suggestions);
      const start={opacity:current.opacity,transform:current.transform};
      suggestionsClosing=false;suggestionMotion?.cancel();
      suggestionMotion=reduced.matches?null:suggestions.animate([start,{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});
      return;
    }
    if(!suggestions.hidden)return;
    suggestions.hidden=false;suggestionMotion?.cancel();
    if(!reduced.matches)suggestionMotion=suggestions.animate([{opacity:0,transform:'translateY(-24px)'},{opacity:1,transform:'translateY(5px)',offset:.65},{opacity:1,transform:'translateY(0)'}],{duration:480,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});
  });
  const searchWrap=searchInput?.closest('.objects-search-wrap');
  // Rebuilding selected tags temporarily removes the focused button. Dismiss by
  // an outside pointer gesture instead of treating that focus loss as a close.
  document.addEventListener('pointerdown',event=>{if(searchWrap&&!searchWrap.contains(event.target))closeSuggestions();});
  searchWrap?.addEventListener('keydown',event=>{if(event.key==='Escape'){closeSuggestions();searchInput.blur();}});
  searchInput?.addEventListener('input',()=>{selectedTag='';searchQuery=normalize(searchInput.value);filter();renderSuggestions();});
  categoryButtons.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.categoryFilter;filter();}));
  document.querySelectorAll('[data-reset-filters]').forEach(button=>button.addEventListener('click',()=>{category='all';selectedTag='';selectedFamilies.clear();selectedCategories.clear();selectedColors.clear();searchQuery='';if(searchInput)searchInput.value='';filter();renderSuggestions();}));
  document.querySelector('[data-reset-view]').addEventListener('click',reset);
  let zoomKnobFrame=0;
  const stopZoomKnob=()=>{cancelAnimationFrame(zoomKnobFrame);zoomKnobFrame=0;};
  const slideZoomKnob=target=>{
    const start=Number(zoomInput.value);
    stopZoomKnob();setZoom(target);
    if(reduced.matches||start===target)return;
    zoomInput.value=String(start);
    let started;
    const tick=time=>{
      started??=time;
      const progress=Math.min(1,(time-started)/280);
      const eased=1-Math.pow(1-progress,3);
      zoomInput.value=String(start+(target-start)*eased);
      if(progress<1)zoomKnobFrame=requestAnimationFrame(tick);
      else{zoomInput.value=String(target);zoomKnobFrame=0;}
    };
    zoomKnobFrame=requestAnimationFrame(tick);
  };
  zoomInput.addEventListener('pointerdown',stopZoomKnob);
  zoomInput.addEventListener('keydown',stopZoomKnob);
  zoomInput.addEventListener('input',()=>{stopZoomKnob();setZoom(Number(zoomInput.value));});
  reduced.addEventListener('change',()=>{if(reduced.matches){stopZoomKnob();zoomInput.value=String(zoom);}});
  zoomButtons.forEach(button=>button.addEventListener('click',()=>{
    const direction=Number(button.dataset.zoomStep);
    if((direction<0&&zoom===0)||(direction>0&&zoom===100))return;
    const stage=direction>0?Math.floor(zoom/25)+1:Math.ceil(zoom/25)-1;
    slideZoomKnob(stage*25);
  }));
  mobileZoom.addEventListener('change',updateZoomLayout);updateZoomLayout();
  const infoButton=document.querySelector('.objects-info'),infoDialog=document.getElementById('objects-info-dialog');
  const aboutDialog=document.getElementById('objects-about-dialog');
  const learnMore=infoDialog.querySelector('.objects-info-about');
  const stackedSheets=matchMedia('(max-width: 899px)');
  const animateInfoEntrance=sheet=>sheet.animate([
    {opacity:0,transform:'translateY(-32px)',offset:0},
    {opacity:1,transform:'translateY(8px)',offset:.6},
    {opacity:1,transform:'translateY(-3px)',offset:.82},
    {opacity:1,transform:'translateY(0)',offset:1}
  ],{duration:720,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});
  let aboutMotion=null,aboutClosing=false;
  const positionAbout=()=>{
    if(!aboutDialog.open)return;
    const rect=infoDialog.getBoundingClientRect();
    const gap=parseFloat(getComputedStyle(page).getPropertyValue('--finds-edge'))||16;
    const left=stackedSheets.matches?rect.left:rect.right+gap;
    aboutDialog.style.setProperty('--about-left',`${left}px`);
    aboutDialog.style.setProperty('--about-top',`${rect.top}px`);
    aboutDialog.style.setProperty('--about-width',`${Math.min(rect.width,innerWidth-left-gap)}px`);
    aboutDialog.style.setProperty('--about-height',`${rect.height}px`);
    infoDialog.inert=stackedSheets.matches||infoClosing;
  };
  const closeAbout=(restoreFocus=true,immediate=false)=>{
    if(!aboutDialog.open||(aboutClosing&&!immediate))return;
    aboutMotion?.cancel();aboutMotion=null;
    const finish=()=>{
      aboutDialog.close();aboutDialog.inert=false;aboutClosing=false;
      infoDialog.inert=infoClosing;
      learnMore.setAttribute('aria-expanded','false');
      if(restoreFocus&&infoDialog.open&&!infoClosing)learnMore.focus({preventScroll:true});
    };
    aboutClosing=true;aboutDialog.inert=true;
    if(immediate||reduced.matches){finish();return;}
    aboutMotion=aboutDialog.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:'translateX(24px)'}],{duration:280,easing:'cubic-bezier(.2,.8,.2,1)'});
    aboutMotion.onfinish=()=>{aboutMotion=null;finish();};
  };
  aboutDialog.querySelector('.objects-info-close').addEventListener('click',()=>closeAbout());
  aboutDialog.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');
    if(!link)return;
    const target=aboutDialog.querySelector(link.getAttribute('href'));
    if(!target)return;
    event.preventDefault();
    const scroll=aboutDialog.querySelector('.objects-about-scroll');
    const inset=parseFloat(getComputedStyle(scroll).paddingTop)||0;
    scroll.scrollTo({top:scroll.scrollTop+target.getBoundingClientRect().top-scroll.getBoundingClientRect().top-inset,behavior:reduced.matches?'instant':'smooth'});
    target.focus({preventScroll:true});
  });
  aboutDialog.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeAbout();}
    if(event.key==='Tab'&&document.activeElement===aboutDialog.querySelector('h2')){event.preventDefault();aboutDialog.querySelector('button').focus();return;}
    if(event.key==='Tab'&&stackedSheets.matches){
      const stops=[...aboutDialog.querySelectorAll('button,.objects-about-scroll,a[href]')];
      if(event.shiftKey&&document.activeElement===stops[0]){event.preventDefault();stops.at(-1).focus();}
      else if(!event.shiftKey&&document.activeElement===stops.at(-1)){event.preventDefault();stops[0].focus();}
    }
  });
  const infoSeenKey='2d1-finds-info-dismissed-v1';
  let infoEntrance=null,infoClosing=false;
  const clearInfoEntrance=()=>{infoEntrance?.cancel();infoEntrance=null;};
  const syncInfo=()=>{
    infoButton.firstElementChild.textContent='Familiar Characters';
    infoButton.firstElementChild.setAttribute('translate','no');
    infoButton.lastElementChild.textContent='';
    infoButton.setAttribute('aria-expanded',String(infoDialog.open));
    infoButton.setAttribute('aria-label',t('About this collection'));
    infoButton.classList.toggle('info-is-open',infoDialog.open);
    if(!infoDialog.open)infoButton.style.removeProperty('width');
  };
  const positionInfo=()=>{
    const rect=infoButton.getBoundingClientRect();
    const gap=parseFloat(getComputedStyle(page).getPropertyValue('--finds-edge'))||16;
    infoDialog.style.setProperty('--info-top',`${rect.bottom+gap}px`);
    infoDialog.style.setProperty('--info-left',`${rect.left}px`);
    positionAbout();
  };
  const popInfoSheet=()=>{
    infoEntrance=animateInfoEntrance(infoDialog);
  };
  const closeInfo=()=>{
    if(!infoDialog.open||infoClosing)return;
    closeAbout(false,true);
    if(reduced.matches){infoDialog.close();return;}
    infoClosing=true;infoDialog.inert=true;
    // Start moving immediately instead of replaying the entrance's settling
    // frames backward, which made dismissal feel unresponsive.
    const current=getComputedStyle(infoDialog);
    const start={opacity:current.opacity,transform:current.transform};
    clearInfoEntrance();
    infoEntrance=infoDialog.animate([start,{opacity:0,transform:'translateY(-32px)'}],{duration:280,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});
    infoEntrance.onfinish=()=>{if(infoClosing)infoDialog.close();};
  };
  const openInfo=()=>{
    if(infoClosing){
      const current=getComputedStyle(infoDialog);
      const start={opacity:current.opacity,transform:current.transform};
      infoClosing=false;infoDialog.inert=false;clearInfoEntrance();
      infoEntrance=infoDialog.animate([start,{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});
      return;
    }
    if(dialog.open||infoDialog.open)return;
    cancelGesture();stopMotion();settleGeometry();clearInfoEntrance();positionInfo();
    const origin=infoButton.getBoundingClientRect();
    infoButton.style.width=`${origin.width}px`;
    infoDialog.show();infoDialog.scrollTop=0;syncInfo();
    if(!reduced.matches)popInfoSheet();
    infoButton.focus({preventScroll:true});
  };
  window.addEventListener('resize',()=>{if(infoClosing)infoDialog.close();else{clearInfoEntrance();if(infoDialog.open)positionInfo();}},{passive:true});
  reduced.addEventListener('change',()=>{if(reduced.matches){clearInfoEntrance();if(aboutClosing)closeAbout(true,true);else{aboutMotion?.cancel();aboutMotion=null;}if(infoClosing)infoDialog.close();}});
  infoButton.addEventListener('click',()=>{if(infoClosing)openInfo();else if(infoDialog.open)closeInfo();else openInfo();});
  infoDialog.querySelector('.objects-info-close').addEventListener('click',()=>closeInfo());
  document.addEventListener('pointerdown',event=>{if(infoDialog.open&&!infoDialog.contains(event.target)&&!aboutDialog.contains(event.target)&&!infoButton.contains(event.target))closeInfo();});
  infoDialog.addEventListener('keydown',event=>{if(event.key==='Escape'){if(aboutDialog.open)closeAbout();else closeInfo();}});
  infoButton.addEventListener('keydown',event=>{if(event.key==='Escape'&&infoDialog.open)closeInfo();});
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{if(infoDialog.open)positionInfo();}).observe(infoButton);
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(positionAbout).observe(infoDialog);
  infoDialog.addEventListener('close',()=>{if(infoDialog.open)return;closeAbout(false,true);infoClosing=false;infoDialog.inert=false;clearInfoEntrance();syncInfo();try{localStorage.setItem(infoSeenKey,'1');}catch{}infoButton.focus({preventScroll:true});});
  infoDialog.addEventListener('click',event=>{if(event.target===infoDialog){const b=infoDialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)closeInfo();}});
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
  // A stationary pointer must not reveal a product as photos arrive beneath it.
  let entranceSettled=reduced.matches;
  let pageLoaded=document.readyState==='complete';
  if(!pageLoaded)window.addEventListener('load',()=>{pageLoaded=true;},{once:true});
  canvas.addEventListener('pointermove',event=>{
    if(event.pointerType==='mouse'&&pageLoaded&&entranceSettled){
      page.classList.add('objects-hover-ready');
    }
  },{passive:true});
  page.classList.add('objects-ready','objects-min-zoom');filter();
  let infoSeen=false;try{infoSeen=localStorage.getItem(infoSeenKey)==='1';}catch{}
  if(shopPreview){
    infoSeen=true;entranceSettled=true;
    let previewFrame=0,previewStarted=0;
    const previewPose=value=>{
      updateCanvasZoom(value);const size=geometry(canvas.clientWidth,zoom);
      pose({x:(canvas.clientWidth-size.cell)/2,y:(canvas.clientHeight-size.cell)/2,...size},false);
    };
    const stopPreview=()=>{cancelAnimationFrame(previewFrame);previewFrame=0;previewPose(0)};
    const tickPreview=time=>{
      const phase=(time-previewStarted)%6000/6000;
      previewPose((1-Math.cos(phase*Math.PI*2))*50);
      previewFrame=requestAnimationFrame(tickPreview);
    };
    addEventListener('message',event=>{
      if(event.source!==parent||event.origin!==location.origin)return;
      if(event.data==='fc-preview-start'&&!reduced.matches&&!previewFrame){previewStarted=performance.now();previewFrame=requestAnimationFrame(tickPreview)}
      if(event.data==='fc-preview-stop')stopPreview();
    });
    reduced.addEventListener('change',()=>{if(reduced.matches)stopPreview()});
    // The initial ResizeObserver delivery must not discard the decoded tiles.
    measuredWidth=canvas.clientWidth;measuredHeight=canvas.clientHeight;
    previewPose(0);draw();
    // Keep the parent's static monitor visible until the first canvas is decoded.
    Promise.all([...layer.querySelectorAll('img[src]')].map(image=>image.decode().catch(()=>{})))
      .then(()=>requestAnimationFrame(()=>parent.postMessage('fc-preview-ready',location.origin)));
  }
  else if(reduced.matches){if(!infoSeen)openInfo();}
  else{
    page.classList.add('finds-entering');
    // Establish the first layout before observing size changes, so the initial
    // resize notification cannot discard the tiles receiving the entrance.
    measuredWidth=canvas.clientWidth;measuredHeight=canvas.clientHeight;
    if(frame){cancelAnimationFrame(frame);frame=0;}
    draw();
    requestAnimationFrame(()=>requestAnimationFrame(async ()=>{
      const images=[...layer.querySelectorAll('.objects-tile img')].filter(image=>{const r=image.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;});
      if(reduced.matches){
        entranceSettled=true;
        page.classList.remove('finds-entering');
        if(!infoSeen)openInfo();
        return;
      }
      const duration=760;
      // A ripple from the center: each object hops into place with a little tilt.
      const ranked=images.map(image=>{const r=image.getBoundingClientRect();return {image,distance:Math.hypot((r.left+r.width/2-innerWidth/2)/cell,(r.top+r.height/2-innerHeight/2)/row)};}).sort((a,b)=>a.distance-b.distance);
      // Decode independently: one slow photo must not hide the whole collection.
      const decoded=ranked.map(async ({image},index)=>{
        image.style.opacity='0';
        await image.decode().catch(()=>{});
        if(!image.isConnected)return;
        if(firstPhotoAt===null)firstPhotoAt=performance.now()-startedAt;
        if(reduced.matches){image.style.opacity='1';return;}
        const tilt=index%2?6:-6;
        image.style.opacity='1';
        image.animate([
          {opacity:0,transform:`translateY(32px) rotate(${tilt}deg) scale(.72)`,offset:0},
          {opacity:1,transform:`translateY(-8px) rotate(${-tilt*.3}deg) scale(1.04)`,offset:.6},
          {opacity:1,transform:'translateY(3px) rotate(0deg) scale(.99)',offset:.82},
          {opacity:1,transform:'translateY(0) rotate(0deg) scale(1)',offset:1}
        ],{duration,delay:Math.min(index*32,640),easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'});
      });
      setTimeout(()=>{page.classList.remove('finds-entering');page.classList.add('finds-controls-enter');setTimeout(()=>{page.classList.remove('finds-controls-enter');Promise.all(decoded).then(()=>{entranceSettled=true;if(reportPerformance){const resources=performance.getEntriesByType('resource').filter(r=>r.initiatorType==='img');console.info('Finds performance',JSON.stringify({firstPhotoMs:Math.round(firstPhotoAt||0),readyMs:Math.round(performance.now()-startedAt),imageRequests:resources.length,imageEncodedBytes:resources.reduce((sum,r)=>sum+r.encodedBodySize,0),imageTransferBytes:resources.reduce((sum,r)=>sum+r.transferSize,0)}));}});if(!infoSeen)openInfo();},480);},duration+Math.min(Math.max(0,images.length-1)*32,640));
    }));
  }
})();
