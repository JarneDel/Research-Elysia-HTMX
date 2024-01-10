interface props {
  postURL: string
  progressID: string
  formID: string
  inputID?: string
  target?: string
}

export const MediaUpload = (props: props) => {
  return (
    <>
      <form
        hx-encoding="multipart/form-data"
        hx-post={props.postURL}
        id={props.formID}
        hx-include={'#' + props.inputID}
        hx-trigger="input change"
        hx-target={props.target}
        hx-swap="innerHTML"
      >
        <div class="form-control">
          <div class="label">
            <div class="label-text">Attach an image or GIF</div>
            <div class="label-text-alt">(optional)</div>
          </div>
          <input
            id={props.inputID}
            class="file-input file-input-accent file-input-md"
            type="file"
            name="media"
            accept="image/*"
          />
          <progress
            id={props.progressID}
            class="progress progress-success mb-2 mt-1"
            value="0"
            max="100"
          ></progress>
        </div>
      </form>
      <script>
        htmx.on('#{props.formID}', 'htmx:xhr:progress', function (evt) {'{'}
        htmx.find('#{props.progressID}').setAttribute( 'value',
        (evt.detail.loaded / evt.detail.total) * 100, ){'}'})
      </script>
    </>
  )
}
