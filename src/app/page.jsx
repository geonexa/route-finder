'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils/cn'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Footer from '@/components/layout/Footer'
import useMapStore from '@/store/map-store'
import { buildUrlParams, parseUrlParams, serializePlaces } from '@/lib/utils/url-state'

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
      <p className="text-gray-600">Loading map...</p>
    </div>
  ),
})

export default function HomePage() {
  const router = useRouter()
  const { 
    loading, 
    error, 
    sidebarOpen,
    places,
    mode,
    mapCenter,
    zoom,
    setPlaces,
    setMode,
    setMapCenter,
    setZoom
  } = useMapStore()
  
  const [isInitialized, setIsInitialized] = React.useState(false)
  const [hasTriedGeolocation, setHasTriedGeolocation] = React.useState(false)

  // Initialize state from URL on mount (priority)
  React.useEffect(() => {
    if (isInitialized || typeof window === 'undefined') return
    
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const urlState = parseUrlParams(urlParams)
      
      if (urlState.mode) {
        setMode(urlState.mode)
      }
      
      if (urlState.places && urlState.places.length > 0) {
        setPlaces(urlState.places)
      }
      
      if (urlState.mapCenter) {
        setMapCenter(urlState.mapCenter)
      }
      
      if (urlState.zoom) {
        setZoom(urlState.zoom)
      }
      
      setIsInitialized(true)
    } catch (error) {
      console.error('Error initializing from URL:', error)
      setIsInitialized(true)
    }
  }, [isInitialized, setMode, setPlaces, setMapCenter, setZoom])

  // Try to get user location on initial load (only if no URL params and not initialized)
  React.useEffect(() => {
    if (hasTriedGeolocation || typeof window === 'undefined' || !isInitialized) return
    
    const urlParams = new URLSearchParams(window.location.search)
    const hasUrlState = urlParams.get('places') || urlParams.get('center')
    
    // Only try geolocation if there's no URL state (fresh load) and map is still at default location
    if (!hasUrlState && navigator.geolocation) {
      const currentState = useMapStore.getState()
      const isDefaultLocation = 
        !currentState.mapCenter || 
        (Math.abs(currentState.mapCenter.lat - 51.505) < 0.001 && 
         Math.abs(currentState.mapCenter.lng - (-0.09)) < 0.001)
      
      if (isDefaultLocation) {
        setHasTriedGeolocation(true)
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            // Update map center and zoom to user location
            setMapCenter({ lat: latitude, lng: longitude })
            setZoom(12) // Zoom to city level
          },
          (error) => {
            // Geolocation denied or failed - keep default location
            console.log('Geolocation not available or denied, using default location')
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 300000 // 5 minutes
          }
        )
      } else {
        setHasTriedGeolocation(true)
      }
    } else {
      setHasTriedGeolocation(true)
    }
  }, [isInitialized, hasTriedGeolocation, setMapCenter, setZoom])

  // Serialize places for comparison
  const placesStr = React.useMemo(() => {
    return serializePlaces(places || [])
  }, [places])

  // Serialize map center for comparison
  const mapCenterStr = React.useMemo(() => {
    if (!mapCenter || mapCenter.lat == null || mapCenter.lng == null) return ''
    return `${mapCenter.lat.toFixed(6)},${mapCenter.lng.toFixed(6)}`
  }, [mapCenter])

  // Update URL when state changes (debounced)
  React.useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return
    
    const timeoutId = setTimeout(() => {
      try {
        const state = useMapStore.getState()
        const params = buildUrlParams(state)
        const newSearch = params.toString()
        const currentSearch = window.location.search.replace(/^\?/, '')
        
        // Only update if URL actually changed
        if (currentSearch !== newSearch) {
          const newUrl = newSearch ? `${window.location.pathname}?${newSearch}` : window.location.pathname
          router.replace(newUrl, { scroll: false })
        }
      } catch (error) {
        console.error('Error updating URL:', error)
      }
    }, 500) // Debounce URL updates
    
    return () => clearTimeout(timeoutId)
  }, [placesStr, mode, mapCenterStr, zoom, isInitialized, router])

  return (
    <div className="flex h-screen flex-col">
      <Header />
      
      <div className="flex flex-1 overflow-hidden relative" style={{ minHeight: 0 }}>
        <Sidebar />
        
        {/* Mobile overlay when sidebar is open */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-[1000] md:hidden"
            onClick={() => useMapStore.getState().setSidebarOpen(false)}
          />
        )}
        
        <main className={cn(
          "flex-1 relative transition-all duration-300",
          "z-0"
        )} style={{ minHeight: 0 }}>
          {error && (
            <div className="absolute top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg">
              {error}
            </div>
          )}
          
          {loading && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg">
              Loading...
            </div>
          )}
          
          <MapView />
        </main>
      </div>
      
      <Footer />
    </div>
  )
}
