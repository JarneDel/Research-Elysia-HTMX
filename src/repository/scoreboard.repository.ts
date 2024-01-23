import { supabase } from '@/libs'

export class ScoreboardRepository {
  quizCode: string

  constructor(quizCode: string) {
    this.quizCode = quizCode
  }

  public async createScoreboard() {
    const result = await supabase
      .from('answers')
      .select(`id, anon, user, answer, score, is_correct, page (id, page)`)
      .eq('active_quiz', this.quizCode)

    if (!result.data) {
      return { error: 'No data' }
    }
    console.log(result.data)

    const scores: Record<
      string,
      {
        correct: number
        incorrect: number
        score: number
        userType: 'anon' | 'user'
      }
    > = {}

    result.data.forEach(answer => {
      const user = answer.anon ?? answer.user
      if (!scores[user]) {
        scores[user] = {
          correct: answer.is_correct ? 1 : 0,
          incorrect: answer.is_correct ? 0 : 1,
          score: answer.score,
          userType: answer.anon ? 'anon' : 'user',
        }
      } else {
        console.log(scores[user])
        scores[user]!.correct += answer.is_correct ? 1 : 0
        scores[user]!.incorrect += answer.is_correct ? 0 : 1
        scores[user]!.score += answer.score
      }
    })

    const scoreArray = Object.entries(scores).map(([key, value]) => {
      return {
        anon_user: value.userType === 'anon' ? key : null,
        user: value.userType === 'user' ? key : null,
        quiz_code: this.quizCode,
        correct_answers: value.correct,
        wrong_answers: value.incorrect,
        score: value.score,
      }
    })

    supabase.from('score').insert(scoreArray)

    return scores
  }
}
