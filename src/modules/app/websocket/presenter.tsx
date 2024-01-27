import { ElysiaWS } from 'elysia/ws'
import { Question } from '@/components/presentation/Question.tsx'
import { QuizAfterAnswer } from '@/components/presentation/QuizAfterAnswer.tsx'
import {
  Username,
  UsernameContainer,
} from '@/components/presentation/Username.tsx'
import { Scoreboard } from '@/components/scoreboard/Scoreboard.tsx'
import { supabase } from '@/libs'
import { cache } from '@/libs/cache.ts'
import {
  anyAuthResult,
  AuthenticatedAuthResult,
} from '@/modules/app/websocket/auth.tsx'
import {
  activeQuizPageDetails,
  activeQuizPageDetailsWithNextPage,
  changeActiveQuizPage,
  endActiveQuiz,
  getPageWithQuiz,
  getSingleActiveQuizWithPageAndQuiz,
} from '@/repository/activeQuiz.database.ts'
import { fixOneToOne } from '@/repository/databaseArrayFix.ts'
import { ScoreboardRepository } from '@/repository/scoreboard.repository.ts'

export class Presenter {
  ws: ElysiaWS<any>
  msg: any
  user: AuthenticatedAuthResult
  quizCode: string
  private scoreboardRepository: ScoreboardRepository

  constructor(ws: any, msg: any, user: anyAuthResult, quizCode: string) {
    this.ws = ws
    this.msg = msg
    this.quizCode = quizCode
    if (user.type !== 'authenticated')
      throw new Error('user is not authenticated')
    if (!user.userId) throw new Error('user is not authenticated')
    this.user = {
      userId: user.userId,
      type: 'authenticated',
    }
    this.scoreboardRepository = new ScoreboardRepository(quizCode)
  }

  async presentQuiz() {
    if (!this.msg['presentQuizId']) return
    this.ws.isSubscribed(this.quizCode) || this.ws.subscribe(this.quizCode)
    this.ws.isSubscribed(this.quizCode + '-presenter') ||
      this.ws.subscribe(this.quizCode + '-presenter')
    const { data: activeQuiz, error } = await activeQuizPageDetails(
      this.quizCode,
    )
    if (activeQuiz?.current_page_id) {
      const page = fixOneToOne(activeQuiz.current_page_id).page
      const dataToSend = await this.getQuestion(page)
      if (dataToSend.error) {
        console.error(dataToSend.error) // TODO: handle error
        return
      }
      this.ws.send(dataToSend.presenterTemplate)
    } else {
      await this.reloadStartPresentingPage()
    }
  }
  async startPresentingQuiz() {
    if (this.msg['start-presenting'] == '') {
      const dataToSend = await this.getQuestion(1)
      if (dataToSend.error) {
        console.error(dataToSend.error) // TODO: handle error
        return
      }
      this.ws.send(dataToSend.presenterTemplate)
      this.ws.publish(this.quizCode, dataToSend.participantTemplate)
    }
  }

  private async reloadStartPresentingPage() {
    const participatingUsers = await supabase
      .from('user_detail')
      .select('username, participating_quiz_list')
      .contains('participating_quiz_list', [this.quizCode])
    this.ws.send(
      <>
        <UsernameContainer id="connected-users" hx-swap-oob="beforeend">
          {participatingUsers.data?.map((user: any) => (
            <Username username={user.username} />
          ))}
        </UsernameContainer>
      </>,
    )
  }

  async handleNextQuestion() {
    if (
      !(this.msg['next-question'] == '' || this.msg['next-question'] == 'true')
    )
      return
    const currentQuestion = await activeQuizPageDetails(this.quizCode)
    if (!currentQuestion.data) return
    const page = fixOneToOne(currentQuestion.data.current_page_id).page
    const dataToSend = await this.getQuestion(page + 1)
    if (dataToSend.error) {
      console.error(dataToSend.error, 'presenter.handleNextQuestion') // TODO: handle error
      return
    }
    this.ws.send(dataToSend.presenterTemplate)
    this.ws.publish(this.quizCode, dataToSend.participantTemplate)
  }

  async handleEndQuiz() {
    if (!(this.msg['end-quiz'] == '' || this.msg['end-quiz'] == 'true')) return
    const currentQuestion = await activeQuizPageDetails(this.quizCode)
    if (!currentQuestion.data) return
    const page = fixOneToOne(currentQuestion.data.current_page_id).page
    await endActiveQuiz(this.quizCode)

    this.ws.send(
      <>
        <div id="game">
          <span class="loading loading-dots loading-lg" id="loader"></span>
          <div id="scoreboard"></div>
        </div>
      </>,
    )

    this.scoreboardRepository.calculateScores().then(() => {
      this.scoreboardRepository.getTopScores(10).then(scores => {
        this.ws.send(
          <>
            <div id="quiz-control">
              <a
                class="btn btn-primary"
                id="start-presenting"
                hx-get="/quiz/my"
                hx-target="main"
                href="/quiz/my"
              >
                Exit
              </a>
            </div>
            <div id="loader"></div>
            <Scoreboard data={scores!} />
          </>,
        )
        this.ws.publish(
          this.quizCode,
          <>
            <div id="game">
              <input
                type="hidden"
                name="scoreboard-participant"
                value={'true'}
                ws-send
                hx-trigger="load"
              />
            </div>
          </>,
        )
      })
    })
  }

  async afterAnswer() {
    if (!this.msg['after-answer']) return

    const lock = cache.get(this.quizCode + this.msg['after-answer'])
    if (lock) {
      console.log('presenter.afterAnswer lock')
      return
    }

    cache.set(this.quizCode + this.msg['after-answer'], '1', 20)

    // send if answer is correct to all participants

    // send overview to presenter
    const currentQuestion = await activeQuizPageDetailsWithNextPage(
      this.quizCode,
    )
    if (!currentQuestion.data) return
    const page = fixOneToOne(currentQuestion.data.current_page_id)
    if (page.page != this.msg['after-answer']) return
    this.ws.publish(
      this.quizCode,
      <>
        <div id="game">
          <input
            type="hidden"
            name="after-answer-participant"
            value={page.id}
            ws-send
            hx-trigger="load"
          />
        </div>
      </>,
    )
    const answers = page.answers.map((answer: string, index: number) => ({
      answer: answer,
      isCorrect: page.correct_answers.includes(index),
      count: 0,
    }))
    const quiz = fixOneToOne(currentQuestion.data.quiz_id)
    const pageNumber = page.page
    const hasNextPage =
      quiz.page.filter(page => page.page > pageNumber).length > 0

    this.ws.send(
      <QuizAfterAnswer answers={answers} hasNextPage={hasNextPage} />,
    )
  }

  private async getQuestion(pageNumber: number): Promise<getQuestionReturn> {
    const { data: activeQuiz, error } =
      await getSingleActiveQuizWithPageAndQuiz(this.quizCode)

    if (error || !activeQuiz) {
      console.error(error, "presenter.getQuestion can't get active quiz")
      return {
        error: error?.message,
        participantTemplate: <></>,
        presenterTemplate: <></>,
      }
    }

    const quiz = fixOneToOne(activeQuiz['quiz_id'])

    const page = quiz.page.filter(page => page.page === pageNumber).pop()

    const result = await changeActiveQuizPage(this.quizCode, page?.id)

    const { data: question, error: questionError } = await getPageWithQuiz(
      quiz.id,
      pageNumber,
      this.user.userId!,
    )

    const hasNextPage =
      quiz.page.filter(page => page.page > pageNumber).length > 0

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
        code={this.quizCode}
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
        code={this.quizCode}
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
