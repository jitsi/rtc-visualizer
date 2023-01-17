import React from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { getSearchTimeVisible, getSearchTime } from '../selectors'

const Container = styled.div`
  font-size: 0.8em;
  margin-top: 12px;
`

export default () => {
  const searchTimeVisible = useSelector(getSearchTimeVisible)
  const time = useSelector(getSearchTime)

  return (
    searchTimeVisible
      ? (
        <Container>
          <div><div>{`Search took ${time / 1000} s`}</div></div>
        </Container>
        )
      : null
  )
}
