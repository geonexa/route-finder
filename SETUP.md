# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Configure Environment Variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_ORS_API_KEY=your-api-key-here
   NEXT_PUBLIC_ORS_API_BASE_URL=https://api.openrouteservice.org
   ```
   
   Get your API key from: https://openrouteservice.org/dev/#/signup

3. **Run Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open Browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
ors-map-client-nextjs/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.jsx          # Root layout
│   │   ├── page.jsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.jsx      # Top navigation
│   │   │   ├── Sidebar.jsx     # Side panel
│   │   │   └── Footer.jsx      # Footer
│   │   ├── map/                # Map components
│   │   │   ├── MapView.jsx     # Main map component
│   │   │   └── RoutePolyline.jsx # Route rendering
│   │   ├── directions/         # Directions feature
│   │   │   └── DirectionsPanel.jsx
│   │   └── ui/                 # Reusable UI components
│   │       ├── button.jsx
│   │       ├── input.jsx
│   │       └── card.jsx
│   ├── lib/
│   │   ├── ors-api/            # ORS API integration
│   │   │   └── ors-api-client.js
│   │   └── utils/              # Utility functions
│   │       ├── cn.js           # Class name utility
│   │       └── geo-utils.js    # Geographic utilities
│   ├── store/                  # State management
│   │   └── map-store.js        # Zustand store
│   └── config/                 # Configuration
│       └── app-config.js       # App settings
├── public/                     # Static assets
├── package.json
├── next.config.js
├── tailwind.config.js
└── jsconfig.json
```

## Features Implemented

### ✅ Basic Version (Current)

- [x] Next.js 14 setup with App Router
- [x] Layout components (Header, Sidebar, Footer)
- [x] Leaflet map integration
- [x] ORS API service layer
- [x] Place search (geocoding)
- [x] Basic directions/route planning
- [x] State management with Zustand
- [x] Responsive design with Tailwind CSS
- [x] Radix UI components

### 🚧 Planned Features

- [ ] URL-based state management
- [ ] Isochrones feature
- [ ] POI search
- [ ] Route instructions/turn-by-turn
- [ ] Export routes (GPX, KML, GeoJSON)
- [ ] Multiple map tile providers
- [ ] Advanced routing options
- [ ] Accessibility features
- [ ] Internationalization (i18n)

## Development Notes

### Key Differences from Vue.js Version

1. **State Management**: Using Zustand instead of Vuex
2. **UI Framework**: Radix UI instead of Vuetify
3. **Styling**: Tailwind CSS instead of SCSS
4. **Routing**: Next.js App Router instead of Vue Router
5. **Components**: React functional components instead of Vue SFC

### API Integration

The ORS API client (`src/lib/ors-api/ors-api-client.js`) provides:
- `getDirections()` - Route planning
- `geocode()` - Place search
- `reverseGeocode()` - Get place from coordinates
- `getIsochrones()` - Travel time areas
- `getPois()` - Points of interest

### Map Integration

- Using `react-leaflet` for React integration
- Map state managed in Zustand store
- Dynamic imports to avoid SSR issues

## Troubleshooting

### Map not loading
- Ensure Leaflet CSS is imported (already in MapView.jsx)
- Check browser console for errors
- Verify API key is set correctly

### API errors
- Check `.env.local` file exists and has correct API key
- Verify API key is valid at https://openrouteservice.org
- Check network tab for API request/response

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

## Next Steps

1. Add URL state management for sharing routes
2. Implement isochrones feature
3. Add route instructions panel
4. Implement export functionality
5. Add more map tile providers
6. Add accessibility features
