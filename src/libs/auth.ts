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
const debug = false
export async function checkAccessToken(cookie: any): Promise<AuthResult> {
  if (!cookie.refresh_token.value) {
    return { error: 'Refresh token is required' }
  }
  if (cookie.access_token.value) {
    debug && console.log('reading from cache')
    const cachedAccessToken = await cache.get(cookie.access_token.value)
    if (cachedAccessToken) {
      const user = cachedAccessToken as User
      debug && console.log('found in cache', user.id)
      return { user }
    }
    debug && console.log('not found in cache')
  }

  const user = await supabase.auth.getUser(cookie.access_token.value)
  console.log({ user: user.data.user })
  if (user.error) {
    debug && console.log('refreshing session...', cookie.refresh_token.value)
    // create new session

    const refreshed = await supabase.auth.refreshSession({
      refresh_token: cookie.refresh_token.value,
    })
    console.log({ refreshed: refreshed.data.user?.id })
    if (refreshed.error) {
      console.log('error refreshing session', refreshed.error.message)
      return { error: refreshed.error.message }
    }
    debug && console.log('successfully refreshed session')

    setAuthCookies(cookie, refreshed.data.session!)
    await saveUserAccessToken(
      refreshed.data.session!.access_token,
      refreshed.data.user!,
    )
    debug && console.log('successfully set access token to cache')
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
