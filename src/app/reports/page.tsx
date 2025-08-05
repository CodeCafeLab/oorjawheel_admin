"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import type { ChartConfig } from "@/components/ui/chart"

const customerDemographicsData = [
  { region: 'North India', customers: 45, fill: "var(--color-north)" },
  { region: 'South India', customers: 78, fill: "var(--color-south)" },
  { region: 'East India', customers: 32, fill: "var(--color-east)" },
  { region: 'West India', customers: 56, fill: "var(--color-west)" },
]
const demographicsChartConfig = {
  customers: { label: "Customers" },
  north: { label: "North India", color: "hsl(var(--chart-1))" },
  south: { label: "South India", color: "hsl(var(--chart-2))" },
  east: { label: "East India", color: "hsl(var(--chart-3))" },
  west: { label: "West India", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig

const productPerformanceData = [
  { product: 'Smart Wheel', sales: 1200 },
  { product: 'Battery Pack', sales: 950 },
  { product: 'Solar Charger', sales: 430 },
  { product: 'Mounting Kit', sales: 1500 },
  { product: 'Subscription', sales: 2500 },
]
const productChartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Detailed insights into your business performance.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
          <CardHeader>
            <CardTitle className="font-headline">Customer Demographics</CardTitle>
            <CardDescription>Distribution of customers by region.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={demographicsChartConfig}
              className="mx-auto aspect-square max-h-[300px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie data={customerDemographicsData} dataKey="customers" nameKey="region" innerRadius={60} />
                <ChartLegend
                  content={<ChartLegendContent nameKey="region" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Top Product Performance</CardTitle>
            <CardDescription>Sales count for top-performing products.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={productChartConfig} className="min-h-[300px] w-full">
                <BarChart
                    layout="vertical"
                    data={productPerformanceData}
                    margin={{ left: 20 }}
                >
                    <CartesianGrid horizontal={false} />
                    <YAxis dataKey="product" type="category" tickLine={false} axisLine={false} />
                    <XAxis type="number" hide />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Bar dataKey="sales" fill="var(--color-sales)" radius={5} />
                </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
