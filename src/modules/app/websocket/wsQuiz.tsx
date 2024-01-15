import { Elysia } from 'elysia'

export const app = (app: Elysia) =>
  app.ws('/ws', {
    open: ws => {
      ws
    },
  })
