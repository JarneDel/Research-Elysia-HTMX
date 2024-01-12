import { Elysia } from 'elysia'
import { checkAccessToken } from '@/libs/auth.ts'
import { setAnonymousSessionCookie } from '@/libs/publicAuth.ts'

export const authen = (app: Elysia) =>
  app.derive(async ({ cookie, path, set }) => {
    if (path.startsWith('/auth')) return
    if (path.startsWith('/public')) return

    const cleanedPath = path.split('?')[0]
    console.log({ cleanedPath })

    console.log('authen middleware', path)

    const result = await checkAccessToken(cookie)
    console.log(result.user)
    if (!result.user) {
      console.log('trying anon')
      if (
        publicRoutes.includes(cleanedPath!) ||
        publicRoutesStartsWith.some(route => cleanedPath!.startsWith(route))
      ) {
        if (!cookie.anon_user?.value) {
          const res = await setAnonymousSessionCookie(cookie)
          if (res.data) return
        } else return
      }
    }

    if (result.error) {
      set.headers['HX-Redirect'] = '/auth/sign-in'
      set.redirect = '/auth/sign-in'
      console.log({ result })
      return
    }
    return
  })

const publicRoutes = ['/', '/hello']
const publicRoutesStartsWith: string[] = []
