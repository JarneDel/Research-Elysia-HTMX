import { Elysia, t } from 'elysia'
import { DeleteQuizDialog } from '@/components/dialog/deleteQuiz.dialog.tsx'
import { Alert } from '@/components/errors/Alerts.tsx'
import { Loading } from '@/components/states/loading.tsx'
import { supabase } from '@/libs'
import { checkAccessToken } from '@/libs/auth.ts'
import { quizWithPage } from '@/repository/quiz.database.ts'
import { Cookie } from '@/types/cookie.type.ts'

export const quiz = (app: Elysia) =>
  app.group('/quiz', app =>
    app
      .get(
        '/create',
        ({ cookie }) => {
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
          cookie: Cookie,
          detail: {
            tags: ['View', 'Quiz'],
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

          const { data, error: dbError } = await quizWithPage(
            params.id!,
            user?.id!,
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
            <>
              <div class="flex justify-between navbar bg-base-300/60 relative">
                <div class="flex flex-row items-center gap-2">
                  <div class="tooltip" data-tip="Title">
                    <input
                      type="text"
                      value={data.name}
                      hx-put={'/api/quiz/' + data.id + '/change-name'}
                      hx-trigger="blur input"
                      name="value"
                      placeholder="Untitled quiz"
                      class="input input-ghost bg-base-200"
                    />
                  </div>
                  {data.isDraft && <div class="badge badge-warning">draft</div>}
                </div>

                <div
                  class="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 flex flex-row items-center gap-2 font-bold text-lg"
                  id="question_number"
                >
                  Question 1
                </div>

                <div class="flex flex-row items-center gap-2">
                  <a
                    class="btn btn-primary"
                    hx-push-url="true"
                    hx-get="/quiz/:id/present"
                    href="#"
                  >
                    Present quiz
                  </a>
                  <div class="dropdown dropdown-end ">
                    <button class="flex items-center btn">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </button>
                    <ul
                      tabindex="0"
                      class="dropdown-content z-[1] p-2 shadow bg-base-200 rounded-box w-32 mt-4 gap-2 flex flex-col"
                    >
                      <li>
                        <button
                          class="btn btn-error w-full btn-sm"
                          onclick="delete_quiz_modal.showModal()"
                        >
                          Delete quiz
                        </button>
                        <DeleteQuizDialog
                          id="delete_quiz_modal"
                          target="main"
                          deleteURL={`/api/quiz/${data.id}`}
                        />
                      </li>
                      {!data.isDraft && (
                        <li>
                          <a class="btn btn-warning w-full btn-sm">Set draft</a>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
              <div class="container">
                <div
                  hx-trigger="load"
                  hx-get={'/fragment/quiz/page/' + page + '?quiz=' + data.id}
                  hx-swap="outerHTML"
                  hx-indicator="#quizPage"
                ></div>
                <Loading id="quizPage" />
              </div>
            </>
          )
        },
        {
          cookie: Cookie,
          detail: {
            tags: ['View', 'Quiz', 'Editor'],
            description: 'Get a quiz',
          },
          query: t.Object({
            page: t.Optional(t.String()),
          }),
          headers: t.Object({
            'HX-Request': t.Optional(t.String()),
          }),
        },
      )
      .get(
        '/my',
        async ({ cookie }) => {
          const account = await checkAccessToken(cookie)
          const { data, error } = await supabase
            .from('quiz')
            .select()
            .eq('created_by', account.user?.id)
            .order('updated_at', { ascending: true })

          console.log(data, error)
          return (
            <div class="container">
              <div class=" grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-5 justify-center">
                {data?.map(quiz => (
                  <div class="card max-w-96 bg-base-200 min-w-64">
                    <div class="card-body">
                      <div class="flex flex-row justify-between">
                        <h2 class="card-title">
                          <span>
                            {quiz.name == '' ? 'untitled' : quiz.name}
                          </span>
                          {quiz.isDraft && (
                            <span class="badge badge-error">draft</span>
                          )}
                        </h2>
                        <div class="badge badge-ghost">
                          {parseUpdatedAt(quiz.updated_at)}
                        </div>
                      </div>

                      <p>{quiz.description}</p>
                      <div class="card-actions justify-end">
                        <button
                          class="btn btn-primary"
                          hx-get={'/quiz/' + quiz.id + '/edit'}
                          hx-push-url="true"
                          hx-target="main"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
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
  )

/**
 * parse date
 * @param updatedAt
 * @returns {string} formatted dd/mm or dd/mm/yyyy if year is different
 */
const parseUpdatedAt = (updatedAt: string): string => {
  const date = new Date(updatedAt)
  const today = new Date()
  const year = date.getFullYear()
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'numeric',
    year: year != today.getFullYear() ? 'numeric' : undefined,
  })
}
