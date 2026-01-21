import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Map, Navigation, Clock, Search, Route, Globe } from 'lucide-react'

export const metadata = {
  title: 'About',
  description: 'Learn about OpenRouteService Maps - a free, open-source interactive map client for route planning, directions, and travel time analysis.',
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About OpenRouteService Maps</h1>
            <p className="text-lg text-gray-600">
              A modern, interactive map client built with Next.js for route planning, directions, and travel time analysis.
            </p>
          </div>

          <div className="space-y-6">
            {/* What is this tool */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  What is OpenRouteService Maps?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  OpenRouteService Maps is a free, open-source web application that provides an intuitive interface 
                  for interacting with the OpenRouteService API. It allows users to plan routes, get directions, 
                  search for places, and analyze travel time zones (isochrones) on an interactive map.
                </p>

              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Key Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Search className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Place Search</h3>
                      <p className="text-sm text-gray-600">
                        Search and geocode addresses, places, and points of interest with real-time suggestions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Route className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Route Planning</h3>
                      <p className="text-sm text-gray-600">
                        Plan multi-stop routes with detailed directions, distance, and duration information.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Isochrones</h3>
                      <p className="text-sm text-gray-600">
                        Visualize travel time zones to see how far you can travel within a specific time or distance.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Navigation className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Multiple Map Layers</h3>
                      <p className="text-sm text-gray-600">
                        Switch between OpenStreetMap, Satellite, and Google Maps styles for different views.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* OpenRouteService API */}
            <Card>
              <CardHeader>
                <CardTitle>Powered by OpenRouteService</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  This application uses the <a 
                    href="https://openrouteservice.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    OpenRouteService API
                  </a>, a free, open-source routing service that provides:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Route planning for multiple transportation modes (car, bike, foot, etc.)</li>
                  <li>Geocoding and reverse geocoding services</li>
                  <li>Isochrones (travel time and distance analysis)</li>
                  <li>Points of interest (POI) search</li>
                  <li>Elevation profiles and route optimization</li>
                </ul>
                <p className="text-gray-700">
                  OpenRouteService is developed by{' '}
                  <a 
                    href="https://www.heigit.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Heidelberg Institute for Geoinformation Technology (HeiGIT)
                  </a>.
                </p>
              </CardContent>
            </Card>

            

            {/* License & Open Source */}
            <Card>
              <CardHeader>
                <CardTitle>Open Source</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  This application is open-source and available for use, modification, and distribution. 
                  The codebase is built using open-source technologies and follows best practices for 
                  modern web development.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
