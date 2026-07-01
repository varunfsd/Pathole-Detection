import { useEffect, useState } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet-routing-machine"
import "leaflet-routing-machine/dist/leaflet-routing-machine.css"
import { Button } from "./ui/button"

interface RoutingControlProps {
  start: [number, number] | null
  destination: [number, number] | null
  onRouteFound: (distance: string, time: string) => void
  onClear: () => void
}

export function RoutingControl({ start, destination, onRouteFound, onClear }: RoutingControlProps) {
  const map = useMap()
  const [routingControl, setRoutingControl] = useState<any>(null)

  useEffect(() => {
    if (!start || !destination) {
      if (routingControl) {
        map.removeControl(routingControl)
        setRoutingControl(null)
      }
      return
    }

    if (routingControl) {
      map.removeControl(routingControl)
    }

    const control = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]),
        L.latLng(destination[0], destination[1])
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      show: false, // Hide the default itinerary
      createMarker: function(i, wp, nWps) {
        if (i === 0) {
          // Current location marker (start)
          return L.marker(wp.latLng, {
            icon: L.divIcon({
              className: "custom-leaflet-icon",
              html: `<div class="w-4 h-4 rounded-full border-2 border-white shadow-md bg-blue-500"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            }),
            draggable: false
          })
        }
        // Destination marker is already rendered by MapView's Marker, 
        // so we don't need to render another one, or we can just return null.
        // Wait, Leaflet Routing Machine requires returning a marker or it might error.
        // Let's just return a transparent div icon to hide it.
        return L.marker(wp.latLng, {
          icon: L.divIcon({
            className: "hidden",
            html: `<div></div>`,
            iconSize: [0, 0]
          })
        })
      }
    }).addTo(map)

    control.on('routesfound', function(e: any) {
      const routes = e.routes
      const summary = routes[0].summary
      
      // distance is in meters, time is in seconds
      const distance = summary.totalDistance > 1000 
        ? (summary.totalDistance / 1000).toFixed(1) + ' km' 
        : Math.round(summary.totalDistance) + ' m'
        
      const time = summary.totalTime > 3600
        ? Math.round(summary.totalTime / 3600) + ' hr ' + Math.round((summary.totalTime % 3600) / 60) + ' min'
        : Math.round(summary.totalTime / 60) + ' min'

      onRouteFound(distance, time)
    })

    setRoutingControl(control)

    return () => {
      if (control && map.hasLayer(control as any)) {
        map.removeControl(control)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, destination, map])

  return null
}
