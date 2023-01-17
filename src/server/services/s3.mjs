import AWS from 'aws-sdk'
import log from '../logger.mjs'

const {
  AWS_REGION: region,
  RTCSTATS_S3_BUCKET
} = process.env

const config = {
  region
}

AWS.config.update(config)

const s3 = new AWS.S3()

export const fileExists = async Key => {
  const obj = { Bucket: RTCSTATS_S3_BUCKET, Key }

  try {
    const code = await s3.headObject(obj).promise()
    log.info('File exists in bucket', { obj, code })

    return true
  } catch (err) {
    log.error('Error finding the file in bucket', { obj, err })

    return false
  }
}

export const getFileStream = Key => {
  const obj = { Bucket: RTCSTATS_S3_BUCKET, Key }
  const stream = s3.getObject({ Bucket: RTCSTATS_S3_BUCKET, Key }).createReadStream()

  log.info('Start streaming file %s', Key)

  // errors on service
  stream.on('error', err => {
    log.error('Error streaming file', { obj, err })
  })

  return stream
}
