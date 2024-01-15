import { DeleteQuizDialog } from '@/components/dialog/deleteQuiz.dialog.tsx'
import { LoadingIndicator } from '@/components/states/loadingIndicator.tsx'

interface EditQuizProps {
  pageNumber: string
  quizId: string
  quiz: any
  children?: JSX.Element
}

export const EditQuiz = (props: EditQuizProps) => {
  const { quiz, quizId, pageNumber, children } = props

  return (
    <>
      <div class="flex justify-between navbar bg-base-300/60 relative">
        <div class="flex flex-row items-center gap-2">
          <div class="tooltip" data-tip="Title">
            <input
              type="text"
              value={quiz.name}
              hx-put={'/api/quiz/' + quizId + '/change-name'}
              hx-trigger="blur input"
              name="value"
              placeholder="Untitled quiz"
              class="input input-ghost bg-base-200 max-w-40"
            />
          </div>
          {quiz.isDraft && <div class="badge badge-secondary">draft</div>}
        </div>

        <div
          class="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 flex flex-row items-center gap-2 font-bold text-lg"
          id="question_number"
        >
          Question 1
        </div>

        <div class="flex flex-row items-center gap-2">
          <a
            class="btn btn-primary"
            hx-push-url="true"
            hx-get="/quiz/:id/present"
            href="#"
          >
            Present quiz
          </a>
          <div class="dropdown dropdown-end ">
            <button class="flex items-center btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
            <ul
              tabindex="0"
              class="dropdown-content z-[1] p-2 shadow bg-base-200 rounded-box w-32 mt-4 gap-2 flex flex-col"
            >
              <li>
                <button
                  class="btn btn-error w-full btn-sm"
                  onclick="delete_quiz_modal.showModal()"
                >
                  Delete quiz
                </button>
                <DeleteQuizDialog
                  id="delete_quiz_modal"
                  target="main"
                  deleteURL={`/api/quiz/${quizId}`}
                />
              </li>
              {!quiz.isDraft && (
                <li>
                  <a class="btn btn-warning w-full btn-sm">Set draft</a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      <div class="container simple-view-transition">
        {children ?? (
          <>
            <div
              hx-trigger="load"
              hx-get={'/quiz/' + quizId + '/edit/page/' + pageNumber}
              hx-swap="outerHTML"
              hx-indicator="#quizPage"
            ></div>
            <LoadingIndicator id="quizPage" />
          </>
        )}
      </div>
    </>
  )
}
