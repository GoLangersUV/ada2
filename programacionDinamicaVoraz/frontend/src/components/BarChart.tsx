/*
 * File: github.com/Krud3/ada2/programacionDinamicaVoraz/frontend/src/components/BarChart.tsx
 * Authors: Julián Ernesto Puyo Mora...2226905
 *          Cristian David Pacheco.....2227437
 *          Juan Sebastián Molina......2224491
 *          Juan Camilo Narváez Tascón.2140112
 * Creation date: 09/10/2024
 * Last modification: 09/21/2024
 * License: GNU-GPL
 */
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface ChartData {
  property: string;
  original: number;
  modex: number;
}

interface CustomBarChartProps {
  chartData: ChartData[];
  chartConfig: ChartConfig;
}

export default function CustomBarChart({ chartData, chartConfig }: CustomBarChartProps) {
  return (
    <div className="max-w-sm font-sans -mb-10">
      <ChartContainer config={chartConfig}>
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} stroke="#555555" />
          <XAxis
            dataKey="property"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tick={{ fill: '#CECECE' }}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dashed" />}
          />
          <Bar dataKey="original" fill="var(--color-original)" radius={4} />
          <Bar dataKey="modex" fill="var(--color-modex)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
