import { Elysia } from 'elysia'
import { initHtmx } from '@/hooks/htmx.hook.tsx'
import { isAnonymousUser } from '@/libs/authen'
import { fragments } from '@/modules/app/fragments'
import { auth } from '@/modules/app/views/auth/Auth.tsx'
import { landingPage } from '@/modules/app/views/landingPage'
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
    .use(landingPage)
    .guard(
      {
        beforeHandle: isAnonymousUser,
        cookie: Cookie,
      },
      app =>
        app.get('/', async ({ cookie }) => {
          return (
            <div
              hx-get="/landing"
              hx-target="closest div"
              hx-trigger="load"
            ></div>
          )
        }),
    )
