/*
 * Builds a Mermaid Live Editor (https://mermaid.live) deep link that opens with
 * a given diagram's source pre-filled, so an author editing the block in the
 * admin can jump to the full playground — syntax help, live render, theming,
 * export — and paste the result back.
 *
 * The Live Editor stores its entire state in the URL hash as a pako-deflated,
 * URL-safe-base64 JSON blob:
 *
 *   https://mermaid.live/edit#pako:<base64url>
 *
 * where the JSON is the editor's `State` (code + config + flags). We deflate
 * with the browser-native CompressionStream('deflate') rather than adding the
 * `pako` dependency: WHATWG's 'deflate' format is zlib (RFC 1950), the exact
 * framing pako.deflate emits by default and pako.inflate reads on the other
 * end. The compression *level* differs (CompressionStream is
 * implementation-defined, pako uses 9) but that only affects size, never
 * decodability. CompressionStream is a global in every browser that runs the
 * admin and in Node 18+ (so this is unit-testable without a DOM).
 */

/*
 * The Live Editor's `State`. Only `code` carries our payload; `mermaid` (a
 * stringified config), `updateDiagram`, and `rough` are the other fields the
 * editor's State type marks required, so we send sensible defaults. Extra/
 * absent optional fields are tolerated — the editor merges loaded state over
 * its own defaults.
 */
type MermaidLiveState = {
  code: string
  mermaid: string
  autoSync: boolean
  updateDiagram: boolean
  rough: boolean
}

const MERMAID_LIVE_EDIT_URL = 'https://mermaid.live/edit'

function buildState(source: string): MermaidLiveState {
  return {
    code: source,
    /*
     * A stringified Mermaid config, matching the editor's own default.
     * Pretty-printed because that's what the editor shows in its Config
     * pane.
     */
    mermaid: JSON.stringify({ theme: 'default' }, null, 2),
    autoSync: true,
    updateDiagram: true,
    rough: false,
  }
}

/*
 * Uint8Array -> URL-safe base64 (RFC 4648 §5, no padding), the encoding
 * mermaid.live's `fromUint8Array(bytes, true)` produces. Built byte-by-byte
 * (not `btoa(String.fromCharCode(...bytes))`) so a large diagram can't blow
 * the argument-count limit of a spread call.
 */
function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/*
 * TextEncoder#encode returns a Uint8Array over `ArrayBufferLike` (which
 * admits SharedArrayBuffer); the stream writer wants a plain-ArrayBuffer-
 * backed view. Copying into a fresh `new Uint8Array(length)` gives exactly
 * that, no assertion.
 */
function encodeUtf8(text: string): Uint8Array<ArrayBuffer> {
  const encoded = new TextEncoder().encode(text)
  const bytes = new Uint8Array(encoded.length)
  bytes.set(encoded)
  return bytes
}

async function deflate(input: Uint8Array<ArrayBuffer>): Promise<Uint8Array> {
  const stream = new CompressionStream('deflate')
  const writer = stream.writable.getWriter()
  void writer.write(input)
  void writer.close()
  const compressed = await new Response(stream.readable).arrayBuffer()
  return new Uint8Array(compressed)
}

/**
 * Builds the `https://mermaid.live/edit#pako:…` URL that opens the Live
 * Editor with `source` loaded. Async because the deflate step streams. The
 * caller is responsible for gating on non-empty source.
 */
export async function buildMermaidLiveUrl(source: string): Promise<string> {
  const json = JSON.stringify(buildState(source))
  const compressed = await deflate(encodeUtf8(json))
  return `${MERMAID_LIVE_EDIT_URL}#pako:${bytesToBase64Url(compressed)}`
}
