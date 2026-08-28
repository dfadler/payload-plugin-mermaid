/**
 * Given the form-state path of one of the Mermaid block's `ui` fields
 * (`preview` or `openInMermaidLive`), returns the path of its sibling
 * `diagram` code field by swapping the final segment.
 *
 * Payload namespaces a block's fields under a per-row path (e.g.
 * `content.root.children.3.fields.preview` inside a Lexical block, or
 * `layout.2.preview` in an array), so the source field is always the
 * sibling that shares this field's parent path — found by replacing the
 * last `.` segment. Kept framework-free so it's unit-testable without the
 * admin bundle.
 */
export function siblingDiagramPath(uiFieldPath: string): string {
  const parts = uiFieldPath.split('.')
  parts[parts.length - 1] = 'diagram'
  return parts.join('.')
}
