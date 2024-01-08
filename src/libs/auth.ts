import { Session, User } from '@supabase/supabase-js'
import { redisClient } from '@/libs/redis.ts'
import { supabase } from '@/libs/supabase.ts'

export interface AuthResult {
  user?: User
  error?: String
  session?: Session
}

export function setAuthCookies(cookie: any, session: Session) {
  cookie.access_token.value = session.access_token
  cookie.access_token.httpOnly = true
  cookie.access_token.path = '/'
  cookie.access_token.maxAge = 60 * 5
  cookie.access_token.sameSite = 'strict'

  cookie.refresh_token.maxAge = 60 * 60 * 24 * 30
  cookie.refresh_token.sameSite = 'strict'
  cookie.refresh_token.path = '/'
  cookie.refresh_token.httpOnly = true
  cookie.refresh_token.value = session.refresh_token
}

// Main function
export async function checkAccessToken(cookie: any): Promise<AuthResult> {
  if (!cookie.access_token.value) {
    return { error: 'Access token is required' }
  }
  const cachedAccessToken = await redisClient.get(cookie.access_token.value)
  if (cachedAccessToken) {
    console.log('found in redis')
    return { user: JSON.parse(cachedAccessToken) }
  }
  const user = await supabase.auth.getUser(cookie.access_token.value)

  if (user.error) {
    console.log('refreshing session...', cookie.refresh_token.value)
    // create new session

    const refreshed = await supabase.auth.refreshSession({
      refresh_token: cookie.refresh_token.value,
    })
    if (refreshed.error) {
      console.log('error refreshing session', refreshed.error.message)
      return { error: refreshed.error.message }
    }
    setAuthCookies(cookie, refreshed.data.session!)
    await setAccessTokenToRedis(
      refreshed.data.session!.access_token,
      refreshed.data.user!,
    )
    return { user: refreshed.data.user!, session: refreshed.data.session! }
  }
  // @ts-ignore
  await setAccessTokenToRedis(cookie.access_token.value, user.data!)
  return { user: user.data.user! }
}

async function setAccessTokenToRedis(accessToken: string, user: User) {
  await redisClient.setEx(accessToken, 60 * 5, JSON.stringify(user))
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
