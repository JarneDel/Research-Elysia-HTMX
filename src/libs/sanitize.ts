import { Elysia } from 'elysia'
import sanitizeHtml from 'sanitize-html'

export type sanitizeLevel = 'strict' | 'medium' | 'loose'

/**
 * Sanitize HTML string
 * Strict: NO HTML tags allowed
 * Medium: Only <b>, <i>, <u>, <strong>, <em>, <a>, <br>, <p>, <ul>, <ol>, <li>, <blockquote>, <code>, <pre>, <h1>, <h2>, <h3>, <h4>, <h5>, <h6>, <img> tags allowed
 * Loose: All except <script> tags allowed
 * @param str
 * @param level
 */
export const sanitize = (str?: string, level?: sanitizeLevel) => {
  if (!str) return ''
  console.log('sanitizing', str, level)
  if (!level) level = 'strict'
  switch (level) {
    case 'strict':
      console.log('sanitizing', str)
      return sanitizeHtml(str, {
        allowedTags: [],
        disallowedTagsMode: 'discard',
        allowedAttributes: {},
        parseStyleAttributes: false,
      })
    case 'medium':
      return sanitizeHtml(str, {
        allowedAttributes: {
          a: ['href', 'name', 'target'],
          img: ['src', 'alt'],
        },
        parseStyleAttributes: false,
      })
    case 'loose':
      return sanitizeHtml(str, {
        disallowedTagsMode: 'recursiveEscape',
        allowedAttributes: {
          a: ['href', 'name', 'target'],
          img: ['src', 'alt'],
        },
        parseStyleAttributes: false,
      })
  }
}

export const sanitizeDerive = (app: Elysia) => app
// app.onParse(({ request }, contentType) => {
//   if (contentType !== 'application/json') return
//
//   console.log('sanitizing', body)
//   if (headers['content-type'] === 'application/x-www-form-urlencoded') {
//     Object.keys(body).forEach(key => {
//       console.log(key, body[key])
//       const sanitized = sanitize(body[key], 'strict')
//       console.log(sanitized)
//       body[key] = sanitized
//     })
//   }
//   return {
//     body,
//   }
// })
