import type { Block } from 'payload'

/*
 * A Lexical "block" - droppable directly into a richText field's content
 * stream from the editor's insert-block UI via BlocksFeature. Stores raw
 * Mermaid source; render it on the server with `renderMermaid` (see
 * render.ts) or the ready-made `Mermaid` Server Component (see Mermaid.tsx),
 * wired up through your own JSX converter for the richText field.
 *
 * Renders to finished markup at build/render time and ships no rendering JS
 * to the browser - it uses zombie-mermaid, a pure-JS renderer that lays
 * diagrams out without a DOM.
 *
 * `overrides` can replace `labels`, `interfaceName`, top-level `admin`, etc.,
 * but never `slug` or `fields`: those two are placed *after* the spread so
 * they can't be clobbered. The block's own client components
 * (MermaidPreview, OpenInMermaidLive) assume `fields[0]` is the `diagram`
 * field, and a consumer keying a block registry off a literal `slug` type
 * (`Block & { slug: 'mermaid' }`, not widened to `string`) needs that
 * literal to stay exactly `'mermaid'` — this return type keeps that literal
 * intact through the override merge.
 */
export function mermaidBlock(
  overrides?: Partial<Block>,
): Block & { slug: 'mermaid' } {
  return {
    interfaceName: 'MermaidBlock',
    labels: {
      singular: 'Mermaid Diagram',
      plural: 'Mermaid Diagrams',
    },
    ...overrides,
    slug: 'mermaid',
    fields: [
      {
        name: 'diagram',
        type: 'code',
        required: true,
        admin: {
          /*
           * CodeMirror has no Mermaid mode; "text" gives a plain,
           * unhighlighted editing surface. This is purely the *admin
           * editing* experience - the published diagram is converted to
           * static SVG on the server using zombie-mermaid, not rendered by
           * Mermaid.js on the frontend.
           */
          language: 'text',
          description:
            'Mermaid diagram source, e.g. a `flowchart TD` or `sequenceDiagram` definition. See mermaid.js.org.',
        },
      },
      {
        /*
         * Live, debounced preview rendered from the `diagram` source above,
         * so authors catch mistakes before publishing rather than after.
         * A `ui` field holds no data; the client component reads its
         * sibling `diagram` value out of form state and renders it with the
         * same zombie-mermaid path the frontend uses. See
         * client/MermaidPreview.tsx.
         */
        name: 'preview',
        type: 'ui',
        admin: {
          components: {
            Field: 'payload-plugin-mermaid/client#MermaidPreview',
          },
        },
      },
      {
        /*
         * A presentation-only control (stores nothing) that opens the
         * current `diagram` source in the Mermaid Live Editor (mermaid.live)
         * in a new tab, for iterating in the full playground and pasting
         * back. The client component reads the sibling `diagram` value from
         * the block's form.
         */
        name: 'openInMermaidLive',
        type: 'ui',
        admin: {
          components: {
            Field: 'payload-plugin-mermaid/client#OpenInMermaidLive',
          },
        },
      },
      {
        name: 'caption',
        type: 'text',
        required: false,
        admin: {
          description: 'Optional caption shown beneath the diagram.',
        },
      },
    ],
  }
}
