import { Elysia, t } from 'elysia'
import { supabase } from '@/libs'
import { AuthResult } from '@/libs/auth.ts'
import { isUser } from '@/libs/authen.ts'
import { Cookie } from '@/types/cookie.type.ts'

export const quizPresentation = (app: Elysia) =>
  app.group('/presentation', app =>
    app.guard(
      {
        beforeHandle: () => isUser,
        cookie: Cookie,
        headers: t.Object({
          'HX-Request': t.Optional(t.String()),
        }),
      },
      app =>
        app
          .resolve(async ctx => {
            return {
              //@ts-expect-error // ctx.authResult is not typesafe yet
              authResult: ctx.authResult as AuthResult,
            }
          })
          .get('/:id', async ({ params, authResult }) => {
            if (!authResult.user) return

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
              .eq('user_id', authResult.user.id)

            return (
              <>
                <div class="" hx-ext="ws" ws-connect="/ws">
                  <div id="users"></div>
                </div>
              </>
            )
          }),
    ),
  )
