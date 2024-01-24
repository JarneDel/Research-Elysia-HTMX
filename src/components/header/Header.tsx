import { User } from '@supabase/supabase-js'
import { HeaderMenuDropdown } from '@/components/header/HeaderMenuDropdown.tsx'
import { ThemeSwitcher } from '@/components/states/Theme.tsx'

interface props {
  user?: User
}

export const headerLinks = [
  {
    name: 'My Quizzes',
    href: '/quiz/my',
  },

  // todo make only visible when logged out
  // {
  //   name: 'Sign In',
  //   href: '/auth/sign-in',
  // },
]

export const Header = (props: props) => (
  <div class="navbar  bg-base-300" id="main-header">
    <div class="flex-none px-2 mx-2">
      <span class="text-lg font-bold">
        <a href="/">QuizX</a>
      </span>
    </div>
    <ul class="menu menu-horizontal rounded-box">
      {headerLinks.map((link, index) => (
        <li>
          <a
            class="btn btn-ghost btn-sm"
            hx-push-url="true"
            hx-get={link.href}
            hx-target="main"
            href={link.href}
          >
            {link.name}
          </a>
        </li>
      ))}
    </ul>
    <form
      class="flex-1 flex flex-row items-center justify-center gap-2"
      hx-get="/api/public-quiz/join"
      hx-target="main"
    >
      <input
        type="text"
        class="input"
        name="code"
        aria-label="Join a quiz by code"
        placeholder="Join a quiz"
      />
      <button type="submit" class="btn btn-primary">
        join
      </button>
    </form>

    <a
      href="/quiz/create"
      hx-get="/quiz/create"
      hx-push-url="true"
      hx-target="main"
      class="btn "
    >
      Create
    </a>
    <ThemeSwitcher />
    <HeaderMenuDropdown />
  </div>
)

export const Menu = () => (
  <>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" />
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  </>
)
