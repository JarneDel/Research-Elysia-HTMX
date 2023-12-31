import { html } from '@elysiajs/html'
import { Elysia } from 'elysia'

export const app = (app: Elysia) =>
  app
    .use(html())
    .get('/' ,async () => {


    })