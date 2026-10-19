# Campus Found — Lost & Found

Campus Found is a React lost-and-found board backed by an Express API and SQLite.
Filtering, searching, and sorting remain in the browser; item creation and claim
updates are stored by the backend.

## Run locally

Requirements: Node.js 20 or newer.

1. Install and configure the backend:

   ```bash
   cd server
   npm install
   ```

   Copy `server/.env.example` to `server/.env` to configure:

   - `PORT=4000`
   - `CORS_ORIGIN=http://localhost:5173` (comma-separated origins are supported)
   - `DATABASE_PATH=./data/campus-found.db`
   - `UPLOAD_DIR=./uploads`

   The database and uploaded images default to `server/data/` and
   `server/uploads/`.

2. Start the API in one terminal:

   ```bash
   cd server
   npm run dev
   ```

3. Install and start the frontend in another terminal:

   ```bash
   cd campus-lost-found
   npm install
   npm run dev
   ```

   Vite runs on port `5173` and proxies `/api` and `/uploads` to the backend.
   `campus-lost-found/.env.example` sets `VITE_API_URL=`; leave it empty to use
   the Vite proxy, or set it to the API origin when hosting the frontend separately.

## API

- `GET /api/health` — health status
- `GET /api/items` — all items, newest report first
- `POST /api/items` — create an item using multipart form fields and optional `image`
- `PATCH /api/items/:id/claim` — claim an open found item
- `/uploads/<file>` — uploaded JPEG, PNG, and WebP images

Errors use `{ "error": { "code", "message", "fields"? } }`. The API seeds its
database from `server/seed/items.json` only when the items table is empty.

## Verification

```bash
cd server
npm test
npm run build
npm start
```

From `campus-lost-found/`:

```bash
npm run dev
npm run build
npm run preview
```
