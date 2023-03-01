import express from 'express'
import logger from '../logger.mjs'
import { doQuery } from '../services/db.mjs'
import { paramError, dbError } from '../errors.mjs'

const router = express.Router()

const toLowerKeys = ['userId', 'conferenceId']

const normalizeQueryParams = initial => {
  const result = Object.assign({}, initial)

  toLowerKeys.forEach(key => {
    result[key] = initial[key] && initial[key].toLowerCase()
  })

  return result
}

const convertDateParams = initial => {
  const result = Object.assign({}, initial)

  if (result.minDate) { result.minDate = new Date(result.minDate + 'T00:00:00').getTime() }

  if (result.maxDate) { result.maxDate = new Date(result.maxDate + 'T23:59:59').getTime() }

  return result
}

const cleanupConferenceId = initial => {
  const result = Object.assign({}, initial)

  // valid conference "identifiers":
  //     71d7f70fe0c7cf018f8f3902ad7f37f002b0b607b0fda92c8ecc05ca409be217@conference.vpaas-magic-cookie-c7dd65380e584749a9a35a1b0b199ec0.8x8.vc
  //     https://8x8.vc/vpaas-magic-cookie-c7dd65380e584749a9a35a1b0b199ec0/71d7f70fe0c7cf018f8f3902ad7f37f002b0b607b0fda92c8ecc05ca409be217
  if (result.conferenceId) {
    const match = result.conferenceId.match(/(?<conferenceName>^[^@]+)@conference\.(?<tenantName>[^.]+)\.(?<appName>[^.]+\.\w+)$/)
    if (match) {
      const conferenceName = match.groups.conferenceName
      const tenantName = match.group.tenantName
      const appName = match.group.appName
      result.conferenceId = `${appName}/${tenantName}/${conferenceName}`
    } else {
      result.conferenceId = result.conferenceId.replace(/https?:\/\//, '')
    }
  }

  return result
}

router.get('/', async (req, res) => {
  const { query } = req
  const params = cleanupConferenceId(convertDateParams(normalizeQueryParams(query)))

  logger.info('Searching for:', params)

  if (!query.conferenceId && !query.sessionId) {
    return res.status(400).json(paramError('Param "conference" or "session" is required'))
  }

  try {
    const results = await doQuery(params)

    res.send(results)
  } catch (err) {
    logger.error('Error querying', { params, err })

    return res.status(500).json(dbError(err.message))
  }
})

export default router
