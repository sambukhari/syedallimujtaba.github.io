import {readFile,writeFile} from 'node:fs/promises';
import {compile} from 'tailwindcss';
const source=await readFile('assets/css/tailwind.source.css','utf8');
const html=await readFile('src/page.html','utf8');
const classes=[...new Set([...html.matchAll(/class="([^"]+)"/g)].flatMap(m=>m[1].split(/\s+/)))].filter(Boolean);
const sheet=await compile(source);
await writeFile('assets/css/tailwind.generated.css',sheet.build(classes));
