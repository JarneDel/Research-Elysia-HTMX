export const QuestionReconnect = (props: {
  question: string
  children: JSX.Element
}) => {
  return (
    <>
      <div id="lobby"></div>
      <div id="game">{props.children}</div>
    </>
  )
}
