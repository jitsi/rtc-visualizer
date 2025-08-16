import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import { GridFSAdapter } from '../../gridfs.mjs'
import {
  GridFSBucket,
  mockFind,
  mockNext,
  mockOpenDownloadStreamByName,
  mockStream
} from '../mock/mongodb.mjs'

describe('GridFSAdapter', () => {
  const mockDb = { name: 'mock-db' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should throw an error if no db object is provided', () => {
      expect(() => {
        // eslint-disable-next-line no-new
        new GridFSAdapter()
      }).toThrow('A native Db object is required for GridFSAdapter.')
    })

    it('should create a GridFSBucket instance with the correct db and bucket name', () => {
      // eslint-disable-next-line no-new
      new GridFSAdapter(mockDb)

      expect(GridFSBucket).toHaveBeenCalledWith(mockDb, {
        bucketName: process.env.RTCSTATS_GRIDFS_BUCKET
      })
      expect(GridFSBucket).toHaveBeenCalledTimes(1)
    })
  })

  describe('fileExists', () => {
    it('should return true if the file exists', async () => {
      const adapter = new GridFSAdapter(mockDb)
      const targetFile = { filename: 'test.dump' }
      mockNext.mockResolvedValueOnce(targetFile)

      const exist = await adapter.fileExists('test.dump')

      expect(mockFind).toHaveBeenCalledWith({ filename: 'test.dump' })
      expect(exist).toBe(true)
    })

    it('should return false if the file does not exist', async () => {
      const adapter = new GridFSAdapter(mockDb)
      mockNext.mockResolvedValueOnce(null)

      const exist = await adapter.fileExists('nonexistent.dump')

      expect(exist).toBe(false)
    })

    it('should return false if the find operation throws an error', async () => {
      const adapter = new GridFSAdapter(mockDb)
      mockNext.mockRejectedValueOnce(new Error('DB connection failed'))

      const exist = await adapter.fileExists('error.dump')

      expect(exist).toBe(false)
    })
  })

  describe('getFileStream', () => {
    it('should call openDownloadStreamByName and return the stream', () => {
      const adapter = new GridFSAdapter(mockDb)
      const filename = 'my-file.dump'
      const stream = adapter.getFileStream(filename)

      expect(mockOpenDownloadStreamByName).toHaveBeenCalledWith(filename)
      expect(stream).toBe(mockStream)
    })
  })
})
