import { cp, readdir } from 'fs'

readdir('./public', (err, files) => {
  if (err) throw err

  files.forEach(file => {
    cp(`./public/${file}`, `./build/public/${file}`, err => {
      if (err) throw err
    })
  })
})

export {}
