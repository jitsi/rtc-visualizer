import fs from 'fs'
import basicAuth from 'express-basic-auth'

const { USERS_FILE } = process.env
const users = JSON.parse(fs.readFileSync(USERS_FILE))
const AUTHLIST = ['/search']

export default (req, res, next) => {
  for (const authenticated of AUTHLIST) {
    if (req.path === authenticated) {
      return basicAuth({
        users,
        challenge: true
      })(req, res, next)
    }
  }

  next();
}
