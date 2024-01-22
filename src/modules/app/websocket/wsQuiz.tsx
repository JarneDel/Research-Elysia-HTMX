import { Elysia, t } from 'elysia'
import { anyAuth } from '@/modules/app/websocket/auth.tsx'
import { getQuizCode } from '@/modules/app/websocket/generic.tsx'
import { Participant } from '@/modules/app/websocket/participant.tsx'
import { Presenter } from '@/modules/app/websocket/presenter.tsx'

export const wsQuiz = (app: Elysia) =>
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
        'end-quiz': t.Optional(t.Unknown()),
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

      console.log(
        Object.keys(message).filter(key => key !== 'HEADERS'),
        '/ws.messageKeys',
      )

      // participant and presenter classes for handling messages
      const participant = new Participant({ ws, msg: message, user, quizCode })

      await participant.handleSetUsernameMessage()
      await participant.reconnectToQuiz()
      await participant.handleAnswer()

      if (user.type === 'authenticated' && user.userId) {
        const presenter = new Presenter(ws, message, user)
        await presenter.presentQuiz(quizCode)
        await presenter.startPresentingQuiz(quizCode)
        await presenter.handleNextQuestion(quizCode)
        await presenter.handleEndQuiz(quizCode)
      }
    },
  })
