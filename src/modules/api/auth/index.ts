import { Elysia, t } from 'elysia'
import { supabase } from '@/libs'
import { login, setAuthCookies } from '@/libs/auth.ts'
import { handleHxRequest } from '@/modules/api/auth/header.ts'
import { Cookie, RefreshCookie } from '@/types/cookie.type'

export const auth = (app: Elysia) =>
  app.group('/auth', app => {
    return app
      .post(
        '/sign-up',
        async ({ body, cookie, headers, set }) => {
          const { data, error } = await supabase.auth.signUp(body)
          if (error) return error
          setAuthCookies(cookie, data.session!)
          handleHxRequest(headers, set)
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
          detail: {
            description: 'Sign up a new user',
            tags: ['Authentication'],
          },
          headers: t.Object({
            'hx-request': t.Optional(t.String()),
            'hx-current-url': t.Optional(t.String()),
          }),

          cookie: Cookie,
        },
      )
      .post(
        '/sign-in',
        async ({ body, cookie, set, headers }) => {
          console.log(body)
          console.log({ headers })
          const { user, session, error } = await login(body, cookie)

          handleHxRequest(headers, set)
          return user
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
          cookie: Cookie,
          headers: t.Object({
            'hx-request': t.Optional(t.String()),
            'hx-current-url': t.Optional(t.String()),
          }),
          detail: {
            description: 'Sign in a user',
            tags: ['Authentication'],
          },
        },
      )
      .get(
        '/sign-out',
        async ({ cookie, set, headers }) => {
          cookie.refresh_token.remove({
            path: '/',
            sameSite: 'lax',
          })
          cookie.access_token.remove({
            path: '/',
            sameSite: 'lax',
          })
          set.redirect = '/auth/sign-in'
        },
        {
          cookie: Cookie,
          detail: {
            description: 'Sign out a user',
            tags: ['Authentication'],
          },
        },
      )
      .get(
        'refresh',
        async ({ cookie: { refresh_token } }) => {
          const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refresh_token.toString(),
          })

          if (error) return error

          return data.user
        },
        {
          cookie: RefreshCookie,
        },
      )
  })
