/* A flat pixel with pointer throws, edge collisions and additive hover turns. */
(() => {
  const grab=document.querySelector('.pixel-grab');
  const pixel=grab?.querySelector('.red-pixel');
  if(!pixel)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const zoom=document.querySelector('.pixel-zoom');
  let x=innerWidth/2,y=innerHeight/2,vx=0,vy=0,angle=0,turns=0,spin=0;
  let pointer=null,offsetX=0,offsetY=0,samples=[],frame=0,last=0,zoomUntil=0;
  const paint=()=>{grab.style.left=`${x}px`;grab.style.top=`${y}px`;pixel.style.rotate=`${angle}deg`};
  const bounds=()=>{
    const scale=new DOMMatrixReadOnly(getComputedStyle(pixel).transform).a;
    const radians=angle*Math.PI/180;
    const r=Math.max(.5,Math.abs(scale||1)/2*(Math.abs(Math.cos(radians))+Math.abs(Math.sin(radians))));
    return {r,right:Math.max(r,innerWidth-r),bottom:Math.max(r,innerHeight-r)};
  };
  const contain=(bounce=false)=>{
    const {r,right,bottom}=bounds();
    if(x<r||x>right){x=Math.max(r,Math.min(right,x));if(bounce){vx=x===r?Math.abs(vx)*.9:-Math.abs(vx)*.9;spin=-spin*.85}}
    if(y<r||y>bottom){y=Math.max(r,Math.min(bottom,y));if(bounce){vy=y===r?Math.abs(vy)*.9:-Math.abs(vy)*.9;spin=-spin*.85}}
  };
  const wake=()=>{if(!frame&&!document.hidden){last=performance.now();frame=requestAnimationFrame(tick)}};
  const tick=time=>{
    frame=0;
    const dt=Math.min((time-last)/1000,.032);last=time;
    if(pointer===null&&!reduced.matches){
      x+=vx*dt;y+=vy*dt;
      const friction=Math.exp(-.22*dt);vx*=friction;vy*=friction;spin*=Math.exp(-.35*dt);
      angle+=spin*dt;
    }
    if(turns>0&&!reduced.matches){const step=Math.min(turns,600*dt);angle+=step;turns-=step}
    if(Math.abs(vx)<2)vx=0;if(Math.abs(vy)<2)vy=0;if(Math.abs(spin)<2)spin=0;
    contain(pointer===null);paint();
    if(vx||vy||spin||turns||time<zoomUntil)frame=requestAnimationFrame(tick);
  };
  grab.addEventListener('pointerenter',event=>{
    if(event.pointerType==='touch'||pointer!==null||reduced.matches)return;
    turns+=180;wake();
  });
  grab.addEventListener('pointerdown',event=>{
    if(event.button!==0||pointer!==null)return;
    event.preventDefault();grab.focus({preventScroll:true});
    pointer=event.pointerId;offsetX=event.clientX-x;offsetY=event.clientY-y;
    vx=vy=spin=0;turns=0;samples=[{x:event.clientX,y:event.clientY,t:performance.now()}];
    grab.classList.add('is-grabbed');grab.setPointerCapture(pointer);
  });
  grab.addEventListener('pointermove',event=>{
    if(event.pointerId!==pointer)return;
    const time=performance.now();
    x=event.clientX-offsetX;y=event.clientY-offsetY;contain();paint();
    samples.push({x:event.clientX,y:event.clientY,t:time});
    samples=samples.filter(sample=>time-sample.t<100);
  });
  const release=(event,cancelled=false)=>{
    if(event.pointerId!==pointer)return;
    const id=pointer;pointer=null;grab.classList.remove('is-grabbed');
    if(grab.hasPointerCapture(id))grab.releasePointerCapture(id);
    const first=samples[0],end=samples[samples.length-1];
    if(!cancelled&&!reduced.matches&&first&&end&&end.t>first.t&&performance.now()-end.t<100){
      const seconds=Math.max(.016,(end.t-first.t)/1000);
      vx=(end.x-first.x)/seconds;vy=(end.y-first.y)/seconds;
      const speed=Math.hypot(vx,vy),limit=Math.min(1,2200/(speed||1));vx*=limit;vy*=limit;
      spin=Math.max(-900,Math.min(900,(vx-vy)*.7));
      if(Math.abs(spin)<120&&speed>80)spin=240;
      wake();
    }
    samples=[];
  };
  grab.addEventListener('pointerup',event=>release(event));
  grab.addEventListener('pointercancel',event=>release(event,true));
  grab.addEventListener('lostpointercapture',event=>release(event,true));
  grab.addEventListener('keydown',event=>{
    const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    const direction=directions[event.key];
    if(direction){event.preventDefault();if(event.shiftKey&&!reduced.matches){vx+=direction[0]*800;vy+=direction[1]*800;spin+=360;wake()}else{x+=direction[0]*24;y+=direction[1]*24;contain();paint()}}
    else if(event.key===' '||event.key==='Enter'){event.preventDefault();if(!reduced.matches){turns+=360;wake()}}
    else if(event.key==='Home'){event.preventDefault();vx=vy=spin=turns=angle=0;x=innerWidth/2;y=innerHeight/2;paint()}
  });
  zoom.addEventListener('toggle',()=>{zoomUntil=performance.now()+800;wake()});
  addEventListener('resize',()=>{contain();paint()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else wake()});
  reduced.addEventListener('change',()=>{if(reduced.matches){vx=vy=spin=turns=angle=0;paint()}});
  paint();
})();
