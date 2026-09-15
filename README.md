# 💍 Wedding Invitation

A Korean digital wedding invitation (모바일 청첩장) built as a single-page app. Guests can view the wedding details, count down to the date, explore the photo gallery, find directions to the venue, and RSVP — all from a mobile browser.

## Features

- **Hero** — Full-bleed cover photo with the couple's names
- **Story** — Invitation text and couple/parents introduction
- **Calendar** — Wedding date with a mini monthly calendar and live D-day countdown
- **Location** — Embedded Kakao map, venue details, and collapsible directions (subway, bus, parking) with one-tap navigation app deep links (Naver Map, Kakao Map, T-map)
- **Gifts** — Bank account numbers for gift money, with one-tap copy to clipboard and Kakao Pay links
- **RSVP** — Modal form (name, attendance, guest count, message) submitted to Formspree
- **Gallery** — Photo grid with lazy loading, "load more", and a fullscreen lightbox
- **Ending** — KakaoTalk share button with Web Share API / clipboard fallback
- **Music player** — Floating button that plays background music on loop; auto-plays on first user interaction

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 8** for development and bundling
- **CSS Modules** — no external UI library
- **Formspree** for RSVP form submissions
- No routing, no state management library, no backend

## Project Structure

```
src/
├── assets/
│   └── gallery/           # Wedding photos — drop files here, prefix with numbers to order
├── sections/          # Page sections (Hero, Story, Calendar, Location, Gifts, RSVP, GallerySection, Ending)
├── components/        # Shared components (Gallery, MusicPlayer, DdayCount, Collapsible, Toast, Button, Input)
├── context/           # UIContext — toast notifications and shared modal state
├── hooks/             # useScrollFade — IntersectionObserver-based scroll entrance animation
├── utils/
│   ├── constants/
│   │   ├── weddingInfo.ts      # All wedding data (date, couple, venue, bank accounts)
│   │   └── transportation.ts   # Directions and navigation app links
│   ├── dateUtils.ts            # D-day calculation and date formatting helpers
│   └── types.ts                # Shared TypeScript types
public/
└── assets/            # SVG icons, background music, hero image
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Variables

`.env` is **not committed to the repo** (it's in `.gitignore`). Create it manually in the project root before running the app:

```env
VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/your_form_id
```

See [Formspree setup](#formspree-rsvp) below for how to get your endpoint.

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
  dayOfTheWeek,       // e.g. '일요일'
}

bride / groom: {
  self:   { name }
  father: { name, bank? }   // add bank to show account in Gifts section
  mother: { name, bank? }   // bank: { name, accountNumber, kakaoPayUrl? }
}

venue: {
  venueName, venueAddress, phone,
  mapEmbed: {
    imageUrl,       // Kakao Roughmap static image src
    mainLink,       // link wrapping the map image
    roadsideLink,   // 로드뷰 footer link
    directionsLink, // 길찾기 footer link
    fullMapLink,    // 지도 크게 보기 footer link
    // → generate all of these from map.kakao.com's "roughmap" embed tool
  }
}

invitationText  // invitation poem shown in the Story section (use \n for line breaks)
musicSrc        // path to background music, e.g. '/assets/music.mp3'
```

### `src/utils/constants/transportation.ts`

Directions and navigation app deep links for the venue.

```ts
DIRECTIONS.subway   // subway lines, stations, exits, walking directions
DIRECTIONS.bus      // bus types, route numbers, stop names
DIRECTIONS.parking  // parking lot names, addresses, per-lot nav links
                    // (naver, kakao, tmap per lot)

NAVIGATION_APPS     // the three nav buttons shown under the map
                    // [ { name: '네이버지도', url }, { name: '카카오맵', url }, { name: '티맵', url } ]
                    // use share/shortlinks from each map service for the venue
```

### Gallery photos

Drop image files into `src/assets/gallery/`. No list to maintain — photos are picked up automatically at build time via `import.meta.glob`.

**Ordering:** files are sorted alphabetically, so prefix filenames with numbers to control the display order:
```
01_ceremony.jpg
02_portraits.jpg
03_reception.jpg
```

### Music

Swap out `public/assets/music.mp3` and update `musicSrc` in `weddingInfo.ts` if the filename changes.

### Kakao map and shuttle schedule

The Location section reserves a 300px map area below the venue address.
It stays blank until the Kakao Maps JavaScript SDK is connected. Create a local `.env`
from `.env.example`, then set `VITE_KAKAO_MAP_APP_KEY` to your **JavaScript key**.
Register `http://localhost:5173` (and the eventual site domain) in that key's
JavaScript SDK domain settings. Enable the Kakao Map API for the application
if required in Kakao Developers. Restart Vite after changing `.env`.
See the [official Kakao setup guide](https://apis.map.kakao.com/web/guide/).

The JavaScript key is used in the browser; never use an Admin or REST API key here.

- `LOCATION_POINTS` in `src/utils/constants/transportation.ts` defines map locations.
- The church is resolved from its address. Suseo Exit 6 is resolved only from an
  unambiguous matching place name; unmatched positions are not plotted.
- **Parking entrance coordinates are pending confirmation.**
  Add `coordinates: { lat, lng }` to the parking entry and update the description
  after verifying the precise location. The church also represents the post-ceremony
  shuttle boarding location; it has no separate marker.
- `DIRECTIONS.shuttle.trips` defines the before/after ceremony routes and departure times.
- Without a key or when the SDK fails, the reserved map area stays blank.
  The before/after shuttle cards remain visible, without location buttons.

## Formspree (RSVP)

The RSVP form submits to [Formspree](https://formspree.io), a third-party form backend — no server required.

1. Create a free account at [formspree.io](https://formspree.io) and create a new form.
2. Copy the form endpoint (looks like `https://formspree.io/f/xxxxxxxx`).
3. Add it to your `.env` file (which is **not** in the repo — create it locally):

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

## Deployment (Cloudflare Workers)

The project is configured to deploy as a static site via [Cloudflare Workers Assets](https://developers.cloudflare.com/workers/static-assets/). The `wrangler.jsonc` at the project root defines the deployment:

```jsonc
{
  "name": "wed-inv",
  "compatibility_date": "2026-05-18",
  "placement": { "region": "aws:ap-northeast-2" },  // Seoul region
  "assets": { "directory": "./dist" }               // serves the Vite build output
}
```

### Deploy steps

1. Install the [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/):
   ```bash
   npm install -g wrangler
   ```

2. Authenticate with your Cloudflare account:
   ```bash
   wrangler login
   ```

3. Build the app:
   ```bash
   npm run build
   ```

4. Deploy:
   ```bash
   wrangler deploy
   ```

> The `dist/` directory is gitignored. Always run `npm run build` before deploying.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `wrangler deploy` | Deploy to Cloudflare Workers |
