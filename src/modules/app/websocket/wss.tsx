import { Elysia, t } from 'elysia'
import { log } from '@/index.ts'
import { anyAuth } from '@/modules/app/websocket/auth.tsx'
import { getQuizCode } from '@/modules/app/websocket/generic.tsx'
import { Participant } from '@/modules/app/websocket/participant.tsx'
import { Presenter } from '@/modules/app/websocket/presenter.tsx'

export const wss = (app: Elysia) =>
  app.ws('/ws', {
    body: t.Object(
      {
        connect: t.Optional(t.String()),
        'quiz-answer-0': t.Optional(t.String()),
        'quiz-answer-1': t.Optional(t.String()),
        'quiz-answer-2': t.Optional(t.String()),
        'quiz-answer-3': t.Optional(t.String()),
        'quiz-answer-4': t.Optional(t.String()),
        'quiz-answer-5': t.Optional(t.String()),
        'next-question': t.Optional(t.Unknown()),
        'after-answer': t.Optional(t.Unknown()),
        'end-quiz': t.Optional(t.Unknown()),
        'scoreboard-participant': t.Optional(t.Unknown()),
        'after-answer-participant': t.Optional(t.Unknown()),
        presentQuizId: t.Optional(t.String()),
        setUsername: t.Optional(t.String()),
        'start-presenting': t.Optional(t.String()),
        HEADERS: t.Object(
          {
            'HX-Current-URL': t.String(),
          },
          { additionalProperties: true },
        ),
      },
      {
        additionalProperties: true,
      },
    ),

    open: async ws => {
      console.log('open')
    },
    // REMEMBER YOU CAN'T PUBLISH TO YOURSELF
    message: async (ws, message) => {
      const quizCode = getQuizCode(message.HEADERS['HX-Current-URL'])
      if (!quizCode) return

      const user = await anyAuth(ws.data.cookie)
      log.info(
        'ws::message::' + Object.keys(message).filter(key => key !== 'HEADERS'),
      )

      // participant and presenter classes for handling messages
      const participant = new Participant({ ws, msg: message, user, quizCode })

      await participant.handleSetUsernameMessage()
      await participant.reconnectToQuiz()
      await participant.handleAnswer()
      await participant.handleNextQuestion()
      await participant.handleScoreboard()

      if (user.type === 'authenticated' && user.userId) {
        const presenter = new Presenter(ws, message, user, quizCode)
        await presenter.presentQuiz()
        await presenter.startPresentingQuiz()
        await presenter.afterAnswer()
        await presenter.handleNextQuestion()
        await presenter.handleEndQuiz()
      }
    },
  })
