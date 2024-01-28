import { Elysia } from 'elysia'
import { Header } from '@/components/header/Header.tsx'
import { Layout } from '@/components/Layout.tsx'

export const initHtmx = (app: Elysia): Elysia =>
  app.onAfterHandle(async ({ path, headers, response, set, cookie }) => {
    if (path.startsWith('/api')) return undefined
    if (path.includes('/public')) return undefined

    const isHtmx = headers['hx-request']
    if (isHtmx == 'true') {
      const currentUrl = headers['hx-current-url']
      // when moving from pages without a header present add a header
      if (
        currentUrl &&
        (currentUrl.includes('/q/') || currentUrl.includes('/present/'))
      ) {
        return (
          <>
            <Header>
              <main class="bg-base-100 text-base-content">
                {response as JSX.Element}
              </main>
            </Header>
          </>
        )
      }
      return undefined
    }
    if (!response) return undefined
    set.headers['content-type'] = 'text/html'

    if (
      path.includes('/auth') ||
      path.includes('/q/') ||
      path.includes('/present/')
    ) {
      return <Layout>{response as JSX.Element} </Layout>
    }

    // const authResult = await checkAccessToken(cookie)

    return (
      <Layout>
        {/*<Header user={authResult.user} />*/}
        <Header>
          <main class="bg-base-100 text-base-content">
            {response as JSX.Element}
          </main>
        </Header>
      </Layout>
    )
  })
