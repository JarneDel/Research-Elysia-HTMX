export interface props {
  username: string
}

export const Username = (props: props) => (
  <div safe class={`rounded-box py-2 px-4 bg-primary/50 h-max`}>
    {props.username}
  </div>
)

export interface usernameContainerProps {
  'hx-swap-oob'?: string
  children?: any
  id: string
}

export const UsernameContainer = (props: usernameContainerProps) => (
  <div
    class="flex gap-4 flex-row flex-wrap max-w-3xl justify-center items-center mx-auto full-height"
    hx-swap-oob={props['hx-swap-oob']}
    id={props.id}
  >
    {props.children}
  </div>
)

// const randomColor = () => {
//   const colors = [
//     'bg-primary text-primary-content',
//     'bg-secondary text-secondary-content',
//     'bg-accent text-accent-content',
//     'bg-neutral text-neutral-content',
//     'bg-success text-success-content',
//     'bg-warning text-warning-content',
//     'bg-error text-error-content',
//   ]
//
//   return colors[Math.floor(Math.random() * colors.length)]
// }
