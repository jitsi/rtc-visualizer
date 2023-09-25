import jwt from 'jsonwebtoken'
import log from './logger.mjs'

function addPEMHeaders (headerlessPEMKey) {
  return `-----BEGIN CERTIFICATE-----\n${headerlessPEMKey}\n-----END CERTIFICATE-----`
}

const { RTCSTATS_JWT_PUBLIC_KEY } = process.env
const formattedKey = addPEMHeaders(RTCSTATS_JWT_PUBLIC_KEY)

export default (req, res, next) => {
  const { headers: { authorization = '' } = {} } = req

  if (authorization.startsWith('Bearer ')) {
    try {
      const bearerToken = authorization.substring(7)
      const decodedToken = jwt.verify(bearerToken, formattedKey)

      req.user = decodedToken

      next()
    } catch (error) {
      log.error(`Bearer authorization failed: ${JSON.stringify(error)}`)
      res.status(401).json({ error: 'Unauthorized' })
    }
  } else {
    log.warn(`Bearer authorization token not present, found: ${authorization}`)

    res.status(401).json({ error: 'Unauthorized' })
  }
}
