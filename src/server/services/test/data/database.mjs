// Basic dataset for testing various logic paths
export const basicTestData = [
  { conferenceId: 'room-101', conferenceUrl: 'tenant-a/room-101', sessionId: 'session-abc-123', startDate: 1723456789000, dumpId: 'dump-001' },
  { conferenceId: 'general-meeting', conferenceUrl: 'tenant-b/general-meeting', sessionId: 'session-def-456', startDate: 1723456889000, dumpId: 'dump-002' },
  { conferenceId: 'project-x-meeting', conferenceUrl: 'tenant-c/project-x', sessionId: 'session-ghi-789', startDate: 1723456989000, dumpId: 'dump-003' },
  { conferenceId: 'general-meeting', conferenceUrl: 'tenant-b/general-meeting', sessionId: 'session-jkl-012', startDate: 1723457089000, dumpId: 'dump-004' }
]

// Dataset specialized for boundary value testing
const meetingTimeStart = new Date('2025-08-11T10:00:00Z').getTime()
const meetingTimeMiddle = new Date('2025-08-11T11:00:00Z').getTime()
const meetingTimeEnd = new Date('2025-08-11T12:00:00Z').getTime()

export const boundaryTestData = [
  { conferenceId: 'boundary-test-meeting', startDate: meetingTimeStart, dumpId: 'boundary-start' },
  { conferenceId: 'boundary-test-meeting', startDate: meetingTimeMiddle, dumpId: 'boundary-middle' },
  { conferenceId: 'boundary-test-meeting', startDate: meetingTimeEnd, dumpId: 'boundary-end' }
]
