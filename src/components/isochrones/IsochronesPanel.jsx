'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Navigation } from 'lucide-react'
import useMapStore from '@/store/map-store'
import { getIsochrones } from '@/lib/ors-api/ors-api-client'

export default function IsochronesPanel() {
  const { 
    places, 
    isochroneData, 
    setIsochroneData, 
    setLoading, 
    setError,
    clearIsochrone 
  } = useMapStore()

  const [profile, setProfile] = React.useState('driving-car')
  const [rangeType, setRangeType] = React.useState('time') // 'time' or 'distance'
  const [ranges, setRanges] = React.useState([600]) // Default: 10 minutes in seconds
  const [rangeInput, setRangeInput] = React.useState('10') // User input for range

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

  const handleRangeInputChange = (value) => {
    setRangeInput(value)
    // Parse comma-separated values or single value
    const parsedRanges = value.split(',').map(v => {
      const num = parseFloat(v.trim())
      if (rangeType === 'time') {
        // Convert minutes to seconds
        return num * 60
      } else {
        // Distance in meters
        return num * 1000
      }
    }).filter(v => !isNaN(v) && v > 0)
    
    if (parsedRanges.length > 0) {
      setRanges(parsedRanges)
    }
  }

  const calculateIsochrones = async () => {
    if (safePlaces.length === 0) {
      setError('Please select at least 1 place for isochrones')
      return
    }

    // Check if place has coordinates
    const validPlaces = safePlaces.filter(p => p.lat != null && p.lng != null)
    if (validPlaces.length === 0) {
      setError('Please select a valid location')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await getIsochrones(validPlaces, {
        profile,
        range: ranges,
        range_type: rangeType,
        format: 'geojson'
      })
      
      if (result.success && result.data) {
        console.log('Isochrones response:', result.data)
        setIsochroneData(result.data)
        
        // Fit map to isochrones bounds if possible
        if (result.data.features && result.data.features.length > 0) {
          const firstFeature = result.data.features[0]
          if (firstFeature.geometry && firstFeature.geometry.coordinates) {
            // Get bounds from first polygon to center map
            // This will be handled by the polygon component
          }
        }
      } else {
        setError(result.error || 'Failed to calculate isochrones')
      }
    } catch (error) {
      setError('Failed to calculate isochrones')
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
            Add a place to calculate isochrones
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
            <Clock className="h-5 w-5" />
            Isochrones / Zone
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

          {/* Range Type Selector */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Range Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={rangeType === 'time' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setRangeType('time')
                  // Convert current ranges if switching
                  if (rangeType === 'distance') {
                    const newRanges = ranges.map(r => r / 1000) // Convert meters to km
                    setRanges(newRanges.map(r => r * 60)) // Convert km to minutes (rough estimate)
                    setRangeInput(newRanges.map(r => (r * 60).toFixed(0)).join(', '))
                  }
                }}
                className="text-xs"
              >
                Time
              </Button>
              <Button
                variant={rangeType === 'distance' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setRangeType('distance')
                  // Convert current ranges if switching
                  if (rangeType === 'time') {
                    const newRanges = ranges.map(r => r / 60) // Convert seconds to minutes
                    setRanges(newRanges.map(r => r * 1000)) // Convert km to meters (rough estimate)
                    setRangeInput(newRanges.map(r => r.toFixed(0)).join(', '))
                  }
                }}
                className="text-xs"
              >
                Distance
              </Button>
            </div>
          </div>

          {/* Range Input */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              {rangeType === 'time' ? 'Time (minutes)' : 'Distance (km)'}
            </label>
            <input
              type="text"
              value={rangeInput}
              onChange={(e) => handleRangeInputChange(e.target.value)}
              placeholder={rangeType === 'time' ? '10, 20, 30' : '5, 10, 15'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {rangeType === 'time' 
                ? 'Enter time in minutes (comma-separated for multiple zones)' 
                : 'Enter distance in kilometers (comma-separated for multiple zones)'}
            </p>
          </div>

          {/* Calculate Button */}
          <Button
            onClick={calculateIsochrones}
            className="w-full"
            disabled={safePlaces.length === 0 || ranges.length === 0}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Calculate Isochrones
          </Button>

          {/* Clear Button */}
          {isochroneData && (
            <Button
              variant="outline"
              onClick={() => {
                clearIsochrone()
              }}
              className="w-full"
            >
              Clear Isochrones
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
