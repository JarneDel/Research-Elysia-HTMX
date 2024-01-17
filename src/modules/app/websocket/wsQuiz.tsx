import { Elysia, RouteSchema, t } from 'elysia'
import { getQuestion } from '@/components/presentation/Question.tsx'
import {
  Username,
  UsernameContainer,
} from '@/components/presentation/Username.tsx'
import { supabase } from '@/libs'
import { checkAccessToken } from '@/libs/auth.ts'

export const wsQuiz = (app: Elysia) =>
  app.ws('/ws', {
    body: t.Object(
      {
        quizId: t.Optional(t.String()),
        presentQuizId: t.Optional(t.String()),
        setUsername: t.Optional(t.String()),
        'start-presenting': t.Optional(t.String()),
        HEADERS: t.Object(
          {
            'HX-Current-URL': t.String(),
          },
          { additionalProperties: true },
        ),
      },
      {
        additionalProperties: true,
      },
    ),

    open: async ws => {},
    // REMEMBER YOU CAN'T PUBLISH TO YOURSELF
    message: async (ws, message) => {
      console.log(message)
      const user = await anyAuth(ws.data.cookie)
      await handleSetUsernameMessage(ws, user, message)
      if (message['presentQuizId']) {
        const quizId = getQuizId(message.HEADERS['HX-Current-URL'])
        if (!quizId) return
        ws.subscribe(quizId)
      }

      if (message['start-presenting'] == '') {
        console.log('start-presenting')
        const quizId = getQuizId(message.HEADERS['HX-Current-URL'])
        if (!quizId || !user.userId || user.type !== 'authenticated') return
        ws.send(await getQuestion(quizId, 1, user.userId))

        // ws.send() // send page 1 template
      }
    },
  })

const handleSetUsername = async (user: anyAuthResult, username: string) => {
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

export interface anyAuthResult {
  userId?: string
  type: 'anonymous' | 'authenticated' | 'unauthorized'
}

const anyAuth = async (cookie: any): Promise<anyAuthResult> => {
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

const getQuizId = (url: string): string | undefined => {
  const urlObj = new URL(url)
  const pathname = urlObj.pathname
  const parts = pathname.split('/')
  return parts.pop()
}

const publishAndSend = (
  ws: any,
  message: RouteSchema['response'],
  channel: string,
) => {
  console.log('publishing', channel, message)
  ws.publish(channel, message)
  ws.send(message)
}

const handleSetUsernameMessage = async (
  ws: any,
  user: anyAuthResult,
  message: any,
) => {
  if (message['setUsername']) {
    const result = await handleSetUsername(user, message['setUsername'])
    const quizId = getQuizId(message.HEADERS['HX-Current-URL'])
    if (!quizId) return
    ws.subscribe(quizId)

    publishAndSend(
      ws,
      <>
        <UsernameContainer id="connected-users" hx-swap-oob="beforeend">
          <Username username={result?.username} />
        </UsernameContainer>
      </>,
      quizId,
    )
  }
}
