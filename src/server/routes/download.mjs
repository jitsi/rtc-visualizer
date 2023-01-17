import express from 'express'
import log from '../logger.mjs'
import { getFileStream, fileExists } from '../services/s3.mjs'

const router = express.Router()

router.get('/:fileName', async (req, res) => {
  const { params: { fileName } } = req

  const canStream = await fileExists(fileName)

  if (canStream) {
    const stream = getFileStream(fileName)

    return stream.pipe(res)
      .on('close', () => {
        log.info('File downloaded %s', fileName)
      })
      // errors while writing data
      .on('error', (err) => {
        log.error('Error downloading file', { fileName, err })
      })
  }

  return res.status(404).end()
})

export default router
