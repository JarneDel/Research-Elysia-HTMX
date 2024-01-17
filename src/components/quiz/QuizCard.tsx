interface props {
  quiz: any
  nowPresenting: any[]
}

export const QuizCard = (props: props) => {
  const { quiz, nowPresenting } = props

  console.log({ nowPresenting })

  return (
    <div class="card max-w-96 bg-base-200 min-w-64">
      <div class="card-body">
        <div class="flex flex-row justify-between">
          <h2 class="card-title">
            <span safe>{quiz.name == '' ? 'untitled' : quiz.name}</span>
            {quiz.isDraft && <span class="badge badge-secondary">draft</span>}
            {isPresenting(nowPresenting, quiz.id) && (
              <span class="badge badge-success">Presenting</span>
            )}
          </h2>
          <div class="badge badge-ghost">{parseUpdatedAt(quiz.updated_at)}</div>
        </div>

        <p safe>{quiz.description}</p>
        <div class="card-actions justify-end">
          {!isPresenting(nowPresenting, quiz.id) && !quiz.isDraft && (
            <button
              class="btn btn-accent"
              hx-get={`/api/quiz/${quiz.id}/start`}
            >
              Present
            </button>
          )}
          {isPresenting(nowPresenting, quiz.id) && (
            <a
              href={`/present/${
                nowPresenting.find(item => item.quiz_id === quiz.id).id
              }`}
              class="btn btn-accent"
              hx-get={`/present/${
                nowPresenting.find(item => item.quiz_id === quiz.id)?.id
              }`}
              hx-push-url="true"
              hx-target="main"
            >
              Go
            </a>
          )}
          {quiz.isDraft && (
            <button
              class="btn btn-primary btn-secondary"
              hx-get={`/api/quiz/${quiz.id}/publish`}
              hx-target="closest .card"
              hx-swap="outerHTML"
            >
              Publish
            </button>
          )}
          <button
            class="btn btn-primary"
            hx-get={'/quiz/' + quiz.id + '/edit'}
            hx-push-url="true"
            hx-target="main"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}

const parseUpdatedAt = (updatedAt: string): string => {
  const date = new Date(updatedAt)
  const today = new Date()
  const year = date.getFullYear()
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'numeric',
    year: year != today.getFullYear() ? 'numeric' : undefined,
  })
}

const isPresenting = (
  nowPresenting: { quiz_id: any }[] | null,
  quizId: string,
) => {
  if (nowPresenting == null) return false
  return nowPresenting.find(item => item.quiz_id === quizId)
}
