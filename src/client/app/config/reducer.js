import Actions from './actions-types'

const initialState = {
  isSet: false,
  filesEndpoint: ''
}

export default (state = initialState, action) => {
  switch (action.type) {
    case Actions.SetConfig:
      return { ...state, ...action.payload, isSet: true }
    default:
      return state
  }
}
