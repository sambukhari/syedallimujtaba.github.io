/* Section-triggered 5-stage illustration. No scroll-driven progression or scroll listeners. */
(() => {
 'use strict';
 const section=document.getElementById('story-track'),studio=document.getElementById('system-studio'),home=document.getElementById('home');
 if(!section||!studio||!home)return;
 const chapters=[...section.querySelectorAll('[data-story-chapter]')];
 const fill=document.getElementById('scroll-progress-fill'),counter=document.getElementById('scroll-story-step'),label=document.getElementById('scroll-story-state');
 if(chapters.length!==5||!fill||!counter||!label)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const lengths=[1150,1170,1220,1480];
 let stage=0,active=false,started=false,completed=false,manual=false,timeout=0,paused=false,visible=false;
 const allowed=()=>!reduced.matches&&!document.body.classList.contains('motion-off')&&!document.hidden;
 function render(n,source='section'){
  stage=Math.max(0,Math.min(4,n));
  studio.dataset.step=String(stage);
  chapters.forEach((button,i)=>{button.dataset.current=String(i===stage);button.setAttribute('aria-pressed',String(i===stage))});
  counter.textContent=String(stage+1).padStart(2,'0')+' / 05';
  fill.style.width=(stage+1)*20+'%';
  home.classList.toggle('story-finished',stage===4);
  document.dispatchEvent(new CustomEvent('portfolio:section-stage',{detail:{stage,source}}));
 }
 function clear(){clearTimeout(timeout);timeout=0;studio.classList.remove('section-flowing')}
 function pause(){active=false;paused=true;clear();if(!completed&&!manual&&started)label.textContent='PAUSED · FLOW RESUMES WHEN VISIBLE'}
 function next(){
  timeout=0;
  if(!active||!allowed()||manual)return;
  if(stage>=4){completed=true;clear();label.textContent='FLOW COMPLETE · FIVE ENGINEERING DECISIONS';return}
  render(stage+1);
  timeout=setTimeout(next,lengths[stage-1]||1200);
 }
 function begin(){
  if(manual||completed)return;
  if(!allowed()){render(started?stage:4);completed=true;label.textContent='WORKFLOW OVERVIEW · REDUCED MOTION';return}
  active=true;paused=false;
  if(!started){started=true;render(0);label.textContent='IN PROGRESS · EXPLORING THE WORKFLOW'}
  else label.textContent='IN PROGRESS · FLOW RESUMED';
  studio.classList.add('section-flowing');
  clearTimeout(timeout);timeout=setTimeout(next,started&&stage>0?lengths[stage-1]:900);
 }
 function manualStage(n){
  manual=true;completed=false;clear();render(n,'manual');label.textContent='MANUAL EXPLORATION · SELECT ANY STAGE';
 }
 chapters.forEach((el,i)=>el.addEventListener('click',()=>manualStage(i)));
 section.querySelectorAll('[data-stage]').forEach(el=>el.addEventListener('click',()=>manualStage(Number(el.dataset.stage)),{capture:true}));
 section.querySelectorAll('[data-mode],#play-flow').forEach(el=>el.addEventListener('click',()=>{manual=true;clear();label.textContent='INTERACTIVE PREVIEW · MANUAL CONTROL'},{capture:true}));
 document.addEventListener('portfolio:scene',event=>{
   const n=Number(event.detail?.stage);
   if(!Number.isInteger(n)||n===stage||n<0||n>4)return;
   stage=n;
   chapters.forEach((button,i)=>{button.dataset.current=String(i===n);button.setAttribute('aria-pressed',String(i===n))});
   counter.textContent=String(n+1).padStart(2,'0')+' / 05';
   fill.style.width=(n+1)*20+'%';
 });
 const observer=('IntersectionObserver' in window)?new IntersectionObserver(entries=>{
  visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.17;
  if(visible){if(!active)begin()}else if(active)pause();
 },{threshold:[0,.18,.3,.5],rootMargin:'0px 0px -5% 0px'}):null;
 if(observer)observer.observe(section);else{render(0);label.textContent='SELECT A STAGE TO EXPLORE'};
 const onMotion=()=>{if(!allowed()){clear();if(active)pause()}else if(visible&&paused&&!manual&&!completed)begin()};
 document.addEventListener('portfolio:motion',onMotion);
 reduced.addEventListener('change',onMotion);
 document.addEventListener('visibilitychange',onMotion);
 window.addEventListener('pagehide',()=>{clear();observer?.disconnect()},{once:true});
 render(0,'initial');
})();
