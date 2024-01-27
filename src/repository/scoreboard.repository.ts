import { supabase } from '@/libs'

export class ScoreboardRepository {
  quizCode: string

  constructor(quizCode: string) {
    this.quizCode = quizCode
  }

  public async calculateScores() {
    const result = await supabase
      .from('answers')
      .select(`id, anon, user, answer, score, is_correct, page (id, page)`)
      .eq('active_quiz', this.quizCode)

    if (!result.data) {
      return { error: 'No data' }
    }
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

    return supabase.from('score').insert(scoreArray)
  }

  public async getTopScores(count: number) {
    const result = await supabase
      .from('score')
      .select(
        'id, anon_user, user, score, correct_answers, wrong_answers, quiz_code',
      )
      .limit(count)
      .order('score', { ascending: false })
      .eq('quiz_code', this.quizCode)

    const users = result.data?.map(score => score.anon_user ?? score.user)
    const anonUsers = result.data?.map(score => score.anon_user)

    const userDetails = await supabase
      .from('user_detail')
      .select('user_id, username')
      .in('user_id', users ?? [])

    const anonUserDetails = await supabase
      .from('user_detail')
      .select('anon_user_id, username')
      .in('anon_user_id', anonUsers ?? [])

    const userMap = new Map<string, string>()
    userDetails.data?.forEach(user => {
      userMap.set(user.user_id, user.username)
    })
    anonUserDetails.data?.forEach(user => {
      userMap.set(user.anon_user_id, user.username)
    })

    return result.data?.map(score => {
      const user = userMap.get(score.anon_user ?? score.user)

      return {
        id: score.id,
        user,
        score: score.score,
        correct_answers: score.correct_answers,
        wrong_answers: score.wrong_answers,
        quiz_code: score.quiz_code,
      }
    })
  }
}
