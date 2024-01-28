import { Html } from '@elysiajs/html'

export interface LayoutProps {
  title?: string
  children?: Html.Children
}

export const Layout = (props: LayoutProps) => {
  const { title = 'QuizX' } = props
  return (
    '<!DOCTYPE html>' +
    (
      <html lang="en" class="dark">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link
            rel="icon"
            type="image/x-icon"
            href="/public/favicon.ico"
          ></link>
          <title>{title}</title>
          {/*important to load first*/}
          <script src="/public/htmx@1.9.9.min.js"></script>
          <script src="/public/htmx-ws.js"></script>
          <script src="https://unpkg.com/htmx.org/dist/ext/head-support.js"></script>
          <script src="/public/stream.js" />
          <script
            src="https://cdnjs.cloudflare.com/ajax/libs/webrtc-adapter/8.1.2/adapter.min.js"
            integrity="sha512-l40eBFtXx+ve5RryIELC3y6/OM6Nu89mLGQd7fg1C93tN6XrkC3supb+/YiD/Y+B8P37kdJjtG1MT1kOO2VzxA=="
            crossorigin="anonymous"
          ></script>

          <script src="https://cdn.jsdelivr.net/npm/theme-change@2.0.2/index.js"></script>
          <script defer src="/public/useTheme.js" />
          <link href="/public/globals.css" rel="stylesheet" />
        </head>
        <body hx-ext="head-support">{props.children}</body>
      </html>
    )
  )
}
