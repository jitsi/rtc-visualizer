import log from '../logger.mjs'
import { DynamoDBAdapter } from './dynamodb.mjs'
import { GridFSAdapter } from './gridfs.mjs'
import { MongoDBAdapter } from './mongodb.mjs'
import { S3Adapter } from './s3.mjs'

const {
  RTCSTATS_SERVICE_TYPE,
  RTCSTATS_METADATA_TABLE,
  AWS_REGION,
  RTCSTATS_S3_BUCKET,
  RTCSTATS_MONGODB_URI,
  RTCSTATS_MONGODB_NAME,
  RTCSTATS_METADATA_COLLECTION,
  RTCSTATS_GRIDFS_BUCKET
} = process.env

/**
 * @returns { metadataManager: DatabaseAdapter, fileStorageManager: FileStorageAdapter }
 */
export async function setupServices () {
  let metadataManager
  let fileStorageManager

  switch (RTCSTATS_SERVICE_TYPE) {
    case 'AWS':
      if (!AWS_REGION || !RTCSTATS_METADATA_TABLE || !RTCSTATS_S3_BUCKET) {
        log.error('Error: Missing required environment variables for AWS setup.')
        process.exit(1)
      }

      metadataManager = new DynamoDBAdapter()
      await metadataManager.connect()
      fileStorageManager = new S3Adapter()

      break

    case 'MongoDB':
      if (!RTCSTATS_MONGODB_URI || !RTCSTATS_MONGODB_NAME || !RTCSTATS_METADATA_COLLECTION || !RTCSTATS_GRIDFS_BUCKET) {
        log.error('Error: Missing required environment variables for MongoDB setup.')
        process.exit(1)
      }

      metadataManager = new MongoDBAdapter()
      await metadataManager.connect()
      fileStorageManager = new GridFSAdapter(metadataManager.nativeDb)

      break

    default:
      log.error('Unsupported RTCSTATS_SERVICE_TYPE:', RTCSTATS_SERVICE_TYPE)
      process.exit(1)
  }

  return { metadataManager, fileStorageManager }
}
