# payload-plugin-mermaid

## 1.0.4

### Patch Changes

- [#25](https://github.com/dfadler/payload-plugin-mermaid/pull/25) [`2c2da53`](https://github.com/dfadler/payload-plugin-mermaid/commit/2c2da53d9de94e9193e851b1fb024f424c5f950b) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump the `typescript` devDependency from `5.9.3` to `7.0.2`. Purely a build-tooling upgrade — no source changes. Verified: full test suite, typecheck (source and the built `.d.ts`), lint, format check, and a from-scratch `pnpm install` (which triggers the `prepare`/build hook) all pass against TypeScript 7.0.2 with `tsdown`. `pnpm audit --prod --audit-level=high` shows no new findings beyond the pre-existing baseline.

- [#28](https://github.com/dfadler/payload-plugin-mermaid/pull/28) [`d8fda1d`](https://github.com/dfadler/payload-plugin-mermaid/commit/d8fda1db286064f616b5924b3c770fd186d798d1) Thanks [@dfadler](https://github.com/dfadler)! - Switch the build tool from `tsup` to `tsdown` (rolldown-based). No public API changes — `dist/index.js`, `dist/index.d.ts`, `dist/client.js`, and `dist/client.d.ts` keep the same names and content shape, and the `'use client'` directive is still hoisted to the top of `dist/client.js`. Declaration files now also ship `.d.ts.map` sourcemaps, which tsup didn't generate.

  This is prep work: `tsup@8.5.1` bundles a `rollup-plugin-dts@6.1.1` build that can't generate declarations under TypeScript 7 (its Node API surface changed). `tsdown` shells out to the TypeScript compiler directly rather than using its removed API, so it works under both the current TypeScript 5.9.3 and TypeScript 7. Verified: full test suite, typecheck (source and the built `.d.ts` via `dist-typecheck/`), lint, and build all pass; `pnpm audit --prod --audit-level=high` shows no new findings beyond the pre-existing baseline.

## 1.0.3

### Patch Changes

- [#17](https://github.com/dfadler/payload-plugin-mermaid/pull/17) [`0e9fced`](https://github.com/dfadler/payload-plugin-mermaid/commit/0e9fced1978122d04dfb4b4e0689acb70bddfb15) Thanks [@dfadler](https://github.com/dfadler)! - Widen the `zombie-mermaid` dependency range from `^1.6.0` to `^2.2.1`. This package only imports `renderMermaidSVG` and doesn't set `RenderOptions.interactivity` or read the `data-click-callback` attribute, so 2.0.0's only breaking change — removing that attribute in favor of `parseMermaid(source).interactions` — doesn't affect this package's rendered output. Verified against 2.2.1: full test suite, typecheck (including the built `.d.ts`), lint, format check, build, and audit all pass.

## 1.0.2

### Patch Changes

- [#10](https://github.com/dfadler/payload-plugin-mermaid/pull/10) [`8db037d`](https://github.com/dfadler/payload-plugin-mermaid/commit/8db037dea09693a14e64c9bea2876c2d06f238a1) Thanks [@dfadler](https://github.com/dfadler)! - Widen the `zombie-mermaid` dependency range from `^1.5.0` to `^1.6.0`. No API changes needed on this side — this package doesn't set `RenderOptions.interactivity` (it relies on the library default), so the 1.6.0 tightening of what `'static'`/`'none'` strip doesn't change this package's rendered output. Verified: full test suite, typecheck (including the built `.d.ts`), lint, and build all pass against 1.6.0.

## 1.0.1

### Patch Changes

- [#7](https://github.com/dfadler/payload-plugin-mermaid/pull/7) [`5763e79`](https://github.com/dfadler/payload-plugin-mermaid/commit/5763e7904caf22f79fa8af7481e7366bb48f9e72) Thanks [@dfadler](https://github.com/dfadler)! - Widen the `zombie-mermaid` dependency range from `^1.2.0` to `^1.5.0`. No API changes needed on this side — zombie-mermaid 1.3.0–1.5.0 added new opt-in features (edge-animation syntax, `RenderOptions.interactivity`, and accessible-name support via `title`/`decorative` render options) without touching the existing rendering path this package uses. Verified: full test suite, typecheck (including the built `.d.ts`), lint, and build all pass against 1.5.0.

## 1.0.0

### Major Changes

- [`19521b7`](https://github.com/dfadler/payload-plugin-mermaid/commit/19521b7d46b204426725952d690a3024e955cdc2) Thanks [@dfadler](https://github.com/dfadler)! - Initial release: a Mermaid diagram block for Payload CMS — server-rendered SVG via zombie-mermaid, a live admin preview, an "Open in Mermaid Live Editor" button, and zero client-side rendering JS shipped to the frontend.

### Patch Changes

- [#4](https://github.com/dfadler/payload-plugin-mermaid/pull/4) [`9bfd28e`](https://github.com/dfadler/payload-plugin-mermaid/commit/9bfd28e6d0c7aa707d00489d25be03b3b2aad9a3) Thanks [@dfadler](https://github.com/dfadler)! - Force `dompurify` (transitive, via `@payloadcms/ui` -> `@monaco-editor/react`) and `esbuild` (dev-tooling only) to patched versions, resolving all 5 open Dependabot alerts (2 moderate, 3 low). No functional changes.
