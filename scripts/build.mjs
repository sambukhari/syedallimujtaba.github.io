import { readFileSync, writeFileSync, existsSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeLink(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}}
export function safeAsset(value){return typeof value==='string'&&/^assets\/[a-zA-Z0-9_./-]+\.(png|jpg|jpeg|webp|svg)$/.test(value)&&!value.split('/').includes('..');}
export function validate(projects,skills){
 if(!Array.isArray(projects)||!Array.isArray(skills))throw new Error('Data must be arrays.');
 const ids=new Set();
 for(const p of projects){
  if(!/^[a-z0-9-]+$/.test(p.id)||ids.has(p.id))throw new Error('Invalid or duplicate project id.');ids.add(p.id);
  for(const key of ['company','shortTitle','summary','contribution','scope'])if(typeof p[key]!=='string'||!p[key].trim())throw new Error(`Missing project ${key}.`);
  for(const link of p.links||[])if(!safeLink(link.url)||!link.label)throw new Error('Project links must be labelled HTTPS URLs.');
  for(const image of p.screenshots||[])if(!safeAsset(image.src)||!image.alt)throw new Error('Screenshots require safe local paths and alt text.');
  for(const metric of p.metrics||[])if(metric.approved!==true||!metric.source||!metric.value||!metric.label)throw new Error('Metrics require explicit approval, a source, value and label.');
 }
 for(const s of skills)if(!s.name||!/^[a-z0-9-]+$/.test(s.icon)||!['ai','backend','frontend','cloud'].includes(s.category)||!/^#[0-9a-f]{6}$/i.test(s.color))throw new Error('Invalid skill.');
}
export function renderProject(p){
 const icon=name=>`<svg class="icon" aria-hidden="true"><use href="assets/images/symbols.svg#${name}"/></svg>`;
 const tags=(p.tags||[]).map(t=>`<span>${t==='Laravel'?icon('laravel'):t==='React Native'?icon('react'):''}${escape(t)}</span>`).join('');
 const narratives=[['My contribution',p.contribution],['Project context',p.scope],['Problem',p.problem],['Architecture',p.architecture],['Engineering trade-offs',p.tradeoffs]].filter(([,v])=>v).map(([label,text])=>`<h4>${label}</h4><p>${escape(text)}</p>`).join('');
 const gallery=(p.screenshots||[]).map(i=>`<figure class="project-screenshot"><img src="${escape(i.src)}" alt="${escape(i.alt)}" loading="lazy" decoding="async">${i.caption?`<figcaption>${escape(i.caption)}</figcaption>`:''}</figure>`).join('');
 const metrics=(p.metrics||[]).map(m=>`<p><strong>${escape(m.value)}</strong> ${escape(m.label)} <small>Evidence: ${escape(m.source)}</small></p>`).join('');
 const links=(p.links||[]).map(l=>`<a href="${escape(l.url)}" target="_blank" rel="noopener noreferrer">${escape(l.label)} &#8599;</a>`).join(' ');
 return `<div class="work-content"><div class="work-meta"><span>${escape(p.company.toUpperCase())}</span><span>${escape(p.number)} / ${escape(p.category.toUpperCase())}</span></div><h3>${escape(p.shortTitle)}</h3><p>${escape(p.summary)}</p><div class="tags">${tags}</div><details class="project-details"><summary>Explore the project <span>&#8599;</span></summary><div>${narratives}${gallery}${metrics}${links}<a href="#contact">Discuss this work &#8594;</a></div></details></div>`;
}
export function generate(html,projects,skills){
 validate(projects,skills);
 for(const p of projects){
  const pattern=new RegExp(`(<article[^>]+data-project="${p.id}"[^>]*>[\\s\\S]*?)(<div class="work-content">[\\s\\S]*?)(</article>)`);
  if(!pattern.test(html))throw new Error(`Add a visual article with data-project="${p.id}" to index.html first.`);
  html=html.replace(pattern,(_,visual,old,end)=>visual+renderProject(p)+end);
 }
 const content=skills.map(s=>`<li class="skill" data-category="${s.category}" style="--brand:${s.color}"><svg class="icon" aria-hidden="true"><use href="assets/images/symbols.svg#${s.icon}"/></svg><span>${escape(s.name)}</span></li>`).join('');
 return html.replace(/(<ul class="skill-grid">)[\s\S]*?(<\/ul>)/,(_,a,b)=>a+content+b);
}
export function build(check=false){
 const projects=JSON.parse(readFileSync(join(root,'assets/data/projects.json'),'utf8'));
 const skills=JSON.parse(readFileSync(join(root,'assets/data/skills.json'),'utf8'));
 const html=readFileSync(join(root,'index.html'),'utf8');
 const generated=generate(html,projects,skills);
 if(check){if(html!==generated)throw new Error('Generated content is stale. Run npm run build.');console.log('Generated project and skill content is current.');return;}
 for(const p of projects)for(const image of p.screenshots||[])if(!existsSync(join(root,image.src)))throw new Error(`Missing screenshot: ${image.src}`);
 writeFileSync(join(root,'index.html'),generated);
 const dist=join(root,'dist');rmSync(dist,{recursive:true,force:true});mkdirSync(dist,{recursive:true});
 cpSync(join(root,'index.html'),join(dist,'index.html'));cpSync(join(root,'assets'),join(dist,'assets'),{recursive:true});
 console.log('Static portfolio built in dist/. The repository root is also ready for GitHub Pages.');
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))build(process.argv.includes('--check'));
