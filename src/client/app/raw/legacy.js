const fileFormat = 2

function createContainers (connid, url) {
  let el, signalingState, iceConnectionState, connectionState, ice
  const container = document.createElement('details')
  container.open = true
  container.style.margin = '10px'

  let summary = document.createElement('summary')
  summary.innerText = 'Connection:' + connid + ' URL: ' + url
  container.appendChild(summary)

  if (connid !== 'null') {
    // show state transitions, like in https://webrtc.github.io/samples/src/content/peerconnection/states
    signalingState = document.createElement('div')

    signalingState.id = 'signalingstate_' + connid
    signalingState.textContent = 'Signaling state:'
    container.appendChild(signalingState)

    iceConnectionState = document.createElement('div')
    iceConnectionState.id = 'iceconnectionstate_' + connid
    iceConnectionState.textContent = 'ICE connection state:'
    container.appendChild(iceConnectionState)

    connectionState = document.createElement('div')
    connectionState.id = 'connectionstate_' + connid
    connectionState.textContent = 'Connection state:'
    container.appendChild(connectionState)
  }

  if (connid !== 'null') {
    // for ice candidates
    const iceContainer = document.createElement('details')
    iceContainer.open = true
    summary = document.createElement('summary')
    summary.innerText = 'ICE candidate grid'
    iceContainer.appendChild(summary)

    ice = document.createElement('table')
    ice.className = 'candidatepairtable'
    const head = document.createElement('tr')
    ice.appendChild(head)

    el = document.createElement('td')
    el.innerText = 'Local address'
    head.appendChild(el)

    el = document.createElement('td')
    el.innerText = 'Local type'
    head.appendChild(el)

    el = document.createElement('td')
    el.innerText = 'Remote address'
    head.appendChild(el)

    el = document.createElement('td')
    el.innerText = 'Remote type'
    head.appendChild(el)

    el = document.createElement('td')
    el.innerText = 'Requests sent'
    head.appendChild(el)

    el = document.createElement('td')
    el.innerText = 'Responses received'
    head.appendChild(el)

    el = document.createElement('td')
    el.innerText = 'Requests received'
    head.appendChild(el)

    el = document.createElement('td')
    el.innerText = 'Responses sent'
    head.appendChild(el)

    el = document.createElement('td')
    el.innerText = 'Active Connection'
    head.appendChild(el)

    iceContainer.appendChild(ice)
    container.appendChild(iceContainer)
  }

  const updateLogContainer = document.createElement('details')
  updateLogContainer.open = true
  container.appendChild(updateLogContainer)

  summary = document.createElement('summary')
  summary.innerText = 'PeerConnection updates:'
  updateLogContainer.appendChild(summary)

  const updateLog = document.createElement('table')
  updateLogContainer.appendChild(updateLog)

  const graphs = document.createElement('div')
  container.appendChild(graphs)

  containers[connid] = {
    updateLog,
    iceConnectionState,
    connectionState,
    signalingState,
    candidates: ice,
    graphs
  }

  return container
}

function processGUM (data) {
  const container = document.createElement('details')
  container.open = true
  container.style.margin = '10px'

  const summary = document.createElement('summary')
  summary.innerText = 'getUserMedia calls'
  container.appendChild(summary)

  const table = document.createElement('table')
  const head = document.createElement('tr')
  table.appendChild(head)

  const el = document.createElement('th')
  el.innerText = 'getUserMedia'
  head.appendChild(el)

  container.appendChild(table)

  document.getElementById('tables').appendChild(container)
  data.forEach(function (event) {
    processTraceEvent(table, event) // abusing the peerconnection trace event processor...
  })
}

function processTraceEvent (table, event) {
  if (event.type === 'logs') {
    return
  }
  const row = document.createElement('tr')
  let el = document.createElement('td')
  el.setAttribute('nowrap', '')
  el.innerText = event.time?.toISOString() || event.time
  row.appendChild(el)

  // recreate the HTML of webrtc-internals
  const details = document.createElement('details')
  el = document.createElement('summary')
  el.innerText = event.type
  details.appendChild(el)

  el = document.createElement('pre')
  if (['createOfferOnSuccess', 'createAnswerOnSuccess', 'setRemoteDescription', 'setLocalDescription'].indexOf(event.type) !== -1) {
    el.innerText = 'SDP ' + event.value.type + ':' + event.value.sdp
  } else {
    el.innerText = JSON.stringify(event.value, null, ' ')
  }
  details.appendChild(el)

  el = document.createElement('td')
  el.appendChild(details)

  row.appendChild(el)

  // guess what, if the event type contains 'Failure' one could use css to highlight it
  if (event.type.indexOf('Failure') !== -1) {
    row.style.backgroundColor = 'red'
  }
  if (event.type === 'iceConnectionStateChange') {
    switch (event.value) {
      case 'ICEConnectionStateConnected':
      case 'ICEConnectionStateCompleted':
        row.style.backgroundColor = 'green'
        break
      case 'ICEConnectionStateFailed':
        row.style.backgroundColor = 'red'
        break
    }
  }

  if (event.type === 'onIceCandidate' || event.type === 'addIceCandidate') {
    if (event.value && event.value.candidate) {
      const parts = event.value.candidate.trim().split(' ')
      if (parts && parts.length >= 9 && parts[7] === 'typ') {
        details.classList.add(parts[8])
      }
    }
  }
  table.appendChild(row)
}

const graphs = {}
const containers = {}

function processConnections (connectionIds, data) {
  let stats
  const connid = connectionIds.shift()
  if (!connid) return
  window.setTimeout(processConnections, 0, connectionIds, data)

  let reportname
  const connection = data.peerConnections[connid]
  const container = createContainers(connid, data.url)
  document.getElementById('tables').appendChild(container)

  for (let j = 0; j < connection.length; j++) {
    if (connection[j].type !== 'getStats' && connection[j].type !== 'getstats') {
      processTraceEvent(containers[connid].updateLog, connection[j])
    }
  }

  // then, update the stats displays
  const series = {}
  let connectedOrCompleted = false
  let firstStats
  let lastStats
  for (let i = 0; i < connection.length; i++) {
    if (connection[i].type === 'oniceconnectionstatechange' && (connection[i].value === 'connected' || connection[i].value === 'completed')) {
      connectedOrCompleted = true
    }
    if (connection[i].type === 'getStats' || connection[i].type === 'getstats') {
      const stats = connection[i].value
      Object.keys(stats).forEach(function (id) {
        if (stats[id].type === 'localcandidate' || stats[id].type === 'remotecandidate') return
        Object.keys(stats[id]).forEach(function (name) {
          if (name === 'timestamp') return
          // if (name === 'googMinPlayoutDelayMs') stats[id][name] = parseInt(stats[id][name], 10);
          if (stats[id].type === 'ssrc' && !isNaN(parseFloat(stats[id][name]))) {
            stats[id][name] = parseFloat(stats[id][name])
          }
          if (stats[id].type === 'ssrc' && name === 'ssrc') return // ignore ssrc on ssrc reports.
          if (typeof stats[id][name] === 'number') {
            if (!series[id]) {
              series[id] = {}
              series[id].type = stats[id].type
            }
            if (!series[id][name]) {
              series[id][name] = []
            } else {
              const lastTime = series[id][name][series[id][name].length - 1][0]
              if (lastTime && stats[id].timestamp && stats[id].timestamp - lastTime > 20000) {
                series[id][name].push([stats[id].timestamp || new Date(connection[i].time).getTime(), null])
              }
            }
            if (fileFormat >= 2) {
              series[id][name].push([stats[id].timestamp, stats[id][name]])
            } else {
              series[id][name].push([new Date(connection[i].time).getTime(), stats[id][name]])
            }
          }
        })
      })
    }
    if (connection[i].type === 'getStats' || connection[i].type === 'getstats') {
      if (!firstStats && connectedOrCompleted) firstStats = connection[i].value
      lastStats = connection[i].value
    }
  }
  const interestingStats = lastStats // might be last stats which contain more counters
  if (interestingStats) {
    const stun = []
    let t
    for (reportname in interestingStats) {
      if (reportname.indexOf('Conn-') === 0) {
        t = reportname.split('-')
        t = t.join('-')
        stats = interestingStats[reportname]
        stun.push(stats)
      }
    }
    for (t in stun) {
      const row = document.createElement('tr')
      let el

      el = document.createElement('td')
      el.innerText = stun[t].googLocalAddress
      row.appendChild(el)

      el = document.createElement('td')
      el.innerText = stun[t].googLocalCandidateType
      row.appendChild(el)

      el = document.createElement('td')
      el.innerText = stun[t].googRemoteAddress
      row.appendChild(el)

      el = document.createElement('td')
      el.innerText = stun[t].googRemoteCandidateType
      row.appendChild(el)

      el = document.createElement('td')
      el.innerText = stun[t].requestsSent
      row.appendChild(el)

      el = document.createElement('td')
      el.innerText = stun[t].responsesReceived
      row.appendChild(el)

      el = document.createElement('td')
      el.innerText = stun[t].requestsReceived
      row.appendChild(el)

      el = document.createElement('td')
      el.innerText = stun[t].responsesSent
      row.appendChild(el)

      el = document.createElement('td')
      el.innerText = stun[t].googActiveConnection
      row.appendChild(el)
      /*
        el = document.createElement('td');
        el.innerText = stun[t].consentRequestsSent;
        row.appendChild(el);
      */

      containers[connid].candidates.appendChild(row)
    }
  }

  const graphTypes = {}
  const graphSelectorContainer = document.createElement('div')
  containers[connid].graphs.appendChild(graphSelectorContainer)

  graphs[connid] = {}

  for (reportname in series) {
    const graphType = series[reportname].type
    graphTypes[graphType] = true

    const container = document.createElement('details')
    container.open = false
    container.classList.add('webrtc-' + graphType)
    containers[connid].graphs.appendChild(container)

    const title = connid + ' type=' + graphType + ' ' + reportname

    const summary = document.createElement('summary')
    summary.innerText = title
    container.appendChild(summary)

    const chartContainer = document.createElement('div')
    chartContainer.id = 'chart_' + Date.now()
    container.appendChild(chartContainer)

    const da = []
    Object.keys(series[reportname]).forEach(function (name) {
      if (name === 'type') return
      da.push({
        name: name,
        data: series[reportname][name]
      })
    })
    const graph = new Highcharts.Chart({
      title: {
        text: title
      },
      xAxis: {
        type: 'datetime'
      },
      /*
        yAxis: {
        min: 0
        },
      */
      chart: {
        zoomType: 'x',
        renderTo: chartContainer.id
      },
      series: da
    })
    graphs[connid][reportname] = graph;

    // draw checkbox to turn off everything
    ((reportname, container, graph) => {
      container.ontoggle = () => container.open && graph.reflow()
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      container.appendChild(checkbox)
      const label = document.createElement('label')
      label.innerText = 'Turn on/off all data series in ' + connid + ' ' + reportname
      container.appendChild(label)
      checkbox.onchange = function () {
        graph.series.forEach(function (series) {
          series.setVisible(!checkbox.checked, false)
        })
        graph.redraw()
      }
    })(reportname, container, graph)
  }

  Object.keys(graphTypes).forEach(function (type) {
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = false
    graphSelectorContainer.appendChild(checkbox)

    const label = document.createElement('label')
    label.innerText = 'Toggle graphs for type=' + type
    graphSelectorContainer.appendChild(label)

    const selector = '.webrtc-' + type
    checkbox.onchange = function () {
      containers[connid].graphs.querySelectorAll(selector).forEach(function (el) {
        el.open = checkbox.checked
      })
    }
  })
}

export const clearStats = () => {
  const rawContainer = document.getElementById('raw')
  Array.from(rawContainer.children).forEach(el => { el.innerHTML = '' })
}

export const showStats = data => {
  clearStats()
  document.getElementById('userAgent').innerHTML = `<b>User Agent:</b> <span>${data.userAgent}</span>`
  processGUM(data.getUserMedia)
  window.setTimeout(processConnections, 0, Object.keys(data.peerConnections), data)
}
