import { supabase } from '@/libs'

export const setAnswer = async (options: {
  userType: 'anonymous' | 'authenticated'
  userId: string
  activeQuizId: string
  answer: string
  isCorrect: boolean
  pageId: number
}) => {
  const { userType, userId, activeQuizId, answer, isCorrect, pageId } = options
  return supabase.from('answers').insert([
    {
      answer,
      is_correct: isCorrect,
      page: pageId,
      active_quiz: activeQuizId,
      anon: userType === 'anonymous' ? userId : null,
      user: userType === 'authenticated' ? userId : null,
    },
  ])
}

export const getAnswersForUser = async (
  quizCode: string,
  pageId: string,
  userId: string,
  userType: 'anonymous' | 'authenticated',
) => {
  switch (userType) {
    case 'anonymous':
      return supabase
        .from('answers')
        .select('id')
        .eq('page', pageId)
        .eq('anon', userId)
        .eq('active_quiz', quizCode)
    case 'authenticated':
      return supabase
        .from('answers')
        .select('id')
        .eq('page', pageId)
        .eq('user', userId)
        .eq('active_quiz', quizCode)
  }
}
