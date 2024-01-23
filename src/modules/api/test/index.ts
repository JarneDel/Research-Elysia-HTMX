import { Elysia } from 'elysia'
import { ScoreboardRepository } from '@/repository/scoreboard.repository.ts'

export const test = (app: Elysia) =>
  app.get(
    '/scoreboard/:quizCode',
    async ctx => {
      const quizCode = ctx.params.quizCode
      const scoreboard = new ScoreboardRepository(quizCode)
      const result = await scoreboard.createScoreboard()
      return result
    },
    {
      detail: {
        summary: 'Get scoreboard',
        description: 'Get scoreboard for a quiz',
        tags: ['Scoreboard'],
      },
    },
  )
