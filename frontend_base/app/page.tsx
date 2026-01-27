"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard/header"
import { ConfigPanel } from "@/components/dashboard/config-panel"
import { RouteMap } from "@/components/dashboard/route-map"
import { ResultsPanel } from "@/components/dashboard/results-panel"
import { DistanceMatrix } from "@/components/dashboard/distance-matrix"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { RouteProvider } from "@/lib/route-context"
import { I18nProvider } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n"
import { Grid3X3, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

function DashboardContent() {
  const [mobileTab, setMobileTab] = useState("map")
  const [showMatrix, setShowMatrix] = useState(false)
  const { t } = useTranslation()

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      {/* Header */}
      <DashboardHeader />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Layout - 3 columns */}
        <aside className="hidden lg:flex w-80 flex-shrink-0 border-r border-border bg-card/50 flex-col overflow-hidden">
          <ConfigPanel />
        </aside>

        {/* Center - Map + Optional Matrix */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Map */}
          <motion.div
            className={cn(
              "flex-1 p-4 transition-all",
              showMatrix ? "pb-2" : ""
            )}
            layout
          >
            <RouteMap />
          </motion.div>

          {/* Distance Matrix Toggle (Desktop) */}
          <div className="hidden lg:block">
            <Button
              variant="ghost"
              size="sm"
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-card/90 backdrop-blur-sm border border-border hover:border-neon/50"
              onClick={() => setShowMatrix(!showMatrix)}
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              {t("matrix.button")}
              {showMatrix ? (
                <ChevronDown className="w-4 h-4 ml-2" />
              ) : (
                <ChevronUp className="w-4 h-4 ml-2" />
              )}
            </Button>

            <AnimatePresence>
              {showMatrix && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border bg-card/50 overflow-hidden"
                >
                  <DistanceMatrix />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Right Sidebar - Results */}
        <aside className="hidden lg:flex w-80 flex-shrink-0 border-l border-border bg-card/50 flex-col overflow-hidden">
          <ResultsPanel />
        </aside>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden flex-1 flex flex-col overflow-hidden pb-16">
        <AnimatePresence mode="wait">
          {mobileTab === "config" && (
            <motion.div
              key="config"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto bg-card/50"
            >
              <ConfigPanel />
            </motion.div>
          )}

          {mobileTab === "map" && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 p-4"
            >
              <RouteMap />
            </motion.div>
          )}

          {mobileTab === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 overflow-y-auto bg-card/50"
            >
              <ResultsPanel />
            </motion.div>
          )}

          {mobileTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex-1 overflow-y-auto bg-card/50 p-4"
            >
              <DistanceMatrix />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Navigation */}
      <MobileNav activeTab={mobileTab} onTabChange={setMobileTab} />
    </div>
  )
}

export default function QuantumLogisticsDashboard() {
  return (
    <I18nProvider>
      <RouteProvider>
        <DashboardContent />
      </RouteProvider>
    </I18nProvider>
  )
}
