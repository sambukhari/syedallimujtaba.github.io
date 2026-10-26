/* Research-platform case study: shared layout, source-backed modules, project-specific storytelling. */
function escapeText(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

function stageIcon(kind){
const paths={
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
edit:'<path d="m3 21 5-.8L20 8a3 3 0 0 0-4-4L4 16 3 21Z"/><path d="m14 6 4 4"/>',
layers:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 9h10M7 13h7"/>',
spark:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>',
wallet:'<rect x="3" y="6" width="18" height="15" rx="3"/><path d="M3 10h18m-5 5h2M6 6V4h12"/>',
shield:'<path d="m12 2 8 4v6c0 5-3 8-8-10V6l8-4Z"/><path d="m9 12 2 2 4-4"/>',
search:'<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'};
return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round">${paths[kind]||paths.layers}</svg>`;
}

function parseTableInventory(md,manifest={}){
 const lines=String(md||"").replace(/\r\n/g,"\n").split("\n"),records=[];
 if(!lines.some(line=>/^\|\s*#\s*\|\s*Module\s*\|\s*Short details\s*\|\s*Source status\s*\|/i.test(line)))throw Error("No recognized project module table");
 for(const line of lines){
  const match=/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$/.exec(line);
  if(!match)continue;
  const number=Number(match[1]),title=match[2].trim(),functionality=match[3].trim(),status=match[4].trim();
  if(!title||!functionality||!status||records.some(mod=>mod.number===number))throw Error("Invalid or duplicate row "+number);
  if(!/^(Present(?:\s*\(limited\))?(?:;\s*live status unverified)?|Not found)$/i.test(status))throw Error("Unrecognized source status: "+status);
  records.push({number,title,functionality,status,data:"",sources:[],scope:/^Not found$/i.test(status)?"excluded":"main",group:""});
 }
 if(records.length===0)throw Error("Project table has no module records");
 const map=new Map(records.map(item=>[item.number,item]));
 const groupConfig=manifest.moduleGroups||[];
 const covered=new Set();
 for(const g of groupConfig){
  if(!g.title||!Array.isArray(g.numbers))throw Error("Invalid moduleGroup entry");
  for(const id of g.numbers){
   if(covered.has(id)||!map.has(id)||map.get(id).scope==="excluded")throw Error("Bad grouped module number "+id);
   covered.add(id);map.get(id).group=g.title;
  }
 }
 for(const mod of records)if(mod.scope==="excluded")mod.group="Not found in the source review";
 else if(!mod.group){if(groupConfig.length)throw Error("Ungrouped documented module "+mod.number);mod.group="Documented capabilities";}
 const groups=[];
 for(const g of groupConfig){
  const items=records.filter(x=>x.scope==="main"&&x.group===g.title).sort((a,b)=>a.number-b.number);
  if(items.length)groups.push({scope:"main",title:g.title,items});
 }
 if(!groupConfig.length){const items=records.filter(x=>x.scope==="main");if(items.length)groups.push({scope:"main",title:"Documented capabilities",items});}
 const excluded=records.filter(x=>x.scope==="excluded");if(excluded.length)groups.push({scope:"excluded",title:"Not found in the source review",items:excluded});
 return {modules:records,groups,counts:{main:records.length-excluded.length,core:0,excluded:excluded.length},total:records.length};
}

function renderResearchCaseCard(item){
 const m=item.manifest,d=item.parsed,e=escapeText,url=`projects/${encodeURIComponent(m.slug)}/`;
 return `<article class="case-feature case-feature-research" aria-labelledby="case-feature-${e(m.slug)}">
<a class="case-feature-art" href="${url}" aria-label="Open the ${e(m.title)} case study"><img loading="lazy" decoding="async" src="${url}${e(m.cover)}" alt="${e(m.media[0].alt)}" width="1200" height="760"><span class="case-art-stamp">CONCEPTUAL SYSTEM DIAGRAM · NOT A SCREENSHOT</span></a>
<div class="case-feature-body"><p class="case-kicker">RESEARCH PLATFORM / ENGINEERING CASE STUDY</p><h3 id="case-feature-${e(m.slug)}">${e(m.title)} <span>↗</span></h3><p class="case-summary">${e(m.summary)}</p><div class="case-counters"><span><b>${d.total}</b> features reviewed</span><span><b>${d.counts.main}</b> present in source</span><span><b>${d.counts.excluded}</b> not found</span></div><div class="case-tagline">${m.stack.slice(0,4).map(tag=>`<span>${e(tag)}</span>`).join("")}</div><a class="case-feature-link" href="${url}">Explore research workflows &amp; all modules <span aria-hidden="true">↗</span></a><p class="case-disclosure">Source inventory only · Live deployment not verified.</p></div></article>`;
}

function renderResearchCasePage(item){
 const m=item.manifest,d=item.parsed,e=escapeText,root=`https://sambukhari.github.io/syedallimujtaba.github.io/projects/${encodeURIComponent(m.slug)}/`;
 const origin=m.repository.replace(/\/$/,""),revision=/^[0-9a-f]{40}$/.test(m.commit||"")?m.commit:"main";
 const sourceURL=origin.startsWith("https://gitlab.com/")?origin+"/-/tree/"+revision:origin+"/tree/"+revision;
 const sourceGroups=d.groups.filter(g=>g.scope==="main"),excluded=d.modules.filter(x=>x.scope==="excluded");
 const sourceCount=d.modules.filter(x=>/^Present$/i.test(x.status)).length;
 const statuses={present:"PRESENT IN SOURCE",limited:"PRESENT · LIMITED API",unverified:"CODE PRESENT · LIVE UNVERIFIED"};
 const icon=(type)=>stageIcon(type);
 function workflow(steps,scope){
 return `<div class="cs-workflow-stage-set" data-workflow="${scope}" ${scope==="core"?"hidden":""}>
<div class="cs-stage-track">${steps.map((s,i)=>`<button class="cs-stage" type="button" data-flow-step="${i}" data-flow-scope="${scope}" data-flow-detail="${e(s.detail)}" aria-pressed="${i===0?"true":"false"}"><span class="cs-step-symbol">${icon(s.icon)}</span><small>${String(i+1).padStart(2,"0")} / ${String(steps.length).padStart(2,"0")}</small><b>${e(s.name)}</b></button>`).join('<span class="cs-step-link" aria-hidden="true"></span>')}</div>
<div class="cs-flow-focus" role="status"><span class="cs-flow-focus-label">CAPABILITY IN SOURCE</span><strong data-flow-title>${e(steps[0]?.name)}</strong><p data-flow-description>${e(steps[0]?.detail)}</p></div></div>`;
 }
 function cardGroup(group,i){
 return `<section class="cs-module-group" data-group-scope="main" id="apaea-domain-${i+1}"><div class="cs-group-head"><div><span class="cs-group-count">DOMAIN ${String(i+1).padStart(2,"0")} / DOCUMENTED SOURCE</span><h3>${e(group.title)}</h3></div><span class="cs-module-count">${group.items.length} MODULES</span></div><div class="cs-modules">${group.items.map(mod=>{
 const type=mod.status==="Present"?"source":"code",label=mod.status==="Present"?statuses.present:/limited/i.test(mod.status)?statuses.limited:statuses.unverified;
 return `<details class="cs-module" data-module-scope="main" data-module-state="${type}" data-search="${e((mod.title+" "+mod.functionality+" "+mod.status).toLowerCase())}"><summary><span class="cs-module-n">${String(mod.number).padStart(2,"0")}</span><span class="cs-module-name">${e(mod.title)}</span><span class="cs-module-status ${type}">${label}</span><span class="cs-module-chevron" aria-hidden="true">↘</span></summary><div class="cs-module-body"><p>${e(mod.functionality)}</p><p class="cs-module-status-detail"><b>Source status:</b> ${e(mod.status)}. ${/limited/i.test(mod.status)?"Eight API routes were identified; this is not evidence of a complete mobile API.":/live status unverified/i.test(mod.status)?"Real payment processing and provider activation have not been verified.":"This confirms code present in the inspected source, not production deployment."}</p><div class="cs-source-links"><span>PROVENANCE</span><a href="${e(m.inventory)}" target="_blank" rel="noopener noreferrer">Uploaded inventory · Row ${String(mod.number).padStart(2,"0")} ↗</a><a href="${e(sourceURL)}" target="_blank" rel="noopener noreferrer">Pinned GitLab source ↗</a></div><p class="cs-module-provenance">The inventory did not provide individual controller or route file links for this module.</p></div></details>`;
 }).join("")}</div></section>`;
 }
 const gallery=m.media.map((x,i)=>`<button type="button" class="cs-gallery-item" data-gallery-open="${i}" aria-label="Open ${e(x.title)} in gallery"><span class="cs-media-frame">${x.kind==="video"?`<video muted playsinline preload="metadata" aria-hidden="true"><source src="${e(x.src)}" type="${x.src.endsWith(".webm")?"video/webm":"video/mp4"}"></video>`:`<img src="${e(x.src)}" alt="${e(x.alt)}" loading="lazy" decoding="async">`}<span class="cs-media-over">↗</span></span><span class="cs-media-kind">${x.kind==="diagram"?"CONCEPTUAL SYSTEM DIAGRAM":x.kind==="screenshot"?"PRODUCT SCREENSHOT":"VIDEO WALKTHROUGH"}</span><strong>${e(x.title)}</strong><small>${e(x.caption||"")}</small></button>`).join("");
 return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e(m.title)} — Engineering Case Study | Ali Mujtaba</title>
<meta name="description" content="${e(m.summary)}"><meta name="theme-color" content="#09090b">
<link rel="canonical" href="${root}"><meta property="og:type" content="article">
<meta property="og:title" content="${e(m.title)} | Research Platform Case Study">
<meta property="og:description" content="${e(m.summary)}"><meta property="og:image" content="${e(root+m.cover)}">
<link rel="icon" href="../../assets/images/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../assets/css/project-studies.css"><link rel="stylesheet" href="../../assets/css/research-case.css">
<script defer src="../../assets/js/project-detail.js"></script>
</head>
<body class="cs-page cs-research-page" data-case="${e(m.slug)}">
<a class="cs-skip" href="#case-main">Skip to case study</a>
<header class="cs-header"><div class="cs-shell cs-header-inner"><a class="cs-brand" href="../../index.html#home" aria-label="Ali Mujtaba portfolio home"><span class="cs-brand-icon">a<span>m</span></span><span>ALI MUJTABA<small>ENGINEER &amp; TECH LEAD</small></span></a><nav aria-label="Case study navigation"><a href="../../index.html#work">All projects</a><a href="#modules">Modules</a><a href="#gallery">Gallery</a><a class="cs-nav-contact" href="../../index.html#contact">Let's talk ↗</a></nav></div></header>
<main id="case-main"><div class="cs-shell">
<nav class="cs-breadcrumbs" aria-label="Breadcrumb"><a href="../../index.html#work">Portfolio</a><span aria-hidden="true">/</span><span>Case studies</span><span aria-hidden="true">/</span><strong>${e(m.title)}</strong></nav>
<section class="cs-hero cs-research-hero" aria-labelledby="case-title"><div class="cs-hero-copy"><p class="cs-eyebrow"><span class="cs-beacon"></span>${e(m.eyebrow)}</p><h1 id="case-title">APAEA<span>.</span><small>RESEARCH PLATFORM</small></h1><p class="cs-lead">${e(m.subtitle)}</p><p class="cs-hero-detail">${e(m.overview)}</p><div class="cs-hero-actions"><a class="cs-button cs-button-primary" href="#workflow">Explore the journeys <span aria-hidden="true">↘</span></a><a class="cs-button cs-button-outline" href="#modules">All 36 documented capabilities ↗</a></div><div class="cs-stack">${m.stack.map(t=>`<span>${e(t)}</span>`).join("")}</div></div><div class="cs-hero-visual cs-research-art"><img src="${e(m.cover)}" width="1200" height="760" fetchpriority="high" decoding="async" alt="${e(m.media[0].alt)}"><span>CONCEPTUAL SYSTEM ILLUSTRATION · NOT A PRODUCT SCREENSHOT</span></div></section>
<div class="cs-metrics" aria-label="APAEA source inventory overview"><div><strong>${d.total}</strong><span>CAPABILITIES REVIEWED</span></div><div><strong>${d.counts.main}</strong><span>PRESENT IN SOURCE</span></div><div><strong>${d.counts.excluded}</strong><span>NOT FOUND</span></div><div><strong>08</strong><span>REGISTERED APP API ROUTES</span></div></div>
<div class="cs-source-bar"><span class="cs-beacon"></span><p><strong>Code presence ≠ production proof.</strong> This short-form module inventory is pinned to GitLab commit ${e(revision.slice(0,12))}. PayPal/email/deployment were not runtime-tested; individual authorship and impact metrics are not asserted.</p><a href="${e(sourceURL)}" target="_blank" rel="noopener noreferrer">Pinned source ↗</a></div>
<nav class="cs-section-nav" aria-label="On this page"><a href="#overview">Overview</a><a href="#workflow">Journeys</a><a href="#modules">Modules</a><a href="#gallery">Media</a><a href="#scope">Evidence</a></nav>
<section class="cs-section" id="overview"><div class="cs-section-intro"><span class="cs-section-index">01 / DIGITAL RESEARCH INFRASTRUCTURE</span><h2>One ecosystem.<br><em>Many important roles.</em></h2><p>${e(m.focus)}</p></div><div class="cs-highlights">${m.highlights.map(x=>`<article class="cs-highlight"><span class="cs-highlight-icon">${icon(x.icon)}</span><small>${e(x.number)}</small><h3>${e(x.title)}</h3><p>${e(x.body)}</p></article>`).join("")}</div><div class="cs-research-roles" aria-label="Personas served by documented modules"><span>MEMBERS</span><span>AUTHORS</span><span>REVIEWERS</span><span>EDITORS</span><span>EVENT PARTICIPANTS</span><span>ADMINISTRATORS</span></div></section>
<section class="cs-section" id="workflow"><div class="cs-section-intro"><span class="cs-section-index">02 / CONCEPTUAL SYSTEM JOURNEYS</span><h2>From submission<br><em>to scholarship.</em></h2><p>Switch between two views of this same platform. These are explanatory paths assembled from documented modules—not claims of fully tested cross-module orchestration.</p></div><div class="cs-switch" role="group" aria-label="Choose conceptual APAEA workflow"><button type="button" data-workflow-switch="main" aria-pressed="true">Research &amp; publishing <span>05 steps</span></button><button type="button" data-workflow-switch="core" aria-pressed="false">Membership &amp; events <span>05 steps</span></button></div>${workflow(m.workflows.main,"main")}${workflow(m.workflows.core,"core")}<p class="cs-workflow-caption">Interactive illustration of code-documented capabilities only; no actual paper submission, payment or decision is triggered here.</p></section>
<section class="cs-section" id="modules"><div class="cs-section-intro"><span class="cs-section-index">03 / COMPLETE MODULE INVENTORY</span><h2>36 assessed.<br><em>Nothing invented.</em></h2><p>Browse 34 modules with source-present code, organized into ${sourceGroups.length} product domains. Two modules not found in the inventory are documented separately below. Each description is drawn from the supplied Markdown.</p></div><div class="cs-module-toolbar"><div class="cs-research-inventory-label"><span class="cs-beacon"></span> ${d.counts.main} SOURCE-PRESENT MODULES <small>· ${sourceGroups.length} PRODUCT DOMAINS</small></div><div class="cs-module-tools"><label class="cs-search-label"><span class="cs-visually-hidden">Search APAEA modules</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></svg><input id="module-search" type="search" placeholder="Find paper review, journals, membership..." autocomplete="off"></label><label class="cs-filter-label">Evidence <select id="module-status"><option value="all">All present code</option><option value="source">Present in source</option><option value="code">Limited / unverified</option></select></label></div></div><p class="cs-module-results" id="module-results" role="status">Showing ${d.counts.main} of ${d.counts.main} source-present modules</p><div id="module-groups">${sourceGroups.map(cardGroup).join("")}</div><p id="module-empty" hidden>No modules match your search. Try a different term or evidence filter.</p></section>
<section class="cs-section" id="gallery"><div class="cs-section-intro"><span class="cs-section-index">04 / VISUAL LIBRARY</span><h2>The architecture,<br><em>made visible.</em></h2><p>Original, labeled visual explanations of the documented capabilities. This upload did not include actual application screenshots or videos; add those to this project's assets folder later.</p></div><div class="cs-gallery">${gallery}</div><p class="cs-gallery-notice">All current media assets are conceptual diagrams based on the module summary, not actual screenshots, production telemetry or a verified database relationship map.</p></section>
<section class="cs-section" id="scope"><div class="cs-section-intro"><span class="cs-section-index">05 / EVIDENCE AND BOUNDARIES</span><h2>Strong engineering.<br><em>Precise claims.</em></h2><p>${e(m.caveat)}</p></div><div class="cs-scope-grid">${m.scopeCards.map(card=>`<article><span class="cs-scope-mark">${e(card.eyebrow)}</span><h3>${e(card.title)}</h3><p>${e(card.body)}</p></article>`).join("")}</div><div class="cs-excluded"><h3>Explicitly not found in the inspected source</h3>${excluded.map(mod=>`<details><summary>${e(mod.title)} <span>↗</span></summary><p>${e(mod.functionality)}</p><small>Inventory status: ${e(mod.status)}</small></details>`).join("")}</div><div class="cs-research-proof"><p><strong>Important scope note:</strong> The supplied inventory references \`APAEA_AI_CONTEXT.md\` as an additional coding reference, but that document was not provided. There are no module-specific file citations in the uploaded source summary. No controller names, live payment successes or usage metrics have been invented.</p></div><div class="cs-evidence-actions"><a href="${e(m.inventory)}" download>Download complete APAEA inventory ↓</a><a href="${e(sourceURL)}" target="_blank" rel="noopener noreferrer">Inspect source at pinned commit ↗</a></div></section>
<section class="cs-next"><div><span class="cs-section-index">NEXT / BUILD WITH INTENT</span><h2>Let's make complex work feel simple.</h2><p>From member journeys to publishing experiences.</p></div><a href="../../index.html#contact" class="cs-button cs-button-primary">Start a conversation ↗</a></section>
</div></main>
<footer class="cs-footer"><div class="cs-shell"><span>ALI MUJTABA / ENGINEERING WITH INTENT</span><a href="../../index.html#work">← All projects</a><span>APAEA MODULES / PINNED SOURCE SUMMARY</span></div></footer>
<dialog id="case-lightbox" class="cs-lightbox" aria-label="Project media viewer"><div class="cs-lightbox-head"><span id="case-lightbox-title">Media</span><button type="button" data-gallery-close aria-label="Close gallery viewer">✕</button></div><div id="case-lightbox-media" class="cs-lightbox-content"></div><div class="cs-lightbox-bottom"><span id="case-lightbox-caption"></span><div><button type="button" data-gallery-prev aria-label="Previous image">←</button><span id="case-lightbox-counter">1 / ${m.media.length}</span><button type="button" data-gallery-next aria-label="Next image">→</button></div></div></dialog>
</body>
</html>
`;
}
export {parseTableInventory,renderResearchCaseCard,renderResearchCasePage};
