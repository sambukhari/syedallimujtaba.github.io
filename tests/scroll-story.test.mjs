import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=file('index.html'),template=file('src/page.html'),main=file('assets/js/main.js'),scroll=file('assets/js/scroll-story.js'),css=file('assets/css/scroll-story.css'),scene=file('assets/js/scene.js');
test('generated page and template expose the same accessible five-stage narrative',()=>{
 for(const source of [html,template]){
  assert.match(source,/id="story-track"/);
  assert.match(source,/id="scroll-progress-fill"/);
  assert.match(source,/id="scroll-story-state"/);
  for(let n=0;n<5;n++)assert.match(source,new RegExp('data-story-chapter="'+n+'"'));
  assert.match(source,/href="#work">Continue to projects/);
  assert.match(source,/assets\/js\/scroll-story\.js/);
 }
});
test('scroll controller progresses through all stages without blocking scroll or changing location',()=>{
 assert.match(scroll,/Math\.floor\(value\*5\)/);
 assert.match(scroll,/CustomEvent\('portfolio:scroll-stage'/);
 assert.match(main,/portfolio:scroll-stage/);
 assert.match(scroll,/rootMargin/);
 assert.doesNotMatch(scroll,/preventDefault\(|location\.href\s*=|scrollTo\(|scrollIntoView\(/);
});
test('manual demo still requires review approval and motion remains optional',()=>{
 assert.match(main,/awaitingReview/);
 assert.match(main,/Approve in demo/);
 assert.match(scroll,/prefers-reduced-motion/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(scroll,/IntersectionObserver/);
 assert.match(scene,/scroll-flowing/);
});
