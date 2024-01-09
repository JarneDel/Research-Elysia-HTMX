import { Elysia } from 'elysia'
import { quiz } from 'src/modules/api/quiz'
import { auth } from '@/modules/api/auth'

export const api = (app: Elysia) =>
  app.group('/api', app => app.use(auth).use(quiz))
