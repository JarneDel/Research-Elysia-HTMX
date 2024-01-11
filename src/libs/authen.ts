import { Elysia } from 'elysia'
import { checkAccessToken } from '@/libs/auth.ts'

export const authen = (app: Elysia) =>
  app.derive(async ({ cookie, path, set }) => {
    if (path.startsWith('/auth')) return
    if (path.startsWith('/public')) return
    console.log('authen middleware', path)

    const { refresh_token } = cookie
    if (!refresh_token?.value) {
      set.headers['HX-Redirect'] = '/api/auth/sign-out'
      set.redirect = '/api/auth/sign-out'
      console.log('no refresh token')
      return
    }
    const result = await checkAccessToken(cookie)
    if (result.error) {
      set.headers['HX-Redirect'] = '/auth/sign-in'
      set.redirect = '/auth/sign-in'
      console.log({ result })
      return
    }
    return
  })
// .state('counter', 1)
// .derive(async ({ cookie, store, path, set }) => {
//   const counter = store.counter
//   const counterCookie = cookie.counter.value
//   console.log({ counter, counterCookie, path })
//   cookie.counter.value = counter
//
//   // cookie.counter.set(cookie.counter || { value: 0 })
//   store.counter += 1
// })
