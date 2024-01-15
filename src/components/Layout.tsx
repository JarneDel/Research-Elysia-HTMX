import { Html } from '@elysiajs/html'

export interface LayoutProps {
  title?: string
  children?: Html.Children
}

export const Layout = (props: LayoutProps) => {
  const { title = 'elysia-kickstart' } = props
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
          <script src="/public/htmx@1.9.10.min.js"></script>
          <script src="/public/htmx-ws.js"></script>

          <script defer src="/public/useTheme.js" />
          <script>htmx.config.globalViewTransitions = true;</script>
          <link href="/public/globals.css" rel="stylesheet" />
        </head>
        <body>{props.children}</body>
      </html>
    )
  )
}
