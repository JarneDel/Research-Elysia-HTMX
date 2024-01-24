import { PostgrestSingleResponse } from '@supabase/supabase-js'
import { Elysia, t } from 'elysia'
import ShortUniqueId from 'short-unique-id'
import { Alert } from '@/components/errors/Alerts.tsx'
import { MediaUpload } from '@/components/quiz/MediaUpload.tsx'
import { NextButton } from '@/components/quiz/PageNavigationButtons.tsx'
import { QuizCard } from '@/components/quiz/QuizCard.tsx'
import { QuizValidation } from '@/components/quiz/QuizValidation.tsx'
import { ViewMedia } from '@/components/quiz/ViewMedia.tsx'
import { AuthResult, checkAccessToken } from '@/libs/auth.ts'
import { sanitize } from '@/libs/sanitize.ts'
import { supabase } from '@/libs/supabase'
import { uploadMediaFile } from '@/repository/media.storage.ts'
import { quizWithPage, updatePageMediaUrl } from '@/repository/quiz.database.ts'
import { Cookie } from '@/types/cookie.type.ts'

export const quizEditorApi = (app: Elysia) =>
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
          // Handle user authentication (only allow logged in users)
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
        },
        app =>
          app
            .post(
              '/quiz/create',
              async ({ body, authResult: user, set }) => {
                const isLegal = body.name.length >= 4 && body.description
                if (!isLegal) {
                  return (
                    <Alert severity="error">
                      <span>
                        {body.name.length < 4 && (
                          <span>Title not long enough</span>
                        )}
                        {body.description.length == 0 && (
                          <span>You must provide a description</span>
                        )}
                      </span>
                    </Alert>
                  )
                }
                const quiz = await supabase
                  .from('quiz')
                  .insert([
                    {
                      name: sanitize(body.name, 'strict'),
                      description: sanitize(body.description, 'medium'),
                      created_by: user().user?.id,
                    },
                  ])
                  .select('id')
                if (quiz.status === 201) {
                  if (!quiz.data || quiz.data.length === 0) {
                    return (
                      <Alert severity="error">
                        <span safe>Something went wrong: {quiz.status}</span>
                      </Alert>
                    )
                  }
                  set.headers['HX-Redirect'] =
                    '/quiz/' + quiz.data[0]?.id + '/edit'
                  set.headers['HX-Push-URL'] = 'true'
                  return
                } else {
                  return (
                    <Alert severity="error">
                      <span safe>Something went wrong: {quiz.status}</span>
                    </Alert>
                  )
                }
              },
              {
                body: t.Object({
                  name: t.String(),
                  description: t.String(),
                }),
                detail: {
                  description: 'Create a new quiz',
                  tags: ['Quiz'],
                },
              },
            )
            .put(
              '/quiz/:id/change-name',
              async ({ body, params, set, authResult }) => {
                const { user, error } = authResult()
                const {
                  data,
                  error: dbError,
                  count,
                } = await supabase
                  .from('quiz')
                  .update({ name: sanitize(body.value, 'strict') })
                  .eq('id', params.id)
                  .eq('created_by', user?.id)
                if (dbError) {
                  // todo: htmx error handling
                  set.status = 500
                  return
                }
                if (count === 0) {
                  set.status = 404
                  return
                }
              },
              {
                body: t.Object({
                  value: t.String({
                    // NO HTML tags
                    pattern: '^[^<>]*$',
                    error:
                      '<div class="alert alert-error">Invalid characters</div>',
                  }),
                }),
                detail: {
                  description: 'Change name of a quiz',
                  tags: ['Quiz'],
                },
              },
            )
            .post(
              '/quiz/:id/change-answers/page/:page',
              async ({ body, params, authResult }) => {
                // todo: error handling
                const { user } = authResult()
                if (!user) return
                const { data } = await quizWithPage(
                  params.id,
                  user.id,
                  params.page,
                )

                console.log(data, 'data')

                if (!data) {
                  return (
                    <Alert severity="error">
                      <span>Something went wrong</span>
                    </Alert>
                  )
                }
                const page = data.page[0]
                console.log(page, 'page')

                let result: PostgrestSingleResponse<any>

                if (!page) {
                  result = await supabase
                    .from('page')
                    .insert({
                      quiz: data.id,
                      page: params.page,
                      // ARRAY INT_2
                      correct_answers: calculateCorrectAnswers(body),
                      // ARRAY TEXT
                      answers: getAnswers(body),
                      question: sanitize(body.title, 'strict'),
                    })
                    .select()
                    .single()
                } else {
                  // update or create page
                  result = await supabase
                    .from('page')
                    .upsert({
                      id: page.id,
                      quiz: data.id,
                      page: params.page,
                      // ARRAY INT_2
                      correct_answers: calculateCorrectAnswers(body),
                      // ARRAY TEXT
                      answers: getAnswers(body),
                      question: sanitize(body.title, 'strict'),
                    })
                    .select()
                    .single()
                }
                console.log(result)

                const answerCountNoEmpty = result.data.answers.filter(
                  (answer: string) => answer !== '',
                ).length

                return (
                  <>
                    <NextButton
                      hx-swap-oob="outerHTML"
                      quizId={params.id}
                      page={result.data}
                      pageNumber={params.page}
                    />
                    <QuizValidation
                      hx-swap-oob="outerHTML"
                      answers={result.data.answers}
                      correct_answers={result.data.correct_answers}
                      question={result.data.question}
                    />
                  </>
                )
              },
              {
                detail: {
                  description: 'Change answers of a quiz',
                  tags: ['Quiz'],
                },
                body: t.Object({
                  ...createBody(),
                  title: t.Optional(t.String()),
                }),
              },
            )
            .post(
              '/quiz/:id/upload_media/:page',
              async ({ body, params, authResult: account }) => {
                console.log('uploading media')
                const file = body.media

                // check ownership of quiz
                const result = await supabase
                  .from('quiz')
                  .select()
                  .eq('id', params.id)
                  .eq('created_by', account().user?.id)
                  .single()
                if (!result.data) {
                  console.log('not authorized')
                  // todo: return htmx error
                  return {
                    status: 401,
                    message: 'Unauthorized',
                  }
                }

                const { error, publicUrl } = await uploadMediaFile(
                  file,
                  params.id + '/' + params.page,
                )
                console.log(error, 'error')

                console.log(publicUrl, 'publicUrl')
                // save media url to page
                // todo: err handling
                await updatePageMediaUrl(params.id, params.page, publicUrl!)

                return (
                  <div
                    id="media"
                    class="container max-w-2xl mx-auto border-accent rounded-md p-2 mb-3"
                  >
                    <ViewMedia
                      quizId={params.id}
                      pageNumber={params.page}
                      mediaURL={publicUrl!}
                      modalId="new-media-modal"
                      allowDelete={true}
                    />
                  </div>
                )
              },
              {
                body: t.Object({
                  media: t.File({
                    maxSize: 1024 * 1024 * 5,
                    accept: ['image/*'],
                  }),
                }),
                detail: {
                  description: 'Upload media to a quiz page',
                  tags: ['Quiz'],
                },
                type: 'multipart/form-data',
              },
            )
            .delete(
              '/quiz/:id/media/:page',
              async ({ params, authResult }) => {
                const user = authResult()
                if (!user.user) {
                  return <Alert severity="error">Unauthorized</Alert>
                }
                const page = await quizWithPage(
                  params.id,
                  user.user?.id,
                  params.page,
                )
                if (!page.data) {
                  return (
                    <Alert severity="error">Quiz question does not exist</Alert>
                  )
                }
                if (page.data.page[0]?.media_url === null) {
                  return <Alert severity="warning">No media to delete</Alert>
                }

                const { error } = await supabase
                  .from('page')
                  .update({ media_url: null })
                  .eq('id', page.data.page[0]?.id)

                if (error) {
                  return (
                    <div class="alert alert-error">
                      <span>Something went wrong: {error.message}</span>
                    </div>
                  )
                }

                return (
                  <>
                    <Alert severity="warning" class="py-2 alert-warning">
                      Media deleted
                    </Alert>
                    <MediaUpload
                      postURL={`/api/quiz/${page.data.id}/upload_media/${params.page}`}
                      progressID="progress"
                      inputID="media-input"
                      formID="media-form"
                      target="#media"
                    />
                  </>
                )
              },
              {
                cookie: Cookie,
                detail: {
                  description: 'remove media from a quiz page',
                  tags: ['Quiz'],
                },
              },
            )
            .delete('/quiz/:id', async ({ params, set, authResult }) => {
              const user = authResult()
              if (!user.user) {
                return <Alert severity="error">Unauthorized</Alert>
              }
              const { error: quizError } = await supabase
                .from('quiz')
                .delete()
                .eq('id', params.id)
                .eq('created_by', user.user?.id)
              if (quizError) {
                return <Alert severity="error">Something went wrong</Alert>
              }
              set.headers['HX-Redirect'] = '/quiz/my'
            })
            .get('/quiz/:id/start', async ({ params, authResult, set }) => {
              const user = authResult()
              if (!user.user) {
                return <Alert severity="error">Unauthorized</Alert>
              }
              const { data } = await supabase
                .from('quiz')
                .select()
                .eq('id', params.id)
                .eq('created_by', user.user?.id)
                .single()

              if (data.isDraft) {
                return <Alert severity="error">Quiz is in draft</Alert>
              }

              const id = generateShortId()

              const result = await supabase.from('active_quiz').insert({
                id,
                quiz_id: data?.id,
                user_id: user.user?.id,
              })
              if (result.error) {
                return <Alert severity="error">Something went wrong</Alert>
              }
              set.headers['HX-Redirect'] = '/present/' + id
            })
            .get(
              '/quiz/:id/publish',
              async ({ params, authResult, headers }) => {
                console.log('publishing quiz')
                const { data, error } = await supabase
                  .from('quiz')
                  .update({
                    isDraft: false,
                  })
                  .eq('id', params.id)
                  .eq('created_by', authResult().user?.id)
                  .select()
                  .single()

                const { data: nowPresenting } = await supabase
                  .from('active_quiz')
                  .select()
                  .eq('user_id', authResult().user?.id)
                  .eq('quiz_id', params.id)

                console.log(headers['hx-current-url'], 'current url')
                if (headers['hx-current-url'].endsWith('/edit')) {
                  return (
                    <>
                      <a
                        class="btn btn-primary"
                        hx-push-url="true"
                        hx-get={`/api/quiz/${params.id}/start`}
                        href={`/api/quiz/${params.id}/start`}
                      >
                        Present quiz
                      </a>
                    </>
                  )
                }

                return (
                  <QuizCard quiz={data} nowPresenting={nowPresenting || []} />
                )
              },
              {
                headers: t.Object({
                  'hx-current-url': t.String(),
                }),
                detail: {
                  description: 'Publish a quiz',
                  tags: ['Quiz'],
                },
              },
            ),
      ),
  )

const createBody = (max = 6) => {
  const answerFields: { [key: string]: any } = {}
  for (let i = 0; i < max; i++) {
    answerFields[`answer${i}`] = t.Optional(t.String())
    answerFields[`correct-${i}`] = t.Optional(
      t.String({
        pattern: 'on|off',
      }),
    )
  }
  return answerFields
}

export const calculateCorrectAnswers = (body: any): number[] => {
  console.log('calculating correct answers')
  const correctAnswers: number[] = []
  for (const [key, value] of Object.entries(body)) {
    if (key.includes('correct-') && value === 'on') {
      const index = parseInt(key.replace('correct-', ''))
      correctAnswers.push(index)
    }
  }
  return correctAnswers
}

const getAnswers = (body: any): string[] => {
  const answers: string[] = []
  for (const [key, value] of Object.entries(body)) {
    if (key.includes('answer')) {
      const index = parseInt(key.replace('answer', ''))
      if (typeof value === 'string') {
        answers[index] = sanitize(value, 'medium')
      }
    }
  }
  return answers
}

export const generateShortId = () => {
  const shortId = new ShortUniqueId({
    length: 6,
    dictionary: 'alphanum_upper',
  })
  return shortId.rnd(6)
}
