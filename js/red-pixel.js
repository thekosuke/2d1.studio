/* Grab a pixel, throw a serve. Gameplay is user-started, including with reduced
   motion; decorative bursts and impact movement respect that preference. */
(() => {
  const $=selector=>document.querySelector(selector);
  const grab=$('.pixel-grab'),pixel=$('.red-pixel'),zoom=$('.pixel-zoom'),prompt=$('.pixel-prompt');
  const court=$('.pong-court'),ctx=court.getContext('2d'),main=$('main');
  if(!ctx||!globalThis.PixelPong)return;
  const controls=$('.pong-controls'),board=$('.pong-scoreboard'),help=$('.pong-help'),message=$('.pong-message');
  const status=$('[data-pong-status]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const ja=document.documentElement.lang==='ja';
  const copy=ja?{pause:'一時停止',resume:'再開',paused:'一時停止中',win:'あなたの勝ち',lose:'2D1 BOTの勝ち',again:'もう一度',score:(a,b)=>`あなた ${a}、2D1 BOT ${b}`,start:'ゲーム開始。左があなた、右が2D1 BOTです。',point:'あなたの得点',other:'2D1 BOTの得点'}:
    {pause:'Pause',resume:'Resume',paused:'Paused',win:'You win.',lose:'2D1 BOT wins.',again:'Play again',score:(a,b)=>`You ${a}, 2D1 BOT ${b}`,start:'Game on. You are on the left; 2D1 BOT on the right.',point:'Your point',other:'2D1 BOT’s point'};
  let mode='idle',game=null,pointer=null,samples=[],offsetX=0,offsetY=0;
  let x=innerWidth/2,y=innerHeight/2,frame=0,last=0,accumulator=0,particles=[],impacts=[],keys=new Set(),hoverTurn=null;
  const color={paper:'#FAF0E6',red:'#FF2B00'};
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function paintPixel(){grab.style.left=`${x}px`;grab.style.top=`${y}px`}
  function arm(){mode='armed';document.body.classList.add('is-armed');zoom.hidden=true;prompt.hidden=false}
  function size(){
    const rect=court.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);
    court.width=Math.round(rect.width*ratio);court.height=Math.round(rect.height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    if(game){game.resize(rect.width,rect.height);game.serve(1);particles=[];impacts=[]}
    return rect;
  }
  function updateScore(){
    $('[data-score="0"]').textContent=game.scores[0];$('[data-score="1"]').textContent=game.scores[1];
  }
  function start(vx=1,vy=.35){
    hoverTurn?.cancel();mode='playing';document.body.classList.remove('is-armed');document.body.classList.add('is-playing');
    grab.hidden=zoom.hidden=prompt.hidden=true;
    court.hidden=controls.hidden=board.hidden=help.hidden=false;message.hidden=true;
    const rect=size();game=new PixelPong(rect.width,rect.height);
    // The opening throw serves toward the computer, preserving its vertical aim.
    game.serve(1,clamp(vy/Math.max(Math.abs(vx),1),-.8,.8));
    particles=[];impacts=[];keys.clear();updateScore();status.textContent=copy.start;
    main.focus({preventScroll:true});last=performance.now();accumulator=0;wake();
    $('meta[name="theme-color"]').content='#191416';
  }
  function exit(){
    mode='idle';game=null;cancelAnimationFrame(frame);frame=0;keys.clear();particles=[];impacts=[];
    document.body.classList.remove('is-armed','is-playing');
    court.hidden=controls.hidden=board.hidden=help.hidden=message.hidden=prompt.hidden=true;
    grab.hidden=zoom.hidden=false;zoom.open=false;x=innerWidth/2;y=innerHeight/2;paintPixel();
    $('meta[name="theme-color"]').content='#FAF0E6';grab.focus({preventScroll:true});status.textContent='';
  }
  function pause(){
    if(mode!=='playing')return;
    mode='paused';keys.clear();cancelAnimationFrame(frame);frame=0;
    message.querySelector('p').textContent=copy.paused;message.querySelector('button').hidden=true;
    status.textContent=copy.paused;
    message.hidden=false;draw(0);
  }
  function resume(){
    if(mode==='over'){start();return}
    if(mode!=='paused')return;
    mode='playing';message.hidden=true;status.textContent=copy.resume;
    main.focus({preventScroll:true});last=performance.now();accumulator=0;wake();
  }
  function burst(px,py,count,force){
    if(reduced.matches)return;
    for(let i=0;i<count;i++){
      const angle=Math.random()*Math.PI*2,speed=force*(.35+Math.random()*.65);
      particles.push({x:px,y:py,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:.5+Math.random()*.45,max:1,size:i%3===0?6:3,color:i%3===0?color.red:color.paper});
    }
  }
  function eventEffect(event){
    if(event.type==='score'){
      updateScore();status.textContent=`${event.side===0?copy.point:copy.other}. ${copy.score(...game.scores)}.`;
      if(event.side===0)burst(game.w/2,game.h/2,52,Math.min(game.w*.6,350));
      const score=$(`[data-score="${event.side}"]`);
      if(!reduced.matches)score.animate([{color:color.red,transform:'translateY(-4px)'},{color:color.paper,transform:'translateY(0)'}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'});
      if(game.scores[event.side]>=5){
        mode='over';message.hidden=false;message.querySelector('button').hidden=false;
        message.querySelector('p').textContent=event.side===0?copy.win:copy.lose;
        message.querySelector('button').textContent=copy.again;
        status.textContent=`${message.querySelector('p').textContent} ${copy.score(...game.scores)}`;
        message.querySelector('button').focus({preventScroll:true});
      }
    }else if(!reduced.matches){
      impacts.push({...event,life:.18});burst(event.x,event.y,event.type==='paddle'?6:3,80);
    }
  }
  function draw(dt){
    if(!game)return;
    ctx.clearRect(0,0,game.w,game.h);
    ctx.globalAlpha=1;
    [game.player,game.ai].forEach((py,side)=>{
      const hit=impacts.find(e=>e.type==='paddle'&&e.side===side);
      ctx.fillStyle=hit?color.red:color.paper;
      const nudge=hit?Math.sin(hit.life/.18*Math.PI)*3*(side?-1:1):0;
      ctx.fillRect(Math.round(side?game.w-game.pad-game.pw+nudge:game.pad+nudge),Math.round(py-game.ph/2),game.pw,game.ph);
    });
    if(mode!=='over'){
      ctx.globalAlpha=1;ctx.fillStyle=color.red;
      ctx.fillRect(Math.round(game.x-game.r),Math.round(game.y-game.r),game.r*2,game.r*2);ctx.globalAlpha=1;
    }
    for(const hit of impacts){
      hit.life-=dt;
    }
    impacts=impacts.filter(hit=>hit.life>0);
    for(const p of particles){
      p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.exp(-3*dt);p.vy*=Math.exp(-3*dt);
      ctx.globalAlpha=clamp(p.life*2,0,1);ctx.fillStyle=p.color;ctx.fillRect(Math.round(p.x),Math.round(p.y),p.size,p.size);
    }
    ctx.globalAlpha=1;particles=particles.filter(p=>p.life>0);
  }
  function tick(now){
    frame=0;const dt=Math.min((now-last)/1000,.05);last=now;
    if(mode==='playing'){
      const direction=(keys.has('ArrowDown')||keys.has('s')?1:0)-(keys.has('ArrowUp')||keys.has('w')?1:0);
      if(direction)game.target=clamp(game.target+direction*game.base*1.8*dt,game.ph/2,game.h-game.ph/2);
      accumulator+=dt;
      while(accumulator>=1/120&&mode==='playing'){game.step(1/120).forEach(eventEffect);accumulator-=1/120}
    }
    draw(dt);
    if(mode==='playing'||(mode==='over'&&particles.length))wake();
  }
  function wake(){if(!frame&&!document.hidden)frame=requestAnimationFrame(tick)}
  grab.addEventListener('pointerenter',event=>{
    if(event.pointerType==='touch'||pointer!==null||reduced.matches)return;
    hoverTurn?.cancel();hoverTurn=pixel.animate([{rotate:'0deg'},{rotate:'180deg'}],{duration:480,easing:'cubic-bezier(.2,.8,.2,1)'});
  });
  grab.addEventListener('pointerdown',event=>{
    if(event.button!==0||pointer!==null)return;
    event.preventDefault();grab.focus({preventScroll:true});arm();hoverTurn?.cancel();
    pointer=event.pointerId;offsetX=event.clientX-x;offsetY=event.clientY-y;
    samples=[{x:event.clientX,y:event.clientY,t:performance.now()}];
    grab.classList.add('is-grabbed');grab.setPointerCapture(pointer);
  });
  grab.addEventListener('pointermove',event=>{
    if(event.pointerId!==pointer)return;
    x=clamp(event.clientX-offsetX,12,innerWidth-12);y=clamp(event.clientY-offsetY,12,innerHeight-12);paintPixel();
    samples.push({x:event.clientX,y:event.clientY,t:performance.now()});
  });
  function release(event,cancelled=false){
    if(event.pointerId!==pointer)return;
    const id=pointer;pointer=null;grab.classList.remove('is-grabbed');
    if(grab.hasPointerCapture(id))grab.releasePointerCapture(id);
    const first=samples[0],end=samples.at(-1);samples=[];
    if(!cancelled&&end&&Math.hypot(end.x-first.x,end.y-first.y)>6){
      start(end.x-first.x,end.y-first.y);
    }
  }
  grab.addEventListener('pointerup',event=>release(event));
  grab.addEventListener('pointercancel',event=>release(event,true));
  grab.addEventListener('lostpointercapture',event=>release(event,true));
  grab.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();if(mode==='armed'){start()}else arm()}
    else if(event.key==='Escape'||event.key==='Home'){event.preventDefault();exit()}
  });
  function aim(event){
    if(mode!=='playing')return;
    const rect=court.getBoundingClientRect();game.target=clamp(event.clientY-rect.top,game.ph/2,game.h-game.ph/2);
  }
  // A tap toggles play; a drag moves the paddle without pausing on release.
  let courtGesture=null;
  main.addEventListener('pointerdown',event=>{
    if(event.button!==0||!['playing','paused'].includes(mode)||courtGesture||event.target===grab)return;
    courtGesture={id:event.pointerId,x:event.clientX,y:event.clientY,dragged:false};
    main.setPointerCapture(event.pointerId);main.focus({preventScroll:true});
  });
  main.addEventListener('pointermove',event=>{
    if(courtGesture&&courtGesture.id!==event.pointerId)return;
    if(courtGesture&&Math.hypot(event.clientX-courtGesture.x,event.clientY-courtGesture.y)>6)courtGesture.dragged=true;
    if(!courtGesture||courtGesture.dragged)aim(event);
  });
  main.addEventListener('pointerup',event=>{
    if(event.pointerId!==courtGesture?.id)return;
    const toggle=!courtGesture.dragged;courtGesture=null;
    if(main.hasPointerCapture(event.pointerId))main.releasePointerCapture(event.pointerId);
    if(toggle)mode==='playing'?pause():resume();
  });
  const cancelGesture=event=>{if(event.pointerId===courtGesture?.id)courtGesture=null};
  main.addEventListener('pointercancel',cancelGesture);
  main.addEventListener('lostpointercapture',cancelGesture);
  addEventListener('keydown',event=>{
    if(!game)return;
    if(['ArrowUp','ArrowDown','w','s'].includes(event.key)){event.preventDefault();keys.add(event.key)}
    else if(event.key==='Escape'){event.preventDefault();exit()}
    else if(event.key===' '&&event.target.tagName!=='BUTTON'){event.preventDefault();if(!event.repeat)mode==='playing'?pause():resume()}
    else if(event.key==='Tab'&&mode==='playing')pause();
  });
  addEventListener('keyup',event=>keys.delete(event.key));
  $('[data-pong-exit]').addEventListener('click',exit);
  message.querySelector('button').addEventListener('click',()=>{resume()});
  addEventListener('blur',pause);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
  addEventListener('resize',()=>{
    if(game){size();pause();draw(0)}else{x=clamp(x,22,innerWidth-22);y=clamp(y,22,innerHeight-22);paintPixel()}
  });
  reduced.addEventListener('change',()=>{particles=[];impacts=[];hoverTurn?.cancel();draw(0)});
  paintPixel();
})();
