import { Elysia, t } from 'elysia'
import { supabase } from '@/libs'
import { checkAccessToken } from '@/libs/auth.ts'

export const wsQuiz = (app: Elysia) =>
  app.ws('/ws', {
    body: t.Object(
      {
        quizId: t.Optional(t.String()),
        setUsername: t.Optional(t.String()),
        HEADERS: t.Optional(t.Object({}, { additionalProperties: true })),
      },
      {
        additionalProperties: true,
      },
    ),

    open: ws => {
      console.log('websocket opened')
    },
    message: (ws, message) => {
      const cookie = ws.data.cookie
      console.log('websocket message', message, cookie)

      if (message['setUsername']) {
        handleSetUsername(ws, message['setUsername']).then(r => {
          console.log(r)
          if (message.quizId) {
            ws.subscribe(message.quizId)
            ws.publish(
              message.quizId,
              <>
                <div id="user_joined_id" safe>
                  {r?.username}
                </div>
              </>,
            )
          }
        })
      }
    },
  })

const handleSetUsername = async (ws: any, username: string) => {
  const user = await anyAuth(ws.data.cookie)
  if (user.type === 'unauthorized') {
    return
  }

  console.log(user.type, user.userId)

  // check if user exists
  const { data: userData, error } = await supabase
    .from('user_detail')
    .select('id, username')
    .eq(user.type === 'authenticated' ? 'user_id' : 'anon_user_id', user.userId)
    .single()

  if (error && error.code !== 'PGRST116') console.info(error)

  const { data: usernameData, error: usernameError } = await supabase
    .from('user_detail')
    .upsert({
      id: userData?.id,
      username,
      anon_user_id: user.type === 'anonymous' ? user.userId : null,
      user_id: user.type === 'authenticated' ? user.userId : null,
    })
    .select('id, username')
    .single()

  if (usernameError) {
    console.error(usernameError)
    return
  }
  return usernameData
}

const anyAuth = async (
  cookie: any,
): Promise<{
  userId?: string
  type: 'anonymous' | 'authenticated' | 'unauthorized'
}> => {
  if (!cookie.refresh_token) {
    if (cookie['anon_user'].value) {
      return {
        userId: cookie['anon_user'].value,
        type: 'anonymous',
      }
    }
  }

  const result = await checkAccessToken(cookie)
  if (result.error) {
    if (cookie['anon_user'].value) {
      return {
        userId: cookie['anon_user'].value,
        type: 'anonymous',
      }
    } else {
      return {
        type: 'unauthorized',
      }
    }
  }
  return {
    userId: result.user?.id,
    type: result.user ? 'authenticated' : 'unauthorized',
  }
}
