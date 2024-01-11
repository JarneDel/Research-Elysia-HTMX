import { supabase } from '@/libs/supabase.ts'

export const updatePageMediaUrl = async (
  quizId: string,
  pageId: string,
  url: string,
) => {
  const { data: page, error: pageError } = await supabase
    .from('page')
    .select()
    .eq('quiz', quizId)
    .eq('page', pageId)
    .single()

  return supabase
    .from('page')
    .update({
      id: page.id,
      media_url: url,
    })
    .eq('id', page.id)
    .eq('quiz', quizId)
    .eq('page', pageId)
    .select('id')
}

export const quizWithPage = async (
  quizId: string,
  userId: string,
  page: string,
) => {
  return supabase
    .from('quiz')
    .select(
      `
              created_by,
              id,
              name,
              isDraft,
              page (
                id,
                question,
                answers,
                correct_answers,
                page,
                media_url
              )
          `,
    )
    .eq('id', quizId)
    .eq('created_by', userId)
    .eq('page.page', page)
    .limit(1)
    .single()
}
