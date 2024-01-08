// File: bs-config.js

// File: bs-config.js

module.exports = {
  proxy: 'localhost:3000', // your server address
  files: ['src/**/*.*'], // watch your frontend files
  ignore: ['node_modules'],
  reloadDelay: 1000,
  open: false,
  port: 3001,
  ui: {
    port: 3002,
  },
}
