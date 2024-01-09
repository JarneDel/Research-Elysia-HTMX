import { Elysia, t } from 'elysia'
import { Success } from '@/components/icons/StatusIcons.tsx'
import { checkAccessToken } from '@/libs/auth.ts'
import { supabase } from '@/libs/supabase'
import { Cookie } from '@/types/cookie.type.ts'

export const quiz = (app: Elysia) =>
  app
    .post(
      '/quiz/create',
      async ({ body, cookie, headers, set }) => {
        const isHtmx = headers['hx-request'] == 'true'
        const isLegal = body.name.length >= 4 && body.description
        if (!isLegal) {
          if (isHtmx) {
            return (
              <>
                <div class="alert alert-error">
                  <span>Title not long enough</span>
                </div>
              </>
            )
          }
          return {
            status: 200,
            message: 'Title not long enough',
          }
        }
        console.log('getting user')
        const user = await checkAccessToken(cookie)
        console.log(user.user, 'user id')

        if (user.user) {
          const result = await supabase
            .from('quiz')
            .insert([
              {
                name: body.name,
                description: body.description,
                created_by: user.user.id,
              },
            ])
            .select('id')
          if (isHtmx) {
            if (result.status === 201) {
              if (!result.data || result.data.length === 0) {
                return (
                  <>
                    <div class="alert alert-error">
                      <span>Something went wrong: {result.status}</span>
                    </div>
                  </>
                )
              }
              return (
                <>
                  <div
                    class="alert alert-success"
                    hx-trigger="load delay:1s once"
                    hx-get={'/quiz/' + result.data[0]?.id}
                  >
                    <Success />
                    <span>Quiz created, redirecting..</span>
                  </div>
                </>
              )
            } else {
              return (
                <>
                  <div class="alert alert-error">
                    <span>Something went wrong: {result.status}</span>
                  </div>
                </>
              )
            }
          }
          if (result.status === 201) {
            set.status = 201
            return
          }
        } else {
          set.status = 401
          return
        }
      },
      {
        body: t.Object({
          name: t.String(),
          description: t.String(),
        }),
        cookie: Cookie,
        detail: {
          description: 'Create a new quiz',
          tags: ['Quiz'],
        },
        headers: t.Object({
          'hx-request': t.Optional(t.String()),
        }),
      },
    )
    .put(
      '/quiz/:id/change-name',
      async ({ body, cookie, params, set }) => {
        const { user, error } = await checkAccessToken(cookie)
        console.log(body, 'body')
        if (error) {
          set.status = 401
          return
        }
        const {
          data,
          error: dbError,
          count,
        } = await supabase
          .from('quiz')
          .update({ name: body.value })
          .eq('id', params.id)
          .eq('created_by', user?.id)
        if (dbError) {
          set.status = 500
          return
        }
        if (count === 0) {
          set.status = 404
          return
        }
      },
      {
        body: t.Object({
          value: t.String(),
        }),
        cookie: Cookie,
        detail: {
          description: 'Change name of a quiz',
          tags: ['Quiz'],
        },
      },
    )
