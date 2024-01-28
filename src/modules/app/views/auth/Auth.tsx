import { Elysia } from 'elysia'
import { initHtmx } from '@/hooks/htmx.hook.tsx'
import { checkAccessToken } from '@/libs/auth.ts'
import { Cookie } from '@/types/cookie.type.ts'

export const auth = (app: Elysia) =>
  app.group('/auth', app =>
    app
      .use(initHtmx)
      .get(
        '/sign-in',
        async ({ cookie, set, body }) => {
          const { user, error } = await checkAccessToken(cookie)
          if (user?.id) {
            set.redirect = '/'
            return
          }

          return (
            // HTMX
            <div class="w-full grid place-items-center min-h-screen">
              {/*<div class="max-w-md bg-surface-low text-surface-foreground w-full p-3 rounded-lg">*/}
              <div class="card w-96 bg-base-100 shadow-xl">
                <div class="card-body">
                  {/*<h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">*/}
                  <h1 class="card-title">Sign in to your account</h1>
                  <div id="sign-in-result"></div>
                  <form
                    hx-post="/api/auth/sign-in"
                    hx-target="#sign-in-result"
                    hx-swap="innerHTML"
                  >
                    <label class="form-control w-full max-w-xs">
                      <div class="label">
                        <span class="label-text">Email</span>
                      </div>
                      <input
                        type="email"
                        placeholder="Your email address"
                        name="email"
                        class="input input-bordered input-primary w-full max-w-xs"
                      />
                    </label>

                    <label class="form-control w-full max-w-xs">
                      <div class="label">
                        <span class="label-text">Password</span>
                      </div>
                      <input
                        type="password"
                        placeholder="password"
                        name="password"
                        class="input input-bordered input-primary w-full max-w-xs"
                      />
                    </label>
                    <a
                      hx-push-url="true"
                      hx-get="/auth/sign-up"
                      hx-target="body"
                    >
                      <span class="link link-primary">Create an account</span>
                    </a>

                    <div class="card-actions justify-center mt-4">
                      <button type="submit" class="btn btn-primary w-full">
                        Sign In
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )
        },
        {
          cookie: Cookie,
          detail: {
            tags: ['View', 'Authentication'],
          },
        },
      )
      .get(
        '/sign-up',
        async ({ cookie, set, body }) => {
          const { user, error } = await checkAccessToken(cookie)
          if (user?.id) {
            set.redirect = '/'
            return
          }

          return (
            // HTMX
            <div class="w-full grid place-items-center min-h-screen">
              {/*<div class="max-w-md bg-surface-low text-surface-foreground w-full p-3 rounded-lg">*/}
              <div class="card w-96 bg-base-100 shadow-xl">
                <div class="card-body">
                  {/*<h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">*/}
                  <h1 class="card-title">Create an account</h1>
                  <form hx-post="/api/auth/sign-up" hx-swap="outerHTML">
                    <label class="form-control w-full max-w-xs">
                      <div class="label">
                        <span class="label-text">Email</span>
                      </div>
                      <input
                        type="email"
                        placeholder="Your email address"
                        name="email"
                        class="input input-bordered input-primary w-full max-w-xs"
                      />
                    </label>

                    <label class="form-control w-full max-w-xs">
                      <div class="label">
                        <span class="label-text">Password</span>
                      </div>
                      <input
                        type="password"
                        placeholder="password"
                        name="password"
                        class="input input-bordered input-primary w-full max-w-xs"
                      />
                    </label>
                    <a hx-push-url="true" hx-get="/auth/sign-in">
                      <span class="link link-primary">
                        Already have an account? Log in
                      </span>
                    </a>

                    <div class="card-actions justify-center mt-4">
                      <button type="submit" class="btn btn-primary w-full">
                        Register
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )
        },
        {
          cookie: Cookie,
          detail: {
            tags: ['View', 'Authentication'],
          },
        },
      ),
  )
