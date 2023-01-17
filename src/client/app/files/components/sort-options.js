import React from 'react'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'

import { sortGroup } from '../actions'
import { SORT_TYPES } from '../reducer'

const Options = styled.select`
  background: #f1f1f1;
  cursor: pointer;
  font-size: 16px;
  padding: 8px;
`

const Label = styled.div`
  background: #f1f1f1;
`

export default ({ id }) => {
  const dispatch = useDispatch()
  const onChange = ({ target: { value } }) => {
    dispatch(sortGroup(id, value))
  }

  return (
    <div>
      <Label>Sort by</Label>
      <Options name='sort' onChange={onChange}>
        <option value={SORT_TYPES.none}>----------</option>
        <option value={SORT_TYPES.userAscending}>Name A-Z</option>
        <option value={SORT_TYPES.userDescending}>Name Z-A</option>
        <option value={SORT_TYPES.joinAscending}>Join - Ascending</option>
        <option value={SORT_TYPES.joinDescending}>Join - Descending</option>
        <option value={SORT_TYPES.leaveAscending}>Leave - Ascending</option>
        <option value={SORT_TYPES.leaveDescending}>Leave - Descending</option>
      </Options>
    </div>
  )
}
