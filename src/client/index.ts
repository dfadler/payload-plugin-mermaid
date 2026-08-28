'use client'

/*
 * MermaidPreview.tsx and OpenInMermaidLive.tsx each declare their own 'use
 * client' too, but tsup bundles this entry and its imports into one output
 * file — a directive on an individual source file doesn't propagate to the
 * top of the bundled chunk, and without one there Next.js's RSC boundary
 * treats the whole bundle as a Server Component, which breaks `useField`/
 * `useFormFields` at runtime ("Attempted to call useField() from the
 * server"). This is what actually makes the bundle's first line 'use
 * client' — verified by inspecting dist/client.js after a build.
 */
export { MermaidPreview } from './MermaidPreview.js'
export { OpenInMermaidLive } from './OpenInMermaidLive.js'
export { siblingDiagramPath } from './siblingDiagramPath.js'
