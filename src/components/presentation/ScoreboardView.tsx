import {
  Scoreboard,
  ScoreboardProps,
} from '@/components/scoreboard/Scoreboard.tsx'

export const ScoreboardView = (props: ScoreboardProps) => (
  <>
    <div id="lobby"></div>
    <div id="quiz-control">
      <a
        class="btn btn-primary"
        id="start-presenting"
        hx-get="/quiz/my"
        hx-target="body"
        href="/quiz/my"
      >
        Exit
      </a>
    </div>
    <div id="loader"></div>
    <div id="game">
      <Scoreboard data={props.data} />
    </div>
  </>
)
