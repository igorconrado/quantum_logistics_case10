"use client"

import { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useRoute } from "@/lib/route-context"

export function PerformanceChart() {
  const { history } = useRoute()

  const chartData = useMemo(() => {
    return history
      .slice(0, 10)
      .reverse()
      .map((item, index) => ({
        name: `#${index + 1}`,
        points: item.points.length,
        time: item.result.timeMs,
        distance: item.result.totalDistance / 100, // Scale for visibility
        algorithm: item.config.algorithmType,
      }))
  }, [history])

  if (chartData.length < 2) {
    return (
      <div className="flex items-center justify-center h-full text-center p-4">
        <p className="text-xs text-muted-foreground">
          Run at least 2 calculations to see performance trends
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 h-full">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Performance Trends
      </h4>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              axisLine={{ stroke: "var(--border)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Legend
              wrapperStyle={{ fontSize: 10 }}
            />
            <Line
              type="monotone"
              dataKey="time"
              name="Time (ms)"
              stroke="var(--quantum)"
              strokeWidth={2}
              dot={{ fill: "var(--quantum)", strokeWidth: 0, r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="distance"
              name="Distance (x100 km)"
              stroke="var(--neon)"
              strokeWidth={2}
              dot={{ fill: "var(--neon)", strokeWidth: 0, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
