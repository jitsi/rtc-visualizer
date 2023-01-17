import fs from 'fs'
import express from 'express'

const pck = fs.readFileSync('./package.json')
const { version } = JSON.parse(pck)
const router = express.Router()

router.get('/', (req, res) => res.status(200).end(version))

export default router
