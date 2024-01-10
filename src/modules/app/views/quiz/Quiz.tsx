import { Elysia, t } from 'elysia'
import { Alert } from '@/components/errors/Alerts.tsx'
import { Loading } from '@/components/states/loading.tsx'
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
        async ({ cookie, params, query }) => {
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
          const page = query.page ? parseInt(query.page) : 1

          const { data: pageData, count: pageCount } = await supabase
            .from('page')
            .select()
            .eq('quiz', params.id)
            .eq('page', page)
            .single()

          console.log(pageCount, 'pageCount')
          console.log(pageData, 'pageData')

          return (
            <>
              <div>
                <input
                  type="text"
                  value={data[0].name}
                  hx-put={'/api/quiz/' + data[0].id + '/change-name'}
                  hx-trigger="blur input"
                  name="value"
                  class="input input-secondary input-bordered my-2 "
                />
              </div>

              <div
                hx-trigger="load"
                hx-get={'/fragment/quiz/page/' + page + '?quiz=' + params.id}
                hx-swap="outerHTML"
                hx-indicator="#quizPage"
              ></div>
              <Loading id="quizPage" />
            </>
          )
        },
        {
          cookie: Cookie,
          detail: {
            tags: ['HTMX', 'Quiz'],
            description: 'Get a quiz',
          },
          query: t.Object({
            page: t.Optional(t.String()),
          }),
          headers: t.Object({
            'HX-Request': t.Optional(t.String()),
          }),
        },
      ),
  )
