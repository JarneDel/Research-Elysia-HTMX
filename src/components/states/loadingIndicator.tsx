interface params {
  id: string
  size?: string
  class?: string
}

export const LoadingIndicator = (params: params) => {
  const size = params.size || '48'
  return (
    <div id={params.id} class="my-indicator ">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class={'animate-spin ' + params.class}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </div>
  )
}
