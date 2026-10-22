/* Progressive enhancement. Content and direct contact links remain usable offline. */
(() => {
 'use strict';
 const scriptURL=document.currentScript?.src||new URL('assets/js/main.js',document.baseURI).href;
 document.documentElement.classList.add('js');
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 // Intermediate depth layers are cloned once, avoiding repeated SVG markup in the initial document.
 $$('.emblem').forEach(emblem=>{const front=emblem.lastElementChild;for(let i=1;i<8;i++){const layer=front.cloneNode(true);layer.style.setProperty('--layer',String(i));emblem.insertBefore(layer,front);}});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let motion=!reduced.matches,mode='ai',stage=1,turn=0,timer=null,playing=false,awaitingReview=false;
 const studio=$('#system-studio'), flow=$('#play-flow');
 const descriptions={
  ai:[['Start with a clear intent.','A useful workflow begins with a defined task, its constraints and the person who needs the result.'],['Intelligence, with a purpose.','An agent coordinates the workflow. APIs connect the tools. People stay in control.'],['Connect the right tools.','APIs and structured data turn an isolated model into a useful part of a larger system.'],['A human checkpoint.','Review the proposed action before a consequential step. This model illustrates a design principle, not a live agent.'],['A result people can use.','Deliver the outcome through a web interface or mobile app, with a clear handoff and understandable state.']],
  web:[['Begin with the user.','A web product starts with a clear user need and a well-defined interaction.'],['Coordinate the application.','Application logic connects the interface, API contracts and business workflows.'],['Make the boundaries clear.','Laravel APIs and relational data models connect the product to its underlying systems.'],['Make state visible.','Validation, review and recoverable errors help people understand what is happening.'],['Ship a useful interface.','React interfaces bring the workflow together in a product people can navigate.']],
  mobile:[['Understand the moment.','Design for a person using a small screen, often with limited time or connectivity.'],['Connect the experience.','Coordinate mobile interactions with application logic and backend services.'],['Share reliable contracts.','APIs connect the mobile product with the same backend and data used by the web experience.'],['Design the handoff.','Make important actions reviewable and error states understandable on a small screen.'],['Bring the product with you.','React Native connects the workflow to an Android and iOS experience.']]
 };
 function setStage(n,announce=true){stage=Math.max(0,Math.min(4,n));studio.dataset.step=String(stage);const [title,description]=descriptions[mode][stage];$('#stage-number').textContent=String(stage+1).padStart(2,'0');$('#stage-title').textContent=title;$('#stage-description').textContent=description;$$('[data-stage]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.stage)===stage)));if(announce)$('#model-status').textContent=title+' '+description;document.dispatchEvent(new CustomEvent('portfolio:scene',{detail:{mode,stage,turn,motion}}));}
 function stopFlow(){clearTimeout(timer);timer=null;playing=false;awaitingReview=false;studio.classList.remove('flow-playing');flow.textContent='Play the flow \u25b7';}
 function atReview(){playing=false;awaitingReview=true;studio.classList.remove('flow-playing');setStage(3);flow.textContent='Approve in demo \u2192';}
 function advance(){if(!playing)return;if(document.hidden)return;if(stage>=2){atReview();return;}setStage(stage+1);timer=setTimeout(advance,1100);}
 flow.addEventListener('click',()=>{if(awaitingReview){awaitingReview=false;setStage(4);flow.textContent='Replay the flow \u21bb';$('#model-status').textContent='Approved in this conceptual demonstration. No external action was performed.';return;}if(playing){stopFlow();return;}stopFlow();if(!motion){atReview();return;}setStage(0);playing=true;studio.classList.add('flow-playing');flow.textContent='Pause flow';timer=setTimeout(advance,1100);});
 $$('[data-stage]').forEach(b=>b.addEventListener('click',()=>{stopFlow();setStage(Number(b.dataset.stage));}));
 $$('.segmented [data-mode]').forEach(b=>b.addEventListener('click',()=>{stopFlow();mode=b.dataset.mode;studio.dataset.mode=mode;$$('.segmented [data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));setStage(mode==='mobile'?4:mode==='web'?2:1);}));
 $('#rotate-model').addEventListener('click',()=>{turn=turn===0?14:turn===14?-14:0;$('.model-assembly').style.setProperty('--turn',turn+'deg');setStage(stage,false);$('#model-status').textContent='Model angle changed.';});
 const motionButton=$('#motion-toggle');
 function setMotion(value){motion=value&&!reduced.matches;document.body.classList.toggle('motion-off',!motion);motionButton.setAttribute('aria-pressed',String(motion));motionButton.textContent=reduced.matches?'Reduced motion':motion?'Motion on':'Motion off';motionButton.disabled=reduced.matches;if(!motion)stopFlow();document.dispatchEvent(new CustomEvent('portfolio:motion',{detail:{motion}}));setStage(stage,false);}
 motionButton.addEventListener('click',()=>setMotion(!motion));reduced.addEventListener('change',()=>setMotion(!reduced.matches));setMotion(motion);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing){clearTimeout(timer);timer=null;}else if(playing&&!timer)timer=setTimeout(advance,600);});
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&playing)stopFlow();},{threshold:0}).observe(studio);
 const menu=$('.menu-toggle'),nav=$('#navigation');
 function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}
 menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
 nav.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const wasOpen=nav.classList.contains('open');closeMenu();if(wasOpen&&a.hash){const target=$(a.hash);target?.setAttribute('tabindex','-1');target?.focus({preventScroll:true});}});
 document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
 const skills=$$('.skill');
 $$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{const filter=b.dataset.filter;skills.forEach(s=>s.hidden=filter!=='all'&&s.dataset.category!==filter);$$('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#skill-status').textContent=`${skills.filter(s=>!s.hidden).length} technologies and capabilities shown.`;document.dispatchEvent(new Event('portfolio:layout'));}));
 async function copy(text){if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(text);}
 $('#copy-email').addEventListener('click',async()=>{try{await copy('syedallimujtaba@gmail.com');$('#copy-status').textContent='Email address copied.';}catch{$('#copy-status').textContent='Copy unavailable. Select the address above or open the email link.';}});
 const form=$('#contact-form'),status=$('#form-status'),fallback=$('#copy-fallback');
 function inquiry(){for(const [selector,min,label] of [['#inquiry-name',2,'Please enter your name.'],['#inquiry-message',15,'Please describe your project in at least 15 characters.']]){const field=$(selector);field.setCustomValidity(field.value.trim().length<min?label:'');}if(!form.reportValidity())return null;const d=new FormData(form),name=String(d.get('name')).trim().replace(/[\r\n]+/g,' '),email=String(d.get('email')).trim().replace(/[\r\n]+/g,' '),type=String(d.get('type'));return {subject:type+' inquiry from '+name,body:`Hi Ali,\n\n${String(d.get('message')).trim()}\n\nName: ${name}\nEmail: ${email}\nInterested in: ${type}`};}
 form.addEventListener('input',e=>{if(e.target.setCustomValidity)e.target.setCustomValidity('');});
 form.addEventListener('submit',e=>{e.preventDefault();const d=inquiry();if(!d)return;const href='mailto:syedallimujtaba@gmail.com?subject='+encodeURIComponent(d.subject)+'&body='+encodeURIComponent(d.body);status.textContent='Email draft requested. Review and send it in your email app. Nothing was sent by this website. If no app opens, use Copy message.';location.href=href;});
 $('#copy-inquiry').addEventListener('click',async()=>{const d=inquiry();if(!d)return;const text=`To: syedallimujtaba@gmail.com\nSubject: ${d.subject}\n\n${d.body}`;try{await copy(text);fallback.hidden=true;status.textContent='Message copied. Paste it into your email app and send it to Ali.';}catch{fallback.value=text;fallback.hidden=false;fallback.focus();fallback.select();status.textContent='Clipboard access is unavailable. Your message is selected below; copy it manually.';}});
 // WebGL is progressive enhancement; a CDN/network failure leaves all CSS-3D and content intact.
 let loadTimeout;
 const load=()=>{
  if(new URLSearchParams(location.search).has('no3d'))return;
  Promise.race([import(new URL('scene.js',scriptURL).href),new Promise((_,reject)=>{loadTimeout=setTimeout(()=>reject(Error('3D enhancement load timeout')),9000);})])
   .then(module=>{clearTimeout(loadTimeout);return module.mountScenes({motion,mode,stage,turn});})
   .catch(()=>{clearTimeout(loadTimeout);document.documentElement.dataset.renderer='css-3d';});
 };
 if('requestIdleCallback'in window)requestIdleCallback(load,{timeout:2000});else setTimeout(load,400);
})();
