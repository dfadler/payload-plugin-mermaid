---
'payload-plugin-mermaid': patch
---

Raise the minimum `zombie-mermaid` version from `^2.2.1` to `^2.2.6`, picking up dfadler/zombie-mermaid#622's publish-strategy change (the umbrella package now depends on the newly-published `@zombie-mermaid/*` packages instead of bundling their source) plus the intervening patch fixes. No API changes needed on this side — this package only imports `renderMermaidSVG` with `font`/`transparent` options, none of which changed. Verified against 2.2.6: full test suite, typecheck (including the built `.d.ts`), lint, format check, build, and audit all pass.
