import { config as dotenvConfig } from 'dotenv'

const envConfig = dotenvConfig()

import('./logger.mjs').then(({ default: log }) => {
  if (envConfig.error) {
    log.error('Config file missing')
  } else {
    log.info('Config file loaded')
  }
})
