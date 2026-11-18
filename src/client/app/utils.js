export const generateActions = actionNames =>
  actionNames.reduce(
    (actions, actionName) =>
      Object.assign(actions, {
        [actionName]: Symbol(actionName)
      }),
    {}
  )

export const formatDate = num => new Date(num).toISOString()

// Checks if a value is the name of a built-in object property, for example `__proto__`,
// `constructor` or `toString`. A lookup with such a key in a plain object returns the built-in,
// not an entry of the object, and a write through the result changes the built-in. Use this
// check before an id or a name from a dump becomes an object key.
export const isBuiltinPropertyName = key => key in Object.prototype

export const buildRelativeUrl = (path, queryParams = {}) => {
  const url = new URL(path, window.location.href)
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value)
    }
  })

  return url
}
