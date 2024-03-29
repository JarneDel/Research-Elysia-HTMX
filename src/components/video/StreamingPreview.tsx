export const StreamingPreview = () => (
  <>
    <script src="/public/dragElement.js" defer></script>
    <div
      class="fixed z-10 resize-y overflow-hidden border  aspect-video  rounded-box max-w-[1280px] max-h-[740px] min-w-64 min-h-36 bg-base-100 hidden right-8 bottom-8"
      id="stream-container"
      hx-on={`mouseenter: dragElement('stream-container')`}
      style="width: 328px; height: 180px"
    >
      <div
        class="p-2 cursor-move z-10 bg-accent"
        id="stream-container-header"
      />
      {/*//@ts-expect-error muted does exist on video tag*/}
      <video id="input-video" autoplay muted />
    </div>
  </>
)
