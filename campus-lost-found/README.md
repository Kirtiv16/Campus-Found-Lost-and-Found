# Campus Found — Lost & Found

A polished, responsive campus lost-and-found board built with React, Vite, TypeScript, Tailwind CSS, lucide-react and Zod. It intentionally has no backend or authentication; data is seeded from JSON and persisted in browser localStorage.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints. To verify a production build:

```bash
npm run build
npm run preview
```

## Features

- Responsive 1 / 2 / 3 / 4-column item grid, card detail dialog, and a mobile bottom-sheet filter panel.
- Combined search/category/location/status filters. Search text is debounced at 300ms while dropdowns update immediately.
- Newest, oldest, and nearest sorting. Nearest uses haversine distance between campus location coordinates, ties by newest, and falls back to newest until a starting point is selected.
- Lost/found badges, status pills, removable filter chips, result announcements, separate first-post and no-match states.
- Post form with Zod validation on blur and submit, inline accessible errors, future-date guard, optional description counter, image drag/drop and picker, 5 MB image validation, preview and object URL cleanup.
- Claim confirmation for open found items, immediate status updates, and persistence.
- Simulated initial 700ms service latency and eight dimension-matched skeleton cards; image fallback on load errors.
- Focus-managed dialogs, Escape handling, focus trap, visible focus rings, reduced-motion support and toast announcements.
- Seed items and campus locations live in `src/data/items.json` and `src/data/locations.json`.

## Data and persistence notes

`src/lib/service.ts` wraps asynchronous item operations. `src/lib/filterSort.ts` is pure filtering/sorting logic, and `src/lib/geo.ts` contains the pure haversine distance function. New posts are saved in `campus-found-items-v1`; claim changes are stored separately in `campus-found-status-v1`. Local browser storage is a demo persistence layer, not a substitute for a server database. Large photos can exceed localStorage limits; the service catches quota failures and attempts to save the post without the photo, then the UI shows a gentle toast.

## Project map

- `src/App.tsx`: page composition and derived list state
- `src/components/`: header, filters, cards, skeletons, dialogs, form, empty states, status/type pills and toast
- `src/hooks/`: debounced value, filter state and data service hook
- `src/lib/`: storage, service, validation, geographic and filter/sort helpers
- `src/data/`: JSON seed records and category labels
