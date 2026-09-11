---
'payload-plugin-mermaid': patch
---

Switch the build tool from `tsup` to `tsdown` (rolldown-based). No public API changes — `dist/index.js`, `dist/index.d.ts`, `dist/client.js`, and `dist/client.d.ts` keep the same names and content shape, and the `'use client'` directive is still hoisted to the top of `dist/client.js`. Declaration files now also ship `.d.ts.map` sourcemaps, which tsup didn't generate.

This is prep work: `tsup@8.5.1` bundles a `rollup-plugin-dts@6.1.1` build that can't generate declarations under TypeScript 7 (its Node API surface changed). `tsdown` shells out to the TypeScript compiler directly rather than using its removed API, so it works under both the current TypeScript 5.9.3 and TypeScript 7. Verified: full test suite, typecheck (source and the built `.d.ts` via `dist-typecheck/`), lint, and build all pass; `pnpm audit --prod --audit-level=high` shows no new findings beyond the pre-existing baseline.
