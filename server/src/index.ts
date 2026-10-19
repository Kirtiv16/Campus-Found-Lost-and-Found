import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createApp } from './app'
import { createDatabase } from './db'

const seedDirectory = resolve(__dirname, '../seed')
const locations = JSON.parse(readFileSync(resolve(seedDirectory, 'locations.json'), 'utf8')) as Array<{ id: string }>
const database = createDatabase(
  process.env.DATABASE_PATH ?? './data/campus-found.db',
  resolve(seedDirectory, 'items.json'),
)
const uploadDir = resolve(process.cwd(), process.env.UPLOAD_DIR ?? './uploads')
const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)
const port = Number(process.env.PORT ?? 4000)
const app = createApp({
  database,
  uploadDir,
  corsOrigins,
  locationIds: locations.map(location => location.id),
})

const server = app.listen(port, () => {
  console.log(`Campus Found API listening on port ${port}`)
})

function shutdown() {
  server.close(() => {
    database.close()
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
