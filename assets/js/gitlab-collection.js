/* Accessible search/filter for 36 repository cards. Progressive enhancement, no network. */
(() => {
 'use strict';
 for(const root of document.querySelectorAll('.gc-collection')){
   const buttons=[...root.querySelectorAll('[data-filter]')],input=root.querySelector('[data-collection-search]'),cards=[...root.querySelectorAll('.gc-entry')],results=root.querySelector('[data-collection-results]'),empty=root.querySelector('[data-collection-empty]'),expand=root.querySelector('[data-expand-collection]');
   let filter='All',expanded=root.dataset.limit==='0';
   const display=()=>{
     const term=(input?.value||'').trim().toLocaleLowerCase();
     const matched=cards.filter(el=>{
       const card=el.querySelector('.gc-card');
       return (filter==='All'||card?.dataset.cat===filter)&&(!term||(card?.dataset.search||'').includes(term));
     });
     const restrict=!expanded&&!term&&filter==='All';
     let shown=0;
     cards.forEach(el=>{const visible=matched.includes(el)&&(!restrict||shown<Number(root.dataset.limit));el.hidden=!visible;if(visible)shown++});
     if(results)results.textContent=(shown===matched.length?shown+' projects shown':shown+' of '+matched.length+' shown')+' · 36 repositories documented';
     if(empty)empty.hidden=matched.length!==0;
     if(expand){
       expand.hidden=expanded||matched.length<=Number(root.dataset.limit)||!!term||filter!=='All';
       expand.setAttribute('aria-expanded',String(expanded));
     }
   };
   buttons.forEach(button=>button.addEventListener('click',()=>{
     filter=button.dataset.filter;
     buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
     display();
   }));
   input?.addEventListener('input',display);
   expand?.addEventListener('click',()=>{expanded=true;display()});
   display();
 }
})();
