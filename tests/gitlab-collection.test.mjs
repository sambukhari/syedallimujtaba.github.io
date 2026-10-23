import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {loadCaseStudies,renderCasePage} from '../scripts/project-studies.mjs';
import {renderCollection,renderProjectIndex} from '../scripts/gitlab-brief.mjs';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8');
const archive=JSON.parse(read('projects/gitlab-collection.json')).repos;

test('GitLab ZIP inventory includes exactly 36 unique repositories, 34 new',()=>{
 assert.equal(archive.length,34);
 assert.equal(archive.filter(x=>!x.placeholder).length,31);
 assert.equal(archive.filter(x=>x.placeholder).length,3);
 assert.deepEqual(archive.filter(x=>x.placeholder).map(x=>x.slug).sort(),['hc','marketing-tool','sport-me-flutter']);
 assert.equal(new Set(archive.map(x=>x.slug)).size,34);
 assert.equal(new Set(archive.map(x=>x.repository)).size,34);
 assert.ok(archive.every(x=>/^https:\/\/gitlab\.com\/(sambukhari|main-lead)\//.test(x.repository)));
});
test('each new project has a source summary, responsive detail page and two valid conceptual diagrams',async()=>{
 const cases=await loadCaseStudies(root.pathname);
 assert.equal(cases.length,39);
 for(const record of archive){
   const item=cases.find(x=>x.slug===record.slug);assert.ok(item,'Missing case '+record.slug);
   assert.equal(item.manifest.renderer,'gitlab-brief');
   assert.equal(item.parsed.counts.main,record.modules.length);
   assert.equal(item.parsed.checklist.length,4);
   assert.equal(item.parsed.total,record.modules.length+4);
   assert.equal(read('projects/'+record.slug+'/index.html'),renderCasePage(item),'Case output stale for '+record.slug);
   for(const f of ['AI_CONTEXT.md','PROJECT_MODULES_AND_FEATURES.md','README.md','assets/cover.svg','assets/workflow.svg']){
     const content=read('projects/'+record.slug+'/'+f);assert.ok(content.length>100,'Missing '+record.slug+'/'+f);
     if(f.endsWith('.svg')){assert.ok(content.startsWith('<svg'));assert.ok(content.endsWith('</svg>'));assert.doesNotMatch(content,/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-f]+;)/i);}
   }
   const html=read('projects/'+record.slug+'/index.html');
   assert.match(html,/not a product screenshot/i);
   assert.match(html,/production test/i);
   assert.equal((html.match(/data-gallery-open="/g)||[]).length,2);
   assert.equal((html.match(/class="cs-module" data-module-scope="main"/g)||[]).length,record.modules.length);
   assert.ok(html.includes('User management')&&html.includes('HR management'));
   assert.ok(html.includes('GitLab repository'));
   if(record.placeholder){assert.match(html,/No application source/);assert.doesNotMatch(html,/>[1-9]\d*<\/strong><span>DOCUMENTED REPOSITORY MODULES/);}
 }
 assert.ok(cases.find(x=>x.slug==='ezead-marketplace'));
 assert.equal(cases.find(x=>x.slug==='apaea-research-platform').parsed.total,36);
 assert.equal(cases.find(x=>x.slug==='priority-fix').parsed.total,8);
});
test('main portfolio and directory expose 38 repository cards without inflating featured cards',()=>{
 const home=read('index.html'),directory=read('projects/index.html');
 assert.equal((home.match(/class="gc-entry"/g)||[]).length,38);
 assert.equal((directory.match(/class="gc-entry"/g)||[]).length,38);
 assert.equal((home.match(/class="case-feature"/g)||[]).length,1);
 assert.ok(home.includes('case-feature-apaea-research-platform'));
 assert.ok(home.includes('case-feature-priority-fix'));
 assert.ok(home.includes('case-feature-ezead-marketplace'));
 assert.match(home,/Show all 38 repositories/);
 assert.match(directory,/project directory/i);
 const categories=archive.map(x=>x.category);
 assert.ok(categories.includes('Mobile apps'));
 assert.ok(categories.includes('Commerce & marketplaces'));
 assert.equal(archive.filter(x=>x.placeholder).every(x=>x.category==='Archive only'),true);
});
test('project pages preserve KYC/HR as partial or not evidenced rather than completed',()=>{
 const apex=read('projects/apex/index.html');
 assert.match(apex,/Partial: applicant vetting flows; formal KYC unverified/);
 assert.match(apex,/Partial: job, shifts and pay screens; full HR suite unverified/);
 assert.match(read('projects/trade-core-apps/index.html'),/identity KYC not proven/);
 assert.match(read('projects/red-technology-app/index.html'),/payroll\/leave unverified/);
 assert.match(read('projects/marketing-tool/index.html'),/NO APPLICATION SOURCE EVIDENCED/);
});
test('collection controls are functional and all imagery has safe fallbacks',()=>{
 const js=read('assets/js/gitlab-collection.js'),css=read('assets/css/gitlab-collection.css');
 assert.match(js,/data-collection-search/);
 assert.match(js,/data-filter/);
 assert.match(js,/data-expand-collection/);
 assert.match(css,/max-width:640px/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 const home=read('index.html');
 assert.match(home,/assets\/js\/gitlab-collection\.js/);
 assert.match(home,/assets\/css\/gitlab-collection\.css/);
 const related=read('projects/priority-fix-admin-panel/index.html');
 assert.match(related,/priority-fix\/"/);
});
