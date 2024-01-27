import { ElysiaWS } from 'elysia/ws'
import {
  FirstPlace,
  SecondPlace,
  ThirdPlace,
} from '@/components/icons/placement.tsx'
import { Question } from '@/components/presentation/Question.tsx'
import { QuestionReconnect } from '@/components/presentation/QuestionReconnect.tsx'
import {
  Username,
  UsernameContainer,
} from '@/components/presentation/Username.tsx'
import { WaitingForOthers } from '@/components/presentation/WaitingForOthers.tsx'
import { CorrectAnswer } from '@/components/states/correctAnswer.tsx'
import { LoadingDot } from '@/components/states/loadingIndicator.tsx'
import { NoAnswer } from '@/components/states/noAnswer.tsx'
import { WrongAnswer } from '@/components/states/wrongAnswer.tsx'
import { supabase } from '@/libs'
import { cache } from '@/libs/cache'
import { calculateScore } from '@/libs/score.ts'
import {
  anyAuthResult,
  SuccessfulAuthResult,
} from '@/modules/app/websocket/auth.tsx'
import {
  activeQuizAllFields,
  getActiveQuizMinimal,
} from '@/repository/activeQuiz.database.ts'
import { getAnswersForUser, setAnswer } from '@/repository/answers.database.ts'
import { fixOneToOne } from '@/repository/databaseArrayFix.ts'

interface ParticipantProps {
  ws: any
  msg: any
  user: anyAuthResult
  quizCode: string
}

export class Participant {
  ws: ElysiaWS<any>
  msg: any
  user: SuccessfulAuthResult
  quizCode: string

  constructor(participantProps: ParticipantProps) {
    const { ws, msg, user, quizCode } = participantProps
    this.ws = ws
    this.msg = msg
    if (user.type === 'unauthorized')
      throw new Error('user is not authenticated')
    if (!user.userId) throw new Error('user is not authenticated')
    this.quizCode = quizCode

    this.user = {
      userId: user.userId,
      type: user.type,
    }
  }

  /**
   * Set the username for the user
   * 1. Check if the user exists
   * 2. upsert the user with the username
   * @returns id, username
   */
  private async handleSetUsername(username: string) {
    // check if user exists
    const { data: userData, error } = await supabase
      .from('user_detail')
      .select('id, username, participating_quiz_list')
      .eq(
        this.user.type === 'authenticated' ? 'user_id' : 'anon_user_id',
        this.user.userId,
      )
      .single()

    if (error && error.code !== 'PGRST116')
      console.info(error, 'not user detail')

    const quizSet = new Set(userData?.participating_quiz_list || [])
    quizSet.add(this.quizCode)

    const { data: usernameData, error: usernameError } = await supabase
      .from('user_detail')
      .upsert({
        id: userData?.id,
        username,
        anon_user_id: this.user.type === 'anonymous' ? this.user.userId : null,
        user_id: this.user.type === 'authenticated' ? this.user.userId : null,
        participating_quiz_list: Array.from(quizSet),
      })
      .select('id, username')
      .single()

    if (usernameError) {
      console.error(usernameError)
      return
    }
    return usernameData
  }
  /**
   * 1. set username
   * 2. subscribe to quiz
   * 3. publish username to presenter
   */
  async handleSetUsernameMessage() {
    const message = this.msg
    if (message['setUsername']) {
      const result = await this.handleSetUsername(message['setUsername'])
      this.ws.subscribe(this.quizCode)

      this.ws.publish(
        this.quizCode + '-presenter',
        <>
          <UsernameContainer id="connected-users" hx-swap-oob="beforeend">
            <Username username={result?.username} />
          </UsernameContainer>
        </>,
      )
      this.ws.send(
        <>
          <div
            id="username"
            class="flex flex-col justify-center items-center double-header-height"
          >
            <LoadingDot />
            <div class="text-center">Waiting for the quiz to start...</div>
          </div>
        </>,
      )
    }
  }

  /**
   * 1. check if user is logged in
   * 2. get active quiz with correct answers of current page
   * 3. check if answer is correct
   * 4. set answer to database
   * @param answerIndexString
   * @param quizId
   */
  private async validateAnswer(answerIndexString: string, quizId: string) {
    const requestTime = new Date().getTime()

    const answerIndex = answerIndexString.split('-').pop()
    if (!answerIndex) return
    const { data: questionData, error } = await supabase
      .from('active_quiz')
      .select(
        `id, current_page_id(
      id, correct_answers
    )`,
      )
      .eq('id', quizId)
      .single()

    if (!questionData || !questionData.current_page_id) return
    const currentPage = fixOneToOne(questionData?.current_page_id)

    const isCorrect = currentPage.correct_answers.includes(Number(answerIndex))
    console.log(
      isCorrect,
      'participant.validateAnswer.isCorrect',
      answerIndex,
      currentPage.correct_answers,
    )

    const startTime = Number(cache.get(this.quizCode + 'qs' + currentPage.id))

    const score = calculateScore(startTime, requestTime, 20)

    const result = await setAnswer({
      activeQuizId: quizId,
      isCorrect,
      userId: this.user.userId,
      userType: this.user.type,
      answer: answerIndex,
      pageId: currentPage.id,
      score: isCorrect ? score : 0,
    })

    return <WaitingForOthers />
  }

  /**
   * Reconnect to the quiz if the user has already answered
   * 1. get active quiz
   * 2. check if quiz is active // todo: check if username is set for quiz (maybe participating column)
   * 3. check if user has answered -> if yes, show waiting for others
   * 4. if not, show question
   * 5. TODO: if quiz has ended, show quiz ended
   */
  async reconnectToQuiz() {
    const message = this.msg
    if (message.connect) {
      // reconnect to quiz
      console.log('reconnecting to quiz')
      this.ws.isSubscribed(this.quizCode) || this.ws.subscribe(this.quizCode) // subscribe to quiz if not already subscribed

      // check if answered already

      // check account
      const { data: userData, error } = await supabase
        .from('user_detail')
        .select('id, username, participating_quiz_list')
        .eq(
          this.user.type === 'authenticated' ? 'user_id' : 'anon_user_id',
          this.user.userId,
        )
        .single()

      if (!userData?.participating_quiz_list?.includes(this.quizCode)) {
        return
      }

      const page = await activeQuizAllFields(this.quizCode)
      if (page.error?.code === 'PGRST116') {
        // return waiting for others to join quiz screen

        this.ws.send(
          <>
            <div
              id="username"
              class="flex flex-col justify-center items-center double-header-height"
            >
              <LoadingDot />
              <div class="text-center">Waiting for the quiz to start...</div>
            </div>
          </>,
        )
        return
      }

      if (!page.data) {
        console.error(page.error)
        return
      }
      const question = fixOneToOne(page.data.current_page_id)
      const quiz = fixOneToOne(page.data.quiz_id)

      const answer = await getAnswersForUser(
        this.quizCode,
        question.id,
        this.user.userId,
        this.user.type,
      )
      if (answer.data && answer.data?.length > 0) {
        this.ws.send(
          <>
            <div id="lobby"></div>
            <QuestionReconnect question={question.question}>
              <WaitingForOthers />
            </QuestionReconnect>
          </>,
        )
        return
      }

      this.ws.send(
        <Question
          mediaURL={question.media_url}
          answers={question.answers}
          question={question.question}
          code={this.quizCode}
          quizName={quiz.name}
          mode="participant"
          pageNumber={question.page}
        />,
      )
    }
  }

  async handleScoreboard() {
    if (this.msg['scoreboard-participant']) {
      const score = await supabase
        .from('score')
        .select()
        .eq('quiz_code', this.quizCode)
        .order('score', { ascending: false })

      score.data?.forEach((row, index) => {
        if (
          row.anon_user === this.user.userId ||
          row.user === this.user.userId
        ) {
          this.ws.send(
            <>
              <div
                class="flex flex-col justify-center items-center full-height"
                id="game"
              >
                {index === 0 && <FirstPlace />}
                {index === 1 && <SecondPlace />}
                {index === 2 && <ThirdPlace />}
                {index > 2 && (
                  <div class="text-center">Your rank is {index + 1}</div>
                )}
              </div>
            </>,
          )
        }
      })
    }
  }

  async handleAnswer() {
    for (const key of Object.keys(this.msg)) {
      if (key.startsWith('quiz-answer')) {
        this.ws.send(await this.validateAnswer(key, this.quizCode))

        this.ws.publish(this.quizCode + '-presenter', 'submitted')
      }
    }
  }

  async handleNextQuestion() {
    const afterAnswer = this.msg['after-answer-participant']
    if (!afterAnswer) return

    const lock = await cache.get(this.quizCode + afterAnswer + this.user.userId)
    if (lock) {
      return
    }
    cache.set(this.quizCode + afterAnswer + this.user.userId, '1', 20)

    const activeQuizMinimal = await getActiveQuizMinimal(this.quizCode)
    if (!activeQuizMinimal.data) return

    if (activeQuizMinimal.data.current_page_id != afterAnswer) return

    // check if answer is correct
    const userAnswers = await getAnswersForUser(
      this.quizCode,
      activeQuizMinimal.data.current_page_id,
      this.user.userId,
      this.user.type,
    )
    if (!userAnswers.data) return
    const firstAnswer = userAnswers.data[0]
    if (!firstAnswer) {
      this.ws.send(<NoAnswer />)
      await this.validateAnswer('-1', this.quizCode)
      return
    }
    switch (firstAnswer.is_correct) {
      case true:
        this.ws.send(<CorrectAnswer />)
        break
      case false:
        this.ws.send(<WrongAnswer />)
        break
    }
  }
}
