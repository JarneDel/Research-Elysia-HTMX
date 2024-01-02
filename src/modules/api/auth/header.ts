type Headers = { [key: string]: string }
type Set = { headers: Headers }

export function handleHxRequest(headers: Headers, set: Set): void | string {
  if (headers['hx-request']) {
    const to = headers['hx-current-url']
    if (!to) {
      set.headers['HX-Redirect'] = '/'
      return
    }
    const query = new URLSearchParams({ to })
    set.headers['HX-Redirect'] = query.get('to') || '/'
  }
}
