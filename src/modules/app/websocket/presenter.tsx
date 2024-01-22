import { getQuestion } from '@/components/presentation/Question.tsx'
import { anyAuthResult } from '@/modules/app/websocket/auth.tsx'
import { activeQuizPageDetails } from '@/repository/activeQuiz.database.ts'
import { fixOneToOne } from '@/repository/databaseArrayFix.ts'

export class Presenter {
  ws: any
  msg: any
  user: anyAuthResult
  constructor(ws: any, msg: any, user: anyAuthResult) {
    this.ws = ws
    this.msg = msg
    this.user = user
  }

  isAuthenticatedAndValid(quizCode: string): boolean {
    return Boolean(
      quizCode && this.user.userId && this.user.type === 'authenticated',
    )
  }

  async presentQuiz(quizCode: string) {
    if (this.msg['presentQuizId']) {
      if (!this.user.userId || this.user.type !== 'authenticated') return
      // todo: check ownership
      this.ws.isSubscribed(quizCode) || this.ws.subscribe(quizCode)
      this.ws.isSubscribed(quizCode + '-presenter') ||
        this.ws.subscribe(quizCode + '-presenter')

      // check if quiz is being presented
      const { data: activeQuiz, error } = await activeQuizPageDetails(quizCode)
      if (activeQuiz?.current_page_id) {
        const page = fixOneToOne(activeQuiz.current_page_id).page
        const dataToSend = await getQuestion(quizCode, page, this.user.userId)
        if (dataToSend.error) {
          console.error(dataToSend.error) // TODO: handle error
          return
        }
        this.ws.send(dataToSend.presenterTemplate)
      }
    }
  }
  async startPresentingQuiz(quizCode: string) {
    if (this.msg['start-presenting'] == '') {
      if (!this.isAuthenticatedAndValid(quizCode) || !this.user.userId) return
      const dataToSend = await getQuestion(quizCode, 1, this.user.userId)
      if (dataToSend.error) {
        console.error(dataToSend.error) // TODO: handle error
        return
      }
      this.ws.send(dataToSend.presenterTemplate)
      this.ws.publish(quizCode, dataToSend.participantTemplate)
    }
  }
  async handleNextQuestion(quizCode: string) {
    if (this.msg['next-question'] == '') {
      if (!quizCode || !this.user.userId || this.user.type !== 'authenticated')
        return
      const currentQuestion = await activeQuizPageDetails(quizCode)
      if (!currentQuestion.data) return
      const page = fixOneToOne(currentQuestion.data.current_page_id).page
      const dataToSend = await getQuestion(quizCode, page + 1, this.user.userId)
      if (dataToSend.error) {
        console.error(dataToSend.error, 'presenter.handleNextQuestion') // TODO: handle error
        return
      }
      this.ws.send(dataToSend.presenterTemplate)
      this.ws.publish(quizCode, dataToSend.participantTemplate)
    }
  }
}
