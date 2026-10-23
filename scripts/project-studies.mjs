import {readdir,readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {parseTableInventory,renderResearchCaseCard,renderResearchCasePage} from './research-case.mjs';
import {parsePriorityFixInventory,renderPriorityFixCard,renderPriorityFixPage} from './priority-fix.mjs';
import {parseGitlabBrief,renderGitlabCaseCard,renderGitlabPage} from './gitlab-brief.mjs';
function esc(value){return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}

function safeHref(url){const u=String(url||"");return /^https:\/\/github\.com\/[a-z0-9_.-]+\/[a-z0-9_.-]+(?:\/(?:blob|tree)\/[a-zA-Z0-9_./%-]+)?\/?$/i.test(u)?u:"#source"; }

function icon(name){const paths={
layers:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 9h10M7 13h7"/>',
spark:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>',
wallet:'<rect x="3" y="6" width="18" height="15" rx="3"/><path d="M3 10h18m-5 5h2M6 6V4h12"/>',
shield:'<path d="m12 2 8 4v6c0 5-3 8-8 10-5-2-8-5-8-10V6l8-4Z"/><path d="m9 12 2 2 4-4"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
edit:'<path d="m3 21 5-.8L20 8a3 3 0 0 0-4-4L4 16 3 21Z"/><path d="m14 6 4 4"/>',
search:'<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'};
return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.55">${paths[name]||paths.layers}</svg>`;
}

function parseInventory(md,manifest={}){
if(manifest.renderer==='gitlab-brief')return parseGitlabBrief(md,manifest);
if(manifest.renderer==='tenant')return parsePriorityFixInventory(md);
if(/^\|\s*#\s*\|\s*Module\s*\|\s*Short details\s*\|\s*Source status\s*\|/mi.test(md))return parseTableInventory(md,manifest);
const lines=String(md||"").replace(/\r\n/g,"\n").split("\n");
const mods=[]; let scope=null,group=null,current=null;
for(const raw of lines){
const line=raw.trim();
const h=/^##\s+(.+)$/.exec(line);
if(h){
 if(h[1].startsWith("Main —")){scope="main";group=h[1].replace(/^Main —\s*/,"").replace(/\s*\(\d+\s+modules?\)\s*$/,"").trim();}
 else if(h[1].startsWith("Core storefront —")){scope="core";group=h[1].replace(/^Core storefront —\s*/,"").replace(/\s*\(\d+\s+modules?\)\s*$/,"").trim();}
 else if(h[1].startsWith("Unverified / excluded")){scope="excluded";group="Not confirmed";}
 else if(h[1]==="Modules"){scope="main";group="Modules";}
 else if(h[1].startsWith("Main —")){scope="main";group="Modules";}
 continue;
}
const heading=/^###\s+(?:(\d+)\.\s+)?(.+?)\s*$/.exec(line);
if(heading&&scope){
current={number:heading[1]?Number(heading[1]):mods.length+1,title:heading[2],scope,group:group||"Modules",functionality:"",data:"",status:"Not specified",sources:[]};mods.push(current);
continue;
}
if(!current)continue;
let match=/^\*\*(Functionality|Data\/contracts|Implementation status|Source files):\*\*\s*(.+)$/.exec(line);
if(!match)continue;
const type=match[1],value=match[2];
if(type==="Functionality")current.functionality=value;
else if(type==="Data/contracts")current.data=value;
else if(type==="Implementation status")current.status=value;
else if(type==="Source files"){
 const regex=/\[([^\]]+)\]\((https:\/\/github\.com\/[^)\s]+)\)/g;
 current.sources=[...value.matchAll(regex)].map(m=>({name:m[1],url:m[2]})).filter(x=>safeHref(x.url)!=="#source");
}
}
const groups=[];
for(const mod of mods){let g=groups.find(g=>g.scope===mod.scope&&g.title===mod.group);if(!g){g={scope:mod.scope,title:mod.group,items:[]};groups.push(g);}g.items.push(mod);}
return {modules:mods,groups,counts:{main:mods.filter(m=>m.scope==="main").length,core:mods.filter(m=>m.scope==="core").length,excluded:mods.filter(m=>m.scope==="excluded").length},total:mods.length};
}

function validateCase(item,parsed){
const m=item.manifest;
if(!m||!/^[a-z0-9-]+$/.test(m.slug)||m.slug!==item.slug)throw Error("Invalid case slug");
for(const key of ["title","eyebrow","subtitle","summary","overview","category","cover","inventory"])if(typeof m[key]!=="string"||!m[key])throw Error("Missing "+key);
if(m.renderer==='tenant'){if(m.repository)throw Error("Tenant brief has no verified repository reference");}else if(!/^https:\/\/(?:github|gitlab)\.com\/[a-z0-9_.-]+\/[a-z0-9_.-]+$/i.test(m.repository||""))throw Error("Invalid repository reference");
if(!Array.isArray(m.media)||!m.media.length||!Array.isArray(m.highlights)||!Array.isArray(m.workflows?.main))throw Error("Missing project gallery, highlights, or workflow");
for(const a of [m.cover,...m.media.map(x=>x.src),m.inventory])if(!/^(?:assets\/)?[a-zA-Z0-9_.\/-]+$/.test(a)||a.includes(".."))throw Error("Unsafe project asset reference: "+a);
for(const x of m.media){if(!["diagram","screenshot","video"].includes(x.kind)||!x.alt||!x.title)throw Error("Invalid media record");}
if(parsed.total===0)throw Error("No source-supported module sections found in "+m.slug);
return item;
}

function renderCaseCard(item){
if(item.manifest?.renderer==='gitlab-brief')return renderGitlabCaseCard(item);
if(item.manifest?.renderer==='tenant')return renderPriorityFixCard(item);
if(item.manifest?.renderer==='research')return renderResearchCaseCard(item);
const m=item.manifest,stats=item.parsed.counts,url=`projects/${encodeURIComponent(m.slug)}/`;
return `<article class="case-feature" aria-labelledby="case-feature-${esc(m.slug)}">
<a class="case-feature-art" href="${url}" aria-label="Open ${esc(m.title)} detailed case study"><img loading="lazy" decoding="async" src="projects/${esc(m.slug)}/${esc(m.cover)}" alt="${esc(m.media?.[0]?.alt||m.title+' architecture illustration')}" width="1200" height="760"><span class="case-art-stamp">SYSTEM ILLUSTRATION · NOT A PRODUCT SCREENSHOT</span></a>
<div class="case-feature-body"><p class="case-kicker">FEATURED CASE STUDY / SOURCE-REVIEWED</p><h3 id="case-feature-${esc(m.slug)}">${esc(m.title)} <span>↗</span></h3><p class="case-summary">${esc(m.summary)}</p><div class="case-counters"><span><b>${stats.main}</b> main-app modules</span>${stats.core?`<span><b>${stats.core}</b> separate storefront modules</span>`:""}</div><div class="case-tagline">${m.stack.slice(0,4).map(t=>`<span>${esc(t)}</span>`).join("")}</div><a class="case-feature-link" href="${url}">Explore modules, workflows &amp; gallery <span aria-hidden="true">↗</span></a><p class="case-disclosure">Code inventory, not production-performance claims.</p></div></article>`;
}

function renderCasePage(item){
if(item.manifest?.renderer==='gitlab-brief')return renderGitlabPage(item);
if(item.manifest?.renderer==='tenant')return renderPriorityFixPage(item);
if(item.manifest?.renderer==='research')return renderResearchCasePage(item);
const m=item.manifest, d=item.parsed, slug=esc(m.slug);
const canonical=`https://sambukhari.github.io/syedallimujtaba.github.io/projects/${encodeURIComponent(m.slug)}/`;
const mediaURL=canonical+m.cover;
const mainWorkflow= m.workflows.main||[],coreWorkflow=m.workflows.core||[];
function workflow(steps,scope){
return `<div class="cs-workflow-stage-set" data-workflow="${scope}" ${scope==="core"?"hidden":""}><div class="cs-stage-track">${steps.map((x,i)=>`<button type="button" class="cs-stage" data-flow-step="${i}" data-flow-scope="${scope}" data-flow-detail="${esc(x.detail)}" aria-pressed="${i===0?'true':'false'}"><span class="cs-step-symbol">${icon(x.icon)}</span><small>${String(i+1).padStart(2,"0")} / 0${steps.length}</small><b>${esc(x.name)}</b></button>`).join('<span class="cs-step-link" aria-hidden="true"></span>')}</div><div class="cs-flow-focus" role="status"><span class="cs-flow-focus-label">THE ENGINEERING DECISION</span><strong data-flow-title>${esc(steps[0]?.name||"")}</strong><p data-flow-description>${esc(steps[0]?.detail||"")}</p></div></div>`;
}
function moduleGroup(group,index){
return `<section class="cs-module-group" data-group-scope="${group.scope}" id="module-group-${group.scope}-${index}" ${group.scope!=="main"?"hidden":""}><div class="cs-group-head"><div><span class="cs-group-count">${String(index+1).padStart(2,"0")} / ${group.scope==="core"?"SECOND APP":"MAIN APP"}</span><h3>${esc(group.title)}</h3></div><span class="cs-module-count">${group.items.length} MODULES</span></div><div class="cs-modules">${group.items.map(mod=>{
const label=/^Source-implemented/i.test(mod.status)?"SOURCE-IMPLEMENTED":(/^(Code present|Commands present|Provider handlers present|Gateway code present|Operations code present|Plugin source present)/i.test(mod.status)?"CODE / ACTIVATION UNVERIFIED":"SOURCE REVIEW");
const type=label==="SOURCE-IMPLEMENTED"?"source":"code";
return `<details class="cs-module" data-module-scope="${mod.scope}" data-module-state="${type}" data-search="${esc(`${mod.title} ${mod.functionality} ${mod.data} ${mod.status}`.toLowerCase())}"><summary><span class="cs-module-n">${String(mod.number).padStart(2,"0")}</span><span class="cs-module-name">${esc(mod.title)}</span><span class="cs-module-status ${type}">${label}</span><span class="cs-module-chevron" aria-hidden="true">↘</span></summary><div class="cs-module-body"><p>${esc(mod.functionality||"Functionality details not supplied.")}</p>${mod.data?`<p class="cs-module-data"><b>Data &amp; contracts</b> ${esc(mod.data)}</p>`:""}<p class="cs-module-status-detail"><b>Evidence status:</b> ${esc(mod.status)}</p>${mod.sources.length?`<div class="cs-source-links"><span>IMPLEMENTATION REFERENCES</span>${mod.sources.map(s=>`<a href="${esc(safeHref(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.name)} <span aria-hidden="true">↗</span></a>`).join("")}</div>`:""}</div></details>`;
}).join("")}</div></section>`;
}
const sourceGroups=d.groups.filter(g=>g.scope!=="excluded"),exclusions=d.groups.filter(g=>g.scope==="excluded").flatMap(g=>g.items);
const gallery=m.media.map((x,i)=>`<button type="button" class="cs-gallery-item" data-gallery-open="${i}" aria-label="Open ${esc(x.title)} in gallery"><span class="cs-media-frame">${x.kind==="video"?`<video muted playsinline preload="metadata" aria-hidden="true"><source src="${esc(x.src)}" type="${x.src.endsWith(".webm")?"video/webm":"video/mp4"}"></video>`:`<img src="${esc(x.src)}" alt="${esc(x.alt)}" loading="lazy" decoding="async">`}<span class="cs-media-over">↗</span></span><span class="cs-media-kind">${esc(x.kind==="diagram"?"SYSTEM DIAGRAM":x.kind==="screenshot"?"PRODUCT SCREENSHOT":"VIDEO WALKTHROUGH")}</span><strong>${esc(x.title)}</strong><small>${esc(x.caption||"")}</small></button>`).join("");
return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(m.title)} — Engineering Case Study | Ali Mujtaba</title>
<meta name="description" content="${esc(m.summary)}">
<meta name="theme-color" content="#09090b"><link rel="canonical" href="${canonical}">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(m.title)} | Engineering Case Study"><meta property="og:description" content="${esc(m.summary)}"><meta property="og:image" content="${esc(mediaURL)}">
<link rel="icon" type="image/svg+xml" href="../../assets/images/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../assets/css/project-studies.css">
<script defer src="../../assets/js/project-detail.js"></script>
</head>
<body class="cs-page" data-case="${slug}">
<a class="cs-skip" href="#case-main">Skip to case study</a>
<header class="cs-header"><div class="cs-shell cs-header-inner"><a class="cs-brand" href="../../index.html#home" aria-label="Ali Mujtaba portfolio home"><span class="cs-brand-icon">a<span>m</span></span><span>ALI MUJTABA<small>ENGINEER &amp; TECH LEAD</small></span></a><nav aria-label="Case study navigation"><a href="../../index.html#work">All projects</a><a href="#modules">Modules</a><a href="#gallery">Gallery</a><a class="cs-nav-contact" href="../../index.html#contact">Let’s talk ↗</a></nav></div></header>
<main id="case-main">
<div class="cs-shell">
<nav class="cs-breadcrumbs" aria-label="Breadcrumb"><a href="../../index.html#work">Portfolio</a><span aria-hidden="true">/</span><span>Case studies</span><span aria-hidden="true">/</span><strong>${esc(m.title)}</strong></nav>
<section class="cs-hero" aria-labelledby="case-title"><div class="cs-hero-copy"><p class="cs-eyebrow"><span class="cs-beacon"></span>${esc(m.eyebrow)}</p><h1 id="case-title">${esc(m.title)}<span>.</span></h1><p class="cs-lead">${esc(m.subtitle)}</p><p class="cs-hero-detail">${esc(m.overview)}</p><div class="cs-hero-actions"><a href="#workflow" class="cs-button cs-button-primary">Explore the architecture <span aria-hidden="true">↘</span></a><a href="#modules" class="cs-button cs-button-outline">View documented modules ↗</a></div><div class="cs-stack">${m.stack.map(t=>`<span>${esc(t)}</span>`).join("")}</div></div><div class="cs-hero-visual"><img src="${esc(m.cover)}" width="1200" height="760" alt="${esc(m.media[0].alt)}" fetchpriority="high" decoding="async"><span>CONCEPTUAL SYSTEM ILLUSTRATION · NOT A PRODUCT SCREENSHOT</span></div></section>
<div class="cs-metrics" aria-label="Source inventory overview"><div><strong>${d.counts.main}</strong><span>MAIN-APP MODULES</span></div><div><strong>${d.counts.core}</strong><span>SEPARATE STOREFRONT MODULES</span></div><div><strong>${d.groups.filter(g=>g.scope==="main").length+d.groups.filter(g=>g.scope==="core").length}</strong><span>ENGINEERING DOMAINS</span></div><div><strong>${esc(m.reviewed||"SOURCE")}</strong><span>INVENTORY REVIEWED</span></div></div>
<div class="cs-source-bar"><span class="cs-beacon"></span><p><strong>Evidence, not inflated claims.</strong> The inventory documents code paths at a specific commit; live deployment, provider activation, traffic and individual contributions are not proven.</p><a href="${esc(safeHref(m.repository))}" target="_blank" rel="noopener noreferrer">Repository ↗</a></div>
<nav class="cs-section-nav" aria-label="On this page"><a href="#overview">Overview</a><a href="#workflow">Architecture</a><a href="#modules">All modules</a><a href="#gallery">Gallery</a><a href="#scope">Evidence &amp; limits</a></nav>
<section id="overview" class="cs-section"><div class="cs-section-intro"><span class="cs-section-index">01 / PRODUCT SYSTEM</span><h2>Built as a system.<br><em>Explained as a journey.</em></h2><p>${esc(m.focus||"")}</p></div><div class="cs-highlights">${m.highlights.map(x=>`<article class="cs-highlight"><span class="cs-highlight-icon">${icon(x.icon)}</span><small>${esc(x.number)}</small><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p></article>`).join("")}</div></section>
<section id="workflow" class="cs-section"><div class="cs-section-intro"><span class="cs-section-index">02 / ENGINEERING WORKFLOWS</span><h2>Follow the logic.<br><em>See where it connects.</em></h2><p>Two distinct applications. Explore their journeys without conflating the codebases or assuming these diagrams represent production telemetry.</p></div><div class="cs-switch" role="group" aria-label="Workflow application"><button type="button" data-workflow-switch="main" aria-pressed="true">Main classifieds <span>${d.counts.main} modules</span></button>${coreWorkflow.length?`<button type="button" data-workflow-switch="core" aria-pressed="false">Separate storefront <span>${d.counts.core} modules</span></button>`:""}</div>${workflow(mainWorkflow,"main")}${coreWorkflow.length?workflow(coreWorkflow,"core"):""}<p class="cs-workflow-caption">Schematic interaction only. No real account, payment, model, or support action runs on this page.</p></section>
<section id="modules" class="cs-section"><div class="cs-section-intro"><span class="cs-section-index">03 / COMPLETE DOCUMENTED INVENTORY</span><h2>Every module.<br><em>Visible, searchable, sourced.</em></h2><p>Expand each module for functionality, data contracts, implementation status and direct links to code. “Source-implemented” does not mean deployed or runtime-tested.</p></div><div class="cs-module-toolbar"><div class="cs-switch cs-module-scope" role="group" aria-label="Choose application"><button type="button" data-scope-switch="main" aria-pressed="true">Main app (${d.counts.main})</button>${d.counts.core?`<button type="button" data-scope-switch="core" aria-pressed="false">Separate storefront (${d.counts.core})</button>`:""}</div><div class="cs-module-tools"><label class="cs-search-label"><span class="cs-visually-hidden">Search project modules</span><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></svg><input id="module-search" type="search" placeholder="Search features, APIs, capabilities..." autocomplete="off"></label><label class="cs-filter-label">Status <select id="module-status"><option value="all">All evidence</option><option value="source">Source-implemented</option><option value="code">Code present / unverified</option></select></label></div></div><p class="cs-module-results" id="module-results" role="status">Showing ${d.counts.main} of ${d.counts.main} modules</p><div id="module-groups">${sourceGroups.map(moduleGroup).join("")}</div><p id="module-empty" hidden>No matching modules. Try a different search or evidence filter.</p></section>
<section id="gallery" class="cs-section"><div class="cs-section-intro"><span class="cs-section-index">04 / MEDIA LIBRARY</span><h2>Look inside the thinking.<br><em>See the connected pieces.</em></h2><p>The gallery currently contains labeled architectural illustrations from the source inventory. Authenticated product screenshots and demos can be added to this project's assets directory as they become available.</p></div><div class="cs-gallery">${gallery}</div><p class="cs-gallery-notice">Media provenance: diagrams are illustrative, not captures of a running product. No production screenshots or recordings were provided in this source file.</p></section>
<section id="scope" class="cs-section"><div class="cs-section-intro"><span class="cs-section-index">05 / ENGINEERING INTEGRITY</span><h2>Confidence needs<br><em>clear boundaries.</em></h2><p>${esc(m.caveat||"")}</p></div><div class="cs-scope-grid"><article><span class="cs-scope-mark">01 / MAIN APP</span><h3>Primary classifieds</h3><p>Includes marketplace listings, seller profiles, location discovery, messaging, AI support and source-described billing/administration code. Features are not independently certified as operational.</p></article><article><span class="cs-scope-mark">02 / SEPARATE APPLICATION</span><h3>Storefront in public/core/</h3><p>Contains a separate Laravel storefront with cart, checkout, shipping, orders, wallets and Stripe handler code. Its features must not be attributed to the main classifieds app.</p></article><article><span class="cs-scope-mark">03 / UNVERIFIED</span><h3>Not a production audit</h3><p>Provider activation, scheduled jobs, payment settlements, traffic, ownership and live AI credentials require explicit runtime verification.</p></article></div><div class="cs-excluded"><h3>Not confirmed by the inspected inventory</h3>${exclusions.map(x=>`<details><summary>${esc(x.title)} <span>↗</span></summary><p>${esc(x.functionality)}</p><small>${esc(x.status)}</small></details>`).join("")}</div><div class="cs-evidence-actions"><a href="${esc(m.inventory)}" download>Read complete source inventory ↓</a><a href="${esc(safeHref(m.repository))}/tree/${esc(m.commit)}" target="_blank" rel="noopener noreferrer">Inspect pinned repository ↗</a></div></section>
<section class="cs-next"><div><span class="cs-section-index">NEXT / LET’S BUILD THE NEXT ONE</span><h2>Have a system worth simplifying?</h2><p>Let's make its engineering clear—and the experience unforgettable.</p></div><a href="../../index.html#contact" class="cs-button cs-button-primary">Start a conversation ↗</a></section>
</div>
</main>
<footer class="cs-footer"><div class="cs-shell"><span>ALI MUJTABA / ENGINEERING WITH INTENT</span><a href="../../index.html#work">← Back to all projects</a><span>Source-reviewed: ${esc(m.reviewed||"date not supplied")}</span></div></footer>
<dialog id="case-lightbox" class="cs-lightbox" aria-label="Project media viewer"><div class="cs-lightbox-head"><span id="case-lightbox-title">Media</span><button type="button" data-gallery-close aria-label="Close gallery viewer">✕</button></div><div class="cs-lightbox-content" id="case-lightbox-media"></div><div class="cs-lightbox-bottom"><span id="case-lightbox-caption"></span><div><button type="button" data-gallery-prev aria-label="Previous image">←</button><span id="case-lightbox-counter">1 / ${m.media.length}</span><button type="button" data-gallery-next aria-label="Next image">→</button></div></div></dialog>
</body>
</html>\n`;
}
export {parseInventory,renderCaseCard,renderCasePage,validateCase};
export async function loadCaseStudies(root){
 const directory=path.join(root,"projects");
 const dirs=(await readdir(directory,{withFileTypes:true})).filter(x=>x.isDirectory()&&!x.name.startsWith("_")).sort((a,b)=>a.name.localeCompare(b.name));
 const all=[];
 for(const dir of dirs){
   const home=path.join(directory,dir.name);
   const manifest=JSON.parse(await readFile(path.join(home,"project.json"),"utf8"));
   const md=await readFile(path.join(home,manifest.inventory||"PROJECT.md"),"utf8");
   const parsed=parseInventory(md,manifest);
   const item=validateCase({slug:dir.name,manifest,parsed},parsed);
   for(const media of [manifest.cover,...manifest.media.map(x=>x.src)]){
     const filepath=path.resolve(home,media);
     if(!filepath.startsWith(path.resolve(home)+path.sep))throw Error("Invalid file path");
     if(!(await stat(filepath)).isFile())throw Error("Missing media "+filepath);
   }
   all.push(item);
 }
 return all;
}
