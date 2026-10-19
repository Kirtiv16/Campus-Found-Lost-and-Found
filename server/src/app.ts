import cors from 'cors'
import express, { type ErrorRequestHandler, type RequestHandler } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import multer from 'multer'
import { randomBytes, randomUUID } from 'node:crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type Database from 'better-sqlite3'
import { z } from 'zod'
import { getItemStatements } from './db'
import type { Item } from './types'

interface AppOptions {
  database: Database.Database
  uploadDir: string
  corsOrigins: string[]
  locationIds: string[]
}

interface ApiError extends Error {
  status?: number
  code?: string
  fields?: Record<string, string>
}

const categories = ['electronics', 'id-card', 'books', 'clothing', 'keys', 'accessories', 'other'] as const
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 20 },
})
const rateLimitHandler: RequestHandler = (_req, res) => {
  res.status(429).json({
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please try again later.',
    },
  })
}

function makeItemSchema(locationIds: string[]) {
  return z.object({
    type: z.enum(['lost', 'found'], { required_error: 'Choose whether it is lost or found.' }),
    title: z.string().trim().min(3, 'Use at least 3 characters.').max(60, 'Keep the title under 60 characters.'),
    description: z.string().max(300, 'Keep the description under 300 characters.'),
    category: z.enum(categories, { required_error: 'Choose a category.' }),
    locationId: z.string().min(1, 'Choose a campus location.')
      .refine(value => locationIds.includes(value), 'Choose a valid campus location.'),
    dateOccurred: z.string().min(1, 'Choose the date it happened.')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a valid date.')
      .refine(value => {
        const date = new Date(`${value}T00:00:00.000Z`)
        return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
          && value <= new Date().toISOString().slice(0, 10)
      }, 'Date cannot be in the future.'),
    contactName: z.string().trim().min(2, 'Add a name so people know who to contact.'),
    contactEmail: z.string().trim().email('Enter a valid email address.'),
  })
}

function apiError(status: number, code: string, message: string, fields?: Record<string, string>): ApiError {
  return Object.assign(new Error(message), { status, code, fields })
}

function asyncHandler(handler: (req: express.Request, res: express.Response) => Promise<void>): RequestHandler {
  return (req, res, next) => {
    void handler(req, res).catch(next)
  }
}

function detectImage(buffer: Buffer): { extension: string } | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { extension: '.jpg' }
  }
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { extension: '.png' }
  }
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return { extension: '.webp' }
  }
  return null
}

export function createApp({ database, uploadDir, corsOrigins, locationIds }: AppOptions) {
  const app = express()
  const statements = getItemStatements(database)
  const itemSchema = makeItemSchema(locationIds)

  app.disable('x-powered-by')
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }))
  app.use(cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(apiError(403, 'CORS_ORIGIN_DENIED', 'This origin is not allowed.'))
      }
    },
  }))
  app.use(express.json({ limit: '100kb' }))
  app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: rateLimitHandler,
  }))
  app.use('/uploads', express.static(uploadDir, {
    fallthrough: false,
    immutable: true,
    maxAge: '1y',
  }))

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.get('/api/items', (_req, res) => {
    res.json(statements.all.all() as Item[])
  })

  app.post('/api/items', rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: rateLimitHandler,
  }), upload.single('image'), asyncHandler(async (req, res) => {
    const parsed = itemSchema.safeParse(req.body)
    if (!parsed.success) {
      const fields: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string' && fields[field] === undefined) fields[field] = issue.message
      }
      throw apiError(400, 'VALIDATION_ERROR', 'Please correct the highlighted fields.', fields)
    }

    let imageUrl = ''
    let savedImagePath: string | undefined
    if (req.file) {
      const image = detectImage(req.file.buffer)
      if (!image) throw apiError(400, 'INVALID_IMAGE', 'Image must be a valid JPEG, PNG, or WebP file.')
      await mkdir(uploadDir, { recursive: true })
      const filename = `${randomUUID()}${image.extension}`
      savedImagePath = join(uploadDir, filename)
      await writeFile(savedImagePath, req.file.buffer)
      imageUrl = `/uploads/${filename}`
    }

    const item: Item = {
      ...parsed.data,
      id: `itm_${randomBytes(12).toString('hex')}`,
      dateReported: new Date().toISOString(),
      status: 'open',
      imageUrl,
    }

    try {
      statements.insert.run(item)
    } catch (error) {
      if (savedImagePath) await unlink(savedImagePath)
      throw error
    }
    res.status(201).json(item)
  }))

  app.patch('/api/items/:id/claim', (req, res, next) => {
    try {
      const existing = statements.byId.get(req.params.id) as Item | undefined
      if (!existing) throw apiError(404, 'ITEM_NOT_FOUND', 'Item not found.')
      const result = statements.claim.run(req.params.id)
      if (result.changes === 0) throw apiError(409, 'ITEM_NOT_CLAIMABLE', 'Only open found items can be claimed.')
      res.json(statements.byId.get(req.params.id) as Item)
    } catch (error) {
      next(error)
    }
  })

  const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    if (error instanceof multer.MulterError) {
      const tooLarge = error.code === 'LIMIT_FILE_SIZE'
      res.status(400).json({
        error: {
          code: tooLarge ? 'IMAGE_TOO_LARGE' : 'INVALID_UPLOAD',
          message: tooLarge ? 'Image must be 5 MB or smaller.' : 'Only one image file may be uploaded.',
          fields: { image: tooLarge ? 'Image must be 5 MB or smaller.' : 'Only one image file may be uploaded.' },
        },
      })
      return
    }

    const api = error as ApiError
    const status = api.status ?? 500
    if (status >= 500) console.error(error)
    res.status(status).json({
      error: {
        code: api.code ?? 'INTERNAL_SERVER_ERROR',
        message: api.message || 'An unexpected server error occurred.',
        ...(api.fields ? { fields: api.fields } : {}),
      },
    })
  }
  app.use(errorHandler)

  return app
}
