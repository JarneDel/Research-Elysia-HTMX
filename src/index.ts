import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { api } from '@/modules/api'

const app = new Elysia()
  .get('/health', () => 'Hello Elysia')
  .use(swagger({
    autoDarkMode: true,
  }))
  .use(api)
  .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.url}`,
)
