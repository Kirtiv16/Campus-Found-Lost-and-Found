# Campus Found — Lost & Found

A responsive campus lost-and-found board built with React 18, Vite, TypeScript,
Tailwind CSS, lucide-react, and Zod. The frontend uses the Express API in
`../server` for item persistence; search, filtering, and sorting stay client-side.

## Run locally

Requirements: Node.js 20 or newer.

Start the API in a separate terminal:

```bash
cd ../server
npm install
npm run dev
```

Then install and start the frontend:

```bash
npm install
npm run dev
```

The API defaults to port `4000` with `CORS_ORIGIN=http://localhost:5173`,
`DATABASE_PATH=./data/campus-found.db`, and `UPLOAD_DIR=./uploads`. Override
these values in `server/.env` if needed. Vite runs on
`http://localhost:5173` and proxies `/api` and `/uploads` to
`http://localhost:4000`. To connect directly to a separately hosted API, copy
`.env.example` to `.env` and set `VITE_API_URL` to that API's origin.

## API and persistence

The backend provides:

- `GET /api/health`
- `GET /api/items`
- `POST /api/items` (multipart form; optional image)
- `PATCH /api/items/:id/claim`
- Uploaded images under `/uploads/`

The API stores records in SQLite and serves initial records from the backend seed.
Its scripts are `npm run dev`, `npm test`, `npm run build`, and `npm start`.

## Frontend behavior

- Responsive item grid, detail dialog, and mobile filter sheet.
- Combined search/category/location/status filters. Search is debounced at 300ms;
  dropdowns update immediately.
- Newest, oldest, and nearest sorting. Nearest uses haversine distance between
  campus locations and falls back to newest until a starting point is selected.
- Lost/found badges, status pills, removable filter chips, result announcements,
  and separate first-post and no-match states.
- Post form with Zod validation, future-date guard, image drag/drop and picker,
  5 MB image validation, preview, and object URL cleanup.
- Claim confirmation for open found items and toast announcements.
- Focus-managed dialogs, Escape handling, focus trap, visible focus rings, and
  reduced-motion support.

## Scripts

```bash
npm run dev
npm run build
npm run preview
```
