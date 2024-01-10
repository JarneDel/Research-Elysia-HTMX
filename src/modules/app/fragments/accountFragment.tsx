import { Elysia } from 'elysia'
import { Menu } from '@/components/Header.tsx'

export const accountFragment = (app: Elysia) =>
  app
    .get(
      '/account',
      ({ set }) => {
        set.headers['Cache-Control'] = 'public, max-age=604800'
        const links = [
          {
            name: 'Create Quiz',
            href: '/quiz/create',
            target: 'main',
          },
          {
            name: 'Logout',
            href: '/api/auth/sign-out',
            target: 'body',
          },
        ]
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
              {links.map((link, index) => (
                <li>
                  <a
                    hx-push-url="true"
                    hx-get={link.href}
                    hx-target={link.target}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )
      },
      {
        detail: {
          tags: ['Fragment', 'Menu'],
          description:
            'This fragment is used to render the menu when the user is logged in',
        },
      },
    )
    .get(
      '/close',
      ({ set }) => {
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
      },
      {
        detail: {
          tags: ['Fragment', 'Menu'],
          description: 'used to close the menu when the user is logged in',
        },
      },
    )
