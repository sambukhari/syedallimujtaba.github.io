import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const file=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('scroll workflow is controlled only by visitor scrolling',()=>{const s=file('assets/js/scroll-story.js');assert.match(s,/addEventListener\('scroll',onScroll/);assert.doesNotMatch(s,/setInterval|previewTimer|scrollTo\(|scrollIntoView\(|preventDefault\(/);});
test('hero is independent from the scene and both files start at stage zero',()=>{for(const p of ['src/page.html','index.html']){const s=file(p);assert.ok(s.indexOf('<div class="hero-copy">')<s.indexOf('<div class="story-track"'));assert.match(s,/id="system-studio" data-mode="ai" data-step="0"/);assert.equal((s.match(/data-story-chapter="/g)||[]).length,5);}});
test('manual review and reduced motion are preserved',()=>{assert.match(file('assets/js/main.js'),/Approve in demo/);assert.match(file('assets/css/scroll-story.css'),/prefers-reduced-motion/);});
