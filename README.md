# Ali Mujtaba - Intelligence, engineered

A new portfolio direction for Syed Ali Mujtaba Shah: AI agents and automation first, grounded in full-stack engineering and technical leadership. Dark editorial typography, acid-green accents, an original interactive 3D sculpture, SVG skill icons, and a locally simulated automation lab.

## Run and publish

The root `index.html` is already rendered and is suitable for the existing GitHub Pages repository-root publishing setup. No application server, npm dependency, API key, or paid 3D service is required.

For local development with Node 20+:

```sh
npm run build
npm run check
python -m http.server 8000
```

Open `http://localhost:8000`. Use a server rather than opening the source `index.html` as a file: browsers restrict JavaScript module imports from `file://`. The separately supplied standalone preview is designed for opening directly.

`npm run build` updates the generated project and skill content in `index.html` and produces `dist/`. Commit the updated root HTML together with source/data changes. Do not commit `dist/`. Merge the redesign pull request into the repository's configured publishing branch to publish; this branch itself does not alter Pages settings.

## Structure

- `index.html`: semantic page, conceptual project illustrations, career history, contact, and generated content.
- `assets/css/style.css`: responsive visual system, motion preferences, print layout, and fallbacks.
- `assets/js/main.js`: navigation, skill filters, clipboard handling, local workflow simulation, and scene loading.
- `assets/js/scene.js`: original 3D renderer and interaction lifecycle.
- `assets/images/symbols.svg`: brand and custom SVG icons; no icon fonts.
- `assets/data/projects.json`: project narratives, approved links, screenshots, and evidence.
- `assets/data/skills.json`: the 29 primary skill tiles and filter categories.
- `scripts/build.mjs`: dependency-free content validation and static output.
- `tests/`: source tests and the offline browser verification harness.

## The 3D implementation

The preferred path uses a custom GLSL ray-marched scene on native WebGL, with analytic surfaces, normals, procedural studio reflections, and a bounded render resolution. If WebGL is unavailable, a real triangle-based 3D software renderer uses interpolated normals and a depth buffer on Canvas 2D. The final fallback is a static SVG composition. No external textures, model files, 3D services, or rendering-library downloads are needed.

Drag horizontally to rotate; keyboard-accessible rotation buttons are adjacent to the scene. Animation can be paused. Reduced-motion preferences disable autoplay. Rendering is paused offscreen and when the document is hidden; resources are released on page exit. Native vertical scrolling is preserved on touch devices.

The design is bespoke, not a claim to be objectively the world's best or a claim to use Three.js. The original Instagram URLs could not be loaded in the implementation environment; no claim is made to have watched or reproduced them.

## Automation lab

Lead routing, support triage, and reporting are fixed, fictional examples. The visitor must approve the proposed action before the demo completes. Changing scenarios cancels pending timers. Reset returns to the ready state. The demo sends no data, calls no model, and creates no records or messages. It is visibly labelled as a local simulation, not a live AI agent or a client success story.

## Add evidence

Edit an existing project in `assets/data/projects.json`, then run the build. Supported optional fields:

```json
{
  "problem": "The actual business problem",
  "architecture": "Your actual architecture decisions",
  "tradeoffs": "Alternatives you considered and why",
  "screenshots": [
    {"src": "assets/projects/example/overview.webp", "alt": "Describe the real product screen", "caption": "What this screen demonstrates"}
  ],
  "links": [{"label": "Live product", "url": "https://example.com/"}],
  "metrics": [{"value": "Verified value", "label": "What improved", "source": "Approved evidence reference", "approved": true}]
}
```

These are schema examples, not published claims. New projects also need a visual article with the matching `data-project` identifier in the HTML. Use `docs/PROJECT_INTAKE.md` for gathering material. Never commit confidential customer data or unapproved screenshots to this public repository.

Current work covers are clearly labelled conceptual illustrations, not product screenshots. The three initial project overviews derive from the supplied CV. Their links, screenshots, and metrics arrays remain empty rather than inventing evidence.

## Content decisions

The existing public contact address, `syedallimujtaba@gmail.com`, is retained. The uploaded CV has an extra `b` in its email spelling; confirm that separately before the resume/LinkedIn phase. Employment dates, including overlaps and ongoing roles, are retained from the CV and should be reconfirmed before a resume rewrite. AI agents and automation are emphasized based on the owner's explicit update; no unprovided AI tools, employers, client projects, or outcomes are claimed.

This change does not replace either PDF in the GitHub repository or edit LinkedIn. The separately supplied offline preview/source bundle contains the CV attached in this conversation so its download works offline; the repository keeps its existing public resume asset.

## Verification and limits

`npm run check`: 24 tests, syntax checks, and deterministic generated-content validation.

`python tests/browser_smoke.py`: 105 browser checks, including 320-1920px layouts, expanded details, filters, navigation focus, local workflow approval/reset/cancellation, no-JavaScript content, reduced motion, clipboard denial/success, live 3D drag/rotation, pause, and offscreen stopping.

Browser navigation is blocked in the implementation environment, so the harness mounts the exact HTML/CSS/JS in memory, inlines local SVG references, and substitutes only module transport. The actual software 3D fallback is executed. Hardware WebGL and external font delivery were not available; the accelerated shader path is not certified by these checks. No live deployment, Safari/Firefox, Lighthouse score, or WCAG conformance claim is made.

Review the deployed site after merging. Main content remains available if JavaScript, WebGL, or the optional Google Fonts request is unavailable. No tracking is included.
