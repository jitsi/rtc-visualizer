import path from 'path'
import express from 'express'

import './config.mjs'
import log, { expressLog } from './logger.mjs'
import config from './routes/config.mjs'
import filesRoutes from './routes/files.mjs'
import searchRoutes from './routes/search.mjs'
import downloadRoutes from './routes/download.mjs'
import healthRoute from './routes/health.mjs'
import versionRoute from './routes/version.mjs'
import basicAuth from './basic-auth.mjs'
import jwtAuth from './jwt-auth.mjs'

const { APP_PORT } = process.env

const app = express()
const router = express.Router()

// use custom logger
app.use(expressLog)

router.use('/healthcheck', healthRoute)

// Config object needs to be available on all environments (JaaS, standalone)
router.use('/rtc-visualizer/config', config)
router.use('/meet-external/rtc-visualizer/config', config)

// use just jwt authentication for this path
router.use('/rtc-visualizer/files', jwtAuth, filesRoutes)
router.use('/rtc-visualizer', express.static(path.join(path.resolve(), 'public')))

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
