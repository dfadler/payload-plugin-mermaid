import { renderMermaidSVG } from 'zombie-mermaid'

/*
 * Server-side Mermaid render. zombie-mermaid parses the diagram to an AST and
 * lays it out with a pure-JS ELK - no browser, no jsdom, no DOM text
 * measurement. It ships nothing to the client: this is meant to run at
 * build/render time inside a Server Component, exactly like Shiki does for
 * a code-snippet block.
 *
 * renderMermaidSVG is synchronous (its ELK layout runs sync via a FakeWorker),
 * so a diagram becomes a self-contained <svg> string with zero async work.
 */

/*
 * `transparent: true` drops the background rectangle so the diagram sits on
 * the consumer's own page background instead of painting its own white
 * block. Colors are left at the library defaults (zinc light, #FFFFFF /
 * #27272A); a consumer with a dark theme should override at the CSS layer
 * (see mermaid.css) rather than here.
 */
const RENDER_OPTIONS = {
  /*
   * A system font stack, so no webfont is needed. zombie-mermaid sizes text
   * from its own metric tables (not the actual font), so nodes fit regardless
   * of which system font resolves - see stripRemoteFontImports below.
   */
  font: 'ui-sans-serif, system-ui, sans-serif',
  transparent: true,
} as const

/*
 * Escapes a string for safe use inside a double-quoted HTML attribute value.
 * `&` and `"` are the two that would break out of the attribute; `<`/`>` are
 * escaped too so the value can never be misparsed as markup.
 */
function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/*
 * Stamps the Mermaid source onto the rendered SVG as a `data-src` attribute
 * on the root `<svg>` element, so the diagram's source travels with the
 * markup that ships to the browser (e.g. for a "copy source" / "open in live
 * editor" affordance) — the same source that was actually rendered.
 *
 * The attribute is intentionally named `data-src` (renderer-agnostic) rather
 * than `data-mermaid`: if the diagram engine is ever swapped out, the
 * attribute and any client code that reads it stay unchanged.
 */
function injectSourceAttribute(svg: string, source: string): string {
  const attr = ` data-src="${escapeAttribute(source)}"`
  /*
   * Use a replacer *function*, not a string: a string second argument treats
   * `$`-sequences (`$1`, `$&`, `$'`, ...) in the source as replacement
   * patterns, which would corrupt the attribute (e.g. `$'` splices the rest
   * of the SVG in).
   */
  return svg.replace(/^(\s*<svg)\b/, (match) => match + attr)
}

/*
 * zombie-mermaid unconditionally bakes a Google Fonts @import into the
 * SVG's <style> (for its default 'Inter'), and naively interpolates whatever
 * `font` we pass into that same remote URL. We never want a third-party font
 * fetch fired from a statically-served SVG - it's a privacy leak and an
 * external dependency a static site doesn't otherwise have. Strip any remote
 * @import; the `text { font-family: ..., system-ui, sans-serif }` rule in
 * the same <style> block governs after removal.
 */
function stripRemoteFontImports(svg: string): string {
  return svg.replace(/@import\s+url\((['"]?)https?:\/\/[^)]*\1\);?/g, '')
}

/**
 * Renders Mermaid source to a self-contained, inline-ready SVG string, or
 * `null` when the diagram can't be rendered (unsupported diagram type or a
 * syntax error that makes zombie-mermaid throw). Callers should fall back to
 * showing the raw source.
 *
 * Supported diagram types: flowchart, sequence, class, state, ER, and
 * xychart. Others (gantt, pie, journey, gitgraph, mindmap, ...) throw and
 * thus fall back - zombie-mermaid lays diagrams out with dagre, not ELK, so
 * this is scoped to dagre-safe diagram types.
 */
export function renderMermaid(source: string): string | null {
  try {
    const svg = stripRemoteFontImports(renderMermaidSVG(source, RENDER_OPTIONS))
    return injectSourceAttribute(svg, source)
  } catch {
    return null
  }
}
