/* Source-backed career reel; motion optional, no fake employer footage. */
(() => {
 const buttons=[...document.querySelectorAll('[data-vision]')], machine=document.getElementById('vision-machine');
 if(!machine||!buttons.length)return;
 const chapters=[
 ['2025–Present','EzeAD Media Group','Development Team Lead','LEADERSHIP + AI ERA','Engineering direction, team leadership and mobile delivery; AI agents and automation are now a key focus.'],
 ['2023–2025','Pixart Pte. Ltd.','Senior Web & Mobile App Developer','COMMERCE ENGINEERING','Commerce, integrations, content systems and production delivery across client products.'],
 ['2022–Present','MyTechPal','Full Stack Developer','LARAVEL + MOBILE','Laravel, React Native and automated business systems for international clients; this role overlaps later positions.'],
 ['2021–2023','Syntax Software House','Full Stack Web Developer','FULL-STACK PRODUCTS','From discovery to deployment: backend services, interactive frontends and collaboration with delivery teams.'],
 ['2017–2021','The Art Valley + Service Sales','PHP Developer / Data Analyst','WEB SYSTEMS + DATA','Laravel websites, data analysis and operations reporting informed a broader view of product value.'],
 ['2016–2017','Micro Techsoft','Web Developer','CLIENT DELIVERY','Responsive products and practical engineering for small-business requirements.'],
 ['2015–2016','BAM Techsoft','Web Developer','WEB FOUNDATIONS','PHP, databases, Laravel and the foundations of software built for real users.']
 ];
 const ids=['vision-dates','vision-company','vision-role','vision-capability','vision-narrative'];
 const count=document.getElementById('vision-count'),progress=document.getElementById('vision-progress'),theatre=document.getElementById('vision-theatre'),play=document.getElementById('vision-play');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let position=0,playing=false,timer=0,changeTimer=0,inView=true;
 function draw(){chapters[position].forEach((value,i)=>document.getElementById(ids[i]).textContent=value);count.textContent=String(position+1).padStart(2,'0')+' / 07';progress.style.width=(100*(position+1)/chapters.length)+'%';buttons.forEach((button,i)=>{button.classList.toggle('is-current',i===position);if(i===position)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current')})}
 function go(n){position=(n+chapters.length)%chapters.length;clearTimeout(changeTimer);if(reduced.matches){draw();return}theatre.classList.add('is-changing');changeTimer=setTimeout(()=>{draw();theatre.classList.remove('is-changing')},190)}
 function stop(){clearInterval(timer);timer=0;playing=false;play.setAttribute('aria-pressed','false');play.textContent='Play career story ▷'}
 function start(){if(reduced.matches||document.body.classList.contains('motion-off'))return;stop();playing=true;play.setAttribute('aria-pressed','true');play.textContent='Pause story Ⅱ';timer=setInterval(()=>{if(inView&&!document.hidden)go(position+1)},3300)}
 buttons.forEach((button,i)=>button.addEventListener('click',()=>{stop();go(i)}));
 document.getElementById('vision-prev').addEventListener('click',()=>{stop();go(position-1)});
 document.getElementById('vision-next').addEventListener('click',()=>{stop();go(position+1)});
 play.addEventListener('click',()=>playing?stop():start());
 document.addEventListener('portfolio:motion',e=>{if(!e.detail.motion)stop()});
 reduced.addEventListener('change',()=>{if(reduced.matches)stop()});
 if('IntersectionObserver'in window)new IntersectionObserver(e=>{inView=e[0].isIntersecting},{threshold:0}).observe(machine);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&timer){clearInterval(timer);timer=0}else if(!document.hidden&&playing&&!timer)timer=setInterval(()=>{if(inView)go(position+1)},3300)});
 window.addEventListener('pagehide',stop);
 draw();
})();
