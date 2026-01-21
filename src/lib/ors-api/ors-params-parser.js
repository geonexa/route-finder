'use client'

/**
 * ORS Parameters Parser
 * Similar to the original Vue.js app's ors-params-parser.js
 */

/**
 * Build the args object to be used in autocomplete places request
 * @param {String} placeName
 * @param {Boolean} restrictToBbox - restrict the search to stored bbox
 * @param {Object} mapCenter - Optional map center, will use store if not provided
 * @returns {Object} args
 */
export function buildPlaceSearchArgs(placeName, restrictToBbox = false, mapCenter = null) {
  // Get map center from store if not provided (only on client side)
  if (!mapCenter && typeof window !== 'undefined') {
    try {
      const useMapStore = require('@/store/map-store').default
      mapCenter = useMapStore.getState().mapCenter
    } catch (e) {
      // Fallback if store not available
      mapCenter = { lat: 51.505, lng: -0.09 }
    }
  }
  
  // Fallback if still no map center
  if (!mapCenter) {
    mapCenter = { lat: 51.505, lng: -0.09 }
  }
  
  // build the args object - matches original Vue.js app format exactly
  const args = {
    text: placeName,
    size: 8,
    focus_point: [mapCenter?.lat || 51.505, mapCenter?.lng || -0.09]
  }
  
  // If is set to restrict the search to current mapBounds,
  // then apply the restriction
  if (restrictToBbox) {
    // For now, we'll skip bbox restriction in Next.js version
    // Can be added later if needed
  }

  return args
}

/**
 * Build reverse search args
 * @param {Number} lat
 * @param {Number} lng
 * @returns {Object} args
 */
export function buildReverseSearchArgs(lat, lng) {
  // build the args object
  const args = {
    point: {
      lat_lng: [lat, lng],
      radius: 1 // one km radius
    },
    size: 8
  }
  
  return args
}

/**
 * Build routing request args object
 * @param {Array} places - Array of place objects with lat/lng
 * @returns {Object} args
 */
export function buildRoutingArgs(places) {
  const coordinates = places.map(place => {
    // Ensure we have valid coordinates
    if (place.lng != null && place.lat != null) {
      return [place.lng, place.lat]
    }
    return null
  }).filter(coord => coord !== null)

  if (coordinates.length < 2) {
    throw new Error('At least 2 places with valid coordinates are required')
  }

  // Set args object - matches original Vue.js app format
  const args = {
    coordinates: coordinates,
    format: 'geojson',
    elevation: true,
    instructions_format: 'html',
    language: 'en',
    units: 'km'
  }

  return args
}
