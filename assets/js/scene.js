/* Original ray-marched 3D sculpture, rendered on the GPU using native WebGL.
   No external runtime, textures, models, or network requests are required. */
export const fragment = `
precision highp float;
uniform vec2 resolution;
uniform vec2 rotation;
uniform float time;
uniform float mode;
mat2 turn(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float torus(vec3 p,float r,float w){return length(vec2(length(p.xz)-r,p.y))-w;}
vec2 map(vec3 p){
 p.xz=turn(rotation.x+.34)*p.xz;p.yz=turn(rotation.y+.42)*p.yz;
 vec3 a=p;a.xy=turn(.48)*a.xy;
 float d1=torus(a,1.38,.29);
 vec3 b=p;b.yz=turn(1.18)*b.yz;b.xy=turn(-.42)*b.xy;
 float d2=torus(b,1.34,.25);
 vec3 c=p;c.xy=turn(1.24)*c.xy;c.yz=turn(-.38)*c.yz;
 float d3=torus(c,1.30,.235);
 vec2 r=vec2(d1,1.);if(d2<r.x)r=vec2(d2,2.);if(d3<r.x)r=vec2(d3,3.);
 float core=length(p)-.43;if(core<r.x)r=vec2(core,4.);
 return r;
}
vec3 normalAt(vec3 p){vec2 e=vec2(.002,0);return normalize(vec3(map(p+e.xyy).x-map(p-e.xyy).x,map(p+e.yxy).x-map(p-e.yxy).x,map(p+e.yyx).x-map(p-e.yyx).x));}
vec3 studio(vec3 d){
 vec3 col=vec3(.035,.043,.05);
 float top=pow(max(0.,dot(d,normalize(vec3(-.4,1.,.6)))),18.);
 float strip=pow(max(0.,dot(d,normalize(vec3(.9,.25,1.)))),50.);
 float side=pow(max(0.,dot(d,normalize(vec3(-1.,-.2,.2)))),24.);
 col+=vec3(.95,1.,1.)*top*2.2+vec3(.8,.95,1.)*strip*2.+vec3(.42,.51,.55)*side;
 col+=vec3(.43,.65,.1)*pow(max(0.,dot(d,normalize(vec3(.2,-1.,.1)))),10.)*.5;
 return col;
}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*resolution)/resolution.y;
 vec3 ro=vec3(0.,0.,5.8);vec3 rd=normalize(vec3(uv,-1.4));
 vec3 bg=vec3(.041,.049,.049);float halo=exp(-dot(uv,uv)*4.);
 bg+=vec3(.035,.049,.015)*halo;
 float depth=0.;vec2 hit=vec2(0.);vec3 p;
 for(int i=0;i<86;i++){p=ro+rd*depth;hit=map(p);if(hit.x<.0018||depth>10.)break;depth+=hit.x*.8;}
 vec3 col=bg;
 if(depth<10.){
  vec3 n=normalAt(p);vec3 refl=reflect(rd,n);float fres=pow(1.-max(0.,dot(-rd,n)),3.);
  float light=max(0.,dot(n,normalize(vec3(-3.,4.,4.))));
  float ao=clamp(map(p+n*.18).x/.18,.2,1.);
  col=(studio(refl)*.85+vec3(.10,.12,.125)*light)*ao;
  col+=vec3(.18,.23,.25)*fres;
  if(hit.y>3.5){col=vec3(.53,.79,.10)*(.48+light*.8);col+=vec3(.55,.8,.15)*pow(max(0.,dot(refl,normalize(vec3(-.2,.8,1.)))),20.);}
  if(hit.y>2.5&&hit.y<3.5){col=mix(col,col*vec3(.62,.83,.24)+vec3(.05,.09,.005),.35);}
  col=col/(vec3(1.)+col)*1.35;
  col=pow(max(col,0.),vec3(.80));
 }
 // Fine studio grain, not a particle background.
 float noise=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
 col+=(noise-.5)*.007;
 gl_FragColor=vec4(col,1.);
}`;

// Real projected triangle geometry for browsers without WebGL. This is not CSS 3D.
function softwareBackend(canvas) {
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx) return null;
  const meshes=[];
  const rotate=(p,x,y,z=0)=>{let [a,b,c]=p;let s=Math.sin(x),co=Math.cos(x);[b,c]=[b*co-c*s,b*s+c*co];s=Math.sin(y);co=Math.cos(y);[a,c]=[a*co+c*s,-a*s+c*co];s=Math.sin(z);co=Math.cos(z);return [a*co-b*s,a*s+b*co,c];};
  const rings=[[1.38,.29,.55,0,.5],[1.34,.25,1.2,0,-.3],[1.3,.235,-.38,0,1.24]];
  for(let ring=0;ring<3;ring++){
    const [R,r,x,y,z]=rings[ring],vertices=[],normals=[],faces=[];
    const U=64,V=20;
    for(let i=0;i<U;i++)for(let j=0;j<V;j++){
      const u=i/U*Math.PI*2,v=j/V*Math.PI*2;
      vertices.push(rotate([(R+r*Math.cos(v))*Math.cos(u),r*Math.sin(v),(R+r*Math.cos(v))*Math.sin(u)],x,y,z));
      normals.push(rotate([Math.cos(v)*Math.cos(u),Math.sin(v),Math.cos(v)*Math.sin(u)],x,y,z));
    }
    for(let i=0;i<U;i++)for(let j=0;j<V;j++){const a=i*V+j,b=((i+1)%U)*V+j,c=((i+1)%U)*V+(j+1)%V,d=i*V+(j+1)%V;faces.push([a,b,c],[a,c,d]);}
    meshes.push({vertices,normals,faces,material:ring===2?'green':'metal'});
  }
  const vertices=[],normals=[],faces=[],U=36,V=18;
  for(let i=0;i<=V;i++)for(let j=0;j<U;j++){const t=i/V*Math.PI,p=j/U*Math.PI*2,n=[Math.sin(t)*Math.cos(p),Math.cos(t),Math.sin(t)*Math.sin(p)];vertices.push(n.map(a=>a*.43));normals.push(n);}
  for(let i=0;i<V;i++)for(let j=0;j<U;j++){const a=i*U+j,b=i*U+(j+1)%U,c=(i+1)*U+(j+1)%U,d=(i+1)*U+j;faces.push([a,b,c],[a,c,d]);}
  meshes.push({vertices,normals,faces,material:'core'});
  // Smooth-shaded, depth-buffered rasterisation avoids painter-sort intersection seams.
  let pixels,zbuffer;
  function render(rx,ry){
    const w=canvas.width,h=canvas.height;
    if(!pixels||pixels.width!==w||pixels.height!==h){pixels=ctx.createImageData(w,h);zbuffer=new Float32Array(w*h);}
    const data=pixels.data;zbuffer.fill(-Infinity);
    for(let i=0;i<data.length;i+=4){data[i]=11;data[i+1]=14;data[i+2]=14;data[i+3]=255;}
    for(const mesh of meshes){
      const points=mesh.vertices.map(p=>rotate(p,ry+.2,rx+.32));
      const norms=mesh.normals.map(p=>rotate(p,ry+.2,rx+.32));
      const projected=points.map(p=>[w*.5+p[0]/(5.8-p[2])*h*1.40,h*.5-p[1]/(5.8-p[2])*h*1.40]);
      for(const face of mesh.faces){
        const [a,b,c]=face,[A,B,C]=face.map(i=>projected[i]);
        const den=(B[1]-C[1])*(A[0]-C[0])+(C[0]-B[0])*(A[1]-C[1]);
        if(Math.abs(den)<.001)continue;
        const xmin=Math.max(0,Math.floor(Math.min(A[0],B[0],C[0]))),xmax=Math.min(w-1,Math.ceil(Math.max(A[0],B[0],C[0])));
        const ymin=Math.max(0,Math.floor(Math.min(A[1],B[1],C[1]))),ymax=Math.min(h-1,Math.ceil(Math.max(A[1],B[1],C[1])));
        for(let y=ymin;y<=ymax;y++)for(let x=xmin;x<=xmax;x++){
          const u=((B[1]-C[1])*(x+.5-C[0])+(C[0]-B[0])*(y+.5-C[1]))/den;
          const v=((C[1]-A[1])*(x+.5-C[0])+(A[0]-C[0])*(y+.5-C[1]))/den,t=1-u-v;
          if(u<0||v<0||t<0)continue;
          const z=u*points[a][2]+v*points[b][2]+t*points[c][2],i=y*w+x;
          if(z<=zbuffer[i])continue;zbuffer[i]=z;
          let nx=u*norms[a][0]+v*norms[b][0]+t*norms[c][0],ny=u*norms[a][1]+v*norms[b][1]+t*norms[c][1],nz=u*norms[a][2]+v*norms[b][2]+t*norms[c][2];
          const len=Math.hypot(nx,ny,nz);nx/=len;ny/=len;nz/=len;
          const light=Math.max(0,nx*-.4+ny*.55+nz*.73);
          const strip=Math.pow(Math.max(0,nx*-.55+ny*.72+nz*.42),9);
          const strip2=Math.pow(Math.max(0,nx*.85+ny*-.05+nz*.52),17);
          const fres=Math.pow(1-Math.max(0,nz),2);
          const value=Math.min(1,.105+light*.30+strip*.87+strip2*.9+fres*.11);
          const j=i*4;
          if(mesh.material==='core'){data[j]=132+light*67;data[j+1]=179+light*64;data[j+2]=38+light*42;}
          else if(mesh.material==='green'){data[j]=value*205;data[j+1]=value*230;data[j+2]=value*157;}
          else{data[j]=value*220;data[j+1]=value*237;data[j+2]=value*231;}
        }
      }
    }
    ctx.putImageData(pixels,0,0);
  }
  return {render,resize(w,h){canvas.width=w;canvas.height=h;},dispose(){},name:'software-3d'};
}

function webglBackend(canvas){
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power',preserveDrawingBuffer:true});
  if(!gl)return null;
  const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);throw new Error('3D shader compilation failed');}return s;};
  let vs,fs,program,buffer;
  try{
    vs=shader(gl.VERTEX_SHADER,'attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}');fs=shader(gl.FRAGMENT_SHADER,fragment);
    program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('3D scene linking failed');
    gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const a=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
    const res=gl.getUniformLocation(program,'resolution'),rot=gl.getUniformLocation(program,'rotation'),t=gl.getUniformLocation(program,'time');
    return {render(rx,ry,clock){gl.useProgram(program);gl.uniform2f(res,canvas.width,canvas.height);gl.uniform2f(rot,rx,ry);gl.uniform1f(t,clock);gl.drawArrays(gl.TRIANGLES,0,6);},resize(w,h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);},dispose(){gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);gl.deleteBuffer(buffer);},name:'native-webgl'};
  }catch(error){if(program)gl.deleteProgram(program);if(vs)gl.deleteShader(vs);if(fs)gl.deleteShader(fs);if(buffer)gl.deleteBuffer(buffer);return null;}
}

export async function mountScene(host,controls){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let canvas=document.createElement('canvas');
  let backend=webglBackend(canvas);
  if(!backend){canvas=document.createElement('canvas');backend=softwareBackend(canvas);}
  if(!backend){host.dataset.engine='static';controls.hidden=true;return;}
  canvas.className='sculpture-canvas';canvas.setAttribute('aria-hidden','true');host.prepend(canvas);
  host.dataset.engine=backend.name;
  let enabled=!reduced.matches,inView=true,dragging=false,raf=0,previous=0,lastDraw=0,clock=0;
  let rx=.12,ry=-.12,targetX=.12,targetY=-.12,lastX=0,lastY=0,disposed=false;
  const motion=controls.querySelector('[data-motion]');
  const draw=()=>{backend.render(rx,ry,clock);host.dataset.frame=String((Number(host.dataset.frame)||0)+1);};
  function sync(){motion.setAttribute('aria-pressed',String(enabled));motion.textContent=enabled?'Pause motion':'Play motion';motion.disabled=reduced.matches;}
  function resize(){const r=host.getBoundingClientRect();const ratio=backend.name==='software-3d'?Math.min(1,480/r.height):Math.min(devicePixelRatio||1,1.25)*.85;backend.resize(Math.max(1,Math.round(r.width*ratio)),Math.max(1,Math.round(r.height*ratio)));draw();}
  function frame(now){raf=0;if(disposed||!inView||document.hidden)return;
    const dt=Math.min((now-previous)/1000||0,.08);previous=now;
    if(enabled&&!dragging)targetX+=dt*.085;
    rx+=(targetX-rx)*.22;ry+=(targetY-ry)*.22;clock+=dt;
    if(now-lastDraw>=(backend.name==='software-3d'?40:24)){draw();lastDraw=now;}
    if(enabled||Math.abs(targetX-rx)>.001||Math.abs(targetY-ry)>.001)raf=requestAnimationFrame(frame);
    else draw();
  }
  function start(){if(!raf&&!disposed&&inView&&!document.hidden){previous=performance.now();raf=requestAnimationFrame(frame);}}
  function stop(){cancelAnimationFrame(raf);raf=0;}
  motion.addEventListener('click',()=>{enabled=!enabled;sync();enabled?start():stop();});
  controls.querySelectorAll('[data-rotate]').forEach(button=>button.addEventListener('click',()=>{targetX+=Number(button.dataset.rotate)*.35;if(reduced.matches){rx=targetX;draw();}else start();}));
  const onReduced=()=>{enabled=!reduced.matches;sync();enabled?start():stop();draw();};reduced.addEventListener('change',onReduced);
  host.addEventListener('pointerdown',event=>{if(event.target!==canvas)return;dragging=true;lastX=event.clientX;lastY=event.clientY;canvas.setPointerCapture(event.pointerId);host.classList.add('dragging');});
  host.addEventListener('pointermove',event=>{if(!dragging)return;targetX+=(event.clientX-lastX)*.008;targetY=Math.max(-.8,Math.min(.8,targetY+(event.clientY-lastY)*.006));lastX=event.clientX;lastY=event.clientY;if(reduced.matches){rx=targetX;ry=targetY;draw();}else start();});
  const release=()=>{dragging=false;host.classList.remove('dragging');};host.addEventListener('pointerup',release);host.addEventListener('pointercancel',release);
  const onVisibility=()=>document.hidden?stop():start();document.addEventListener('visibilitychange',onVisibility);
  const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;inView?start():stop();},{rootMargin:'60px'});observer.observe(host);
  const ro=new ResizeObserver(resize);ro.observe(host);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();stop();host.dataset.engine='static';canvas.hidden=true;controls.hidden=true;});
  // A restored bfcache page is allowed to restart its animation.
  window.addEventListener('pageshow',event=>{if(event.persisted)start();});
  window.addEventListener('pagehide',event=>{stop();if(event.persisted)return;disposed=true;ro.disconnect();observer.disconnect();reduced.removeEventListener('change',onReduced);document.removeEventListener('visibilitychange',onVisibility);backend.dispose();},{once:false});
  sync();resize();start();
}
