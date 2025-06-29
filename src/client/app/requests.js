export const Urls = {
  Search: params => {
    const url = new URL('search', window.location.href)

    Object.entries(params).forEach(([k, v]) => {
      if (v) {
        url.searchParams.set(k, v)
      }
    })

    return url
  },

  File: name => new URL(`files/${name}`, window.location.href).href,

  JWTFile: (name, filesEndpoint) => `${filesEndpoint}/rtc-visualizer/files/${name}`,

  Render: name => {
    const url = new URL(window.location.pathname, window.location.origin)
    url.searchParams.set('dumpId', name)

    return url.href
  },

  Download: name => new URL(`download/${name}`, window.location.href).href
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
