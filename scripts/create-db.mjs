import AWS from 'aws-sdk'
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
import fs from 'fs'
import { config } from 'dotenv'

config()

const {
  RTCSTATS_METADATA_TABLE,
  AWS_REGION
} = process.env

AWS.config.update({
  region: AWS_REGION,
  endpoint: 'http://localhost:8000'
})

const __dirname = dirname(fileURLToPath(import.meta.url))

const loadData = (client, items) => {
  items.forEach(Item => {
    const params = {
      TableName: RTCSTATS_METADATA_TABLE,
      Item
    }
    client.put(params, (err, data) => {
      if (err) {
        console.log('Unable to add item', Item, err)
      } else {
        console.log('Item added', Item)
      }
    })
  })
}

const tableConfig = {
  TableName: RTCSTATS_METADATA_TABLE,
  AttributeDefinitions: [
    {
      AttributeName: 'conferenceId',
      AttributeType: 'S'
    },
    {
      AttributeName: 'conferenceUrl',
      AttributeType: 'S'
    },
    {
      AttributeName: 'dumpId',
      AttributeType: 'S'
    },
    {
      AttributeName: 'startDate',
      AttributeType: 'N'
    },
    {
      AttributeName: 'sessionId',
      AttributeType: 'S'
    }
  ],
  KeySchema: [
    {
      AttributeName: 'conferenceId',
      KeyType: 'HASH'
    },
    {
      AttributeName: 'dumpId',
      KeyType: 'RANGE'
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  },
  GlobalSecondaryIndexes: [
    {
      IndexName: 'conferenceUrl-startDate-index',
      KeySchema: [
        {
          AttributeName: 'conferenceUrl',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'startDate',
          KeyType: 'RANGE'
        }
      ],
      Projection: {
        ProjectionType: 'ALL'
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    },
    {
      IndexName: 'conferenceId-startDate-index',
      KeySchema: [
        {
          AttributeName: 'conferenceId',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'startDate',
          KeyType: 'RANGE'
        }
      ],
      Projection: {
        ProjectionType: 'ALL'
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    },
    {
      IndexName: 'sessionId-startDate-index',
      KeySchema: [
        {
          AttributeName: 'sessionId',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'startDate',
          KeyType: 'RANGE'
        }
      ],
      Projection: {
        ProjectionType: 'ALL'
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    }
  ],
  StreamSpecification: {
    StreamEnabled: false
  }
}

const createTable = () => ddb.createTable(tableConfig, (err, data) => {
  if (err) {
    console.log('Could not create table', err)
  } else {
    const client = new AWS.DynamoDB.DocumentClient()

    loadData(client, JSON.parse(
      fs.readFileSync(
        path.resolve(
          __dirname, './misc/items.json'))))
  }
})

const deleteTable = () => new Promise((resolve, reject) => {
  ddb.deleteTable({
    TableName: RTCSTATS_METADATA_TABLE
  }, (err, data) => {
    if (err) {
      reject(err)
    } else {
      console.log(data)
      resolve(data)
    }
  })
})

const ddb = new AWS.DynamoDB()

ddb.listTables(async (err, data) => {
  if (err) {
    console.error('Could not list tables', err)
    return
  }

  const tableExists = Boolean(data.TableNames.find(t => t === RTCSTATS_METADATA_TABLE))

  if (tableExists) {
    try {
      console.log('Table exists, deleting and recreating...')

      await deleteTable()
      createTable()
    } catch (err) {
      console.error('Could not delete table', err)
    }
  } else {
    console.log('Creating new table...')
    createTable()
  }
})
