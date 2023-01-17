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

router.get('/', async (req, res) => {
  const { query } = req
  const params = convertDateParams(normalizeQueryParams(query))

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
