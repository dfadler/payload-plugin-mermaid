import { defineConfig } from 'tsup'

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
  splitting: false,
  sourcemap: true,
  clean: false, // pnpm run build clears dist itself before this runs
  target: 'es2022',
  outDir: 'dist',
  external: [
    'payload',
    '@payloadcms/ui',
    'zombie-mermaid',
    'react',
    'react-dom',
  ],
})
