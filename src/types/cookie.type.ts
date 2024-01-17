import { t } from 'elysia'

export const Cookie = t.Object(
  {
    // refresh_token: t.Optional(t.String()),
    // access_token: t.Optional(t.String()),
    // anon_user: t.Optional(t.String()),
  },
  {
    additionalProperties: true,
  },
)
