import { Elysia, t } from 'elysia'
import { supabase } from '@/libs'
import { AuthResult, checkAccessToken } from '@/libs/auth.ts'
import { Cookie } from '@/types/cookie.type.ts'

export const quizPresentation = (app: Elysia) =>
  app.group('/present', app =>
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
              tags: ['present'],
            },
          },
          app =>
            app.get('/:id', async ({ params, authResult }) => {
              console.log(params.id, authResult, 'params.id')
              if (!authResult().user) return

              const { data, error } = await supabase
                .from('active_quiz')
                .select(
                  `
                id,
                created_at,
                current_page_id,
                quiz_id,
                user_id
              `,
                )
                .eq('id', params.id)
                .eq('user_id', authResult().user?.id)

              return (
                <>
                  <div class="" hx-ext="ws" ws-connect="/ws">
                    <div id="users"></div>
                  </div>
                </>
              )
            }),
        ),
    ),
  )
