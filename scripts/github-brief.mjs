/* GitHub module inventories: preserve the uploaded Markdown and reject unsupported claims. */
export function parseGithubBrief(md,manifest){
 const text=String(md||"").replace(/\r\n/g,"\n");
 const title=/^# Project Modules & Features — (.+)$/m.exec(text);
 const repo=/^\*\*Repository:\*\*\s+(https:\/\/github\.com\/[^\s]+)/m.exec(text);
 const featuresHeading="## Project feature list",auditHeading="## Requested modules (short details)";
 const a=text.indexOf(featuresHeading),b=text.indexOf(auditHeading);
 if(!title||!repo||a<0||b<=a)throw Error("Invalid source GitHub module inventory");
 if(manifest.repository!==repo[1])throw Error("GitHub inventory repository mismatch "+manifest.slug);
 const featureBlock=text.slice(a+featuresHeading.length,b);
 const bullets=[...featureBlock.matchAll(/^- (.+)$/gm)].map(m=>m[1].trim());
 if(!bullets.length||!Array.isArray(manifest.modules)||bullets.length!==manifest.modules.length)throw Error("Inconsistent GitHub feature module inventory");
 for(let i=0;i<bullets.length;i++){
  if(bullets[i]!==manifest.modules[i].source||!manifest.modules[i].title||!manifest.modules[i].detail)throw Error("Unsupported or mismatched GitHub source feature "+(i+1));
 }
 const checklist=[...text.slice(b+auditHeading.length).matchAll(/^(\d+)\. \*\*([^:]+):\*\*\s+(.+)$/gm)];
 const kinds=["User Management","API for App","KYC","HR Management System"];
 if(checklist.length!==4||checklist.some((x,i)=>Number(x[1])!==i+1||x[2]!==kinds[i]||x[3].trim()!==manifest.checklist[i]))throw Error("GitHub checklist differs from ZIP");
 if(!/not proof a feature is enabled in production/i.test(text))throw Error("Missing code-versus-production disclaimer");
 const modules=bullets.map((source,i)=>({number:i+1,title:manifest.modules[i].title,functionality:source,scope:"main",group:"Documented features",status:"Source-described; production unverified",data:"",sources:[]}));
 return {modules,checklist:manifest.checklist,total:modules.length+4,counts:{main:modules.length,core:0,excluded:0},groups:[{scope:"main",title:"Documented features",items:modules}]};
}
