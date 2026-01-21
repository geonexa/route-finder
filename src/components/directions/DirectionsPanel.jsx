'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Route, Navigation } from 'lucide-react'
import useMapStore from '@/store/map-store'
import { getDirections } from '@/lib/ors-api/ors-api-client'

export default function DirectionsPanel() {
  const { 
    places, 
    routeData, 
    setRouteData, 
    setLoading, 
    setError,
    clearRoute 
  } = useMapStore()

  const [profile, setProfile] = React.useState('driving-car')
  const [routeInfo, setRouteInfo] = React.useState(null)

  // Safety check for places array
  const safePlaces = Array.isArray(places) ? places : []

  const profiles = [
    { value: 'driving-car', label: 'Car' },
    { value: 'driving-hgv', label: 'Truck' },
    { value: 'cycling-regular', label: 'Bicycle' },
    { value: 'cycling-road', label: 'Road Bike' },
    { value: 'foot-walking', label: 'Walking' },
    { value: 'foot-hiking', label: 'Hiking' },
  ]

  const calculateRoute = async () => {
    if (safePlaces.length < 2) {
      setError('Please select at least 2 places for routing')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await getDirections(safePlaces, { profile })
      
      if (result.success && result.data) {
        // The API returns GeoJSON format with features array
        // Format: { type: 'FeatureCollection', features: [{ geometry: {...}, properties: {...} }] }
        let routeFeature = null
        let routeSummary = null
        
        if (result.data.features && Array.isArray(result.data.features) && result.data.features.length > 0) {
          // GeoJSON format (default for format: 'geojson')
          routeFeature = result.data.features[0]
          // Summary might be in properties.summary or at the top level
          routeSummary = routeFeature.properties?.summary || result.data.summary || {}
        } else if (result.data.routes && Array.isArray(result.data.routes) && result.data.routes.length > 0) {
          // Standard JSON format (format: 'json')
          routeFeature = result.data.routes[0]
          routeSummary = routeFeature.summary || result.data.summary || {}
        } else {
          console.error('Unexpected route data format:', result.data)
          setError('Unexpected route data format')
          return
        }
        
        // Extract geometry and summary from the route feature
        const geometry = routeFeature.geometry
        const properties = routeFeature.properties || {}
        
        // Try multiple locations for distance and duration
        // For GeoJSON format: summary is in features[0].properties.summary
        // Distance and duration are in summary (meters and seconds)
        let distance = 0
        let duration = 0
        
        if (routeSummary && typeof routeSummary === 'object') {
          distance = routeSummary.distance || 0
          duration = routeSummary.duration || 0
        } else if (properties.summary && typeof properties.summary === 'object') {
          distance = properties.summary.distance || 0
          duration = properties.summary.duration || 0
        } else if (routeFeature.summary && typeof routeFeature.summary === 'object') {
          distance = routeFeature.summary.distance || 0
          duration = routeFeature.summary.duration || 0
        }
        
        // Ensure distance and duration are numbers
        distance = typeof distance === 'number' ? distance : parseFloat(distance) || 0
        duration = typeof duration === 'number' ? duration : parseFloat(duration) || 0
        
        // Check if distance is already in km (if < 1000, it's likely already in km)
        // ORS API typically returns distance in meters, but check the value
        let distanceInKm = distance
        if (distance >= 1000) {
          // Distance is in meters, convert to km
          distanceInKm = distance / 1000
        } else if (distance > 0 && distance < 1) {
          // Very small value, might be in km already, use as is
          distanceInKm = distance
        }
        
        setRouteData({
          geometry: geometry,
          distance: distance, // Store original value
          duration: duration,
          segments: properties.segments || routeFeature.segments || []
        })
        
        setRouteInfo({
          distance: distanceInKm > 0 ? distanceInKm.toFixed(2) : '0.00', // Display in km
          duration: duration > 0 ? Math.round(duration / 60) : 0, // Convert seconds to minutes
        })
        
        console.log('Route info set:', { distance: distanceInKm.toFixed(2), duration: Math.round(duration / 60) })
      } else {
        setError(result.error || 'Failed to calculate route')
      }
    } catch (error) {
      setError('Failed to calculate route')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (safePlaces.length === 0) {
    return (
      <Card className="m-4">
        <CardContent className="p-4">
          <p className="text-sm text-gray-500 text-center">
            Add at least 2 places to calculate a route
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Route Planning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile Selector */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Travel Profile
            </label>
            <div className="grid grid-cols-3 gap-2">
              {profiles.map((p) => (
                <Button
                  key={p.value}
                  variant={profile === p.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setProfile(p.value)}
                  className="text-xs"
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Calculate Button */}
          <Button
            onClick={calculateRoute}
            className="w-full"
            disabled={safePlaces.length < 2}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Calculate Route
          </Button>

          {/* Clear Button */}
          {routeData && (
            <Button
              variant="outline"
              onClick={() => {
                clearRoute()
                setRouteInfo(null)
              }}
              className="w-full"
            >
              Clear Route
            </Button>
          )}

          {/* Route Info */}
          {routeInfo && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Distance:</span>
                <span className="font-medium">{routeInfo.distance} km</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{routeInfo.duration} min</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
