import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateProjects, renderProjects, escapeHTML } from '../scripts/build.mjs';
const projects = JSON.parse(await readFile(new URL('../assets/data/projects.json', import.meta.url), 'utf8'));
const fresh = () => structuredClone(projects);
test('all current project overviews validate', () => assert.equal(validateProjects(fresh()).length, 3));
test('duplicate project slugs are rejected', () => {
  const p = fresh(); p[1].id = p[0].id;
  assert.throws(() => validateProjects(p), /unique/);
});
test('empty collections fail safely', () => assert.throws(() => validateProjects([]), /non-empty/));
test('invalid categories and featured flags are rejected', () => {
  const p = fresh(); p[0].category = 'unknown';
  assert.throws(() => validateProjects(p), /category/);
  p[0].category = 'web'; p[0].featured = 'true';
  assert.throws(() => validateProjects(p), /boolean/);
});
test('authored text is HTML-escaped', () => {
  assert.equal(escapeHTML('<script>"&\''), '&lt;script&gt;&quot;&amp;&#39;');
  const p = fresh(); p[0].summary = '<script>alert("x")</script>';
  assert.ok(!renderProjects(p).includes('<script>'));
  assert.ok(renderProjects(p).includes('&lt;script&gt;'));
});
test('unsafe and credential-bearing URLs are rejected', () => {
  for (const url of ['javascript:alert(1)', '/not-a-live-link', 'https://user:secret@example.com']) {
    const p = fresh(); p[0].links = [{ label: 'Live', url }];
    assert.throws(() => validateProjects(p), /HTTPS/);
  }
});
test('empty URLs do not become fake action buttons', () => {
  assert.ok(!renderProjects(fresh()).includes('href="#"'));
  assert.ok(!renderProjects(fresh()).includes('class="project-links"'));
});
test('screenshots require safe paths, alt text and dimensions', () => {
  for (const screenshot of [
    { src: 'assets/images/projects/../../private.png', alt: 'Screen', width: 800, height: 600 },
    { src: 'assets/images/projects/demo.png', alt: '', width: 800, height: 600 },
    { src: 'assets/images/projects/demo.png', alt: 'Screen', width: 0, height: 600 }
  ]) {
    const p = fresh(); p[0].screenshots = [screenshot];
    assert.throws(() => validateProjects(p), /Screenshots/);
  }
});
test('screenshots replace abstract covers', () => {
  const p = fresh(); p[0].screenshots = [{ src: 'assets/images/projects/demo.png', alt: 'Approved screen', width: 800, height: 600 }];
  assert.match(renderProjects(p), /class="project-cover photo-cover"/);
  assert.match(renderProjects(p), /alt="Approved screen" width="800" height="600" loading="lazy"/);
});
test('unapproved or unsourced metrics are rejected', () => {
  const p = fresh(); p[0].metrics = [{ value: '40%', label: 'Time saved', verified: false }];
  assert.throws(() => validateProjects(p), /approved metrics/);
  p[0].metrics[0].verified = true;
  assert.throws(() => validateProjects(p), /approved metrics/);
});
test('approved metrics include evidence links', () => {
  const p = fresh(); p[0].metrics = [{ value: '40%', label: 'Time saved', verified: true, source: 'https://example.com/approved-evidence' }];
  assert.match(renderProjects(p), /Evidence for Time saved/);
});
test('full case studies require challenge, decisions and outcome', () => {
  const p = fresh(); p[0].status = 'case-study';
  assert.throws(() => validateProjects(p), /challenge/);
  Object.assign(p[0], { challenge: 'A documented problem.', decisions: ['A supported decision.'], outcome: 'A documented outcome.' });
  assert.match(renderProjects(p), /Read case study/);
});
