import { inflateSync } from 'node:zlib'

import { describe, expect, it } from 'vitest'

import { buildMermaidLiveUrl } from '../mermaidLive.js'

const FLOWCHART = `flowchart TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Do the thing]
  B -->|No| D[Stop]`

type DecodedState = {
  code: string
  mermaid: string
  updateDiagram: boolean
  rough: boolean
}

/*
 * Reverse the exact steps the Live Editor performs on load: split the hash,
 * strip the `pako:` scheme, URL-safe-base64-decode, then zlib-inflate.
 * Node's inflateSync reads the same zlib framing pako.inflate does, so a
 * successful round-trip here proves mermaid.live can decode what we
 * produced — without a network round-trip to the site. `JSON.parse`
 * returns `any`, so the annotation names the shape without a type
 * assertion.
 */
function decodePakoUrl(url: string): DecodedState {
  const hash = new URL(url).hash
  const payload = hash.replace(/^#pako:/, '')
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
  const inflated = inflateSync(Buffer.from(base64, 'base64'))
  const state: DecodedState = JSON.parse(inflated.toString('utf8'))
  return state
}

describe('buildMermaidLiveUrl', () => {
  it("points at the Live Editor's /edit route with a pako hash", async () => {
    const url = await buildMermaidLiveUrl(FLOWCHART)
    expect(url.startsWith('https://mermaid.live/edit#pako:')).toBe(true)
  })

  it('round-trips the source through the pako payload', async () => {
    const url = await buildMermaidLiveUrl(FLOWCHART)
    const state = decodePakoUrl(url)
    expect(state).toMatchObject({ code: FLOWCHART })
  })

  it('carries the required State fields the editor expects', async () => {
    const state = decodePakoUrl(await buildMermaidLiveUrl(FLOWCHART))
    /*
     * `code`, `mermaid`, `updateDiagram`, `rough` are required by the
     * editor's State type; `mermaid` is itself a stringified config blob.
     */
    expect(state).toMatchObject({
      updateDiagram: true,
      rough: false,
    })
    expect(typeof state.mermaid).toBe('string')
    const config: { theme?: string } = JSON.parse(state.mermaid)
    expect(config).toMatchObject({ theme: 'default' })
  })

  it('produces a hash with only URL-safe base64 characters', async () => {
    const url = await buildMermaidLiveUrl(FLOWCHART)
    const payload = new URL(url).hash.replace(/^#pako:/, '')
    // No +, /, or = — the URL-safe alphabet, unpadded.
    expect(payload).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('survives source with unicode and special characters', async () => {
    const source = 'flowchart LR\n  A["café ☕ <b>&amp;</b>"] --> B["日本語"]'
    const state = decodePakoUrl(await buildMermaidLiveUrl(source))
    expect(state).toMatchObject({ code: source })
  })

  it('round-trips a large diagram (no spread/arg-count limit)', async () => {
    const big =
      'flowchart TD\n' +
      Array.from({ length: 500 }, (_, i) => `  N${i} --> N${i + 1}`).join('\n')
    const state = decodePakoUrl(await buildMermaidLiveUrl(big))
    expect(state).toMatchObject({ code: big })
  })
})
