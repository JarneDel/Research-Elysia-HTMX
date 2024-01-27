interface CorrectAnswerProps {
  score: number
}

export const CorrectAnswer = (props: CorrectAnswerProps) => {
  return (
    <div
      id="game"
      class="full-height place-items-center grid text-success fill-success "
    >
      <div class="flex flex-col items-center gap-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="192"
          height="192"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-check-circle-2 animate-fade-rotate-in"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        <div class="text-3xl md:text-6xl font-bold">+ {props.score} points</div>
      </div>
    </div>
  )
}
