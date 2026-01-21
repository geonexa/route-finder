'use client'

import * as React from 'react'
import { Layers, Map as MapIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import useMapStore from '@/store/map-store'
import appConfig from '@/config/app-config'

export default function MapLayerSwitcher() {
  const { currentTileProvider, setCurrentTileProvider } = useMapStore()
  const [isOpen, setIsOpen] = React.useState(false)

  const tileProviders = appConfig.mapTileProviders || []

  const handleLayerChange = (providerId) => {
    setCurrentTileProvider(providerId)
    setIsOpen(false)
  }

  return (
    <div className="absolute top-4 right-4 z-[1002]">
      <div className="relative">
        {/* Toggle Button */}
        <Button
          variant="default"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-10 w-10 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-md hover:shadow-lg transition-all rounded-lg",
            isOpen && "bg-primary-50 text-primary-600 border-primary-200"
          )}
          aria-label="Change base map"
          title="Change base map"
        >
          <Layers className="h-5 w-5" />
        </Button>

        {/* Layer Options Panel */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[1001]"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel */}
            <Card className="absolute top-12 right-0 w-56 shadow-xl z-[1002] border border-gray-200">
              <CardContent className="p-2">
                <div className="space-y-1">
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200 mb-1">
                    Base Map
                  </div>
                  {tileProviders.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => handleLayerChange(provider.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-sm transition-all",
                        "hover:bg-gray-100 flex items-center gap-2",
                        currentTileProvider === provider.id && "bg-primary-50 text-primary-700 font-medium"
                      )}
                    >
                      <span className="text-base">{provider.icon}</span>
                      <span>{provider.name}</span>
                      {currentTileProvider === provider.id && (
                        <span className="ml-auto text-primary-600">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
