/* Deliberate, one-time reveal on section visibility. No scroll progress bar or parallax. */
(() => {
 'use strict';
 if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 document.documentElement.classList.add('premium-reveal-ready');
 const selectors=['.premium-work-heading','.case-feature','.project-grid>.project','.gc-collection-head','.gc-entry','.section-heading','.skill-featured','.vision-machine','.vision-timeline','.about-layout','.contact-layout'];
 const targets=[...new Set(selectors.flatMap(selector=>[...document.querySelectorAll(selector)]))];
 const observer=new IntersectionObserver(entries=>{
  for(const item of entries){
   if(!item.isIntersecting)continue;
   item.target.classList.remove('premium-pending');
   item.target.classList.add('premium-revealed');
   observer.unobserve(item.target);
  }
 },{threshold:.06,rootMargin:'0px 0px -3% 0px'});
 targets.forEach((node,i)=>{
  node.classList.add('premium-pending');
  node.style.setProperty('--reveal-delay',Math.min(i%3,2)*55+'ms');
  observer.observe(node);
 });
 document.addEventListener('portfolio:motion',event=>{
  if(event.detail?.motion)return;
  observer.disconnect();
  targets.forEach(node=>node.classList.remove('premium-pending'));
 });
})();
