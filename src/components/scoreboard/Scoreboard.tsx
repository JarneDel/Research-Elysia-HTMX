export interface ScoreboardProps {
  data: {
    id: any
    user: string | undefined
    score: any
    correct_answers: any
    wrong_answers: any
    quiz_code: any
  }[]
}

export const Scoreboard = (props: ScoreboardProps) => {
  return (
    <div id="scoreboard">
      <table class="table">
        <thead>
          <tr>
            <th scope="col">User</th>
            <th scope="col">Score</th>
            <th scope="col">Correct Answers</th>
            <th scope="col">Wrong Answers</th>
          </tr>
        </thead>
        <tbody>
          {props.data.map((row, index) => (
            <tr>
              <td>{row.user}</td>
              <td>{row.score}</td>
              <td>{row.correct_answers}</td>
              <td>{row.wrong_answers}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
