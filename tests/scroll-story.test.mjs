import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
<<<<<<< HEAD
test('career flow is driven by scroll position through IntersectionObserver, not timers',()=>{
 const js=read('assets/js/scroll-scene.js');
 assert.match(js,/IntersectionObserver/);
 assert.match(js,/portfolio:section-stage/);
 assert.match(js,/requestAnimationFrame/);
 assert.doesNotMatch(js,/setTimeout|setInterval/);
 assert.match(read('assets/js/main.js'),/portfolio:section-stage/);
 for(const f of ['src/page.html','index.html'])assert.match(read(f),/assets\/js\/scroll-scene\.js/);
 assert.doesNotMatch(read('index.html'),/section-flow\.js|scroll-story\.js/);
=======
test('AI flow progresses on section visibility rather than scroll position',()=>{
 const js=read('assets/js/section-flow.js');
 assert.match(js,/IntersectionObserver/);
 assert.match(js,/portfolio:section-stage/);
 assert.match(js,/setTimeout\(next/);
 assert.doesNotMatch(js,/addEventListener\(['"]scroll|scrollY|scrollIntoView|scrollTo\(/);
 assert.match(read('assets/js/main.js'),/portfolio:section-stage/);
 assert.doesNotMatch(read('src/page.html'),/scroll-story\.js|scroll-story\.css/);
 assert.doesNotMatch(read('index.html'),/scroll-story\.js|scroll-story\.css/);
>>>>>>> 7642daad2140afd60b6a0459c9757d77237b8a19
});
test('hero and experience timeline remain in normal flow, newest experience first',()=>{
 for(const name of ['src/page.html','index.html']){
  const s=read(name);
  assert.ok(s.indexOf('class="hero-copy"')<s.indexOf('id="story-track"'));
  assert.match(s,/id="system-studio" data-mode="ai" data-step="0"/);
  assert.equal((s.match(/data-story-chapter="\d"/g)||[]).length,5);
  assert.match(s,/Five interactive stages/);
<<<<<<< HEAD
  assert.match(s,/data-story-chapter="0"[^\n]*DISCOVER/);
=======
>>>>>>> 7642daad2140afd60b6a0459c9757d77237b8a19
  assert.doesNotMatch(s,/Scroll through five engineering decisions/);
  assert.ok(s.indexOf('data-vision="0"')<s.indexOf('data-vision="6"'));
 }
 const s=read('src/page.html');
 assert.match(s,/data-vision="0"[^\n]*EzeAD Media Group/);
 assert.match(read('assets/js/v4.js'),/2025–Present/);
});
test('human review, accessible reduced motion and orange stage palette persist',()=>{
 assert.match(read('assets/js/main.js'),/Approve in demo/);
<<<<<<< HEAD
 assert.match(read('assets/js/scroll-scene.js'),/prefers-reduced-motion/);
 assert.match(read('assets/css/premium.css'),/prefers-reduced-motion:reduce/);
 assert.match(read('assets/css/premium.css'),/--ui-accent/);
 assert.match(read('assets/css/motion.css'),/story-p/);
=======
 assert.match(read('assets/js/section-flow.js'),/prefers-reduced-motion/);
 assert.match(read('assets/css/premium.css'),/prefers-reduced-motion:reduce/);
 assert.match(read('assets/css/premium.css'),/--ui-accent/);
 assert.match(read('assets/css/premium.css'),/section-flowing/);
>>>>>>> 7642daad2140afd60b6a0459c9757d77237b8a19
});
