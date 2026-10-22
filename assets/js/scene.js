/* Three.js r180. One WebGL context, scissored views, genuine extruded SVG emblems. */
import * as THREE from 'three';
import {SVGLoader} from 'three/addons/loaders/SVGLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

export async function mountScenes(initial={}) {
 const canvas=document.createElement('canvas');canvas.className='shared-3d';canvas.setAttribute('aria-hidden','true');
 let renderer;
 try {renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});}catch {throw new Error('WebGL unavailable; CSS-3D retained');}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<700?1.25:1.5));renderer.setSize(innerWidth,innerHeight,false);renderer.setClearColor(0,0);renderer.autoClear=false;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 const pmrem=new THREE.PMREMGenerator(renderer), room=new RoomEnvironment(), environment=pmrem.fromScene(room,.04);room.dispose();pmrem.dispose();
 const entries=[],geometryCache=new Map(),skillCache=new Map(),textures=new Set();let frame=0,disposed=false,motion=!!initial.motion,dragging=false;
 const state={mode:initial.mode||'ai',stage:initial.stage??1,turn:initial.turn||0};
 const resources=new Set();const addResource=r=>(resources.add(r),r);
 const material=(color,metalness=.35,roughness=.35)=>addResource(new THREE.MeshPhysicalMaterial({color,metalness,roughness,clearcoat:.5,clearcoatRoughness:.28}));
 function block(w,h,d,mat,r=Math.min(w,h,.24)/3){
  const key=[w,h,d,r].join('/');let geo=geometryCache.get(key);
  if(!geo){const x=-w/2,y=-h/2,s=new THREE.Shape();s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);geo=addResource(new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:Math.min(r,.05),bevelThickness:.025,curveSegments:5}));geo.translate(0,0,-d/2);geometryCache.set(key,geo);}
  return new THREE.Mesh(geo,mat);
 }
 const place=(parent,obj,x,y,z)=>{obj.position.set(x,y,z);parent.add(obj);return obj;};
 function lighting(scene){scene.environment=environment.texture;scene.add(new THREE.HemisphereLight(0xffe0c6,0x20100b,2));const key=new THREE.DirectionalLight(0xffa766,3.2);key.position.set(-4,8,6);scene.add(key);const rim=new THREE.DirectionalLight(0xff6a10,2.5);rim.position.set(7,5,-6);scene.add(rim);}
 function texture(draw){const c=document.createElement('canvas');c.width=768;c.height=512;draw(c.getContext('2d'),c.width,c.height);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);textures.add(t);return t;}
 function label(lines,bg='#c0d6f8',fg='#1a385f') {return texture((c,w,h)=>{c.fillStyle=bg;c.fillRect(0,0,w,h);c.textAlign='center';lines.forEach((s,i)=>{c.font=i===1?'600 145px Arial':'500 37px monospace';c.fillStyle=fg;c.fillText(s,w/2,100+i*145);});});}
 function face(parent,map,w,h,x,y,z,flat=false){const m=addResource(new THREE.MeshBasicMaterial({map}));const g=addResource(new THREE.PlaneGeometry(w,h));const o=place(parent,new THREE.Mesh(g,m),x,y,z);if(flat)o.rotation.x=-Math.PI/2;return o;}
 const scene=new THREE.Scene();lighting(scene);const root=new THREE.Group();scene.add(root);root.rotation.y=-.1;
 // AI Operations Twin: five real stages mounted on a dark industrial base, linked by data paths.
 const dark=material('#171416',.7,.4),edge=material('#6d4531',.62,.35),orange=material('#fb6408',.55,.24),silver=material('#a99079',.55,.35),green=material('#f6a14d',.42,.28);
 const baseTop=material('#261c17',.52,.42);
 place(root,block(12,.32,7.6,dark),0,-.16,0);place(root,block(11.78,.08,7.34,baseTop),0,.07,0);
 for(const x of [-5.48,5.48])for(const z of [-3.31,3.31])place(root,new THREE.Mesh(addResource(new THREE.CylinderGeometry(.085,.085,.045,12)),edge),x,.17,z);
 const nodes=[];
 function node(stage,x,y,z,w,h,d,mat){const group=new THREE.Group();group.userData.stage=stage;place(root,group,x,y,z);group.add(block(w,h,d,mat));nodes.push(group);return group;}
 const labelOrange=(lines)=>label(lines,'#26150e','#ff8e27');
 const input=node(0,-4.2,.41,2.12,2.0,.44,1.45,silver);face(input,label(['01 / REQUEST','Input','CHAT / EMAIL'],'#241a17','#ffb05d'),1.83,1.25,0,.245,0,true);
 const core=node(1,-.12,.53,.14,2.55,.55,2.38,orange);
 face(core,label(['02 / INTELLIGENCE','AI','AGENT + RULES'],'#f97c16','#1b0f08'),2.23,2.05,0,.30,0,true);
 for(let n=0;n<7;n++)for(const side of [-1,1]){place(core,block(.14,.11,.28,edge),-1+n*.34,-.18,side*1.27);place(core,block(.23,.11,.14,edge),side*1.33,-.18,-.97+n*.32);}
 // Halo is a recognizable processing signal, rather than an abstract decorative sculpture.
 const haloA=new THREE.Mesh(addResource(new THREE.TorusGeometry(1.62,.038,8,72)),addResource(new THREE.MeshBasicMaterial({color:'#ff7309'})));
 const haloB=new THREE.Mesh(addResource(new THREE.TorusGeometry(1.3,.026,8,64)),addResource(new THREE.MeshBasicMaterial({color:'#ffc087'})));
 haloA.rotation.x=-Math.PI/2;haloB.rotation.x=-Math.PI/2;place(root,haloA,-.12,.49,.14);place(root,haloB,-.12,.47,.14);
 const tools=node(2,2.75,.84,-1.98,1.7,1.04,1.52,edge);face(tools,label(['03 / TOOLS','API','DATABASE'],'#26150e','#ffad5d'),1.48,1.35,0,.55,0,true);
 for(let i=0;i<3;i++){place(tools,block(1.23,.08,.035,dark),0,-.31+i*.25,.80);place(tools,new THREE.Mesh(addResource(new THREE.SphereGeometry(.041,8,6)),orange),-.43,-.31+i*.25,.85);}
 const review=node(3,3.54,.47,2.05,2.05,.51,1.49,green);face(review,label(['04 / HUMAN','OK','APPROVAL'],'#492411','#ffe6c2'),1.81,1.3,0,.29,0,true);
 const monitor=new THREE.Group();monitor.userData.stage=4;place(root,monitor,-3.4,.15,-1.81);nodes.push(monitor);
 place(monitor,block(1.36,.13,.88,edge),0,.08,.1);place(monitor,block(.26,1.22,.24,edge),0,.74,0);place(monitor,block(2.9,1.89,.2,edge),0,1.90,0);
 const screen=texture((c,w,h)=>{c.fillStyle='#151213';c.fillRect(0,0,w,h);c.fillStyle='#ff750a';c.fillRect(0,0,w,16);c.font='28px monospace';c.fillText('05 / DELIVER',30,68);c.fillStyle='#fff4e7';c.font='bold 56px Arial';c.fillText('Action ready.',34,162);c.fillStyle='#332019';c.fillRect(30,210,650,65);c.fillRect(30,297,500,22);c.fillStyle='#ff730b';c.fillRect(30,210,450,65);c.fillRect(30,354,540,72);c.fillStyle='#ffffff';c.font='bold 23px Arial';c.fillText('APPROVED WORKFLOW',65,255);});face(monitor,screen,2.7,1.67,0,1.91,.112);
 const phone=new THREE.Group();phone.userData.stage=4;nodes.push(phone);place(root,phone,4.91,1.37,-.32);phone.rotation.y=-.13;phone.add(block(.86,1.76,.16,edge,.11));face(phone,label(['MOBILE','APP','DELIVERED'],'#1b1211','#ff9740'),.75,1.59,0,0,.095);
 const paths=[];
 function cable(points){const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,.19,z)),false,'catmullrom',.08);const tube=addResource(new THREE.TubeGeometry(curve,44,.033,8,false));root.add(new THREE.Mesh(tube,addResource(new THREE.MeshStandardMaterial({color:'#ea5b05',emissive:'#ff5f06',emissiveIntensity:.65,metalness:.42,roughness:.25}))));const dot=new THREE.Mesh(addResource(new THREE.SphereGeometry(.09,12,8)),addResource(new THREE.MeshBasicMaterial({color:'#ffd7a9'})));root.add(dot);paths.push({curve,dot});}
 cable([[-4.2,2.12],[-2.25,2.12],[-2.25,.14],[-.12,.14]]);
 cable([[-.12,.14],[1.1,.14],[1.1,-1.98],[2.75,-1.98]]);
 cable([[2.75,-1.98],[3.55,-1.98],[3.55,2.05]]);
 cable([[3.54,2.05],[1.5,2.05],[1.5,-.32],[4.91,-.32]]);
 cable([[3.54,2.05],[.5,2.05],[.5,-1.81],[-3.4,-1.81]]);
 const view=document.querySelector('#system-view'), camera=new THREE.OrthographicCamera(-8,8,5,-5,.1,80);camera.position.set(9,13,18);camera.lookAt(0,.45,0);
 const hero={element:view,scene,camera,kind:'system',root,hover:false};entries.push(hero);
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
 const abort=new AbortController(),opts={signal:abort.signal};
 view.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;down={x:e.clientX,y:e.clientY,turn:state.turn};dragging=true;view.setPointerCapture(e.pointerId);},opts);
 view.addEventListener('pointermove',e=>{if(!down||!motion)return;state.turn=Math.max(-25,Math.min(25,down.turn+(e.clientX-down.x)*.12));schedule();},opts);
 view.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<7){const r=view.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(nodes,true);if(hits[0]){let target=hits[0].object;while(target&&target.userData.stage===undefined)target=target.parent;if(target)document.querySelector(`[data-stage="${target.userData.stage}"]`)?.click();}}down=null;dragging=false;schedule();},opts);
 view.addEventListener('pointercancel',()=>{down=null;dragging=false;},opts);
 const loader=new SVGLoader();let spritePromise;
 const sprite=()=>spritePromise||(spritePromise=fetch(new URL('../images/symbols.svg',import.meta.url)).then(r=>{if(!r.ok)throw Error('SVG unavailable');return r.text();}).then(t=>new DOMParser().parseFromString(t,'image/svg+xml')));
 async function makeSkill(element){
  if(element.dataset.initializing)return;element.dataset.initializing='true';
  try {const icon=element.dataset.logo,color=getComputedStyle(element.closest('.skill')).getPropertyValue('--brand').trim();const key=icon+color;let master=skillCache.get(key);
   if(!master){const doc=await sprite();if(disposed)return;const symbol=doc.getElementById(icon);if(!symbol)throw Error('Unknown icon');const xml=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${symbol.getAttribute('viewBox')}" fill="${color}">${symbol.innerHTML.replaceAll('currentColor',color)}</svg>`;const data=loader.parse(xml),group=new THREE.Group(),mat=material(color,.55,.29);for(const path of data.paths){if(path.userData.style.fill!=='none'){for(const shape of SVGLoader.createShapes(path)){const g=addResource(new THREE.ExtrudeGeometry(shape,{depth:12,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.8,bevelThickness:1,curveSegments:6}));group.add(new THREE.Mesh(g,mat));}}else{for(const sub of path.subPaths){const ps=sub.getPoints(18);if(ps.length<2)continue;const curve=new THREE.CatmullRomCurve3(ps.map(p=>new THREE.Vector3(p.x,p.y,0)));group.add(new THREE.Mesh(addResource(new THREE.TubeGeometry(curve,40,.8,6,false)),mat));}}}
    if(!group.children.length)throw Error('No icon geometry');const bounds=new THREE.Box3().setFromObject(group),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());group.children.forEach(c=>c.position.sub(center));const scale=2.05/Math.max(size.x,size.y);group.scale.set(scale,-scale,scale);master=new THREE.Group();master.add(group);skillCache.set(key,master);}
   const scene=new THREE.Scene();lighting(scene);const emblem=master.clone(true);emblem.position.y=.2;emblem.rotation.set(-.08,-.35,-.04);scene.add(emblem);const mount=new THREE.Mesh(addResource(new THREE.CylinderGeometry(1.35,1.4,.12,40)),dark);place(scene,mount,0,-1.15,0);const camera=new THREE.PerspectiveCamera(32,1,.1,30);camera.position.set(0,.5,6.5);camera.lookAt(0,-.05,0);const item={element,scene,camera,emblem,kind:'skill',hover:false};entries.push(item);const card=element.closest('.skill');for(const name of ['pointerenter','focusin'])card.addEventListener(name,()=>{item.hover=true;schedule();},opts);for(const name of ['pointerleave','focusout'])card.addEventListener(name,()=>{item.hover=false;schedule();},opts);schedule();
  }catch {element.dataset.initializing='failed';}
 }
 const observer=new IntersectionObserver(items=>{for(const item of items)if(item.isIntersecting){makeSkill(item.target);observer.unobserve(item.target);}},{rootMargin:'120px'});document.querySelectorAll('[data-view="skill"]').forEach(e=>observer.observe(e));
 function schedule(){if(!disposed&&!frame&&!document.hidden)frame=requestAnimationFrame(render);}
 let last=0;
 function render(time){try{frame=0;if(disposed||document.hidden)return;const dt=Math.min((time-last)/1000,.05)||.016;last=time;renderer.setScissorTest(false);renderer.clear();renderer.setScissorTest(true);let animate=false;
  for(const item of entries){const rect=item.element.getBoundingClientRect();if(rect.width<=0||rect.height<=0||rect.bottom<=0||rect.top>=innerHeight||rect.right<=0||rect.left>=innerWidth)continue;
   const aspect=rect.width/rect.height;
   if(item.kind==='system'){if(motion){haloA.rotation.z+=dt*.22;haloB.rotation.z-=dt*.16;}const half=Math.max(4.7,7.5/aspect);camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;root.rotation.y=-.12+state.turn*Math.PI/180;nodes.forEach(n=>n.scale.setScalar(n.userData.stage===state.stage?1.035:1));const studio=document.querySelector('#system-studio');const play=motion&&(studio.classList.contains('flow-playing')||studio.classList.contains('scroll-flowing'));paths.forEach((p,i)=>{p.dot.visible=play;p.dot.position.copy(p.curve.getPoint((time/2200+i*.21)%1));});animate=animate||play||dragging;
   }else {item.camera.aspect=aspect;const target=item.hover && motion ? .32 : -.35;const diff=target-item.emblem.rotation.y;if(Math.abs(diff)>.003){item.emblem.rotation.y=motion?item.emblem.rotation.y+diff*Math.min(dt*10,1):target;animate=animate||motion;}item.emblem.rotation.z=item.hover && motion ? .02 : -.04;}
   item.camera.updateProjectionMatrix();const x=Math.max(0,rect.left),y=Math.max(0,innerHeight-rect.bottom),w=Math.min(innerWidth,rect.right)-x,h=Math.min(innerHeight,rect.bottom)-Math.max(0,rect.top);renderer.setViewport(rect.left,innerHeight-rect.bottom,rect.width,rect.height);renderer.setScissor(x,y,w,h);renderer.clearDepth();renderer.render(item.scene,item.camera);item.element.dataset.rendered='true';
  }
  if(animate)schedule();
 }catch(error){console.warn('3D enhancement stopped; retaining CSS-3D.',error);dispose();}
 }
 document.addEventListener('portfolio:scene',e=>{Object.assign(state,e.detail);schedule();},opts);document.addEventListener('portfolio:motion',e=>{motion=e.detail.motion;schedule();},opts);document.addEventListener('portfolio:layout',schedule,opts);
 const layoutObserver=new ResizeObserver(schedule);layoutObserver.observe(document.body);document.fonts?.ready.then(()=>{if(!disposed)schedule();});
 document.addEventListener('toggle',schedule,{capture:true,signal:abort.signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();},opts);window.addEventListener('scroll',schedule,{passive:true,signal:abort.signal});window.addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight,false);schedule();},opts);
 function fallback(){for(const e of entries)delete e.element.dataset.rendered;document.documentElement.dataset.renderer='css-3d';}
 function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();layoutObserver.disconnect();abort.abort();fallback();resources.forEach(r=>r.dispose());textures.forEach(t=>t.dispose());environment.dispose();renderer.dispose();canvas.remove();}
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();dispose();},{once:true});window.addEventListener('pagehide',dispose,{once:true});
 // Attach only after the renderer and complete system scene exist.
 document.body.append(canvas);document.documentElement.dataset.renderer='three-webgl';schedule();
 return {dispose};
}
