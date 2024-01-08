import { User } from '@supabase/supabase-js'

interface props {
  user: User | null | undefined
}

export const Header = (props: props) => (
  <div class="navbar mb-2 shadow-lg bg-neutral text-neutral-content rounded-box">
    <div class="flex-none px-2 mx-2">
      <span class="text-lg font-bold">
        <a href="/">QuizX</a>
      </span>
    </div>
    <div class="flex-1 px-2 mx-2">
      <div class="items-stretch hidden lg:flex">
        <a class="btn btn-ghost btn-sm rounded-btn">Home</a>
      </div>
    </div>
    <div class="flex-none relative" id="menu">
      <button
        class="btn btn-square btn-ghost"
        hx-trigger="click"
        hx-get="/fragment/account"
        hx-target="#menu"
        hx-swap="innerHTML"
      >
        <Menu />
      </button>
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
