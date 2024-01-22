import { LoadingDot } from '@/components/states/loadingIndicator.tsx'

export const WaitingForOthers = () => {
  return (
    <>
      <div class="container relative" id="game-body">
        <div class="flex flex-col items-center justify-center full-height gap-8">
          <div class="flex flex-col items-center justify-center">
            <div class="text-3xl font-bold text-center">
              Waiting for others to submit..
            </div>
            <div class="text-xl text-center">
              <div class="text-center">
                <LoadingDot />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
