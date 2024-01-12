import { describe, expect, test } from 'bun:test'
import {
  calculateCorrectAnswers,
  generateShortId,
} from '@/modules/api/quiz/index.tsx'

describe('quiz api module', () => {
  test('change-page-answers', () => {
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

  test('create short id', () => {
    const id = generateShortId()
    console.log(id)
    expect(id).toHaveLength(6)
    expect(id).toMatch(/[a-z0-9]/)
  })
})
