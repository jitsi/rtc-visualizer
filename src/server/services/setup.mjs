import log from '../logger.mjs'
import { DynamoDBAdapter } from './dynamodb.mjs'
import { GridFSAdapter } from './gridfs.mjs'
import { MongoDBAdapter } from './mongodb.mjs'
import { S3Adapter } from './s3.mjs'

const {
  SERVICE_TYPE,
  RTCSTATS_METADATA_TABLE,
  AWS_REGION,
  RTCSTATS_S3_BUCKET,
  MONGODB_URI,
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

  switch (SERVICE_TYPE) {
    case 'AWS':
      if (!AWS_REGION || !RTCSTATS_METADATA_TABLE || !RTCSTATS_S3_BUCKET) {
        log.error('Error: Missing required environment variables for AWS setup.')
        process.exit(1)
      }

      metadataManager = new DynamoDBAdapter()
      await metadataManager.connect()
      fileStorageManager = new S3Adapter()
      await fileStorageManager.connect()

      break

    case 'MongoDB':
      if (!MONGODB_URI || !RTCSTATS_MONGODB_NAME || !RTCSTATS_METADATA_COLLECTION || !RTCSTATS_GRIDFS_BUCKET) {
        log.error('Error: Missing required environment variables for MongoDB setup.')
        process.exit(1)
      }

      metadataManager = new MongoDBAdapter()
      await metadataManager.connect()
      fileStorageManager = new GridFSAdapter(metadataManager.nativeDb)

      break

    default:
      log.error('Unsupported SERVICE_TYPE:', SERVICE_TYPE)
      process.exit(1)
  }

  return { metadataManager, fileStorageManager }
}
