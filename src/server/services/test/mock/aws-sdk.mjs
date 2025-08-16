import { jest } from '@jest/globals'

export const mockHeadObject = jest.fn()
export const mockPromise = jest.fn()
export const mockGetObject = jest.fn()
export const mockStream = {
  on: jest.fn()
}

const mockAWS = {
  config: {
    update: jest.fn()
  },
  S3: jest.fn().mockImplementation(() => {
    return {
      headObject: mockHeadObject.mockReturnValue({
        promise: mockPromise
      }),
      getObject: mockGetObject.mockReturnValue({
        createReadStream: jest.fn().mockReturnValue(mockStream)
      })
    }
  })
}

export default mockAWS
