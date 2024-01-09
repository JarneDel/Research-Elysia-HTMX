import { copyFileSync } from 'fs'

await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist/bun',
  minify: true,
  target: 'bun',
  sourcemap: 'external',
})

copyFileSync('dist/index.d.ts', 'dist/bun/index.d.ts')

export {}
