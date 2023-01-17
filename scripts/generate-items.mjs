import { randomUUID } from 'crypto'

const generateFakeItems = (numOfSessions = 100) => {
  const fakeItems = []
  for (let sessionId = 0; sessionId < numOfSessions; sessionId++) {
    const confId = Math.floor(Math.random() * 10)
    const confDuration = 30 * 60 * 1000
    const j = Math.floor(Math.random() * 5)
    for (let userId = 0; userId < j; userId++) {
      const startDate = 1608023389469 + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
      const endDate = startDate + confDuration + Math.floor(Math.random() * 1000)

      fakeItems.push({
        conferenceId: `conf-${confId}`,
        conferenceUrl: `meet.jit.si/${confId}`,
        dumpId: randomUUID() + '.gz',
        logsId: `logs-${userId}.gz`,
        userId: `user-${userId}`,
        startDate: startDate,
        endDate: endDate,
        app: 'Jitsi Meet',
        sessionId: `session-${sessionId}`
      })
    }
  }

  process.stdout.write(JSON.stringify(fakeItems, null, 2))
}

generateFakeItems(process.argv[2])
