import { Elysia } from 'elysia'
import { supabase } from '@/libs/supabase'
import { Cookie } from '@/types/cookie.type.ts'

export const authen = (app: Elysia) =>
  app.derive(async ({ cookie, path, set }) => {
    if (path.startsWith('/auth')) return

    const { access_token, refresh_token } = cookie
    if (!access_token?.value) {
      set.headers['HX-Redirect'] = '/auth/sign-in'
      return
    }
    if (!refresh_token?.value) {
      set.headers['HX-Redirect'] = '/auth/sign-in'
      return
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
