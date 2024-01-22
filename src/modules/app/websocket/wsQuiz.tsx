import { Elysia, t } from 'elysia'
import { getQuestion } from '@/components/presentation/Question.tsx'
import { anyAuth } from '@/modules/app/websocket/auth.tsx'
import {
  getQuizCode,
  reconnectToQuiz,
} from '@/modules/app/websocket/generic.tsx'
import {
  handleSetUsernameMessage,
  validateAnswer,
} from '@/modules/app/websocket/participant.tsx'
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
      const activeQuizId = getQuizCode(message.HEADERS['HX-Current-URL'])
      const user = await anyAuth(ws.data.cookie)

      if (!activeQuizId) return

      console.log(user.type)

      await handleSetUsernameMessage(ws, user, message)
      await reconnectToQuiz(ws, message, user, activeQuizId)
      if (message['presentQuizId']) {
        if (!user.userId || user.type !== 'authenticated') return
        // todo: check ownership
        ws.isSubscribed(activeQuizId) || ws.subscribe(activeQuizId)
        ws.isSubscribed(activeQuizId + '-presenter') ||
          ws.subscribe(activeQuizId + '-presenter')

        // check if quiz is being presented
        const { data: activeQuiz, error } =
          await activeQuizPageDetails(activeQuizId)
        if (activeQuiz?.current_page_id) {
          const page = fixOneToOne(activeQuiz.current_page_id).page
          const dataToSend = await getQuestion(activeQuizId, page, user.userId)
          if (dataToSend.error) {
            console.error(dataToSend.error) // TODO: handle error
            return
          }
          ws.send(dataToSend.presenterTemplate)
        }
      }

      if (message['start-presenting'] == '') {
        console.log('start-presenting')
        if (!activeQuizId || !user.userId || user.type !== 'authenticated')
          return
        const dataToSend = await getQuestion(activeQuizId, 1, user.userId)
        if (dataToSend.error) {
          console.error(dataToSend.error) // TODO: handle error
          return
        }
        ws.send(dataToSend.presenterTemplate)
        ws.publish(activeQuizId, dataToSend.participantTemplate)
      }

      if (message['next-question'] == '') {
        // send results

        console.log('next-question')
        if (!activeQuizId || !user.userId || user.type !== 'authenticated')
          return
        const currentQuestion = await activeQuizPageDetails(activeQuizId)
        if (!currentQuestion.data) return
        const page = fixOneToOne(currentQuestion.data.current_page_id).page
        const dataToSend = await getQuestion(
          activeQuizId,
          page + 1,
          user.userId,
        )
        if (dataToSend.error) {
          console.error(dataToSend.error) // TODO: handle error
          return
        }
        ws.send(dataToSend.presenterTemplate)
        ws.publish(activeQuizId, dataToSend.participantTemplate)
      }

      for (const key of Object.keys(message)) {
        if (key.startsWith('quiz-answer')) {
          ws.send(await validateAnswer(key, activeQuizId, user))

          ws.publish(activeQuizId + '-presenter', 'submitted')
        }
      }
    },
  })
