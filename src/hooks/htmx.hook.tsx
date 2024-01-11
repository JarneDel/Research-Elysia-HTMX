import { Elysia } from 'elysia'
import { Header } from '@/components/header/Header.tsx'
import { Layout } from '@/components/Layout.tsx'
import { checkAccessToken } from '@/libs/auth.ts'

export const initHtmx = (app: Elysia): Elysia =>
  app.onAfterHandle(async ({ path, headers, response, set, cookie }) => {
    if (path.startsWith('/api')) return undefined
    if (path.includes('/public')) return undefined

    const isHtmx = headers['hx-request']
    if (isHtmx == 'true') return undefined
    if (!response) return undefined
    set.headers['content-type'] = 'text/html'
    console.log('wrapping with layout,', path)

    if (path.includes('/auth')) {
      return <Layout>{response as JSX.Element} </Layout>
    }

    const authResult = await checkAccessToken(cookie)

    return (
      <Layout>
        <Header user={authResult.user} />
        <main class="bg-base-100 text-base-content">
          {response as JSX.Element}
        </main>
      </Layout>
    )
  })
