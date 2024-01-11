import { Menu } from '@/components/header/Header.tsx'

export const HeaderMenuDropdown = () => {
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
      <div class="dropdown dropdown-end">
        <button class="btn btn-ghost">
          <Menu></Menu>
        </button>
        <ul class="menu dropdown-content mt-4 z-[1] p-2 shadow bg-base-300 rounded-box w-52 mt-45">
          {links.map((link, index) => (
            <li>
              <a
                hx-push-url="true"
                hx-get={link.href}
                hx-target={link.target}
                href={link.href}
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
