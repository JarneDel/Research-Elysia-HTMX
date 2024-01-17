import { Elysia, t } from 'elysia'
import { Alert } from '@/components/errors/Alerts.tsx'
import { EditQuiz } from '@/components/quiz/EditQuiz.tsx'
import { EditQuizPage } from '@/components/quiz/EditQuizPage.tsx'
import { QuizCard } from '@/components/quiz/QuizCard.tsx'
import { supabase } from '@/libs'
import { isUser } from '@/libs/authen.ts'
import { quizWithPage } from '@/repository/quiz.database.ts'
import { Cookie } from '@/types/cookie.type.ts'

export const quiz = (app: Elysia) =>
  app.group('/quiz', app =>
    app.guard(
      {
        // Handle user authentication (only allow logged in users)
        beforeHandle: isUser,
        cookie: Cookie,
        headers: t.Object({
          'HX-Request': t.Optional(t.String()),
        }),
      },
      app =>
        app
          .resolve(ctx => {
            return {
              //@ts-expect-error ctx.authResult is not typesafe yet
              authResult: ctx.authResult,
            }
          })
          .get(
            '/create',
            () => {
              return (
                <>
                  <div class="flex items-center justify-center full-height">
                    <form
                      class="card bg-base-200 p-4"
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
              detail: {
                tags: ['View', 'Quiz'],
                description: 'Create a new quiz',
              },
            },
          )
          .get(
            '/:id/edit',
            async ({ params, query, authResult }) => {
              const { user, error } = authResult
              if (error) {
                return <Alert severity="error">Unauthorized</Alert>
              }

              const { data, error: dbError } = await quizWithPage(
                params.id!,
                user?.id,
                query.page ? query.page : '1',
              )

              const pageData = data?.page[0]
              if (!data) {
                return (
                  <Alert severity="error">
                    Something went wrong: {dbError?.message || 'No page data'}
                  </Alert>
                )
              }
              const page = pageData?.page || '1'

              return (
                <EditQuiz pageNumber={page} quizId={params.id} quiz={data} />
              )
            },
            {
              detail: {
                tags: ['View', 'Quiz', 'Editor'],
                description: 'Get a quiz',
              },
              query: t.Object({
                page: t.Optional(t.String()),
              }),
            },
          )
          .get(
            '/:id/edit/page/:page',
            async ({ headers, params, query, authResult }) => {
              // send without quizEditor when hx-request is present
              const { user } = authResult

              const { status, data, error } = await quizWithPage(
                params.id,
                user?.id,
                params.page,
              )

              if (error && status !== 406) {
                return (
                  <div class="alert alert-error">
                    <span>Something went wrong: {error.message}</span>
                  </div>
                )
              }
              const pageData = data?.page[0]

              const pageEditorHTML = (
                <EditQuizPage
                  pageNumber={params.page}
                  quizId={params.id}
                  page={pageData}
                  quiz={data}
                />
              )

              if (headers['hx-request'] != undefined) {
                return pageEditorHTML
              }
              // initialize with quizEditor
              return (
                <EditQuiz
                  pageNumber={params.page}
                  quizId={query.quiz!}
                  quiz={data}
                >
                  {pageEditorHTML}
                </EditQuiz>
              )
            },
            {
              cookie: Cookie,
              query: t.Object({
                quiz: t.Optional(t.String()),
              }),
              headers: t.Object({
                'hx-request': t.Optional(t.String()),
              }),
            },
          )

          .get(
            '/my',
            async ({ authResult: account }) => {
              const { data, error } = await supabase
                .from('quiz')
                .select()
                .eq('created_by', account.user?.id)
                .order('updated_at', { ascending: true })

              const { data: nowPresenting, error: nowPresentingError } =
                await supabase
                  .from('active_quiz')
                  .select('quiz_id, id')
                  .eq('user_id', account.user?.id)
              console.log('found quizzes', data?.length)
              console.log('now presenting', nowPresenting)
              return (
                <div class="container">
                  <div class=" grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-5 justify-center">
                    {data?.map(quiz => (
                      <QuizCard
                        quiz={quiz}
                        nowPresenting={nowPresenting || []}
                      />
                    ))}
                  </div>
                </div>
              )
            },
            {
              detail: {
                tags: ['View', 'Quiz'],
                description: 'Get all quizzes that you created',
              },
              cookie: Cookie,
            },
          ),
    ),
  )

/**
 * parse date
 * @param updatedAt
 * @returns {string} formatted dd/mm or dd/mm/yyyy if year is different
 */
