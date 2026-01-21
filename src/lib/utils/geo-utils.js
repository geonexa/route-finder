/**
 * Geographic utility functions
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Object} coord1 - {lat, lng}
 * @param {Object} coord2 - {lat, lng}
 * @param {String} unit - 'km' or 'mi'
 * @returns {Number} Distance in specified unit
 */
export function calculateDistance(coord1, coord2, unit = 'km') {
  const R = unit === 'km' ? 6371 : 3959 // Earth radius in km or miles
  const dLat = toRad(coord2.lat - coord1.lat)
  const dLon = toRad(coord2.lng - coord1.lng)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return distance
}

/**
 * Convert degrees to radians
 */
function toRad(degrees) {
  return (degrees * Math.PI) / 180
}

/**
 * Build lat/lng object from coordinates
 */
export function buildLatLng(lat, lng) {
  return { lat, lng }
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat, lng, precision = 6) {
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`
}
