import { User } from '@supabase/supabase-js'
import { HeaderMenuDropdown } from '@/components/header/HeaderMenuDropdown.tsx'
import { ThemeSelector, ThemeSwitcher } from '@/components/states/Theme.tsx'

interface props {
  user?: User
  children?: any
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
  <div class="drawer">
    <input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content">
      <div class="navbar  bg-base-300" id="main-header">
        <div class="flex-none lg:pl-2 lg:mx-2 pr-2">
          <label
            for="my-drawer-3"
            aria-label="open sidebar"
            class="btn btn-square btn-ghost lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="inline-block w-6 h-6 stroke-current"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </label>
          <span class="text-lg font-bold">
            <a href="/">QuizX</a>
          </span>
        </div>
        <ul class="menu menu-horizontal rounded-box max-lg:hidden ">
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
          class="btn max-lg:hidden"
        >
          Create
        </a>
        <ThemeSwitcher extraClasses="max-lg:hidden" />
        <HeaderMenuDropdown extraClasses="max-lg:hidden" />
      </div>
      {props.children}
    </div>
    <div class="drawer-side z-100">
      <label
        for="my-drawer-3"
        aria-label="close sidebar"
        class="drawer-overlay"
      ></label>
      <ul class="menu p-4 w-80 min-h-full bg-base-200">
        <li class="collapse" tabindex="0">
          <input type="checkbox" />

          <div class="collapse-title">Theme</div>
          <div class="collapse-content p-0">
            <ThemeSelector />
          </div>
        </li>
        <li>
          <a
            hx-push-url="true"
            hx-get="/quiz/create"
            hx-target="main"
            href="/quiz/create"
          >
            Create Quiz
          </a>
        </li>
        <li class="flex-grow flex justify-end">
          <a
            href="/api/auth/sign-out"
            hx-get="/api/auth/sign-out"
            hx-target="body"
            class="bg-error hover:bg-error/20 text-error-content "
          >
            Log Out
          </a>
        </li>
      </ul>
    </div>
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
