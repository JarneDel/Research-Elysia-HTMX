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
