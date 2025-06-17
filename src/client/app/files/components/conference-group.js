import React from 'react'
import styled from 'styled-components'

import { formatDate } from '../../utils'
import Row from './row'
import SortOptions from './sort-options'

const Content = styled.div`
  display: flex
`

const Table = styled.table`
  border-collapse: collapse;
  text-align: center;

  td, th {
    border: 1px dotted #c3c7d5;
    padding: 4px;
  }

  th {
    background-color: #f1f1f1;
    font-weight: normal;

  }
`

const Details = styled.details`
  border-bottom: 1px solid #fff;
`

const SummaryContainer = styled.summary`
  background: #f1f1f1;
  cursor: pointer;
  font-size: 15px;
  padding: 16px 2px;
`

const SummaryDetails = styled.div`
  display: inline-block;
`

const Emph = styled.div`
  display: inline-block;
  font-weight: 600;
  width: 100px;
`

const NonGroup = styled.div`

`
function getPermalink (group) {
  return `${window.location.origin}/rtcstats-view/?meetingUniqueId=${group[0].sessionId}`
}

export default ({ id, data }) => {
  const { group, startDate, endDate, participants } = data
  const isNonGrouped = id === 'other'

  return (
    <Details>
      <SummaryContainer>
        <SummaryDetails>
          {isNonGrouped
            ? <NonGroup><Emph>{`Other ${group.length} participants`}</Emph></NonGroup>
            : (
              <>
                <div><Emph>Permalink: </Emph><a href={getPermalink(group)}>{getPermalink(group)}</a></div>
                <div><Emph>Start Time:</Emph> {formatDate(startDate)}</div>
                <div><Emph>End Time:</Emph> {formatDate(endDate)}</div>
                <div><Emph>Participants:</Emph> {participants}</div>
              </>
              )}
        </SummaryDetails>
      </SummaryContainer>
      <Content>
        <Table>
          <thead>
            <tr>
              <th>File</th>
            </tr>
          </thead>
          <tbody>
            {group.map(entry => <Row key={entry.dumpId} {...entry} />)}
          </tbody>
        </Table>
        <SortOptions id={id} />
      </Content>
    </Details>
  )
}
