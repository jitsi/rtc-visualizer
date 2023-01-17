import React from 'react'
import styled from 'styled-components'
import errorType from '../error-types'

const Container = styled.div`
  color: red;
`

const textErrorMap = {
  [errorType.Fetch]: 'Error fetching data:',
  [errorType.Parse]: 'Error parsing data:',
  [errorType.Status]: 'Status error:'
}

export default ({ type, error }) => {
  const text = textErrorMap[type]

  return <Container>{`${text} ${error}`}</Container>
}
