<div align="center">
  <br />
  <img src="assets/logo_text.svg" alt="glb::watch logo" width="360" />
  <br /><br />

  <p align="center">
    <strong>Real-time civic telemetry and geospatial dashboard for Macedonia</strong>
  </p>

  <p align="center">
    The interactive web monitor for <a href="https://github.com/nkvtd/glb"><strong>glb</strong></a> — visualizing active public utility notices, infrastructure outages, environmental measurements, and national indicators across all 80 municipalities of Macedonia.
  </p>

  <p align="center">
    <a href="https://glb.nkvtd.com"><strong>Live Dashboard</strong></a> •
    <a href="https://glb.nkvtd.com/api/reports"><strong>REST API</strong></a> •
    <a href="#overview">Overview</a> •
    <a href="#key-features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#architecture--routing">Architecture</a> •
    <a href="#development-setup">Development</a> •
    <a href="#production-deployment">Deployment</a>
  </p>

  <p align="center">
    <a href="https://github.com/nkvtd/glb-watch/actions/workflows/lint.yml"><img src="https://img.shields.io/github/actions/workflow/status/nkvtd/glb-watch/lint.yml?style=flat-square&logo=github&label=lint" alt="Lint Status" /></a>
    <a href="https://github.com/nkvtd/glb-watch/actions/workflows/docker.yml"><img src="https://img.shields.io/github/actions/workflow/status/nkvtd/glb-watch/docker.yml?style=flat-square&logo=docker&logoColor=white&label=docker" alt="Docker Build" /></a>
    <img src="https://img.shields.io/badge/node-%3E%3D24.0.0-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js >= 24.0.0" />
    <img src="https://img.shields.io/badge/vue-3.5-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white" alt="Vue 3.5" />
    <img src="https://img.shields.io/badge/vike-SSR-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vike SSR" />
    <img src="https://img.shields.io/badge/tailwindcss-4.3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4.3" />
    <img src="https://img.shields.io/badge/license-Apache_2.0-blue?style=flat-square" alt="Apache-2.0 License" />
  </p>
</div>

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture \& Routing](#architecture--routing)
- [Development Setup](#development-setup)
  - [Prerequisites](#prerequisites)
  - [1. Clone \& Install](#1-clone--install)
  - [2. Configure Environment Variables](#2-configure-environment-variables)
  - [3. Run in Development Mode](#3-run-in-development-mode)
  - [Available Scripts](#available-scripts)
- [Production Deployment](#production-deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**glb-watch** (`glb::watch`) is the companion web dashboard for the [**glb**](https://github.com/nkvtd/glb) civic telemetry engine. While `glb` scrapes, normalizes, and georeferences infrastructure notices and environmental readings into a PostGIS database, **glb-watch** turns that API into a fast, utilitarian situational monitor publicly hosted at **[https://glb.nkvtd.com](https://glb.nkvtd.com)**.

Modeled after utility monitors like `poweroutage.us` and styled with a calibrated, high-contrast Metro aesthetic, **glb-watch** organizes telemetry across two server-side rendered (SSR) tiers:
1. **National Situational Monitor (`/`):** Displays the 80-municipality choropleth map, live national counters (`Во тек` / `Најавени`), a rotating national newsflash ticker (`ГОРИВА` / `КУРСНА ЛИСТА`), an integrated local GPS radar (`Локален радар`), the top affected municipalities leaderboard, and a searchable 80-municipality directory grouped by statistical region.
2. **Dedicated Municipality Pages (`/@municipality`, e.g., `/aerodrom`, `/bitola`, `/strumica`):** Each of Macedonia's 80 municipalities has its own indexable SSR route featuring a regional-scoped vector map with geocoded incident/station pins, a statistical region peer switcher, and the full cursor-paginated `Регистар` (`ReportsExplorer`) for that municipality.

---

## Key Features

- **Zero-Dependency 20× GPU Vector Map:** Renders all 80 municipal `MultiPolygon` boundaries (`SRID 4326`) in native SVG using hardware-accelerated `<g>` matrix transforms (`translate` + `scale` up to `20x` zoom), cursor-anchored mouse wheel zoom, two-finger mobile pinch-to-zoom, and a one-click **Град Скопје** camera preset.
- **Desktop Direct Drill-Down & Mobile Preview Drawer:** Clicking a municipality on desktop navigates directly to `/@municipality` with a tactical radar loading lock; tapping a municipality on mobile slides up a compact preview drawer with live counts and a one-tap link to open the full municipality page.
- **Unified `ApiClient` & Multi-Tier Caching:** Precomputes and caches municipal SVG paths in memory for 12 hours and caches active telemetry snapshots for 45 seconds with in-flight request deduplication, making municipality-to-municipality navigation instantaneous.
- **Live 60s Background Revalidation (`useLiveTelemetry`):** Automatically refreshes map telemetry and national events every 60 seconds and on browser tab focus (`visibilitychange`) so open dashboards stay synchronized without manual reloads.
- **Integrated Tactical Local Radar (`Локален радар`):** Uses browser geolocation and PostGIS spatial queries (`ST_Covers` + `ST_DWithin`) to detect the user's municipality, render an animated sonar sweep on the map, and list ongoing disruptions within preset (`500m`–`10km`) or custom (`50m`–`50,000m`) radii.
- **Multi-Event Newsflash Bar:** Cycles through active national events (AMSM retail fuel prices and NBRM currency exchange rates) in the top header.
- **Municipality Report Registry (`Регистар`):** Supports instant status tab switching (`Во тек и најавени`, `Само во тек`, `Најавени`, `Мерни станици`, `Завршени`), upstream source filtering, debounced keyword search, and map-pin-to-card highlighting.

---

## Tech Stack

| Category | Technology | Role in `glb-watch` |
| :--- | :--- | :--- |
| **Framework & SSR** | Vue `3.5`, Vike `0.4`, `vike-vue` | Server-side rendering (`+data.ts`), client hydration, and `/@municipality` dynamic routing. |
| **Styling & Design** | Tailwind CSS `4.3` (`@tailwindcss/vite`) | Custom `@theme` palette (`glb-50`–`glb-950`), calibrated light/dark mode (`MAP_PALETTE`), and Metro grid layout. |
| **GIS & Graphics** | Native SVG + GPU Matrix Transforms | Server-side `MultiPolygon` to SVG compilation, `20x` matrix zoom, and regional polygon scoping. |
| **Typography & Icons** | `Ubuntu`, `Ubuntu Mono`, `@vicons/ionicons5` | High-legibility Cyrillic/Latin UI typography, tabular numeric counters, and sharp vector iconography. |
| **Build & Quality** | Vite `8.x`, TypeScript `6.0`, Biome `2.6` | Fast SSR/client bundling, strict static type checking, and unified linting/formatting. |
| **Deployment** | Docker Buildx, GitHub Actions, Watchtower | Multi-arch (`linux/amd64`, `linux/arm64`) Alpine container images published to GHCR. |

---

## Architecture & Routing

```text
┌───────────────────────────────────────────────────────────────────────────┐
│  glb REST API (http://glb-server:8080/api                                 │
│  • /api/municipalities  • /api/reports  • /api/events                     │
└───────────────────────────────────────────────────────────────────────────┘
                   │                                       ▲
                   │ 1. ApiClient SSR Fetch (+data.ts)     │ 3. Client Fetch
                   │    • 12h SVG Geometry Cache           │    • 60s Live Poll
                   │    • 45s Telemetry Snapshot Cache     │    • Cursor Paging
                   ▼                                       │    • GPS Radar
┌──────────────────────────────────────┐                   │
│  Vike Node.js SSR Server             │───────────────────┴────────────────┐
│  • "/" (National Monitor)            │ 2. Hydrates Vue 3 Client           │
│  • "/@municipality" (80      Pages)  │                                    ▼
└──────────────────────────────────────┘   ┌────────────────────────────────┐
                                           │  Browser Client                │
                                           │  • 20x GPU Matrix SVG Map      │
                                           │  • Mobile Preview Drawer       │
                                           │  • Integrated Local GPS Radar  │
                                           └────────────────────────────────┘
```

---

## Development Setup

### Prerequisites
- **Node.js** `>= 24.0.0`
- A running [**glb**](https://github.com/nkvtd/glb) API instance (or internet access to use the public fallback API at `https://glb.nkvtd.com/api`)

### 1. Clone & Install

```bash
git clone https://github.com/nkvtd/glb-watch.git
cd glb-watch
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

```ini
# HTTP Server Port for Vike SSR (optional, defaults to 3000)
PORT=3000

# Server-side internal API URL for SSR (probed first before falling back to localhost:8080 and public API)
INTERNAL_API_URL=http://glb-server:8080/api

# Client-side public API URL exposed to the browser (Vike/Vite PUBLIC_ENV__ prefix)
PUBLIC_ENV__API_URL=[https://glb.nkvtd.com/api](https://glb.nkvtd.com/api)
```

### 3. Run in Development Mode

```bash
npm run dev
```

The development server will start at `http://localhost:3000`.

### Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `vike dev` | Start the Vike SSR development server with HMR. |
| `npm run build` | `vike build` | Build production client and SSR server bundles into `dist/`. |
| `npm run preview` | `vike build && vike preview` | Build and preview the production server locally. |
| `npm run lint` | `biome lint --write src` | Lint `src/` using Biome. |
| `npm run lint:fix` | `biome check --write src` | Lint, format, and organize imports across `src/`. |
| `npm run format` | `biome format --write src` | Format files in `src/` with Biome. |
| `npm run prod` | `docker compose up -d --build` | Build and launch the production Docker container. |

---

## Production Deployment

In production, **glb-watch** is built into a multi-architecture (`linux/amd64`, `linux/arm64`) Node 24 Alpine Docker image published to `ghcr.io/nkvtd/glb-watch:latest` and orchestrated via `docker-compose.yml` alongside `glb-server` on the external `edge-proxy` Docker network.

```bash
# Ensure the shared external network exists
docker network create edge-proxy

# Pull and launch the container
docker compose pull
docker compose up -d
```

---

## Project Structure

```text
glb-watch/
├── assets/
│   ├── logo.svg                    # Standalone glb pigeon emblem (favicon)
│   └── logo_text.svg               # Horizontal pigeon + glb wordmark
├── src/
│   ├── components/                 # Vue 3 UI components (ChoroplethMap, AppHeader, ReportsExplorer, etc.)
│   ├── composables/                # Reactive state (useLiveTelemetry, useNearbyRadar, useReportsFeed, useTheme)
│   ├── pages/                      # Vike SSR routes (index/, @municipality/, _error/)
│   └── util/                       # Unified ApiClient, GIS projection math, palettes & DTO types
├── Dockerfile                      # 4-stage Node 24 Alpine production build
├── docker-compose.yml              # Production container orchestration
├── biome.json                      # Biome linter & formatter configuration
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Contributing

1. Fork the repository and create a feature branch.
2. Run `npm run lint:fix` and `npx tsc --noEmit` to verify your changes pass **Biome** and strict TypeScript checks.
3. Submit a Pull Request.

---

## License

Licensed under the **Apache License 2.0**.