/*
 * File: github.com/Krud3/ada2/programacionDinamicaVoraz/frontend/src/components/RadarChart.tsx
 * Authors: Julián Ernesto Puyo Mora...2226905
 *          Cristian David Pacheco.....2227437
 *          Juan Sebastián Molina......2224491
 *          Juan Camilo Narváez Tascón.2140112
 * Creation date: 09/10/2024
 * Last modification: 09/21/2024
 * License: GNU-GPL
 */
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts"

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