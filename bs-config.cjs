// File: bs-config.js

// File: bs-config.js

module.exports = {
  proxy: {
    target: 'http://localhost:2999', // our express server
    ws: true, // enables websockets
  },
  files: ['src/**/*.*'], // watch your frontend files
  ignore: ['node_modules'],
  reloadDelay: 1000,
  open: false,
  port: 3001,
  ui: {
    port: 3002,
  },
}
