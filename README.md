# 💍 Wedding Invitation

A Korean digital wedding invitation (모바일 청첩장) built as a single-page app. Guests can view the wedding details, count down to the date, find the venue on a Kakao map, check the shuttle schedule, and RSVP — all from a mobile browser.

## Features

- **Hero** — Layered invitation cover artwork
- **Story** — Invitation text and couple/parents introduction
- **Calendar** — Wedding date with a mini monthly calendar and live D-day countdown
- **Location** — Kakao map with venue / shuttle / parking markers, 길찾기 links, and a before/after ceremony shuttle timetable. Optional collapsible subway, bus, and parking notes appear only when those lists have data
- **Gifts** — Bank account numbers for gift money, with one-tap copy to clipboard and optional Kakao Pay links
- **RSVP** — Modal form (name, attendance, guest count, message) submitted to Formspree
- **Ending** — Share button with Web Share API / clipboard fallback
- **Music player** — Floating button that plays background music on loop; auto-plays on first user interaction

A photo gallery section exists in the codebase but is not currently mounted in `App.tsx`. See [Gallery photos](#gallery-photos) to enable it.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 8** for development and bundling
- **CSS Modules** — no external UI library
- **Kakao Maps JavaScript SDK** for the venue map
- **Formspree** for RSVP form submissions
- No routing, no state management library, no backend

## Project Structure

```
src/
├── sections/          # Page sections (Hero, Story, Calendar, Location, Gifts, RSVP, Ending)
├── components/        # Shared UI (VenueMap, MusicPlayer, DdayCount, Collapsible, Toast, Button, Input, Gallery)
├── context/           # UIContext — toast notifications and shared modal state
├── hooks/             # useScrollFade — IntersectionObserver-based scroll entrance animation
├── types/             # Kakao Maps SDK type declarations
├── utils/
│   ├── constants/
│   │   ├── weddingInfo.ts      # All wedding data (date, couple, venue, bank accounts)
│   │   └── transportation.ts   # Map points, shuttle times, optional directions
│   ├── kakaoMaps.ts            # Kakao Maps SDK loader
│   ├── dateUtils.ts            # D-day calculation and date formatting helpers
│   └── types.ts                # Shared TypeScript types
public/
└── assets/            # Cover images, SVG icons, background music
docker-compose.yml     # Optional local Vite preview in Docker
.github/workflows/     # GitHub Pages deploy
```

## Getting Started

### Prerequisites

- Node.js 20.19+ (Vite 8). CI uses Node.js 24.
- npm

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` in the project root (`.env` is gitignored):

```env
VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/your_form_id
VITE_KAKAO_MAP_APP_KEY=your_kakao_javascript_key
```

`VITE_BASE_PATH` is optional. Leave it unset for local development (`/`). GitHub Pages sets it in CI so assets work under a project path such as `/mobile_card/`.

See [Formspree setup](#formspree-rsvp) and [Kakao map](#kakao-map-and-shuttle-schedule) below.

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

Preview the build locally:

```bash
npm run preview
```

## Customization

All wedding-specific data lives in a small set of files — you only need to edit those to adapt this for a different wedding.

### `src/utils/constants/weddingInfo.ts`

The central config file. Everything couples-specific lives here.

```ts
weddingDate: {
  year, month, day,   // wedding date
  hour, minute,       // ceremony time (24h)
  dayOfTheWeek,       // e.g. '토요일'
}

bride / groom: {
  self:   { name, bank? }   // add bank to show the person's account in Gifts
  father: { name, bank? }
  mother: { name, bank? }
  // bank: { name, accountNumber, kakaoPayUrl? }
}

venue: {
  venueName, venueAddress, phone,
}

invitationText  // invitation poem shown in the Story section (use \n for line breaks)
musicSrc        // background music URL; keep import.meta.env.BASE_URL so GitHub Pages paths work
```

`WEDDING_COVER` holds the English names used on the original invitation artwork.

### `src/utils/constants/transportation.ts`

Map markers, shuttle times, and optional written directions.

```ts
LOCATION_POINTS     // markers plotted on the Kakao map
                    // venue / parking / suseo; unmatched points are skipped

DIRECTIONS.shuttle.trips
                    // before/after ceremony routes and departure times

DIRECTIONS.subway   // shown only when the array is non-empty
DIRECTIONS.bus
DIRECTIONS.parking  // optional per-lot Naver / Kakao / T-map links
```

### Gallery photos

The gallery is implemented (`src/sections/GallerySection.tsx`) but not rendered. To enable it, import `GallerySection` in `src/App.tsx` and drop image files into `src/assets/gallery/`. Photos are picked up automatically at build time via `import.meta.glob`.

**Ordering:** files are sorted alphabetically, so prefix filenames with numbers to control the display order:
```
01_ceremony.jpg
02_portraits.jpg
03_reception.jpg
```

### Music

The background music is `public/assets/lenny-kravitz-it-aint-over-til-its-over.mp3`. Update `musicSrc` in `weddingInfo.ts` if the filename changes; keep `import.meta.env.BASE_URL` in the path.

### Kakao map and shuttle schedule

The Location section reserves a map area below the venue address.
It stays blank until the Kakao Maps JavaScript SDK is connected. Copy `.env.example`
to `.env`, then set `VITE_KAKAO_MAP_APP_KEY` to your **JavaScript key**.
Register `http://localhost:5173` (and the eventual site domain) in that key's
JavaScript SDK domain settings. Enable the Kakao Map API for the application
if required in Kakao Developers. Restart Vite after changing `.env`.
See the [official Kakao setup guide](https://apis.map.kakao.com/web/guide/).

The JavaScript key is used in the browser; never use an Admin or REST API key here.

- `LOCATION_POINTS` in `src/utils/constants/transportation.ts` defines map locations.
- The church is resolved from a Kakao place id. Suseo Exit 6 is resolved only from an
  unambiguous matching place name; unmatched positions are not plotted.
- **Parking entrance coordinates are pending confirmation.**
  Add `coordinates: { lat, lng }` to the parking entry and update the description
  after verifying the precise location. Until then, parking 길찾기 uses the church
  position. The church also represents the post-ceremony shuttle boarding location;
  it has no separate marker.
- `DIRECTIONS.shuttle.trips` defines the before/after ceremony routes and departure times.
- Without a key or when the SDK fails, the reserved map area stays blank.
  The before/after shuttle cards remain visible.

## Formspree (RSVP)

The RSVP form submits to [Formspree](https://formspree.io), a third-party form backend — no server required.

1. Create a free account at [formspree.io](https://formspree.io) and create a new form.
2. Copy the form endpoint (looks like `https://formspree.io/f/xxxxxxxx`).
3. Add it to your `.env` file:

```env
VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/xxxxxxxx
```

The variable is accessed in `src/sections/RSVP.tsx` via `import.meta.env.VITE_FORMSPREE_ENDPOINT`. If the variable is missing, it falls back to a placeholder URL and submissions will fail silently — make sure it's set before deploying.

## Deployment (GitHub Pages)

Pushes to `main` and manual runs of `.github/workflows/pages.yml` install with
`npm ci`, build using Node.js 24, upload `dist`, and deploy it to GitHub Pages.

In the repository's **Settings → Pages → Build and deployment**, select
**GitHub Actions** as the source. The workflow reads the site's base path from
`actions/configure-pages`, so assets work under `/mobile_card/` as well as a custom domain.
Local development continues to use `/`.

For optional features, add repository Actions variables under
**Settings → Secrets and variables → Actions → Variables**:

- `VITE_FORMSPREE_ENDPOINT`: the RSVP form endpoint.
- `VITE_KAKAO_MAP_APP_KEY`: the Kakao JavaScript key; register the deployed domain in Kakao Developers.

These Vite values are included in the public browser bundle. Do not use private server keys.
A local `.env` is not uploaded to GitHub Actions.

To verify the Pages path locally:

```bash
VITE_BASE_PATH=/mobile_card/ npm run build
VITE_BASE_PATH=/mobile_card/ npm run preview -- --host 0.0.0.0
```

Open `http://localhost:4173/mobile_card/`.

## Local preview (no rebuild on every edit)

Prefer Vite (hot reload). Put `VITE_KAKAO_MAP_APP_KEY` in `.env`, then either:

```bash
npm install
npm run dev
```

or with Docker (bind-mounts the repo — code and `public/map-markers` update live):

```bash
docker compose up
```

Open `http://localhost:5173`. Register that origin in Kakao Developers.

Map pin images live in `public/map-markers/` and are loaded by URL (not bundled into JS), so swapping those files does not require a rebuild.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run dev:docker` | Same via Docker Compose (bind-mount) |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `docker compose up` | Local Vite preview in Docker |
