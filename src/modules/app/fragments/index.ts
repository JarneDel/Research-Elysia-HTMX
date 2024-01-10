import { Elysia } from 'elysia'
import { accountFragment } from '@/modules/app/fragments/accountFragment.tsx'
import { quiz } from '@/modules/app/fragments/quiz.fragment.ts.tsx'

export const fragments = (app: Elysia) =>
  app.group('/fragment', app =>
    app
      .derive(async ({ path, set }) => {
        set.headers['Cache-Control'] = 'public, max-age=604800, immutable'
      })
      .use(accountFragment)
      .use(quiz),
  )
