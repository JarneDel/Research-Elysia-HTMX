import { LoadingIndicator } from '@/components/states/loadingIndicator.tsx'

interface NextButtonProps {
  quizId: string
  pageNumber: string
  page?: any
  'hx-swap-oob'?: string
}

export const NextButton = (props: NextButtonProps) => {
  const { quizId, pageNumber, page } = props

  const notEmptyLength = page?.answers.filter(
    (answer: any) => answer !== '',
  ).length

  const isEnabled =
    notEmptyLength >= 2 &&
    page.question !== '' &&
    page.correct_answers.length > 0

  return (
    <button
      hx-swap-oob={props['hx-swap-oob']}
      id="next-page-btn"
      class="btn btn-primary"
      hx-get={'/quiz/' + quizId + '/edit/page/' + (Number(pageNumber) + 1)}
      hx-swap="outerHTML transition:true"
      hx-push-url="true"
      hx-target="#page"
      hx-trigger="click"
      hx-indicator="#next-page-indicator"
      disabled={!isEnabled}
    >
      Next
      <LoadingIndicator
        id="next-page-indicator"
        size="20"
        class="duration-500"
      />
    </button>
  )
}

interface PreviousButtonProps {
  quizId: string
  pageNumber: string
}

export const PreviousButton = (props: PreviousButtonProps) => {
  const { quizId, pageNumber } = props
  return (
    <button
      class="btn btn-primary"
      hx-get={'/quiz/' + quizId + '/edit/page/' + (Number(pageNumber) - 1)}
      hx-swap="outerHTML"
      hx-target="#page"
      disabled={Number(pageNumber) == 1}
      hx-trigger="click"
      hx-push-url="true"
      hx-indicator="#previous-page-indicator"
    >
      Previous
      <LoadingIndicator
        id="previous-page-indicator"
        size="20"
        class="duration-500"
      />
    </button>
  )
}
