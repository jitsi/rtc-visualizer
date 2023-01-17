import React from 'react'
import styled from 'styled-components'
import { FilesList } from './files/components'
import { SearchForm } from './search/components'
import 'react-tabs/style/react-tabs.css'

const SearchContainer = styled.div`
  display: flex;
  margin-bottom: 16px;
`

export default () => {
  return (
    <div>
      <SearchContainer>
        <SearchForm />
      </SearchContainer>
      <FilesList />
    </div>
  )
}
