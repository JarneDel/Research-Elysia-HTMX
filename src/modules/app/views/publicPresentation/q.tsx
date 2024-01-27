import { Elysia, t } from 'elysia'
import { Success } from '@/components/icons/StatusIcons.tsx'
import { ReloadStream } from '@/components/input/ReloadStream.tsx'
import { WatchStreamToggle } from '@/components/input/WatchStreamToggle.tsx'
import { ThemeSwitcher } from '@/components/states/Theme.tsx'
import { MovableResizableDiv } from '@/components/video/MovableResizableDiv.tsx'
import { supabase } from '@/libs'
import { AuthResult, checkAccessToken } from '@/libs/auth.ts'
import { setAnonymousSessionCookie } from '@/libs/publicAuth.ts'
import { activeQuizDetails } from '@/repository/activeQuiz.database.ts'
import { fixOneToOne } from '@/repository/databaseArrayFix.ts'
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
                const stream = fixOneToOne(data.stream)
                console.log(data)
                if (!stream) console.warn('No stream found')

                return (
                  <>
                    <div hx-swap-oob id="main-header"></div>
                    <div hx-ext="ws" ws-connect="/ws">
                      <div id="game-header" class="navbar bg-base-200/70 px-6">
                        <div
                          id="game-header-start"
                          class="navbar-start flex flex-row gap-4"
                        >
                          <h1 class="text-lg font-bold">
                            <a href="/" hx-boost hx-target="body">
                              QuizX
                            </a>
                          </h1>
                          <div class="max-sm:hidden">{quiz?.name}</div>
                          <div class="sm:hidden">{data.id}</div>
                        </div>
                        <div
                          id="game-header-center"
                          class="navbar-center max-sm:hidden"
                        >
                          {data.id}
                        </div>
                        <div
                          id="game-header-end"
                          class="navbar-end flex flex-row gap-4"
                        >
                          <ThemeSwitcher />
                          <div
                            id="streaming-controls"
                            class="flex flex-row items-center"
                          >
                            {/*  todo: video player controls (mute and show)*/}
                            <ReloadStream />
                            <WatchStreamToggle />
                          </div>
                        </div>
                      </div>

                      <MovableResizableDiv id="video">
                        <div class="loading" id="video-loading-indicator"></div>
                        {/*//@ts-expect-error muted does exist on video tag*/}
                        <video id="output-video" autoplay controls muted />
                      </MovableResizableDiv>
                      <div id="lobby" class="double-header-height">
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
                            <label class="form-control w-full max-w-xs">
                              <div class="label">
                                <div class="label-text">
                                  Enter your username
                                </div>
                              </div>
                              <input
                                name="setUsername"
                                class="input input-primary"
                                placeholder="Username"
                                type="text"
                                value={username ?? undefined}
                              />
                              <div class="label">
                                <div class="label-text-alt"></div>
                                <div class="label-text-alt">
                                  Enter username to join quiz
                                </div>
                              </div>
                            </label>
                            <div class="tooltip" data-tip="join quiz">
                              <button
                                type="submit"
                                class=" ml-2 btn btn-success"
                              >
                                <Success />
                              </button>
                            </div>
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
                    {stream && (
                      <script>
                        {`
                    streamOptions.playbackUrl = '${stream.playback}'
                    streamOptions.streamId = '${stream.stream_id}'
                  `}
                      </script>
                    )}
                  </>
                )
              },
              {
                detail: {
                  description: 'Quiz page for users to join quiz',
                  tags: ['join', 'user'],
                },
                params: t.Object({
                  id: t.String(),
                }),
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
