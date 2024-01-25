interface Props {
  id: string
  children: JSX.Element | JSX.Element[] | string
}

export const MovableResizableDiv = (props: Props) => {
  return (
    <>
      <script src="/public/dragElement.js" defer></script>
      <div
        class="fixed z-10 resize-y overflow-auto border  aspect-video  rounded-box max-w-[1280px] max-h-[740px] min-w-64 min-h-36 bg-base-100 bottom-8 right-8"
        id={props.id}
        hx-on={`mouseenter: dragElement(${props.id})`}
        style="width: 318; height: 198px"
      >
        <div
          class="p-2.5 cursor-move z-10 bg-accent"
          id={props.id + '-header'}
        ></div>
        <div class=""> {props.children}</div>
      </div>
    </>
  )
}

// min-w-64 min-h-36 max-h-[740px] max-w-[1280px]
