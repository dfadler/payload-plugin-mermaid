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

  it('stamps the original source onto the root <svg> as a data-src attribute', () => {
    const svg = renderMermaid(FLOWCHART)
    expect(svg).not.toBeNull()
    // The attribute lands on the opening <svg> tag, before its other attributes.
    expect(svg).toMatch(/^<svg data-src="/)
  })

  it('exposes the verbatim author source (not the normalized form) in data-src', () => {
    /*
     * classDef/class are stripped by normalization before layout, but the
     * data-src value must carry the source exactly as written, so decoding
     * it round-trips back to the original source.
     */
    const STYLED = `flowchart TD
    a["A"] --> b["B"]
    classDef start fill:#eef2ff;
    class a start;`
    const svg = renderMermaid(STYLED) ?? ''
    const encoded = /data-src="([^"]*)"/.exec(svg)?.[1] ?? ''
    const decoded = encoded
      .replace(/&quot;/g, '"')
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&')
    expect(decoded).toBe(STYLED)
    // The class/classDef lines are stripped from the *rendered* diagram...
    expect(svg).not.toMatch(/<text[^>]*>\s*class\s*</)
    // ...but survive verbatim in the data attribute.
    expect(decoded).toContain('classDef start')
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

  it('keeps node ids that merely start with a keyword (class-name, end-result, subgraph-step)', () => {
    const svg = renderMermaid(`flowchart TD
    class-name["Class Name"] --> end-result["End Result"]
    end-result --> subgraph-step["Subgraph Step"]`)
    expect(svg).not.toBeNull()
    /*
     * None of these lines are the class/subgraph/end keywords, so their nodes
     * must survive.
     */
    expect(svg).toContain('Class Name')
    expect(svg).toContain('End Result')
    expect(svg).toContain('Subgraph Step')
  })

  it('does not let an end-prefixed node id inside a blank subgraph unbalance the end stack', () => {
    /*
     * `end-result` used to match /^end\b/, consuming the invisible
     * subgraph's drop flag: the real `end` then survived (empty box) and
     * `end-result` was dropped. Both the wrapper unwrap and the node must
     * come out right.
     */
    const svg = renderMermaid(`flowchart TD
    subgraph wrap[" "]
      a["A"]
      end-result["End Result"]
    end
    a --> end-result`)
    expect(svg).not.toBeNull()
    expect(svg).toContain('End Result')
    expect(svg).not.toMatch(/class="subgraph/) // invisible wrapper still unwrapped
  })

  it('unwraps a blank bare-quoted subgraph title', () => {
    const svg = renderMermaid(`flowchart TD
    a[A] --> b[B]
    subgraph " "
      a
      b
    end`)
    expect(svg).not.toBeNull()
    expect(svg).not.toMatch(/class="subgraph/)
  })

  /*
   * The invisible-subgraph idiom: left alone it draws an empty subgraph box,
   * and its classDef/class fills would override the consumer's own theme.
   * renderMermaid normalizes flowcharts so they render cleanly in
   * zombie-mermaid's own theme instead.
   */
  describe('normalizes author-specified flowchart styling', () => {
    const STYLED = `flowchart TD
    initial["Initial"] --> series["Series"]

    subgraph migrations[" "]
        post_versions["post_page_versions<br/>Adds _posts_v"]
        categories_tags["add_categories_tags<br/>Adds categories, tags"]
    end

    series --> post_versions
    series --> categories_tags

    classDef start fill:#eef2ff,stroke:#818cf8;
    class initial,series start;
    class migrations invisible;`

    it('does not leak a literal "class" node from class/classDef statements', () => {
      const svg = renderMermaid(STYLED)
      expect(svg).not.toBeNull()
      // The bug: a <text>class</text> node rendered onto the diagram.
      expect(svg).not.toMatch(/<text[^>]*>\s*class\s*</)
    })

    it('keeps the real nodes when it strips the styling', () => {
      const svg = renderMermaid(STYLED)
      expect(svg).toContain('Initial')
      expect(svg).toContain('post_page_versions')
      expect(svg).toContain('add_categories_tags')
    })

    it('unwraps a blank-titled (invisible) subgraph', () => {
      const svg = renderMermaid(STYLED)
      // No subgraph group container should be emitted for the invisible wrapper.
      expect(svg).not.toMatch(
        /data-shape="group"|class="subgraph|class="group"/,
      )
    })

    it('does not apply the author-specified classDef fill', () => {
      /*
       * zombie-mermaid implements classDef (its predecessor did not), so
       * without normalization these colors would land as inline styles and
       * override the consumer's theme. Stripping them is deliberate.
       *
       * Asserted against the rendered body only: data-src carries the
       * author's verbatim source, which legitimately still contains the hex
       * values.
       */
      const body = (renderMermaid(STYLED) ?? '').replace(
        / data-src="[^"]*"/,
        '',
      )
      expect(body).not.toMatch(/#eef2ff/i)
      expect(body).not.toMatch(/#818cf8/i)
    })
  })

  /*
   * The `class` keyword declares a class in a classDiagram (which
   * zombie-mermaid renders), so normalization must leave non-flowcharts
   * untouched.
   */
  it('does not strip class declarations from a classDiagram', () => {
    const svg = renderMermaid(`classDiagram
    class Animal {
      +int age
      +bark()
    }
    Animal <|-- Dog`)
    expect(svg).not.toBeNull()
    expect(svg).toContain('Animal')
    expect(svg).toContain('Dog')
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
