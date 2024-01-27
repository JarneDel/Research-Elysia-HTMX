import { Elysia, t } from 'elysia'
import QRCode from 'qrcode'
import { PresentationEntryPoint } from '@/components/presentation/PresentationEntryPoint.tsx'
import { supabase } from '@/libs'
import { AuthResult, checkAccessToken } from '@/libs/auth.ts'
import { fixOneToOne } from '@/repository/databaseArrayFix.ts'
import { StreamRepository } from '@/repository/stream.repository.ts'
import { Cookie } from '@/types/cookie.type.ts'

export const quizPresentation = (app: Elysia) =>
  app.group('/present', app =>
    app.guard({}, app =>
      app
        .derive(ctx => {
          let result: AuthResult = {}
          return {
            async checkAccessToken() {
              result = await checkAccessToken(ctx.cookie)
              return result
            },
            authResult() {
              return result
            },
          }
        })
        .guard(
          {
            beforeHandle: async ctx => {
              const { set } = ctx
              const result = await ctx.checkAccessToken()
              if (result.error) {
                set.headers['HX-Redirect'] = '/auth/sign-in'
                set.redirect = '/auth/sign-in'
                return 'Unauthorized'
              }
            },
            cookie: Cookie,
            headers: t.Object({
              'HX-Request': t.Optional(t.String()),
            }),
            detail: {
              tags: ['present'],
            },
          },
          app =>
            app.get('/:id', async ({ params, authResult }) => {
              const user = authResult().user
              if (!user) return

              const { data, error } = await supabase
                .from('active_quiz')
                .select(
                  `
                id,
                created_at,
                current_page_id,
                quiz_id (id, name),
                user_id
              `,
                )
                .eq('id', params.id)
                .eq('user_id', authResult().user?.id)
                .single()

              if (error || !data) {
                return
              }

              const quiz = fixOneToOne(data.quiz_id)

              const url = process.env.PUBLIC_URL || 'http://localhost:3000'

              const qrCode = await QRCode.toDataURL(url + '/q/' + params.id, {
                errorCorrectionLevel: 'H',
              })

              const streamRepository = new StreamRepository(params.id)
              await streamRepository.createStreamCredentialForActiveQuiz()

              return (
                <>
                  <script>
                    {`
                    streamOptions.streamUrl = '${streamRepository.recordingUrl}'
                    streamOptions.streamId = '${streamRepository.streamId}'
                  `}
                  </script>
                  <PresentationEntryPoint
                    quiz={quiz}
                    activeQuiz={data}
                    userId={user.id}
                    qrCode={qrCode}
                  ></PresentationEntryPoint>
                </>
              )
            }),
        ),
    ),
  )
