/* Scroll-driven career flow.
   The diagram stays pinned (CSS sticky) while five chapters scroll past. The chapter crossing the
   middle of the viewport selects the stage. State is read with IntersectionObserver; a single
   rAF-throttled scroll listener only writes one CSS variable for the continuous progress rail. */
(() => {
 'use strict';
 const home=document.getElementById('home'),track=document.getElementById('story-track'),studio=document.getElementById('system-studio');
 if(!home||!track||!studio)return;
 const chapters=[...track.querySelectorAll('[data-story-chapter]')];
 const fill=document.getElementById('scroll-progress-fill'),counter=document.getElementById('scroll-story-step'),label=document.getElementById('scroll-story-state');
 if(chapters.length!==5||!fill||!counter||!label)return;
 const wide=matchMedia('(min-width:981px) and (min-height:640px)');
 let stage=-1,frame=0,observer=null;
 const pad=n=>String(n+1).padStart(2,'0');

 function render(n,source){
  if(n===stage)return;
  stage=n;
  studio.dataset.step=String(n);
  chapters.forEach((el,i)=>{el.dataset.current=String(i===n);el.dataset.past=String(i<n);el.setAttribute('aria-pressed',String(i===n))});
  counter.textContent=pad(n)+' / 05';
  home.classList.toggle('story-finished',n===4);
  label.textContent=n===4?'FLOW COMPLETE · FROM FIRST QUESTION TO SHIPPED PRODUCT':'STAGE '+pad(n)+' · KEEP SCROLLING';
  document.dispatchEvent(new CustomEvent('portfolio:section-stage',{detail:{stage:n,source}}));
 }

 function progress(){
  frame=0;
  if(!wide.matches)return;
  const a=chapters[0].getBoundingClientRect(),b=chapters[4].getBoundingClientRect();
  const start=a.top+a.height/2,end=b.top+b.height/2,mid=innerHeight/2;
  const p=Math.max(0,Math.min(1,(mid-start)/Math.max(1,end-start)));
  home.style.setProperty('--story-p',p.toFixed(4));
  fill.style.width=(6+94*p).toFixed(2)+'%';
 }
 const queue=()=>{if(!frame)frame=requestAnimationFrame(progress)};

 function connect(){
  if(observer){observer.disconnect();observer=null}
  if(!wide.matches||!('IntersectionObserver' in window)){fill.style.width=(stage+1)*20+'%';return}
  observer=new IntersectionObserver(entries=>{
   for(const entry of entries)if(entry.isIntersecting)render(Number(entry.target.dataset.storyChapter),'scroll');
  },{rootMargin:'-46% 0px -46% 0px',threshold:0});
  chapters.forEach(el=>observer.observe(el));
  queue();
 }

 // Chapters are also buttons: selecting one moves the diagram (and scrolls on wide screens).
 chapters.forEach((el,i)=>el.addEventListener('click',()=>{
  if(wide.matches)el.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  else render(i,'manual');
 }));
 // Stage chips under the diagram behave the same way.
 track.querySelectorAll('[data-stage]').forEach(el=>el.addEventListener('click',()=>{
  const i=Number(el.dataset.stage);
  if(wide.matches)chapters[i].scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  else render(i,'manual');
 }));
 // Stage changed elsewhere (mode switch, demo player): mirror it on the chapter list.
 document.addEventListener('portfolio:scene',event=>{
  const n=Number(event.detail?.stage);
  if(Number.isInteger(n)&&n>=0&&n<=4&&n!==stage){stage=-1;render(n,'scene')}
 });

 window.addEventListener('scroll',queue,{passive:true});
 window.addEventListener('resize',queue,{passive:true});
 wide.addEventListener('change',connect);
 window.addEventListener('pagehide',()=>{observer?.disconnect();cancelAnimationFrame(frame)},{once:true});
 render(0,'initial');
 connect();
})();
