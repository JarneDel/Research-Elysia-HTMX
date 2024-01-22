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
      <div id="lobby" hx-swap-oob="true"></div>
      <div id="game">
        <div class="flex  navbar bg-base-300/60 relative">
          {props.mode === 'participant' && (
            <>
              <div class="text-2xl flex-1 flex">
                <span class="mx-auto">Question {props.pageNumber}</span>
              </div>
            </>
          )}

          {props.mode === 'present' && (
            <>
              <div class="navbar-start font-bold px-4">
                <span>{props.quizName}</span>
                <span class="px-4 font-mono font-medium">{props.code}</span>
              </div>
              <div class="text-2xl navbar-center">
                Question {props.pageNumber}
              </div>
              <div class="navbar-end ">
                <div
                  class="flex flex-row items-center"
                  hx-on="htmx:wsBeforeMessage=alert('hi')"
                >
                  <span id="submissions-count"></span>
                  {props.hasNextPage && (
                    <>
                      <input
                        type="hidden"
                        name="next-question"
                        value="true"
                        ws-send
                        hx-trigger="load delay:20s"
                      />
                      <form ws-send hx-trigger="submit">
                        <button class="btn btn-primary" name="next-question">
                          Next
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        {props.mode === 'present' && (
          //   horizontal countdown bar full width
          <div class="progress-bar"></div>
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
