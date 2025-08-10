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
} from 'recharts'
import type { ChartConfig } from "@/components/ui/chart"
import { Users, Package, AlertTriangle, Terminal } from "lucide-react"

const kpiData = [
    { title: "Active Devices", value: "1,250", icon: Package, change: "+50 since last week", color: "text-sky-500", bgColor: "bg-sky-500/10" },
    { title: "Total Users", value: "2,350", icon: Users, change: "+180 from last month", color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    { title: "Commands Executed", value: "5,420", icon: Terminal, change: "Last 24h", color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { title: "Warranty Triggers", value: "15", icon: AlertTriangle, change: "This month", color: "text-red-500", bgColor: "bg-red-500/10" },
  ];

const commandVolumeData = [
    { day: 'Mon', commands: 220 },
    { day: 'Tue', commands: 180 },
    { day: 'Wed', commands: 300 },
    { day: 'Thu', commands: 250 },
    { day: 'Fri', commands: 400 },
    { day: 'Sat', commands: 350 },
    { day: 'Sun', commands: 450 },
];
const commandVolumeChartConfig = {
  commands: {
    label: "Commands",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

const deviceStatusData = [
  { status: 'Active', count: 1250, fill: 'hsl(var(--chart-1))' },
  { status: 'Locked', count: 75, fill: 'hsl(var(--chart-2))' },
  { status: 'Disabled', count: 30, fill: 'hsl(var(--chart-3))' },
];
const deviceStatusChartConfig = {
    count: { label: 'Count' },
    Active: { label: 'Active', color: 'hsl(var(--chart-1))' },
    Locked: { label: 'Locked', color: 'hsl(var(--chart-2))' },
    Disabled: { label: 'Disabled', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig


export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <div className={`p-1.5 rounded-md ${kpi.bgColor}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-md">
          <CardHeader>
            <CardTitle className="font-headline">Daily Command Volume</CardTitle>
            <CardDescription>Commands executed over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={commandVolumeChartConfig} className="min-h-[300px] w-full">
              <BarChart accessibilityLayer data={commandVolumeData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="commands" fill="var(--color-commands)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 shadow-md">
          <CardHeader>
            <CardTitle className="font-headline">Device Status</CardTitle>
             <CardDescription>Current distribution of device statuses.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={deviceStatusChartConfig} className="min-h-[300px] max-h-[300px] w-full">
              <PieChart accessibilityLayer>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                <Pie
                  data={deviceStatusData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  labelLine={false}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                  }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="white"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        className="text-xs font-semibold"
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
