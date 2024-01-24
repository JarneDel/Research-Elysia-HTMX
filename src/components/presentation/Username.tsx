export interface props {
  username: string
}

export const Username = (props: props) => (
  <div
    safe
    class={
      `rounded-box py-2 px-4 h-max text-xl font-medium` + ' ' + randomColor()
    }
  >
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
    class="flex gap-4 flex-row flex-wrap max-w-3xl justify-center items-center mx-auto"
    hx-swap-oob={props['hx-swap-oob']}
    id={props.id}
  >
    {props.children}
  </div>
)

const randomColor = () => {
  const colors = [
    'bg-primary/70 text-primary-content',
    'bg-secondary/70 text-secondary-content',
    'bg-accent/70 text-accent-content',
    'bg-success/70 text-success-content',
    'bg-warning/70 text-warning-content',
    'bg-error/70 text-error-content',
  ]

  return colors[Math.floor(Math.random() * colors.length)]
}
