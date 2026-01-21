# ORS Map Client 

A Next.js implementation of the OpenRouteService Map Client (https://maps.openrouteservice.org/) using React, Radix UI, and Leaflet.

## Features

- 🗺️ Interactive map with Leaflet
- 🔍 Place search and geocoding
- 🛣️ Route planning and directions
- ⏱️ Isochrones (travel time areas)
- 🎨 Modern UI with Radix UI components
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Configuration

1. Copy `.env.example` to `.env.local`
2. Add your OpenRouteService API key:
   ```
   NEXT_PUBLIC_ORS_API_KEY=your-api-key-here
   ```
   Get your API key from: https://openrouteservice.org/dev/#/signup

### Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.


## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **Map Library**: Leaflet + React-Leaflet
- **State Management**: Zustand
- **API Client**: openrouteservice-js
- **Icons**: Lucide React
