# Project evidence and media
This directory is a self-contained portfolio case study.

- `project.json` supplies the project summary, workflows, gallery order and editorial copy.
- `FEATURE_AND_MODULE_INVENTORY.md` is the exact module audit provided for this project and the source for 82 feature-status entries.
- `assets/` contains lightweight conceptual diagrams. **No screenshots of a live application were provided**.

To add authentic media later, place an optimized `.webp`, `.jpg`, `.png`, `.svg`, `.mp4` or `.webm` inside `assets/` and add a record to `project.json.media` with `src`, `kind` (`screenshot`, `diagram`, or `video`), `title`, `caption`, and `alt`. The shared renderer will add it to this case-study gallery automatically. Make sure you have rights to publish every asset and redact customer information.

Source claims are intentionally labeled source-implemented vs code-present vs not confirmed. The separate Laravel 8 storefront under `public/core/` is not a submodule of the main classifieds app. Individual ownership and production adoption are not verified by this audit.
