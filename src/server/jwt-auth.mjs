import jwt from 'jsonwebtoken'
import log from './logger.mjs'

function addPEMHeaders (headerlessPEMKey) {
  return `-----BEGIN CERTIFICATE-----\n${headerlessPEMKey}\n-----END CERTIFICATE-----`
}

function addRSAPublicKeyPEMHeaders(headerlessPEMKey) {
  const nlHeaderlessPEMKey = headerlessPEMKey.replace(/(.{64})/g, '$1\n');

  return `-----BEGIN PUBLIC KEY-----\n${nlHeaderlessPEMKey}\n-----END PUBLIC KEY-----`;
}

const { RTCSTATS_JWT_PUBLIC_KEY } = process.env
const { RTCSTATS_JWT_EGHT_PUBLIC_KEY } = process.env

const formattedKeyJaaS = addPEMHeaders(RTCSTATS_JWT_PUBLIC_KEY)
const formattedKeyEGHT = addRSAPublicKeyPEMHeaders(RTCSTATS_JWT_EGHT_PUBLIC_KEY)


function isValidJaaSToken(authorization) {
  try {
    const bearerToken = authorization.substring(7)
    const decodedToken = jwt.verify(bearerToken, formattedKeyJaaS)

    return decodedToken;    
  } catch (error) {
    log.error(`JAAS Bearer authorization failed: ${JSON.stringify(error)}`)
  }
}

function isValidEGHTToken(authorization) {
  try {
    const bearerToken = authorization.substring(7)
    const decodedToken = jwt.verify(bearerToken, formattedKeyEGHT)

    return decodedToken;    
  } catch (error) {
    log.error(`EGHT Bearer authorization failed: ${JSON.stringify(error)}`)
  }
}

export default (req, res, next) => {
  const { headers: { authorization = '' } = {} } = req

  if (authorization.startsWith('Bearer ')) {
    const decodedToken = isValidJaaSToken(authorization) || isValidEGHTToken(authorization);
    
    if (decodedToken) {
      req.user = decodedToken
      return next()
    }

    res.status(401).json({ error: 'Unauthorized' })
  } else {
    log.warn(`Bearer authorization token not present, found: ${authorization}`)

    res.status(401).json({ error: 'Unauthorized' })
  }
}
