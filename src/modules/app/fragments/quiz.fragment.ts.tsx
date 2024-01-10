import { Elysia, t } from 'elysia'
import { AddAnswer, Answer } from '@/components/quiz/CreateQuiz.tsx'
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
          const { user, error } = await checkAccessToken(cookie)
          const { data: pageData } = await supabase
            .from('page')
            .select()
            .eq('page', params.page)
            .eq('quiz', query.quiz)
            .single()

          return (
            <form
              hx-trigger="input delay:300ms, submit"
              hx-post={`/api/quiz/${query.quiz}/change-answers/page/${params.page}`}
              hx-include=".answer, .correct-answer, .page-title"
              hx-swap="none"
            >
              <label class="form-control mb-3">
                <div class="label-text">Question</div>
                <input
                  name="title"
                  type="text"
                  class="page-title input input-primary input-bordered"
                  value={pageData?.question}
                />
              </label>
              <ul class="grid grid-cols-1 md:grid-cols-2 gap-4 md:grid-rows-4 ">
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
            </form>
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
