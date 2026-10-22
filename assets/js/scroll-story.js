/* Stage-by-stage portfolio narrative: preview once; follow scroll; never trap scrolling. */
(() => {
 'use strict';
 const story=document.querySelector('#home.story-section');
 const track=document.getElementById('story-track');
 const studio=document.getElementById('system-studio');
 const sticky=story?.querySelector('.story-sticky');
 if(!story||!track||!studio||!sticky)return;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const pinned=window.matchMedia('(min-width: 1024px) and (min-height: 870px)');
 const stages=[...story.querySelectorAll('[data-story-chapter]')];
 const buttons=[...studio.querySelectorAll('[data-stage]')];
 const progress=document.getElementById('scroll-progress-fill');
 const indicator=document.getElementById('scroll-story-step');
 const state=document.getElementById('scroll-story-state');
 let sceneVisible=false,startedPreview=false,previewTimer=0,previewIndex=-1,previewCancelled=false;
 let lastScroll=window.scrollY,raf=0,current=-1,finished=false,manualOverride=false;
 const allowMotion=()=>!reduced.matches&&!document.body.classList.contains('motion-off');
 function updateEnabled(){document.documentElement.classList.toggle('scroll-story-enabled',pinned.matches&&allowMotion());}
 function show(index,source){
  const safe=Math.max(0,Math.min(4,index));
  if(current!==safe){
    current=safe;
    stages.forEach((item,i)=>item.dataset.current=String(i===safe));
    indicator.textContent=String(safe+1).padStart(2,'0')+' / 05';
    document.dispatchEvent(new CustomEvent('portfolio:scroll-stage',{detail:{stage:safe,source}}));
  }
 }
 function stopPreview(){clearTimeout(previewTimer);previewTimer=0;previewCancelled=true;}
 function preview(){
   if(startedPreview||previewCancelled||!allowMotion()||!sceneVisible||document.hidden)return;
   startedPreview=true;
   const frame=()=>{
     if(!allowMotion()||!sceneVisible||document.hidden||previewCancelled){stopPreview();return}
     previewIndex++;
     show(previewIndex,'preview');
     progress.style.width=((previewIndex+1)*20)+'%';
     if(previewIndex>=4){
       story.classList.add('story-finished');
       state.textContent='DEMO COMPLETE — EXPLORE THE PROJECTS';
       studio.classList.remove('scroll-flowing');
       return;
     }
     previewTimer=setTimeout(frame,1650);
   };
   previewTimer=setTimeout(frame,1250);
 }
 function scrollProgress(){
   raf=0;
   updateEnabled();
   const y=window.scrollY;
   const moved=Math.abs(y-lastScroll);
   lastScroll=y;
   if(moved>7){stopPreview();manualOverride=false;}
   const active=pinned.matches&&allowMotion()&&document.documentElement.classList.contains('scroll-story-enabled');
   if(active){
     const rect=track.getBoundingClientRect();
     const distance=Math.max(1,track.offsetHeight-sticky.offsetHeight);
     const value=Math.max(0,Math.min(1,(90-rect.top)/distance));
     const inRange=rect.top<window.innerHeight&&rect.bottom>90;
     if(inRange&&previewCancelled&&!manualOverride){
       show(Math.min(4,Math.floor(value*5)),'scroll');
       progress.style.width=(value*100).toFixed(1)+'%';
       finished=value>=.8;
       story.classList.toggle('story-finished',finished);
       state.textContent=finished?'FLOW COMPLETE — NEXT: REAL PROJECTS':'SCROLL TO FOLLOW EACH ENGINEERING STEP';
     }
     story.dataset.storyActive=String(inRange);
     studio.classList.toggle('scroll-flowing',inRange&&allowMotion()&&!document.hidden);
   } else {
     story.dataset.storyActive=String(sceneVisible);
     studio.classList.toggle('scroll-flowing',sceneVisible&&allowMotion()&&!document.hidden);
     // Mobile/small-window story beats are normal-flow sections, not a pinned carousel.
     // Read visible chapter positions on scroll so no IntersectionObserver timing race
     // can skip an explanation when a reader scrolls quickly.
     if(allowMotion()&&previewCancelled&&!manualOverride){
       const reached=stages.filter(item=>item.getBoundingClientRect().top<window.innerHeight*.52);
       if(reached.length){
         const last=reached[reached.length-1];
         show(Number(last.dataset.storyChapter),'scroll');
         progress.style.width=((Number(last.dataset.storyChapter)+1)*20)+'%';
         story.classList.toggle('story-finished',Number(last.dataset.storyChapter)===4);
       }
     }
   }
 }
 function requestUpdate(){if(!raf)raf=requestAnimationFrame(scrollProgress);}
 // Manual playback and stage controls remain in full control until actual page scrolling.
 story.querySelectorAll('[data-stage],[data-mode],#play-flow').forEach(button=>{
   button.addEventListener('click',()=>{stopPreview();manualOverride=true;studio.classList.remove('scroll-flowing');});
 });
 const observer=new IntersectionObserver(entries=>{
   sceneVisible=entries.some(entry=>entry.isIntersecting);
   if(!sceneVisible){studio.classList.remove('scroll-flowing');stopPreview();}
   else if(!startedPreview&&!previewCancelled)preview();
   requestUpdate();
 },{threshold:0.1});
 observer.observe(studio);
 if(stages.length){
   const mobile=new IntersectionObserver(entries=>{
     if(pinned.matches||!allowMotion())return;
     for(const e of entries)if(e.isIntersecting&&previewCancelled&&!manualOverride)show(Number(e.target.dataset.storyChapter),'scroll');
   },{rootMargin:'-20% 0px -30% 0px',threshold:0.01});
   stages.forEach(el=>mobile.observe(el));
 }
 window.addEventListener('scroll',requestUpdate,{passive:true});
 window.addEventListener('resize',requestUpdate,{passive:true});
 pinned.addEventListener('change',requestUpdate);
 reduced.addEventListener('change',()=>{if(reduced.matches)stopPreview();requestUpdate();});
 document.addEventListener('portfolio:motion',()=>{if(!allowMotion())stopPreview();requestUpdate();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPreview();requestUpdate();});
 window.addEventListener('pagehide',()=>{stopPreview();cancelAnimationFrame(raf);});
 updateEnabled();
 requestUpdate();
})();
