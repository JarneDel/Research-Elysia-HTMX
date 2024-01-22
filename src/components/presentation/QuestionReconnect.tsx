export const QuestionReconnect = (props: {
  question: string
  children: JSX.Element
}) => {
  return (
    <div id="game">
      {/*<div class="flex  navbar bg-base-300/60 relative">*/}
      {/*  <div class="text-2xl flex-1 flex">*/}
      {/*    <span class="mx-auto">{props.question}</span>*/}
      {/*  </div>*/}
      {/*</div>*/}
      {props.children}
    </div>
  )
}
