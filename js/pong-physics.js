/* Level-five opponent: intermittent reads, imperfect anticipation and
   acceleration-limited movement instead of tracking every frame. */
(() => {
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  class PixelPong {
    constructor(width,height,random=Math.random){this.random=random;this.scores=[0,0];this.resize(width,height);this.player=this.ai=this.h/2;this.target=this.player;this.serve(1)}
    resize(width,height){
      const old=this.h||height;
      this.w=width;this.h=height;this.pad=clamp(width*.035,20,48);this.pw=8;
      this.ph=clamp(height*.17,64,112);this.r=6;this.base=clamp(width*.48,260,560);
      this.player=clamp((this.player||old/2)*height/old,this.ph/2,height-this.ph/2);
      this.ai=clamp((this.ai||old/2)*height/old,this.ph/2,height-this.ph/2);this.target=this.player;
    }
    serve(direction,vertical=.35){
      this.x=this.w/2;this.y=this.h/2;this.speed=this.base;
      this.vx=direction*this.speed/Math.hypot(1,vertical);this.vy=this.speed*vertical/Math.hypot(1,vertical);
      this.delay=1;this.aiVelocity=0;this.aim=this.h/2;this.readReturn();
    }
    readReturn(){
      this.reaction=.22+this.random()*.14;
      // A consistent misread per return avoids twitchy frame-by-frame randomness.
      this.error=(this.random()-.5)*this.ph*(this.random()<.12?1.8:.9);
      this.anticipation=.86+this.random()*.18;
      this.recovery=this.h/2+(this.random()-.5)*this.h*.12;
    }
    step(dt){
      const events=[];
      this.player+=clamp(this.target-this.player,-this.base*2*dt,this.base*2*dt);
      this.player=clamp(this.player,this.ph/2,this.h-this.ph/2);
      if(this.delay>0){this.delay-=dt;return events}
      this.reaction-=dt;
      if(this.reaction<=0){
        this.reaction=.22+this.random()*.14;
        if(this.vx>0){
          const travel=Math.max(0,(this.w-this.pad-this.pw-this.r-this.x)/this.vx);
          const span=this.h-2*this.r;
          let predicted=((this.y-this.r+this.vy*travel*this.anticipation)%(2*span)+2*span)%(2*span);
          this.aim=clamp(this.r+(predicted>span?2*span-predicted:predicted)+this.error,this.ph/2,this.h-this.ph/2);
        }else this.aim=this.recovery;
      }
      const distance=this.aim-this.ai;
      const maxSpeed=this.base*(this.vx>0?.68:.4);
      const desired=Math.abs(distance)<5?0:clamp(distance*5,-maxSpeed,maxSpeed);
      this.aiVelocity+=clamp(desired-this.aiVelocity,-this.base*3.2*dt,this.base*3.2*dt);
      this.ai=clamp(this.ai+this.aiVelocity*dt,this.ph/2,this.h-this.ph/2);
      if(this.ai===this.ph/2||this.ai===this.h-this.ph/2)this.aiVelocity=0;
      const previous=this.x;this.x+=this.vx*dt;this.y+=this.vy*dt;
      if(this.y<this.r||this.y>this.h-this.r){this.y=clamp(this.y,this.r,this.h-this.r);this.vy*=-1;events.push({type:'wall',x:this.x,y:this.y})}
      const left=this.pad+this.pw+this.r,right=this.w-left;
      const hitLeft=this.vx<0&&previous>=left&&this.x<=left&&Math.abs(this.y-this.player)<=this.ph/2+this.r;
      const hitRight=this.vx>0&&previous<=right&&this.x>=right&&Math.abs(this.y-this.ai)<=this.ph/2+this.r;
      if(hitLeft||hitRight){
        const offset=clamp((this.y-(hitLeft?this.player:this.ai))/(this.ph/2),-1,1);
        const angle=offset*1.05;this.speed=Math.min(this.base*1.75,this.speed*1.065);
        this.vx=(hitLeft?1:-1)*this.speed*Math.cos(angle);this.vy=this.speed*Math.sin(angle);
        this.x=hitLeft?left:right;this.readReturn();
        events.push({type:'paddle',side:hitLeft?0:1,x:this.x,y:this.y});
      }
      if(this.x < -this.r || this.x > this.w+this.r){
        const side=this.x>this.w?0:1;this.scores[side]++;
        events.push({type:'score',side});this.serve(side===0?-1:1,(this.random()-.5)*.9);
      }
      return events;
    }
  }
  globalThis.PixelPong=PixelPong;
})();
