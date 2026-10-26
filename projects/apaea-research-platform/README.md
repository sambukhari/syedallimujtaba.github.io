# APAEA portfolio case study

This case study uses `APAEA_PROJECT_MODULES_AND_FEATURES.md`, supplied by the portfolio owner, as the sole source for its 36 documented capability rows.

## Source boundaries
- **34** modules are marked `Present`, including one app API explicitly `Present (limited)` and one PayPal module whose live operation remains unverified.
- **2** modules are marked `Not found`: KYC and HR Management System. They are intentionally not advertised as features.
- The app API has **eight** registered endpoints in the supplied inventory. It is not a complete mobile application API contract.
- PayPal, email, protected routes and production deployment have **not been tested**.
- Exact module-specific code paths were **not included** in this short-form inventory. The GitLab repository and pinned commit are provided for context; this portfolio doesn't fabricate per-feature source links.
- The file references `APAEA_AI_CONTEXT.md`, but it was not provided. No content from that document is asserted.

## Gallery
`assets/cover.svg`, `assets/editorial-flow.svg`, `assets/membership-events.svg`, and `assets/research-network.svg` are original *conceptual diagrams*, **not UI screenshots**. The shared gallery UI supports future authentic `.webp`, `.png`, `.jpg`, `.mp4` and `.webm` files.

To add media later, put files in `assets/` and append a descriptive record under `project.json.media`; keep captions honest about source and client confidentiality. Then run `npm run build && npm run check`.

The portfolio does not claim ownership, quantitative outcomes, production adoption, or specific personal contributions absent evidence.
