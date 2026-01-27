"use client"

import { motion } from "framer-motion"
import { Map, Settings2, BarChart3, History } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: "config", label: "Config", icon: Settings2 },
  { id: "map", label: "Map", icon: Map },
  { id: "results", label: "Results", icon: BarChart3 },
  { id: "history", label: "History", icon: History },
]

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-card/95 backdrop-blur-lg border-t border-border px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-0 bg-gradient-to-br from-coral/20 to-neon/10 rounded-xl border border-coral/30"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={cn(
                  "relative z-10 w-5 h-5 transition-colors",
                  isActive && "text-coral"
                )} />
                <span className={cn(
                  "relative z-10 text-[10px] font-medium",
                  isActive && "text-coral"
                )}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
