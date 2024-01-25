import { Answer, AnswerParticipant } from '@/components/quiz/CreateQuiz.tsx'
import { ViewMedia } from '@/components/quiz/ViewMedia.tsx'

export interface QuestionProps {
  mediaURL?: string
  answers: string[]
  question: string
  quizName?: string
  code?: string
  mode: 'present' | 'participant'
  pageNumber?: number
  hasNextPage?: boolean
}

export const Question = (props: QuestionProps) => {
  return (
    <>
      <div
        id="presentation-header-start"
        class="navbar-start px-4 flex flex-row gap-4 justify-start items-center"
      >
        <h1 class="text-lg font-bold">
          <a href="/" hx-get="/" hx-push-url="true" hx-target="body">
            QuizX
          </a>
        </h1>
        <div class="font-medium">{props.quizName}</div>
      </div>

      <div
        id="presentation-header-center"
        class="navbar-center flex flex-row items-center"
      >
        {props.mode === 'present' && (
          <>
            <span class="text-2xl">Question {props.pageNumber}</span>
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
              class="lucide lucide-dot"
            >
              <circle cx="12.1" cy="12.1" r="1" />
            </svg>
            <div class="font-medium text-lgs">#{props.code}</div>
          </>
        )}
      </div>

      {props.mode === 'participant' && (
        <div id="game-header-center" class="navbar-center">
          <span class="text-2xl">Question {props.pageNumber}</span>
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
            class="lucide lucide-dot"
          >
            <circle cx="12.1" cy="12.1" r="1" />
          </svg>
          <div class="font-medium text-lgs">#{props.code}</div>
        </div>
      )}

      <div id="quiz-control" class="flex flex-row gap4">
        {props.mode === 'present' && (
          <div class="flex flex-row items-center">
            <span id="submissions-count"></span>
            <>
              <input
                type="hidden"
                name="after-answer"
                id={'after-answer-' + props.pageNumber}
                value={props.pageNumber?.toString()}
                ws-send
                hx-trigger="load delay:20s"
              />
              <form ws-send hx-trigger="submit">
                <input
                  type="hidden"
                  name="after-answer"
                  value={props.pageNumber?.toString()}
                  ws-send
                />
                <button class="btn btn-primary" type="submit">
                  Results
                </button>
              </form>
            </>
          </div>
        )}
      </div>

      <div id="lobby" hx-swap-oob="true"></div>
      <div id="game">
        {props.mode === 'present' && (
          //   horizontal countdown bar full width
          <div class="progress-bar" id="quiz-progress-bar"></div>
        )}
        <div class="container mt-4 " id="game-body">
          <div class="hero bg-base-200 rounded-box mb-4">
            <div class="text-2xl hero-content text-center font-medium">
              {props.question}
            </div>
          </div>

          {props.mediaURL && (
            <ViewMedia
              allowDelete={false}
              mediaURL={props.mediaURL}
              modalId="present_page_modal"
            />
          )}
          <ul
            class="grid grid-cols-1 md:grid-cols-2 gap-4 md:grid-rows-3 mt-4"
            id="answers-container"
          >
            {props.answers.map((question, index) => {
              if (props.mode === 'present')
                return <Answer index={index} value={question} />
              else
                return (
                  <form ws-send>
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
