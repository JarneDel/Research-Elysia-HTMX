import { t } from 'elysia'

export const Cookie = t.Object({
  refresh_token: t.String(),
  access_token: t.String(),
})

export const RefreshCookie = t.Object({
  refresh_token: t.String(),
})
