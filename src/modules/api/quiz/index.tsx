import { Elysia, t } from 'elysia'

export const publicQuiz = (app: Elysia) =>
  app.group('/public-quiz', app =>
    app.get(
      '/join',
      ctx => {
        if (ctx.headers['hx-request'] === 'true') {
          ctx.set.headers['HX-Redirect'] = '/q/' + ctx.query.code.toUpperCase()
          ctx.set.headers['HX-Push-URL'] = '/q/' + ctx.query.code.toUpperCase()
        } else {
          ctx.set.redirect = '/q/' + ctx.query.code.toUpperCase()
        }
      },
      {
        // url encoded body
        headers: t.Object({
          'hx-request': t.Optional(t.String()),
        }),
        query: t.Object({
          code: t.String(),
        }),
        detail: {
          description: 'Redirect to quiz',
          tags: ['api', 'public-quiz'],
        },
      },
    ),
  )
