/* v7.1: smooth motion layer. One rAF loop for ambience, one IntersectionObserver for reveals, no scroll-time layout reads. */
(() => {
 'use strict';
 const root=document.documentElement, body=document.body;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const fine=matchMedia('(hover: hover) and (pointer: fine)');
 const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
 const on=()=>!reduced.matches&&!body.classList.contains('motion-off');
 root.classList.add('v7');

 /* ---- word-mask split (keeps <em>/<br>; original text stays in aria-label) ---- */
 function split(el,base){
  if(!el||el.dataset.v7split)return;el.dataset.v7split='1';
  el.setAttribute('aria-label',el.textContent.replace(/\s+/g,' ').trim());
  let i=0;
  const walk=n=>[...n.childNodes].forEach(c=>{
   if(c.nodeType===3){
    const f=document.createDocumentFragment();
    c.textContent.split(/(\s+)/).forEach(t=>{
     if(!t)return;
     if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(' '));return}
     const w=document.createElement('span');w.className='w';w.setAttribute('aria-hidden','true');
     const wi=document.createElement('span');wi.className='wi';wi.style.setProperty('--i',i++);wi.textContent=t;w.appendChild(wi);f.appendChild(w);
    });
    c.replaceWith(f);
   }else if(c.nodeType===1&&c.tagName!=='BR')walk(c);
  });
  walk(el);el.style.setProperty('--base',(base||0)+'ms');
 }
 const h1=$('#hero-title');split(h1,100);
 $$('.section-heading h2,.approach-grid h2,.about-copy h2,.contact-copy h2').forEach(h=>split(h,0));

 /* ---- entrance ---- */
 let started=false;
 const start=()=>{if(started)return;started=true;body.classList.add('loaded');h1&&h1.classList.add('split-in')};
 requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(start,80)));
 setTimeout(start,1200);

 /* ---- reveals: observed once, then the helper class is removed so nothing lingers ---- */
 const sel=['.project','.skill','.professional-work','.approach-notes article','.vision-machine','.vision-stop','.about-layout>*','.inquiry','.contact-copy>*:not(h2)','.section-heading>p','.skill-filters'];
 const targets=new Set();sel.forEach(s=>$$(s).forEach(e=>targets.add(e)));
 const counts=new Map();
 targets.forEach(e=>{
  e.classList.add('reveal');
  const p=e.parentElement,n=counts.get(p)||0;counts.set(p,n+1);
  e.style.setProperty('--d',Math.min(n%6,5)*60+'ms');
 });
 const done=e=>setTimeout(()=>{e.classList.remove('reveal','in');e.style.removeProperty('--d')},1500);
 const io=new IntersectionObserver(es=>es.forEach(en=>{
  if(!en.isIntersecting)return;
  en.target.classList.add('in');io.unobserve(en.target);
  if(en.target.classList.contains('reveal'))done(en.target);
 }),{threshold:.1,rootMargin:'0px 0px -5% 0px'});
 targets.forEach(e=>io.observe(e));
 $$('.section-top,.section-heading h2,.approach-grid h2,.about-copy h2,.contact-copy h2').forEach(e=>io.observe(e));

 /* ---- scroll progress (transform only, no layout reads) ---- */
 const bar=document.createElement('div');bar.className='v7-progress';bar.setAttribute('aria-hidden','true');body.appendChild(bar);
 let tick=false,docH=0;
 const measureDoc=()=>{docH=Math.max(1,root.scrollHeight-innerHeight)};
 const paintBar=()=>{tick=false;bar.style.transform=`scaleX(${Math.min(1,scrollY/docH).toFixed(4)})`};
 addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(paintBar)}},{passive:true});
 addEventListener('resize',()=>{measureDoc();paintBar()});
 addEventListener('load',()=>{measureDoc();paintBar()});
 measureDoc();paintBar();

 /* ---- skills marquee: two identical groups, duration from measured width => constant, seamless speed ---- */
 const strip=$('.discipline-strip');
 if(strip){
  const base=$$('.wrap>span',strip).map(s=>s.textContent.trim());
  if(base.length){
   const items=[...base,'Laravel','React Native','Automation','Product thinking'];
   const track=document.createElement('div');track.className='v7-marquee';track.setAttribute('aria-hidden','true');
   const mk=()=>{const g=document.createElement('div');g.className='v7-group';
    for(let k=0;k<2;k++)items.forEach(x=>{const s=document.createElement('span');s.textContent=x;g.appendChild(s)});return g};
   track.append(mk(),mk());strip.appendChild(track);$('.wrap',strip).classList.add('sr-hidden');
   const speed=()=>{const w=track.firstChild.getBoundingClientRect().width;if(w)track.style.setProperty('--dur',(w/60).toFixed(1)+'s')};
   speed();addEventListener('load',speed);addEventListener('resize',speed);
   if(document.fonts&&document.fonts.ready)document.fonts.ready.then(speed);
   if('IntersectionObserver' in window)new IntersectionObserver(es=>es.forEach(e=>{track.style.animationPlayState=e.isIntersecting?'':'paused'})).observe(strip);
  }
 }

 /* ---- hero portrait: gyroscope + tags ---- */
 const fig=$('.hero-portrait');
 if(fig){
  const g=document.createElement('div');g.className='v7-gyro';g.setAttribute('aria-hidden','true');g.innerHTML='<div class="v7-gyro-in"><i><b></b></i><i><b></b></i></div>';fig.prepend(g);
  [['c1','⚡','Laravel systems'],['c2','✦','AI agents'],['c3','◈','React Native']].forEach(([c,ic,tx])=>{
   const d=document.createElement('div');d.className='v7-chip '+c;d.setAttribute('aria-hidden','true');d.innerHTML=`<b>${ic}</b>${tx}`;fig.appendChild(d);
  });
  const gi=$('.v7-gyro-in',g);let r0=null,hraf=0,gx=0,gy=0;
  const rect=()=>{r0=fig.getBoundingClientRect()};
  $('#home').addEventListener('pointermove',e=>{
   if(!fine.matches||!on())return;
   rect();gx=-((e.clientY-(r0.top+r0.height/2))/innerHeight)*22;gy=((e.clientX-(r0.left+r0.width/2))/innerWidth)*30;
   if(!hraf)hraf=requestAnimationFrame(()=>{hraf=0;gi.style.setProperty('--gx',gx.toFixed(1)+'deg');gi.style.setProperty('--gy',gy.toFixed(1)+'deg')});
  },{passive:true});
 }

 /* ---- pause decorative loops while off-screen ---- */
 const pauser=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('v7-paused',!e.isIntersecting)),{rootMargin:'80px'});
 [fig,$('.contact-section'),$('.vision-machine')].forEach(e=>e&&pauser.observe(e));
 const featured=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('in-view',e.isIntersecting)),{rootMargin:'0px'});
 $$('.skill-featured').forEach(e=>featured.observe(e));

 /* ---- contact cube ---- */
 const cs=$('.contact-section');
 if(cs){const w=document.createElement('div');w.className='v7-cubewrap';w.setAttribute('aria-hidden','true');w.innerHTML='<div class="v7-cube"><i></i><i></i><i></i><i></i><i><b></b></i><i><b></b></i></div>';cs.prepend(w)}

 /* ---- hover tilt + glare (rect cached on enter, writes batched in rAF) ---- */
 function bindTilt(el,max){
  el.classList.add('v7-card');
  let rect=null,raf=0,nx=0,ny=0,mx=0,my=0;
  const apply=()=>{raf=0;el.style.setProperty('--rx',(-ny*max).toFixed(2)+'deg');el.style.setProperty('--ry',(nx*max).toFixed(2)+'deg');el.style.setProperty('--mx',mx+'px');el.style.setProperty('--my',my+'px')};
  el.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')rect=el.getBoundingClientRect()});
  el.addEventListener('pointermove',e=>{
   if(e.pointerType==='touch'||!fine.matches||!on())return;
   if(!rect)rect=el.getBoundingClientRect();
   mx=e.clientX-rect.left;my=e.clientY-rect.top;nx=mx/rect.width-.5;ny=my/rect.height-.5;
   el.classList.add('tilting');if(!raf)raf=requestAnimationFrame(apply);
  },{passive:true});
  el.addEventListener('pointerleave',()=>{rect=null;nx=ny=0;el.classList.remove('tilting');el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg')});
 }
 if(fine.matches){
  $$('.project').forEach(e=>bindTilt(e,2));
  $$('.skill').forEach(e=>bindTilt(e,5));
  $$('.vision-stop').forEach(e=>bindTilt(e,2.5));
 }

 /* ---- magnetic buttons (subtle) ---- */
 if(fine.matches)$$('.button').forEach(b=>{
  let r=null;
  b.addEventListener('pointerenter',()=>{r=b.getBoundingClientRect()});
  b.addEventListener('pointermove',e=>{if(!on()||!r)return;b.style.transform=`translate(${((e.clientX-r.left)/r.width-.5)*6}px,${((e.clientY-r.top)/r.height-.5)*5}px)`},{passive:true});
  b.addEventListener('pointerleave',()=>{r=null;b.style.transform=''});
 });

 /* ---- cursor glow ---- */
 if(fine.matches){
  const glow=document.createElement('div');glow.className='v7-cursor';glow.setAttribute('aria-hidden','true');body.appendChild(glow);
  let tx=0,ty=0,cx=0,cy=0,run=false;
  const loop=()=>{cx+=(tx-cx)*.12;cy+=(ty-cy)*.12;glow.style.transform=`translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
   if(Math.abs(tx-cx)+Math.abs(ty-cy)>.5)requestAnimationFrame(loop);else run=false};
  addEventListener('pointermove',e=>{if(e.pointerType==='touch'||!on())return;tx=e.clientX;ty=e.clientY;glow.classList.add('on');if(!run){run=true;requestAnimationFrame(loop)}},{passive:true});
  document.addEventListener('pointerleave',()=>glow.classList.remove('on'));
 }

})();
