/* v7: premium motion layer. Pure progressive enhancement; honours reduced motion + the page's Motion toggle. */
(() => {
 'use strict';
 const root=document.documentElement, body=document.body;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const fine=matchMedia('(hover: hover) and (pointer: fine)');
 const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
 const on=()=>!reduced.matches&&!body.classList.contains('motion-off');
 root.classList.add('v7');

 /* ---- word-mask split for headings (keeps <em>/<br>, exposes original text to AT) ---- */
 function split(el,base){
  if(!el||el.dataset.v7split)return;el.dataset.v7split='1';
  const label=el.textContent.replace(/\s+/g,' ').trim();el.setAttribute('aria-label',label);
  let i=0;
  const walk=n=>{
   [...n.childNodes].forEach(c=>{
    if(c.nodeType===3){
     const frag=document.createDocumentFragment();
     c.textContent.split(/(\s+)/).forEach(t=>{
      if(!t)return;
      if(/^\s+$/.test(t)){frag.appendChild(document.createTextNode(' '));return}
      const w=document.createElement('span');w.className='w';w.setAttribute('aria-hidden','true');
      const wi=document.createElement('span');wi.className='wi';wi.style.setProperty('--i',i++);wi.textContent=t;w.appendChild(wi);frag.appendChild(w);
     });
     c.replaceWith(frag);
    }else if(c.nodeType===1&&c.tagName!=='BR')walk(c);
   });
  };
  walk(el);el.style.setProperty('--base',(base||0)+'ms');
 }
 const h1=$('#hero-title');split(h1,120);
 $$('.section-heading h2,.approach-grid h2,.about-copy h2,.contact-copy h2').forEach(h=>split(h,0));

 /* ---- entrance ---- */
 const start=()=>{body.classList.add('loaded');h1&&h1.classList.add('split-in')};
 if(document.readyState==='complete')requestAnimationFrame(()=>setTimeout(start,60));else addEventListener('load',()=>setTimeout(start,60));
 setTimeout(start,1800); // never leave the hero hidden

 /* ---- scroll reveals ---- */
 const revealSel=['.project','.skill','.professional-work','.approach-notes article','.vision-machine','.vision-stop','.about-layout>*','.inquiry','.contact-copy>*:not(h2)','.section-heading>p','.skill-filters','.stack-section .wrap>p'];
 const targets=new Set();
 revealSel.forEach(s=>$$(s).forEach(e=>targets.add(e)));
 const stagger=new Map();
 targets.forEach(e=>{
  e.classList.add('reveal');
  const p=e.parentElement;const n=(stagger.get(p)||0);stagger.set(p,n+1);
  e.style.setProperty('--d',Math.min(n%8,7)*70+'ms');
 });
 const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
 targets.forEach(e=>io.observe(e));
 $$('.section-top,.section-heading h2,.approach-grid h2,.about-copy h2,.contact-copy h2').forEach(e=>io.observe(e));

 /* ---- scroll progress ---- */
 const bar=document.createElement('div');bar.className='v7-progress';bar.setAttribute('aria-hidden','true');body.appendChild(bar);
 let sy=0,tick=false;
 const onScroll=()=>{sy=scrollY;if(!tick){tick=true;requestAnimationFrame(()=>{tick=false;const m=root.scrollHeight-innerHeight;bar.style.setProperty('--p',m>0?Math.min(1,sy/m).toFixed(4):0);foot()})}};
 addEventListener('scroll',onScroll,{passive:true});

 /* footer wordmark parallax */
 const fn=$('.footer-name');
 function foot(){if(!fn||!on())return;const r=fn.getBoundingClientRect();const t=Math.max(-1,Math.min(1,(r.top-innerHeight)/innerHeight+.5));fn.style.transform=`translateY(${(t*28).toFixed(1)}px)`}

 /* ---- marquee ---- */
 const strip=$('.discipline-strip');
 if(strip){
  const items=$$('.wrap>span',strip).map(s=>s.textContent.trim());
  if(items.length){
   const m=document.createElement('div');m.className='v7-marquee';m.setAttribute('aria-hidden','true');
   const t=document.createElement('div');t.className='v7-track';
   const cp=[...items,'Laravel','React Native','Automation','Product thinking'];
   for(let k=0;k<4;k++)cp.forEach(x=>{const s=document.createElement('span');s.textContent=x;t.appendChild(s)});
   m.appendChild(t);strip.appendChild(m);$('.wrap',strip).classList.add('sr-hidden');
  }
 }

 /* ---- hero portrait: gyroscope + orbit chips ---- */
 const fig=$('.hero-portrait');
 if(fig){
  const g=document.createElement('div');g.className='v7-gyro';g.setAttribute('aria-hidden','true');g.innerHTML='<i></i><i></i><i></i>';fig.prepend(g);
  [['c1','⚡','Laravel systems'],['c2','✦','AI agents'],['c3','◈','React Native']].forEach(([c,ic,tx])=>{
   const d=document.createElement('div');d.className='v7-chip '+c;d.setAttribute('aria-hidden','true');d.innerHTML=`<b>${ic}</b>${tx}`;fig.appendChild(d);
  });
  const hero=$('#home');
  hero.addEventListener('pointermove',e=>{
   if(!fine.matches||!on())return;
   const r=fig.getBoundingClientRect();const x=(e.clientX-(r.left+r.width/2))/innerWidth,y=(e.clientY-(r.top+r.height/2))/innerHeight;
   g.style.setProperty('--gx',(-y*26).toFixed(2)+'deg');g.style.setProperty('--gy',(x*34).toFixed(2)+'deg');
   $$('.v7-chip',fig).forEach((c,i)=>{c.style.setProperty('--cx',(x*(24+i*14)).toFixed(1));c.style.setProperty('--cy',(y*(18+i*10)).toFixed(1))});
  },{passive:true});
 }

 /* ---- contact cube ---- */
 const cs=$('.contact-section');
 if(cs){const w=document.createElement('div');w.className='v7-cubewrap';w.setAttribute('aria-hidden','true');w.innerHTML='<div class="v7-cube"><i></i><i></i><i></i><i></i><i></i><i></i></div>';cs.prepend(w)}

 /* ---- skill float stagger ---- */
 $$('.skill-visual').forEach((e,i)=>e.style.setProperty('--bd',(-(i*0.37)%5.5).toFixed(2)+'s'));

 /* ---- 3D tilt + glare cards ---- */
 const tilts=new WeakMap();
 function bindTilt(el,max){
  el.classList.add('v7-card');
  let raf=0,nx=0,ny=0;
  const apply=()=>{raf=0;el.style.setProperty('--rx',(-ny*max).toFixed(2)+'deg');el.style.setProperty('--ry',(nx*max).toFixed(2)+'deg')};
  el.addEventListener('pointermove',e=>{
   if(e.pointerType==='touch')return;
   const r=el.getBoundingClientRect();
   el.style.setProperty('--mx',(e.clientX-r.left)+'px');el.style.setProperty('--my',(e.clientY-r.top)+'px');
   if(!fine.matches||!on())return;
   nx=(e.clientX-r.left)/r.width-.5;ny=(e.clientY-r.top)/r.height-.5;el.classList.add('tilting');
   if(!raf)raf=requestAnimationFrame(apply);
  },{passive:true});
  el.addEventListener('pointerleave',()=>{nx=ny=0;el.classList.remove('tilting');if(!raf)raf=requestAnimationFrame(apply)});
 }
 $$('.project').forEach(e=>bindTilt(e,3.2));
 $$('.skill').forEach(e=>bindTilt(e,9));
 $$('.vision-stop').forEach(e=>bindTilt(e,4));
 $$('.professional-work,.inquiry').forEach(e=>bindTilt(e,1.6));

 /* ---- magnetic buttons ---- */
 $$('.button,.icon-button').forEach(b=>{
  b.addEventListener('pointermove',e=>{
   if(!fine.matches||!on())return;const r=b.getBoundingClientRect();
   b.style.transform=`translate(${((e.clientX-r.left)/r.width-.5)*10}px,${((e.clientY-r.top)/r.height-.5)*8}px)`;
  },{passive:true});
  b.addEventListener('pointerleave',()=>{b.style.transform=''});
 });

 /* ---- cursor glow + dot ---- */
 if(fine.matches){
  const glow=document.createElement('div');glow.className='v7-cursor';const dot=document.createElement('div');dot.className='v7-dot';
  [glow,dot].forEach(e=>{e.setAttribute('aria-hidden','true');body.appendChild(e)});
  let tx=innerWidth/2,ty=innerHeight/2,gx=tx,gy=ty,dx=tx,dy=ty,run=false;
  const loop=()=>{
   gx+=(tx-gx)*.09;gy+=(ty-gy)*.09;dx+=(tx-dx)*.32;dy+=(ty-dy)*.32;
   glow.style.transform=`translate(${gx}px,${gy}px)`;dot.style.transform=`translate(${dx}px,${dy}px)`;
   if(Math.abs(tx-gx)+Math.abs(ty-gy)>.4)requestAnimationFrame(loop);else run=false;
  };
  addEventListener('pointermove',e=>{
   if(e.pointerType==='touch'||!on())return;tx=e.clientX;ty=e.clientY;glow.classList.add('on');dot.classList.add('on');
   dot.classList.toggle('big',!!e.target.closest('a,button,summary,input,select,textarea,[tabindex="0"]'));
   if(!run){run=true;requestAnimationFrame(loop)}
  },{passive:true});
  document.addEventListener('pointerleave',()=>{glow.classList.remove('on');dot.classList.remove('on')});
 }

 /* ---- ambient canvas: perspective ember floor + drifting sparks ---- */
 const cv=document.createElement('canvas');cv.className='v7-canvas';cv.setAttribute('aria-hidden','true');body.prepend(cv);
 const ctx=cv.getContext('2d');
 let W=0,H=0,DPR=1,px=0,py=0,tpx=0,tpy=0,vis=true,last=0,t0=performance.now();
 const sparks=[];
 const resize=()=>{DPR=Math.min(devicePixelRatio||1,1.75);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);
  const n=Math.round(Math.min(90,W*H/18000));while(sparks.length<n)sparks.push(spark(true));sparks.length=n};
 function spark(init){return{x:Math.random()*2-1,y:init?Math.random():1.1,z:Math.random()*.9+.1,s:Math.random()*.0006+.00018,r:Math.random()*1.6+.5,p:Math.random()*6.28}}
 resize();addEventListener('resize',resize);
 addEventListener('pointermove',e=>{tpx=e.clientX/W-.5;tpy=e.clientY/H-.5},{passive:true});
 document.addEventListener('visibilitychange',()=>{vis=!document.hidden;if(vis)requestAnimationFrame(frame)});
 function frame(now){
  if(!vis)return;requestAnimationFrame(frame);
  if(!on()){ctx.clearRect(0,0,W,H);return}
  if(now-last<30)return;const dt=Math.min(64,now-last);last=now;
  px+=(tpx-px)*.05;py+=(tpy-py)*.05;
  ctx.clearRect(0,0,W,H);
  const t=(now-t0)/1000, sc=scrollY;
  /* floor grid anchored to viewport bottom, flows toward viewer */
  const hor=H*.62+py*18, vx=W/2+px*80;
  const g=ctx.createLinearGradient(0,hor,0,H);g.addColorStop(0,'rgba(255,107,0,0)');g.addColorStop(1,'rgba(255,107,0,.20)');
  ctx.strokeStyle=g;ctx.lineWidth=1;ctx.beginPath();
  for(let i=-18;i<=18;i++){const bx=vx+i*W*.12;ctx.moveTo(vx+i*14,hor);ctx.lineTo(bx,H)}
  const off=((t*.35+sc*.0007)%1);
  for(let k=0;k<14;k++){const f=((k+off)/14);const y=hor+Math.pow(f,2.2)*(H-hor);ctx.moveTo(0,y);ctx.lineTo(W,y)}
  ctx.stroke();
  /* sparks */
  ctx.globalCompositeOperation='lighter';
  for(const s of sparks){
   s.y-=s.s*dt*(.7+s.z);s.x+=Math.sin(t*.6+s.p)*.0004;
   if(s.y<-.1){Object.assign(s,spark(false))}
   const sx=W/2+(s.x*W*.6)*(.5+s.z)+px*60*s.z;const sy=s.y*H-sc*.04*s.z+py*30*s.z;
   const a=(.25+.55*s.z)*(.6+.4*Math.sin(t*2+s.p));
   const r=s.r*(.6+s.z);
   const gr=ctx.createRadialGradient(sx,sy,0,sx,sy,r*5);gr.addColorStop(0,`rgba(255,${150+s.z*80|0},60,${a})`);gr.addColorStop(1,'rgba(255,90,0,0)');
   ctx.fillStyle=gr;ctx.beginPath();ctx.arc(sx,sy,r*5,0,6.283);ctx.fill();
  }
  ctx.globalCompositeOperation='source-over';
 }
 requestAnimationFrame(frame);
 document.addEventListener('portfolio:motion',()=>{if(!on())ctx.clearRect(0,0,W,H)});
 onScroll();
})();
