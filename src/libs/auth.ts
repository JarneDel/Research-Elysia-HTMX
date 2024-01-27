import { Session, User } from '@supabase/supabase-js'
import { cache } from '@/libs/cache.ts'
import { supabase } from '@/libs/supabase.ts'

export interface AuthResult {
  user?: User
  error?: string
  session?: Session
}

export function setAuthCookies(cookie: any, session: Session) {
  cookie.anon_user.remove({
    path: '/',
    sameSite: 'strict',
  })

  cookie.access_token.set({
    value: session.access_token
      ? session.access_token
      : cookie.access_token.value,
    httpOnly: true,
    path: '/',
    sameSite: 'strict',
    maxAge: 60 * 5 * 60, // 5 hours
  })
  cookie.refresh_token.set({
    value: session.refresh_token
      ? session.refresh_token
      : cookie.refresh_token.value,
    httpOnly: true,
    path: '/',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
  })
}

// Main function
export async function checkAccessToken(cookie: any): Promise<AuthResult> {
  if (!cookie.refresh_token.value) {
    return { error: 'Refresh token is required' }
  }
  if (cookie.access_token.value) {
    const cachedAccessToken = await cache.get(cookie.access_token.value)
    if (cachedAccessToken) {
      const user = cachedAccessToken as User
      return { user }
    }
  }

  const user = await supabase.auth.getUser(cookie.access_token.value)
  if (user.error) {
    // create new session

    const refreshed = await supabase.auth.refreshSession({
      refresh_token: cookie.refresh_token.value,
    })
    if (refreshed.error) {
      return { error: refreshed.error.message }
    }

    setAuthCookies(cookie, refreshed.data.session!)
    await saveUserAccessToken(
      refreshed.data.session!.access_token,
      refreshed.data.user!,
    )
    return { user: refreshed.data.user!, session: refreshed.data.session! }
  }
  await saveUserAccessToken(cookie.access_token.value, user.data.user!)
  return { user: user.data.user! }
}

async function saveUserAccessToken(accessToken: string, user: User) {
  cache.set(accessToken, user, 60 * 5)
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
    return { error: error.message }
  }
  setAuthCookies(cookie, data.session!)
  return {
    user: data.user!,
  }
}
