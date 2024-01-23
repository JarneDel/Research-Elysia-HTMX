import { Elysia, t } from 'elysia'
import { ScoreboardRepository } from '@/repository/scoreboard.repository.ts'

export const test = (app: Elysia) =>
  app
    .get(
      '/scoreboard/:quizCode',
      async ctx => {
        const quizCode = ctx.params.quizCode
        const scoreboard = new ScoreboardRepository(quizCode)
        const result = await scoreboard.calculateScores()
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
    .get(
      '/scoreboard/:quizCode/:count',
      async ctx => {
        const quizCode = ctx.params.quizCode
        const count = ctx.params.count
        const scoreboard = new ScoreboardRepository(quizCode)
        const result = await scoreboard.getTopScores(Number(count))
        return result
      },
      {
        detail: {
          summary: 'Get top scores',
          description: 'Get top scores for a quiz',
          tags: ['Scoreboard'],
        },
        params: t.Object({
          quizCode: t.String(),
          count: t.String(),
        }),
      },
    )
