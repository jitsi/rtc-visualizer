import { jest } from '@jest/globals'

export const mockNext = jest.fn()
export const mockLimit = jest.fn().mockReturnValue({ next: mockNext })
export const mockFind = jest.fn().mockReturnValue({ limit: mockLimit })

export const mockOpenDownloadStreamByName = jest.fn()

export const mockStream = {
  on: jest.fn()
}
mockOpenDownloadStreamByName.mockReturnValue(mockStream)

export const GridFSBucket = jest.fn().mockImplementation(() => {
  return {
    find: mockFind,
    openDownloadStreamByName: mockOpenDownloadStreamByName
  }
})
