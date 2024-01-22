import { Elysia, t } from 'elysia'
import { getQuestion } from '@/components/presentation/Question.tsx'
import { anyAuth } from '@/modules/app/websocket/auth.tsx'
import { getQuizCode } from '@/modules/app/websocket/generic.tsx'
import { Participant } from '@/modules/app/websocket/participant.tsx'
import { Presenter } from '@/modules/app/websocket/presenter.tsx'
import { activeQuizPageDetails } from '@/repository/activeQuiz.database.ts'
import { fixOneToOne } from '@/repository/databaseArrayFix.ts'

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
      const user = await anyAuth(ws.data.cookie)

      if (!quizCode) return

      console.log(user.type)
      const participant = new Participant(ws, message, user)
      const presenter = new Presenter(ws, message, user)

      await participant.handleSetUsernameMessage()
      await participant.reconnectToQuiz(quizCode)
      await presenter.presentQuiz(quizCode)

      if (message['start-presenting'] == '') {
        console.log('start-presenting')
        if (!quizCode || !user.userId || user.type !== 'authenticated') return
        const dataToSend = await getQuestion(quizCode, 1, user.userId)
        if (dataToSend.error) {
          console.error(dataToSend.error) // TODO: handle error
          return
        }
        ws.send(dataToSend.presenterTemplate)
        ws.publish(quizCode, dataToSend.participantTemplate)
      }

      if (message['next-question'] == '') {
        // send results

        console.log('next-question')
        if (!quizCode || !user.userId || user.type !== 'authenticated') return
        const currentQuestion = await activeQuizPageDetails(quizCode)
        if (!currentQuestion.data) return
        const page = fixOneToOne(currentQuestion.data.current_page_id).page
        const dataToSend = await getQuestion(quizCode, page + 1, user.userId)
        if (dataToSend.error) {
          console.error(dataToSend.error) // TODO: handle error
          return
        }
        ws.send(dataToSend.presenterTemplate)
        ws.publish(quizCode, dataToSend.participantTemplate)
      }

      for (const key of Object.keys(message)) {
        if (key.startsWith('quiz-answer')) {
          ws.send(await participant.validateAnswer(key, quizCode))

          ws.publish(quizCode + '-presenter', 'submitted')
        }
      }
    },
  })
