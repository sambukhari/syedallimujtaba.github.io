/** Dependency-free static project renderer. Run: node scripts/build.mjs */
import { readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
export const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
const string = (v) => typeof v === 'string' && v.trim().length > 0;
const imagePath = (v) => string(v) && /^assets\/images\/projects\/[a-zA-Z0-9_./-]+\.(png|jpe?g|webp|avif)$/i.test(v) && !v.includes('..');
const httpsURL = (v) => {
  try { const u = new URL(v); return u.protocol === 'https:' && !u.username && !u.password; }
  catch { return false; }
};
export function validateProjects(projects) {
  if (!Array.isArray(projects) || !projects.length) throw new Error('Projects must be a non-empty array.');
  const ids = new Set();
  for (const p of projects) {
    for (const key of ['id', 'number', 'category', 'company', 'title', 'shortTitle', 'summary', 'role', 'scope', 'contribution', 'coverLabel', 'coverWord', 'theme', 'status']) {
      if (!string(p[key])) throw new Error(`Missing ${key} in project ${p.id ?? '(unknown)'}`);
    }
    if (!/^[a-z0-9-]+$/.test(p.id) || ids.has(p.id)) throw new Error('Project IDs must be unique lowercase slugs.');
    ids.add(p.id);
    if (typeof p.featured !== 'boolean') throw new Error('featured must be a boolean.');
    if (!['web', 'mobile'].includes(p.category)) throw new Error(`Unknown category: ${p.category}`);
    if (!['blue', 'sand', 'ink'].includes(p.theme)) throw new Error(`Unknown theme: ${p.theme}`);
    if (!['overview', 'case-study'].includes(p.status)) throw new Error('Invalid publication status.');
    for (const key of ['tags', 'screenshots', 'links', 'metrics']) {
      if (!Array.isArray(p[key])) throw new Error(`${key} must be an array.`);
    }
    if (!p.tags.every(string)) throw new Error('Every tag must be a string.');
    for (const s of p.screenshots) {
      if (!imagePath(s.src) || !string(s.alt) || !Number.isInteger(s.width) || !Number.isInteger(s.height) || s.width <= 0 || s.height <= 0) {
        throw new Error('Screenshots need a safe local image path, descriptive alt text and positive integer dimensions.');
      }
    }
    for (const l of p.links) {
      if (!string(l.label) || !httpsURL(l.url)) throw new Error('Project links need a label and an absolute HTTPS URL.');
    }
    for (const m of p.metrics) {
      if (!string(m.value) || !string(m.label) || m.verified !== true || !httpsURL(m.source)) {
        throw new Error('Only approved metrics with a public HTTPS evidence source can be published. Keep private evidence out of this repository.');
      }
    }
    if (p.status === 'case-study' && (!string(p.challenge) || !string(p.outcome) || !Array.isArray(p.decisions) || !p.decisions.length || !p.decisions.every(string))) {
      throw new Error('A case study needs a challenge, explicit engineering decisions and an outcome.');
    }
  }
  return projects;
}
export function renderProjects(projects) {
  validateProjects(projects);
  return projects.map((p) => {
    const e = escapeHTML;
    const shot = p.screenshots[0];
    const gallery = p.screenshots.slice(1).map((s) => `<figure class="case-image"><img src="${e(s.src)}" alt="${e(s.alt)}" width="${s.width}" height="${s.height}" loading="lazy" decoding="async">${s.caption ? `<figcaption>${e(s.caption)}</figcaption>` : ''}</figure>`).join('\n');
    const cover = shot
      ? `<figure class="project-cover photo-cover"><img src="${e(shot.src)}" alt="${e(shot.alt)}" width="${shot.width}" height="${shot.height}" loading="lazy" decoding="async">${shot.caption ? `<figcaption>${e(shot.caption)}</figcaption>` : ''}</figure>`
      : `<div class="project-cover cover-${e(p.theme)}" aria-hidden="true"><span class="cover-label">${e(p.coverLabel)}</span><div class="cover-geometry"><i></i><i></i><i></i><i></i></div><span class="cover-word">${e(p.coverWord)}</span><span class="cover-index">${e(p.number)} / Engineering focus</span></div>`;
    const links = p.links.length ? `<div class="project-links">${p.links.map((l) => `<a href="${e(l.url)}" target="_blank" rel="noopener noreferrer">${e(l.label)} <span aria-hidden="true">&#8599;</span><span class="sr-only"> (opens in a new tab)</span></a>`).join('')}</div>` : '';
    const metrics = p.metrics.length ? `<dl class="project-metrics">${p.metrics.map((m) => `<div><dt>${e(m.label)}</dt><dd>${e(m.value)} <a href="${e(m.source)}" target="_blank" rel="noopener noreferrer" aria-label="Evidence for ${e(m.label)} (opens in a new tab)">&#8599;</a></dd></div>`).join('')}</dl>` : '';
    const narrative = p.status === 'case-study'
      ? `<h4>The challenge</h4><p>${e(p.challenge)}</p><h4>Engineering decisions</h4><ul>${p.decisions.map((d) => `<li>${e(d)}</li>`).join('')}</ul><h4>The outcome</h4><p>${e(p.outcome)}</p>`
      : `<p class="evidence-note">An overview from my professional experience. Product screenshots, architecture details and supporting results will be added as the full case study is documented.</p>`;
    return `<article class="project-card${p.featured ? ' project-featured' : ''}" id="${e(p.id)}" data-category="${e(p.category)}">
  ${cover}
  <div class="project-content">
    <p class="eyebrow project-meta"><span>${e(p.number)} / ${e(p.company)}</span><span>${p.status === 'case-study' ? 'Case study' : 'Project overview'}</span></p>
    <h3>${e(p.title).replace(/\n/g, '<br>')}</h3>
    <p class="project-summary">${e(p.summary)}</p>
    <ul class="tags" aria-label="Project technologies and focus">${p.tags.map((t) => `<li>${e(t)}</li>`).join('')}</ul>
    <details class="project-details">
      <summary>${p.status === 'case-study' ? 'Read case study' : 'Engineering overview'}<span class="detail-symbol" aria-hidden="true">+</span><span class="sr-only">: ${e(p.shortTitle)}</span></summary>
      <div class="detail-body"><h4>Scope</h4><p>${e(p.scope)}</p><h4>My contribution / ${e(p.role)}</h4><p>${e(p.contribution)}</p>${narrative}${metrics}${gallery}${links}</div>
    </details>
  </div>
</article>`;
  }).join('\n\n');
}
async function main() {
  const projects = JSON.parse(await readFile(resolve(root, 'assets/data/projects.json'), 'utf8'));
  const rendered = renderProjects(projects);
  for (const p of projects) for (const s of p.screenshots) await access(resolve(root, s.src));
  const path = resolve(root, 'index.html');
  const html = await readFile(path, 'utf8');
  const start = '<!-- PROJECTS:START -->';
  const end = '<!-- PROJECTS:END -->';
  if (html.split(start).length !== 2 || html.split(end).length !== 2 || html.indexOf(start) > html.indexOf(end)) throw new Error('Expected one ordered pair of project markers.');
  const output = html.slice(0, html.indexOf(start) + start.length) + '\n' + rendered + '\n        ' + html.slice(html.indexOf(end));
  if (process.argv.includes('--check')) {
    if (html !== output) throw new Error('Project HTML is stale. Run node scripts/build.mjs and commit index.html.');
    console.log(`Checked ${projects.length} static project overviews.`);
  } else {
    await writeFile(path, output);
    console.log(`Rendered ${projects.length} projects into index.html.`);
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
