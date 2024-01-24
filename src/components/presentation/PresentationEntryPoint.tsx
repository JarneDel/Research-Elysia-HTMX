import { VideoPreviewToggle } from '@/components/input/video-preview-toggle.tsx'
import { VideoStreamingToggle } from '@/components/input/VideoStreamingToggle.tsx'
import { UsernameContainer } from '@/components/presentation/Username.tsx'
import { StreamingPreview } from '@/components/video/StreamingPreview.tsx'

export interface props {
  userId: string
  activeQuiz: any
  qrCode: string // data:image/png;base64,
  quiz: {
    name: string
    id: string
  }
}

export const PresentationEntryPoint = (props: props) => {
  return (
    <>
      <div ws-connect="/ws" hx-ext="ws">
        <StreamingPreview />
        <div id="presentation-header" class="navbar bg-base-300/60 px-2">
          <div id="presentation-header-start" class="navbar-start">
            {props.quiz.name}
          </div>
          <div id="presentation-header-center" class="navbar-center">
            {props.activeQuiz.id}
          </div>
          <div
            id="presentation-header-end"
            class="navbar-end flex flex-row gap-4"
          >
            <div id="streaming-controls">
              <VideoPreviewToggle />
              <VideoStreamingToggle />
            </div>
            <div
              id="quiz-control"
              class="flex flex-row justify-center items-center"
            >
              <form ws-send>
                <button name="start-presenting" class="btn btn-primary">
                  Start
                </button>
              </form>
            </div>
          </div>
        </div>
        <div id="lobby" class="container relative">
          <input
            type="hidden"
            name="presentQuizId"
            value={props.activeQuiz.id}
            ws-send
            hx-trigger="load"
          />
          <div class="flex flex-col items-center justify-center container double-header-height">
            <UsernameContainer id="connected-users"></UsernameContainer>
          </div>

          <button
            class=" fixed bottom-4 left-4"
            onclick="qr_dialog.showModal()"
          >
            <img src={props.qrCode} alt="qr code" class="w-[30vw] max-w-96" />
          </button>
          <dialog id="qr_dialog" class="modal">
            <div class="modal-box">
              <img src={props.qrCode} alt="qr code" class="w-full " />
            </div>
            <form method="dialog" class="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>

          <div class="absolute right-4 top-4 flex flex-row gap-4"></div>
        </div>
        <div id="game"></div>
      </div>
    </>
  )
}
