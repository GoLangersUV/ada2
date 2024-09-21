import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

export const description = "A radar chart with lines only"

const chartData = [
  { category: "Tiempo", ModexFB: 186, Original: 160, ModexPD: 175, ModexV: 190 },
  { category: "Extremismo", ModexFB: 185, Original: 170, ModexPD: 180, ModexV: 195 },
  { category: "Esfuerzo", ModexFB: 207, Original: 180, ModexPD: 200, ModexV: 210 },
]

const chartConfig = {
  ModexFB: {
    label: "ModexFB",
    color: "#FF6B6B",
  },
  Original: {
    label: "Original",
    color: "#4ECDC4",
  },
  ModexPD: {
    label: "ModexPD",
    color: "#FFA500",
  },
  ModexV: {
    label: "ModexV",
    color: "#9B59B6",
  },
} satisfies ChartConfig

export default function CustomRadarChart() {
  return (
    <div className="max-w-sm font-sans -mb-10">
      <ChartContainer
        config={chartConfig}
        className="mx-auto w-full"
        style={{ height: "350px" }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: "#CECECE", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <PolarGrid stroke="#CECECE" opacity={0.2} />
            {Object.entries(chartConfig).map(([key, config]) => (
              <Radar
                key={key}
                dataKey={key}
                fill={config.color}
                fillOpacity={0.1}
                stroke={config.color}
                strokeWidth={2}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
