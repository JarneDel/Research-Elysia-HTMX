import { html } from '@elysiajs/html'
import { Elysia } from 'elysia'
import { initHtmx } from '@/hooks/htmx.hook.tsx'
import { authen } from '@/libs'
import { isAnonymousUser } from '@/libs/authen'
import { sanitizeDerive } from '@/libs/sanitize.ts'
import { fragments } from '@/modules/app/fragments'
import { auth } from '@/modules/app/views/auth/Auth.tsx'
import { quiz } from '@/modules/app/views/quiz/Quiz.tsx'
import { Cookie } from '@/types/cookie.type.ts'

export const app = (app: Elysia) =>
  app
    .use(html())
    .use(initHtmx)
    .use(auth)
    .use(authen)
    .use(quiz)
    .use(fragments)
    .use(sanitizeDerive)
    .guard(
      {
        beforeHandle: isAnonymousUser,
        cookie: Cookie,
      },
      app =>
        app
          .get('/', async ({ cookie }) => {
            return (
              <div
                hx-get="/hello"
                hx-target="closest div"
                hx-trigger="load"
              ></div>
            )
          })
          .get('/hello', async () => {
            return <div>hello world</div>
          }),
    )
