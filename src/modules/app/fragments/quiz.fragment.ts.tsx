import { Elysia, t } from 'elysia'
import { AddAnswer, Answer } from '@/components/quiz/CreateQuiz.tsx'
import { MediaUpload } from '@/components/quiz/MediaUpload.tsx'
import { checkAccessToken } from '@/libs/auth.ts'
import { quizWithPage } from '@/repository/quiz.database.ts'
import { Cookie } from '@/types/cookie.type.ts'

export const quiz = (app: Elysia) =>
  app.group('/quiz', app =>
    app
      .get(
        '/page/addAnswer',
        ({ set, query }) => {
          const nextAnswer = getNextEmptyFieldIndex(
            Object.values(query).map(value => value as string),
          )
          console.log(nextAnswer)

          return (
            <>
              <Answer
                id={nextAnswer}
                placeholder={'Add answer' + (nextAnswer + 1)}
                isDeletable={true}
              />
              {nextAnswer < 5 && <AddAnswer />}
            </>
          )
        },
        {
          detail: {
            tags: ['Fragment', 'Quiz'],
            description: 'Add possible answer to the question',
          },
          query: t.Object(createAnswerField(6)),
        },
      )
      .get('/page/plusbutton', () => <AddAnswer />, {
        detail: {
          tags: ['Fragment', 'Quiz'],
          description: 'Add possible answer to the question',
        },
        headers: t.Object({}),
      })
      .get(
        '/page/:page',
        async ({ params, cookie, query }) => {
          const { user } = await checkAccessToken(cookie)
          // todo error handling for failed access token

          const { status, data, error } = await quizWithPage(
            query.quiz!,
            user?.id!,
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

          return (
            <div id="page">
              <div
                hx-trigger="input delay:300ms, submit"
                hx-post={`/api/quiz/${query.quiz}/change-answers/page/${params.page}`}
                hx-include=".answer, .correct-answer, .page-title"
                hx-swap="none"
              >
                <h1 class="text-lg font-bold">Question {params.page}</h1>
                <label class="form-control mb-3">
                  <div class="label-text">Question</div>
                  <input
                    name="title"
                    type="text"
                    class="page-title input input-primary input-bordered text-center input-lg font-bold"
                    value={pageData?.question}
                    placeholder="start typing your question"
                  />
                </label>
                <div
                  id="media"
                  class="container max-w-2xl mx-auto border-accent border-2 rounded-md p-2 mb-3"
                >
                  {!pageData?.media_url ? (
                    <MediaUpload
                      postURL={`/api/quiz/${query.quiz}/upload_media/${params.page}`}
                      progressID="progress"
                      inputID="media-input"
                      formID="media-form"
                      target="#media"
                    />
                  ) : (
                    <div class="flex justify-center items-center w-full max-h-96">
                      <div class="indicator">
                        <button
                          class="indicator-item badge badge-error"
                          hx-delete={
                            '/api/quiz/' + query.quiz + '/media/' + params.page
                          }
                          hx-target="#media"
                          hx-swap="innerHTML"
                        >
                          remove
                        </button>
                        <div class="max-h-48">
                          <img src={pageData.media_url} alt="" class="" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <ul class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:grid-rows-3 ">
                  {(!pageData || pageData?.answers.length == 0) && (
                    <>
                      <Answer id={0} placeholder="Add answer 1" />
                      <Answer id={1} placeholder="Add answer 2" />
                      <AddAnswer />
                    </>
                  )}
                  {pageData?.answers.map((answer: string, index: number) => (
                    <Answer
                      id={index}
                      placeholder={'Add answer' + (index + 1)}
                      value={answer}
                      isCorrect={pageData.correct_answers.includes(index)}
                      isDeletable={index > 1}
                    />
                  ))}
                  {pageData?.answers.length < 6 && <AddAnswer />}
                </ul>
              </div>
              <div class="flex justify-between mt-5">
                <button
                  class="btn btn-primary"
                  hx-get={`/fragment/quiz/page/${
                    Number(params.page) - 1
                  }?quiz=${query.quiz}`}
                  hx-swap="outerHTML"
                  hx-target="#page"
                  disabled={Number(params.page) == 1}
                  hx-trigger="click"
                >
                  Previous
                </button>
                <button
                  class="btn btn-primary"
                  hx-get={`/fragment/quiz/page/${
                    Number(params.page) + 1
                  }?quiz=${query.quiz}`}
                  hx-swap="outerHTML"
                  hx-target="#page"
                  hx-trigger="click"
                >
                  Next
                </button>
              </div>
            </div>
          )
        },
        {
          cookie: Cookie,
          query: t.Object({
            quiz: t.Optional(t.String()),
          }),
          detail: {
            tags: ['Fragment', 'Quiz'],
            description: 'Get a quiz',
          },
        },
      ),
  )

function createAnswerField(max = 6) {
  const answerFields: { [key: string]: any } = {}
  for (let i = 0; i < max; i++) {
    answerFields[`answer${i}`] = t.Optional(t.String())
  }
  return answerFields
}

function getNextEmptyFieldIndex(
  answers: (string | null | undefined)[],
): number {
  return answers.findIndex(answer => answer === null || answer === undefined)
}
