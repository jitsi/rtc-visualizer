import { MongoClient } from 'mongodb'
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
import fs from 'fs'
import { config } from 'dotenv'

config()

const {
  MONGODB_URI,
  RTCSTATS_MONGODB_NAME,
  RTCSTATS_METADATA_COLLECTION
} = process.env

const __dirname = dirname(fileURLToPath(import.meta.url))

if (!MONGODB_URI || !RTCSTATS_MONGODB_NAME || !RTCSTATS_METADATA_COLLECTION) {
  console.error(
    'Error: MONGODB_URI, RTCSTATS_MONGODB_NAME, and RTCSTATS_METADATA_COLLECTION ' +
        'environment variables must be set.'
  )
  process.exit(1)
}

const collectionName = RTCSTATS_METADATA_COLLECTION

const indexDefinitions = [
  {
    key: {
      conferenceId: 1,
      dumpId: 1
    },
    name: 'PK_conferenceId_dumpId',
    unique: true
  },
  {
    key: {
      conferenceUrl: 1,
      startDate: 1
    },
    name: 'GSI_conferenceUrl_startDate'
  },
  {
    key: {
      conferenceId: 1,
      startDate: 1
    },
    name: 'GSI_conferenceId_startDate'
  },
  {
    key: {
      sessionId: 1,
      startDate: 1
    },
    name: 'GSI_sessionId_startDate'
  }
]

async function resetMongoDB () {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log('Successfully connected to MongoDB server.')

    const db = client.db(RTCSTATS_MONGODB_NAME)
    const collection = db.collection(collectionName)

    const collections = await db.listCollections({ name: collectionName }).toArray()

    if (collections.length > 0) {
      console.log(`Collection '${collectionName}' already exists. Dropping and recreating...`)
      await collection.drop()
      console.log(`Collection '${collectionName}' dropped successfully.`)
    }

    console.log(`Creating new collection '${collectionName}' and applying indexes...`)
    const result = await collection.createIndexes(indexDefinitions)

    console.log('Successfully created indexes:', result)

    const jsonData = JSON.parse(fs.readFileSync(path.resolve(__dirname, './misc/items.json')))
    const resultInserted = await collection.insertMany(jsonData)
    console.log(`${resultInserted.insertedCount} documents inserted.`)

    // Fetch and print the inserted documents
    const insertedDocs = await collection.find({}).toArray()
    console.log('Inserted Documents:', insertedDocs)
  } catch (err) {
    console.error('An error occurred during MongoDB setup:', err)
  } finally {
    await client.close()
    console.log('MongoDB connection closed.')
  }
}

resetMongoDB()
