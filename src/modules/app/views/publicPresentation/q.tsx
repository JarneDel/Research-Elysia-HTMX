import { Elysia, t } from 'elysia'
import { Success } from '@/components/icons/StatusIcons.tsx'
import { supabase } from '@/libs'
import { AuthResult, checkAccessToken } from '@/libs/auth.ts'
import { setAnonymousSessionCookie } from '@/libs/publicAuth.ts'
import { activeQuizDetails } from '@/repository/activeQuiz.database.ts'
import { Cookie } from '@/types/cookie.type.ts'

export const q = (app: Elysia) =>
  app.group('/q', app =>
    app.guard({}, app =>
      app
        .derive(ctx => {
          let result: AuthResult = {}
          let anonUserId: string | null = null
          return {
            async checkAccessToken() {
              result = await checkAccessToken(ctx.cookie)
              return result
            },
            async checkAnonymousUser() {
              if (ctx.cookie['anon_user']?.value) {
                anonUserId = ctx.cookie['anon_user'].value
              } else {
                const anon = await setAnonymousSessionCookie(ctx.cookie)
                anonUserId = anon.data
              }
              return anonUserId
            },
            authResult() {
              return result
            },
            anonUserResult() {
              return anonUserId
            },
          }
        })
        .guard(
          {
            async beforeHandle(ctx) {
              const result = await ctx.checkAccessToken()
              if (result.error) {
                const anon = await ctx.checkAnonymousUser()
                if (!anon) {
                  console.log('anon user not found')
                  return !result.error
                }
              }
            },
            cookie: Cookie,
            headers: t.Object({
              'HX-Request': t.Optional(t.String()),
            }),
          },
          app =>
            app.get(
              '/:id',
              async ({ params, authResult, anonUserResult }) => {
                const { data, error } = await activeQuizDetails(params.id)
                console.log(data, 'data')
                console.log(error, 'error')
                if (!data) {
                  // todo: style this
                  return <div>Quiz not found</div>
                }

                // check if quiz is array or object
                const quiz = Array.isArray(data.quiz_id)
                  ? data.quiz_id[0]
                  : data.quiz_id

                let username: string | null = null

                if (authResult().user?.id) {
                  const result = await getUsername(
                    'user_id',
                    authResult().user?.id,
                  )
                  username = result.data?.username
                } else if (anonUserResult()) {
                  const result = await getUsername('id', anonUserResult())
                  username = result.data?.username
                }

                return (
                  <div hx-ext="ws" ws-connect="/ws">
                    <div id="lobby">
                      <div class="navbar">
                        <div class="navbar-start">{quiz?.name}</div>
                        <div class="navbar-end">{data.id}</div>
                      </div>
                      <form ws-send hx-trigger="load">
                        <input type="hidden" name="connect" value={data.id} />
                      </form>

                      <div class="body grid place-items-center h-full">
                        <form
                          id="username"
                          ws-send
                          hx-include="#quiz_id"
                          class="flex flex-row justify-center items-center"
                        >
                          {/*Hidden input for adding quiz_id to request*/}
                          <input
                            type="hidden"
                            name="quizId"
                            id="quiz_id"
                            value={params.id}
                          />
                          <input
                            name="setUsername"
                            class="input input-primary"
                            type="text"
                            value={username ?? undefined}
                          />
                          {username || (
                            <button type="submit" class=" ml-2 btn btn-success">
                              <Success />
                            </button>
                          )}
                        </form>
                      </div>
                      <div class="fixed bottom-0 right-2 text-neutral-500 w-max">
                        {authResult().user?.id && (
                          <span>
                            <span class="mr-2">Logged in as</span>
                            <span class="font-bold">
                              {authResult().user?.email}
                            </span>
                          </span>
                        )}
                        {anonUserResult() && (
                          <span>
                            <span class="mr-2">Logged in as</span>
                            <span class="font-bold">{anonUserResult()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    {/*Game will be mounted here*/}
                    <div id="game"></div>
                  </div>
                )
              },
              {
                detail: {
                  description: 'Quiz page for users to join quiz',
                  tags: ['join', 'user'],
                },
              },
            ),
        ),
    ),
  )

async function getUsername(field: string, id?: string | null) {
  if (!id) return Promise.resolve({ data: null, error: 'No id provided' })
  return supabase
    .from('user_detail')
    .select('username, id')
    .eq(field, id)
    .single()
}
