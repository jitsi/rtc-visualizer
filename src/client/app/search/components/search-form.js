import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { getSearchInProgress, getSearchError } from '../selectors'
import Error from '../../errors/components'
import { search } from '../actions'
import { Spinner } from '../../generic/components'
import SearchDetails from './search-details'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const SearchField = styled.div`
  float: left;
`
const SearchInput = styled.input`
`

const SearchLabel = styled.label`
  font-size: 0.9em;
`

const Frame = styled.fieldset`
`

function getMaxDatePlaceholder () {
  return new Date()
}

function getMinDatePlaceholder () {
  const date = new Date()
  date.setDate(date.getDate() - 7)
  return date
}

export default () => {
  const dispatch = useDispatch()
  const searchInProgress = useSelector(getSearchInProgress)
  const error = useSelector(getSearchError)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('sessionId') || params.get('meetingUniqueId')
    if (sessionId) {
      dispatch(search({
        sessionId: sessionId
      }))
    }
  }, [dispatch])

  const [startDate, setStartDate] = useState(getMinDatePlaceholder())
  const [endDate, setEndDate] = useState(getMaxDatePlaceholder())

  const handleSubmit = e => {
    const { target: { elements: { conferenceId } } } = e

    e.preventDefault()
    dispatch(search({
      conferenceId: conferenceId.value.trim(),
      minDate: startDate.toISOString().substring(0, 10),
      maxDate: endDate.toISOString().substring(0, 10)
    }))
  }

  return (
    <div>
      <Frame>
        <legend>Search files by</legend>
        <form onSubmit={handleSubmit}>
          <SearchField>
            <div><SearchLabel htmlFor='conferenceId'>Conference name or url *: </SearchLabel></div>
            <SearchInput
              type='text'
              autoComplete='on'
              name='conferenceId'
              placeholder='thisismyconference'
              required
              autoFocus
            />
          </SearchField>
          <SearchField>
            <div><SearchLabel htmlFor='minDate'>Min date: </SearchLabel></div>
            <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
          </SearchField>
          <SearchField>
            <div><SearchLabel htmlFor='maxDate'>Max date: </SearchLabel></div>
            <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
          </SearchField>
          <SearchField>
            <div><SearchLabel htmlFor='maxDate'>&nbsp; </SearchLabel></div>
            <button type='submit'>Search</button>
          </SearchField>
        </form>
      </Frame>
      <div>
        <SearchDetails />
        {searchInProgress && <Spinner size={20} />}
        {error && <Error {...error} />}
      </div>
    </div>
  )
}
