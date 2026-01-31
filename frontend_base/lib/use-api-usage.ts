"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "ors_api_usage"
const DAILY_LIMIT = 2000

interface ApiUsage {
  date: string
  count: number
}

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0]
}

function loadUsage(): ApiUsage {
  if (typeof window === "undefined") {
    return { date: getTodayKey(), count: 0 }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const usage: ApiUsage = JSON.parse(stored)
      // Reset if it's a new day
      if (usage.date !== getTodayKey()) {
        return { date: getTodayKey(), count: 0 }
      }
      return usage
    }
  } catch {
    // Ignore parse errors
  }
  return { date: getTodayKey(), count: 0 }
}

function saveUsage(usage: ApiUsage): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage))
}

export function useApiUsage() {
  const [usage, setUsage] = useState<ApiUsage>({ date: getTodayKey(), count: 0 })

  useEffect(() => {
    setUsage(loadUsage())
  }, [])

  const incrementUsage = useCallback((amount = 1) => {
    setUsage((prev) => {
      const newUsage = {
        date: getTodayKey(),
        count: prev.date === getTodayKey() ? prev.count + amount : amount,
      }
      saveUsage(newUsage)
      return newUsage
    })
  }, [])

  const remaining = Math.max(0, DAILY_LIMIT - usage.count)
  const percentUsed = Math.min(100, (usage.count / DAILY_LIMIT) * 100)
  const isLow = remaining < 200
  const isExhausted = remaining === 0

  return {
    used: usage.count,
    limit: DAILY_LIMIT,
    remaining,
    percentUsed,
    isLow,
    isExhausted,
    incrementUsage,
  }
}
