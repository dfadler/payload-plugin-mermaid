import { describe, expect, it } from 'vitest'

import { mermaidBlock } from '../mermaidBlock.js'

describe('mermaidBlock', () => {
  it('declares the mermaid slug and its four fields by default', () => {
    const block = mermaidBlock()
    expect(block.slug).toBe('mermaid')
    expect(
      block.fields.map((field) => ('name' in field ? field.name : undefined)),
    ).toEqual(['diagram', 'preview', 'openInMermaidLive', 'caption'])
  })

  it("points the two ui fields at this package's /client export", () => {
    const block = mermaidBlock()
    const [, preview, openInMermaidLive] = block.fields
    expect(preview).toMatchObject({
      admin: {
        components: { Field: 'payload-plugin-mermaid/client#MermaidPreview' },
      },
    })
    expect(openInMermaidLive).toMatchObject({
      admin: {
        components: {
          Field: 'payload-plugin-mermaid/client#OpenInMermaidLive',
        },
      },
    })
  })

  it('lets a consumer override top-level block config (e.g. labels)', () => {
    const block = mermaidBlock({
      labels: { singular: 'Diagram', plural: 'Diagrams' },
    })
    expect(block.labels).toEqual({ singular: 'Diagram', plural: 'Diagrams' })
    // Overriding a top-level key doesn't drop the default fields.
    expect(block.fields).toHaveLength(4)
  })
})
