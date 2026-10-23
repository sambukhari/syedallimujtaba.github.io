import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadCaseStudies,renderCasePage} from '../scripts/project-studies.mjs';
import {parseGithubBrief} from '../scripts/github-brief.mjs';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8');
const audit=JSON.parse(read('projects/github-import-audit.json'));

test('GitHub ZIP import is unique: exactly 2 added and 13 skipped out of 15',()=>{
 assert.equal(audit.total,15);
 assert.equal(audit.added.length,2);
 assert.equal(audit.skipped.length,13);
 assert.deepEqual(audit.added.map(x=>x.slug).sort(),['eze-auction','learn-skill-pro']);
 const names=[...audit.added.map(x=>x.repository),...audit.skipped.map(x=>x.repository)];
 assert.equal(new Set(names.map(x=>x.toLowerCase())).size,15);
 assert.ok(audit.skipped.some(x=>x.repository.endsWith('support-chat-core')));
 assert.ok(audit.skipped.some(x=>x.repository.endsWith('chat-saas')));
 assert.ok(audit.skipped.some(x=>x.repository.endsWith('My-Muslim-Burial')));
 assert.ok(audit.skipped.some(x=>x.repository.endsWith('/zenith')));
 assert.ok(audit.skipped.some(x=>x.repository.endsWith('/ezadd')));
});
test('two new cases preserve literal source Markdown and evidence statuses',()=>{
 for(const slug of ['eze-auction','learn-skill-pro']){
  const prefix='projects/'+slug+'/';
  const m=JSON.parse(read(prefix+'project.json'));
  const md=read(prefix+'PROJECT_MODULES_AND_FEATURES.md');
  const context=read(prefix+'AI_CONTEXT.md');
  const parsed=parseGithubBrief(md,m);
  assert.equal(m.renderer,'github-brief');
  assert.equal(parsed.modules.length,5);
  assert.equal(parsed.checklist.length,4);
  assert.equal(parsed.total,9);
  assert.ok(parsed.checklist[2].startsWith('Not evidenced'));
  assert.ok(parsed.checklist[3].startsWith('Not evidenced'));
  assert.match(context,/not a runtime, security or deployment audit/i);
  assert.match(context,/Default branch reviewed/);
  assert.equal(m.modules.length,5);
  assert.equal(m.modules.every((x,i)=>x.source===parsed.modules[i].functionality),true);
  assert.ok(m.repository.startsWith('https://github.com/'));
  assert.ok(!md.includes('production-ready'));
  for(const name of ['assets/cover.svg','assets/workflow.svg']){
   const svg=read(prefix+name);
   assert.match(svg,/^<svg /);
   assert.ok(svg.endsWith('</svg>'));
   assert.doesNotMatch(svg,/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-f]+;)/i);
   assert.match(svg,/NOT A PRODUCT SCREENSHOT/);
  }
  const html=read(prefix+'index.html');
  assert.match(html,/GitHub repository/);
  assert.doesNotMatch(html,/GitLab repository/);
  assert.match(html,/GitHub source overview/i);
  assert.ok(html.includes(m.repository));
  assert.equal((html.match(/class="cs-module" data-module-scope="main"/g)||[]).length,5);
  assert.equal((html.match(/data-gallery-open="/g)||[]).length,2);
  assert.match(html,/source-described/i);
 }
 const eze=read('projects/eze-auction/index.html');
 assert.match(eze,/Bidding &amp; engagement/);
 assert.match(eze,/mostly starter route file; a dedicated mobile API is not confirmed/);
 const skill=read('projects/learn-skill-pro/index.html');
 assert.match(skill,/Certificates &amp; administration/);
 assert.match(skill,/payment evidence is not identity verification/);
});
test('GitHub import parser rejects repository mismatch and unsupported feature edits',()=>{
 const m=JSON.parse(read('projects/eze-auction/project.json'));
 const md=read('projects/eze-auction/PROJECT_MODULES_AND_FEATURES.md');
 assert.throws(()=>parseGithubBrief(md,{...m,repository:'https://github.com/sambukhari/other'}),/repository mismatch/i);
 assert.throws(()=>parseGithubBrief(md.replace('Bids, comments, favorites and reviews','AI-generated auction pricing'),m),/Unsupported or mismatched/);
 assert.throws(()=>parseGithubBrief(md.replace('Not evidenced in reviewed marketplace controllers.','Full KYC implemented.'),m),/checklist differs/i);
});
test('build contains no duplicate case cards or featured-project inflation',async()=>{
 const cases=await loadCaseStudies(root.pathname);
 assert.equal(cases.length,42);
 const featured=cases.filter(c=>!['gitlab-brief','github-brief'].includes(c.manifest.renderer));
 assert.equal(featured.length,3);
 const gitHub=cases.filter(c=>c.manifest.renderer==='github-brief');
 assert.equal(gitHub.length,5);
 for(const c of gitHub)assert.equal(read('projects/'+c.slug+'/index.html'),renderCasePage(c));
 const home=read('index.html'),index=read('projects/index.html');
 assert.equal((home.match(/class="gc-entry"/g)||[]).length,41);
 assert.equal((index.match(/class="gc-entry"/g)||[]).length,41);
 assert.equal((home.match(/projects\/eze-auction\/assets\/cover.svg/g)||[]).length,1);
 assert.equal((home.match(/projects\/learn-skill-pro\/assets\/cover.svg/g)||[]).length,1);
 assert.match(home,/Show all 41 projects/);
 assert.ok(home.includes('case-feature-ezead-marketplace'));
 assert.ok(home.includes('case-feature-priority-fix'));
 assert.ok(home.includes('case-feature-apaea-research-platform'));
 const seen=[...cases.map(c=>c.manifest.repository).filter(Boolean),...JSON.parse(read('assets/data/projects.json')).map(p=>p.repo)];
 const distinct=seen.map(s=>s.toLowerCase());
 assert.equal(new Set(distinct).size,distinct.length,'No repository may appear twice');
});
