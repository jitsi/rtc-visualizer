import express from 'express'
import log from '../logger.mjs'
import { getFileStream, fileExists } from '../services/s3.mjs'

const router = express.Router()

router.get('/:fileName', async (req, res) => {
  const { params: { fileName } } = req

  const canStream = await fileExists(fileName)

  if (canStream) {
    const stream = getFileStream(fileName)

    // Allow browser to do the unzipping
    res.set('Content-Encoding', 'gzip')

    return stream.pipe(res)
      .on('close', () => {
        log.info('File sent %s', fileName)
      })
      // errors while writing data
      .on('error', (err) => {
        log.error('Error sending file', { fileName, err })
      })
  }

  return res.status(404).end()
})

export default router
