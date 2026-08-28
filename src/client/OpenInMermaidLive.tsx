'use client'

import { useEffect, useState } from 'react'
import { useFormFields } from '@payloadcms/ui'

import { buildMermaidLiveUrl } from '../mermaidLive.js'
import { siblingDiagramPath } from './siblingDiagramPath.js'

/*
 * The `openInMermaidLive` ui field on the Mermaid block (see
 * mermaidBlock.ts) renders this button. It reads the sibling `diagram`
 * source from the block's own Lexical sub-form and opens a mermaid.live
 * deep link (see mermaidLive.ts) in a new tab, so an author can iterate on
 * the current diagram in the full Live Editor — syntax help, live render,
 * theming, export — then paste the result back.
 */
export function OpenInMermaidLive({ path }: { path: string }) {
  const diagramPath = siblingDiagramPath(path)
  // Live-read the sibling diagram source; re-renders as the author types.
  const source = useFormFields(([fields]) => {
    const value = fields?.[diagramPath]?.value
    return typeof value === 'string' ? value : ''
  })

  /*
   * Precompute the deep link off the render path. Deflating is async, so a
   * click handler can't await it without risking the popup blocker — a
   * window.open fired after an await has lost its user-gesture token. We
   * stash the built URL alongside the exact source it was built from, and
   * treat it as current only while the source still matches, so an
   * in-progress edit can never open a stale diagram.
   */
  const [built, setBuilt] = useState<{ source: string; url: string } | null>(
    null,
  )
  useEffect(() => {
    if (!source.trim()) return
    let cancelled = false
    void buildMermaidLiveUrl(source)
      .then((url) => {
        if (!cancelled) setBuilt({ source, url })
      })
      .catch(() => {
        /*
         * Deflating a string doesn't realistically fail; if it ever did, the
         * button simply stays disabled for this source rather than
         * throwing.
         */
      })
    return () => {
      cancelled = true
    }
  }, [source])

  const href = source.trim() && built?.source === source ? built.url : null

  return (
    <button
      className="btn btn--style-secondary btn--size-small"
      disabled={!href}
      onClick={() => {
        if (href) window.open(href, '_blank', 'noopener,noreferrer')
      }}
      title={
        href
          ? 'Open this diagram in the Mermaid Live Editor (new tab)'
          : 'Add diagram source to enable the Live Editor link'
      }
      type="button"
    >
      Open in Mermaid Live Editor
    </button>
  )
}
