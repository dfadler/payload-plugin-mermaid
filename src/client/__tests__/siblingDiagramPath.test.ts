import { describe, expect, it } from 'vitest'

import { siblingDiagramPath } from '../siblingDiagramPath.js'

describe('siblingDiagramPath', () => {
  it("swaps a deep Lexical block path's final segment for `diagram`", () => {
    expect(siblingDiagramPath('content.root.children.3.fields.preview')).toBe(
      'content.root.children.3.fields.diagram',
    )
  })

  it('handles a shallow array-block path', () => {
    expect(siblingDiagramPath('layout.2.preview')).toBe('layout.2.diagram')
  })

  it('handles a bare, unnested path', () => {
    expect(siblingDiagramPath('preview')).toBe('diagram')
  })

  it('only rewrites the final segment, leaving a `preview` ancestor untouched', () => {
    expect(siblingDiagramPath('preview.0.preview')).toBe('preview.0.diagram')
  })
})
