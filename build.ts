import { cp, readdir } from 'fs'

// await Bun.build({
//   entrypoints: ['./src/index.ts'],
//   outdir: './build',
//   minify: true,
//   target: 'bun',
//   sourcemap: 'external',
// })
// copy public folder
// get all files in public folder
readdir('./public', (err, files) => {
  if (err) throw err

  files.forEach(file => {
    cp(`./public/${file}`, `./build/public/${file}`, err => {
      if (err) throw err
    })
  })
  console.log('copied public folder to build folder')
})

export {}
