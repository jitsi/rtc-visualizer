import path from 'path'
import express from 'express'

import './config.mjs'
import log, { expressLog } from './logger.mjs'
import filesRoutes from './routes/files.mjs'
import searchRoutes from './routes/search.mjs'
import downloadRoutes from './routes/download.mjs'
import healthRoute from './routes/health.mjs'
import versionRoute from './routes/version.mjs'
import auth from './auth.mjs'

const { APP_PORT } = process.env

const app = express()

// use custom logger
app.use(expressLog)

// use basic auth
app.use(auth)

// serve static files from /public
app.use(express.static(path.join(path.resolve(), 'public')))

app.use('/files', filesRoutes)
app.use('/search', searchRoutes)
app.use('/download', downloadRoutes)
app.use('/version', versionRoute)
app.use('/healthcheck', healthRoute)

app.listen(APP_PORT, () => {
  log.info('App started on port: %s', APP_PORT)
})
