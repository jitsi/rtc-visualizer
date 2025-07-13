import path from 'path'
import express from 'express'

import './config.mjs'
import log, { expressLog } from './logger.mjs'
import config from './routes/config.mjs'
import { createFilesRoutes } from './routes/files.mjs'
import { createSearchRoutes } from './routes/search.mjs'
import { createDownloadRoutes } from './routes/download.mjs'
import healthRoute from './routes/health.mjs'
import versionRoute from './routes/version.mjs'
import basicAuth from './basic-auth.mjs'
import jwtAuth from './jwt-auth.mjs'
import { setupServices } from './services/setup.mjs'

const {
  APP_PORT,
  RTCSTATS_JWT_PUBLIC_KEY,
  RTCSTATS_JWT_EGHT_PUBLIC_KEY,
  RTCSTATS_FILES_ENDPOINT
} = process.env

const app = express()
const router = express.Router()

async function startServer () {
  const { metadataManager, fileStorageManager } = await setupServices()
  log.info('Services initialized')

  const filesRoutes = createFilesRoutes(fileStorageManager)
  const searchRoutes = createSearchRoutes(metadataManager)
  const downloadRoutes = createDownloadRoutes(fileStorageManager)

  // use custom logger
  app.use(expressLog)

  router.use('/healthcheck', healthRoute)

  // This config endpoint is specific to a JaaS deployment.
  // The presence of the RTCSTATS_FILES_ENDPOINT env variable indicates a JaaS environment.
  if (RTCSTATS_FILES_ENDPOINT) {
    router.use('/rtc-visualizer/config', config)
  }

  // Enable JWT-protected routes only if a JWT public key is provided in the environment.
  // This includes the protected file endpoint and its associated static assets.
  if (RTCSTATS_JWT_PUBLIC_KEY || RTCSTATS_JWT_EGHT_PUBLIC_KEY) {
    router.use('/rtc-visualizer/files', jwtAuth, filesRoutes)
    router.use('/rtc-visualizer', express.static(path.join(path.resolve(), 'public')))
  }

  // serve static files from /public
  router.use(express.static(path.join(path.resolve(), 'public')))

  // use basic auth
  router.use(basicAuth)

  router.use('/files', filesRoutes)
  router.use('/search', searchRoutes)
  router.use('/download', downloadRoutes)
  router.use('/version', versionRoute)

  // This server is designed to be path-agnostic. The public-facing subpath
  // is expected to be handled by a reverse proxy.
  // TODO: If any server-side logic ever needs to generate absolute URLs,
  // the public base path should be passed in via an environment variable
  // (e.g., process.env.PUBLIC_BASE_PATH) rather than hardcoding it here.
  app.use('/', router)

  app.listen(APP_PORT, () => {
    log.info('App started on port: %s', APP_PORT)
  })
}

startServer()
