import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import { basicTestData, boundaryTestData } from '../data/database.mjs'
import { DynamoDBAdapter } from '../../dynamodb.mjs'
import dynamoose, {
  mockExec,
  mockQuery,
  mockEq,
  mockUsing,
  mockWhere,
  mockFilter,
  mockBetween
} from '../mock/dynamoose.mjs'

describe('DynamoDBAdapter - Unit Test with Shared Mocks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call the correct method chain when querying by sessionId', async () => {
    const targetSessionId = 'session-abc-123'
    const expectedResult = basicTestData.filter(d => d.sessionId === targetSessionId)
    mockExec.mockResolvedValue(expectedResult)

    const dbAdapter = new DynamoDBAdapter()
    await dbAdapter.connect()
    const results = await dbAdapter.doQuery({ sessionId: targetSessionId })

    expect(mockQuery).toHaveBeenCalledWith('sessionId')
    expect(mockEq).toHaveBeenCalledWith(targetSessionId)
    expect(mockUsing).toHaveBeenCalledWith('sessionId-startDate-index')
    expect(mockExec).toHaveBeenCalled()
    expect(results).toEqual(expectedResult)
  })

  it('should call the correct method chain when conferenceId contains a "/"', async () => {
    const targetUrl = 'tenant-c/project-x'
    const expectedResult = basicTestData.filter(d => d.conferenceUrl === targetUrl)
    mockExec.mockResolvedValue(expectedResult)

    const dbAdapter = new DynamoDBAdapter()
    await dbAdapter.connect()
    const results = await dbAdapter.doQuery({ conferenceId: targetUrl })

    expect(dynamoose.Condition).toHaveBeenCalled()
    expect(mockWhere).toHaveBeenCalledWith('conferenceUrl')
    expect(mockEq).toHaveBeenCalledWith(targetUrl)
    expect(mockUsing).toHaveBeenCalledWith('conferenceUrl-startDate-index')
    expect(mockExec).toHaveBeenCalled()
    expect(results).toEqual(expectedResult)
  })

  it('should call the correct method chain when conferenceId does not contain a "/"', async () => {
    const targetId = 'general-meeting'
    const expectedResult = basicTestData.filter(d => d.conferenceId === targetId)
    mockExec.mockResolvedValue(expectedResult)

    const dbAdapter = new DynamoDBAdapter()
    await dbAdapter.connect()
    const results = await dbAdapter.doQuery({ conferenceId: targetId })

    expect(dynamoose.Condition).toHaveBeenCalled()
    expect(mockWhere).toHaveBeenCalledWith('conferenceId')
    expect(mockEq).toHaveBeenCalledWith(targetId)
    expect(mockUsing).toHaveBeenCalledWith('conferenceId-startDate-index')
    expect(mockExec).toHaveBeenCalled()
    expect(results).toEqual(expectedResult)
  })

  it('should call the "between" filter with the correct date range for boundary testing', async () => {
    const minDate = new Date('2025-08-11T10:00:01Z').getTime()
    const maxDate = new Date('2025-08-11T11:59:59Z').getTime()
    const expectedResult = [boundaryTestData[1]]
    mockExec.mockResolvedValue(expectedResult)

    const dbAdapter = new DynamoDBAdapter()
    await dbAdapter.connect()
    const results = await dbAdapter.doQuery({
      conferenceId: 'boundary-test-meeting',
      minDate,
      maxDate
    })

    expect(mockFilter).toHaveBeenCalledWith('startDate')
    expect(mockBetween).toHaveBeenCalledWith(minDate, maxDate)
    expect(mockExec).toHaveBeenCalled()
    expect(results).toEqual(expectedResult)
  })
})
