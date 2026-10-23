/* Shared accessible navigation and footer behavior, no scroll-position animation. */
(() => {
 'use strict';
 const header=document.querySelector('[data-site-header]');
 if(!header)return;
 const toggle=header.querySelector('[data-site-menu]'),nav=header.querySelector('#navigation');
 if(toggle&&nav){
   const close=()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open site navigation')};
   toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close site navigation':'Open site navigation')});
   document.addEventListener('click',event=>{if(!header.contains(event.target))close()});
   document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){close();toggle.focus()}});
   nav.addEventListener('click',event=>{if(event.target.closest('a'))close()});
 }
 // The home application owns the flow/motion toggle; detail pages use this lighter implementation.
 if(!document.getElementById('system-studio')){
   const reduced=matchMedia('(prefers-reduced-motion: reduce)'),button=document.getElementById('motion-toggle');
   if(button){
     const update=value=>{const motion=value&&!reduced.matches;document.body.classList.toggle('motion-off',!motion);button.textContent=reduced.matches?'Reduced motion':motion?'Motion on':'Motion off';button.setAttribute('aria-pressed',String(motion));button.disabled=reduced.matches};
     let enabled=!reduced.matches;update(enabled);
     button.addEventListener('click',()=>{enabled=!enabled;update(enabled)});
     reduced.addEventListener('change',()=>update(enabled));
   }
 }
})();
