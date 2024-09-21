import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

export const description = "A multiple bar chart"

const chartData = [
  { property: "Extremismo", original: 186, modexfb: 80 },
  { property: "Esfuerzo empleado", original: 305, modexfb: 200 },
]

const chartConfig = {
  original: {
    label: "Original",
    color: "#00A29C",
  },
  modexfb: {
    label: "ModexFB",
    color: "#5DC9E2",
  },
} satisfies ChartConfig

export default function CustomBarChart() {
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
              <Bar dataKey="modexfb" fill="var(--color-modexfb)" radius={4} />
            </BarChart>
          </ChartContainer>
    </div>
  )
}
