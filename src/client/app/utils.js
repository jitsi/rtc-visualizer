export const generateActions = actionNames =>
  actionNames.reduce(
    (actions, actionName) =>
      Object.assign(actions, {
        [actionName]: Symbol(actionName)
      }),
    {}
  )

export const formatDate = num => new Date(num).toISOString()

export const buildRelativeUrl = (path, queryParams = {}) => {
  const url = new URL(path, window.location.href)
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value)
    }
  })

  return url
}
