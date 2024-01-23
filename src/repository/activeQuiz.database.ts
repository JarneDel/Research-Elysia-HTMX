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
      ),
      stream (
        stream_id,
        playback,
        recording
      )
    `,
    )
    .eq('id', quizId)
    .single()
}

export async function getActiveQuizMinimal(quizId: string) {
  return supabase
    .from('active_quiz')
    .select(
      `
      id,
      created_at,
      has_ended,
      quiz_id,
      current_page_id
    `,
    )
    .eq('id', quizId)
    .single()
}

export const activeQuizPageDetails = async (quizId: string) => {
  return supabase
    .from('active_quiz')
    .select(
      `
      id,
      created_at,
      has_ended,
      current_page_id (id, page, question, answers, correct_answers, media_url)
    `,
    )
    .eq('id', quizId)
    .single()
}

export const activeQuizPageDetailsWithNextPage = async (quizId: string) => {
  return supabase
    .from('active_quiz')
    .select(
      `
      id,
      created_at,
      has_ended,
      current_page_id (id, page, question, answers, correct_answers, media_url),
      quiz_id (
        page (id, page)
      )
    `,
    )
    .eq('id', quizId)
    .single()
}

export const endActiveQuiz = async (quizCode: string) => {
  return supabase
    .from('active_quiz')
    .update([{ has_ended: true }])
    .eq('id', quizCode)
}

export const activeQuizAllFields = async (quizCode: string) => {
  return supabase
    .from('active_quiz')
    .select(
      `
      id,
      created_at,
      current_page_id (id, page, question, answers, correct_answers, media_url),
      quiz_id (
        id,
        name,
        description,
        page (id, page)
      )
    `,
    )
    .eq('id', quizCode)
    .not('current_page_id', 'is', null)
    .single()
}

export const changeActiveQuizPage = async (quizId: string, pageId: number) => {
  return supabase
    .from('active_quiz')
    .update([{ current_page_id: pageId }])
    .eq('id', quizId)
}

export const getSingleActiveQuizWithPageAndQuiz = async (quizCode: string) => {
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
      .eq('id', quizCode)
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
