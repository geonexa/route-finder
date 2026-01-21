'use client'

import * as React from 'react'
import { Search, X, MapPin, Map, Navigation } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { geocode, reverseGeocode } from '@/lib/ors-api/ors-api-client'
import { cn } from '@/lib/utils/cn'
import useMapStore from '@/store/map-store'

export default function PlaceInput({
  index,
  value,
  onChange,
  onSelect,
  onClear,
  placeholder,
  autofocus = false,
  showRemove = false,
  onRemove,
  className,
  pickPlaceSupported = true,
  selectedPlace = null // Track if a place is already selected
}) {
  const { activeInputIndex, setActiveInputIndex, clearActiveInputIndex } = useMapStore()
  const [searchTerm, setSearchTerm] = React.useState(value || '')
  const [suggestions, setSuggestions] = React.useState([])
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const [isSearching, setIsSearching] = React.useState(false)
  const [isGettingLocation, setIsGettingLocation] = React.useState(false)
  const [hasSelectedPlace, setHasSelectedPlace] = React.useState(!!selectedPlace)
  const inputRef = React.useRef(null)
  const debounceTimeoutRef = React.useRef(null)
  const { setLoading, setError } = useMapStore()
  
  // Check if this input is waiting for map click
  const isWaitingForMapClick = activeInputIndex === index

  // Update local state when value prop changes
  React.useEffect(() => {
    setSearchTerm(value || '')
  }, [value])

  // Track if a place is selected
  React.useEffect(() => {
    setHasSelectedPlace(!!selectedPlace)
  }, [selectedPlace])

  // Debounced search - called automatically as user types
  const handleSearch = React.useCallback(async (term) => {
    if (!term || term.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsSearching(true)
    try {
      const result = await geocode(term, 8) // Increased to 8 suggestions
      if (result.success && result.places && result.places.length > 0) {
        // Filter out suggestions that match the current input exactly
        const normalizedTerm = term.trim().toLowerCase()
        const filtered = result.places.filter(place => {
          const label = (place.properties.label || place.properties.name || '').toLowerCase()
          // Exclude if it exactly matches the search term
          if (label === normalizedTerm) return false
          // Exclude "Current Location" duplicates from search results
          if (label.includes('current location') || label === 'current location') return false
          return true
        })
        setSuggestions(filtered)
        setShowSuggestions(filtered.length > 0 || !hasSelectedPlace)
      } else {
        setSuggestions([])
        setShowSuggestions(!hasSelectedPlace && term.trim().length === 0)
      }
    } catch (error) {
      console.error('Search error:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsSearching(false)
    }
  }, [hasSelectedPlace])

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    onChange?.(newValue)

    // If user starts typing, clear selected place state
    if (hasSelectedPlace && newValue.trim().length > 0) {
      setHasSelectedPlace(false)
    }

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Show suggestions immediately if there's text, with debounce for API calls
    if (newValue.trim().length >= 2) {
      // Debounce search to avoid too many API calls
      debounceTimeoutRef.current = setTimeout(() => {
        handleSearch(newValue)
      }, 200) // Reduced debounce time for faster suggestions
    } else {
      // Clear suggestions if input is too short
      setSuggestions([])
      // Show current location option if input is empty
      setShowSuggestions(newValue.trim().length === 0 && !hasSelectedPlace)
    }
  }

  const handleSelectPlace = (place) => {
    const [lng, lat] = place.geometry.coordinates
    const placeData = {
      lat,
      lng,
      name: place.properties.label || place.properties.name || 'Unknown',
      address: place.properties.label,
      place: place
    }

    setSearchTerm(placeData.name)
    setShowSuggestions(false)
    setSuggestions([])
    setHasSelectedPlace(true)
    onSelect?.(placeData, index)
  }

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setIsGettingLocation(true)
    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          
          // Reverse geocode to get address
          const result = await reverseGeocode(latitude, longitude, 1)
          
          if (result.success && result.places && result.places.length > 0) {
            const place = result.places[0]
            const [placeLng, placeLat] = place.geometry.coordinates
            const placeData = {
              lat: placeLat,
              lng: placeLng,
              name: place.properties.label || place.properties.name || 'Current Location',
              address: place.properties.label,
              place: place
            }
            
            setSearchTerm(placeData.name)
            setShowSuggestions(false)
            setSuggestions([])
            setHasSelectedPlace(true)
            onSelect?.(placeData, index)
            
            // Update map center
            useMapStore.getState().setMapCenter({ lat: latitude, lng: longitude })
            useMapStore.getState().setZoom(15)
          } else {
            // If no address found, use coordinates
            const placeData = {
              lat: latitude,
              lng: longitude,
              name: 'Current Location',
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            }
            
            setSearchTerm(placeData.name)
            setShowSuggestions(false)
            setSuggestions([])
            setHasSelectedPlace(true)
            onSelect?.(placeData, index)
            
            // Update map center
            useMapStore.getState().setMapCenter({ lat: latitude, lng: longitude })
            useMapStore.getState().setZoom(15)
          }
        } catch (error) {
          console.error('Reverse geocode error:', error)
          setError('Failed to get address for current location')
        } finally {
          setIsGettingLocation(false)
          setLoading(false)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        setError('Failed to get your current location. Please check your browser permissions.')
        setIsGettingLocation(false)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const handleClear = () => {
    setSearchTerm('')
    setSuggestions([])
    setShowSuggestions(false)
    setHasSelectedPlace(false)
    onChange?.('')
    onClear?.()
  }

  const handleFocus = () => {
    // Only show suggestions if no place is selected or user is typing
    if (hasSelectedPlace && searchTerm.trim().length > 0) {
      // If place is selected, don't show suggestions unless user is actively typing
      return
    }
    
    // Show current location option when input is focused (even if empty)
    if (searchTerm.trim().length === 0) {
      setShowSuggestions(true)
    } else if (suggestions.length > 0 && searchTerm.trim().length >= 2) {
      setShowSuggestions(true)
    } else if (searchTerm.trim().length >= 2) {
      // If we have text but no suggestions yet, trigger search
      handleSearch(searchTerm)
    }
  }

  const handlePickPlaceClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (pickPlaceSupported) {
      // Toggle: if already active, cancel; otherwise set as active
      if (activeInputIndex === index) {
        clearActiveInputIndex()
      } else {
        // Set this input as active for map click
        setActiveInputIndex(index)
      }
    }
  }

  // Clear active input when component unmounts or input loses focus
  React.useEffect(() => {
    return () => {
      if (activeInputIndex === index) {
        clearActiveInputIndex()
      }
    }
  }, [activeInputIndex, clearActiveInputIndex, index])

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setShowSuggestions(false)
    }, 250)
  }

  // Auto-search when component mounts with existing value
  React.useEffect(() => {
    if (value && value.trim().length >= 2 && suggestions.length === 0) {
      handleSearch(value)
    }
  }, [value, suggestions.length, handleSearch])

  return (
    <div className={cn('relative', className)}>
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder || `Place ${index + 1}`}
            className="pl-10 pr-10"
            autoFocus={autofocus}
          />
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {pickPlaceSupported && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7",
                  isWaitingForMapClick && "bg-primary-100 text-primary-600"
                )}
                onClick={handlePickPlaceClick}
                title="Click on map to select location"
              >
                <Map className="h-3 w-3" />
              </Button>
            )}
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        {showRemove && onRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="h-10 w-10"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown - Only show if no place is selected or user is actively typing */}
      {showSuggestions && !hasSelectedPlace && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {/* Current Location Option - Only show when input is empty or no place selected */}
          {searchTerm.trim().length === 0 && (
            <Card
              className="cursor-pointer hover:bg-primary-50 transition-colors border-0 rounded-none border-b"
              onClick={handleGetCurrentLocation}
              onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Navigation className={cn(
                    "h-4 w-4 flex-shrink-0",
                    isGettingLocation ? "text-primary-600 animate-pulse" : "text-primary-600"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {isGettingLocation ? 'Getting location...' : 'Current Location'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Use your current GPS location
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Results */}
          {isSearching && suggestions.length === 0 ? (
            <div className="p-3">
              <p className="text-sm text-gray-500 text-center">Searching locations...</p>
            </div>
          ) : (
            suggestions.map((place, idx) => (
              <Card
                key={idx}
                className="cursor-pointer hover:bg-primary-50 transition-colors border-0 rounded-none border-b last:border-b-0"
                onClick={() => handleSelectPlace(place)}
                onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {place.properties.label || place.properties.name}
                      </p>
                      {place.properties.layer && (
                        <p className="text-xs text-gray-500 mt-0.5 capitalize">
                          {place.properties.layer}
                        </p>
                      )}
                      {place.properties.country && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {place.properties.country}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
