import { Answer, AnswerParticipant } from '@/components/quiz/CreateQuiz.tsx'
import { ViewMedia } from '@/components/quiz/ViewMedia.tsx'
import { supabase } from '@/libs'
import {
  getSingleActiveQuizWithPageAndQuiz,
  startActiveQuiz,
} from '@/repository/activeQuiz.database.ts'

export interface QuestionProps {
  mediaURL: string
  answers: string[]
  question: string
  quizName?: string
  code?: string
  mode: 'present' | 'participant'
  pageNumber?: number
}

export const Question = (props: QuestionProps) => {
  // const { quizId, pageNumber } = props

  return (
    <>
      <div id="lobby" hx-swap-oob="true"></div>
      <div id="game">
        <div class="flex  navbar bg-base-300/60 relative">
          {props.mode === 'participant' && (
            <>
              <div class="text-2xl flex-1 flex">
                <span class="mx-auto">{props.question}</span>
              </div>
            </>
          )}

          {props.mode === 'present' && (
            <>
              <div class="navbar-start font-bold px-4">
                <span>{props.quizName}</span>
                <span class="px-4 font-mono font-medium">{props.code}</span>
              </div>
              <div class="text-2xl navbar-center">{props.question}</div>
              <div class="navbar-end ">
                <div class="flex flex-row items-center">
                  <span id="submissions-count"></span>
                  <span>submissions</span>
                  <form ws-send>
                    <button class="btn btn-primary">Next</button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
        <div class="container mt-4">
          <ViewMedia
            allowDelete={false}
            mediaURL={props.mediaURL}
            modalId="present_page_modal"
          />
          <ul class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:grid-rows-3 mt-4 ">
            {props.answers.map((question, index) => {
              if (props.mode === 'present')
                return <Answer index={index} value={question} />
              else
                return (
                  <form ws-send>
                    {/*<input type="hidden" name="quizId" value={props.code} />*/}
                    {/*<input*/}
                    {/*  type="hidden"*/}
                    {/*  name="questionId"*/}
                    {/*  value={props.pageNumber?.toString()}*/}
                    {/*/>*/}
                    <AnswerParticipant
                      index={index}
                      value={question}
                      namePrefix="quiz-answer"
                    />
                  </form>
                )
            })}
          </ul>
        </div>
      </div>
    </>
  )
}

interface getQuestionReturn {
  presenterTemplate: JSX.Element
  participantTemplate: JSX.Element
  error?: string
}

export const getQuestion = async (
  quizId: string,
  pageNumber: number,
  userId: string,
): Promise<getQuestionReturn> => {
  const { data: activeQuiz, error } =
    await getSingleActiveQuizWithPageAndQuiz(quizId)
  console.log({ activeQuiz, error })

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

  const result = await startActiveQuiz(quizId, page?.id)
  console.log({ result })

  const { data: question, error: questionError } = await supabase
    .from('page')
    .select(
      `
      id,
      question, 
      answers,
      correct_answers,
      page,
      media_url,
      quiz(
        id,
        created_by
      )
      
    `,
    )
    .eq('quiz.created_by', userId)
    .eq('page', pageNumber)
    .eq('quiz', quiz.id)
    .single()

  console.log(question, 'question', questionError)
  if (questionError || !question) {
    console.error(questionError)
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
      code={quizId}
      quizName={quiz.name}
      mode="present"
    />
  )
  const participantTemplate = (
    <Question
      mediaURL={question.media_url}
      answers={question.answers}
      question={question.question}
      code={quizId}
      quizName={quiz.name}
      mode="participant"
    />
  )

  return {
    presenterTemplate,
    participantTemplate,
  }
}
