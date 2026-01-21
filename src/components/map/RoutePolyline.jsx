'use client'

import * as React from 'react'

// Dynamically import Leaflet to avoid SSR issues
let useMap, L

if (typeof window !== 'undefined') {
  const leaflet = require('react-leaflet')
  useMap = leaflet.useMap
  L = require('leaflet')
}

/**
 * Component to render route polyline on the map
 */
export default function RoutePolyline({ geometry, color = '#0ea5e9' }) {
  if (typeof window === 'undefined' || !useMap || !L) return null
  
  const map = useMap()
  const polylineRef = React.useRef(null)

  React.useEffect(() => {
    if (!geometry || !geometry.coordinates || !map) return

    // Remove existing polyline
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current)
    }

    // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
    const coordinates = geometry.coordinates.map(coord => [coord[1], coord[0]])
    
    // Create polyline
    const polyline = L.polyline(coordinates, {
      color: color,
      weight: 5,
      opacity: 0.7,
      smoothFactor: 1
    })
    
    polyline.addTo(map)
    
    // Fit map to route bounds
    if (coordinates.length > 0) {
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] })
    }
    
    polylineRef.current = polyline

    // Cleanup
    return () => {
      if (polylineRef.current && map) {
        map.removeLayer(polylineRef.current)
        polylineRef.current = null
      }
    }
  }, [map, geometry, color])

  return null
}
