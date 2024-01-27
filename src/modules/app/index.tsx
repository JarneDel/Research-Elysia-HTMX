import { Elysia } from 'elysia'
import { initHtmx } from '@/hooks/htmx.hook.tsx'
import { isAnonymousUser } from '@/libs/authen'
import { fragments } from '@/modules/app/fragments'
import { auth } from '@/modules/app/views/auth/Auth.tsx'
import { q } from '@/modules/app/views/publicPresentation/q.tsx'
import { quiz } from '@/modules/app/views/quiz/Quiz.tsx'
import { quizPresentation } from '@/modules/app/views/quizPresentation/quizPresentation.tsx'
import { Cookie } from '@/types/cookie.type.ts'
import { wss } from './websocket/wss.tsx'

export const app = (app: Elysia) =>
  app
    .use(initHtmx)
    .use(auth)
    .use(quiz)
    .use(q)
    .use(fragments)
    .use(wss)
    .use(quizPresentation)
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
