import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import { createDownloadRoutes } from '../../download.mjs'

const mockFileStorageManager = {
  fileExists: jest.fn(),
  getFileStream: jest.fn()
}

const mockStream = {
  pipe: jest.fn().mockReturnThis(),
  on: jest.fn().mockReturnThis()
}

const mockResponse = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.end = jest.fn().mockReturnValue(res)
  return res
}

describe('Download Routes', () => {
  let downloadRouter
  let downloadHandler

  beforeEach(() => {
    jest.clearAllMocks()
    downloadRouter = createDownloadRoutes(mockFileStorageManager)
    downloadHandler = downloadRouter.stack.find(layer => layer.route.path === '/:fileName' && layer.route.methods.get).route.stack[0].handle
  })

  it('should download the file if it exists', async () => {
    const req = {
      params: { fileName: 'test.dump' }
    }
    const res = mockResponse()

    mockFileStorageManager.fileExists.mockResolvedValue(true)
    mockFileStorageManager.getFileStream.mockReturnValue(mockStream)

    await downloadHandler(req, res)

    expect(mockFileStorageManager.fileExists).toHaveBeenCalledWith('test.dump')
    expect(mockFileStorageManager.getFileStream).toHaveBeenCalledWith('test.dump')
    expect(mockStream.pipe).toHaveBeenCalledWith(res)
    expect(res.status).not.toHaveBeenCalled()
  })

  it('should return a 404 error if the file does not exist', async () => {
    const req = {
      params: { fileName: 'not-found.dump' }
    }
    const res = mockResponse()

    mockFileStorageManager.fileExists.mockResolvedValue(false)

    await downloadHandler(req, res)

    expect(mockFileStorageManager.fileExists).toHaveBeenCalledWith('not-found.dump')
    expect(mockFileStorageManager.getFileStream).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.end).toHaveBeenCalled()
  })
})
