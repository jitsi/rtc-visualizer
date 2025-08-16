import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import { createSearchRoutes } from '../../search.mjs'

let searchRouter
let searchHandler

const mockMetadataManager = {
  doQuery: jest.fn()
}

const mockSearchResults = [{ conferenceId: 'test-conf', dumpId: 'dump-123' }]

const mockResponse = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('Search Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    searchRouter = createSearchRoutes(mockMetadataManager)
    searchHandler = searchRouter.stack.find(layer => layer.route.path === '/' && layer.route.methods.get).route.stack[0].handle
  })

  it('should call metadataManager.doQuery with processed params and return results', async () => {
    const req = {
      query: { conferenceId: 'MyConference' }
    }
    const res = mockResponse()
    mockMetadataManager.doQuery.mockResolvedValue(mockSearchResults)

    await searchHandler(req, res)

    expect(mockMetadataManager.doQuery).toHaveBeenCalledWith({
      conferenceId: 'myconference'
    })

    expect(res.status).not.toHaveBeenCalled()
    expect(res.send).toHaveBeenCalledWith(mockSearchResults)
  })

  it('should correctly normalize, convert, and clean up query parameters', async () => {
    const req = {
      query: {
        userId: 'USER-ID',
        conferenceId: 'CONF-ID@conference.tenant.8x8.vc',
        minDate: '2025-08-15',
        maxDate: '2025-08-16'
      }
    }
    const res = mockResponse()
    mockMetadataManager.doQuery.mockResolvedValue([])

    await searchHandler(req, res)

    const expectedParams = {
      userId: 'user-id',
      conferenceId: '8x8.vc/tenant/conf-id',
      minDate: new Date('2025-08-15T00:00:00').getTime(),
      maxDate: new Date('2025-08-16T23:59:59').getTime()
    }
    expect(mockMetadataManager.doQuery).toHaveBeenCalledWith(expectedParams)
  })

  it('should return a 400 error if conferenceId and sessionId are missing', async () => {
    const req = { query: {} }
    const res = mockResponse()

    await searchHandler(req, res)

    expect(mockMetadataManager.doQuery).not.toHaveBeenCalled()

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'ParamError',
      text: 'Param "conference" or "session" is required'
    })
  })

  it('should return a 500 error if metadataManager.doQuery throws an error', async () => {
    const req = { query: { conferenceId: 'any-conf' } }
    const res = mockResponse()
    const dbError = new Error('Database connection lost')

    mockMetadataManager.doQuery.mockRejectedValue(dbError)

    await searchHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      error: 'DBError',
      text: 'Database connection lost'
    })
  })
})
