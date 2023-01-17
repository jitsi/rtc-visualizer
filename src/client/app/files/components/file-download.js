import React from 'react'
import { useDispatch } from 'react-redux'
import { showAndFetchFile } from '../actions'

export default () => {
  const dispatch = useDispatch()
  const handleSubmit = e => {
    const { target: { elements: { file } } } = e

    e.preventDefault()
    dispatch(showAndFetchFile(file.value.trim()))
  }

  return (
    <fieldset>
      <legend>Find file</legend>
      <form onSubmit={handleSubmit}>
        <div>
          <div><label htmlFor='file'>File name*: </label></div>
          <input
            type='text'
            autoComplete='on'
            name='file'
            placeholder='xxx-yyy.gz'
            required
          />
        </div>
        <div>
          <button type='submit'>Download</button>
        </div>
      </form>
    </fieldset>
  )
}
