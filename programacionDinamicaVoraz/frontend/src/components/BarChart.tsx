import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export default function CustomBarChart( { chartData, chartConfig } ) {
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
