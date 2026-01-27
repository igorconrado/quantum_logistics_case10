"use client"

import { motion } from "framer-motion"
import { Cpu, Activity, Wifi, WifiOff, Settings, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useRoute } from "@/lib/route-context"
import { useTranslation } from "@/lib/i18n"

export function DashboardHeader() {
  const { apiStatus, isCalculating } = useRoute()
  const { locale, setLocale, t } = useTranslation()

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral to-coral-light flex items-center justify-center">
              <Cpu className="w-5 h-5 text-primary-foreground" />
            </div>
            {isCalculating && (
              <motion.div
                className="absolute -inset-1 rounded-xl bg-coral/30"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">
              {t("header.title")}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t("header.subtitle")}
            </p>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="h-8 w-px bg-border" />

        {/* Status indicators */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border">
                  {apiStatus.online ? (
                    <Wifi className="w-3.5 h-3.5 text-neon" />
                  ) : (
                    <WifiOff className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                  <span className="text-xs font-medium text-muted-foreground">
                    {apiStatus.online ? t("header.apiOnline") : t("header.offlineMode")}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("header.apiStatus")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isCalculating && (
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-quantum/10 border border-quantum/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Activity className="w-3.5 h-3.5 text-quantum animate-pulse" />
              <span className="text-xs font-medium text-quantum">
                {t("header.processing")}
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Right side actions */}
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Language Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-medium gap-1.5 px-2.5 h-9"
                onClick={() => setLocale(locale === "pt-BR" ? "en-US" : "pt-BR")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={locale === "pt-BR"
                    ? "https://flagcdn.com/w40/br.png"
                    : "https://flagcdn.com/w40/us.png"}
                  alt={locale === "pt-BR" ? "Brasil" : "USA"}
                  width={24}
                  height={16}
                  className="rounded-sm object-cover"
                />
                <span className="text-muted-foreground">{locale === "pt-BR" ? "PT" : "EN"}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{locale === "pt-BR" ? "Switch to English" : "Mudar para Português"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <HelpCircle className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("header.help")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Settings className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("header.settings")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="h-6 w-px bg-border mx-1" />

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-coral/10 to-neon/10 border border-coral/20">
          <span className="text-xs text-muted-foreground">Case 10</span>
          <span className="text-xs font-semibold text-foreground">KPMG/TDC</span>
        </div>
      </motion.div>
    </header>
  )
}
