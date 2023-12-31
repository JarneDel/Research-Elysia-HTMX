import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/libs/supabase.ts'

export interface AuthResult {
  user?: User
  error?: Error
}

function setCookies(cookie: any, session: Session) {
  cookie.access_token.set({
    value: session.access_token,
    httpOnly: true,
    path: '/',
  })
  cookie.refresh_token.set({
    value: session.refresh_token,
    httpOnly: true,
    path: '/',
  })
}

// Main function
export async function checkAccessToken(cookie: any): Promise<AuthResult> {
  if (!cookie.access_token.value) {
    return { error: new Error('Access token is required') }
  }

  const user = await supabase.auth.getUser(cookie.access_token.value)
  if (user.error) {
    console.log('refreshing session...', cookie.refresh_token.value)
    const refreshed = await supabase.auth.refreshSession(
      cookie.refresh_token.value,
    )
    if (refreshed.error) {
      return { error: refreshed.error }
    }
    setCookies(cookie, refreshed.data.session!)
    return { user: refreshed.data.user! }
  }
  return { user: user.data.user! }
}

export async function login(
  { email, password }: { email: string; password: string },
  cookie: any,
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) {
    return { error }
  }
  setCookies(cookie, data.session!)
  return {
    user: data.user!,
  }
}
