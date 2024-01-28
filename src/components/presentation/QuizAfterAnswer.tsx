import { AnswerIcon } from '@/components/quiz/CreateQuiz.tsx'

export interface QuizAfterAnswerProps {
  answers: {
    answer: string | number
    isCorrect: boolean
    count: number
  }[]
  hasNextPage?: boolean
}

export function QuizAfterAnswer(props: QuizAfterAnswerProps) {
  return (
    <>
      <div id="quiz-control" class="flex flex-row ">
        {props.hasNextPage && (
          <form ws-send hx-trigger="submit">
            <button class="btn btn-primary" name="next-question">
              Next question
            </button>
          </form>
        )}
        {!props.hasNextPage && (
          <>
            <form ws-send hx-trigger="submit">
              <button class="btn btn-primary" name="end-quiz">
                Finish
              </button>
            </form>
          </>
        )}
      </div>
      <div id="quiz-progress-bar"></div>
      <ul
        id="answers-container"
        class="grid grid-cols-1 md:grid-cols-2 gap-4 md:grid-rows-3 mt-4 replace-transition "
      >
        {props.answers.map((answer, index) => (
          <li
            class={
              'flex w-full p-2 rounded-box gap-4 relative items-center animate-pop transition-colors duration-1000' +
              (answer.isCorrect
                ? ' bg-success/70 text-success-content'
                : ' bg-error/70 text-error-content')
            }
          >
            <AnswerIcon id={index} size={96} />
            <div safe class="lg:text-3xl md:text-2xl text-xl font-medium ">
              {answer.answer}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
