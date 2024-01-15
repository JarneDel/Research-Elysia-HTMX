import { AddAnswer, Answer } from '@/components/quiz/CreateQuiz.tsx'
import { MediaUpload } from '@/components/quiz/MediaUpload.tsx'
import { ViewMedia } from '@/components/quiz/ViewMedia.tsx'
import { LoadingIndicator } from '@/components/states/loadingIndicator.tsx'

interface params {
  pageNumber: string
  quizId: string
  page: any
  quiz: any
}

export const EditQuizPage = (params: params) => {
  const { quizId, pageNumber, page, quiz } = params

  return (
    <div
      id="page"
      hx-trigger="load"
      hx-target="#question_number"
      hx-swap="innerHTML"
      hx-get={`/fragment/quiz/page/${pageNumber}/title`}
    >
      <div
        hx-trigger="input delay:300ms, submit"
        hx-post={`/api/quiz/${quizId}/change-answers/page/${pageNumber}`}
        hx-include=".answer, .correct-answer, .page-title"
        hx-swap="none"
      >
        <div class="tooltip w-full my-3" data-tip="Question">
          <label class="form-control">
            <input
              name="title"
              type="text"
              class="page-title input input-primary input-bordered text-center input-lg font-bold bg-base-200"
              value={quiz?.question}
              placeholder="start typing your question"
            />
          </label>
        </div>
        <div
          id="media"
          class="container max-w-2xl mx-auto border-2 rounded-md p-2 mb-3 bg-base-200"
        >
          {!page?.media_url ? (
            <MediaUpload
              postURL={`/api/quiz/${quizId}/upload_media/${pageNumber}`}
              progressID="progress"
              inputID="media-input"
              formID="media-form"
              target="#media"
            />
          ) : (
            <ViewMedia
              mediaURL={page.media_url}
              quizId={quizId}
              page={params.pageNumber}
              modalId="media_modal"
              allowDelete={true}
            />
          )}
        </div>

        <ul class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:grid-rows-3 ">
          {(!page || page?.answers.length == 0) && (
            <>
              <Answer id={0} placeholder="Add answer 1" />
              <Answer id={1} placeholder="Add answer 2" />
              <AddAnswer />
            </>
          )}
          {page?.answers.map((answer: string, index: number) => (
            <Answer
              id={index}
              placeholder={'Add answer' + (index + 1)}
              value={answer}
              isCorrect={page.correct_answers.includes(index)}
              isDeletable={index > 1}
            />
          ))}
          {page?.answers.length < 6 && <AddAnswer />}
        </ul>
      </div>
      <div class="flex justify-between mt-5">
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
        <button
          class="btn btn-primary"
          hx-get={'/quiz/' + quizId + '/edit/page/' + (Number(pageNumber) + 1)}
          hx-swap="outerHTML"
          hx-push-url="true"
          hx-target="#page"
          hx-trigger="click"
          hx-indicator="#next-page-indicator"
        >
          Next
          <LoadingIndicator
            id="next-page-indicator"
            size="20"
            class="duration-500"
          />
        </button>
      </div>
    </div>
  )
}