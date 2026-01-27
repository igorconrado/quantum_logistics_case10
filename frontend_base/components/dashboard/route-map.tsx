"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, ZoomIn, ZoomOut, Maximize2, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRoute } from "@/lib/route-context"
import type { City } from "@/lib/types"

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
)
const Tooltip = dynamic(
  () => import("react-leaflet").then((mod) => mod.Tooltip),
  { ssr: false }
)
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
)

// MapController needs useMap which requires being inside MapContainer,
// so we load it separately as a client-only component
function MapControllerInner({ selectedCities }: { selectedCities: City[] }) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useMap } = require("react-leaflet")
  const map = useMap()

  useEffect(() => {
    if (selectedCities.length > 0 && map) {
      const bounds = selectedCities.map((c) => [c.lat, c.lng] as [number, number])
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 })
    }
  }, [selectedCities, map])

  return null
}

const MapController = dynamic(() => Promise.resolve(MapControllerInner), {
  ssr: false,
})

export function RouteMap() {
  const { selectedCities, results, isCalculating, calculationProgress, config } = useRoute()
  const [mapReady, setMapReady] = useState(false)
  const [mapStyle, setMapStyle] = useState<"dark" | "satellite">("dark")
  const mapRef = useRef<any>(null)

  useEffect(() => {
    setMapReady(true)
  }, [])

  const handleZoomIn = () => {
    mapRef.current?.zoomIn()
  }

  const handleZoomOut = () => {
    mapRef.current?.zoomOut()
  }

  const handleFitBounds = () => {
    if (selectedCities.length > 0) {
      const bounds = selectedCities.map((c) => [c.lat, c.lng] as [number, number])
      mapRef.current?.fitBounds(bounds, { padding: [50, 50] })
    }
  }

  // Route line: use real geometry from API if available, otherwise use sequence positions
  const routeCoordinates: [number, number][] = results?.routeGeometry
    ? results.routeGeometry.map(([lon, lat]) => [lat, lon] as [number, number])
    : results?.sequence?.map((city: City) => [city.lat, city.lng] as [number, number]) || []

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden border border-border bg-card">
      {/* Map loading state */}
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
        </div>
      )}

      {/* Leaflet Map */}
      {mapReady && typeof window !== "undefined" && (
        <MapContainer
          ref={mapRef}
          center={[-15.7801, -47.9292]}
          zoom={4}
          className="h-full w-full"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url={
              mapStyle === "dark"
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            }
          />

          <MapController selectedCities={selectedCities} />

          {/* Route line */}
          {routeCoordinates.length > 1 && (
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: "#00e5cc",
                weight: 3,
                opacity: 0.8,
                dashArray: config.useRealRoads && results?.routeGeometry ? undefined : "10, 10",
              }}
            />
          )}

          {/* City markers using CircleMarker */}
          {selectedCities.map((city, index) => (
            <CircleMarker
              key={city.id}
              center={[city.lat, city.lng]}
              radius={city.isHub ? 14 : 10}
              pathOptions={{
                fillColor: city.isHub ? "#ff6b35" : "#6366f1",
                fillOpacity: 1,
                color: "#ffffff",
                weight: 2,
              }}
            >
              <Tooltip
                permanent={false}
                direction="top"
                offset={[0, -10]}
                className="custom-tooltip"
              >
                <div className="text-sm bg-card text-foreground p-2 rounded-lg border border-border shadow-xl">
                  <p className="font-semibold">{city.name}</p>
                  <p className="text-muted-foreground text-xs">{city.state}</p>
                  {city.isHub && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-coral/20 text-coral text-xs rounded">
                      Hub
                    </span>
                  )}
                  {!city.isHub && results?.sequence && (
                    <span className="inline-block mt-1 text-xs text-muted-foreground">
                      Stop #{index + 1}
                    </span>
                  )}
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      )}

      {/* Calculation overlay */}
      <AnimatePresence>
        {isCalculating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-20"
          >
            <div className="relative mb-6">
              <motion.div
                className="w-20 h-20 rounded-full border-4 border-coral/30"
                style={{ borderTopColor: "var(--coral)" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-coral font-mono">
                  {Math.round(calculationProgress)}%
                </span>
              </div>
            </div>
            <p className="text-foreground font-medium">
              {config.algorithmType === "quantum"
                ? "Running Quantum Optimization..."
                : "Calculating Optimal Route..."}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Analyzing {selectedCities.length} waypoints
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomIn}
          className="bg-card/90 backdrop-blur-sm border border-border hover:border-neon/50"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomOut}
          className="bg-card/90 backdrop-blur-sm border border-border hover:border-neon/50"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleFitBounds}
          className="bg-card/90 backdrop-blur-sm border border-border hover:border-neon/50"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setMapStyle(mapStyle === "dark" ? "satellite" : "dark")}
          className="bg-card/90 backdrop-blur-sm border border-border hover:border-neon/50"
        >
          <Layers className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border z-10">
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-coral" />
            <span className="text-muted-foreground">Hub (Start/End)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-quantum" />
            <span className="text-muted-foreground">Waypoints</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-neon" />
            <span className="text-muted-foreground">
              {config.useRealRoads ? "Real Road" : "Haversine"}
            </span>
          </div>
        </div>
      </div>

      {/* Status badge */}
      {results && results.success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 bg-neon/20 border border-neon/40 rounded-lg px-3 py-1.5 z-10"
        >
          <span className="text-xs font-medium text-neon">Route Optimized</span>
        </motion.div>
      )}
    </div>
  )
}
