import { Elysia, t } from 'elysia'
import { AddAnswer, EditAnswer } from '@/components/quiz/CreateQuiz.tsx'
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
              <EditAnswer
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
          tags: ['Fragment', 'Quiz', 'Editor'],
          description: 'Add possible answer to the question',
        },
        cookie: Cookie,
      }),
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
