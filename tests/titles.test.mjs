import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
const root=new URL('../projects/',import.meta.url);
const manifests=readdirSync(root,{withFileTypes:true}).filter(d=>d.isDirectory()&&existsSync(new URL(d.name+'/project.json',root))).map(d=>JSON.parse(readFileSync(new URL(d.name+'/project.json',root),'utf8')));
const norm=t=>t.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,' ').trim();
test('every project title is unique after normalisation',()=>{
 const seen=new Map();
 for(const m of manifests){const k=norm(m.title);assert.ok(!seen.has(k),`Duplicate title: ${m.title} / ${seen.get(k)}`);seen.set(k,m.title)}
 assert.ok(manifests.length>=40);
});
test('no title is a bare prefix of another title (avoids look-alike names)',()=>{
 const titles=manifests.map(m=>norm(m.title));
 for(const a of titles)for(const b of titles)if(a!==b)assert.ok(!b.startsWith(a+" "),`Title "${a}" is a bare prefix of "${b}"`);
});
test('empty repositories are explicitly inactive and labelled as such',()=>{
 const empty=manifests.filter(m=>m.placeholder);
 assert.deepEqual(empty.map(m=>m.slug).sort(),['hc','marketing-tool','sport-me-flutter']);
 for(const m of empty){assert.equal(m.status,'inactive');assert.match(m.title,/Inactive/)}
});
