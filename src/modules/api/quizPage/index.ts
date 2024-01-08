import { Elysia } from 'elysia'
import { supabase } from '@/libs'

export const auth = (app: Elysia) =>
  app.group('/quiz-page', app =>
    app.get('/:id', ({ params }) => {
      supabase.from('quiz-page').insert([{ id: params.id }])
    }),
  )
