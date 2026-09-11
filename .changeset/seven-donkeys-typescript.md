---
'payload-plugin-mermaid': patch
---

Bump the `typescript` devDependency from `5.9.3` to `7.0.2`. Purely a build-tooling upgrade — no source changes. Verified: full test suite, typecheck (source and the built `.d.ts`), lint, format check, and a from-scratch `pnpm install` (which triggers the `prepare`/build hook) all pass against TypeScript 7.0.2 with `tsdown`. `pnpm audit --prod --audit-level=high` shows no new findings beyond the pre-existing baseline.
