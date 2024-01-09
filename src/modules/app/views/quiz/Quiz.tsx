import { Elysia, t } from 'elysia'
import { Alert } from '@/components/errors/Alerts.tsx'
import { supabase } from '@/libs'
import { checkAccessToken } from '@/libs/auth.ts'
import { Cookie } from '@/types/cookie.type.ts'

export const quiz = (app: Elysia) =>
  app.group('/quiz', app =>
    app
      .get(
        '/create',
        ({ cookie }) => {
          return (
            <>
              <div
                class="container flex"
                hx-trigger="load"
                hx-target="#menu"
                hx-get="/fragment/close"
              >
                <form
                  class="card"
                  hx-post="/api/quiz/create"
                  hx-target="#result"
                  hx-trigger="submit"
                >
                  <div id="result"></div>
                  <h1 class="card-title">Create new quiz</h1>
                  <label class="form-control">
                    <div class="label">
                      <div class="label-text">Title</div>
                    </div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Title"
                      class="input input-bordered mb-2"
                    />
                  </label>
                  <label class="form-control">
                    <div class="label">
                      <div class="label-text">
                        <div>Description</div>
                      </div>
                    </div>
                    <textarea
                      name="description"
                      placeholder="Description"
                      class="textarea textarea-bordered"
                    />
                  </label>
                  <button class="btn btn-primary mt-4">Create</button>
                </form>
              </div>
            </>
          )
        },
        {
          cookie: Cookie,
          detail: {
            tags: ['HTMX', 'Quiz'],
            description: 'Create a new quiz',
          },
          headers: t.Object({
            'HX-Request': t.Optional(t.String()),
          }),
        },
      )
      .get(
        '/:id/edit',
        async ({ cookie, params }) => {
          const { user, error } = await checkAccessToken(cookie)
          if (error) {
            return <Alert severity="error">Unauthorized</Alert>
          }
          const {
            data,
            error: dbError,
            count,
          } = await supabase
            .from('quiz')
            .select()
            .eq('id', params.id)
            .eq('created_by', user?.id)

          if (dbError) {
            return (
              <Alert severity="error">
                Something went wrong: {dbError.message}
              </Alert>
            )
          }

          return (
            <>
              <div>
                <input
                  type="text"
                  value={data[0].name}
                  hx-put={'/api/quiz/' + data[0].id + '/change-name'}
                  hx-trigger="blur"
                  class="input input-ghost"
                />
              </div>

              <ul class="menu">
                <li></li>
                <li>
                  <button
                    class="btn btn-ghost"
                    hx-get="/fragment/quiz/page/addAnswer/"
                    hx-target=" li"
                  >
                    +
                  </button>
                </li>
              </ul>
            </>
          )
        },
        {
          cookie: Cookie,
          detail: {
            tags: ['HTMX', 'Quiz'],
            description: 'Get a quiz',
          },
          headers: t.Object({
            'HX-Request': t.Optional(t.String()),
          }),
        },
      ),
  )
