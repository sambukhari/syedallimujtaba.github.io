/* Executive portrait: subtle pointer-responsive depth; static for touch and reduced motion. */
(() => {
 'use strict';
 const card=document.getElementById('hero-portrait-card');
 if(!card)return;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const fine=window.matchMedia('(hover: hover) and (pointer: fine)');
 let frame=0,xx=0,yy=0;
 const enabled=()=>fine.matches&&!reduced.matches&&!document.body.classList.contains('motion-off');
 const reset=()=>{cancelAnimationFrame(frame);frame=0;card.style.setProperty('--portrait-x','0deg');card.style.setProperty('--portrait-y','0deg')};
 card.addEventListener('pointermove',(e)=>{
   if(!enabled())return;
   const r=card.getBoundingClientRect();
   const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
   xx=-y*4;yy=x*5;
   if(!frame)frame=requestAnimationFrame(()=>{
     frame=0;card.style.setProperty('--portrait-x',xx.toFixed(2)+'deg');
     card.style.setProperty('--portrait-y',yy.toFixed(2)+'deg');
   });
 },{passive:true});
 card.addEventListener('pointerleave',reset);
 card.addEventListener('pointercancel',reset);
 reduced.addEventListener('change',reset);
 document.addEventListener('portfolio:motion',reset);
 window.addEventListener('pagehide',reset);
})();
