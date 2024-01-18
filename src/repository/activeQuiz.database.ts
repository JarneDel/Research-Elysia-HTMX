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

export const startActiveQuiz = async (quizId: string, pageId: number) => {
  return supabase
    .from('active_quiz')
    .update([{ current_page_id: pageId }])
    .eq('id', quizId)
}

export const getSingleActiveQuizWithPageAndQuiz = async (quizId: string) => {
  return (
    supabase
      .from('active_quiz')
      .select(
        `
      id,
      current_page_id,
      quiz_id (
        id,
        description,
        name,
        page (id, page)
      )
    `,
      )
      .eq('id', quizId)
      // .filter('current_page_id', 'is.null', true)
      .single()
  )
}

export const getPageWithQuiz = async (
  quizId: string,
  pageNumber: number,
  userId: string,
) => {
  return supabase
    .from('page')
    .select(
      `
      id,
      question, 
      answers,
      correct_answers,
      page,
      media_url,
      quiz(
        id,
        created_by
      )
      
    `,
    )
    .eq('quiz.created_by', userId)
    .eq('page', pageNumber)
    .eq('quiz', quizId)
    .single()
}
