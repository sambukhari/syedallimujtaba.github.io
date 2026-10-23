/* Source-derived GitLab case generation. SVGs are labeled diagrams, not screenshots. */
const xml=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]))
function makeDiagram(m,kind="cover"){
 const title=xml(m.title.length>29?m.title.slice(0,27)+"…":m.title);
 const category=xml(m.category.toUpperCase());
 const featured=m.modules.slice(0,4);
 const nodes=m.placeholder?[]:featured.map((x,i)=>{const xPos=62+i*275;const short=x.title.length>19?x.title.slice(0,18)+"…":x.title;const d=x.detail.length>38?x.detail.slice(0,36)+"…":x.detail;
  return `<g><rect x="${xPos}" y="391" width="245" height="162" rx="18" fill="url(#pane)" stroke="#FFAB5D" stroke-opacity="${i===1?'.82':'.46'}" stroke-width="1.5"/><rect x="${xPos+17}" y="411" rx="9" width="39" height="32" fill="#FF8A1F19" stroke="#FF9B4665"/><text x="${xPos+27}" y="433" fill="#FFC991" font-family="Arial,sans-serif" font-size="16" font-weight="700">${String(i+1).padStart(2,"0")}</text><text x="${xPos+18}" y="477" fill="#FFF5EA" font-family="Arial,sans-serif" font-weight="700" font-size="20">${xml(short)}</text><text x="${xPos+18}" y="508" fill="#C6B1A5" font-family="Arial,sans-serif" font-size="13">${xml(d)}</text><path d="M${xPos+244} 473h30" stroke="#FFAB59" stroke-width="2" stroke-dasharray="4 7"/></g>`;
 }).join("");
 const headline=kind==="cover"?"Engineering in context.":"Modules. Boundaries. Evidence.";
 const head2=m.placeholder?"NO APPLICATION SOURCE":(kind==="cover"?"A closer look inside.":"A source-based system view.");
 const y=kind==="cover"?218:223;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760" width="1200" height="760" role="img" aria-label="${xml(m.title)} ${kind==="cover"?"conceptual architecture overview":"source module relationship diagram"}">
 <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1E1514"/><stop offset=".62" stop-color="#0C0C10"/><stop offset="1" stop-color="#29170E"/></linearGradient><linearGradient id="accent" x1="0" y1="0" x2="1" y2=".3"><stop stop-color="#FF761D"/><stop offset=".55" stop-color="#FFB263"/><stop offset="1" stop-color="#FFE0AE"/></linearGradient><linearGradient id="pane" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#2D211E"/><stop offset="1" stop-color="#151318"/></linearGradient><filter id="blur"><feGaussianBlur stdDeviation="32"/></filter><pattern id="grid" width="49" height="49" patternUnits="userSpaceOnUse"><path d="M49 0H0V49" stroke="#FF9D46" stroke-opacity=".085" fill="none"/></pattern></defs>
 <rect width="1200" height="760" fill="url(#bg)"/><rect width="1200" height="760" fill="url(#grid)"/>
 <ellipse cx="945" cy="157" rx="300" ry="190" fill="#FE7622" fill-opacity=".15" filter="url(#blur)"/>
 <text x="66" y="69" fill="#FFBD7D" font-family="Arial,sans-serif" font-size="18" font-weight="700" letter-spacing="4">${xml(kind==="cover"?"ENGINEERING ARCHIVE / "+m.category.toUpperCase():"CAPABILITIES / SOURCE REFERENCE")}</text>
 <path d="M66 95H1135" stroke="#FFAF5A" stroke-opacity=".36"/>
 <text x="64" y="172" fill="#FFF8F0" font-family="Arial,sans-serif" font-size="${headline.length>24?52:61}" font-weight="800" letter-spacing="-2">${xml(headline)}</text>
 <text x="64" y="${y+33}" fill="url(#accent)" font-family="Arial,sans-serif" font-size="${head2.length>25?53:60}" font-weight="800" letter-spacing="-2">${xml(head2)}</text>
 <text x="68" y="315" fill="#D3B8A5" font-family="Arial,sans-serif" font-size="21">${title}  /  ${category}</text>
 ${m.placeholder?`<rect x="77" y="377" width="1045" height="176" rx="23" fill="#241918" stroke="#FF9D546B" stroke-dasharray="9 13"/><text x="600" y="448" fill="#FFBC8A" text-anchor="middle" font-family="Arial" font-size="34" font-weight="700">REPOSITORY PLACEHOLDER</text><text x="600" y="494" fill="#D4B9A5" text-anchor="middle" font-family="Arial" font-size="22">No application code found in inspected snapshot</text>`:nodes}
 <rect x="66" y="591" width="1067" height="61" rx="11" fill="#FF852015" stroke="#FFA45152"/>
 <text x="91" y="628" fill="#FFBB84" font-family="Arial,sans-serif" font-size="17" font-weight="700" letter-spacing="1">${m.placeholder?"REFERENCE ONLY · NO SHIPPED FEATURES CLAIMED":m.modules.length+" MODULES DESCRIBED IN GITLAB OVERVIEW"}</text>
 <text x="1133" y="629" text-anchor="end" fill="#C7AD9B" font-family="Arial,sans-serif" font-size="16">READ-ONLY SOURCE REVIEW</text>
 <path d="M66 681H1134" stroke="#FFAE5949"/>
 <text x="66" y="721" fill="#A99586" font-family="Arial,sans-serif" font-size="15" letter-spacing="1">CONCEPTUAL DIAGRAM · NOT A PRODUCT SCREENSHOT OR PRODUCTION AUDIT</text></svg>`;
}
function makeProjectDocs(m){
 const reqNames=["User Management","API for App","KYC","HR Management System"];
 const reqDesc=["Users, login, roles and profiles","App-facing endpoints or integrations","Identity and document checks","Staff, attendance, leave and payroll"];
 const moduleText=m.modules.length?m.modules.map((v,i)=>`${i+1}. **${v.title}** — ${v.detail.replace(/\.$/,"")}.`).join("\n"):"*No application modules were found in the inspected repository.*";
 const source=`# Project Modules and Features — ${m.title}\n\n## Repository modules\n${moduleText}\n\n## Requested module checklist\n${reqNames.map((name,i)=>`${i+1}. **${name}** — ${reqDesc[i]}. **Evidence:** ${m.checklist[i]}`).join("\n")}\n\n*Based on repository structure and manifests; unverified modules are not claimed as implemented.*\n`;
 const context=`# AI Context — ${m.title}\n\n- **Repository:** ${m.repository}\n- **Reviewed branch:** \`main\` (read-only in uploaded source)\n- **Purpose:** ${m.purpose}.\n- **Stack:** ${m.stack}.\n- **Source interpretation:** This Markdown is an accurate, normalized portfolio summary of the supplied GitLab ZIP, not a new source-code audit.\n- **Usage:** Check the current routes and code before implementing. Filenames and dependencies are not proof of production behavior.\n- **Change policy:** No source GitLab repository branches are changed by this portfolio update.\n`;
 const readme=`# ${m.title} — portfolio media and provenance\n\nThis is one of 36 repositories described by the uploaded GitLab project-inventory ZIP. The original uploaded ZIP remains the source of record; this directory contains normalized project descriptions, not an independently inspected source checkout.\n\n- \`project.json\` — typed portfolio configuration and media order.\n- \`PROJECT_MODULES_AND_FEATURES.md\` — primary repository modules and evidence checklist from the ZIP.\n- \`AI_CONTEXT.md\` — repository purpose, documented stack and review caveats.\n- \`assets/\` — original illustrative SVG diagrams, **not actual UI screenshots**.\n- \`index.html\` — generated from the shared project template.\n\nTo add genuine, authorized screenshots or walkthroughs later, place media under \`assets/\` and add entries in \`project.json.media\`. Supported gallery kinds are \`screenshot\`, \`diagram\`, and \`video\`. Each entry needs \`src\`, \`title\`, \`caption\`, \`alt\`. Redact client/personal information before making it public.\n\nImplementation and deployment status, contribution ownership and commercial outcomes should be verified before making stronger claims.\n`;
 return {source,context,readme};
}
function makeCase(m,archive){
 const related=(m.family?archive.filter(x=>x.family===m.family&&x.slug!==m.slug).map(x=>({slug:x.slug,title:x.title})):[]).slice(0,7);
 if(m.family==="Priority Fix")related.unshift({slug:"priority-fix",title:"Priority Fix — Tenant App"});
 const media=[{src:"assets/cover.svg",kind:"diagram",title:m.title+" — engineering overview",caption:"Conceptual visualization of source-described modules; not a product screenshot.",alt:m.title+" source architecture overview"},
 {src:"assets/workflow.svg",kind:"diagram",title:"Modules and source boundaries",caption:"Illustrative layout; cross-module integration and production operation are not proven.",alt:"Conceptual system module overview for "+m.title}];
 return {...m,renderer:"gitlab-brief",eyebrow:"GITLAB SOURCE CASE STUDY",subtitle:m.purpose,summary:m.purpose,overview:m.purpose,inventory:"PROJECT_MODULES_AND_FEATURES.md",cover:"assets/cover.svg",media,highlights:m.modules.slice(0,4).map((x,i)=>({number:String(i+1),title:x.title,body:x.detail,icon:"layers"})),workflows:{main:m.modules.slice(0,5).map(x=>({name:x.title,detail:x.detail,icon:"layers"}))},related};
}
export {makeDiagram,makeProjectDocs,makeCase};
