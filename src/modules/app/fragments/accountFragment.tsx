import { Elysia } from 'elysia'
import { Menu } from '@/components/Header.tsx'

export const accountFragment = (app: Elysia) =>
  app
    .get('/fragment/account', ({ set }) => {
      set.headers['Cache-Control'] = 'public, max-age=604800'
      return (
        <>
          <button
            class="btn btn-square btn-ghost"
            hx-trigger="click"
            hx-get="/fragment/close"
            hx-target="#menu"
            hx-swap="innerHTML"
          >
            <Menu />
          </button>
          <ul class="menu bg-base-200 w-56 rounded-box absolute top-14 right-0">
            <li>
              <a
                hx-push-url="true"
                hx-get="/api/auth/sign-out"
                hx-target="body"
              >
                logout
              </a>
            </li>
            <li>
              <a hx-get="/quiz/create" hx-target="main" hx-push-url="true">
                Create Quiz
              </a>
            </li>
          </ul>
        </>
      )
    })
    .get('/fragment/close', ({ set }) => {
      set.headers['Cache-Control'] = 'public, max-age=604800'
      return (
        <>
          <button
            class="btn btn-square btn-ghost"
            hx-trigger="click"
            hx-get="/fragment/account"
            hx-target="#menu"
            hx-swap="innerHTML"
          >
            <Menu />
          </button>
        </>
      )
    })
