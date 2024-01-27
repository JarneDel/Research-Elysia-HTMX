import { checkAccessToken } from '@/libs/auth.ts'
import { setAnonymousSessionCookie } from '@/libs/publicAuth.ts'

export const isUser = async (ctx: any) => {
  const { cookie, set } = ctx
  const result = await ctx.checkAccessToken(cookie)
  ctx.authResult = result
  if (result.error) {
    set.headers['HX-Redirect'] = '/auth/sign-in'
    set.redirect = '/auth/sign-in'
    return 'Unauthorized'
  }
}

export const isAnonymousUser = async (ctx: any) => {
  const { cookie, set } = ctx
  const result = await checkAccessToken(cookie)
  if (!result.user) {
    if (!cookie.anon_user.value) {
      const res = await setAnonymousSessionCookie(cookie)
      if (res.error) {
        return 'Unauthorized'
      }
    }
  }
}
