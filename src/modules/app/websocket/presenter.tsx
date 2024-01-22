import { Question } from '@/components/presentation/Question.tsx'
import {
  anyAuthResult,
  AuthenticatedAuthResult,
} from '@/modules/app/websocket/auth.tsx'
import {
  activeQuizPageDetails,
  changeActiveQuizPage,
  getPageWithQuiz,
  getSingleActiveQuizWithPageAndQuiz,
} from '@/repository/activeQuiz.database.ts'
import { fixOneToOne } from '@/repository/databaseArrayFix.ts'

export class Presenter {
  ws: any
  msg: any
  user: AuthenticatedAuthResult
  constructor(ws: any, msg: any, user: anyAuthResult) {
    this.ws = ws
    this.msg = msg
    if (user.type !== 'authenticated')
      throw new Error('user is not authenticated')
    if (!user.userId) throw new Error('user is not authenticated')
    this.user = {
      userId: user.userId,
      type: 'authenticated',
    }
  }

  async presentQuiz(quizCode: string) {
    if (this.msg['presentQuizId']) {
      this.ws.isSubscribed(quizCode) || this.ws.subscribe(quizCode)
      this.ws.isSubscribed(quizCode + '-presenter') ||
        this.ws.subscribe(quizCode + '-presenter')

      // check if quiz is being presented
      const { data: activeQuiz, error } = await activeQuizPageDetails(quizCode)
      if (activeQuiz?.current_page_id) {
        const page = fixOneToOne(activeQuiz.current_page_id).page
        const dataToSend = await this.getQuestion(quizCode, page)
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
      const dataToSend = await this.getQuestion(quizCode, 1)
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
      const currentQuestion = await activeQuizPageDetails(quizCode)
      if (!currentQuestion.data) return
      const page = fixOneToOne(currentQuestion.data.current_page_id).page
      const dataToSend = await this.getQuestion(quizCode, page + 1)
      if (dataToSend.error) {
        console.error(dataToSend.error, 'presenter.handleNextQuestion') // TODO: handle error
        return
      }
      this.ws.send(dataToSend.presenterTemplate)
      this.ws.publish(quizCode, dataToSend.participantTemplate)
    }
  }

  private async getQuestion(
    quizCode: string,
    pageNumber: number,
  ): Promise<getQuestionReturn> {
    const { data: activeQuiz, error } =
      await getSingleActiveQuizWithPageAndQuiz(quizCode)

    if (error || !activeQuiz) {
      console.error(error)
      return {
        error: error?.message,
        participantTemplate: <></>,
        presenterTemplate: <></>,
      }
    }

    // @ts-expect-error postgress returns a single object but typescript thinks it's an array
    const quiz = activeQuiz['quiz_id'] as {
      id: any
      description: any
      name: any
      page: { id: any; page: any }[]
    }

    const page = quiz.page.filter(page => page.page === pageNumber).pop()
    console.log({ page })

    const result = await changeActiveQuizPage(quizCode, page?.id)
    console.log({ result })

    const { data: question, error: questionError } = await getPageWithQuiz(
      quiz.id,
      pageNumber,
      this.user.userId!,
    )

    const hasNextPage =
      quiz.page.filter(page => page.page > pageNumber).length > 0

    console.log(hasNextPage)

    if (questionError || !question) {
      return {
        error: questionError?.message,
        participantTemplate: <></>,
        presenterTemplate: <></>,
      }
    }
    const presenterTemplate = (
      <Question
        mediaURL={question.media_url}
        answers={question.answers}
        question={question.question}
        code={quizCode}
        quizName={quiz.name}
        mode="present"
        hasNextPage={hasNextPage}
        pageNumber={question.page}
      />
    )
    const participantTemplate = (
      <Question
        mediaURL={question.media_url}
        answers={question.answers}
        question={question.question}
        pageNumber={question.page}
        code={quizCode}
        quizName={quiz.name}
        mode="participant"
      />
    )

    return {
      presenterTemplate,
      participantTemplate,
    }
  }
}

interface getQuestionReturn {
  presenterTemplate: JSX.Element
  participantTemplate: JSX.Element
  error?: string
}
