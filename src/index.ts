import { createPinoLogger } from '@bogeychan/elysia-logger'
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
  .use(
    log.into({
      autoLogging: {
        ignore(ctx) {
          return ctx.request.url.includes('/public')
        },
      },
    }),
  )
  .get('/health', () => 'Hello Elysia')
  .use(
    swagger({
      autoDarkMode: true,
      path: '/docs',
      swaggerOptions: {},
    }),
  )
  .onError(ctx => {
    log.error(ctx.err)
    return ctx.res.status(500).send({ error: ctx.err.message })
  })
  .use(api)
  .use(App)
  .use(staticPlugin())
  .listen(port)

console.log(`🦊 Elysia is running at ${app.server?.url}`)
