import { Elysia, t } from 'elysia'
import ShortUniqueId from 'short-unique-id'
import { Alert } from '@/components/errors/Alerts.tsx'
import { Success } from '@/components/icons/StatusIcons.tsx'
import { MediaUpload } from '@/components/quiz/MediaUpload.tsx'
import { ViewMedia } from '@/components/quiz/ViewMedia.tsx'
import { checkAccessToken } from '@/libs/auth.ts'
import { supabase } from '@/libs/supabase'
import { uploadMediaFile } from '@/repository/media.storage.ts'
import { quizWithPage, updatePageMediaUrl } from '@/repository/quiz.database.ts'
import { Cookie } from '@/types/cookie.type.ts'

export const quiz = (app: Elysia) =>
  app
    .post(
      '/quiz/create',
      async ({ body, cookie, headers, set }) => {
        const isHtmx = headers['hx-request'] == 'true'
        const isLegal = body.name.length >= 4 && body.description
        if (!isLegal) {
          if (isHtmx) {
            return (
              <Alert severity="error">
                <span>Title not long enough</span>
              </Alert>
            )
          }
          return {
            status: 200,
            message: 'Title not long enough',
          }
        }
        console.log('getting user')
        const user = await checkAccessToken(cookie)
        console.log(user.user, 'user id')

        if (user.user) {
          const result = await supabase
            .from('quiz')
            .insert([
              {
                name: body.name,
                description: body.description,
                created_by: user.user.id,
              },
            ])
            .select('id')
          if (isHtmx) {
            if (result.status === 201) {
              if (!result.data || result.data.length === 0) {
                return (
                  <Alert severity="error">
                    <span>Something went wrong: {result.status}</span>
                  </Alert>
                )
              }
              return (
                <>
                  <div
                    class="alert alert-success"
                    hx-trigger="load delay:1s once"
                    hx-get={'/quiz/' + result.data[0]?.id + '/edit'}
                  >
                    <Success />
                    <span>Quiz created, redirecting..</span>
                  </div>
                </>
              )
            } else {
              return (
                <Alert severity="error">
                  <span>Something went wrong: {result.status}</span>
                </Alert>
              )
            }
          }
          if (result.status === 201) {
            set.status = 201
            return
          }
        } else {
          set.status = 401
          return
        }
      },
      {
        body: t.Object({
          name: t.String(),
          description: t.String(),
        }),
        cookie: Cookie,
        detail: {
          description: 'Create a new quiz',
          tags: ['Quiz'],
        },
        headers: t.Object({
          'hx-request': t.Optional(t.String()),
        }),
      },
    )
    .put(
      '/quiz/:id/change-name',
      async ({ body, cookie, params, set }) => {
        const { user, error } = await checkAccessToken(cookie)
        console.log(body, 'body')
        if (error) {
          set.status = 401
          return
        }
        const {
          data,
          error: dbError,
          count,
        } = await supabase
          .from('quiz')
          .update({ name: body.value })
          .eq('id', params.id)
          .eq('created_by', user?.id)
        if (dbError) {
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
          value: t.String(),
        }),
        cookie: Cookie,
        detail: {
          description: 'Change name of a quiz',
          tags: ['Quiz'],
        },
      },
    )
    .post(
      '/quiz/:id/change-answers/page/:page',
      async ({ body, params, cookie }) => {
        // todo: error handling
        console.log(body)
        const { user, error } = await checkAccessToken(cookie)
        const { data: quizId, error: quizError } = await supabase
          .from('quiz')
          .select()
          .eq('id', params.id)
          .eq('created_by', user?.id)
          .single()

        // check if page exists
        const { data: page, error: pageError } = await supabase
          .from('page')
          .select()
          .eq('quiz', quizId.id)
          .eq('page', params.page)
          .single()
        console.log(page.id, 'pagmedia_urle id')

        // update or create page
        const result = await supabase
          .from('page')
          .upsert({
            id: page?.id,
            quiz: quizId.id,
            page: params.page,
            // ARRAY INT_2
            correct_answers: calculateCorrectAnswers(body),
            // ARRAY TEXT
            answers: getAnswers(body),
            question: body.title,
          })
          .select('id')
        console.log(result.status)
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
        cookie: Cookie,
      },
    )
    .post(
      '/quiz/:id/upload_media/:page',
      async ({ body, params, cookie }) => {
        console.log('uploading media')
        const file = body.media

        const account = await checkAccessToken(cookie)
        // check ownership of quiz
        const result = await supabase
          .from('quiz')
          .select()
          .eq('id', params.id)
          .eq('created_by', account.user?.id)
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
            class="container max-w-2xl mx-auto border-accent border-2 rounded-md p-2 mb-3"
          >
            <ViewMedia
              quizId={params.id}
              page={params.page}
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
        cookie: Cookie,
        detail: {
          description: 'Upload media to a quiz page',
          tags: ['Quiz'],
        },
        type: 'multipart/form-data',
      },
    )
    .delete(
      '/quiz/:id/media/:page',
      async ({ params, cookie }) => {
        const user = await checkAccessToken(cookie)
        if (!user.user) {
          return <Alert severity="error">Unauthorized</Alert>
        }
        const page = await quizWithPage(params.id, user.user?.id, params.page)
        if (!page.data) {
          return <Alert severity="error">Quiz question does not exist</Alert>
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
    .delete('/quiz/:id', async ({ params, cookie, set }) => {
      const user = await checkAccessToken(cookie)
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
    .get('/quiz/:id/start', async ({ params, cookie, set }) => {
      const user = await checkAccessToken(cookie)
      if (!user.user) {
        return <Alert severity="error">Unauthorized</Alert>
      }
      const { data, error } = await supabase
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
      set.headers['HX-Redirect'] = '/q/present/'
    })

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
        answers[index] = value
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
