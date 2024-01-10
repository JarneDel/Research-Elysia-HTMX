import { expect, it, test } from 'bun:test'
import { calculateCorrectAnswers } from '@/modules/api/quiz/index.tsx'

test('change-page-answers', () => {
  it('should return the right indexes', () => {
    const result = calculateCorrectAnswers({
      answer0: 'a',
      answer1: 'b',
      answer2: 'c',
      answer3: 'd',
      answer4: 'e',
      answer5: 'f',
      'correct-0': 'on',
      'correct-1': 'off',
      'correct-2': 'on',
      'correct-3': 'off',
      'correct-4': 'on',
      'correct-5': 'on',
    })
    expect(result).toEqual([0, 2, 4, 5])
  })
})
