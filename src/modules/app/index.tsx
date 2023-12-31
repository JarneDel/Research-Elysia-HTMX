import { html } from '@elysiajs/html'
import { Elysia } from 'elysia'
import { Layout } from '@/components/Layout.tsx'
import { auth } from '@/modules/app/auth/Auth.tsx'

export const app = (app: Elysia) =>
  app
    .use(html())
    .get('/', async () => {
      return <Layout title="hello world"></Layout>
    })
    .use(auth)
