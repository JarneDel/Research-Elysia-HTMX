export const Podium = (props: { score: number; position: number }) => (
  <div class="flex flex-col justify-center items-center gap-4">
    <div class="text-5xl">{getMedal(props.position)}</div>

    <div class="">You placed {props.position}th</div>
    <div class="">with a score of {props.score} points</div>
  </div>
)

const getMedal = (position: number) => {
  switch (position) {
    case 1:
      return '🥇'
    case 2:
      return '🥈'
    case 3:
      return '🥉'
    default:
      return
  }
}
