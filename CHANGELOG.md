# payload-plugin-mermaid

## 1.0.1

### Patch Changes

- [#7](https://github.com/dfadler/payload-plugin-mermaid/pull/7) [`5763e79`](https://github.com/dfadler/payload-plugin-mermaid/commit/5763e7904caf22f79fa8af7481e7366bb48f9e72) Thanks [@dfadler](https://github.com/dfadler)! - Widen the `zombie-mermaid` dependency range from `^1.2.0` to `^1.5.0`. No API changes needed on this side — zombie-mermaid 1.3.0–1.5.0 added new opt-in features (edge-animation syntax, `RenderOptions.interactivity`, and accessible-name support via `title`/`decorative` render options) without touching the existing rendering path this package uses. Verified: full test suite, typecheck (including the built `.d.ts`), lint, and build all pass against 1.5.0.

## 1.0.0

### Major Changes

- [`19521b7`](https://github.com/dfadler/payload-plugin-mermaid/commit/19521b7d46b204426725952d690a3024e955cdc2) Thanks [@dfadler](https://github.com/dfadler)! - Initial release: a Mermaid diagram block for Payload CMS — server-rendered SVG via zombie-mermaid, a live admin preview, an "Open in Mermaid Live Editor" button, and zero client-side rendering JS shipped to the frontend.

### Patch Changes

- [#4](https://github.com/dfadler/payload-plugin-mermaid/pull/4) [`9bfd28e`](https://github.com/dfadler/payload-plugin-mermaid/commit/9bfd28e6d0c7aa707d00489d25be03b3b2aad9a3) Thanks [@dfadler](https://github.com/dfadler)! - Force `dompurify` (transitive, via `@payloadcms/ui` -> `@monaco-editor/react`) and `esbuild` (dev-tooling only) to patched versions, resolving all 5 open Dependabot alerts (2 moderate, 3 low). No functional changes.
