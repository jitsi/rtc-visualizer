import express from 'express'

const router = express.Router()

router.get('/', (req, res) => {
  const config = {
    filesEndpoint: process.env.RTCSTATS_FILES_ENDPOINT
  }

  res.json(config)
})

export default router
