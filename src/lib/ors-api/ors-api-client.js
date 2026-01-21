'use client'

// Client-side only imports - these will be dynamically loaded
let OrsApiClient
let appConfig
let buildPlaceSearchArgs, buildReverseSearchArgs, buildRoutingArgs

// Lazy load the ORS client
async function getOrsApiClient() {
  if (!OrsApiClient && typeof window !== 'undefined') {
    const orsModule = await import('openrouteservice-js')
    OrsApiClient = orsModule.default || orsModule
  }
  return OrsApiClient
}

// Lazy load config and parsers
function getAppConfig() {
  if (!appConfig && typeof window !== 'undefined') {
    appConfig = require('@/config/app-config').default
  }
  return appConfig
}

function getParamsParser() {
  if (typeof window !== 'undefined') {
    const paramsParser = require('./ors-params-parser')
    if (!buildPlaceSearchArgs) {
      buildPlaceSearchArgs = paramsParser.buildPlaceSearchArgs
      buildReverseSearchArgs = paramsParser.buildReverseSearchArgs
      buildRoutingArgs = paramsParser.buildRoutingArgs
    }
  }
}

/**
 * ORS API Client wrapper
 * Similar to ors-api-runner.js in the Vue.js version
 */

// These will be set when functions are called (client-side only)
function getApiConfig() {
  if (typeof window === 'undefined') {
    throw new Error('ORS API can only be used on the client side')
  }
  const config = getAppConfig()
  return {
    API_KEY: config.orsApiKey,
    API_BASE_URL: config.orsApiBaseUrl
  }
}

// Default endpoints matching the original app
// Note: The openrouteservice-js library handles the /v2/ prefix automatically
const DEFAULT_ENDPOINTS = {
  geocodeSearch: 'geocode/search',
  reverseGeocode: 'geocode/reverse',
  directions: 'directions',  // Library adds /v2/ automatically
  isochrones: 'isochrones',  // Library adds /v2/ automatically
  pois: 'pois'
}

/**
 * Get custom endpoint settings
 * Matches the original Vue.js app implementation exactly
 */
function getCustomEndpointSettings(apiBaseUrl, endpoint) {
  let host
  let service
  
  if (!endpoint.startsWith('http')) {
    // Relative path - return as is (no leading slash, library handles it)
    // The openrouteservice-js library adds /v2/ automatically for Directions/Isochrones
    return [apiBaseUrl, endpoint]
  } else {
    // Full URL - parse it
    const parts = endpoint.split('/')
    if (parts.includes('ors')) {
      host = parts.slice(0, 4).join('/')
    } else {
      host = parts.slice(0, 3).join('/')
    }
    service = '/' + parts.slice(-1) // Get only the last part
    return [host, service]
  }
}

/**
 * Get directions/route between places
 * @param {Array} places - Array of place objects with lat/lng
 * @param {Object} customArgs - Additional routing parameters
 * @returns {Promise}
 */
export async function getDirections(places, customArgs = {}) {
  if (typeof window === 'undefined') {
    throw new Error('getDirections can only be called on the client side')
  }
  
  try {
    const { API_KEY, API_BASE_URL } = getApiConfig()
    const endpoint = DEFAULT_ENDPOINTS.directions
    const [host, service] = getCustomEndpointSettings(API_BASE_URL, endpoint)
    
    // Ensure service doesn't have leading slash or /v2/ prefix
    // The library adds /v2/ automatically for Directions API
    const cleanService = service.startsWith('/') ? service.slice(1) : service
    const finalService = cleanService.replace(/^v2\//, '') // Remove v2/ if present
    
    const OrsClient = await getOrsApiClient()
    
    const directions = new OrsClient.Directions({
      api_key: API_KEY,
      host: host,
      service: finalService, // Should be just 'directions'
      timeout: 30000
    })

    // Build args using the same parser as the original app
    getParamsParser()
    if (!buildRoutingArgs) {
      throw new Error('buildRoutingArgs not loaded')
    }
    const args = buildRoutingArgs(places)
    
    // Apply profile from customArgs
    if (customArgs.profile) {
      args.profile = customArgs.profile
    } else {
      args.profile = 'driving-car' // Default profile
    }
    
    // Merge any other custom args (but don't override coordinates or profile if already set)
    const { profile, ...otherArgs } = customArgs
    Object.assign(args, otherArgs)

    const response = await directions.calculate(args)
    
    return {
      success: true,
      data: response,
      options: {
        origin: 'directions',
        apiVersion: 'v2'
      }
    }
  } catch (error) {
    console.error('Directions API error:', error)
    return {
      success: false,
      error: error.message || 'Failed to get directions',
      data: null
    }
  }
}

/**
 * Geocode - search for places by name
 * Matches the original Vue.js app implementation exactly
 * @param {String} term - Search term
 * @param {Number} size - Number of results
 * @returns {Promise}
 */
export async function geocode(term, size = 10) {
  if (typeof window === 'undefined') {
    throw new Error('geocode can only be called on the client side')
  }
  
  try {
    const { API_KEY, API_BASE_URL } = getApiConfig()
    const endpoint = DEFAULT_ENDPOINTS.geocodeSearch
    const [host, service] = getCustomEndpointSettings(API_BASE_URL, endpoint)
    
    const OrsClient = await getOrsApiClient()
    
    const client = new OrsClient.Geocode({
      api_key: API_KEY,
      host: host,
      service: service
    })

    // Build args using the same parser as the original app
    getParamsParser()
    if (!buildPlaceSearchArgs) {
      throw new Error('buildPlaceSearchArgs not loaded')
    }
    const args = buildPlaceSearchArgs(term, false)
    args.size = size

    const response = await client.geocode(args)
    
    return {
      success: true,
      data: response,
      places: response.features || []
    }
  } catch (error) {
    console.error('Geocode API error:', error)
    return {
      success: false,
      error: error.message || 'Failed to geocode',
      places: []
    }
  }
}

/**
 * Reverse geocode - get place from coordinates
 * Matches the original Vue.js app implementation exactly
 * @param {Number} lat - Latitude
 * @param {Number} lng - Longitude
 * @param {Number} size - Number of results
 * @returns {Promise}
 */
export async function reverseGeocode(lat, lng, size = 10) {
  if (typeof window === 'undefined') {
    throw new Error('reverseGeocode can only be called on the client side')
  }
  
  try {
    const { API_KEY, API_BASE_URL } = getApiConfig()
    const endpoint = DEFAULT_ENDPOINTS.reverseGeocode
    const [host, service] = getCustomEndpointSettings(API_BASE_URL, endpoint)
    
    const OrsClient = await getOrsApiClient()
    
    const client = new OrsClient.Geocode({
      api_key: API_KEY,
      host: host,
      service: service
    })

    // Build args using the same parser as the original app
    getParamsParser()
    if (!buildReverseSearchArgs) {
      throw new Error('buildReverseSearchArgs not loaded')
    }
    const args = buildReverseSearchArgs(lat, lng)
    args.size = size

    const response = await client.reverseGeocode(args)
    
    return {
      success: true,
      data: response,
      places: response.features || []
    }
  } catch (error) {
    console.error('Reverse geocode API error:', error)
    return {
      success: false,
      error: error.message || 'Failed to reverse geocode',
      places: []
    }
  }
}

/**
 * Get isochrones - travel time/distance areas
 * @param {Array} places - Array of place objects with lat/lng
 * @param {Object} options - Isochrone options
 * @returns {Promise}
 */
export async function getIsochrones(places, options = {}) {
  if (typeof window === 'undefined') {
    throw new Error('getIsochrones can only be called on the client side')
  }
  
  try {
    const { API_KEY, API_BASE_URL } = getApiConfig()
    const endpoint = DEFAULT_ENDPOINTS.isochrones || 'isochrones'
    const [host, service] = getCustomEndpointSettings(API_BASE_URL, endpoint)
    
    // Ensure service doesn't have leading slash or /v2/ prefix
    // The library adds /v2/ automatically for Isochrones API
    const cleanService = service.startsWith('/') ? service.slice(1) : service
    const finalService = cleanService.replace(/^v2\//, '') // Remove v2/ if present
    
    const OrsClient = await getOrsApiClient()
    
    const isochrones = new OrsClient.Isochrones({
      api_key: API_KEY,
      host: host,
      service: finalService, // Should be just 'isochrones'
      timeout: 30000
    })

    const coordinates = places.map(place => [place.lng, place.lat])
    
    const args = {
      locations: coordinates,
      profile: options.profile || 'driving-car',
      range: options.range || [600], // 10 minutes in seconds
      range_type: options.range_type || 'time',
      format: 'geojson',
      ...options
    }

    const response = await isochrones.calculate(args)
    console.log('response', response)
    
    return {
      success: true,
      data: response,
      options: {
        origin: 'isochrones',
        apiVersion: 'v2'
      }
    }
  } catch (error) {
    console.error('Isochrones API error:', error)
    return {
      success: false,
      error: error.message || 'Failed to get isochrones',
      data: null
    }
  }
}

/**
 * Get POIs (Points of Interest)
 * @param {Object} filters - POI filters
 * @param {Number} limit - Maximum number of results
 * @returns {Promise}
 */
export async function getPois(filters, limit = 100) {
  if (typeof window === 'undefined') {
    throw new Error('getPois can only be called on the client side')
  }
  
  try {
    const { API_KEY, API_BASE_URL } = getApiConfig()
    const OrsClient = await getOrsApiClient()
    
    const pois = new OrsClient.Pois({
      api_key: API_KEY,
      host: API_BASE_URL,
      service: '/pois'
    })

    const args = {
      ...filters,
      limit,
      format: 'json'
    }

    const response = await pois.pois(args)
    
    return {
      success: true,
      data: response,
      pois: response.features || []
    }
  } catch (error) {
    console.error('POIs API error:', error)
    return {
      success: false,
      error: error.message || 'Failed to get POIs',
      pois: []
    }
  }
}
