import { UsernameContainer } from '@/components/presentation/Username.tsx'

export interface props {
  userId: string
  activeQuiz: any
  qrCode: string // data:image/png;base64,
}

export const Presentation = (props: props) => {
  return (
    <>
      <div ws-connect="/ws" hx-ext="ws">
        <video
          id="input-video"
          autoplay
          class="fixed bottom-2 right-2 "
        ></video>
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
            <div class="tooltip" data-tip="toggle webcam">
              <label class="swap btn btn-circle swap-indeterminate">
                <input
                  type="checkbox"
                  id="toggle-stream"
                  hx-on="change: toggleStream(event)"
                  hx-post="/api/stream/toggle"
                />
                <div class="swap-on">
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
                    class="lucide lucide-video"
                  >
                    <path d="m22 8-6 4 6 4V8Z" />
                    <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                  </svg>
                </div>
                <div class="swap-off">
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
                    class="lucide lucide-video-off"
                  >
                    <path d="M10.66 6H14a2 2 0 0 1 2 2v2.34l1 1L22 8v8" />
                    <path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2l10 10Z" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                </div>
              </label>
            </div>

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
