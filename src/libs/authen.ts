import { Elysia } from 'elysia'
import { checkAccessToken } from '@/libs/auth.ts'
import { setAnonymousSessionCookie } from '@/libs/publicAuth.ts'
import { Cookie } from '@/types/cookie.type.ts'

export const authen = (app: Elysia) =>
  app
    // .derive(async ({ cookie, path, set }) => {
    //   if (path.startsWith('/auth')) return
    //   if (path.startsWith('/public')) return
    //
    //   const cleanedPath = path.split('?')[0]
    //   console.log({ cleanedPath })
    //
    //   console.log('authen middleware', path)
    //
    //   const result = await checkAccessToken(cookie)
    //   console.log(result.user)
    //   if (!result.user) {
    //     console.log('trying anon')
    //     if (
    //       publicRoutes.includes(cleanedPath!) ||
    //       publicRoutesStartsWith.some(route => cleanedPath!.startsWith(route))
    //     ) {
    //       if (!cookie.anon_user?.value) {
    //         const res = await setAnonymousSessionCookie(cookie)
    //         if (res.data) return
    //       } else return
    //     }
    //   }
    //
    //   if (result.error) {
    //     console.log('redirecting to /auth/sign-in')
    //     set.headers['HX-Redirect'] = '/auth/sign-in'
    //     set.redirect = '/auth/sign-in'
    //     set.status = 'Unauthorized'
    //     console.log({ result })
    //     return { error: result.error }
    //   }
    //   return
    // })
    .guard(
      {
        beforeHandle: isUser,
        cookie: Cookie,
      },
      app => app.get('/test', () => 'Test complete'),
    )

export const isUser = async (ctx: any) => {
  const { cookie, set } = ctx
  const result = await checkAccessToken(cookie)
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
