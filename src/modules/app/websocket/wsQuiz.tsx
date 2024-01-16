import { Elysia } from 'elysia'

export const wsQuiz = (app: Elysia) =>
  app.ws('/ws', {
    open: ws => {
      console.log('websocket opened')
    },
  })
