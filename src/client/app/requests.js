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

  File: name => `/files/${name}`,

  JWTFile: (name, filesEndpoint) => `${filesEndpoint}/rtc-visualizer/files/${name}`,

  Render: name => `/?dumpId=${name}`,

  Download: name => `/download/${name}`
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
