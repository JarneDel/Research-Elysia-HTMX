import { Alert } from '@/components/errors/Alerts.tsx'

interface props {
  answers: string[]
  correct_answers: number[]
  question: string
  'hx-swap-oob'?: string
}

export const QuizValidation = (props: props) => {
  const { answers, correct_answers, question } = props
  const answerCountNoEmpty = answers.filter(answer => answer !== '').length
  const answerLengthTooShort = answerCountNoEmpty < 2
  const questionEmpty = question === '' || !question
  const noCorrectAnswer = correct_answers.length === 0
  if (!answerLengthTooShort && !questionEmpty && !noCorrectAnswer) {
    return <div hx-swap-oob={props['hx-swap-oob']} id="question-validation" />
  }
  if (answerLengthTooShort && questionEmpty && noCorrectAnswer) {
    return <div hx-swap-oob={props['hx-swap-oob']} id="question-validation" />
  }

  return (
    <div hx-swap-oob={props['hx-swap-oob']} id="question-validation">
      <Alert severity="info">
        <div class="flex flex-col">
          {answerCountNoEmpty && <div>You must add at least two questions</div>}
          {questionEmpty && <div>Enter a question</div>}
          {noCorrectAnswer && <div>Must have at least 1 correct answer</div>}
        </div>
      </Alert>
    </div>
  )
}
