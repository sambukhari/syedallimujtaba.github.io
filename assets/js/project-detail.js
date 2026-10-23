/* Shared project-case interactions. Semantic markup stays usable without JS. */
(() => {
 'use strict';
 const root=document.querySelector('.cs-page');
 if(!root)return;
 const $=(query,from=document)=>from.querySelector(query);
 const $$=(query,from=document)=>[...from.querySelectorAll(query)];
 const prefersReduced=matchMedia('(prefers-reduced-motion: reduce)');
 const workflowButtons=$$('[data-workflow-switch]');
 const stageSets=$$('[data-workflow]');
 function activateStage(set,index){
   const buttons=$$('[data-flow-step]',set);
   const target=Math.max(0,Math.min(buttons.length-1,index));
   const selected=buttons[target];
   buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===target)));
   const focus=$('.cs-flow-focus',set);
   const header=$('[data-flow-title]',focus),desc=$('[data-flow-description]',focus);
   // Text is already in the visible source cards: explanations are metadata-derived.
   if(selected&&header){
     header.textContent=$('b',selected)?.textContent||'';
     if(desc)desc.textContent=selected.dataset.flowDetail||desc.textContent;
   }
 }
 workflowButtons.forEach(button=>button.addEventListener('click',()=>{
   const scope=button.dataset.workflowSwitch;
   workflowButtons.forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
   stageSets.forEach(set=>set.hidden=set.dataset.workflow!==scope);
 }));
 stageSets.forEach(set=>$$('[data-flow-step]',set).forEach(button=>button.addEventListener('click',()=>activateStage(set,Number(button.dataset.flowStep)))));
 const scopeButtons=$$('[data-scope-switch]'), search=$('#module-search'),state=$('#module-status'),results=$('#module-results'),empty=$('#module-empty');
 let scope='main';
 const groups=$$('.cs-module-group');
 function filterModules(){
   const query=(search?.value||'').trim().toLocaleLowerCase();
   const status=state?.value||'all';
   let shown=0,total=0;
   for(const group of groups){
     let visible=0;
     for(const module of $$('.cs-module',group)){
       const correctScope=module.dataset.moduleScope===scope;
       if(correctScope)total++;
       const ok=correctScope&&(status==='all'||module.dataset.moduleState===status)&&(!query||(module.dataset.search||'').includes(query));
       module.hidden=!ok;if(ok)visible++;
     }
     group.hidden=group.dataset.groupScope!==scope||visible===0;
     shown+=visible;
   }
   if(results)results.textContent='Showing '+shown+' of '+total+' '+(scope==='core'?'separate-storefront':'main-application')+' modules';
   if(empty)empty.hidden=shown!==0;
 }
 scopeButtons.forEach(button=>button.addEventListener('click',()=>{
   scope=button.dataset.scopeSwitch;
   scopeButtons.forEach(other=>other.setAttribute('aria-pressed',String(button===other)));
   filterModules();
 }));
 search?.addEventListener('input',filterModules);
 state?.addEventListener('change',filterModules);
 filterModules();
 const cards=$$('[data-gallery-open]');
 const modal=$('#case-lightbox'),viewer=$('#case-lightbox-media'),lightTitle=$('#case-lightbox-title'),lightCaption=$('#case-lightbox-caption'),counter=$('#case-lightbox-counter');
 let selected=0,previousFocus=null;
 function renderMedia(index){
   if(!cards.length||!viewer)return;
   selected=(index+cards.length)%cards.length;
   const card=cards[selected],preview=$('.cs-media-frame',card);
   const img=$('img',preview),video=$('video',preview);
   const title=$('strong',card)?.textContent||'Project media';
   const caption=$('small',card)?.textContent||'';
   const node=video?document.createElement('video'):document.createElement('img');
   if(video){node.controls=true;node.playsInline=true;node.preload='metadata';node.src=$('source',video)?.src||video.currentSrc;}
   else{node.src=img?.src||'';node.alt=img?.alt||title;node.decoding='async';}
   viewer.replaceChildren(node);
   if(lightTitle)lightTitle.textContent=title;
   if(lightCaption)lightCaption.textContent=caption;
   if(counter)counter.textContent=(selected+1)+' / '+cards.length;
 }
 function openGallery(index){
   if(!modal||typeof modal.showModal!=='function')return;
   previousFocus=document.activeElement;
   renderMedia(index);
   modal.showModal();
   $('[data-gallery-close]',modal)?.focus();
 }
 cards.forEach(card=>card.addEventListener('click',()=>openGallery(Number(card.dataset.galleryOpen))));
 $('[data-gallery-close]',modal)?.addEventListener('click',()=>modal.close());
 $('[data-gallery-prev]',modal)?.addEventListener('click',()=>renderMedia(selected-1));
 $('[data-gallery-next]',modal)?.addEventListener('click',()=>renderMedia(selected+1));
 modal?.addEventListener('click',(event)=>{if(event.target===modal)modal.close()});
 modal?.addEventListener('close',()=>{const video=$('video',viewer);video?.pause();viewer?.replaceChildren();previousFocus?.focus?.()});
 modal?.addEventListener('keydown',(event)=>{
   if(event.key==='ArrowLeft'){event.preventDefault();renderMedia(selected-1)}
   if(event.key==='ArrowRight'){event.preventDefault();renderMedia(selected+1)}
 });
 if(!prefersReduced.matches&&'IntersectionObserver' in window){
   const observer=new IntersectionObserver(entries=>{
     for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('cs-in-view');observer.unobserve(entry.target);}
   },{rootMargin:'0px 0px -8% 0px',threshold:.12});
   $$('.cs-highlight,.cs-gallery-item,.cs-scope-grid article').forEach(el=>observer.observe(el));
 }
})();
