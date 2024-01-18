export const AddAnswer = () => (
  <li class="">
    <button
      class="btn btn-lg px-5 "
      hx-get="/fragment/quiz/page/addAnswer"
      hx-swap="outerHTML"
      hx-include=".answer"
      hx-target="closest li"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
    </button>
  </li>
)

export const EditAnswer = ({
  id,
  placeholder,
  isDeletable = false,
  value,
  isCorrect,
}: {
  id: number
  placeholder: string
  isDeletable?: boolean
  value?: string
  isCorrect?: boolean
}) => (
  <li class="flex w-full bg-base-200 p-2 rounded-box gap-4 relative">
    <AnswerIcon id={id} size={96} />
    <textarea
      class="textarea max-h-12 sm:input-lg input-ghost sm:h-full answer flex-1 sm:max-h-24 resize-none"
      name={`answer${id}`}
      rows="2"
      wrap="soft"
      maxlength="100"
      placeholder={placeholder}
    >
      {value}
    </textarea>
    <input
      type="checkbox"
      name={`correct-${id}`}
      class="checkbox checkbox-lg mt-auto checkbox-success correct-answer flex-shrink-0"
      checked={isCorrect}
    />
    {isDeletable && (
      <button
        class="btn btn-sm btn-circle absolute -top-2 -right-2 btn-error"
        hx-target="closest li"
        hx-swap={id !== 5 ? 'delete' : 'outerHTML'}
        hx-get={id !== 5 ? '#' : '/fragment/quiz/page/plusbutton'}
      >
        x
      </button>
    )}
  </li>
)

interface AnswerProps {
  index: number
  value: string
}

export const Answer = (props: AnswerProps) => {
  const { index, value } = props
  return (
    <li class="flex w-full bg-base-300 p-2 rounded-box gap-4 relative items-center">
      <AnswerIcon id={index} size={96} />
      <div safe class="text-3xl font-medium ">
        {value}
      </div>
    </li>
  )
}

interface AnswerParticipantProps {
  index: number
  value: string
  namePrefix: string
}
export const AnswerParticipant = (props: AnswerParticipantProps) => {
  return (
    <li class="w-full bg-base-300 p-2 rounded-box relative focus-visible:outline-offset-4 focus-visible:outline-2 hover:bg-secondary/70 hover:text-secondary-content transition-colors duration-300">
      <button
        name={props.namePrefix + '-' + props.index}
        class="flex w-full gap-4 items-center"
      >
        <AnswerIcon id={props.index} size={96} />
        <div safe class="text-3xl font-medium ">
          {props.value}
        </div>
      </button>
    </li>
  )
}

export const AnswerIcon = (props: { id: number; size: number }) => {
  const { id } = props
  const color = getColor(id)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      // width={props.size}
      // height={props.size}
      viewBox="0 0 24 24"
      fill={color}
      class={`rounded-box h-12 w-12 sm:h-24 sm:w-24 flex-shrink-0 `}
    >
      <path stroke="none" d="M0 0h24v24H0z" />
      {/*Filled rectangle white*/}
      {id === 0 && <Rectangle />}
      {/*Filled circle white*/}
      {id === 1 && <Circle />}
      {/*Filled triangle*/}
      {id === 2 && <Triangle />}
      {/*Filled hexagon*/}
      {id === 3 && <Hexagon />}
      {/*Filled Quatrefoil color*/}
      {id === 4 && <Quatrefoil />}
      {/*Filled rectangle color*/}
      {id === 5 && <RectangleFlat />}
      {/*Filled circle color*/}
    </svg>
  )
}

export const Rectangle = () => (
  <rect
    x="4"
    y="4"
    width="16"
    height="16"
    rx="2"
    class="fill-white rotate-45 origin-center"
  />
)

export const Circle = () => <circle cx="12" cy="12" r="9" class="fill-white" />

export const Triangle = () => (
  <polygon points="12 2 22 20 2 20" class="fill-white" />
)
export const Hexagon = () => (
  <path
    class="fill-white"
    d="m 19.898553,7.3010075 0.09573,9.2036965 -7.92277,4.684751 L 4.0530118,16.67051 3.9572835,7.4668139 11.880054,2.7820625 Z"
  />
)

export const Quatrefoil = () => (
  <path
    id="path4-5-2-2-7-2"
    class="fill-white"
    d="M 12.124571,1.8850148 A 4.6988591,4.6988591 0 0 0 7.4254529,6.5841326 4.6988591,4.6988591 0 0 0 7.5500217,7.6036799 4.6988591,4.6988591 0 0 0 6.6991212,7.5251058 4.6988591,4.6988591 0 0 0 2.0000027,12.222308 a 4.6988591,4.6988591 0 0 0 4.6991185,4.699119 4.6988591,4.6988591 0 0 0 0.6247603,-0.04408 4.6988591,4.6988591 0 0 0 -0.03833,0.53852 4.6988591,4.6988591 0 0 0 4.6991165,4.699118 4.6988591,4.6988591 0 0 0 4.69912,-4.699118 4.6988591,4.6988591 0 0 0 -0.05558,-0.712917 4.6988591,4.6988591 0 0 0 0.674587,0.04983 4.6988591,4.6988591 0 0 0 4.697202,-4.699118 4.6988591,4.6988591 0 0 0 -4.697202,-4.6991185 4.6988591,4.6988591 0 0 0 -0.557684,0.040246 4.6988591,4.6988591 0 0 0 0.07858,-0.8106556 4.6988591,4.6988591 0 0 0 -4.699118,-4.6991178 z"
  />
)

export const RectangleFlat = () => (
  <rect x="4" y="4" width="16" height="16" rx="2" class="fill-white " />
)

const getColor = (id: number) => {
  switch (id) {
    case 0:
      return '#1ddede'
    case 1:
      return '#FF5722'
    case 2:
      return '#673AB7'
    case 3:
      return '#2196F3'
    case 4:
      return '#4CAF50'
    case 5:
      return '#9C27B0'
  }
}
