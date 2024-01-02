import { t } from 'elysia'

export const Cookie = t.Object({
  refresh_token: t.Optional(t.String()),
  access_token: t.Optional(t.String()),
})

export const RefreshCookie = t.Object({
  refresh_token: t.String(),
})
