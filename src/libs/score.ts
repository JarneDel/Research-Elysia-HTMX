/**
 * Calculate the score of a question based on the time it took to answer it
 * score: 0 - 1000
 * @param start ms since epoch
 * @param end ms since epoch
 * @param questionDurationSeconds duration of the question in seconds
 */
export const calculateScore = (
  start: number,
  end: number,
  questionDurationSeconds: number,
): number => {
  const timeTaken = end - start
  const timeTakenPercentage = timeTaken / (questionDurationSeconds * 1000)
  return 1000 - Math.floor(timeTakenPercentage * 1000)
}
