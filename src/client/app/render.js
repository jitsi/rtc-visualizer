import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import { showStats } from './raw/legacy'
import { getFileStatus } from './files/selectors'
import { Console } from 'console-feed'
import { fetchFileBasicAuth, fetchFileJWTAuth } from './files/actions'

export default () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const dumpId = params.get('dumpId')
    const useJWTAuthorization = params.get('useJWTAuthorization')
    if (dumpId) {
      if (useJWTAuthorization) {
        dispatch(fetchFileJWTAuth(dumpId))
      } else {
        dispatch(fetchFileBasicAuth(dumpId))
      }
    }
  }, [dispatch])

  const { data } = useSelector(getFileStatus) || { }

  let logs = []
  if (data) {
    if (data.peerConnections.null) {
      logs = data.peerConnections.null
        .filter(msg => msg.type === 'logs')
        .reduce((accumulator, currentValue) => accumulator.concat(currentValue.value), [])
        .map(msg => ({ method: 'log', data: [msg.text] }))
    }
    showStats(data)
  }

  return (
    <div>
      <Tabs>
        <TabList>
          <Tab>Stats</Tab>
          <Tab>Logs</Tab>
        </TabList>
        <TabPanel forceRender>
          <div id='raw'>
            <div id='userAgent' />
            <div id='tables' />
            <div id='container' />
          </div>
        </TabPanel>
        <TabPanel>
          <Console logs={logs} />
        </TabPanel>
      </Tabs>
    </div>
  )
}
