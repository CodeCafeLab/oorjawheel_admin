
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
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts'
import type { ChartConfig } from "@/components/ui/chart"
import { Activity, Users, Terminal, ShieldCheck } from "lucide-react"

const deviceActivationConfig = {
  count: { label: "Activations", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig

const warrantyTriggersConfig = {
  triggers: { label: "Warranty Triggers", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig

const weeklyActiveUsersConfig = {
    users: { label: "Active Users", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig

const commandVolumeConfig = {
  commands: { label: "Events", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig

export default function AnalyticsPage() {
  const [loading, setLoading] = React.useState(true)
  const [kpis, setKpis] = React.useState({ activeDevices: 0, totalUsers: 0, commands24h: 0, warrantyThisMonth: 0 })
  const [commandVolumeData, setCommandVolumeData] = React.useState<any[]>([])
  const [deviceActivationData, setDeviceActivationData] = React.useState<any[]>([])
  const [warrantyTriggersData, setWarrantyTriggersData] = React.useState<any[]>([])
  const [weeklyActiveUsersData, setWeeklyActiveUsersData] = React.useState<any[]>([])
  const [deviceStatusData, setDeviceStatusData] = React.useState<any[]>([])

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch((process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api') + '/analytics', { credentials: 'include' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed')
        setKpis(data.kpis)
        setCommandVolumeData(data.charts.commandVolume)
        setDeviceActivationData(data.charts.deviceActivations)
        setWarrantyTriggersData(data.charts.warrantyTriggers)
        setWeeklyActiveUsersData(data.charts.weeklyActiveUsers)
        setDeviceStatusData(data.charts.deviceStatus)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const kpiCards = [
    { title: 'Active Devices', value: kpis.activeDevices.toLocaleString(), icon: Activity, color: "text-sky-500", bgColor: "bg-sky-500/10" },
    { title: 'Total Users', value: kpis.totalUsers.toLocaleString(), icon: Users, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    { title: 'Events (24h)', value: kpis.commands24h.toLocaleString(), icon: Terminal, color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { title: 'Warranty Triggers', value: kpis.warrantyThisMonth.toLocaleString(), icon: ShieldCheck, color: "text-red-500", bgColor: "bg-red-500/10" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline">Analytics</h1>
        <p className="text-muted-foreground">System metrics from live database.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="shadow-sm hover:shadow-lg transition-shadow duration-300">
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Daily Events (7d)</CardTitle>
            <CardDescription>Total events recorded per day.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={commandVolumeConfig} className="min-h-[300px] w-full">
              <BarChart data={commandVolumeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <ChartLegend />
                <Bar dataKey="commands" fill="var(--color-commands)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Device Activation Rate</CardTitle>
            <CardDescription>Daily new device activations (first connected).</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={deviceActivationConfig} className="min-h-[300px] w-full">
              <LineChart data={deviceActivationData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend />
                <Line type="monotone" dataKey="count" stroke="var(--color-count)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Warranty Triggers</CardTitle>
            <CardDescription>Devices with warranty_start this year (by month).</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={warrantyTriggersConfig} className="min-h-[300px] w-full">
                <BarChart data={warrantyTriggersData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend />
                    <Bar dataKey="triggers" fill="var(--color-triggers)" radius={4} />
                </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Weekly Active Users</CardTitle>
            <CardDescription>Unique users with sessions in the last 4 weeks.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={weeklyActiveUsersConfig} className="min-h-[300px] w-full">
              <LineChart data={weeklyActiveUsersData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend />
                <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
