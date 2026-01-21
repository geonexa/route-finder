'use client'

import * as React from 'react'
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import useMapStore from '@/store/map-store'
import appConfig from '@/config/app-config'
import { reverseGeocode } from '@/lib/ors-api/ors-api-client'
import MapLayerSwitcher from './MapLayerSwitcher'

// Dynamically import Leaflet components to avoid SSR issues
let MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, L
let RoutePolylineComponent
let IsochronesPolygonComponent

if (typeof window !== 'undefined') {
  // Only import on client side
  const leaflet = require('react-leaflet')
  MapContainer = leaflet.MapContainer
  TileLayer = leaflet.TileLayer
  Marker = leaflet.Marker
  Popup = leaflet.Popup
  useMap = leaflet.useMap
  useMapEvents = leaflet.useMapEvents
  
  L = require('leaflet')
  require('leaflet/dist/leaflet.css')
  
  // Fix for default marker icons in Next.js
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
  
  RoutePolylineComponent = require('./RoutePolyline').default
  IsochronesPolygonComponent = require('./IsochronesPolygon').default
}

// Component to update map view when center/zoom changes and sync map events to store
function MapUpdater() {
  if (typeof window === 'undefined' || !useMap || !useMapEvents) return null
  
  const map = useMap()
  const { mapCenter, zoom, setMapCenter, setZoom, isochroneData } = useMapStore()
  const isUpdatingFromStoreRef = React.useRef(false)
  const hasFittedToIsochronesRef = React.useRef(false)

  // Fit map to isochrones bounds once when isochrones are first calculated
  // Use a ref to track the last isochrone data to only fit once per calculation
  const lastIsochroneDataRef = React.useRef(null)
  
  React.useEffect(() => {
    // Only fit bounds if isochrones data changed (new calculation) and hasn't been fitted yet
    if (isochroneData && map && L && 
        isochroneData !== lastIsochroneDataRef.current && 
        !hasFittedToIsochronesRef.current) {
      try {
        // Get all polygon bounds from isochrones
        const bounds = L.latLngBounds([])
        let hasBounds = false
        
        if (isochroneData.features && Array.isArray(isochroneData.features)) {
          isochroneData.features.forEach(feature => {
            const geometry = feature.geometry || feature
            if (geometry.type === 'Polygon' && geometry.coordinates) {
              const outerRing = geometry.coordinates[0] // First ring is outer boundary
              if (outerRing && outerRing.length > 0) {
                outerRing.forEach(coord => {
                  if (Array.isArray(coord) && coord.length >= 2) {
                    bounds.extend([coord[1], coord[0]]) // [lat, lng] from [lng, lat]
                    hasBounds = true
                  }
                })
              }
            }
          })
        }
        
        if (hasBounds && bounds.isValid()) {
          // Fit bounds only once, then allow user to control map
          setTimeout(() => {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
            hasFittedToIsochronesRef.current = true
            lastIsochroneDataRef.current = isochroneData
          }, 100)
        }
      } catch (error) {
        console.error('Error fitting bounds to isochrones:', error)
      }
    } else if (!isochroneData) {
      // Reset flags when isochrones are cleared
      hasFittedToIsochronesRef.current = false
      lastIsochroneDataRef.current = null
    }
  }, [isochroneData, map])

  // Update map when store changes (programmatic updates) - but not when user is interacting
  React.useEffect(() => {
    if (mapCenter && map && !isUpdatingFromStoreRef.current && !hasFittedToIsochronesRef.current) {
      const currentCenter = map.getCenter()
      const currentZoom = map.getZoom()
      const centerChanged = Math.abs(currentCenter.lat - mapCenter.lat) > 0.0001 || 
                           Math.abs(currentCenter.lng - mapCenter.lng) > 0.0001
      const zoomChanged = Math.abs(currentZoom - (zoom || 6)) > 0.1
      
      if (centerChanged || zoomChanged) {
        isUpdatingFromStoreRef.current = true
        map.setView([mapCenter.lat || 51.505, mapCenter.lng || -0.09], zoom || 6)
        // Reset flag after map finishes updating
        setTimeout(() => {
          isUpdatingFromStoreRef.current = false
        }, 300)
      }
    }
  }, [map, mapCenter, zoom])

  // Listen to map pan and zoom events to update store
  useMapEvents({
    moveend: () => {
      if (!isUpdatingFromStoreRef.current) {
        const center = map.getCenter()
        const newCenter = { lat: center.lat, lng: center.lng }
        // Only update if center actually changed
        if (!mapCenter || 
            Math.abs(center.lat - mapCenter.lat) > 0.0001 || 
            Math.abs(center.lng - mapCenter.lng) > 0.0001) {
          setMapCenter(newCenter)
        }
        // Reset isochrones fit flag when user moves map
        hasFittedToIsochronesRef.current = false
      }
    },
    zoomend: () => {
      if (!isUpdatingFromStoreRef.current) {
        const currentZoom = map.getZoom()
        // Only update if zoom actually changed
        if (zoom === null || Math.abs(currentZoom - zoom) > 0.1) {
          setZoom(currentZoom)
        }
        // Reset isochrones fit flag when user zooms
        hasFittedToIsochronesRef.current = false
      }
    }
  })

  return null
}

// Map click handler component - must be separate to avoid hook order issues
function MapClickHandlerWrapper({ activeInputIndex, handleMapClick }) {
  if (typeof window === 'undefined' || !useMapEvents) return null
  
  useMapEvents({
    click: (e) => {
      if (activeInputIndex !== null) {
        handleMapClick(e)
      }
    }
  })

  return null
}

export default function MapView() {
  const [isClient, setIsClient] = React.useState(false)
  const mapRef = React.useRef(null)
  const [isMobile, setIsMobile] = React.useState(false)
  
  const { 
    mapCenter, 
    zoom, 
    places, 
    routeData,
    isochroneData,
    currentTileProvider,
    activeInputIndex,
    setPlaces,
    clearActiveInputIndex,
    setLoading,
    setError,
    sidebarOpen,
    setSidebarOpen
  } = useMapStore()

  // Safety check for places array
  const safePlaces = Array.isArray(places) ? places : []

  // Handle map click to select place - must be defined before conditional return
  const handleMapClick = React.useCallback(async (e) => {
    if (activeInputIndex === null || typeof window === 'undefined' || !L) return

    const { lat, lng } = e.latlng
    setLoading(true)
    setError(null)

    try {
      // Reverse geocode to get place name
      const result = await reverseGeocode(lat, lng, 1)
      
      if (result.success && result.places && result.places.length > 0) {
        const place = result.places[0]
        const [placeLng, placeLat] = place.geometry.coordinates
        const placeData = {
          lat: placeLat,
          lng: placeLng,
          name: place.properties.label || place.properties.name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          address: place.properties.label,
          place: place
        }

        // Update the active input field
        const newPlaces = [...safePlaces]
        if (!newPlaces[activeInputIndex]) {
          newPlaces[activeInputIndex] = placeData
        } else {
          newPlaces[activeInputIndex] = { ...newPlaces[activeInputIndex], ...placeData }
        }
        setPlaces(newPlaces)
        
        // Update map center
        useMapStore.getState().setMapCenter({ lat, lng })
        useMapStore.getState().setZoom(12)
      } else {
        // If no place found, use coordinates
        const placeData = {
          lat,
          lng,
          name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        }

        const newPlaces = [...safePlaces]
        if (!newPlaces[activeInputIndex]) {
          newPlaces[activeInputIndex] = placeData
        } else {
          newPlaces[activeInputIndex] = { ...newPlaces[activeInputIndex], ...placeData }
        }
        setPlaces(newPlaces)
      }
      
      // Clear active input index
      clearActiveInputIndex()
    } catch (error) {
      console.error('Map click error:', error)
      setError('Failed to get location details')
    } finally {
      setLoading(false)
    }
  }, [activeInputIndex, safePlaces, setPlaces, clearActiveInputIndex, setLoading, setError])

  // Allow canceling pick place mode with Escape key
  React.useEffect(() => {
    if (typeof window === 'undefined' || activeInputIndex === null) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        clearActiveInputIndex()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [activeInputIndex, clearActiveInputIndex])

  // Update cursor style when waiting for map click
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    
    const mapContainer = document.querySelector('.leaflet-container')
    if (mapContainer) {
      if (activeInputIndex !== null) {
        mapContainer.style.cursor = 'crosshair'
        mapContainer.title = 'Click on the map to select location'
      } else {
        mapContainer.style.cursor = ''
        mapContainer.title = ''
      }
    }
  }, [activeInputIndex])

  // Style Leaflet controls to match app design and position on left
  React.useEffect(() => {
    if (typeof window === 'undefined' || !L) return

    // Style zoom controls and ensure they're on the left
    const style = document.createElement('style')
    style.textContent = `
      .leaflet-control-zoom {
        border: none !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
        border-radius: 8px !important;
        overflow: hidden;
        margin: 10px 0 0 10px !important;
      }
      .leaflet-control-zoom a {
        background-color: white !important;
        color: #374151 !important;
        border: 1px solid #e5e7eb !important;
        width: 32px !important;
        height: 32px !important;
        line-height: 32px !important;
        font-size: 18px !important;
        font-weight: 600 !important;
        transition: all 0.2s ease !important;
      }
      .leaflet-control-zoom a:hover {
        background-color: #f3f4f6 !important;
        color: #111827 !important;
        border-color: #d1d5db !important;
      }
      .leaflet-control-zoom-in {
        border-bottom: 1px solid #e5e7eb !important;
      }
      .leaflet-control-zoom-out {
        border-top: none !important;
      }
      .leaflet-control-zoom a.leaflet-disabled {
        background-color: #f9fafb !important;
        color: #9ca3af !important;
        cursor: not-allowed !important;
      }
      /* Ensure zoom controls are on the left */
      .leaflet-top.leaflet-left {
        top: 0 !important;
        left: 0 !important;
      }
      .leaflet-right .leaflet-control {
        margin-right: 0 !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render map on server - MUST be after all hooks
  if (!isClient || typeof window === 'undefined' || !MapContainer) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading map...</p>
      </div>
    )
  }

  const tileProvider = appConfig.mapTileProviders?.find(
    (p) => p.id === currentTileProvider
  ) || appConfig.mapTileProviders?.[0] || {
    attribution: '&copy; OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19
  }

  return (
    <div className="relative h-full w-full">
      {activeInputIndex !== null && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1003] bg-primary-600 text-white px-4 py-2 rounded-md shadow-lg">
          <p className="text-sm font-medium">Click on the map to select location</p>
        </div>
      )}
      
      {/* Map Layer Switcher - positioned top right */}
      <MapLayerSwitcher />
      
      {/* Sidebar Toggle Button - positioned below map zoom controls on the left */}
      <div 
        className={cn(
          "absolute flex flex-col gap-2 transition-all duration-300",
          "z-[1002]",
          "left-[10px]"
        )}
        style={{ top: isMobile ? '70px' : '90px' }}
      >
        <Button
          variant="default"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(
            "h-10 w-10 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-md hover:shadow-lg transition-all rounded-lg",
            "md:h-10 md:w-10",
            sidebarOpen && "bg-primary-50 text-primary-600 border-primary-200"
          )}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
      </div>

      <MapContainer
        ref={mapRef}
        center={[mapCenter?.lat || 51.505, mapCenter?.lng || -0.09]}
        zoom={zoom || 6}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        {/* Render only the active tile layer */}
        <TileLayer
          key={currentTileProvider} // Key forces re-render when provider changes
          attribution={tileProvider.attribution}
          url={tileProvider.url}
          maxZoom={tileProvider.maxZoom}
        />
        
        <MapUpdater />
        {typeof window !== 'undefined' && useMapEvents && (
          <MapClickHandlerWrapper 
            activeInputIndex={activeInputIndex}
            handleMapClick={handleMapClick}
          />
        )}

        {/* Render markers for selected places */}
        {safePlaces
          .filter(place => place.lat != null && place.lng != null)
          .map((place, index) => (
            <Marker
              key={index}
              position={[place.lat, place.lng]}
            >
              <Popup>
                <div>
                  <p className="font-medium">{place.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">
                    {place.lat?.toFixed(4) || 'N/A'}, {place.lng?.toFixed(4) || 'N/A'}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Render route polyline if route data exists */}
        {routeData && routeData.geometry && RoutePolylineComponent && (
          <RoutePolylineComponent geometry={routeData.geometry} />
        )}

        {/* Render isochrones polygons if isochrone data exists */}
        {isochroneData && IsochronesPolygonComponent && (
          <>
            {isochroneData.features && Array.isArray(isochroneData.features) ? (
              // GeoJSON FeatureCollection format
              isochroneData.features.map((feature, index) => (
                <IsochronesPolygonComponent
                  key={`isochrone-${index}`}
                  feature={feature}
                  index={index}
                />
              ))
            ) : isochroneData.geometry ? (
              // Single feature format
              <IsochronesPolygonComponent
                key="isochrone-0"
                feature={isochroneData}
                index={0}
              />
            ) : null}
          </>
        )}
      </MapContainer>
    </div>
  )
}

