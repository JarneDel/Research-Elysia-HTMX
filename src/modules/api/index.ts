import { Elysia } from 'elysia'
import { auth } from '@/modules/api/auth'
import { post } from '@/modules/api/post'

export const api = (app: Elysia) =>
  app.group('/api', app => app.use(auth).use(post))
