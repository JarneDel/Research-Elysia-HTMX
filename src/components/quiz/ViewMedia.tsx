export interface props {
  quizId: string
  page: string
  mediaURL: string
  modalId: string
}

export const ViewMedia = (props: props) => {
  return (
    <>
      <div class="flex justify-center items-center w-full relative">
        <div class="avatar indicator max-h-96">
          <button
            class="indicator-item badge badge-error"
            hx-delete={'/api/quiz/' + props.quizId + '/media/' + props.page}
            hx-target="#media"
            hx-swap="innerHTML"
          >
            remove
          </button>
          <div class="max-h-96">
            <img src={props.mediaURL} alt="" class="h-full" />
          </div>
        </div>
        <button
          class="badge badge-lg badge-info absolute bottom-2 right-2 p-2"
          onclick={props.modalId + '.showModal()'}
        >
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
            class="my-4"
          >
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" x2="14" y1="3" y2="10" />
            <line x1="3" x2="10" y1="21" y2="14" />
          </svg>
        </button>
      </div>
      <dialog id={props.modalId} class="modal">
        <div class="modal-box max-w-3xl">
          <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <img src={props.mediaURL} alt="" class="h-full" />
        </div>
      </dialog>
    </>
  )
}
