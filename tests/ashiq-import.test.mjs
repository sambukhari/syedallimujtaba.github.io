import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {loadCaseStudies,renderCasePage} from '../scripts/project-studies.mjs';
import {parseGithubBrief} from '../scripts/github-brief.mjs';
const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const audit=JSON.parse(read('projects/github-ashiq-import-audit.json'));
const original={
 'boxes-by-swagify/sources/frontend/AI_CONTEXT.md':'9f362380a3fcb0e6d4b968d043399e9e7a9bb040182443cca00cde47aa8e2c33',
 'boxes-by-swagify/sources/frontend/PROJECT_MODULES_AND_FEATURES.md':'86806bdd4b5dba295392317c81ff41a8e5905fed1a09dcb566f829785750e397',
 'boxes-by-swagify/sources/backend/AI_CONTEXT.md':'a4dbc6bc456084f2d3e3fec400849d9b652ddb2c5758ad9e60fb9c8a96179eaa',
 'boxes-by-swagify/sources/backend/PROJECT_MODULES_AND_FEATURES.md':'432d9d582329015b7b249c81c89304aa25361ef38587582d7755cdc8baea794b',
 'php-class-utilities/AI_CONTEXT.md':'8bc36e600500fada1b4bf9c2e390c75189adc73b1f961b518c1bd1ef475f5dc3',
 'php-class-utilities/PROJECT_MODULES_AND_FEATURES.md':'a625df4938b37095fca8ab065e17a5c880d2f5ffe5f3f4b9832bb00cf0f56e1d',
 'resume-ezead/AI_CONTEXT.md':'d4e6404f46f255a9f02c45d82afd4f2fc47be95ccc9cf9337ab51dd028447bc8',
 'resume-ezead/PROJECT_MODULES_AND_FEATURES.md':'031880cd075a930e27f40f1d16ecdc179ca1144440d1261db42f0ef3bf0855b6'
};

test('Ashiq ZIP contains nine reviewed source repositories but adds only three distinct project entries',()=>{
 assert.equal(audit.repositoriesReviewed,9);
 assert.equal(audit.added.length,3);
 assert.equal(audit.skipped.length,5);
 assert.deepEqual(audit.added.map(x=>x.slug).sort(),['boxes-by-swagify','php-class-utilities','resume-ezead']);
 assert.equal(audit.added.flatMap(x=>x.repositories).length,4);
 assert.equal(new Set([...audit.added.flatMap(x=>x.repositories),...audit.skipped.map(x=>x.repository)].map(x=>x.toLowerCase())).size,9);
 assert.equal(audit.added.find(x=>x.slug==='boxes-by-swagify').repositories.length,2);
 assert.ok(audit.skipped.some(x=>x.repository.endsWith('/eze-homes')));
 assert.ok(audit.skipped.some(x=>x.repository.endsWith('/eze-autos')));
 assert.ok(audit.skipped.some(x=>x.repository.endsWith('/Ezead-Jobs')));
});
test('all eight original uploaded markdown files are byte-for-byte preserved',()=>{
 for(const [relative,sha256] of Object.entries(original)){
  const data=read('projects/'+relative);
  assert.equal(createHash('sha256').update(data).digest('hex'),sha256,'Uploaded evidence changed: '+relative);
 }
});
test('Boxes by Swagify is one case with exactly four storefront and four API modules, and both source repositories',()=>{
 const m=JSON.parse(read('projects/boxes-by-swagify/project.json'));
 const md=read('projects/boxes-by-swagify/PROJECT_MODULES_AND_FEATURES.md');
 const parsed=parseGithubBrief(md,m);
 assert.equal(parsed.modules.length,8);
 assert.equal(parsed.checklist.length,4);
 assert.deepEqual(m.sourceDirectories,['sources/frontend','sources/backend']);
 assert.match(m.repository,/BoxesbySwagify$/);
 assert.match(m.companionRepository,/BoxesbySwagifyBackend$/);
 assert.equal(m.modules.filter(x=>x.title.startsWith('Storefront · ')).length,4);
 assert.equal(m.modules.filter(x=>x.title.startsWith('Backend · ')).length,4);
 assert.match(md,/Storefront: Build-a-box, prebuilt boxes and product selection/);
 assert.match(md,/Backend API: Product, box, category and filtered catalog APIs/);
 const html=read('projects/boxes-by-swagify/index.html');
 assert.match(html,/ONE PRODUCT · TWO CODEBASES/);
 assert.match(html,/Vue storefront source/);
 assert.match(html,/Laravel backend source/);
 assert.match(html,/sources\/frontend\/PROJECT_MODULES_AND_FEATURES.md/);
 assert.match(html,/sources\/backend\/PROJECT_MODULES_AND_FEATURES.md/);
 assert.match(html,/reviewed branch: master/);
 assert.equal((html.match(/class="cs-module" data-module-scope="main"/g)||[]).length,8);
});
test('Resume EzeAD and legacy PHP classes remain distinct and accurately scoped',()=>{
 for(const [slug,count] of [['resume-ezead',4],['php-class-utilities',3]]){
  const m=JSON.parse(read('projects/'+slug+'/project.json'));
  const md=read('projects/'+slug+'/PROJECT_MODULES_AND_FEATURES.md');
  const parsed=parseGithubBrief(md,m);
  assert.equal(parsed.modules.length,count);
  assert.equal(parsed.checklist.length,4);
  assert.ok(parsed.checklist[2].startsWith('Not evidenced'));
  assert.ok(parsed.checklist[3].startsWith('Not evidenced'));
  assert.equal(parsed.modules.every((x,i)=>m.modules[i].source===x.functionality),true);
  assert.equal(m.renderer,'github-brief');
  assert.equal((read('projects/'+slug+'/index.html').match(/data-gallery-open="/g)||[]).length,2);
 }
 assert.match(read('projects/php-class-utilities/index.html'),/input validation and SQL-injection safety review/);
 assert.match(read('projects/resume-ezead/index.html'),/authoring profiles and showcasing work/);
 assert.match(read('projects/resume-ezead/PROJECT_MODULES_AND_FEATURES.md'),/professional profiles are not HR employee records/);
});
test('existing cases, source-backed pages and the explorer still build without duplicates',async()=>{
 const cases=await loadCaseStudies(root.pathname);
 assert.equal(cases.length,42);
 const featured=cases.filter(x=>!['gitlab-brief','github-brief'].includes(x.manifest.renderer));
 assert.equal(featured.length,3);
 const github=cases.filter(x=>x.manifest.renderer==='github-brief');
 assert.equal(github.length,5);
 const repoNames=cases.flatMap(x=>[x.manifest.repository,x.manifest.companionRepository].filter(Boolean));
 assert.equal(new Set(repoNames.map(x=>x.toLowerCase())).size,repoNames.length);
 for(const slug of ['boxes-by-swagify','resume-ezead','php-class-utilities','eze-auction','learn-skill-pro']){
  const c=cases.find(x=>x.slug===slug);assert.ok(c);
  assert.equal(read('projects/'+slug+'/index.html'),renderCasePage(c));
 }
 assert.ok(cases.some(x=>x.slug==='ezead-marketplace'));
 assert.ok(cases.some(x=>x.slug==='apaea-research-platform'));
 assert.ok(cases.some(x=>x.slug==='priority-fix'));
 const home=read('index.html'),directory=read('projects/index.html');
 assert.equal((home.match(/class="gc-entry"/g)||[]).length,6);
 assert.equal((directory.match(/class="gc-entry"/g)||[]).length,38);
 assert.match(home,/Explore all 38 projects/);
 assert.match(directory,/Developer tools/);
 assert.equal((home.match(/projects\/boxes-by-swagify\/assets\/cover.svg/g)||[]).length,1);
 assert.equal((home.match(/projects\/resume-ezead\/assets\/cover.svg/g)||[]).length,1);
 assert.equal((home.match(/projects\/php-class-utilities\/assets\/cover.svg/g)||[]).length,1);
});
test('three new project media folders contain labeled, XML-safe architecture diagrams',()=>{
 for(const slug of ['boxes-by-swagify','resume-ezead','php-class-utilities']){
  for(const image of ['cover.svg','workflow.svg']){
   const svg=read('projects/'+slug+'/assets/'+image);
   assert.match(svg,/^<svg /);
   assert.ok(svg.trimEnd().endsWith('</svg>'));
   assert.doesNotMatch(svg,/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-f]+;)/i);
   assert.match(svg,/NOT A PRODUCT SCREENSHOT|not a product screenshot/i);
  }
 }
});
