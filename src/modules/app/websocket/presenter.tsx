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
  async isPresenter() {
    return this.user.type === 'authenticated'
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
}
