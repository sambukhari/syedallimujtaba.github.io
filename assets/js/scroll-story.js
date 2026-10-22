/* Scroll-driven, not time-driven. Visitors move naturally into Projects. */
(() => {
 'use strict';
 const root=document.querySelector('#home.story-section'),track=document.getElementById('story-track'),studio=document.getElementById('system-studio');
 const chapters=[...document.querySelectorAll('#story-track [data-story-chapter]')];
 const progress=document.getElementById('scroll-progress-fill'),counter=document.getElementById('scroll-story-step'),label=document.getElementById('scroll-story-state');
 if(!root||!track||!studio||chapters.length!==5||!progress||!counter||!label)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let hasScrolled=false,manual=false,active=0,frame=0,motionTimer=0;
 const movingAllowed=()=>!reduced.matches&&!document.body.classList.contains('motion-off');
 function show(index){
   const next=Math.max(0,Math.min(4,index));
   active=next;
   chapters.forEach((el,i)=>el.dataset.current=String(i===next));
   counter.textContent=String(next+1).padStart(2,'0')+' / 05';
   progress.style.width=(20*(next+1))+'%';
   root.classList.toggle('story-finished',next===4);
   label.textContent=next===4?'FLOW COMPLETE — NEXT: PROJECTS':'SCROLL THROUGH THE FIVE STEPS';
   document.dispatchEvent(new CustomEvent('portfolio:scroll-stage',{detail:{stage:next,source:'scroll'}}));
 }
 function measure(){
   frame=0;
   if(!hasScrolled||manual)return;
   let index=0;
   for(const el of chapters)if(el.getBoundingClientRect().top<innerHeight*.64)index=Number(el.dataset.storyChapter);
   show(index);
 }
 function queue(){if(!frame)frame=requestAnimationFrame(measure)}
 function stopMotion(){clearTimeout(motionTimer);studio.classList.remove('scroll-flowing');root.dataset.storyActive='false'}
 function onScroll(){
   hasScrolled=true;manual=false;queue();
   stopMotion();
   const rect=track.getBoundingClientRect();
   if(rect.top<innerHeight&&rect.bottom>0&&movingAllowed()&&!document.hidden){
     studio.classList.add('scroll-flowing');root.dataset.storyActive='true';
     motionTimer=setTimeout(stopMotion,420);
   }
 }
 root.querySelectorAll('[data-stage],[data-mode],#play-flow').forEach(b=>b.addEventListener('click',()=>{manual=true;stopMotion()}));
 window.addEventListener('scroll',onScroll,{passive:true});
 window.addEventListener('resize',queue,{passive:true});
 reduced.addEventListener('change',()=>{if(reduced.matches)stopMotion()});
 document.addEventListener('portfolio:motion',()=>{if(!movingAllowed())stopMotion()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMotion()});
 window.addEventListener('pagehide',()=>{stopMotion();cancelAnimationFrame(frame)});
 chapters[0].dataset.current='true';progress.style.width='20%';counter.textContent='01 / 05';
})();
