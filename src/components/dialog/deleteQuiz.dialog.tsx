interface DeleteQuizDialogProps {
  id: string
  deleteURL: string
  target: string
}

export const DeleteQuizDialog = (props: DeleteQuizDialogProps) => {
  return (
    <dialog id={props.id} class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg">
          Are you sure you want to delete this quiz
        </h3>
        <p class="py-4">This action cannot be undone</p>
        <div class="modal-action justify-between">
          <button
            class="btn btn-error"
            hx-delete={props.deleteURL}
            hx-target={props.target}
            hx-swap="innerHTML"
          >
            Delete
          </button>
          <form method="dialog">
            <button class="btn btn-neutral">Cancel</button>
          </form>
        </div>
      </div>
    </dialog>
  )
}
