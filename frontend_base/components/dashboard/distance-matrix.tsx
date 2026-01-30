"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useRoute } from "@/lib/route-context"
import { useTranslation } from "@/lib/i18n"
import { generateDistanceMatrix } from "@/lib/types"
import { cn } from "@/lib/utils"

export function DistanceMatrix() {
  const { selectedCities } = useRoute()
  const { t } = useTranslation()

  const matrix = useMemo(() => {
    if (selectedCities.length < 2) return null
    return generateDistanceMatrix(selectedCities)
  }, [selectedCities])

  if (!matrix || selectedCities.length < 2) {
    return (
      <div className="flex items-center justify-center h-full text-center p-4">
        <p className="text-xs text-muted-foreground">{t("matrix.emptyState")}</p>
      </div>
    )
  }

  const maxDistance = Math.max(...matrix.flat())
  const minDistance = Math.min(...matrix.flat().filter(d => d > 0))

  const getHeatColor = (distance: number) => {
    if (distance === 0) return "bg-secondary"
    const normalized = (distance - minDistance) / (maxDistance - minDistance)
    if (normalized < 0.25) return "bg-success/30 text-success"
    if (normalized < 0.5) return "bg-success/50 text-success"
    if (normalized < 0.75) return "bg-ibmec-gold/50 text-ibmec-gold"
    return "bg-ibmec-gold/70 text-ibmec-gold"
  }

  return (
    <div className="p-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {t("matrix.title")}
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="p-1 text-left text-muted-foreground font-normal"></th>
              {selectedCities.map((city) => (
                <th key={city.id} className="p-1 text-center text-muted-foreground font-normal whitespace-nowrap" title={city.name}>
                  {city.name.substring(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedCities.map((rowCity, i) => (
              <motion.tr key={rowCity.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <td className="p-1 text-muted-foreground whitespace-nowrap" title={rowCity.name}>{rowCity.name.substring(0, 3)}</td>
                {matrix[i].map((distance, j) => (
                  <td key={`${i}-${j}`} className={cn("p-1 text-center font-mono rounded transition-colors", getHeatColor(distance))}>
                    {distance === 0 ? "-" : Math.round(distance)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-center gap-3 mt-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-success/30" />
          <span className="text-[10px] text-muted-foreground">{t("matrix.near")}</span>
        </div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-success/50" /></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-ibmec-gold/50" /></div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-ibmec-gold/70" />
          <span className="text-[10px] text-muted-foreground">{t("matrix.far")}</span>
        </div>
      </div>
    </div>
  )
}
