import { Elysia } from 'elysia'
import { authen } from '@/libs'

export const post = (app: Elysia) =>
  app.use(authen).get('/post', () => 'Hello Elysia')
