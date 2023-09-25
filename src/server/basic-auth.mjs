import fs from 'fs'
import basicAuth from 'express-basic-auth'

const { USERS_FILE } = process.env
const users = JSON.parse(fs.readFileSync(USERS_FILE))

export default (req, res, next) => {
  return basicAuth({
    users,
    challenge: true
  })(req, res, next)
}
