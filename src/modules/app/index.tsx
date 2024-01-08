import { html } from '@elysiajs/html'
import { Elysia, t } from 'elysia'
import { Layout } from '@/components/Layout.tsx'
import { initHtmx } from '@/hooks/htmx.hook.tsx'
import { authen } from '@/libs'
import { accountFragment } from '@/modules/app/fragments/accountFragment.tsx'
import { auth } from '@/modules/app/views/auth/Auth.tsx'

export const app = (app: Elysia) =>
  app
    .use(html())
    .use(initHtmx)
    .use(auth)
    .use(authen)
    .use(accountFragment)
    .get('/', async () => {
      return (
        <Layout title="hello world">
          <div hx-get="/hello" hx-target="closest div" hx-trigger="load"></div>
        </Layout>
      )
    })

    .get('/hello', async () => {
      return <div>hello world</div>
    })
