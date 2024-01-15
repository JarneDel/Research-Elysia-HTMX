interface props {
  code: string
}

export const Code = (props: props) => {
  const { code } = props

  return (
    <div class="card max-w-96 bg-base-200 min-w-64">
      <div class="card-body">
        <pre class="text-sm">{code}</pre>
      </div>
    </div>
  )
}
