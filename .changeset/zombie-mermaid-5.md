---
'payload-plugin-mermaid': major
---

Raise the `zombie-mermaid` dependency from `^2.2.6` to `^5.10.0`. This is a major release because `zombie-mermaid` itself moved three majors: the rendered SVG markup changes for flowchart, class, ER, and xychart diagrams (sequence and state diagrams are byte-identical in our spot checks), and `pie` diagrams now render instead of falling back to the raw source. The plugin's own API is unchanged. 5.10.0 depends on `@modelcontextprotocol/sdk ^1.32.1`, so a fresh install no longer resolves the 1.30.x versions flagged by `pnpm audit` (GHSA-22jm-h49p-29qw, GHSA-46jr-4wx8-v453, GHSA-6qxp-vccf-f47h). Verified: full test suite, typecheck, build, and lint pass; `pnpm audit --prod --audit-level=high` is clean.
