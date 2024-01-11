import {
  ErrorIcon,
  Info,
  Success,
  Warning,
} from '@/components/icons/StatusIcons.tsx'

interface props {
  children?: JSX.Element | JSX.Element[] | string
  severity: 'error' | 'success' | 'info' | 'warning'
  class?: string
}

export const Alert = (props: props) => (
  <>
    <div class={'alert alert-' + props.severity + ' ' + props.class}>
      <span>{switchAlertIcon(props.severity)}</span>
      <span>{props.children}</span>
    </div>
  </>
)

const switchAlertIcon = (
  severity: 'error' | 'success' | 'info' | 'warning',
) => {
  switch (severity) {
    case 'success':
      return <Success />
    case 'error':
      return <ErrorIcon />
    case 'info':
      return <Info />
    case 'warning':
      return <Warning />
  }
}
