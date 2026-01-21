'use client'

import * as React from 'react'
import useMapStore from '@/store/map-store'

// Dynamically import Leaflet components to avoid SSR issues
let Polygon, Popup, useMap, L

if (typeof window !== 'undefined') {
  const leaflet = require('react-leaflet')
  Polygon = leaflet.Polygon
  Popup = leaflet.Popup
  useMap = leaflet.useMap
  L = require('leaflet')
}

/**
 * Component to render isochrones polygons on the map
 * Converts GeoJSON coordinates from [lng, lat] to [lat, lng] for Leaflet
 */
export default function IsochronesPolygon({ feature, index }) {
  const polygonRef = React.useRef(null)
  const map = useMap()
  const geometry = feature?.geometry || feature
  const properties = feature?.properties || {}
  
  React.useEffect(() => {
    if (!feature || !geometry || typeof window === 'undefined') return
    console.log('IsochronesPolygon rendering:', { feature, geometry, index })
  }, [feature, geometry, index])

  if (typeof window === 'undefined' || !Polygon || !feature || !map || !geometry) {
    return null
  }

  // Get polygon coordinates based on geometry type
  // GeoJSON uses [lng, lat] but Leaflet needs [lat, lng]
  let positions = []
  
  if (geometry.type === 'Polygon') {
    // Polygon: coordinates is an array of linear rings (first is outer, rest are holes)
    // Each ring is an array of [lng, lat] coordinate pairs
    if (geometry.coordinates && geometry.coordinates.length > 0) {
      positions = geometry.coordinates.map(ring => {
        // Each ring is an array of [lng, lat] pairs
        return ring.map(coord => {
          if (Array.isArray(coord) && coord.length >= 2) {
            return [coord[1], coord[0]] // Swap [lng, lat] to [lat, lng]
          }
          return coord
        })
      })
    }
  } else if (geometry.type === 'MultiPolygon') {
    // MultiPolygon: array of polygons, each polygon has rings
    if (geometry.coordinates && geometry.coordinates.length > 0) {
      positions = geometry.coordinates.map(polygon => 
        polygon.map(ring => 
          ring.map(coord => {
            if (Array.isArray(coord) && coord.length >= 2) {
              return [coord[1], coord[0]] // Swap [lng, lat] to [lat, lng]
            }
            return coord
          })
        )
      )
    }
  } else if (geometry.type === 'Feature') {
    // If it's a Feature, get the geometry
    return <IsochronesPolygon feature={geometry} index={index} />
  }

  if (!positions || positions.length === 0) {
    console.warn('IsochronesPolygon: No valid positions found', { geometry, feature })
    return null
  }

  // Don't auto-fit bounds - let user control the map
  // Bounds fitting should be handled in the parent component when isochrones are first calculated

  // Default colors for different ranges (if multiple isochrones)
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Light Salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
  ]
  
  const color = properties.color || colors[index % colors.length] || '#4ECDC4'
  const fillColor = properties.fillColor || color
  const fillOpacity = properties.fillOpacity !== undefined ? properties.fillOpacity : 0.3
  const opacity = properties.opacity !== undefined ? properties.opacity : 0.8
  const weight = properties.weight || 2

  // Get label for popup
  const label = properties.label || properties.range || `Zone ${index + 1}`

  return (
    <Polygon
      ref={polygonRef}
      positions={positions}
      pathOptions={{
        color: color,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        weight: weight,
        opacity: opacity
      }}
    >
      <Popup>
        <div>
          <p className="font-medium">{label}</p>
          {properties.range && (
            <p className="text-xs text-gray-500">
              Range: {properties.range}
            </p>
          )}
          {properties.area && (
            <p className="text-xs text-gray-500">
              Area: {properties.area}
            </p>
          )}
        </div>
      </Popup>
    </Polygon>
  )
}
