import { GridFSBucket } from 'mongodb'
import log from '../logger.mjs'
import { FileStorageAdapter } from './file-storage-adapter.mjs'

const {
  RTCSTATS_GRIDFS_BUCKET
} = process.env

export class GridFSAdapter extends FileStorageAdapter {
  constructor (db) {
    super()

    if (!db) {
      throw new Error('A native Db object is required for GridFSAdapter.')
    }
    this._bucket = new GridFSBucket(db, { bucketName: RTCSTATS_GRIDFS_BUCKET })
    this._connected = false
  }

  async connect () {
    this._connected = true
    return Promise.resolve()
  }

  async fileExists (key) {
    if (!this._connected) {
      throw new Error('Connection not established. Call connect() first.')
    }

    const params = { filename: key }

    try {
      const file = await this._bucket.find(params).limit(1).next()

      if (file) {
        log.info('File exists in GridFS', { params })

        return true
      } else {
        log.warn('File does not exist in GridFS', { params })

        return false
      }
    } catch (err) {
      log.error('Error checking file in GridFS', { params, err })

      return false
    }
  }

  getFileStream (key) {
    if (!this._connected) {
      throw new Error('Connection not established. Call connect() first.')
    }

    const stream = this._bucket.openDownloadStreamByName(key)

    log.info('Start streaming from GridFS for filename %s', key)

    stream.on('error', err => {
      log.error('Error streaming file from GridFS', { filename: key, err })
    })

    return stream
  }
}
