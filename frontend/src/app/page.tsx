"use client"

import * as React from 'react'
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

const commandVolumeChartConfig = {
  commands: { label: "Events", color: "hsl(var(--primary))" },
} satisfies ChartConfig

const deviceStatusChartConfig = {
  count: { label: 'Count' },
  Active: { label: 'Active', color: 'hsl(var(--chart-1))' },
  Locked: { label: 'Locked', color: 'hsl(var(--chart-2))' },
  Disabled: { label: 'Disabled', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig

export default function DashboardPage() {
  const [loading, setLoading] = React.useState(true)
  const [activeDevices, setActiveDevices] = React.useState(0)
  const [totalUsers, setTotalUsers] = React.useState(0)

  // hardcoded demo datasets
  const commandVolumeData = [
    { day: 'Mon', commands: 220 },
    { day: 'Tue', commands: 180 },
    { day: 'Wed', commands: 300 },
    { day: 'Thu', commands: 250 },
    { day: 'Fri', commands: 400 },
    { day: 'Sat', commands: 350 },
    { day: 'Sun', commands: 450 },
  ]
  const deviceStatusData = [
    { status: 'Active', count: 1250, fill: 'hsl(var(--chart-1))' },
    { status: 'Locked', count: 75, fill: 'hsl(var(--chart-2))' },
    { status: 'Disabled', count: 30, fill: 'hsl(var(--chart-3))' },
  ]

  React.useEffect(() => {
    const load = async () => {
      try {
        const { fetchData } = await import('@/lib/api-utils');
        const data = await fetchData('/analytics');
        if (data?.kpis) {
          setActiveDevices(Number(data.kpis.activeDevices || 0))
          setTotalUsers(Number(data.kpis.totalUsers || 0))
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
        // keep zeros on error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const kpiCards = [
    { title: "Active Devices", value: activeDevices.toLocaleString(), icon: Package, color: "text-sky-500", bgColor: "bg-sky-500/10" },
    { title: "Total Users", value: totalUsers.toLocaleString(), icon: Users, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    { title: "Events (24h)", value: '5,420', icon: Terminal, color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { title: "Warranty (This Month)", value: '15', icon: AlertTriangle, color: "text-red-500", bgColor: "bg-red-500/10" },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <div className={`p-1.5 rounded-md ${kpi.bgColor}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '—' : kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-md">
          <CardHeader>
            <CardTitle className="font-headline">Daily Events</CardTitle>
            <CardDescription>Events recorded over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={commandVolumeChartConfig} className="min-h-[300px] w-full">
              <BarChart accessibilityLayer data={commandVolumeData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
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
          <CardContent className="flex justify-center items-center">
            <ChartContainer config={deviceStatusChartConfig} className="min-h-[300px] max-h-[300px] w-full aspect-square">
              <PieChart accessibilityLayer>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
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
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180))
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180))
                    return (
                      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-semibold">
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    )
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
