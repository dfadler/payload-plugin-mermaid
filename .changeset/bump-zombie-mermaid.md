---
'payload-plugin-mermaid': patch
---

Widen the `zombie-mermaid` dependency range from `^1.2.0` to `^1.5.0`. No API changes needed on this side — zombie-mermaid 1.3.0–1.5.0 added new opt-in features (edge-animation syntax, `RenderOptions.interactivity`, and accessible-name support via `title`/`decorative` render options) without touching the existing rendering path this package uses. Verified: full test suite, typecheck (including the built `.d.ts`), lint, and build all pass against 1.5.0.
