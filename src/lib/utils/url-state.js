'use client'

/**
 * URL State Management Utilities
 * Handles serialization and deserialization of app state to/from URL parameters
 */

/**
 * Serialize places array to URL-friendly format
 * Format: lat1,lng1,name1|lat2,lng2,name2
 * Uses URL encoding for names to handle special characters
 */
export function serializePlaces(places) {
  if (!Array.isArray(places) || places.length === 0) return ''
  
  return places
    .filter(place => place.lat != null && place.lng != null)
    .map(place => {
      const name = place.name || ''
      // URL encode the name to handle special characters
      const encodedName = encodeURIComponent(name)
      return `${place.lat.toFixed(6)},${place.lng.toFixed(6)},${encodedName}`
    })
    .join('|')
}

/**
 * Deserialize places from URL format
 */
export function deserializePlaces(placesStr) {
  if (!placesStr || placesStr.trim() === '') return []
  
  try {
    return placesStr.split('|').map(placeStr => {
      // Split by comma, but handle commas in the name (which is URL encoded)
      // The format is: lat,lng,encodedName
      // We need to split on the first two commas only
      const firstComma = placeStr.indexOf(',')
      const secondComma = placeStr.indexOf(',', firstComma + 1)
      
      if (firstComma === -1 || secondComma === -1) return null
      
      const lat = parseFloat(placeStr.substring(0, firstComma))
      const lng = parseFloat(placeStr.substring(firstComma + 1, secondComma))
      const encodedName = placeStr.substring(secondComma + 1)
      
      if (!isNaN(lat) && !isNaN(lng)) {
        let name = ''
        try {
          name = decodeURIComponent(encodedName)
        } catch (e) {
          name = encodedName // Fallback if decode fails
        }
        
        return {
          lat,
          lng,
          name: name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          address: name
        }
      }
      return null
    }).filter(place => place !== null)
  } catch (error) {
    console.error('Error deserializing places:', error)
    return []
  }
}

/**
 * Serialize map center to URL format
 */
export function serializeMapCenter(center) {
  if (!center || center.lat == null || center.lng == null) return ''
  return `${center.lat},${center.lng}`
}

/**
 * Deserialize map center from URL format
 */
export function deserializeMapCenter(centerStr) {
  if (!centerStr || centerStr.trim() === '') return null
  
  try {
    const parts = centerStr.split(',')
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0])
      const lng = parseFloat(parts[1])
      
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng }
      }
    }
  } catch (error) {
    console.error('Error deserializing map center:', error)
  }
  
  return null
}

/**
 * Build URL search params from app state
 */
export function buildUrlParams(state) {
  const params = new URLSearchParams()
  
  // Mode
  if (state.mode && state.mode !== 'place') {
    params.set('mode', state.mode)
  }
  
  // Places
  if (state.places && Array.isArray(state.places) && state.places.length > 0) {
    const placesStr = serializePlaces(state.places)
    if (placesStr) {
      params.set('places', placesStr)
    }
  }
  
  // Map center - always include if available
  if (state.mapCenter && state.mapCenter.lat != null && state.mapCenter.lng != null) {
    const centerStr = serializeMapCenter(state.mapCenter)
    if (centerStr) {
      params.set('center', centerStr)
    }
  }
  
  // Zoom - always include if available
  if (state.zoom != null) {
    params.set('zoom', state.zoom.toString())
  }
  
  return params
}

/**
 * Parse URL search params to app state
 */
export function parseUrlParams(searchParams) {
  const state = {}
  
  // Mode
  if (searchParams.get('mode')) {
    const mode = searchParams.get('mode')
    if (['place', 'directions', 'isochrones', 'search'].includes(mode)) {
      state.mode = mode
    }
  }
  
  // Places
  if (searchParams.get('places')) {
    const places = deserializePlaces(searchParams.get('places'))
    if (places.length > 0) {
      state.places = places
    }
  }
  
  // Map center
  if (searchParams.get('center')) {
    const center = deserializeMapCenter(searchParams.get('center'))
    if (center) {
      state.mapCenter = center
    }
  }
  
  // Zoom
  if (searchParams.get('zoom')) {
    const zoom = parseFloat(searchParams.get('zoom'))
    if (!isNaN(zoom) && zoom >= 1 && zoom <= 20) {
      state.zoom = zoom
    }
  }
  
  return state
}
