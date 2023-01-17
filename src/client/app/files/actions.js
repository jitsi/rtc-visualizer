import { batch } from 'react-redux'
import { Urls } from '../requests'
import errorType from '../errors/error-types'
import { parseData } from './formatter'
import Actions from './action-types'
import { Actions as SearchActions } from '../search/actions'

const fetchFileError = (name, error) => ({
  type: Actions.FetchFileError,
  payload: {
    name,
    error
  }
})

export const fetchFile = name => async (dispatch) => {
  dispatch({
    type: Actions.FetchFileStart,
    payload: name
  })

  try {
    const res = await fetch(Urls.File(name))

    dispatch({
      type: Actions.FetchFileFinish,
      payload: name
    })

    if (res.ok) {
      const text = await res.text()

      try {
        const data = parseData(text)

        dispatch({
          type: Actions.SetFileData,
          payload: { name, data }
        })
      } catch (err) {
        dispatch(fetchFileError(name, {
          type: errorType.Parse,
          error: err
        }))
      }
    } else {
      dispatch(fetchFileError(name, {
        type: errorType.Status,
        error: res.status
      }))
    }
  } catch (err) {
    dispatch(fetchFileError(name, {
      type: errorType.Fetch,
      error: err
    }))
  }
}

export const showAndFetchFile = name => dispatch => batch(() => {
  dispatch({
    type: SearchActions.AddFile,
    payload: name
  })
  dispatch(fetchFile(name))
})

export const sortGroup = (id, type) => ({
  type: Actions.SortGroup,
  payload: {
    type,
    id
  }
})

export const renderFile = (fileName) => ({
  type: Actions.RenderFile,
  payload: fileName
})
