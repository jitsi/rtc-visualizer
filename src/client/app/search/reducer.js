import { Actions } from './actions'

const defaultState = {
  searchInProgress: false,
  searchFinished: false,
  error: null,
  params: null,
  startSearchTime: 0,
  endSearchTime: 0
}

export default (state = defaultState, action) => {
  const { type, payload } = action

  switch (type) {
    case Actions.SearchStart: {
      return {
        ...state,
        searchInProgress: true,
        searchFinished: false,
        error: null,
        params: payload,
        startSearchTime: new Date().getTime()
      }
    }

    case Actions.SearchFinish: {
      return {
        ...state,
        searchInProgress: false,
        searchFinished: true,
        endSearchTime: new Date().getTime()
      }
    }

    case Actions.AddFile: {
      if (state.files.includes(payload)) {
        return state
      }

      state.files.push(payload)

      return {
        ...state,
        files: [...state.files]
      }
    }

    case Actions.SearchError: {
      return {
        ...state,
        searchInProgress: false,
        searchFinished: true,
        error: payload,
        endSearchTime: new Date().getTime()
      }
    }

    default:
      return state
  }
}
