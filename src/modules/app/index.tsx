import { html } from '@elysiajs/html'
import { Elysia, t } from 'elysia'
import { Layout } from '@/components/Layout.tsx'
import { initHtmx } from '@/hooks/htmx.hook.tsx'
import { authen } from '@/libs'
import { auth } from '@/modules/app/auth/Auth.tsx'

export const app = (app: Elysia) =>
  app
    .use(html())
    .get('/', async () => {
      return (
        <Layout title="hello world">
          <div hx-get="/hello" hx-target="closest div" hx-trigger="load"></div>
        </Layout>
      )
    })
    .use(auth)
    .use(authen)
    .use(initHtmx)

    .get('/hello', async () => {
      return <div>hello world</div>
    })
