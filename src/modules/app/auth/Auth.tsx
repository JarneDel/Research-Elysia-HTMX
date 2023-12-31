import { AuthSessionMissingError } from '@supabase/supabase-js'
import { Elysia, t } from 'elysia'
import { Layout } from '@/components/Layout.tsx'
import { checkAccessToken, login } from '@/libs/auth.ts'
import { Cookie } from '@/types/cookie.type.ts'

export const auth = (app: Elysia) =>
  app.group('/auth', app =>
    app.get(
      '/sign-in',
      async ({ cookie, body }) => {
        const { user, error } = await checkAccessToken(cookie)
        console.log(user, error)
        if (user?.id) {
          return { redirect: '/' }
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
                  <div>
                    <label
                      for="email"
                      class="text-sm font-bold block mb-2 font-meidu "
                    >
                      Your email
                    </label>
                    <input
                      name="email"
                      type="email"
                      id="email"
                      placeholder="email"
                      class="rounded text-surface-foreground bg-surface placeholder-surface-foreground py-2 px-3"
                    />
                  </div>

                  <label for="password" class="text-sm font-bold ">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="password"
                    class="rounded text-surface-foreground bg-surface placeholder-surface-foreground py-2 px-3"
                  />
                  <button
                    type="submit"
                    class="rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 mt-2"
                  >
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
