import { Elysia, t } from 'elysia'
import { Success } from '@/components/icons/StatusIcons.tsx'
import { checkAccessToken } from '@/libs/auth.ts'
import { updatePageMediaUrl } from '@/libs/quiz.database.ts'
import { supabase, uploadMediaFile } from '@/libs/supabase'
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
              <>
                <div class="alert alert-error">
                  <span>Title not long enough</span>
                </div>
              </>
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
                  <>
                    <div class="alert alert-error">
                      <span>Something went wrong: {result.status}</span>
                    </div>
                  </>
                )
              }
              return (
                <>
                  <div
                    class="alert alert-success"
                    hx-trigger="load delay:1s once"
                    hx-get={'/quiz/' + result.data[0]?.id}
                  >
                    <Success />
                    <span>Quiz created, redirecting..</span>
                  </div>
                </>
              )
            } else {
              return (
                <>
                  <div class="alert alert-error">
                    <span>Something went wrong: {result.status}</span>
                  </div>
                </>
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
          <div class="container max-w-2xl mx-auto border-accent border-2 rounded-md p-2 mb-3">
            <img alt={file.name} src={publicUrl} />)
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
