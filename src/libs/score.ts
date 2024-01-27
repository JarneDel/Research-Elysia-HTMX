import { log } from '@/index.ts'
import { cache } from '@/libs/cache.ts'

/**
 * Calculate the score of a question based on the time it took to answer it
 * score: 0 - 1000
 * @param start ms since epoch
 * @param end ms since epoch
 * @param questionDurationSeconds duration of the question in seconds
 */
export const calculateScore = (
  start: number | undefined,
  end: number,
  questionDurationSeconds: number,
): number => {
  if (!start) {
    log.warn('presenter::calculateScore::start is undefined')
    return 0
  }

  const timeTaken = end - start
  const timeTakenPercentage = timeTaken / (questionDurationSeconds * 1000)
  return 1000 - Math.floor(timeTakenPercentage * 1000)
}

export const setStartTimeForQuestion = (quizCode: string, page: number) => {
  const key = quizCode + 'qs' + page
  log.info('presenter::setStartTimeKey::' + key)
  cache.set(key, new Date().getTime().toString(), 240)
}

export const getStartTimeForQuestion = (
  quizCode: string,
  page: number,
): number | undefined => {
  const key = quizCode + 'qs' + page
  log.info('presenter::getStartTimeKey::' + key)
  const startTime = cache.get(key)
  if (typeof startTime === 'string') {
    return parseInt(startTime)
  }
}
