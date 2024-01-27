import { createPinoLogger } from '@bogeychan/elysia-logger'
import { html } from '@elysiajs/html'
import staticPlugin from '@elysiajs/static'
import { swagger } from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import { checkEnv } from '@/libs/env.ts'
import { api } from '@/modules/api'
import { app as App } from '@/modules/app'

const port = process.env.PORT || 80
checkEnv()

export const log = createPinoLogger({})

const app = new Elysia()
  .use(staticPlugin())
  .use(html())
  .use(
    log.into({
      autoLogging: {
        ignore(ctx) {
          return ctx.request.url.includes('/public')
        },
      },
    }),
  )
  .use(
    swagger({
      autoDarkMode: true,
      path: '/docs',
      swaggerOptions: {},
    }),
  )
  .onError(ctx => {
    log.error(ctx.error)
  })
  .get('/health', () => 'Hello Elysia')
  .use(api)
  .use(App)
  .listen(port)

console.log(`🦊 Elysia is running at ${app.server?.url}`)
// setInterval(() => {
//   log.info(process.memoryUsage())
// }, 1000)
