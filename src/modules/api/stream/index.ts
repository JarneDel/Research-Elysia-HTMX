import { Elysia } from 'elysia'

const account_identifier = process.env.account_identifier
const cloudflare_api_key = process.env.cloudflare_api_key
const cloudflare_email = process.env.cloudflare_email

console.log(account_identifier, cloudflare_api_key, cloudflare_email)

export const stream = (app: Elysia) =>
  app.group('/stream', app =>
    app.get('/credentials', async ctx => {
      console.log('credentials')
      const result = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${account_identifier}/stream/live_inputs`,
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + cloudflare_api_key,
          },
        },
      )
      console.log(result)
      const json = await result.json()
      return json
    }),
  )
