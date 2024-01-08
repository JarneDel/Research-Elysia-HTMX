import { Elysia } from 'elysia'

export const accountPopup = (app: Elysia) =>
  app.get('/fragment/account', () => {
    return (
      <>
        <ul class="menu bg-base-200 w-56 rounded-box">
          <li></li>
        </ul>
      </>
    )
  })
