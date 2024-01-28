import { Elysia, t } from 'elysia'
import { Alert } from '@/components/errors/Alerts.tsx'
import { log } from '@/index.ts'
import { supabase } from '@/libs'
import { login } from '@/libs/auth.ts'
import { handleHxRequest } from '@/modules/api/auth/header.ts'
import { Cookie } from '@/types/cookie.type'

export const auth = (app: Elysia) =>
  app.group('/auth', app => {
    return app
      .post(
        '/sign-up',
        async ({ body, cookie, headers, set }) => {
          const { data, error } = await supabase.auth.signUp({
            email: body.email,
            password: body.password,
          })
          if (error) {
            log.error(error, 'api::auth::sign-up::error')
            return (
              <>
                <Alert severity="error">{error.message}</Alert>
              </>
            )
          }
          log.info(data, 'api::auth::sign-up::data')
          return (
            <>
              <Alert severity="success">
                We have sent you an email to confirm your account. Please check
                your inbox.
              </Alert>
              <button
                class="btn btn-primary"
                name="sign-in"
                hx-get="/auth/sign-in"
                hx-target="body"
              >
                Sign in
              </button>
            </>
          )
        },
        {
          body: t.Object({
            email: t.String(),
            password: t.String(),
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
          const { user, session, error } = await login(body, cookie)
          if (error) {
            log.error(error, 'api::auth::sign-in::error')
            return (
              <>
                <Alert severity="error">{error}</Alert>
              </>
            )
          }
          handleHxRequest(headers, set)
          return user
        },
        {
          body: t.Object({
            email: t.String(),
            password: t.String(),
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
          cookie.refresh_token?.remove({
            path: '/',
            sameSite: 'lax',
          })
          cookie.access_token?.remove({
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
  })
