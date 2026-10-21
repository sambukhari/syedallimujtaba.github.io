import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
const refs = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
test('one main, one h1 and unique IDs', () => {
  assert.equal((html.match(/<main\b/g) ?? []).length, 1);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.equal(ids.length, new Set(ids).size);
});
test('internal navigation targets exist', () => {
  for (const ref of refs.filter((r) => r.startsWith('#'))) {
    assert.ok(ref !== '#'); assert.ok(ids.includes(ref.slice(1)), ref);
  }
});
test('relative assets exist and support project subpaths', async () => {
  for (const ref of refs.filter((r) => !/^(?:https?:|mailto:|#)/.test(r))) {
    assert.ok(!ref.startsWith('/')); assert.ok(!ref.includes('..'));
    await access(resolve(root, ref));
  }
});
test('no remote runtime assets, inline handlers or pretend form', () => {
  assert.ok(!/<script[^>]*src="https?:/i.test(html));
  assert.ok(!/<link[^>]*href="https?:/i.test(html));
  assert.ok(!/\son(?:click|load|error|submit)=/i.test(html));
  assert.ok(!/<form\b/i.test(html));
});
test('new tabs disclose behavior and use safe rel values', () => {
  for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>[\s\S]*?<\/a>/g)) {
    assert.match(match[0], /rel="noopener noreferrer"/);
    assert.match(match[0], /opens in a new tab/);
  }
});
test('Person metadata is valid', () => {
  const person = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(person.name, 'Syed Ali Mujtaba Shah'); assert.equal(person['@type'], 'Person');
});
test('three project overviews are static HTML', () => {
  assert.equal((html.match(/class="project-card(?: project-featured)?"/g) ?? []).length, 3);
  for (const company of ['EzeAD', 'MyTechPal', 'Pixart']) assert.ok(html.includes(company));
});
