import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import AWS, {
  mockHeadObject,
  mockGetObject,
  mockPromise,
  mockStream
} from '../mock/aws-sdk.mjs'

jest.unstable_mockModule('aws-sdk', () => import('../mock/aws-sdk.mjs'))

describe('S3Adapter', () => {
  let S3Adapter

  beforeEach(async () => {
    S3Adapter = (await import('../../s3.mjs')).S3Adapter
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should update AWS config and create an S3 instance', () => {
      // eslint-disable-next-line no-new
      new S3Adapter()
      expect(AWS.config.update).toHaveBeenCalledWith({ region: process.env.AWS_REGION })
      expect(AWS.S3).toHaveBeenCalledTimes(1)
      expect(AWS.S3).toHaveBeenCalledWith({})
    })
  })

  describe('fileExists', () => {
    let adapter
    beforeEach(() => {
      adapter = new S3Adapter()
    })

    it('should return true if headObject resolves', async () => {
      mockPromise.mockResolvedValueOnce({ ContentLength: 123 })

      const exist = await adapter.fileExists('test.dump')

      expect(exist).toBe(true)
      expect(mockHeadObject).toHaveBeenCalledWith({
        Bucket: process.env.RTCSTATS_S3_BUCKET,
        Key: 'test.dump'
      })
    })

    it('should return false if headObject rejects with a "NotFound" error', async () => {
      const notFoundError = { code: 'NotFound' }
      mockPromise.mockRejectedValueOnce(notFoundError)

      const exist = await adapter.fileExists('not-found.dump')

      expect(exist).toBe(false)
    })

    it('should return false if headObject rejects with another error', async () => {
      const otherError = new Error('Access Denied')
      mockPromise.mockRejectedValueOnce(otherError)

      const exist = await adapter.fileExists('denied.dump')

      expect(exist).toBe(false)
    })
  })

  describe('getFileStream', () => {
    it('should call getObject and createReadStream and return the stream', () => {
      const adapter = new S3Adapter()
      const filename = 'my-file.dump'
      const stream = adapter.getFileStream(filename)

      expect(mockGetObject).toHaveBeenCalledWith({
        Bucket: process.env.RTCSTATS_S3_BUCKET,
        Key: filename
      })
      expect(stream).toBe(mockStream)
    })
  })
})
