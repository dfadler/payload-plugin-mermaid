import { renderMermaid } from './render.js'

/**
 * Server Component for the `mermaid` block (schema in mermaidBlock.ts). Pair
 * it with your own JSX converter for the block's `diagram`/`caption` fields.
 *
 * The diagram is rendered to a static SVG on the server at build/render
 * time and injected as finished markup - no `mermaid` library, no ELK, and
 * no rendering JS ships to the browser, and the diagram exists in the
 * statically-generated HTML with no post-hydration flash.
 *
 * The content is whatever your own access control allows into the
 * `diagram` field, so this `dangerouslySetInnerHTML` carries the same trust
 * assumption as any other block that injects author-controlled markup. Note
 * that zombie-mermaid makes no documented sanitization guarantee - the
 * mitigation here is trusted input, not the renderer.
 *
 * Import `payload-plugin-mermaid/mermaid.css` once in your app for the
 * default layout styling this component assumes.
 */
export default function Mermaid({
  diagram,
  caption,
}: {
  diagram: string
  caption?: string | null
}) {
  const svg = renderMermaid(diagram)

  return (
    <figure className="payload-plugin-mermaid-figure">
      {svg ? (
        <div
          className="payload-plugin-mermaid-diagram"
          role="img"
          aria-label={caption ?? 'Diagram'}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        /*
         * Unsupported diagram type or a syntax error the renderer rejected:
         * show the raw source rather than a blank block.
         */
        <pre className="payload-plugin-mermaid-fallback">{diagram}</pre>
      )}
      {caption ? (
        <figcaption className="payload-plugin-mermaid-caption">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
