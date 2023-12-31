import { Elysia, t } from 'elysia'

import { supabase } from '@/libs'

export const auth = (app: Elysia) =>
  app
    .group('/auth', (app) => {
        return app
          .post('/sign-up', async ({ body }) => {
            const { data, error } = await supabase.auth.signUp(body)
            if (error) return error
            return data.user
          }, {
            body: t.Object({
              email: t.String({
                format: 'email',
              }),
              password: t.String({
                minLength: 8,
              }),
            }),
            detail: {
              description: 'Sign up a new user',
              tags: ['Authentication'],
            },
          })
          .post(
            '/sign-in',
            async ({ body, cookie }) => {
              const { data, error } =
                await supabase.auth.signInWithPassword(body)

              if (error) return error


              cookie.refresh_token.set({
                value: data.session!.refresh_token,
                httpOnly: true,
                path: '/',
              })
              cookie.access_token.set({
                value: data.session!.access_token,
                httpOnly: true,
                path: '/',
              })
              return data.user
            },
            {
              body: t.Object({
                email: t.String({
                  format: 'email',
                }),
                password: t.String({
                  minLength: 8,
                }),
              }),
              cookie: t.Object({
                refresh_token: t.Optional(t.String()),
                access_token: t.Optional(t.String()),
              }),
              detail: {
                description: 'Sign in a user',
                tags: ['Authentication'],
              },
            },
          ).get('refresh', async ({ cookie: { refresh_token } }) => {
            const { data, error } =
              await supabase.auth.refreshSession({
                refresh_token: refresh_token.toString(),
              })

            if (error) return error

            return data.user
          }, {
            cookie: t.Object({
              refresh_token: t.String(),
            }),
          })

      },
    )