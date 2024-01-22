/**
 * Get the quiz code from the url
 * @param url
 */
export const getQuizCode = (url: string): string | undefined => {
  const urlObj = new URL(url)
  const pathname = urlObj.pathname
  const parts = pathname.split('/')
  return parts.pop()
}
