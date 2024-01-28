import { Elysia } from 'elysia'
import { LandingPage } from '@/components/landing/LandingPage.tsx'

export const landingPage = (app: Elysia) =>
  app
    .get('/landing', () => <LandingPage />)
    .get('/join', () => {
      return (
        <div class="flex flex-col items-center justify-center full-height bg-gray-100 p-4">
          <h1 class="text-4xl font-bold mb-4">Join the Quiz</h1>
          <form
            class="w-full max-w-xs   flex flex-row items-center gap-2"
            hx-get="/api/public-quiz/join"
            hx-target="main"
          >
            <input
              class="input input-primary flex-grow"
              placeholder="Enter Quiz code"
              required
              name="code"
            />
            <button class="btn btn-primary" type="submit">
              Join Quiz
            </button>
          </form>
        </div>
      )
    })
