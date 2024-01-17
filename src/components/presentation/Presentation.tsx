import { UsernameContainer } from '@/components/presentation/Username.tsx'

export interface props {
  userId: string
  activeQuiz: any
}

export const Presentation = (props: props) => {
  return (
    <>
      <div class="" ws-connect="/ws" hx-ext="ws">
        <div id="lobby" class="container relative">
          <input
            type="hidden"
            name="presentQuizId"
            value={props.activeQuiz.id}
            ws-send
            hx-trigger="load"
          />
          <UsernameContainer id="connected-users"></UsernameContainer>
          <form ws-send>
            <button
              name="start-presenting"
              class="btn btn-primary absolute right-4 top-4"
            >
              Start
            </button>
          </form>
        </div>
        <div id="game"></div>
      </div>
    </>
  )
}
