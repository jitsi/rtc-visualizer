const getBasePath = () => {
  const subpath = '/rtcstats-api'

  if (window.location.pathname.startsWith(subpath)) {
    return subpath
  }
  return ''
}

export const BasePath = getBasePath()
