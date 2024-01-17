import { Answer } from '@/components/quiz/CreateQuiz.tsx'
import { ViewMedia } from '@/components/quiz/ViewMedia.tsx'
import { supabase } from '@/libs'

export interface QuestionProps {
  mediaURL: string
  answers: string[]
  question: string
  quizName?: string
  code?: string
}

export const Question = async (props: QuestionProps) => {
  // const { quizId, pageNumber } = props

  return (
    <>
      <div id="lobby" hx-swap-oob="true"></div>
      <div id="game">
        <div class="flex  navbar bg-base-300/60 relative">
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
        </div>
        <div class="container mt-4">
          <ViewMedia
            allowDelete={false}
            mediaURL={props.mediaURL}
            modalId="present_page_modal"
          />
          <ul class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:grid-rows-3 mt-4 ">
            {props.answers.map((question, index) => (
              <Answer index={index} value={question} type="present" />
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}

export const getQuestion = async (
  quizId: string,
  pageNumber: number,
  userId: string,
): Promise<JSX.Element> => {
  const { data: activeQuiz, error } = await supabase
    .from('active_quiz')
    .select(
      `
      id,
      current_page_id,
      quiz_id (
        id,
        description,
        name
      ).single()
    `,
    )
    .eq('id', quizId)
    .single()

  if (error || !activeQuiz) {
    console.error(error)
    return <div>error</div>
  }

  supabase
    .from('quiz_question')
    .update({ current_page_id: pageNumber })
    .eq('id', quizId)
    .eq('user_id', userId)

  // @ts-ignore
  const quiz = activeQuiz['quiz_id']
  console.log({ quiz })

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
    return <div>error</div>
  }

  return (
    <Question
      mediaURL={question.media_url}
      answers={question.answers}
      question={question.question}
      code={quizId}
      quizName={quiz.name}
    />
  )
}
