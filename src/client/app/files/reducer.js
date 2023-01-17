import Actions from './action-types'

export const SORT_TYPES = {
  none: 'none',
  userAscending: 'userAscending',
  userDescending: 'userDescending',
  joinAscending: 'joinAscending',
  joinDescending: 'joinDescending',
  leaveAscending: 'leaveAscending',
  leaveDescending: 'leaveDescending'
}

const sortMap = {
  [SORT_TYPES.userAscending]: (a, b) => {
    const id1 = a.userId || ''
    const id2 = b.userId || ''

    return id1.localeCompare(id2)
  },
  [SORT_TYPES.userDescending]: (b, a) => {
    const id1 = a.userId || ''
    const id2 = b.userId || ''

    return id1.localeCompare(id2)
  },
  [SORT_TYPES.joinAscending]: (a, b) => a.startDate - b.startDate,
  [SORT_TYPES.joinDescending]: (b, a) => a.startDate - b.startDate,
  [SORT_TYPES.leaveAscending]: (a, b) => a.endDate - b.endDate,
  [SORT_TYPES.leaveDescending]: (b, a) => a.endDate - b.endDate
}

export const getGroupStartDate = group => {
  let min = group[0].startDate

  for (const entry of group.slice(1)) {
    const { startDate } = entry

    if (startDate < min) {
      min = startDate
    }
  }

  return min
}

export const getGroupEndDate = group => {
  let max = group[0].endDate

  for (const entry of group.slice(1)) {
    const { endDate } = entry

    if (endDate > max) {
      max = endDate
    }
  }

  return max
}

export const getGroupParticipantsNum = group => group.length

const addItemToGroup = (arr, item, group) => {
  if (arr[group]) {
    arr[group].push(item)
  } else {
    arr[group] = [item]
  }

  return arr
}

const groupConferences = entries => {
  const all = []

  for (const entry of entries) {
    const { sessionId } = entry

    if (sessionId) {
      addItemToGroup(all, entry, sessionId)
    } else {
      addItemToGroup(all, entry, 'other')
    }
  }

  return Object.keys(all).reduce((res, key) => {
    const group = all[key]

    return Object.assign(res, {
      [key]: {
        group,
        startDate: getGroupStartDate(group),
        endDate: getGroupEndDate(group),
        participants: getGroupParticipantsNum(group)
      }
    })
  }, {})
}

const defaultState = {
  groups: [],
  fileData: undefined
}

export default (state = defaultState, action) => {
  const { type, payload } = action

  switch (type) {
    case Actions.SetData: {
      return {
        ...state,
        groups: groupConferences(payload)
      }
    }
    case Actions.FetchFileStart: {
      const item = state[payload]

      return {
        ...state,
        fileData: {
          ...state.fileData,
          [payload]: {
            ...item,
            fetching: true,
            error: null,
            data: null
          }
        }
      }
    }

    case Actions.FetchFileFinish: {
      const item = state[payload]

      return {
        ...state,
        fileData: {
          ...state.fileData,
          [payload]: {
            ...item,
            fetching: false,
            processing: true
          }
        }
      }
    }

    case Actions.FetchFileError: {
      const { name, error } = payload
      const item = state[name]

      return {
        ...state,
        fileData: {
          ...state.fileData,
          [name]: {
            ...item,
            fetching: false,
            processing: false,
            error
          }
        }
      }
    }

    case Actions.SetFileData: {
      const { name, data } = payload
      const item = state[name]

      return {
        ...state,
        fileData: {
          ...state.fileData,
          [name]: {
            ...item,
            fetching: false,
            processing: false,
            data
          }
        }
      }
    }

    case Actions.SortGroup: {
      const { type, id } = payload
      const item = state.groups[id]

      if (type === SORT_TYPES.none) {
        return state
      }

      const group = item.group.sort(sortMap[type])

      return {
        ...state,
        groups: {
          ...state.groups,
          [id]: {
            ...item,
            group
          }
        }
      }
    }

    default:
      return state
  }
}
