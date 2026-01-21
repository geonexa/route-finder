/**
 * Application configuration
 * Similar to the Vue.js version but adapted for Next.js
 */

const appConfig = {
  appName: 'Open RouteFinder',
  footerAppName: 'GeoNexa',
  footerDevelopedByLink: 'https://github.com/geonexa',
  
  // API Configuration
  orsApiKey: process.env.NEXT_PUBLIC_ORS_API_KEY || 'put-here-an-ors-api-key',
  orsApiBaseUrl: process.env.NEXT_PUBLIC_ORS_API_BASE_URL || 'https://api.openrouteservice.org',
  dataServiceBaseUrl: 'https://openrouteservice.org/wp-json/',
  
  // App Settings
  maxPlaceInputs: 50,
  defaultLocale: 'en-us',
  initialZoomLevel: 6,
  initialMapMaxZoom: 18,
  
  // Feature Flags
  supportsPlacesAndDirections: true,
  supportsIsochrones: true,
  supportsDirections: true,
  supportsSearchMode: true,
  supportsMyLocationBtn: true,
  supportsClusteredMarkers: true,
  distanceMeasureToolAvailable: true,
  accessibilityToolAvailable: true,
  
  // Map Tile Providers
  defaultTilesProvider: 'osm',
  mapTileProviders: [
    {
      name: 'OpenStreetMap',
      id: 'osm',
      visible: true,
      attribution: '&copy; <a target="_blank" href="https://osm.org/copyright">OpenStreetMap</a> contributors',
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      maxZoom: 19,
      icon: ''
    },
    {
      name: 'Satellite',
      id: 'satellite',
      visible: false,
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19,
      icon: ''
    },
    {
      name: 'Google Maps Style',
      id: 'google-maps',
      visible: false,
      url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      attribution: '&copy; Google',
      maxZoom: 20,
      icon: ''
    },
    {
      name: 'Google Satellite',
      id: 'google-satellite',
      visible: false,
      url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      attribution: '&copy; Google',
      maxZoom: 20,
      icon: ''
    },
    {
      name: 'Google Hybrid',
      id: 'google-hybrid',
      visible: false,
      url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      attribution: '&copy; Google',
      maxZoom: 20,
      icon: ''
    }
  ],
  
  // Menu Configuration
  appMenu: {
    useORSMenu: true,
    baseMenuExternalUrl: 'https://openrouteservice.org'
  }
}

export default appConfig
