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

// use custom logger
app.use(expressLog)
app.use('/healthcheck', healthRoute)

// Config object needs to be available on all environments (JaaS, standalone)
app.use('/rtc-visualizer/config', config)
app.use('/meet-external/rtc-visualizer/config', config)

// use just jwt authentication for this path
app.use('/rtc-visualizer/files', jwtAuth, filesRoutes)
app.use('/rtc-visualizer', express.static(path.join(path.resolve(), 'public')))

// serve static files from /public
app.use(express.static(path.join(path.resolve(), 'public')))

// use basic auth
app.use(basicAuth)

app.use('/files', filesRoutes)
app.use('/search', searchRoutes)
app.use('/download', downloadRoutes)
app.use('/version', versionRoute)

app.listen(APP_PORT, () => {
  log.info('App started on port: %s', APP_PORT)
})
