import { Elysia, t } from 'elysia'
import { Alert } from '@/components/errors/Alerts.tsx'
import { supabase } from '@/libs'
import { checkAccessToken } from '@/libs/auth.ts'
import { Cookie } from '@/types/cookie.type.ts'

export const auth = (app: Elysia) =>
  app.group('/quiz-page', app =>
    app
      .get('/:id', ({ params }) => {
        supabase.from('quiz-page').insert([{ id: params.id }])
      })
      .post(
        '/:quizId/:questionId/create',
        async ({ params, body, cookie }) => {
          const account = await checkAccessToken(cookie)
          const quiz = await supabase
            .from('quiz')
            .select('id, created_by')
            .eq('id', params.quizId)
            .eq('created_by', account.user?.id)
          if (quiz.count !== 1) {
            return (
              // todo: return htmx error
              <Alert severity="error">
                You are not authorized to create question in this quiz
              </Alert>
            )
          }

          const result = await supabase
            .from('page')
            .insert({
              question: body.question,
              quiz: params.quizId,
              answers: body.answers,
              correct_answers: body.correct_answers,
            })
            .select('id')
            .single()

          return <Alert severity="success">Question created successfully</Alert>
        },
        {
          body: t.Object({
            question: t.String(),
            answers: t.Array(t.String()),
            correct_answers: t.Array(t.Number()),
          }),
          params: t.Object({
            quizId: t.String(),
            questionId: t.String(),
          }),
          cookie: Cookie,
        },
      ),
  )
