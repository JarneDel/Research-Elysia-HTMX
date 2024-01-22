import { AnswerIcon } from '@/components/quiz/CreateQuiz.tsx'

export interface QuizAfterAnswerProps {
  answers: {
    answer: string
    isCorrect: boolean
    count: number
  }[]
}

export function QuizAfterAnswer(props: QuizAfterAnswerProps) {
  console.log(props)
  return (
    <>
      {/*todo: replace header*/}
      <ul
        id="answers-container"
        class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:grid-rows-3 mt-4 replace-transition "
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
            <div safe class="text-3xl font-medium ">
              {answer.answer}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
