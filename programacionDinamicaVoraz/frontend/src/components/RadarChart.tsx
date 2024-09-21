import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A radar chart with lines only"

export default function CustomRadarChart( {chartData, chartConfig } ) {
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
              tick={{ fontSize: 12 }}
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
