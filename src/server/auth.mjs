import fs from 'fs'
import basicAuth from 'express-basic-auth'

const { USERS_FILE } = process.env
const users = JSON.parse(fs.readFileSync(USERS_FILE))
const WHITELIST = ['/healthcheck', '/version']

export default (req, res, next) => {
  for (const allowed of WHITELIST) {
    if (req.url === allowed) {
      return next()
    }
  }

  basicAuth({
    users,
    challenge: true
  })(req, res, next)
}
