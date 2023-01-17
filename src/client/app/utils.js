export const generateActions = actionNames =>
  actionNames.reduce(
    (actions, actionName) =>
      Object.assign(actions, {
        [actionName]: Symbol(actionName)
      }),
    {}
  )

export const formatDate = num => new Date(num).toISOString()
