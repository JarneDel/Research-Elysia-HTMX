import { Question } from '@/components/presentation/Question.tsx'
import { QuestionReconnect } from '@/components/presentation/QuestionReconnect.tsx'
import {
  Username,
  UsernameContainer,
} from '@/components/presentation/Username.tsx'
import { WaitingForOthers } from '@/components/presentation/WaitingForOthers.tsx'
import { LoadingDot } from '@/components/states/loadingIndicator.tsx'
import { supabase } from '@/libs'
import { anyAuthResult } from '@/modules/app/websocket/auth.tsx'
import { getQuizCode } from '@/modules/app/websocket/generic.tsx'
import { activeQuizAllFields } from '@/repository/activeQuiz.database.ts'
import { getAnswersForUser, setAnswer } from '@/repository/answers.database.ts'
import { fixOneToOne } from '@/repository/databaseArrayFix.ts'

/**
 * Set the username for the user
 * 1. Check if the user exists
 * 2. upsert the user with the username
 * @param user AuthResult
 * @param username
 * @returns id, username
 */
export const handleSetUsername = async (
  user: anyAuthResult,
  username: string,
) => {
  if (user.type === 'unauthorized') {
    return
  }

  console.log(user.type, user.userId)

  // check if user exists
  const { data: userData, error } = await supabase
    .from('user_detail')
    .select('id, username')
    .eq(user.type === 'authenticated' ? 'user_id' : 'anon_user_id', user.userId)
    .single()

  if (error && error.code !== 'PGRST116') console.info(error, 'not user detail')

  const { data: usernameData, error: usernameError } = await supabase
    .from('user_detail')
    .upsert({
      id: userData?.id,
      username,
      anon_user_id: user.type === 'anonymous' ? user.userId : null,
      user_id: user.type === 'authenticated' ? user.userId : null,
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
 * @param ws
 * @param user
 * @param message
 */
export const handleSetUsernameMessage = async (
  ws: any,
  user: anyAuthResult,
  message: any,
) => {
  if (message['setUsername']) {
    console.log(message)
    const result = await handleSetUsername(user, message['setUsername'])
    const quizCode = getQuizCode(message.HEADERS['HX-Current-URL'])
    if (!quizCode) return
    ws.subscribe(quizCode)

    ws.publish(
      quizCode + '-presenter',
      <>
        <UsernameContainer id="connected-users" hx-swap-oob="beforeend">
          <Username username={result?.username} />
        </UsernameContainer>
      </>,
    )
    ws.send(
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
 * Validate if the answer is correct
 * @param key
 * @param quizId
 * @param auth
 */
export const validateAnswer = async (
  key: string,
  quizId: string,
  auth: anyAuthResult,
) => {
  if (!auth.userId || auth.type === 'unauthorized') return
  const answerIndex = key.split('-').pop()
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

  const isCorrect = currentPage.correct_answers.includes(answerIndex)
  const result = await setAnswer({
    activeQuizId: quizId,
    isCorrect,
    userId: auth.userId,
    userType: auth.type,
    answer: answerIndex,
    pageId: currentPage.id,
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
const reconnectToQuiz = async (
  ws: any,
  message: any,
  user: anyAuthResult,
  activeQuizId: string,
) => {
  if (message.connect) {
    // reconnect to quiz
    if (!user.userId || user.type == 'unauthorized') return
    console.log('reconnecting to quiz')
    // check if answered already

    const page = await activeQuizAllFields(activeQuizId)
    if (page.error?.code === 'PGRST116') {
      console.log('quiz not in progress')
      return
    }

    if (!page.data) {
      console.error(page.error)
      return
    }
    const question = fixOneToOne(page.data.current_page_id)
    const quiz = fixOneToOne(page.data.quiz_id)
    console.log(page.data, 'question')

    const answer = await getAnswersForUser(
      activeQuizId,
      question.id,
      user.userId,
      user.type,
    )
    if (answer.data && answer.data?.length > 0) {
      console.log('already answered')
      ws.send(
        <>
          <div id="lobby"></div>
          <QuestionReconnect question={question.question}>
            <WaitingForOthers />
          </QuestionReconnect>
        </>,
      )
      return
    }
    console.log(answer, 'answers found')

    ws.send(
      <Question
        mediaURL={question.media_url}
        answers={question.answers}
        question={question.question}
        code={activeQuizId}
        quizName={quiz.name}
        mode="participant"
      />,
    )
  }
}

export const participant = () => ({
  reconnectToQuiz,
  handleSetUsernameMessage,
  handleSetUsername,
  validateAnswer,
})