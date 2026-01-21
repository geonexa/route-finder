'use client'

import * as React from 'react'
import { 
  X, MapPin, Route, Clock, Plus, RotateCcw, 
  Navigation, Trash2, GripVertical, ChevronRight,
  Play, Square, Map, ChevronLeft, PanelLeftClose
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import useMapStore from '@/store/map-store'
import { cn } from '@/lib/utils/cn'
import DirectionsPanel from '@/components/directions/DirectionsPanel'
import IsochronesPanel from '@/components/isochrones/IsochronesPanel'
import PlaceInput from '@/components/forms/PlaceInput'
import appConfig from '@/config/app-config'

export default function Sidebar() {
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    mode, 
    setMode,
    places,
    setPlaces,
    setLoading,
    setError,
    setMapCenter,
    setZoom,
    clearRoute
  } = useMapStore()
  
  // Safety checks for arrays
  const safePlaces = React.useMemo(
    () => (Array.isArray(places) ? places : []),
    [places]
  )
  const isIsoMode = mode === 'isochrones'
  const placesToRender = React.useMemo(() => {
    if (isIsoMode) {
      return safePlaces.length ? [safePlaces[0]] : []
    }
    return safePlaces
  }, [isIsoMode, safePlaces])
  
  // Initialize sidebar open state on desktop
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setSidebarOpen(true)
    }
  }, [setSidebarOpen])
  
  // Initialize with default 2 fields (start and end) for directions mode
  React.useEffect(() => {
    if (mode === 'directions') {
      if (safePlaces.length === 0) {
        setPlaces([
          { name: '', lat: null, lng: null },
          { name: '', lat: null, lng: null }
        ])
      } else if (safePlaces.length === 1) {
        setPlaces([
          ...safePlaces,
          { name: '', lat: null, lng: null }
        ])
      }
    } else {
      if (safePlaces.length === 0) {
        setPlaces([{ name: '', lat: null, lng: null }])
      } else if (safePlaces.length > 1) {
        setPlaces([safePlaces[0]])
      }
    }
  }, [mode, safePlaces, setPlaces])

  const handlePlaceSelect = (placeData, index) => {
    const newPlaces = [...safePlaces]
    newPlaces[index] = placeData
    setPlaces(newPlaces)
    
    // Update map center to selected place
    if (placeData.lat && placeData.lng) {
      setMapCenter({ lat: placeData.lat, lng: placeData.lng })
      setZoom(12)
    }
  }

  const handlePlaceChange = (value, index) => {
    const newPlaces = [...safePlaces]
    if (!newPlaces[index]) {
      newPlaces[index] = { name: value, lat: null, lng: null }
    } else {
      newPlaces[index] = { ...newPlaces[index], name: value }
    }
    setPlaces(newPlaces)
  }

  const handlePlaceClear = (index) => {
    const newPlaces = [...safePlaces]
    newPlaces[index] = { name: '', lat: null, lng: null }
    setPlaces(newPlaces)
  }

  const handleAddPlace = () => {
    if (safePlaces.length < appConfig.maxPlaceInputs) {
      setPlaces([...safePlaces, { name: '', lat: null, lng: null }])
    }
  }

  const handleRemovePlace = (index) => {
    if (safePlaces.length > 1) {
      setPlaces(safePlaces.filter((_, i) => i !== index))
    }
  }

  const handleClearAll = () => {
    if (mode === 'directions') {
      setPlaces([{ name: '', lat: null, lng: null }, { name: '', lat: null, lng: null }])
    } else {
      setPlaces([{ name: '', lat: null, lng: null }])
    }
    clearRoute()
  }

  const handleReverseRoute = () => {
    if (safePlaces.length >= 2) {
      const reversed = [...safePlaces].reverse()
      setPlaces(reversed)
    }
  }

  // Don't hide sidebar completely on desktop, just make it collapsible
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  if (isMobile && !sidebarOpen) return null

  return (
    <aside
      className={cn(
        'bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 transition-all duration-300 shadow-sm',
        isMobile
          ? 'fixed left-0 top-16 z-[1001] h-[calc(100vh-4rem)] w-80 shadow-xl'
          : 'relative h-full w-80 z-50',
        !sidebarOpen && isMobile && '-translate-x-full',
        !sidebarOpen && !isMobile && 'w-0 overflow-hidden'
      )}
      style={{ 
        height: isMobile ? 'calc(100vh - 4rem)' : '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      <div className="flex flex-col h-full overflow-hidden" style={{ height: '100%', minHeight: 0 }}>
        {/* Sidebar Header - Fixed */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 flex-shrink-0 shadow-sm" style={{ flexShrink: 0 }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary-100 rounded-lg">
              <Navigation className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Route Planner</h2>
          </div>
          <div className="flex items-center gap-1">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="h-8 w-8 hover:bg-gray-100"
                title="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Mode Selector - Fixed */}
        <div className="border-b border-gray-200 bg-white px-4 py-3 flex-shrink-0" style={{ flexShrink: 0 }}>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={mode === 'place' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('place')}
              className={cn(
                "flex items-center justify-center gap-1.5 transition-all",
                mode === 'place' && "shadow-md"
              )}
            >
              <MapPin className="h-4 w-4" />
              <span className="text-xs font-medium">Place</span>
            </Button>
            <Button
              variant={mode === 'directions' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('directions')}
              className={cn(
                "flex items-center justify-center gap-1.5 transition-all",
                mode === 'directions' && "shadow-md"
              )}
            >
              <Route className="h-4 w-4" />
              <span className="text-xs font-medium">Route</span>
            </Button>
            <Button
              variant={mode === 'isochrones' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('isochrones')}
              className={cn(
                "flex items-center justify-center gap-1.5 transition-all",
                mode === 'isochrones' && "shadow-md"
              )}
            >
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Zone</span>
            </Button>
          </div>
        </div>

        {/* Place Inputs - Scrollable */}
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4"
          style={{
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarWidth: 'thin',
            scrollbarColor: '#d1d5db #f3f4f6',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="space-y-3">
            {placesToRender.map((place, index) => {
              const isStart = index === 0 && !isIsoMode
              const isEnd = index === placesToRender.length - 1 && !isIsoMode && placesToRender.length > 1
              const isVia = !isIsoMode && !isStart && !isEnd
              const containerStatusClass = isIsoMode
                ? "border-primary-200 bg-primary-50/30"
                : isStart
                  ? "border-green-200 bg-green-50/30"
                  : isEnd
                    ? "border-red-200 bg-red-50/30"
                    : "border-blue-200 bg-blue-50/30"
              const iconBgClass = isIsoMode
                ? "bg-primary-500 text-white"
                : isStart
                  ? "bg-green-500 text-white"
                  : isEnd
                    ? "bg-red-500 text-white"
                    : "bg-blue-500 text-white"
              const headerLabel = isIsoMode
                ? 'Zone location'
                : isStart
                  ? 'Start'
                  : isEnd
                    ? 'End'
                    : `Via ${index}`
              const headerTextClass = isIsoMode
                ? 'text-primary-700'
                : isStart
                  ? 'text-green-700'
                  : isEnd
                    ? 'text-red-700'
                    : 'text-blue-700'
              const placeholderText = isIsoMode
                ? 'Zone location'
                : isStart
                  ? 'Start location'
                  : isEnd
                    ? 'End location'
                    : `Via point ${index}`
              const iconContent = isIsoMode
                ? <MapPin className="h-3 w-3" />
                : isStart
                  ? <Play className="h-3 w-3" />
                  : isEnd
                    ? <Square className="h-3 w-3" />
                    : index
              return (
                <div 
                  key={index} 
                  className={cn(
                    "relative group rounded-lg border-2 transition-all hover:shadow-md",
                    containerStatusClass
                  )}
                >
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                        iconBgClass
                      )}>
                        {iconContent}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-xs font-semibold", headerTextClass)}>
                            {headerLabel}
                          </span>
                          {!isIsoMode && isVia && (
                            <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                              Stop
                            </Badge>
                          )}
                        </div>
                      </div>
                      {!isIsoMode && isVia && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePlace(index)}
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      )}
                    </div>
                    <PlaceInput
                      index={index}
                      value={place?.name || ''}
                      onChange={(value) => handlePlaceChange(value, index)}
                      onSelect={(placeData) => handlePlaceSelect(placeData, index)}
                      onClear={() => handlePlaceClear(index)}
                      placeholder={placeholderText}
                      autofocus={isIsoMode || (isStart && safePlaces.length === 1)}
                      selectedPlace={place?.lat != null && place?.lng != null ? place : null}
                      showRemove={false}
                      onRemove={handleRemovePlace}
                      pickPlaceSupported={true}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-gray-200">
            {mode === 'directions' && (
              <>
                {safePlaces.length < appConfig.maxPlaceInputs && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddPlace}
                    className="w-full justify-start gap-2 hover:bg-primary-50 hover:border-primary-300"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Stop</span>
                    <Badge variant="secondary" className="ml-auto text-[10px]">
                      +{appConfig.maxPlaceInputs - safePlaces.length}
                    </Badge>
                  </Button>
                )}
                {safePlaces.length >= 2 && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReverseRoute}
                      className="justify-start gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Reverse</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAll}
                      className="justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Clear</span>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Directions Panel */}
          {mode === 'directions' && <DirectionsPanel />}
          
          {/* Isochrones Panel */}
          {mode === 'isochrones' && <IsochronesPanel />}
        </div>
      </div>
    </aside>
  )
}
