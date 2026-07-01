import { useMemo, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navigation, AlertCircle, X } from "lucide-react"

import { RoutingControl } from "@/components/RoutingControl"
import { useAppContext } from "@/context/AppContext"

// Base coordinates from our mock data
const MAP_CENTER: [number, number] = [34.0522, -118.2437]

// Mock polygon coordinates roughly encompassing the generated potholes
const mockPolygons: Record<string, [number, number][]> = {
  "area-1": [ // Downtown District
    [34.08, -118.28],
    [34.08, -118.20],
    [34.03, -118.20],
    [34.03, -118.28],
  ],
  "area-2": [ // North Hills
    [34.13, -118.30],
    [34.13, -118.22],
    [34.08, -118.22],
    [34.08, -118.30],
  ],
  "area-3": [ // Southside Industrial
    [34.03, -118.28],
    [34.03, -118.18],
    [33.98, -118.18],
    [33.98, -118.28],
  ],
}

// Function to create a custom HTML marker based on color
const createCustomIcon = (colorClass: string) => {
  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `<div class="w-4 h-4 rounded-full border-2 border-white shadow-md ${colorClass}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

// Pre-define our three marker types
const icons = {
  pending: createCustomIcon("bg-red-500"),
  inProgress: createCustomIcon("bg-yellow-500"),
  repaired: createCustomIcon("bg-emerald-500"),
}

export function MapView() {
  const { potholes, areas } = useAppContext()
  
  const userStr = localStorage.getItem("smart-pothole-user")
  const user = userStr ? JSON.parse(userStr) : null
  const userRole = user?.role
  const userArea = user?.area

  const mapPotholes = potholes

  const mapPolygons = useMemo(() => {
    if (userRole === "agent" && userArea) {
      return { [userArea]: mockPolygons[userArea] }
    }
    return mockPolygons
  }, [userRole, userArea])

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [destinationLocation, setDestinationLocation] = useState<[number, number] | null>(null)
  const [routeStats, setRouteStats] = useState<{distance: string, time: string} | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isRouting, setIsRouting] = useState(false)

  const getIconForStatus = (status: string) => {
    if (status === "Resolved" || status === "Closed") return icons.repaired
    if (status === "In Progress") return icons.inProgress
    return icons.pending // Reported, Assigned
  }

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "Critical": return "destructive"
      case "High": return "destructive"
      case "Medium": return "default"
      case "Low": return "secondary"
      default: return "outline"
    }
  }

  const stats = useMemo(() => {
    return {
      pending: potholes.filter(p => p.status === "Reported" || p.status === "Assigned").length,
      inProgress: potholes.filter(p => p.status === "In Progress").length,
      repaired: potholes.filter(p => p.status === "Resolved" || p.status === "Closed").length,
    }
  }, [potholes])

  const handleGetDirections = (lat: number, lng: number) => {
    setLocationError(null)
    setIsRouting(true)
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
          setDestinationLocation([lat, lng])
        },
        (error) => {
          console.error(error)
          setIsRouting(false)
          setLocationError("Location permission denied or unavailable. Please enable location services.")
        }
      )
    } else {
      setIsRouting(false)
      setLocationError("Geolocation is not supported by your browser.")
    }
  }

  const clearRoute = () => {
    setUserLocation(null)
    setDestinationLocation(null)
    setRouteStats(null)
    setLocationError(null)
    setIsRouting(false)
  }

  const getPolygonColor = (index: number) => {
    const colors = ['#3b82f6', '#a855f7', '#f97316'] // blue, purple, orange
    return colors[index % colors.length]
  }

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-6rem)]">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Interactive Map</h2>
        <p className="text-muted-foreground">
          {userRole === "agent" 
            ? `Live geographic overview of potholes in ${areas.find(a => a.id === userArea)?.name || "your area"}.`
            : "Live geographic overview of all pothole reports and operational zones."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-500 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" /> Pending Repairs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-500 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" /> In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-500 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" /> Repaired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.repaired}</div>
          </CardContent>
        </Card>
      </div>

      {locationError && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-md flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{locationError}</p>
          <Button variant="ghost" size="icon" className="ml-auto hover:bg-destructive/20 hover:text-destructive" onClick={() => setLocationError(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Card className="flex-1 overflow-hidden relative">
        {routeStats && (
          <div className="absolute top-4 right-4 z-[400] bg-background border shadow-lg rounded-lg p-4 w-64">
            <div className="flex justify-between items-center mb-2 border-b pb-2">
              <h4 className="font-semibold flex items-center gap-2"><Navigation className="h-4 w-4 text-primary" /> Route Active</h4>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearRoute}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance:</span>
                <span className="font-medium">{routeStats.distance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Time:</span>
                <span className="font-medium text-primary">{routeStats.time}</span>
              </div>
            </div>
          </div>
        )}

        <div className="h-full w-full relative z-0">
          <MapContainer 
            center={MAP_CENTER} 
            zoom={12} 
            scrollWheelZoom={true} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <RoutingControl 
              start={userLocation} 
              destination={destinationLocation} 
              onRouteFound={(distance, time) => setRouteStats({ distance, time })}
              onClear={clearRoute}
            />

            {/* Render Area Polygons */}
            {Object.entries(mapPolygons).map(([areaId, positions], index) => {
              if (!positions) return null;
              return (
                <Polygon 
                  key={areaId} 
                  positions={positions} 
                  pathOptions={{ color: getPolygonColor(index), fillOpacity: 0.1 }} 
                />
              )
            })}

            {/* Render Markers */}
            {potholes.map(pothole => (
              <Marker 
                key={pothole.id} 
                position={[pothole.latitude, pothole.longitude]}
                icon={getIconForStatus(pothole.status)}
              >
                <Popup>
                  <div className="flex flex-col gap-2 min-w-[200px] p-1">
                    <div className="font-semibold text-lg border-b pb-1 mb-1">
                      {pothole.id}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">{pothole.status}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Severity:</span>
                      <Badge variant={getSeverityBadgeVariant(pothole.severity)} className="text-[10px] px-1 py-0 h-4">
                        {pothole.severity}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-muted-foreground">Area:</span>
                      <span>{areas.find(a => a.id === pothole.area)?.name}</span>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full" 
                      disabled={isRouting && destinationLocation?.[0] === pothole.latitude}
                      onClick={() => handleGetDirections(pothole.latitude, pothole.longitude)}
                    >
                      <Navigation className="mr-2 h-4 w-4" /> 
                      {isRouting && destinationLocation?.[0] === pothole.latitude ? "Routing..." : "Get Directions"}
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </Card>
    </div>
  )
}
