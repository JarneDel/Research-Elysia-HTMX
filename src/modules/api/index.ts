import { Elysia } from 'elysia'
import { quizPresentation } from '@/modules/api/active-quiz'
import { auth } from '@/modules/api/auth'
import { publicQuiz } from '@/modules/api/quiz'
import { quizEditorApi } from '@/modules/api/quizEditor'

export const api = (app: Elysia) =>
  app.group('/api', app =>
    app.use(auth).use(quizEditorApi).use(quizPresentation).use(publicQuiz),
  )
