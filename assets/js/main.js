/* Progressive enhancement. Content and direct contact links remain usable offline. */
(() => {
 'use strict';
 const scriptURL=document.currentScript?.src||new URL('assets/js/main.js',document.baseURI).href;
 document.documentElement.classList.add('js');
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 // Intermediate depth layers are cloned once, avoiding repeated SVG markup in the initial document.
 $$('.emblem').forEach(emblem=>{const front=emblem.lastElementChild;for(let i=1;i<8;i++){const layer=front.cloneNode(true);layer.style.setProperty('--layer',String(i));emblem.insertBefore(layer,front);}});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let motion=!reduced.matches,mode='ai',stage=0,turn=0,timer=null,playing=false,awaitingReview=false;
 const studio=$('#system-studio'), flow=$('#play-flow');
 const descriptions={
  ai:[['Understand the problem first.','Years as a data analyst and client-facing developer taught me to turn vague requests into clear requirements before any code exists.'],['Design the system, not just the screen.','Laravel domain models, token-based APIs and role-aware access form the foundation. AI agents are added where they remove repetitive work.'],['Build across web and mobile.','React interfaces and React Native apps share the same API contracts, so one backend serves every screen.'],['Integrate, then verify.','Payments, push notifications and chat plug into the product, with a human approval step before any consequential automated action. This model illustrates the principle, not a live agent.'],['Lead and ship.','Today as Development Team Lead at EzeAD Media Group: architecture, cross-functional delivery and release workflows, with AI agents and automation as the current focus.']],
  web:[['Start from the user need.','Map the workflow, the roles and the data a web product has to hold before choosing a single component.'],['Model the domain.','Laravel and relational schemas for roles, bookings, listings and memberships: the patterns behind the reviewed projects.'],['Build the interface.','Blade, Inertia and React front ends over clear REST endpoints.'],['Connect and check.','Stripe payments, social login and email alerts, with validation and recoverable errors people can understand.'],['Release with confidence.','Ship, observe and iterate, leaving documentation the next engineer can use.']],
  mobile:[['Design for the moment.','A person on a small screen, often with limited time or connectivity.'],['Share one backend.','Sanctum-secured APIs serve the mobile product and the web experience from the same data.'],['Build with React Native and Expo.','One codebase for Android and iOS, with Redux-style state and typed navigation.'],['Integrate device services.','Push notifications through Firebase, payments with the Stripe SDK, and clear error states.'],['Take it to the stores.','Mobile delivery and release workflows, from build to store.']]
 };

 function setStage(n,announce=true){stage=Math.max(0,Math.min(4,n));studio.dataset.step=String(stage);const [title,description]=descriptions[mode][stage];$('#stage-number').textContent=String(stage+1).padStart(2,'0');$('#stage-title').textContent=title;$('#stage-description').textContent=description;$$('[data-stage]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.stage)===stage)));if(announce)$('#model-status').textContent=title+' '+description;document.dispatchEvent(new CustomEvent('portfolio:scene',{detail:{mode,stage,turn,motion}}));}
 function stopFlow(){clearTimeout(timer);timer=null;playing=false;awaitingReview=false;studio.classList.remove('flow-playing');flow.textContent='Play the flow \u25b7';}
 function atReview(){playing=false;awaitingReview=true;studio.classList.remove('flow-playing');setStage(3);flow.textContent='Approve in demo \u2192';}
 function advance(){if(!playing)return;if(document.hidden)return;if(stage>=2){atReview();return;}setStage(stage+1);timer=setTimeout(advance,1100);}
 flow.addEventListener('click',()=>{if(awaitingReview){awaitingReview=false;setStage(4);flow.textContent='Replay the flow \u21bb';$('#model-status').textContent='Approved in this conceptual demonstration. No external action was performed.';return;}if(playing){stopFlow();return;}stopFlow();if(!motion){atReview();return;}setStage(0);playing=true;studio.classList.add('flow-playing');flow.textContent='Pause flow';timer=setTimeout(advance,1100);});
 $$('[data-stage]').forEach(b=>b.addEventListener('click',()=>{stopFlow();setStage(Number(b.dataset.stage));}));
 document.addEventListener('portfolio:section-stage',event=>{
   const index=Number(event.detail?.stage);
   if(!Number.isInteger(index)||index<0||index>4)return;
   if(playing||awaitingReview)stopFlow();
   // The section-triggered illustration is explanatory only and never executes a real action.
   if(index!==stage)setStage(index,false);
 });
 $$('.segmented [data-mode]').forEach(b=>b.addEventListener('click',()=>{stopFlow();mode=b.dataset.mode;studio.dataset.mode=mode;$$('.segmented [data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));setStage(mode==='mobile'?4:mode==='web'?2:1);}));
 $('#rotate-model').addEventListener('click',()=>{turn=turn===0?14:turn===14?-14:0;$('.model-assembly').style.setProperty('--turn',turn+'deg');setStage(stage,false);$('#model-status').textContent='Model angle changed.';});
 const motionButton=$('#motion-toggle');
 function setMotion(value){motion=value&&!reduced.matches;document.body.classList.toggle('motion-off',!motion);motionButton.setAttribute('aria-pressed',String(motion));motionButton.textContent=reduced.matches?'Reduced motion':motion?'Motion on':'Motion off';motionButton.disabled=reduced.matches;if(!motion)stopFlow();document.dispatchEvent(new CustomEvent('portfolio:motion',{detail:{motion}}));setStage(stage,false);}
 motionButton.addEventListener('click',()=>setMotion(!motion));reduced.addEventListener('change',()=>setMotion(!reduced.matches));setMotion(motion);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing){clearTimeout(timer);timer=null;}else if(playing&&!timer)timer=setTimeout(advance,600);});
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&playing)stopFlow();},{threshold:0}).observe(studio);
 // Shared navigation is owned by assets/js/site-shell.js on every page.
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
