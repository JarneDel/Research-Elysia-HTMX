import { Elysia, t } from 'elysia'
import { supabase } from '@/libs'
import { setAuthCookies } from '@/libs/auth.ts'
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
          const { data, error } = await supabase.auth.signInWithPassword(body)

          if (error) return error
          cookie.access_token.set({
            value: data.session.access_token,
            httpOnly: true,
            path: '/',
            // maxAge: 60 * 5,
            sameSite: 'lax',
          })
          cookie.refresh_token.set({
            value: data.session.refresh_token,
            httpOnly: true,
            path: '/',
            // maxAge: 60 * 60 * 24 * 30,
            sameSite: 'lax',
          })

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
          const { error } = await supabase.auth.signOut()
          if (error) return error
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
