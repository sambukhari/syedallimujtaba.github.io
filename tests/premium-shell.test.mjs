import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {renderSiteHeader,renderSiteFooter} from '../scripts/site-shell.mjs';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8');
const slugs=readdirSync(new URL('projects/',root),{withFileTypes:true}).filter(x=>x.isDirectory()&&!x.name.startsWith('_')).map(x=>x.name);
const archived=new Set(['hc','marketing-tool','sport-me-flutter']);
test('one canonical site shell renders the homepage, directory and all detail pages',()=>{
 assert.equal(slugs.length,42);
 const home=read('index.html'),dir=read('projects/index.html');
 for(const [name,html,base,page] of [['home',home,'','home'],['directory',dir,'../','projects'],...slugs.map(slug=>[slug,read('projects/'+slug+'/index.html'),'../../','detail'])]){
  const header=renderSiteHeader({root:base,page});
  const footer=renderSiteFooter({root:base,page});
  assert.ok(html.includes(header),name+' uses centralized header');
  assert.ok(html.includes(footer),name+' uses centralized footer');
  assert.equal((html.match(/class="site-header universal-header"/g)||[]).length,1,name+' has one header');
  assert.equal((html.match(/class="universal-footer"/g)||[]).length,1,name+' has one footer');
  assert.ok(html.includes(base+'assets/css/site-shell.css'),name+' references shared CSS');
  assert.ok(html.includes(base+'assets/js/site-shell.js'),name+' references shared JS');
  assert.ok(html.includes('aria-label="Main navigation"'),name+' has navigation landmarks');
 }
});
test('38 substantive projects appear, three archived placeholders do not',()=>{
 const home=read('index.html'),dir=read('projects/index.html');
 assert.equal((home.match(/class="gc-entry"/g)||[]).length,6);
 assert.equal((dir.match(/class="gc-entry"/g)||[]).length,38);
 for(const slug of archived){
  assert.ok(!dir.includes('href="'+slug+'/'),slug+' does not appear as current work');
  const html=read('projects/'+slug+'/index.html');
  assert.match(html,/<meta name="robots" content="noindex,follow">/,slug+' is an archived reference');
  assert.ok(html.includes('No application source')||html.includes('NO APPLICATION SOURCE'),slug+' does not invent a delivered feature');
 }
 for(const slug of ['priority-fix','apaea-research-platform','boxes-by-swagify','eze-auction','trade-core-apps']){
  assert.ok(dir.includes('href="'+slug+'/'),slug+' remains discoverable');
 }
 assert.ok(!home.includes('professional-work'));
});
test('motion is section visible, 5-stage, theme-linked, reduced-motion safe and not scroll-controlled',()=>{
 const src=read('src/page.html'),home=read('index.html'),js=read('assets/js/section-flow.js'),css=read('assets/css/premium.css');
 assert.ok(src.includes('assets/js/section-flow.js'));
 assert.ok(home.includes('assets/js/section-flow.js'));
 assert.ok(!home.includes('scroll-story.js'));
 assert.equal((home.match(/class="story-mobile-beat"/g)||[]).length,5);
 assert.match(js,/new IntersectionObserver/);
 assert.match(js,/setTimeout\(next/);
 assert.match(js,/prefers-reduced-motion/);
 assert.match(css,/--ui-accent/);
 assert.match(css,/section-flowing/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.doesNotMatch(js,/addEventListener\(['"]scroll|scrollY|scrollIntoView/);
});
test('career is newest to oldest, including overlapping employment dates',()=>{
 const home=read('index.html'),js=read('assets/js/v4.js');
 const section=home.slice(home.indexOf('id="journey"'),home.indexOf('id="about"'));
 const names=['EzeAD Media Group','Pixart Pte. Ltd.','MyTechPal','Syntax Software House'];
 const positions=names.map(x=>section.indexOf(x));
 assert.ok(positions.every(x=>x>0));
 assert.ok(positions.every((x,i)=>i===0||x>positions[i-1]));
 assert.ok(js.indexOf("'2025–Present'")<js.indexOf("'2015–2016'"));
 assert.ok(home.includes('MyTechPal')&&home.includes('Pixart'));
});
