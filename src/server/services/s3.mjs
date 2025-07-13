import AWS from 'aws-sdk'
import log from '../logger.mjs'
import { FileStorageAdapter } from './file-storage-adapter.mjs'

const {
  AWS_REGION: region,
  RTCSTATS_S3_BUCKET,
  RTCSTATS_S3_ENDPOINT: endpoint
} = process.env

const config = {
  region
}

export class S3Adapter extends FileStorageAdapter {
  async connect () {
    AWS.config.update(config)

    // Use endpoint for local S3 (e.g., MinIO or LocalStack).
    // Falls back to default AWS S3 if no endpoint is specified.
    this._s3 = new AWS.S3(endpoint ? { endpoint } : {})

    log.info('S3 Adapter configured.')

    return Promise.resolve()
  }

  async fileExists (key) {
    if (!this._s3) {
      throw new Error('Connection not established. Call connect() first.')
    }

    const obj = { Bucket: RTCSTATS_S3_BUCKET, Key: key }

    try {
      const code = await this._s3.headObject(obj).promise()
      log.info('File exists in S3', { obj, code })

      return true
    } catch (err) {
      if (err.code === 'NotFound') {
        log.warn('File does not exist in S3', { obj, err })

        return false
      }

      log.error('Error finding the file in S3', { obj, err })

      return false
    }
  }

  getFileStream (key) {
    if (!this._s3) {
      throw new Error('Connection not established. Call connect() first.')
    }

    const obj = { Bucket: RTCSTATS_S3_BUCKET, Key: key }
    const stream = this._s3.getObject(obj).createReadStream()

    log.info('Start streaming file %s', key)

    // errors on service
    stream.on('error', err => {
      log.error('Error streaming file', { obj, err })
    })

    return stream
  }
}
