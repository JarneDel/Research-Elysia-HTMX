import { checkAccessToken } from '@/libs/auth.ts'

export interface anyAuthResult {
  userId?: string
  type: 'anonymous' | 'authenticated' | 'unauthorized'
}

export interface SuccessfulAuthResult {
  userId: string
  type: 'anonymous' | 'authenticated'
}

export interface AuthenticatedAuthResult {
  userId: string
  type: 'authenticated'
}

/**
 * Check if the user is authenticated or anonymous
 * @param cookie
 */
export const anyAuth = async (cookie: any): Promise<anyAuthResult> => {
  if (!cookie.refresh_token) {
    if (cookie['anon_user'].value) {
      return {
        userId: cookie['anon_user'].value,
        type: 'anonymous',
      }
    }
  }

  const result = await checkAccessToken(cookie)
  if (result.error) {
    if (cookie['anon_user'].value) {
      return {
        userId: cookie['anon_user'].value,
        type: 'anonymous',
      }
    } else {
      return {
        type: 'unauthorized',
      }
    }
  }
  return {
    userId: result.user?.id,
    type: result.user ? 'authenticated' : 'unauthorized',
  }
}
