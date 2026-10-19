import Database from 'better-sqlite3'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'
import type { Item } from './types'

export function createDatabase(databasePath: string, seedPath: string): Database.Database {
  const resolvedDatabasePath = databasePath === ':memory:'
    ? databasePath
    : isAbsolute(databasePath) ? databasePath : resolve(process.cwd(), databasePath)

  if (resolvedDatabasePath !== ':memory:') {
    mkdirSync(dirname(resolvedDatabasePath), { recursive: true })
  }

  const database = new Database(resolvedDatabasePath)
  database.pragma('journal_mode = WAL')
  database.prepare(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('electronics', 'id-card', 'books', 'clothing', 'keys', 'accessories', 'other')),
      locationId TEXT NOT NULL,
      dateOccurred TEXT NOT NULL,
      dateReported TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('open', 'claimed', 'returned')),
      imageUrl TEXT NOT NULL,
      contactName TEXT NOT NULL,
      contactEmail TEXT NOT NULL
    )
  `).run()

  const rowCount = database.prepare('SELECT COUNT(*) AS count FROM items').get() as { count: number }
  if (rowCount.count === 0) {
    const seed = JSON.parse(readFileSync(seedPath, 'utf8')) as Item[]
    const insert = database.prepare(`
      INSERT INTO items (
        id, type, title, description, category, locationId, dateOccurred,
        dateReported, status, imageUrl, contactName, contactEmail
      ) VALUES (
        @id, @type, @title, @description, @category, @locationId, @dateOccurred,
        @dateReported, @status, @imageUrl, @contactName, @contactEmail
      )
    `)
    const insertSeed = database.transaction((items: Item[]) => {
      for (const item of items) insert.run(item)
    })
    insertSeed(seed)
  }

  return database
}

export function getItemStatements(database: Database.Database) {
  return {
    all: database.prepare('SELECT * FROM items ORDER BY dateReported DESC'),
    byId: database.prepare('SELECT * FROM items WHERE id = ?'),
    insert: database.prepare(`
      INSERT INTO items (
        id, type, title, description, category, locationId, dateOccurred,
        dateReported, status, imageUrl, contactName, contactEmail
      ) VALUES (
        @id, @type, @title, @description, @category, @locationId, @dateOccurred,
        @dateReported, @status, @imageUrl, @contactName, @contactEmail
      )
    `),
    claim: database.prepare(`
      UPDATE items SET status = 'claimed'
      WHERE id = ? AND type = 'found' AND status = 'open'
    `),
  }
}
