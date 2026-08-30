# payload-plugin-mermaid

## 1.0.0

### Major Changes

- [`19521b7`](https://github.com/dfadler/payload-plugin-mermaid/commit/19521b7d46b204426725952d690a3024e955cdc2) Thanks [@dfadler](https://github.com/dfadler)! - Initial release: a Mermaid diagram block for Payload CMS — server-rendered SVG via zombie-mermaid, a live admin preview, an "Open in Mermaid Live Editor" button, and zero client-side rendering JS shipped to the frontend.

### Patch Changes

- [#4](https://github.com/dfadler/payload-plugin-mermaid/pull/4) [`9bfd28e`](https://github.com/dfadler/payload-plugin-mermaid/commit/9bfd28e6d0c7aa707d00489d25be03b3b2aad9a3) Thanks [@dfadler](https://github.com/dfadler)! - Force `dompurify` (transitive, via `@payloadcms/ui` -> `@monaco-editor/react`) and `esbuild` (dev-tooling only) to patched versions, resolving all 5 open Dependabot alerts (2 moderate, 3 low). No functional changes.
