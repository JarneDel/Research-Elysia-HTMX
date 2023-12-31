import { Elysia } from 'elysia'
import { supabase } from '@/libs/supabase'

export const authen = (app: Elysia) =>
  app.derive(async ({ cookie, path }) => {
    if (path.startsWith('/auth')) return

    const { access_token, refresh_token } = cookie
    if (!access_token?.value) {
      throw new Error('Access token is required')
    }
    if (!refresh_token?.value) {
      throw new Error('Refresh token is required')
    }

    const { data, error } = await supabase.auth.getUser(access_token.value)
    if (data.user) {
      return data.user.id
    }
    const { data: refreshed, error: refreshError } =
      await supabase.auth.refreshSession({
        refresh_token: refresh_token.value,
      })
    if (refreshError) throw error
    return {
      userId: refreshed.user!.id,
    }
  })
