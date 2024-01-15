import { Elysia, t } from 'elysia'
import { activeQuizDetails } from '@/repository/activeQuiz.database.ts'
import { Cookie } from '@/types/cookie.type.ts'

export const q = (app: Elysia) =>
  app.group('/q', app =>
    app.guard(
      {
        // beforeHandle: () => isAnonymousUser,
        cookie: Cookie,
        headers: t.Object({
          'HX-Request': t.Optional(t.String()),
        }),
      },
      app =>
        app.get('/:id', async ({ params }) => {
          const { data, error } = await activeQuizDetails(params.id)
          console.log(data, 'data')
          console.log(error, 'error')
        }),
    ),
  )
