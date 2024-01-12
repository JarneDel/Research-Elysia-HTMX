import { supabase } from '@/libs/supabase.ts'

export const setAnonymousSessionCookie = async (cookie: any) => {
  const { data: newUser, error } = await supabase
    .from('anon_users')
    .insert({})
    .select('id')
    .single()
  if (error) return { error }
  cookie.anon_user.set({
    value: newUser.id,
    maxAge: 60 * 60 * 24 * 365 * 10,
    sameSite: 'strict',
    path: '/',
  })
  return {
    data: newUser.id,
  }
}
