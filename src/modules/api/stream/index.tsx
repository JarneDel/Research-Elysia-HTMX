import { Elysia, t } from 'elysia'

const account_identifier = process.env.account_identifier
const cloudflare_api_key = process.env.cloudflare_api_key
const cloudflare_email = process.env.cloudflare_email

export const stream = (app: Elysia) =>
  app.group('/stream', app =>
    app.post(
      '/toggle',
      async ctx => {
        // if stop streaming: remove stream from database
      },
      {
        body: t.Object({
          stream: t.Optional(t.String({ default: 'off' })),
        }),
      },
    ),
  )
