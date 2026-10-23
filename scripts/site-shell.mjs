/* Single source of truth for the portfolio navigation, footer and document chrome. */
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export function renderSiteHeader({root='',page='home'}={}){
 const home=root+'index.html',local=page==='home'?'':home,projects=root+'projects/';
 const links=[
  {text:'Selected work',url:local+'#work',key:'home'},
  {text:'All projects',url:projects,key:'projects'},
  {text:'Experience',url:local+'#journey',key:'experience'},
  {text:'Expertise',url:local+'#stack',key:'expertise'}
 ];
 return `<header id="top" class="site-header universal-header" data-site-header><div class="universal-shell universal-header-row">
 <a class="universal-brand" href="${local}#home" aria-label="Ali Mujtaba — portfolio home"><span class="universal-brand-mark" aria-hidden="true">a<span>m</span><i>.</i></span><span class="universal-brand-text">ALI MUJTABA<small>ENGINEER · TECH LEAD</small></span></a>
 <button class="menu-toggle universal-menu-toggle" type="button" data-site-menu aria-controls="navigation" aria-expanded="false" aria-label="Open site navigation"><span>Menu</span><i aria-hidden="true"></i></button>
 <nav class="universal-nav" id="navigation" aria-label="Main navigation">${links.map(x=>`<a href="${x.url}"${page===x.key?' aria-current="page"':''}>${escapeHTML(x.text)}</a>`).join('')}
 <a href="${local}#contact" class="universal-nav-cta">Start a conversation <span aria-hidden="true">↗</span></a></nav>
 </div></header>`;
}
export function renderSiteFooter({root='',page='home'}={}){
 const home=root+'index.html',local=page==='home'?'':home,projects=root+'projects/';
 return `<footer class="universal-footer" data-site-footer><div class="universal-shell">
 <div class="universal-footer-main"><div class="universal-footer-intro"><p class="universal-overline">BUILT WITH INTENT · ENGINEERED TO LAST</p><a href="${home}#home" class="universal-footer-name">Let’s build<br><em>something useful.</em> <span aria-hidden="true">↗</span></a><p>AI-assisted workflows, dependable backend systems and products people enjoy using.</p></div>
 <nav class="universal-footer-links" aria-label="Footer navigation"><div><strong>Explore</strong><a href="${local}#work">Selected work</a><a href="${projects}">Project directory</a><a href="${local}#journey">Experience</a><a href="${local}#stack">Expertise</a></div><div><strong>Connect</strong><a href="mailto:syedallimujtaba@gmail.com">Email ↗</a><a href="https://www.linkedin.com/in/sambukhari/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="https://github.com/sambukhari" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href="${root}assets/resume/Syed-Ali-Mujtaba-Tech-Lead-CV.pdf">Résumé ↗</a></div></nav></div>
 <div class="universal-footer-bottom"><span>SYED ALI MUJTABA SHAH · BAHAWALPUR, PAKISTAN</span><span>DESIGNED FOR PEOPLE. BUILT FOR SCALE.</span><div><button id="motion-toggle" type="button" class="universal-motion" aria-pressed="true">Motion on</button><a href="#${page==='home'?'home':'top'}">Back to top ↑</a></div></div>
 </div></footer>`;
}
export function applySiteShell(html,{root='../../',page='detail',archived=false}={}){
 const header=renderSiteHeader({root,page}),footer=renderSiteFooter({root,page});
 let output=String(html);
 const head=/<header\b[^>]*>[\s\S]*?<\/header>/i,foot=/<footer\b[^>]*>[\s\S]*?<\/footer>/i;
 if(!head.test(output)||!foot.test(output))throw Error('Page is missing a header or footer for shared shell');
 output=output.replace(head,()=>header).replace(foot,()=>footer);
 const assets=`<link rel="stylesheet" href="${root}assets/css/site-shell.css"><script defer src="${root}assets/js/site-shell.js"></script>`;
 if(!output.includes('</head>'))throw Error('Missing document head');
 output=output.replace('</head>',(archived?'<meta name="robots" content="noindex,follow">':'')+assets+'</head>');
 return output;
}
