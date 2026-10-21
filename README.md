# Syed Ali Mujtaba Shah - Portfolio

An editorial, static portfolio for a Tech Lead and Senior Full-Stack Engineer. Warm paper, ink, cobalt and a custom interactive CSS-3D sculpture. No runtime framework, remote fonts, animation library, analytics tracker or build service is required.

## Develop

Open `index.html`, or run `python -m http.server 8000` from this folder.

Use Node 20 or later for content generation and checks. There are no npm dependencies to install:

```sh
npm run build
npm run check
```

`index.html` is generated and committed. GitHub Pages serves it directly. Keep the existing publishing settings. Merge the review branch into the configured publishing source when approved; a pull request is not a deployment. All internal assets use relative paths, including project-site subpaths.

## Structure

- `index.html`: semantic page and static project markup.
- `assets/css/style.css`: responsive visual system and CSS-3D geometry.
- `assets/js/main.js`: navigation, filters, layer controls and copy-email enhancement.
- `assets/data/projects.json`: structured public project content.
- `assets/resume/`: resume downloads. The repository's existing PDFs are retained; no resume rewrite in this phase. The standalone conversation ZIP includes the CV supplied in the conversation at the linked download path.
- `scripts/build.mjs`: validating, HTML-escaping project renderer.
- `tests/`: content/integrity tests and optional Chromium interaction checks.
- `docs/PROJECT_INTAKE.md`: project submission template.

Older repository assets are retained for rollback, not loaded automatically. A canonical URL and social-preview image should be set after the live URL and final assets are confirmed.

## Add project material

Start with `docs/PROJECT_INTAKE.md`. Edit one object in `assets/data/projects.json`, run `npm run build` and `npm run check`, then commit the data, image files and regenerated HTML together. Do not edit the generated section between `PROJECTS:START` and `PROJECTS:END` directly.

A screenshot needs `src`, `alt`, `width`, `height` and an optional `caption`. Use actual files under `assets/images/projects/`. The first becomes the cover; subsequent images become the gallery. Without images, the cover remains abstract typography, not a fake product screenshot.

Each link needs `label` and an actual absolute HTTPS `url`. Empty `links` arrays produce no dummy Live/Code buttons. To publish a full case study, set `status` to `case-study`, supply `challenge`, a non-empty `decisions` array and `outcome`.

Metrics require `value`, `label`, `verified: true` and a public HTTPS `source`. This is an author-approval gate, not an automated truth check. Do not publish confidential evidence. Use a specific qualitative outcome where a number cannot be substantiated or disclosed.

## Content provenance and confirmations

Career history and three initial project overviews are based on the supplied CV. The existing site's email, `syedallimujtaba@gmail.com`, is preserved. The CV prints `syedallimujtabab@gmail.com` instead; confirm the primary address before aligning the resume and LinkedIn.

Dates, overlapping roles and `Present` follow the CV. Employment types and whether both ongoing roles remain current need confirmation. Project names for the HR/payroll and commerce work are descriptive, since approved public product names and URLs were not provided.

No project outcome metrics, ratings, testimonials, product screenshots or detailed system architectures have been invented. Project `metrics`, `links` and `screenshots` arrays are empty until evidence is supplied. The CV contains quantitative claims; these are deferred for confirmation rather than silently presented as independently verified facts. The 15+ team in Experience is cross-functional, not engineers only.

LinkedIn is linked, not edited. The resume is not rewritten in this phase.

## Accessibility and performance

Essential content, native details, mail links and downloads work without JavaScript. Mobile navigation has expanded state, Escape handling and focus management. Filters announce results. The 3D object is decorative; meaningful controls have accessible names. Optional pointer motion respects reduced-motion settings and uses no continuous animation loop.

No custom cursor, scroll hijacking, autoplay video or pretend contact-form success. Copy reports failure when the Clipboard API is unavailable. These are implementation choices, not formal WCAG certification or a guaranteed performance score.

## Tests

`npm run check` validates JavaScript syntax, regenerated HTML, project data, escaping, safe links, screenshots, evidence gates and local asset paths.

Optional browser checks:

```sh
python -m pip install playwright
python -m playwright install chromium
python tests/browser_smoke.py
```

Set `BROWSER_EXECUTABLE` for an existing Chromium binary. The browser script uses the exact markup, CSS and JS in-memory, allowing network-restricted execution. It tests interactions and layout, not HTTP delivery, deployment or third-party URLs. Screenshots go to ignored `qa-output/`. Review the deployed website after merge.
