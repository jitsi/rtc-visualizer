import express from 'express'
import log from '../logger.mjs'

/**
 * @param {FileStorageAdapter}
 * @returns {express.Router}
 */
export function createDownloadRoutes (fileStorageManager) {
  const router = express.Router()

  router.get('/:fileName', async (req, res) => {
    const { params: { fileName } } = req

    const canStream = await fileStorageManager.fileExists(fileName)

    if (canStream) {
      const stream = fileStorageManager.getFileStream(fileName)

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

  return router
}
