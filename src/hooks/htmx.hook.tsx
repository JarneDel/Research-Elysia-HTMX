import { Elysia } from 'elysia'
import { Header } from '@/components/Header.tsx'
import { Layout } from '@/components/Layout.tsx'

export const initHtmx = (app: Elysia): Elysia =>
  app.onAfterHandle(async ({ path, headers, response, set }) => {
    if (path.startsWith('/api')) return undefined
    if (path.includes('/public')) return undefined

    let isHtmx = headers['hx-request']
    if (isHtmx == 'true') return undefined
    if (!response) return undefined
    set.headers['content-type'] = 'text/html'
    console.log('wrapping with layout,', path)

    if (path.includes('/auth')) {
      return <Layout>{response as JSX.Element} </Layout>
    }

    return (
      <Layout>
        <Header />
        {response as JSX.Element}
      </Layout>
    )
  })
