---
'payload-plugin-mermaid': patch
---

Widen the `zombie-mermaid` dependency range from `^1.6.0` to `^2.2.1`. This package only imports `renderMermaidSVG` and doesn't set `RenderOptions.interactivity` or read the `data-click-callback` attribute, so 2.0.0's only breaking change — removing that attribute in favor of `parseMermaid(source).interactions` — doesn't affect this package's rendered output. Verified against 2.2.1: full test suite, typecheck (including the built `.d.ts`), lint, format check, build, and audit all pass.
