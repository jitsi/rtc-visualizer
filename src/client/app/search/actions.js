import { generateActions } from '../utils'
import errorType from '../errors/error-types'
import { makeRequest, Urls } from '../requests'

export const Actions = generateActions([
  'SearchStart',
  'SearchFinish',
  'SearchError',
  'AddFile'
])

const searchError = error => ({
  type: Actions.SearchError,
  payload: error
})

export const search = body => async dispatch => {
  dispatch({
    type: Actions.SearchStart,
    payload: body
  })

  try {
    const res = await makeRequest(Urls.Search(body))

    if (res.ok) {
      const payload = await res.json()

      return dispatch({
        type: Actions.SearchFinish,
        payload
      })
    }

    dispatch(searchError({
      type: errorType.Status,
      error: res.status
    }))
  } catch (error) {
    dispatch(searchError({
      type: errorType.Fetch,
      error
    }))
  }
}
