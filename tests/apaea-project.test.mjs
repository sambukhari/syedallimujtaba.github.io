import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseInventory,loadCaseStudies,renderCaseCard,renderCasePage} from '../scripts/project-studies.mjs';
import {parseTableInventory} from '../scripts/research-case.mjs';
const file=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const root=new URL('../',import.meta.url).pathname;
const markdown=file('projects/apaea-research-platform/APAEA_PROJECT_MODULES_AND_FEATURES.md');
const manifest=JSON.parse(file('projects/apaea-research-platform/project.json'));

test('source Markdown inventory is complete, has 36 precise module records',()=>{
 const parsed=parseTableInventory(markdown,manifest);
 assert.equal(parsed.total,36);
 assert.deepEqual(parsed.counts,{main:34,core:0,excluded:2});
 assert.equal(parsed.groups.filter(g=>g.scope==='main').length,6);
 assert.deepEqual(parsed.modules.filter(m=>m.scope==='excluded').map(m=>m.title),['KYC','HR Management System']);
 assert.equal(parsed.modules.find(m=>m.number===2).status,'Present (limited)');
 assert.equal(parsed.modules.find(m=>m.number===36).status,'Present; live status unverified');
 assert.ok(parsed.modules.some(m=>m.title==='Conference Paper Review'&&/reviewer/i.test(m.functionality)));
 assert.ok(parsed.modules.every(m=>m.sources.length===0),'No fake per-module source paths');
 assert.match(markdown,/Only eight registered API endpoints were found/);
 assert.match(markdown,/migration definitions are missing/i);
 assert.match(markdown,/PayPal, email, protected routes and actual deployments were not tested/i);
 assert.equal(new Set(parsed.modules.map(m=>m.number)).size,36);
});
test('table parser refuses incorrect grouping, statuses and duplicate rows',()=>{
 const duplicated=markdown.replace('| 36 | PayPal Payment Handling', '| 1 | PayPal Payment Handling');
 assert.throws(()=>parseTableInventory(duplicated,manifest),/duplicate row/);
 const unknown=markdown.replace('| 36 | PayPal Payment Handling', '| 36 | PayPal Payment Handling').replace('Present; live status unverified |','Verified in production |');
 assert.throws(()=>parseTableInventory(unknown,manifest),/Unrecognized source status/);
 const bad={...manifest,moduleGroups:[...manifest.moduleGroups.slice(0,5),{title:'Platform & Integrations',numbers:[2,5,34]}]};
 assert.throws(()=>parseTableInventory(markdown,bad),/Ungrouped documented module 36/);
});
test('directory-driven generator renders APAEA without altering EzeAD',async()=>{
 const cases=await loadCaseStudies(root);
 assert.ok(cases.length>=2);
 const ezead=cases.find(x=>x.slug==='ezead-marketplace');
 const apaea=cases.find(x=>x.slug==='apaea-research-platform');
 assert.ok(ezead);
 assert.ok(apaea);
 assert.equal(apaea.parsed.total,36);
 assert.deepEqual(ezead.parsed.counts,{main:60,core:19,excluded:3});
 const card=renderCaseCard(apaea),html=renderCasePage(apaea);
 assert.ok(file('index.html').includes(card));
 assert.equal(file('projects/apaea-research-platform/index.html'),html);
 assert.equal((html.match(/class="cs-module" data-module-scope="main"/g)||[]).length,34);
 assert.equal((html.match(/<summary>KYC/g)||[]).length,1);
 assert.match(html,/HR Management System/);
 assert.match(html,/Eight API routes were identified/i);
 assert.match(html,/gitlab\.com\/sambukhari\/apaea\/-\/tree\/b0035edcc762299274b2da46345ded202b2a672b/);
 assert.match(html,/aria-label="Project media viewer"/);
 assert.equal((html.match(/data-gallery-open="/g)||[]).length,4);
 assert.equal((html.match(/data-workflow-switch="/g)||[]).length,2);
 assert.ok(!html.includes('SEPARATE STOREFRONT MODULES'));
 assert.ok(!html.includes('Primary classifieds'));
 assert.ok(!html.includes('Stripe card gateway variants'));
 assert.ok(file('index.html').includes('projects/ezead-marketplace/'));
});
test('project SVG media has valid XML-escaped text',()=>{
 for(const name of ['cover.svg','editorial-flow.svg','membership-events.svg','research-network.svg']){
   const svg=file('projects/apaea-research-platform/assets/'+name);
   assert.ok(svg.startsWith('<svg '));
   assert.ok(svg.endsWith('</svg>'));
   assert.doesNotMatch(svg,/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-f]+;)/i);
 }
});
test('case output is semantic, accessibly interactive and honest about evidence',()=>{
 const html=file('projects/apaea-research-platform/index.html');
 assert.match(html,/id="module-search"/);
 assert.match(html,/id="module-status"/);
 assert.match(html,/aria-pressed="true"/);
 assert.match(html,/data-flow-detail="/);
 assert.match(html,/rel="noopener noreferrer"/);
 assert.match(html,/not found in the inspected source/i);
 assert.match(html,/APAEA_AI_CONTEXT\.md/);
 assert.match(html,/not actual screenshots/i);
 assert.match(html,/Real payment processing and provider activation have not been verified/i);
 assert.match(file('assets/css/research-case.css'),/prefers-reduced-motion:reduce/);
 assert.match(file('assets/css/project-studies.css'),/max-width:650px/);
});
