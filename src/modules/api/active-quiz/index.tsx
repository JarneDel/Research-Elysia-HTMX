import { Elysia, t } from 'elysia'
import { AuthResult, checkAccessToken } from '@/libs/auth.ts'
import { Cookie } from '@/types/cookie.type.ts'

export const quizPresentation = (app: Elysia) =>
  app.group('/active-quiz', app =>
    app.guard({}, app =>
      app
        .derive(ctx => {
          let result: AuthResult = {}
          return {
            async checkAccessToken() {
              result = await checkAccessToken(ctx.cookie)
              return result
            },
            authResult() {
              return result
            },
          }
        })
        .guard(
          {
            beforeHandle: async ctx => {
              const { set } = ctx
              const result = await ctx.checkAccessToken()
              if (result.error) {
                set.headers['HX-Redirect'] = '/auth/sign-in'
                set.redirect = '/auth/sign-in'
                return 'Unauthorized'
              }
            },
            cookie: Cookie,
            headers: t.Object({
              'HX-Request': t.Optional(t.String()),
            }),
            detail: {
              tags: ['api', 'active-quiz'],
            },
          },
          app =>
            app.get(
              '/connected-users/:activeQuizId',
              async ({ authResult }) => {
                const user = authResult().user
                if (!user) return
              },
            ),
        ),
    ),
  )
