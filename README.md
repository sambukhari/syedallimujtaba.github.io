# Ali Mujtaba - engineering with intent

A static, AI-first portfolio for Syed Ali Mujtaba Shah. This revision replaces the unrelated sculpture with an architectural system model, adds dimensional technology emblems, publishes three source-backed GitHub project overviews, and introduces an honest contact composer.

## Run

The committed root `index.html` works with the existing GitHub Pages repository-root setup. Preserve the repository subpath; all local asset links are relative.

```sh
npm run build
npm run check
python -m http.server 8000
```

Open `http://localhost:8000`. Node 20+ is required for build/check. Those commands need no installed dependencies. Do not open the source page with `file://`: browser module and SVG restrictions vary.

## Rendering and dependencies

Critical HTML, CSS, the architectural model and dimensional skill emblems render without Three.js. A pinned Three.js 0.180.0 import map enhances them when WebGL and the CDN are available. The entire page shares **one WebGL context** with scissored, visibility-aware views. Hero geometry is original procedural geometry; skill marks are extruded from the existing SVG sprite. Geometry and materials are reused. Pixel density is capped, hidden/offscreen scenes stop drawing, and motion respects both system preferences and the visitor's control.

The CSS fallback is a layered 3D composition: a physical board, monitor, phone, orchestration chip, tools block and review checkpoint. Technology marks use depth-separated vector layers, not just a tilted card. Two layers are shipped in HTML; intermediate layers are cloned once during enhancement to reduce repeated markup. CSS fallbacks remain visible until a view is rendered successfully. Context loss returns the page to CSS. Add `?no3d` to test the fallback explicitly.

The system is conceptual, not a live client architecture. Its request sequence stops at a human checkpoint; approving it sends nothing and performs no external action. AI, web and mobile modes change the explanatory focus. Adjacent HTML controls provide keyboard access independently of canvas interactions.

Three.js is optional at runtime. For self-hosting on an internet-connected machine:

```sh
npm install --ignore-scripts
npm run vendor
npm run build
npm run check
```

The vendor script checks the pinned version, copies the library and license under `assets/vendor/three/`, and updates the source import map. Commit the vendored assets and regenerated HTML when using this option. This optional install/vendor procedure was not executed in the restricted implementation environment. The default CDN version is pinned; external availability is not guaranteed.

Optional DM Sans and Space Grotesk fonts load through Google Fonts; system fonts remain usable when those requests fail. No font files are bundled. No analytics, API credentials, paid 3D services or backend are required.

## Source map

- `src/page.html`: editable page template; identity, conceptual model, professional work and contact.
- `src/career.html`: preserved career history from the supplied CV.
- `assets/data/projects.json`: the single source for public project cards and expanded implementation details.
- `assets/data/skills.json`: skill labels, groupings, colors, symbols and emphasis.
- `scripts/build.mjs`: validation, escaping and deterministic static rendering into `index.html` and `dist/`.
- `assets/css/style.css`: responsive design tokens, layered CSS geometry, motion and print styles.
- `assets/js/main.js`: progressive navigation, flow controls, skill filtering and contact behavior.
- `assets/js/scene.js`: optional shared-context Three.js enhancement, geometry and lifecycle.
- `assets/images/symbols.svg`: attributed brand and original capability symbols.
- `tests/`: content checks and offline Chromium behavior/layout checks.
- `docs/PROJECT_SOURCES.md`: sources, evidence limits and content reconciliation.
- `docs/ATTRIBUTION.md`: asset/library attribution.

After editing the template or data, run `npm run build` and commit the generated root HTML. Do not commit `dist/`, `node_modules/`, QA output, secrets or confidential evidence.

## Projects and content

Three repositories are presented: `support-chat-core`, `laravel-exception-alert`, and `chat-saas`. The narratives distinguish source inspection from deployment or operational evidence. Public source links are visible inside each native HTML detail panel. No downloads, customer counts, ratings, performance results or screenshots were invented. Diagrams are explicitly explanatory illustrations, not product screenshots.

`support-chat-core` is described as a realtime support-chat core, not an AI agent. `chat-saas` was inspected beyond its boilerplate README; its narrative covers company-scoped chat workflows found in its routes/controller, not inferred billing or production capabilities. See the provenance document for exact reviewed files.

The three CV-based professional overviews remain separate from these public repositories. Client screenshots and detailed case-study evidence still need owner approval. Use `docs/PROJECT_INTAKE.md` to collect them. AI agents/automation positioning comes from the owner's explicit update. Specific AI vendor tools are not claimed without evidence.

## Contact

The contact form is a **local email-draft composer**, not a submission service. It validates input and opens a prefilled `mailto:` draft. The visitor still reviews and sends it in their email application. Copy-message and manual-copy fallbacks are provided. Clipboard failure is reported honestly. Nothing is sent or stored by this site. Without JavaScript, direct email/social/resume links remain available and form controls are hidden to prevent accidental GET submission.

No new server-side or third-party endpoint was configured. Adding one is a separate integration that must include privacy, validation, spam controls and truthful delivery states.

The existing public email, `syedallimujtaba@gmail.com`, is preserved. The attached CV prints `syedallimujtabab@gmail.com`; the owner should confirm the intended spelling. Career date overlaps and ongoing roles are retained from the CV, not silently reconciled. Public repository PDFs and legacy image assets are not replaced by this revision. LinkedIn is unchanged.

## Verification performed

- `npm run build`: generated three project overviews and 29 skill entries.
- `npm run check`: 25 Node tests plus JavaScript syntax and generated-content checks passed.
- `python tests/browser_smoke.py`: 95 Chromium checks passed, including 320-1920px layouts, expanded details, filters, conceptual approval flow, mobile menu/focus, clipboard success/denial, inquiry behavior, no-JavaScript layouts, reduced motion and offscreen stopping.
- Desktop, tablet, mobile and section screenshots were visually reviewed internally.

The browser harness requires Python Playwright and Chromium at `/usr/bin/chromium`; adjust the executable path for a different local installation.

### Verification limits

The available browser blocks navigation and cannot create a WebGL context. Tests mount the actual HTML/CSS/main JS in memory, inline local SVG references, suppress only hash-navigation transport, and use the real CSS-3D geometry. They do not mock business/UI behavior. Mailto state is captured before the blocked external navigation. The Three.js module passed syntax/source checks, but **its actual WebGL rendering was not executable here**. No hardware-WebGL, deployed browser, CDN/font delivery, Safari/Firefox, WCAG certification, Lighthouse or field performance claim is made.

The owner authorized merging into main; review the accelerated rendering on a normal browser after deployment. The complete CSS fallback is independent of that enhancement. Performance and accessibility remain design targets, not fabricated benchmark scores.

## Publish

Work is prepared on `portfolio/meaningful-systems-v3`. The owner explicitly authorized merging this redesign into `main`. Existing Pages settings are preserved. After merging, verify the deployment status and live subpath, assets, contact actions and resume link.


## V5 visual storytelling
The new design retains the existing architectural 3D model and genuine project evidence. It adds a five-stage illustrative client workflow tied to the interactive model, a seven-chapter accessible career reel, and a warm porcelain / aubergine / copper art direction. Reel imagery is conceptual, not employer footage. Overlapping career roles follow the supplied CV. Reduced-motion and explicit site motion controls suspend animation. Contact remains a mail-draft composer, not a backend submission.

Tailwind v4.1.10 utilities are compiled to the committed lightweight `assets/css/tailwind.generated.css`. Run `npm install && npm run build` after modifying Tailwind classes or templates; the deployed site does not use Tailwind's runtime CDN.


## Executive hero portrait (October 2026)
The right side of the header uses `assets/images/ali-mujtaba-executive.webp`, optimized to approximately 100 KB from the executive-styled image the site owner approved. The raw identity-reference photos are not committed. The image is intentionally rendered as a normal accessible asset with subtle CSS perspective/pointer motion; it is not a separate heavy 3D mesh. Reduced-motion preferences and the site's motion toggle disable effects. The established scroll-driven AI workflow follows below the introduction unchanged. Run `npm run build` after editing `src/page.html` so the root `index.html` stays in sync.
