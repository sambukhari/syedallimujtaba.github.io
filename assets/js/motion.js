/* Site-wide motion layer. Transform/opacity only, one rAF loop per effect, no layout reads in hot paths.
   Everything respects prefers-reduced-motion and the visitor's "Motion on/off" toggle. */
(() => {
 'use strict';
 const root=document.documentElement,body=document.body;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
 const allowed=()=>!reduced.matches&&!body.classList.contains('motion-off');
 root.classList.add('fx');

 /* 1. Scroll progress bar + header state ------------------------------------------------ */
 const bar=document.createElement('div');bar.className='fx-progress';bar.setAttribute('aria-hidden','true');bar.innerHTML='<span></span>';
 body.prepend(bar);
 const header=document.querySelector('[data-site-header]');
 let ticking=false,lastY=scrollY;
 function onScroll(){
  ticking=false;
  const max=Math.max(1,root.scrollHeight-innerHeight),y=scrollY;
  bar.firstChild.style.transform='scaleX('+Math.min(1,y/max).toFixed(4)+')';
  if(header){
   header.classList.toggle('is-scrolled',y>12);
   const down=y>lastY+4&&y>260,up=y<lastY-4;
   if(down&&!header.classList.contains('is-hidden')&&!document.querySelector('[data-site-menu][aria-expanded="true"]'))header.classList.add('is-hidden');
   else if(up||y<260)header.classList.remove('is-hidden');
  }
  lastY=y;
 }
 addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
 onScroll();

 /* 2. Reveal on view --------------------------------------------------------------------- */
 const revealSel='[data-reveal],.cs-section,.cs-hero-copy,.cs-hero-visual,.gc-module,.cs-module,.cs-feature,.cs-step,.cs-card,.universal-footer-main';
 const targets=[...document.querySelectorAll(revealSel)].filter(el=>!el.closest('.premium-pending,.premium-revealed'));
 if('IntersectionObserver' in window){
  const io=new IntersectionObserver(items=>{for(const it of items){if(!it.isIntersecting)continue;it.target.classList.add('fx-in');io.unobserve(it.target)}},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  targets.forEach((el,i)=>{el.classList.add('fx-reveal');if(!el.style.getPropertyValue('--i'))el.style.setProperty('--i',String(i%4));io.observe(el)});
 }

 /* 3. Counters + bars --------------------------------------------------------------------- */
 const ease=t=>1-Math.pow(1-t,4);
 function count(el){
  const end=Number(el.dataset.count);if(!Number.isFinite(end))return;
  if(!allowed()){el.textContent=String(end);return}
  const t0=performance.now(),dur=1400+Math.min(900,end*8);
  el.textContent='0';
  (function step(now){const p=Math.min(1,(now-t0)/dur);el.textContent=String(Math.round(end*ease(p)));if(p<1)requestAnimationFrame(step)})(t0);
 }
 const meters=document.querySelectorAll('[data-count],[data-bar]');
 if(meters.length&&'IntersectionObserver' in window){
  document.querySelectorAll('[data-count]').forEach(el=>{if(allowed())el.textContent='0'});
  const mo=new IntersectionObserver(items=>{for(const it of items){if(!it.isIntersecting)continue;const el=it.target;
   if(el.hasAttribute('data-count'))count(el);
   if(el.hasAttribute('data-bar'))el.classList.add('is-full');
   mo.unobserve(el)}},{threshold:.4});
  meters.forEach(el=>mo.observe(el));
 }else document.querySelectorAll('[data-bar]').forEach(el=>el.classList.add('is-full'));

 /* 4. Hero headline: word-by-word rise ----------------------------------------------------- */
 const h1=document.getElementById('hero-title');
 if(h1&&allowed()&&!h1.dataset.split){
  h1.dataset.split='1';let n=0;
  const walk=node=>{[...node.childNodes].forEach(c=>{
   if(c.nodeType===3){const frag=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(w=>{if(!w)return;if(/^\s+$/.test(w)){frag.append(w);return}
     const o=document.createElement('span');o.className='fx-word';const i=document.createElement('span');i.textContent=w;i.style.setProperty('--w',String(n++));o.append(i);frag.append(o)});c.replaceWith(frag)}
   else if(c.nodeType===1&&c.tagName!=='BR')walk(c)})};
  const label=h1.textContent.replace(/\s+/g,' ').trim();h1.setAttribute('aria-label',label);walk(h1);
  h1.querySelectorAll('.fx-word').forEach(w=>w.setAttribute('aria-hidden','true'));
  requestAnimationFrame(()=>h1.classList.add('fx-split-in'));
 }

 /* 5. Pointer effects: spotlight glow, tilt and magnetic buttons --------------------------- */
 if(finePointer.matches){
  const cards=document.querySelectorAll('.case-feature,.project,.gc-entry,.skill,.proof-card,.cs-module,.gc-module');
  cards.forEach(card=>{
   const glow=document.createElement('span');glow.className='fx-glow';glow.setAttribute('aria-hidden','true');card.append(glow);
   if(getComputedStyle(card).position==='static')card.style.position='relative';
   let f=0,ev=null;
   const apply=()=>{f=0;if(!ev||!allowed())return;const r=card.getBoundingClientRect(),x=ev.clientX-r.left,y=ev.clientY-r.top;
    card.style.setProperty('--mx',x+'px');card.style.setProperty('--my',y+'px');
    if(card.matches('.proof-card,.skill-featured,.project')){card.style.setProperty('--rx',((.5-y/r.height)*5).toFixed(2)+'deg');card.style.setProperty('--ry',((x/r.width-.5)*6).toFixed(2)+'deg')}};
   card.addEventListener('pointermove',e=>{ev=e;if(!f)f=requestAnimationFrame(apply)});
   card.addEventListener('pointerenter',()=>card.classList.add('fx-hot'));
   card.addEventListener('pointerleave',()=>{card.classList.remove('fx-hot');card.style.removeProperty('--rx');card.style.removeProperty('--ry')});
  });
  document.querySelectorAll('.button,.universal-nav-cta,.hero-actions a,.nav-cta').forEach(btn=>{
   btn.classList.add('fx-magnet');
   btn.addEventListener('pointermove',e=>{if(!allowed())return;const r=btn.getBoundingClientRect();
    btn.style.setProperty('--tx',((e.clientX-r.left-r.width/2)*.18).toFixed(1)+'px');btn.style.setProperty('--ty',((e.clientY-r.top-r.height/2)*.28).toFixed(1)+'px')});
   btn.addEventListener('pointerleave',()=>{btn.style.setProperty('--tx','0px');btn.style.setProperty('--ty','0px')});
  });
 }

 /* 6. Hero portrait parallax (home only) --------------------------------------------------- */
 const portrait=document.getElementById('hero-portrait-card');
 if(portrait){
  let f=0;
  addEventListener('scroll',()=>{if(f||!allowed())return;f=requestAnimationFrame(()=>{f=0;const y=Math.min(scrollY,700);portrait.style.setProperty('--py',(y*-.06).toFixed(1)+'px')})},{passive:true});
 }

 /* 7. Smooth page entry / exit ------------------------------------------------------------- */
 body.classList.add('fx-ready');
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href]');
  if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target||a.hasAttribute('download'))return;
  const url=new URL(a.href,location.href);
  if(url.origin!==location.origin||url.pathname===location.pathname||!allowed())return;
  if(!/\.html?$|\/$/.test(url.pathname))return;
  e.preventDefault();body.classList.add('fx-leaving');
  setTimeout(()=>{location.href=url.href},220);
 });
 addEventListener('pageshow',e=>{if(e.persisted)body.classList.remove('fx-leaving')});
 document.addEventListener('portfolio:motion',()=>{if(!allowed())document.querySelectorAll('[data-count]').forEach(el=>{el.textContent=el.dataset.count})});
})();
