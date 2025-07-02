import { buildRelativeUrl } from './utils'

export const Urls = {
  Search: params => buildRelativeUrl('search', params),

  File: name => buildRelativeUrl(`files/${name}`).href,

  JWTFile: name => buildRelativeUrl(`rtc-visualizer/files/${name}`).href,

  Render: name => buildRelativeUrl('', { dumpId: name }).href,

  Download: name => buildRelativeUrl(`download/${name}`).href,

  Permalink: group => buildRelativeUrl('', { meetingUniqueId: group[0].sessionId }).href
}

export const makeRequest = (
  url,
  method = 'GET',
  body = null
) => {
  const params = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  }

  if (body) {
    params.body = JSON.stringify(body)
  }

  return fetch(url, params)
}
