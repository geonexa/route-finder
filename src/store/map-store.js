import { create } from 'zustand'
import appConfig from '@/config/app-config'

/**
 * Zustand store for map state management
 * Similar to Vuex store in the original Vue.js app
 */

const useMapStore = create((set, get) => ({
  // Map settings
  mapCenter: { lat: 51.505, lng: -0.09 }, // Default: London
  zoom: appConfig?.initialZoomLevel || 6,
  maxZoom: appConfig?.initialMapMaxZoom || 18,
  currentTileProvider: appConfig?.defaultTilesProvider || 'osm',
  
  // Application mode: 'place' | 'directions' | 'isochrones' | 'search'
  mode: 'place',
  
  // Places/Route data - always ensure arrays are initialized
  places: [],
  routeData: null,
  isochroneData: null,
  
  // UI state - open by default on desktop (will be set on client)
  sidebarOpen: false,
  loading: false,
  error: null,
  
  // Map click to select place
  activeInputIndex: null, // Index of input field waiting for map click
  
  // Actions
  setMapCenter: (center) => set({ mapCenter: center || { lat: 51.505, lng: -0.09 } }),
  setZoom: (zoom) => set({ zoom: zoom || 6 }),
  setMode: (mode) => set({ mode: mode || 'place' }),
  setPlaces: (places) => set({ places: Array.isArray(places) ? places : [] }),
  setRouteData: (routeData) => set({ routeData }),
  setIsochroneData: (isochroneData) => set({ isochroneData }),
  setSidebarOpen: (open) => set({ sidebarOpen: open === true }),
  setLoading: (loading) => set({ loading: loading === true }),
  setError: (error) => set({ error }),
  setCurrentTileProvider: (provider) => set({ currentTileProvider: provider || 'osm' }),
  setActiveInputIndex: (index) => set({ activeInputIndex: index }),
  clearActiveInputIndex: () => set({ activeInputIndex: null }),
  
  // Reset functions
  clearRoute: () => set({ routeData: null, places: [] }),
  clearIsochrone: () => set({ isochroneData: null, places: [] }),
  clearError: () => set({ error: null }),
}))

export default useMapStore
