import { describe, expect, it } from 'vitest'

import { renderMermaid } from '../render.js'

const FLOWCHART = `flowchart TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Do the thing]
  B -->|No| D[Stop]`

const SEQUENCE = `sequenceDiagram
  participant U as User
  U->>Server: request
  Server-->>U: response`

describe('renderMermaid', () => {
  it('renders a flowchart to an inline SVG string', () => {
    const svg = renderMermaid(FLOWCHART)
    expect(svg).not.toBeNull()
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
    // Node labels survive into the markup, so the diagram carries its meaning.
    expect(svg).toContain('Do the thing')
  })

  it('renders a sequence diagram to an inline SVG string', () => {
    const svg = renderMermaid(SEQUENCE)
    expect(svg).not.toBeNull()
    expect(svg).toContain('<svg')
  })

  it('strips the remote Google Fonts @import the library bakes in', () => {
    const svg = renderMermaid(FLOWCHART)
    // No third-party font fetch should be fired from a statically-served SVG.
    expect(svg).not.toContain('@import')
    expect(svg).not.toContain('fonts.googleapis.com')
  })

  it('renders with a transparent background (no painted bg rectangle)', () => {
    const svg = renderMermaid(FLOWCHART)
    expect(svg).not.toContain('background:var(--bg)')
  })

  it('is deterministic - identical source yields identical output', () => {
    expect(renderMermaid(FLOWCHART)).toBe(renderMermaid(FLOWCHART))
  })

  it('stamps the source onto the root <svg> as a data-src attribute', () => {
    const svg = renderMermaid(FLOWCHART)
    expect(svg).not.toBeNull()
    // The attribute lands on the opening <svg> tag, before its other attributes.
    expect(svg).toMatch(/^<svg data-src="/)
  })

  it('round-trips the exact source through data-src', () => {
    const svg = renderMermaid(FLOWCHART) ?? ''
    const encoded = /data-src="([^"]*)"/.exec(svg)?.[1] ?? ''
    const decoded = encoded
      .replace(/&quot;/g, '"')
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&')
    expect(decoded).toBe(FLOWCHART)
  })

  it('escapes characters that would break out of the attribute', () => {
    const svg = renderMermaid(`flowchart TD
    A["a <b> & \\"c\\""] --> B[End]`)
    expect(svg).not.toBeNull()
    const attr = /data-src="([^"]*)"/.exec(svg ?? '')?.[1] ?? ''
    // No raw <, >, & or " survive inside the attribute value.
    expect(attr).not.toMatch(/[<>]/)
    expect(attr).toContain('&lt;')
    expect(attr).toContain('&gt;')
    expect(attr).toContain('&amp;')
    expect(attr).toContain('&quot;')
  })

  it('preserves $-sequences in the source verbatim (no String.replace pattern expansion)', () => {
    /*
     * A string second arg to String.replace treats `$1`, `$&`, `$'` as
     * replacement patterns; the injection must use a function replacer so a
     * diagram label containing them is stored literally, not expanded.
     */
    const svg = renderMermaid(`flowchart TD
    A["cost is $1 and $$ and $' too"] --> B[End]`)
    expect(svg).not.toBeNull()
    const attr = /data-src="([^"]*)"/.exec(svg ?? '')?.[1] ?? ''
    expect(attr).toContain("cost is $1 and $$ and $' too")
  })

  it('returns null for an unsupported diagram type (caller falls back to source)', () => {
    const gantt = `gantt
  title A schedule
  section Work
  Task :a1, 2024-01-01, 30d`
    expect(renderMermaid(gantt)).toBeNull()
  })

  it('returns null for input that is not a diagram at all', () => {
    expect(renderMermaid('this is just prose, not mermaid')).toBeNull()
  })

  it('returns null for comment-only input (no diagram header)', () => {
    expect(renderMermaid('%% just a comment\n%% and another')).toBeNull()
  })

  it('preserves a legitimately titled subgraph', () => {
    const svg = renderMermaid(`flowchart LR
    subgraph Build
      A[gen] --> B[render]
    end
    B --> C[deploy]`)
    expect(svg).not.toBeNull()
    expect(svg).toContain('Build')
    expect(svg).toContain('deploy')
  })
})
