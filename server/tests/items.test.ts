import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import type Database from 'better-sqlite3'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import { createDatabase } from '../src/db'
import type { Item } from '../src/types'

const seedDirectory = resolve(__dirname, '../seed')
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])

describe('items API', () => {
  let directory: string
  let database: Database.Database
  let app: ReturnType<typeof createApp>

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'campus-found-test-'))
    database = createDatabase(':memory:', join(seedDirectory, 'items.json'))
    const locations = JSON.parse(readFileSync(join(seedDirectory, 'locations.json'), 'utf8')) as Array<{ id: string }>
    app = createApp({
      database,
      uploadDir: join(directory, 'uploads'),
      corsOrigins: ['http://localhost:5173'],
      locationIds: locations.map(location => location.id),
    })
  })

  afterEach(() => {
    database.close()
    rmSync(directory, { recursive: true, force: true })
  })

  const validFields = {
    type: 'lost',
    title: 'Missing notebook',
    category: 'books',
    locationId: 'lib-2f',
    dateOccurred: '2026-10-18',
    description: 'Blue notebook left by the study tables.',
    contactName: 'Test User',
    contactEmail: 'test@example.edu',
  }

  it('creates an item and stores an uploaded image under a generated filename', async () => {
    const response = await request(app)
      .post('/api/items')
      .field(validFields)
      .attach('image', png, { filename: 'photo.png', contentType: 'image/png' })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      ...validFields,
      status: 'open',
      imageUrl: expect.stringMatching(/^\/uploads\/[0-9a-f-]+\.png$/),
    })
    expect(response.body.id).toMatch(/^itm_[0-9a-f]{24}$/)
    expect(response.body.dateReported).toBeTruthy()
    const uploaded = await request(app).get(response.body.imageUrl)
    expect(uploaded.status).toBe(200)
  })

  it('returns field errors for invalid item data', async () => {
    const response = await request(app)
      .post('/api/items')
      .field({ ...validFields, title: 'x', contactEmail: 'invalid', locationId: 'unknown' })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(response.body.error.fields).toMatchObject({
      title: expect.any(String),
      contactEmail: expect.any(String),
      locationId: expect.any(String),
    })
  })

  it('rejects image data whose magic bytes are not a supported image', async () => {
    const response = await request(app)
      .post('/api/items')
      .field(validFields)
      .attach('image', Buffer.from('not an image'), { filename: 'image.png', contentType: 'image/png' })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('INVALID_IMAGE')
  })

  it('claims an open found item', async () => {
    const response = await request(app).patch('/api/items/itm_001/claim')

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ id: 'itm_001', type: 'found', status: 'claimed' })
  })

  it('rejects a second claim with 409', async () => {
    const first = await request(app).patch('/api/items/itm_001/claim')
    const second = await request(app).patch('/api/items/itm_001/claim')

    expect(first.status).toBe(200)
    expect(second.status).toBe(409)
    expect(second.body.error.code).toBe('ITEM_NOT_CLAIMABLE')
  })

  it('returns 404 when claiming an unknown item', async () => {
    const response = await request(app).patch('/api/items/missing-item/claim')

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('ITEM_NOT_FOUND')
  })
})
