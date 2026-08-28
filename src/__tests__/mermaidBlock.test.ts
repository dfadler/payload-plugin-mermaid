import { describe, expect, it } from 'vitest'

import { MermaidBlock } from '../mermaidBlock.js'

describe('MermaidBlock', () => {
  it('declares the mermaid slug and its four fields', () => {
    expect(MermaidBlock.slug).toBe('mermaid')
    expect(
      MermaidBlock.fields.map((field) =>
        'name' in field ? field.name : undefined,
      ),
    ).toEqual(['diagram', 'preview', 'openInMermaidLive', 'caption'])
  })

  it("points the two ui fields at this package's /client export", () => {
    const [, preview, openInMermaidLive] = MermaidBlock.fields
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
})
