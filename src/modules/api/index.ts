import { Elysia } from 'elysia'
import { quizEditorApi } from 'src/modules/api/quizEditor'
import { auth } from '@/modules/api/auth'

export const api = (app: Elysia) =>
  app.group('/api', app => app.use(auth).use(quizEditorApi))
