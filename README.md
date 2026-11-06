<div align="center">
  <br />
  <img src="assets/logo_text.svg" alt="glb::watch logo" width="360" />
  <br /><br />

  <p align="center">
    <strong>Real-time civic telemetry and geospatial dashboard for Macedonia</strong>
  </p>

  <p align="center">
    The interactive web monitor for <a href="https://github.com/nkvtd/glb"><strong>glb</strong></a> — visualizing active public utility notices, infrastructure outages, and environmental measurements across all 80 municipalities of Macedonia.
  </p>

  <p align="center">
    <a href="https://glb.nkvtd.com"><strong>Live Dashboard</strong></a> •
    <a href="https://glb.nkvtd.com/api/reports"><strong>REST API</strong></a> •
    <a href="#overview">Overview</a> •
    <a href="#key-features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
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

Designed around a sharp, high-contrast Metro aesthetic, the interface separates live situational awareness from historical exploration:
- **Above the Fold (Live Situational Monitor):** Displays only currently active and upcoming scheduled disruptions across all 80 municipalities, paired with geocoded incident pins, monitoring station markers, and an interactive local GPS radar.
- **Below the Fold (Regional Breakdown & Historical Registry):** Provides a statistical region breakdown and a cursor-paginated, full-text searchable registry of all active, scheduled, station-level, and completed records.

---

## Key Features

- **Zero-Dependency Vector Choropleth Map:** Renders all 80 municipal `MultiPolygon` boundaries of Macedonia (`SRID 4326`) in native SVG with smooth `requestAnimationFrame` camera transitions, cursor-anchored mouse wheel zoom, two-finger mobile pinch-to-zoom, and a one-click **Град Скопје** camera preset.
- **SSR Geometry Precomputation & Caching:** Compiles raw GeoJSON boundaries into lightweight SVG paths on the server during SSR and caches them in memory for 12 hours, delivering instant initial page loads with minimal client payload size.
- **Tactical Local Radar:** Uses browser geolocation and backend-enabled PostGIS spatial queries (`ST_Covers` + `ST_DWithin`) to detect the user's municipality, render an animated sonar sweep on the map, and list all ongoing disruptions within a customizable radius (`500m` to `50km`).
- **Split-Bucket Telemetry Loading:** Fetches `ongoing`, `scheduled`, and `air_quality` station telemetry in isolated parallel buckets so high volumes of future scheduled outages never crowd out active emergencies on the map.
- **Statistical Region & Municipality Explorer:** Groups all 80 municipalities across Macedonia's 8 statistical regions with live ongoing/scheduled counters and automatic map-to-table pagination syncing.
- **Infinite-Scroll Report Registry (`Регистар`):** Supports instant status tab switching, data source filtering, debounced keyword search, and bidirectional "Jump to Map" pin highlighting.

---

## Tech Stack

| Category | Technology | Role in `glb-watch` |
| :--- | :--- | :--- |
| **Framework & SSR** | Vue, Vike | Server-side rendering (`+data.ts`), client hydration, and filesystem routing. |
| **Styling & Design** | Tailwind CSS `4.3` (`@tailwindcss/vite`) | Custom `@theme` palette (`glb-50`–`glb-950`), dark/light mode (`@custom-variant dark`), and Metro grid layout. |
| **GIS & Graphics** | Native SVG + Custom Equirectangular Math | Server-side `MultiPolygon` to SVG path compilation, bounding-box zoom, and vector pin scaling. |
| **Typography & Icons** | `Ubuntu`, `Ubuntu Mono`, `@vicons/ionicons5` | High-legibility Cyrillic/Latin UI typography, tabular numeric counters, and sharp vector iconography. |
| **Build & Quality** | Vite `8.x`, TypeScript `6.0`, Biome `2.6` | Fast SSR/client bundling, strict static type checking, and unified linting/formatting. |
| **Deployment** | Docker Buildx, GitHub Actions, Watchtower | Multi-arch (`linux/amd64`, `linux/arm64`) Alpine container images published to GHCR. |

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

In production, **glb-watch** is built into a Node 24 Alpine Docker image published to `ghcr.io/nkvtd/glb-watch:latest` and orchestrated via `docker-compose.yml` alongside `glb-server` on the external `edge-proxy` Docker network.

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
│   ├── components/                 # Modular Vue 3 UI components (Map, Header, Explorer, Radar)
│   ├── composables/                # Reactive state machines (useReportsFeed, useNearbyRadar, useTheme)
│   ├── pages/                      # Vike SSR routes (+config, +Head, +Layout, index/, _error/)
│   └── util/                       # API transport, GIS projection math, constants & DTO types
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
2. Follow the existing conventions.
3. Run `npm run lint:fix` and `npx tsc --noEmit` to verify your changes pass **Biome** and strict TypeScript checks.
4. Submit a Pull Request.

---

## License

Licensed under the **Apache License 2.0**.