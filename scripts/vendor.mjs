// Optional: npm install --ignore-scripts, npm run vendor, npm run build.
// Self-host the pinned dependency instead of loading it from jsDelivr.
import {cp,mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const src=path.join(root,'node_modules/three');
try{const pkg=JSON.parse(await readFile(path.join(src,'package.json'),'utf8'));if(pkg.version!=='0.180.0')throw Error('Expected Three.js 0.180.0');
const dest=path.join(root,'assets/vendor/three');await mkdir(dest,{recursive:true});
await cp(path.join(src,'build'),path.join(dest,'build'),{recursive:true});await cp(path.join(src,'examples/jsm'),path.join(dest,'addons'),{recursive:true});await cp(path.join(src,'LICENSE'),path.join(dest,'LICENSE'));
const page=path.join(root,'src/page.html');let html=await readFile(page,'utf8');html=html.replace('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js','./assets/vendor/three/build/three.module.js').replace('https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/','./assets/vendor/three/addons/');await writeFile(page,html);console.log('Pinned Three.js copied locally. Run npm run build and commit generated HTML and vendor assets.');
}catch(e){console.error('Vendoring failed:',e.message);process.exitCode=1;}
