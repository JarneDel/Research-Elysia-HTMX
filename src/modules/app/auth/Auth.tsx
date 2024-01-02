import { Elysia, t } from 'elysia'
import { Layout } from '@/components/Layout.tsx'
import { checkAccessToken, login } from '@/libs/auth.ts'
import { Cookie } from '@/types/cookie.type.ts'

export const auth = (app: Elysia) =>
  app.group('/auth', app =>
    app.get(
      '/sign-in',
      async ({ cookie, set, body }) => {
        const { user, error } = await checkAccessToken(cookie)
        if (user?.id) {
          set.redirect = '/'
          return
        }

        return (
          // HTMX
          <Layout>
            <div class="w-full grid place-items-center min-h-screen">
              <div class="max-w-md bg-surface-low text-surface-foreground w-full p-3 rounded-lg">
                <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Sign in to your account
                </h1>
                <form
                  class="flex flex-col gap-2 mt-6"
                  hx-post="/api/auth/sign-in"
                  hx-target="closest div"
                  hx-swap="outerHTML"
                >
                  <label for="email" class="label">
                    Your email
                  </label>
                  <input
                    name="email"
                    type="email"
                    id="email"
                    placeholder="email"
                    class="input"
                  />

                  <label for="password" class="label ">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="password"
                    class="input"
                  />
                  <button type="submit" class="btn btn-primary">
                    Sign In
                  </button>
                </form>
              </div>
            </div>
          </Layout>
        )
      },
      {
        cookie: Cookie,
      },
    ),
  )
