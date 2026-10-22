import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
const root=new URL('../',import.meta.url),file=p=>readFileSync(new URL(p,root),'utf8');
test('portrait is a local, eager, shareable image without altering the workflow',()=>{
 const image=statSync(new URL('assets/images/ali-mujtaba-executive.webp',root));
 assert.ok(image.size>20000&&image.size<180000,'portrait should be visually useful but lightweight');
 for(const p of ['src/page.html','index.html']){
   const s=file(p);
   assert.match(s,/src="assets\/images\/ali-mujtaba-executive\.webp"/);
   assert.match(s,/loading="eager" decoding="async"/);
   assert.match(s,/fetchpriority="high"/);
   assert.ok(s.indexOf('hero-portrait-card')<s.indexOf('id="story-track"'),'portrait must be in header before the workflow');
   assert.match(s,/id="system-studio" data-mode="ai" data-step="0"/);
   assert.match(s,/id="journey"/);
   assert.match(s,/id="contact-form"/);
   assert.doesNotMatch(s,/data:image\/webp;base64/i);
 }
});
test('portrait animation gracefully disables on touch/reduced motion',()=>{
 const script=file('assets/js/portrait.js'),style=file('assets/css/portrait.css');
 assert.match(script,/prefers-reduced-motion: reduce/);
 assert.match(script,/pointer: fine/);
 assert.match(script,/portfolio:motion/);
 assert.match(style,/prefers-reduced-motion:reduce/);
 assert.match(style,/max-width:600px/);
});
