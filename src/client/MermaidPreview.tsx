'use client'

import type { UIFieldClientComponent } from 'payload'
import { useEffect, useMemo, useState } from 'react'
import { useField } from '@payloadcms/ui'
import { renderMermaid } from '../render.js'
import { siblingDiagramPath } from './siblingDiagramPath.js'

/*
 * Live preview of a Mermaid block, shown inside the Payload admin editor as
 * the author types. It's wired to the block's `preview` UI field (see
 * mermaidBlock.ts) and reads the sibling `diagram` source out of form state,
 * re-rendering (debounced) so syntax mistakes surface before publish
 * instead of at page-render time.
 *
 * The render path is the SAME pure function the frontend `Mermaid`
 * component uses (renderMermaid, from render.ts) — zombie-mermaid, sync, no
 * DOM. That shared function is what keeps the admin preview and the
 * published diagram in lockstep (same parse guard, same null-on-invalid
 * fallback), so there's no drift between what an author previews and what a
 * reader sees. zombie-mermaid is pure JS (no browser APIs, no worker), so
 * importing it into this client component is safe; the extra bundle weight
 * lands only in the admin.
 *
 * Injecting the SVG via dangerouslySetInnerHTML is the same tradeoff the
 * frontend renderer makes: the source is whatever your own access control
 * lets into the `diagram` field. zombie-mermaid makes no documented
 * sanitization guarantee, so that trusted input is the whole mitigation.
 *
 * Import `payload-plugin-mermaid/mermaid-preview.css` once in your admin
 * bundle for the styling this component assumes.
 */

/*
 * Idle time after the last keystroke before we re-run layout. zombie-mermaid
 * lays diagrams out synchronously, so debouncing keeps ELK off the main
 * thread on every character.
 */
const DEBOUNCE_MS = 300

export const MermaidPreview: UIFieldClientComponent = ({ path }) => {
  const diagramPath = useMemo(() => siblingDiagramPath(path), [path])
  const { value } = useField<string>({ path: diagramPath })
  const source = (value ?? '').trim()

  /*
   * The last settled render, paired with the exact source it came from.
   * Pairing lets the JSX show the previous diagram while a debounce is in
   * flight (no flicker mid-edit) and — crucially — renders an
   * already-saved diagram synchronously on mount, so opening a post never
   * flashes the "invalid" message before the first render lands. `svg ===
   * null` here means that source genuinely didn't render (invalid/
   * unsupported), not "not rendered yet".
   */
  const [rendered, setRendered] = useState<{
    source: string
    svg: string | null
  }>(() => ({
    source,
    svg: source ? renderMermaid(source) : null,
  }))

  /*
   * Debounce re-rendering of *changed* source. setState is only ever called
   * from the timer callback (never synchronously in the effect body), so
   * fast typing doesn't cascade renders. Once the timer sets
   * `rendered.source` to the current source, this re-runs and the guard
   * short-circuits — no loop, no lingering timer. zombie-mermaid lays out
   * synchronously, so the debounce is what keeps ELK off the main thread on
   * every keystroke.
   */
  useEffect(() => {
    if (!source || source === rendered.source) return
    const timer = setTimeout(
      () => setRendered({ source, svg: renderMermaid(source) }),
      DEBOUNCE_MS,
    )
    return () => clearTimeout(timer)
  }, [source, rendered.source])

  return (
    <div className="payload-plugin-mermaid-preview-wrap">
      <span className="payload-plugin-mermaid-preview-label">Preview</span>
      <div className="payload-plugin-mermaid-preview-panel">
        {!source ? (
          <p className="payload-plugin-mermaid-preview-hint">
            The rendered diagram will appear here as you type.
          </p>
        ) : rendered.svg ? (
          <div
            className="payload-plugin-mermaid-preview-diagram"
            role="img"
            aria-label="Diagram preview"
            dangerouslySetInnerHTML={{ __html: rendered.svg }}
          />
        ) : (
          <>
            <p className="payload-plugin-mermaid-preview-invalid">
              Can&rsquo;t render this yet — check the Mermaid syntax. Supported:
              flowchart, sequence, class, state, ER, and xychart diagrams.
            </p>
            <pre className="payload-plugin-mermaid-preview-source">
              {source}
            </pre>
          </>
        )}
      </div>
    </div>
  )
}
