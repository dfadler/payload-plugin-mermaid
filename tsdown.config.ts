import { defineConfig } from 'tsdown'

// `payload` and `@payloadcms/ui` are external so the plugin never bundles
// its own copy — a duplicate would create a second React context identity
// and break `useField`/`useFormFields` for a consumer whose own copy
// doesn't match (see the peer-dependency decision in the README).
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    client: 'src/client/index.ts',
  },
  format: ['esm'],
  dts: true,
  // Match the existing `dist/index.js`/`dist/index.d.ts` naming (tsdown
  // defaults to `.mjs`/`.d.mts` for the node platform) so package.json's
  // `exports` map doesn't need to change.
  fixedExtension: false,
  // Deterministic chunk filename for the module shared between `index` and
  // `client` (mermaidLive.ts), instead of a build-varying content hash.
  hash: false,
  sourcemap: true,
  clean: false, // pnpm run build clears dist itself before this runs
  target: 'es2022',
  outDir: 'dist',
  deps: {
    neverBundle: [
      'payload',
      '@payloadcms/ui',
      'zombie-mermaid',
      'react',
      'react-dom',
    ],
  },
})
