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
  const map = useMap()
  const polylineRef = React.useRef(null)

  React.useEffect(() => {
    if (!geometry || !geometry.coordinates || !map || !L) return

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current)
    }

    const coordinates = geometry.coordinates.map(coord => [coord[1], coord[0]])
    
    const polyline = L.polyline(coordinates, {
      color: color,
      weight: 5,
      opacity: 0.7,
      smoothFactor: 1
    })
    
    polyline.addTo(map)
    
    if (coordinates.length > 0) {
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] })
    }
    
    polylineRef.current = polyline

    return () => {
      if (polylineRef.current && map) {
        map.removeLayer(polylineRef.current)
        polylineRef.current = null
      }
    }
  }, [map, geometry, color])

  if (typeof window === 'undefined' || !useMap || !L || !map) {
    return null
  }

  return null
}
