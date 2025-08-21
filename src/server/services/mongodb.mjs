import mongoose from 'mongoose'
import logger from '../logger.mjs'
import { DatabaseAdapter } from './database-adapter.mjs'

const {
  RTCSTATS_MONGODB_URI,
  RTCSTATS_MONGODB_NAME,
  RTCSTATS_METADATA_COLLECTION
} = process.env

export class MongoDBAdapter extends DatabaseAdapter {
  constructor () {
    super()

    const metadataSchema = new mongoose.Schema({
      conferenceId: { type: String, index: true },
      conferenceUrl: { type: String, index: true },
      dumpId: String,
      userId: String,
      app: String,
      sessionId: { type: String, index: true },
      logsId: String,
      startDate: { type: Number, index: true },
      endDate: Number
    }, {
      collection: RTCSTATS_METADATA_COLLECTION,
      versionKey: false
    })

    this._model = mongoose.models.Metadata || mongoose.model('Metadata', metadataSchema)
  }

  async connect () {
    await mongoose.connect(RTCSTATS_MONGODB_URI, { dbName: RTCSTATS_MONGODB_NAME })
    logger.info(`Successfully connected to MongoDB database: ${RTCSTATS_MONGODB_NAME}`)
  }

  get nativeDb () {
    return mongoose.connection.db
  }

  _makeSessionQuery (sessionId) {
    return { sessionId: sessionId }
  }

  _makeConferenceQuery (conferenceId, minDate = 0, maxDate = new Date().getTime()) {
    const query = {
      startDate: { $gte: minDate, $lte: maxDate }
    }

    if (conferenceId.includes('/')) {
      query.conferenceUrl = conferenceId
    } else {
      query.conferenceId = conferenceId
    }

    return query
  }

  async doQuery ({ sessionId, meetingUniqueId, conferenceId, minDate, maxDate }) {
    const query = (sessionId || meetingUniqueId)
      ? this._makeSessionQuery(sessionId || meetingUniqueId)
      : this._makeConferenceQuery(conferenceId, minDate, maxDate)

    const results = await this._model.find(query)

    logger.info('Found in db:', results)

    return results
  }
}
