import winston from 'winston'
import morgan from 'morgan'

const { createLogger, format, transports } = winston
const { combine, timestamp, errors, splat, printf, colorize } = format

// The format function for logs
const customPrint = printf(({ level, message, timestamp, ...rest }) => {
  let msg = `${timestamp} [${level}] : ${message} `

  if (Object.keys(rest).length > 0) {
    msg += JSON.stringify(rest, null, '  ')
  }

  return msg
})

const customFormat = combine(
  colorize(),
  splat(),
  timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  errors({ stack: true }),
  customPrint
)

const defaultLogger = createLogger({
  level: 'info',
  format: customFormat,
  transports: [new transports.Console()]
})

export const expressLog = morgan('combined', {
  stream: {
    write: (text) => {
      defaultLogger.info(text)
    }
  },
  // don't log /healthcheck requests
  skip: req => req.baseUrl === '/healthcheck'
})

export default defaultLogger
