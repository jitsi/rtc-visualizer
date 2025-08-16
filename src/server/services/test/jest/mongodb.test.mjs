import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import { basicTestData, boundaryTestData } from '../data/database.mjs'
import { MongoDBAdapter } from '../../mongodb.mjs'
import { mockFind } from '../mock/mongoose.mjs'

describe('MongoDBAdapter - Unit Test with Shared Mocks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call the correct method chain when querying by sessionId', async () => {
    const targetSessionId = 'session-abc-123'
    const expectedResult = basicTestData.filter(d => d.sessionId === targetSessionId)
    mockFind.mockResolvedValue(expectedResult)

    const dbAdapter = new MongoDBAdapter()
    await dbAdapter.connect()
    const results = await dbAdapter.doQuery({ sessionId: targetSessionId })

    const expectedQuery = { sessionId: targetSessionId }
    expect(mockFind).toHaveBeenCalledWith(expectedQuery)
    expect(results).toEqual(expectedResult)
  })

  it('should call the correct method chain when conferenceId contains a "/"', async () => {
    const targetUrl = 'tenant-c/project-x'
    const expectedResult = basicTestData.filter(d => d.conferenceUrl === targetUrl)
    mockFind.mockResolvedValue(expectedResult)

    const dbAdapter = new MongoDBAdapter()
    await dbAdapter.connect()
    const results = await dbAdapter.doQuery({ conferenceId: targetUrl })

    const expectedQuery = {
      startDate: { $gte: 0, $lte: expect.any(Number) },
      conferenceUrl: targetUrl
    }
    expect(mockFind).toHaveBeenCalledWith(expectedQuery)
    expect(results).toEqual(expectedResult)
  })

  it('should call the correct method chain when conferenceId does not contain a "/"', async () => {
    const targetId = 'general-meeting'
    const expectedResult = basicTestData.filter(d => d.conferenceId === targetId)
    mockFind.mockResolvedValue(expectedResult)

    const dbAdapter = new MongoDBAdapter()
    await dbAdapter.connect()
    const results = await dbAdapter.doQuery({ conferenceId: targetId })

    const expectedQuery = {
      startDate: { $gte: 0, $lte: expect.any(Number) },
      conferenceId: targetId
    }
    expect(mockFind).toHaveBeenCalledWith(expectedQuery)
    expect(results).toEqual(expectedResult)
  })

  it('should call the "between" filter with the correct date range for boundary testing', async () => {
    const targetId = 'boundary-test-meeting'
    const minDate = new Date('2025-08-11T10:00:01Z').getTime()
    const maxDate = new Date('2025-08-11T11:59:59Z').getTime()
    const expectedResult = [boundaryTestData[1]]
    mockFind.mockResolvedValue(expectedResult)

    const dbAdapter = new MongoDBAdapter()
    await dbAdapter.connect()
    const results = await dbAdapter.doQuery({
      conferenceId: targetId,
      minDate,
      maxDate
    })

    const expectedQuery = {
      conferenceId: targetId,
      startDate: { $gte: minDate, $lte: maxDate }
    }
    expect(mockFind).toHaveBeenCalledWith(expectedQuery)
    expect(results).toEqual(expectedResult)
  })
})
