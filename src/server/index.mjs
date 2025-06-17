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

app.use('/', router)
app.use('/rtcstats-view', router)

app.listen(APP_PORT, () => {
  log.info('App started on port: %s', APP_PORT)
})
