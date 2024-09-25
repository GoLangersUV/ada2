/*
 * File: github.com/Krud3/ada2/programacionDinamicaVoraz/frontend/src/components/RadarChart.tsx
 * Authors: Julián Ernesto Puyo Mora...2226905
 *          Cristian David Pacheco.....2227437
 *          Juan Sebastián Molina......2224491
 *          Juan Camilo Narváez Tascón.2140112
 * Creation date: 09/10/2024
 * Last modification: 09/24/2024
 * License: GNU-GPL
 */
import { useMemo } from 'react'
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartData {
  category: string;
  ModexPD?: number;
  ModexV?: number;
  ModexFB?: number;
}

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface CustomRadarChartProps {
  chartData: ChartData[];
  chartConfig: ChartConfig;
}

export default function CustomRadarChart({ chartData, chartConfig }: CustomRadarChartProps) {
  const { sanitizedChartData, maxValue, minValue } = useMemo(() => {
    let max = 0
    let min = Infinity
    const sanitizedData = chartData.map(item => {
      const sanitizedItem: ChartData = { category: item.category }

      if (typeof item.ModexPD === 'number' && item.ModexPD > 0) {
        sanitizedItem.ModexPD = item.ModexPD
        if (item.ModexPD > max) max = item.ModexPD
        if (item.ModexPD < min) min = item.ModexPD
      } else {
        sanitizedItem.ModexPD = 0.00001
        if (0.00001 > max) max = 0.00001
        if (0.00001 < min) min = 0.00001
      }

      if (typeof item.ModexV === 'number' && item.ModexV > 0) {
        sanitizedItem.ModexV = item.ModexV
        if (item.ModexV > max) max = item.ModexV
        if (item.ModexV < min) min = item.ModexV
      } else {
        sanitizedItem.ModexV = 0.00001
        if (0.00001 > max) max = 0.00001
        if (0.00001 < min) min = 0.00001
      }

      if (item.ModexFB !== undefined) {
        if (typeof item.ModexFB === 'number' && item.ModexFB > 0) {
          sanitizedItem.ModexFB = item.ModexFB
          if (item.ModexFB > max) max = item.ModexFB
          if (item.ModexFB < min) min = item.ModexFB
        } else {
          sanitizedItem.ModexFB = 0.00001
          if (0.00001 > max) max = 0.00001
          if (0.00001 < min) min = 0.00001
        }
      }

      return sanitizedItem
    })

    return {
      sanitizedChartData: sanitizedData,
      maxValue: max,
      minValue: min === Infinity ? 0.00001 : min,
    }
  }, [chartData])

  const adjustedMax = useMemo(() => (maxValue > 0 ? maxValue * 1.1 : 1), [maxValue])
  const adjustedMin = useMemo(() => (minValue > 0 ? Math.max(minValue * 0.9, 0.00001) : 0.00001), [minValue])

  return (
    <div className="max-w-sm font-sans -mb-20">
      <ChartContainer
        config={chartConfig}
        className="mx-auto w-full"
        style={{ height: "350px" }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={sanitizedChartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <PolarRadiusAxis
              scale="log"
              axisLine={false}
              domain={[adjustedMin, adjustedMax > 0 ? adjustedMax : 1]}
              tick={false}
            />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <PolarGrid radialLines={false} stroke="#CECECE" opacity={0.2}/>
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
