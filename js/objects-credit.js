/* Choose brand ink from the actual photo pixels beneath the sticky credits and image count. */
(() => {
  const dialog=document.querySelector('#object-dialog');
  const credit=dialog?.querySelector('.objects-dialog-credit');
  const gallery=dialog?.querySelector('.objects-dialog-photo');
  if(!credit||!gallery)return;
  const labels=[credit,dialog.querySelector('.objects-photo-count')].filter(Boolean);
  const pixels=new WeakMap(),resolution=96;
  const luminance=rgb=>rgb.map(value=>{value/=255;return value<=.04045?value/12.92:((value+.055)/1.055)**2.4;}).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);
  const light=luminance([250,240,230]),dark=luminance([50,5,5]);
  let frame=0;
  function sample(image){
    if(!image.complete||!image.naturalWidth)return null;
    const cached=pixels.get(image);
    if(cached?.src===image.currentSrc)return cached.data;
    try{
      const canvas=document.createElement('canvas');canvas.width=canvas.height=resolution;
      const context=canvas.getContext('2d',{willReadFrequently:true});
      context.fillStyle='#FAF0E6';context.fillRect(0,0,resolution,resolution);
      context.drawImage(image,0,0,resolution,resolution);
      const data=context.getImageData(0,0,resolution,resolution).data;
      pixels.set(image,{src:image.currentSrc,data});return data;
    }catch{return null;}
  }
  function update(){
    frame=0;if(!dialog.open)return;
    for(const label of labels){
    const range=document.createRange();range.selectNodeContents(label);
    const text=range.getBoundingClientRect(),clip=gallery.getBoundingClientRect();
    const photos=[...gallery.querySelectorAll('img')].map(image=>({image,box:image.getBoundingClientRect()})).filter(({box})=>box.bottom>text.top&&box.top<text.bottom&&box.right>text.left&&box.left<text.right);
    let total=0;
    for(let row=0;row<3;row++)for(let col=0;col<12;col++){
      const x=text.left+text.width*(col+.5)/12,y=text.top+text.height*(row+.5)/3;
      let value=light;
      const photo=photos.find(({box})=>x>=box.left&&x<box.right&&y>=box.top&&y<box.bottom&&x>=clip.left&&x<clip.right);
      if(photo){
        const {image,box}=photo,data=sample(image);
        if(data){
          const style=getComputedStyle(image),contain=style.objectFit==='contain';
          const scale=(contain?Math.min:Math.max)(box.width/image.naturalWidth,box.height/image.naturalHeight);
          const width=image.naturalWidth*scale,height=image.naturalHeight*scale;
          const position=style.objectPosition.split(' ').map(value=>parseFloat(value)/100);
          const u=(x-box.left-(box.width-width)*(position[0]??.5))/width;
          const v=(y-box.top-(box.height-height)*(position[1]??.5))/height;
          if(u>=0&&u<1&&v>=0&&v<1){
            const offset=(Math.floor(v*resolution)*resolution+Math.floor(u*resolution))*4;
            value=luminance([data[offset],data[offset+1],data[offset+2]]);
          }
        }
      }
      total+=value;
    }
    const background=total/36;
    const brownContrast=(Math.max(background,dark)+.05)/(Math.min(background,dark)+.05);
    const beigeContrast=(Math.max(background,light)+.05)/(Math.min(background,light)+.05);
    label.classList.toggle('is-on-dark-photo',beigeContrast>brownContrast);
    }
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  dialog.addEventListener('objectshown',schedule);
  dialog.addEventListener('scroll',schedule,true);
  gallery.addEventListener('load',schedule,true);
  const observer=new ResizeObserver(schedule);
  labels.forEach(label=>observer.observe(label));
  window.addEventListener('resize',schedule);
})();
