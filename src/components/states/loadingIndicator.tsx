interface params {
  id?: string
  size?: string
  class?: string
}

export const LoadingIndicator = (params: params) => {
  const size = params.size || '48'
  return (
    <span
      class={
        'loading loading-spinner loading-xs ' + params.id ? 'my-indicator' : ''
      }
      id={params.id}
    ></span>
  )
}

export const LoadingDot = () => {
  return <span class="loading loading-dots loading-lg"></span>
}
