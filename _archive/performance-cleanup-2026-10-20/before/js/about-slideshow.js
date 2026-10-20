/* Only autoplay while the project column is visible, with a persistent pause control. */
(() => {
  const gallery=document.querySelector('.about-project-slideshow');
  if(!gallery)return;
  const images=[...gallery.querySelectorAll('img')],button=gallery.querySelector('button');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let current=0,timer=0,paused=false;
  function update(){
    const rect=gallery.getBoundingClientRect();
    const rooms=gallery.closest('.about-services');
    const visible=rect.bottom>0&&rect.top<innerHeight&&rect.right>0&&rect.left<innerWidth&&Number(getComputedStyle(rooms).opacity)>.95;
    button.hidden=reduced.matches;
    if(reduced.matches||paused||document.hidden||!visible){clearInterval(timer);timer=0;return}
    if(!timer)timer=setInterval(()=>{
      const next=(current+1)%images.length;
      if(!images[next].complete||!images[next].naturalWidth)return;
      images[current].classList.remove('is-active');current=next;images[current].classList.add('is-active');
    },4000);
  }
  button.addEventListener('click',()=>{
    paused=!paused;button.textContent=paused?'▶':'Ⅱ';
    const ja=document.documentElement.lang==='ja';
    button.setAttribute('aria-label',paused?(ja?'スライドショーを再生':'Play slideshow'):(ja?'スライドショーを一時停止':'Pause slideshow'));
    update();
  });
  addEventListener('about-ground-change',update);
  addEventListener('scroll',update,{passive:true});
  addEventListener('resize',update);
  document.addEventListener('visibilitychange',update);
  reduced.addEventListener('change',update);
  update();
})();
