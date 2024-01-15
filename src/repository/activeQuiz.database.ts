import { supabase } from '@/libs'

export const activeQuizDetails = async (quizId: string) => {
  return supabase
    .from('active_quiz')
    .select(
      `
      id,
      created_at,
      current_page_id,
      quiz_id (
        id,
        name,
        description
      )
    `,
    )
    .eq('id', quizId)
    .single()
}
