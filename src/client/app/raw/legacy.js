const fileFormat = 2


function createLegacyCandidateTable(container, stun) {
  // for ice candidates
  const head = document.createElement('tr');
  [
      'Local address',
      'Local type',
      'Local id',
      'Remote address',
      'Remote type',
      'Remote id',
      'Requests sent', 'Responses received',
      'Requests received', 'Responses sent',
      'Active Connection',
  ].forEach((text) => {
      const el = document.createElement('td');
      el.innerText = text;
      head.appendChild(el);
  });
  container.appendChild(head);

  for (t in stun) {
      const row = document.createElement('tr');
      [
          'googLocalAddress', 'googLocalCandidateType', 'localCandidateId',
          'googRemoteAddress', 'googRemoteCandidateType', 'remoteCandidateId',
          'requestsSent', 'responsesReceived',
          'requestsReceived', 'responsesSent',
          'googActiveConnection', /* consentRequestsSent, */
      ].forEach((id) => {
          const el = document.createElement('td');
          el.innerText = stun[t][id];
          row.appendChild(el);
      });
      container.appendChild(row);
  }
}

function createSpecCandidateTable(container, allGroupedStats) {
  const head = document.createElement('tr');
  [
      'Transport id',
      'Candidate pair id',
      'Candidate id',
      '', // local/remote, leave empty
      'type',
      'address',
      'port',
      'protocol',
      'priority / relayProtocol',
      'interface',
  ].forEach((text) => {
      const el = document.createElement('td');
      el.innerText = text;
      head.appendChild(el);
  });
  container.appendChild(head);

  const transports = {};
  const pairs = {};
  const candidates = {};

  // massaging the data is different than in fippo's tool
  Object.keys(allGroupedStats).forEach(objectName => {
    const groupedStats = {}; // avoid modifying the original object
    Object.keys(allGroupedStats[objectName]).forEach(comp => {
      if (Array.isArray(allGroupedStats[objectName][comp])) {
        const lastIdx = allGroupedStats[objectName][comp].length - 1;
        groupedStats[comp] = allGroupedStats[objectName][comp][lastIdx][1];
      } else {
        groupedStats[comp] = allGroupedStats[objectName][comp];
      }
    })
    if (groupedStats.type === 'transport' || objectName.startsWith('RTCTransport')) {
      transports[objectName] = groupedStats;
    } else if (groupedStats.type === 'candidate-pair' || objectName.startsWith('RTCIceCandidatePair')) {
      pairs[objectName] = groupedStats
    } else if (['local-candidate', 'remote-candidate'].includes(groupedStats.type) || objectName.startsWith('RTCIceCandidate')) {
      candidates[objectName] = groupedStats
    }
  })

  for (const t in transports) {
      let row = document.createElement('tr');

      let el = document.createElement('td');
      el.innerText = t;
      row.appendChild(el);

      el = document.createElement('td');
      el.innerText = transports[t].selectedCandidatePairId;
      row.appendChild(el);

      for (let i = 2; i < head.childElementCount; i++) {
          el = document.createElement('td');
          row.appendChild(el);
      }

      container.appendChild(row);

      for (const p in pairs) {
          if (pairs[p].transportId !== t) continue;
          const pair = pairs[p];
          row = document.createElement('tr');

          row.appendChild(document.createElement('td'));

          el = document.createElement('td');
          el.innerText = p;
          row.appendChild(el);

          container.appendChild(row);
          for (let i = 2; i < head.childElementCount; i++) {
              el = document.createElement('td');
              if (i === 8) {
                  el.innerText = pair.priority;
              }
              row.appendChild(el);
          }

          for (const c in candidates) {
              if (!(c === pair.localCandidateId || c === pair.remoteCandidateId)) continue;
              const candidate = candidates[c];
              row = document.createElement('tr');

              row.appendChild(document.createElement('td'));
              row.appendChild(document.createElement('td'));
              el = document.createElement('td');
              el.innerText = c;
              row.appendChild(el);

              el = document.createElement('td');
              el.innerText = candidate.isRemote ? 'remote' : 'local';
              row.appendChild(el);

              el = document.createElement('td');
              el.innerText = candidate.candidateType;
              row.appendChild(el);

              el = document.createElement('td');
              el.innerText = candidate.address || candidate.ip;
              row.appendChild(el);

              el = document.createElement('td');
              el.innerText = candidate.port;
              row.appendChild(el);

              el = document.createElement('td');
              el.innerText = candidate.protocol;
              row.appendChild(el);

              el = document.createElement('td');
              el.innerText = candidate.priority;
              if (candidate.relayProtocol) {
                  el.innerText += ' ' + candidate.relayProtocol;
              }
              row.appendChild(el);

              el = document.createElement('td');
              el.innerText = candidate.networkType || 'unknown';
              row.appendChild(el);

              container.appendChild(row);
          }
      }
  }
}

function createContainers (connid, url) {
  let signalingState, iceConnectionState, connectionState, candidates
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

    candidates = document.createElement('table')
    candidates.className = 'candidatepairtable'
    container.appendChild(candidates)
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
    candidates,
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

  if (event.type === 'oniceconnectionstatechange') {
    switch (event.value) {
      case 'connected':
      case 'completed':
        row.style.backgroundColor = 'green'
        break
      case 'failed':
        row.style.backgroundColor = 'red'
        break
    }
  } else if (event.type === 'iceConnectionStateChange') {
    // Legacy variant, probably broken by now since the values changed.
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
          } else if (series[id]) {
            // include plain strings in the object, like the 'transportId' (we use this in the new transports grid)
            series[id][name] = stats[id][name]
          }
        })
      })
    }
    if (connection[i].type === 'getStats' || connection[i].type === 'getstats') {
      if (!firstStats && connectedOrCompleted) firstStats = connection[i].value
      lastStats = connection[i].value
    }
  }

  if (containers[connid].candidates /* we don't show this for the callstats PC (id: null) */) {
    const interestingStats = lastStats // might be last stats which contain more counters
    const stun = []
    if (interestingStats) {
      let t
      for (reportname in interestingStats) {
        if (reportname.indexOf('Conn-') === 0) {
          t = reportname.split('-')
          t = t.join('-')
          stats = interestingStats[reportname]
          stun.push(stats)
        }
      }
    }

    if (Object.keys(stun).length === 0) {
      // spec-stats. A bit more complicated... we need the transport and then the candidate pair and the local/remote candidates.
      createSpecCandidateTable(containers[connid].candidates, series);
    } else {
      createLegacyCandidateTable(containers[connid].candidates, stun);
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

    const ignoredSeries = ['type', 'ssrc']
    const hiddenSeries = [
      'bytesReceived', 'bytesSent',
      'headerBytesReceived', 'headerBytesSent',
      'packetsReceived', 'packetsSent',
      'qpSum', 'estimatedPlayoutTimestamp',
      'framesEncoded', 'framesDecoded',
      'lastPacketReceivedTimestamp', 'lastPacketSentTimestamp',
      'remoteTimestamp',
      'audioInputLevel', 'audioOutputLevel',
      'totalSamplesDuration',
      'totalSamplesReceived', 'jitterBufferEmittedCount',
      // legacy
      'googDecodingCTN', 'googDecodingCNG', 'googDecodingNormal',
      'googDecodingPLCCNG', 'googDecodingCTSG', 'googDecodingMuted',
      'googEchoCancellationEchoDelayStdDev',
      'googCaptureStartNtpTimeMs'
    ]

    const traces = Object.keys(series[reportname])
      .filter(name => !ignoredSeries.includes(name))
      // exclude stats that aren't series like the 'transportId' field that we use this in the new transports grid
      .filter(name => Array.isArray(series[reportname][name]))
      .map(function (name) {
        const data = series[reportname][name]
        return {
          mode: 'lines+markers',
          name: name,
          visible: hiddenSeries.includes(name) ? 'legendonly' : true,
          x: data.map(d => new Date(d[0])),
          y: data.map(d => d[1])
        }
      })

    // expand the graph when opening
    container.ontoggle = () => container.open && Plotly.react(chartContainer, traces)
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
