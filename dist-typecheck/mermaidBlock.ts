// Type-level regression check against the *built* declaration file, not the
// source — `tsc`/`vitest` against src/ never catches a widened literal here,
// because the widening happens specifically in the .d.ts tsup/tsc emits for
// a published package (satisfies alone doesn't survive that boundary; only
// `as const` does). This file only needs to compile; it asserts nothing at
// runtime.
import { MermaidBlock } from '../dist/index.js'

// Fails to compile if `slug` has widened from the literal `'mermaid'` to
// plain `string` in the published dist/index.d.ts.
const _slugStaysLiteral: 'mermaid' = MermaidBlock.slug
void _slugStaysLiteral
