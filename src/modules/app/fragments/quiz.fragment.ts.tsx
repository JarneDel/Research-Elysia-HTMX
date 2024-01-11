import { Elysia, t } from 'elysia'
import { AddAnswer, Answer } from '@/components/quiz/CreateQuiz.tsx'
import { MediaUpload } from '@/components/quiz/MediaUpload.tsx'
import { supabase } from '@/libs'
import { checkAccessToken } from '@/libs/auth.ts'
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

          const quiz = await supabase
            .from('quiz')
            .select(
              `
              created_by,
              id,
              name,
              page (
                id,
                question,
                answers,
                correct_answers,
                page
              )
          `,
            )
            .eq('id', query.quiz)
            .eq('created_by', user?.id)
            .eq('page.page', params.page)
          console.log(quiz, 'quiz', params.page, query.quiz)

          const {
            data: pageData,
            error,
            status,
          } = await supabase
            .from('page')
            .select()
            .eq('page', params.page)
            .eq('quiz', query.quiz)
            .single()
          if (error && status !== 406) {
            return (
              <div class="alert alert-error">
                <span>Something went wrong: {error.message}</span>
              </div>
            )
          }

          console.log(pageData, 'pageData', params.page, query.quiz)

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
                  <MediaUpload
                    postURL={`/api/quiz/${query.quiz}/upload_media/${params.page}`}
                    progressID="progress"
                    inputID="media-input"
                    formID="media-form"
                    target="#media"
                  />
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
