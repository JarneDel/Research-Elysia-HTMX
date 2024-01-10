import { User } from '@supabase/supabase-js'
import { HeaderMenuDropdown } from '@/components/header/HeaderMenuDropdown.tsx'
import { ThemeSwitcher } from '@/components/states/Theme.tsx'

interface props {
  user: User | null | undefined
}

export const headerLinks = [
  {
    name: 'Home',
    href: '/',
  },
  {
    name: 'Create Quiz',
    href: '/quiz/create',
  },
  // todo make only visible when logged out
  // {
  //   name: 'Sign In',
  //   href: '/auth/sign-in',
  // },
]

export const Header = (props: props) => (
  <div class="navbar  bg-base-300">
    <div class="flex-none px-2 mx-2">
      <span class="text-lg font-bold">
        <a href="/">QuizX</a>
      </span>
    </div>
    <ul class="flex-1 menu menu-horizontal rounded-box">
      {headerLinks.map((link, index) => (
        <li>
          <a
            class="btn btn-ghost btn-sm"
            hx-push-url="true"
            hx-get={link.href}
            hx-target="main"
          >
            {link.name}
          </a>
        </li>
      ))}
    </ul>
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
