export const LandingPage = () => {
  return (
    <div>
      <section class="w-full py-12 md:py-24 lg:py-32 xl:py-48" data-id="1">
        <div class="container px-4 md:px-6" data-id="2">
          <div
            class="flex flex-col items-center space-y-4 text-center"
            data-id="3"
          >
            <div class="space-y-2" data-id="4">
              <h1
                class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none"
                data-id="5"
              >
                Quizx: The Open-Source Quiz Platform
              </h1>
              <p
                class="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400"
                data-id="6"
              >
                Join the community of quiz enthusiasts and create or join a
                quiz.
              </p>
            </div>
            <div class="space-x-4" data-id="7">
              <a
                class="btn btn-neutral btn-md"
                data-id="8"
                href="/quiz/create"
                hx-boost
              >
                Create Quiz
              </a>
              <a class="btn btn-primary" data-id="9" href="/join" hx-boost>
                Join Quiz
              </a>
            </div>
          </div>
        </div>
      </section>
      <section
        class="w-full py-12 md:py-24 lg:py-32 bg-neutral text-neutral-content"
        data-id="10"
      >
        <div class="container px-4 md:px-6" data-id="11">
          <div
            class="flex flex-col items-center justify-center space-y-4 text-center"
            data-id="12"
          >
            <div class="space-y-2" data-id="13">
              <div
                class="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800"
                data-id="14"
              >
                Live Streaming
              </div>
              <h2
                class="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]"
                data-id="15"
              >
                Interactive Quizzes with Live Streaming
              </h2>
              <p
                class="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400"
                data-id="16"
              >
                Show you camera and stream your quiz to your audience.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section class="w-full py-12 md:py-24 lg:py-32" data-id="17">
        <div class="container px-4 md:px-6" data-id="18">
          <div
            class="flex flex-col items-center justify-center space-y-4 text-center"
            data-id="19"
          >
            <div class="space-y-2" data-id="20">
              <div
                class="inline-block rounded-lg text-neutral-content bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800"
                data-id="21"
              >
                Open Source
              </div>
              <h2
                class="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]"
                data-id="22"
              >
                Open Source Quiz Platform
              </h2>
              <p
                class="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400"
                data-id="23"
              >
                Quizx is an open-source quiz platform built for developers.
              </p>
              <p>
                <a
                  class="link link-primary"
                  href="https://github.com/JarneDel/Research-Elysia-HTMX"
                >
                  Github
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
