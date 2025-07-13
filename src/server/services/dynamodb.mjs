import dynamoose from 'dynamoose'
import logger from '../logger.mjs'
import { DatabaseAdapter } from './database-adapter.mjs'

const {
  RTCSTATS_METADATA_TABLE,
  RTCSTATS_DYNAMODB_ENDPOINT: endpoint
} = process.env

export class DynamoDBAdapter extends DatabaseAdapter {
  constructor () {
    super()

    this._conferencesById = dynamoose.model(
      RTCSTATS_METADATA_TABLE, {
        conferenceId: {
          type: String,
          hashKey: true
        },
        dumpId: String,
        userId: String,
        app: String,
        sessionId: String,
        logsId: String,
        startDate: {
          type: Number,
          rangeKey: true
        },
        endDate: Number
      }, { create: false })

    this._conferencesByUrl = dynamoose.model(
      RTCSTATS_METADATA_TABLE, {
        conferenceId: String,
        conferenceUrl: {
          type: String,
          hashKey: true
        },
        dumpId: String,
        userId: String,
        app: String,
        sessionId: String,
        logsId: String,
        startDate: {
          type: Number,
          rangeKey: true
        },
        endDate: Number
      }, { create: false })

    this._sessions = dynamoose.model(
      RTCSTATS_METADATA_TABLE, {
        conferenceId: String,
        dumpId: String,
        userId: String,
        app: String,
        sessionId: {
          type: String,
          hashKey: true
        },
        logsId: String,
        startDate: {
          type: Number,
          rangeKey: true
        },
        endDate: Number
      }, { create: false })
  }

  async connect () {
    // used for working with local data
    if (endpoint) {
      dynamoose.aws.ddb.local(endpoint)
    }
    console.log('DynamoDB connection configured.')

    return Promise.resolve()
  }

  _makeSessionQuery (sessionId) {
    return this._sessions.query('sessionId').eq(sessionId).using('sessionId-startDate-index')
  }

  _makeConferenceQuery (conferenceId, minDate = 0, maxDate = new Date().getTime()) {
    // Conference names can't contain slashes, so if the conferenceId contains a slash character we assume it's a url
    // and search using the conferenceByUrl index.
    //
    // NOTE that there is no such thing as a "conferenceId". What's stored in that field is the conference name. For
    // example, in a meeting url like this https://meet.jit.si/jitsi/TheCall, "jitsi" is the tenant and "TheCall" is the
    // room (or conference) name. Jicofo generates a unique meeting id but we don't keep track of that field in DynamoDB.
    if (conferenceId.includes('/')) {
      const filter = new dynamoose.Condition()
        .where('conferenceUrl').eq(conferenceId)
        .filter('startDate').between(minDate, maxDate)

      return this._conferencesByUrl.query(filter).using('conferenceUrl-startDate-index')
    } else {
      const filter = new dynamoose.Condition()
        .where('conferenceId').eq(conferenceId)
        .filter('startDate').between(minDate, maxDate)

      return this._conferencesById.query(filter).using('conferenceId-startDate-index')
    }
  }

  async doQuery ({ sessionId, meetingUniqueId, conferenceId, minDate, maxDate }) {
    const query = (sessionId || meetingUniqueId)
      ? this._makeSessionQuery(sessionId || meetingUniqueId)
      : this._makeConferenceQuery(conferenceId, minDate, maxDate)

    let results = await query.exec()

    results = Array.from(results)

    logger.info('Found in db:', results)

    return results
  }
}
