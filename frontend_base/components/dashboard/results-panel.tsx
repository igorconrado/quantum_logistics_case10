"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Route,
  Clock,
  Fuel,
  Zap,
  TrendingDown,
  Download,
  Printer,
  ChevronRight,
  BarChart3,
  History,
  Trash2,
  ArrowRight,
  Cpu,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRoute } from "@/lib/route-context"
import { cn } from "@/lib/utils"
import { ALGORITHM_LABELS } from "@/lib/types"

export function ResultsPanel() {
  const { results, comparison, history, clearHistory, config } = useRoute()
  const [activeTab, setActiveTab] = useState("results")

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <div className="px-4 pt-4">
          <TabsList className="w-full bg-secondary/50">
            <TabsTrigger value="results" className="flex-1 text-xs">
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
              Results
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 text-xs">
              <History className="w-3.5 h-3.5 mr-1.5" />
              History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="results" className="flex-1 overflow-y-auto m-0 p-4 pt-2">
          <AnimatePresence mode="wait">
            {results ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Main metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard
                    icon={Route}
                    label="Total Distance"
                    value={`${results.totalDistance.toLocaleString()}`}
                    unit="km"
                    color="neon"
                  />
                  <MetricCard
                    icon={Fuel}
                    label="Fuel Cost"
                    value={`R$ ${results.fuelCost?.toLocaleString()}`}
                    color="coral"
                  />
                  <MetricCard
                    icon={Clock}
                    label="Calc Time"
                    value={results.timeMs < 1 ? results.timeMs.toFixed(3) : results.timeMs.toFixed(2)}
                    unit="ms"
                    color="quantum"
                  />
                  {results.totalDurationMin && (
                    <MetricCard
                      icon={Activity}
                      label="Drive Time"
                      value={`${Math.floor(results.totalDurationMin / 60)}h ${results.totalDurationMin % 60}m`}
                      color="muted"
                    />
                  )}
                </div>

                {/* Algorithm info */}
                <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        config.algorithmType === "quantum" ? "bg-quantum/20" : "bg-neon/20"
                      )}>
                        {config.algorithmType === "quantum" ? (
                          <Zap className="w-4 h-4 text-quantum" />
                        ) : (
                          <Cpu className="w-4 h-4 text-neon" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Method</p>
                        <p className="text-sm font-medium text-foreground">
                          {ALGORITHM_LABELS[results.method] || results.method}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Roads</p>
                      <p className="text-sm font-medium text-foreground">
                        {results.usedRealRoads ? "Real" : "Haversine"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comparison results */}
                {comparison.classical && comparison.quantum && (
                  <ComparisonCard comparison={comparison} />
                )}

                {/* Route sequence */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Optimized Sequence
                  </h4>
                  <div className="space-y-1">
                    {results.sequence?.map((city, index) => (
                      <motion.div
                        key={`${city.id}-${index}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30"
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                          index === 0 || index === results.sequence!.length - 1
                            ? "bg-coral text-primary-foreground"
                            : "bg-quantum/50 text-quantum-light"
                        )}>
                          {index + 1}
                        </div>
                        <span className="text-sm text-foreground flex-1">{city.name}</span>
                        {index < results.sequence!.length - 1 && (
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Export buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs bg-transparent"
                    onClick={() => exportCSV(results)}
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs bg-transparent"
                    onClick={() => window.print()}
                  >
                    <Printer className="w-3.5 h-3.5 mr-1.5" />
                    Print
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-center py-12"
              >
                <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1">
                  No Results Yet
                </h3>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                  Configure your route and click Calculate to see optimization results
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="history" className="flex-1 overflow-y-auto m-0 p-4 pt-2">
          {history.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {history.length} calculation{history.length !== 1 ? "s" : ""}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-error"
                  onClick={clearHistory}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Clear
                </Button>
              </div>
              {history.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 rounded-lg bg-secondary/50 border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded",
                      item.config.algorithmType === "quantum"
                        ? "bg-quantum/20 text-quantum"
                        : "bg-neon/20 text-neon"
                    )}>
                      {item.config.algorithmType}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Distance</p>
                      <p className="font-mono font-medium text-foreground">
                        {item.result.totalDistance.toLocaleString()} km
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="font-mono font-medium text-foreground">
                        {item.result.timeMs.toFixed(2)} ms
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Points</p>
                      <p className="font-mono font-medium text-foreground">
                        {item.points.length}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
                <History className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                No History
              </h3>
              <p className="text-xs text-muted-foreground max-w-[200px]">
                Your calculation history will appear here
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: any
  label: string
  value: string
  unit?: string
  color: "neon" | "coral" | "quantum" | "muted"
}) {
  const colorClasses = {
    neon: "bg-neon/10 text-neon border-neon/30",
    coral: "bg-coral/10 text-coral border-coral/30",
    quantum: "bg-quantum/10 text-quantum border-quantum/30",
    muted: "bg-secondary text-muted-foreground border-border",
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "p-3 rounded-lg border",
        colorClasses[color]
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs opacity-80">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold font-mono">{value}</span>
        {unit && <span className="text-xs opacity-60">{unit}</span>}
      </div>
    </motion.div>
  )
}

function ComparisonCard({ comparison }: { comparison: any }) {
  const speedup = comparison.speedup?.toFixed(1) || "N/A"
  const distDiff = comparison.distanceDiff || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-gradient-to-br from-quantum/10 to-neon/10 border border-quantum/30"
    >
      <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-quantum" />
        Algorithm Comparison
      </h4>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Classical</p>
          <p className="text-lg font-bold font-mono text-neon">
            {comparison.classical?.timeMs.toFixed(2)}
            <span className="text-xs ml-1">ms</span>
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Quantum</p>
          <p className="text-lg font-bold font-mono text-quantum">
            {comparison.quantum?.timeMs.toFixed(3)}
            <span className="text-xs ml-1">ms</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-background/50">
        <TrendingDown className="w-4 h-4 text-neon" />
        <span className="text-sm font-medium text-foreground">
          Quantum is <span className="text-neon font-bold">{speedup}x</span> faster
        </span>
      </div>

      {distDiff !== 0 && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Distance diff: {distDiff > 0 ? "+" : ""}{distDiff.toFixed(0)} km
        </p>
      )}
    </motion.div>
  )
}

function exportCSV(results: any) {
  const rows = [
    ["Metric", "Value"],
    ["Total Distance (km)", results.totalDistance],
    ["Fuel Cost (R$)", results.fuelCost],
    ["Calculation Time (ms)", results.timeMs.toFixed(3)],
    ["Method", results.method],
    ["Used Real Roads", results.usedRealRoads ? "Yes" : "No"],
  ]

  if (results.sequence) {
    rows.push(["", ""])
    rows.push(["Route Sequence", ""])
    results.sequence.forEach((city: any, i: number) => {
      rows.push([`Stop ${i + 1}`, city.name])
    })
  }

  const csvContent = rows.map(row => row.join(",")).join("\n")
  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `quantum-route-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
