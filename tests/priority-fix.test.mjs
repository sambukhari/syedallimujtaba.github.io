import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parsePriorityFixInventory} from '../scripts/priority-fix.mjs';
import {loadCaseStudies,renderCaseCard,renderCasePage,parseInventory} from '../scripts/project-studies.mjs';
const file=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const markdown=file('projects/priority-fix/PROJECT_MODULES_AND_FEATURES.md'),manifest=JSON.parse(file('projects/priority-fix/project.json'));

test('uploaded Priority Fix brief has exactly four existing and four proposed features',()=>{
 const parsed=parsePriorityFixInventory(markdown);
 assert.deepEqual(parsed.counts,{main:4,core:0,excluded:0,existing:4,proposed:4});
 assert.equal(parsed.total,8);
 assert.deepEqual(parsed.groups[0].items.map(x=>x.title),['Tenant Access','Repair Requests','Repair Tracking','Notifications']);
 assert.deepEqual(parsed.groups[1].items.map(x=>x.title),['User Management','API for App','KYC','HR Management System']);
 assert.equal(parsed.groups[1].items.every(x=>/not claimed as implemented/.test(x.status)),true);
 assert.match(parsed.groups[0].items[1].functionality,/attach videos/);
 assert.match(parsed.groups[0].items[2].functionality,/confirm completion/);
 assert.deepEqual(parseInventory(markdown,manifest).counts,parsed.counts);
});
test('source parser rejects unsupported ambiguity and accidental scope inflation',()=>{
 assert.throws(()=>parsePriorityFixInventory(markdown.replace('## Requested Modules (Proposed Scope)','## Completed Features')),/distinct existing and proposed/);
 assert.throws(()=>parsePriorityFixInventory(markdown.replace('**KYC:**','**KYC Delivered:**').replace('Proposed modules are a feature list, not a claim that they are built','Proposed modules completed')),/Missing explicit source disclaimer/);
 assert.throws(()=>parsePriorityFixInventory(markdown.replace('4. **HR Management System:**','5. **HR Management System:**')),/Invalid proposed feature numbering/);
});
test('shared generator builds Priority Fix, EzeAD and APAEA without modifying their meaning',async()=>{
 const cases=await loadCaseStudies(new URL('../',import.meta.url).pathname);
 const tenant=cases.find(c=>c.slug==='priority-fix');
 const ezead=cases.find(c=>c.slug==='ezead-marketplace');
 const apaea=cases.find(c=>c.slug==='apaea-research-platform');
 assert.ok(tenant&&ezead&&apaea);
 assert.deepEqual(ezead.parsed.counts,{main:60,core:19,excluded:3});
 assert.deepEqual(apaea.parsed.counts,{main:34,core:0,excluded:2});
 assert.equal(tenant.parsed.total,8);
 assert.ok(file('index.html').includes(renderCaseCard(tenant)));
 assert.equal(file('projects/priority-fix/index.html'),renderCasePage(tenant));
 assert.ok(file('index.html').includes('projects/ezead-marketplace/'));
 assert.ok(file('index.html').includes('projects/apaea-research-platform/'));
});
test('proposed modules are not misrepresented as shipped engineering',()=>{
 const html=file('projects/priority-fix/index.html');
 assert.equal((html.match(/class="cs-module" data-module-scope="main"/g)||[]).length,4);
 assert.equal((html.match(/class="pf-roadmap-card"/g)||[]).length,4);
 assert.equal((html.match(/PROPOSED · NOT BUILT/g)||[]).length,4);
 assert.match(html,/No code repository, project screenshots or verified runtime outcomes/);
 assert.match(html,/No code repository, project screenshots or verified runtime outcomes accompanied/);
 assert.match(html,/No app screenshots, recordings or production interface were uploaded/);
 assert.match(html,/data-flow-detail=/);
 assert.equal((html.match(/data-gallery-open="/g)||[]).length,3);
 assert.match(html,/aria-label="Project media viewer"/);
 assert.ok(!html.includes("github.com/priority-fix") && !html.includes("gitlab.com/priority-fix"));
 assert.doesNotMatch(html,/Laravel|React Native|production-ready/i);
 assert.match(file('assets/css/priority-fix.css'),/prefers-reduced-motion:reduce/);
});
test('three conceptual SVGs are XML-safe, without unsafe raw ampersands',()=>{
 for(const name of ['cover.svg','tenant-repair-flow.svg','proposed-scope.svg']){
  const xml=file('projects/priority-fix/assets/'+name);
  assert.match(xml,/^<svg xmlns/);
  assert.ok(xml.endsWith('</svg>'));
  assert.doesNotMatch(xml,/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;)/);
 }
});
