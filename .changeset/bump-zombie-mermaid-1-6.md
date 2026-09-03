---
'payload-plugin-mermaid': patch
---

Widen the `zombie-mermaid` dependency range from `^1.5.0` to `^1.6.0`. No API changes needed on this side — this package doesn't set `RenderOptions.interactivity` (it relies on the library default), so the 1.6.0 tightening of what `'static'`/`'none'` strip doesn't change this package's rendered output. Verified: full test suite, typecheck (including the built `.d.ts`), lint, and build all pass against 1.6.0.
