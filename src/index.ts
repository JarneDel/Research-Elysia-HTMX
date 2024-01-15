import staticPlugin from '@elysiajs/static'
import { swagger } from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import { api } from '@/modules/api'
import { app as App } from '@/modules/app'

const app = new Elysia()
  .get('/health', () => 'Hello Elysia')
  .use(
    swagger({
      autoDarkMode: true,
      path: '/docs',

      swaggerOptions: {},
    }),
  )
  .use(api)
  .use(App)
  .use(staticPlugin())
  .listen({
    port: process.env.PORT || 80,
  })

console.log(`🦊 Elysia is running at ${app.server?.url}`)
