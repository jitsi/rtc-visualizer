import React from 'react'
import styled from 'styled-components'
import { Emph } from '../../generic/components'

import { Urls } from '../../requests'
import { formatDate } from '../../utils'

const Download = styled.a`
  text-decoration: none;
`

const Line = styled.div`
  color: #7b7b7b;
  font-size: .8em;
  text-align: left;
`

const Name = styled.span`
  font-size: 15px;
  font-weight: 700;
`

const Black = styled.span`
  color: #000;
`

export default ({ dumpId, userId, startDate, endDate, app }) => {
  return (
    <tr>
      <td>
        <Line><Emph width={50}>Name:</Emph> <Name><Black>{userId}</Black></Name></Line>
        <Line><Emph width={50}>Link:</Emph> <Download href={Urls.Render(dumpId)} target='_blank'>{dumpId}</Download> <Download href={Urls.Download(dumpId)}>💾</Download></Line>
        <Line><Emph width={50}>Join:</Emph> {formatDate(startDate)}</Line>
        <Line><Emph width={50}>Leave:</Emph> {formatDate(endDate)}</Line>
        <Line><Emph width={50}>App: </Emph> {app}</Line>
      </td>
    </tr>
  )
}
