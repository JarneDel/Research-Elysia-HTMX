import { VideoPreviewToggle } from '@/components/input/video-preview-toggle.tsx'
import { VideoStreamingToggle } from '@/components/input/VideoStreamingToggle.tsx'
import { UsernameContainer } from '@/components/presentation/Username.tsx'
import { StreamingPreview } from '@/components/video/StreamingPreview.tsx'

export interface props {
  userId: string
  activeQuiz: any
  qrCode: string // data:image/png;base64,
}

export const Presentation = (props: props) => {
  return (
    <>
      <div ws-connect="/ws" hx-ext="ws">
        <StreamingPreview />
        <div id="lobby" class="container relative">
          <input
            type="hidden"
            name="presentQuizId"
            value={props.activeQuiz.id}
            ws-send
            hx-trigger="load"
          />
          <div class="full-height flex flex-col items-center justify-center container">
            <h1 class="text-4xl font-bold text-center">
              {props.activeQuiz.id}
            </h1>

            <UsernameContainer id="connected-users"></UsernameContainer>
          </div>

          <div class=" absolute bottom-4 left-4">
            <img src={props.qrCode} alt="qr code" class="w-96" />
          </div>

          <div class="absolute right-4 top-4 flex flex-row gap-4">
            <VideoPreviewToggle />
            <VideoStreamingToggle />
            <form ws-send class=" ">
              <button name="start-presenting" class="btn btn-primary">
                Start
              </button>
            </form>
          </div>
        </div>
        <div id="game"></div>
      </div>
    </>
  )
}
