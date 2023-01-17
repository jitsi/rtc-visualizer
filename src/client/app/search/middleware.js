import { Actions as SearchActions } from './actions'
import FileActions from '../files/action-types'

export default store => next => action => {
  const { type, payload } = action

  if (type === SearchActions.SearchFinish) {
    store.dispatch({
      type: FileActions.SetData,
      payload
    })
  }

  return next(action)
}
