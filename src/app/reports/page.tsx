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
  LineChart,
  Line,
} from 'recharts'
import type { ChartConfig } from "@/components/ui/chart"

const commandVolumeData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
]
const commandVolumeConfig = {
  desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
  mobile: { label: "Mobile", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig

const deviceActivationData = [
    { date: '2024-01-01', count: 20 },
    { date: '2024-01-02', count: 25 },
    { date: '2024-01-03', count: 18 },
    { date: '2024-01-04', count: 30 },
    { date: '2024-01-05', count: 28 },
    { date: '2024-01-06', count: 35 },
];
const deviceActivationConfig = {
  count: { label: "Activations", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig

const warrantyTriggersData = [
  { month: 'January', triggers: 5 },
  { month: 'February', triggers: 8 },
  { month: 'March', triggers: 3 },
  { month: 'April', triggers: 12 },
  { month: 'May', triggers: 7 },
];
const warrantyTriggersConfig = {
  triggers: { label: "Warranty Triggers", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig

const weeklyActiveUsersData = [
    { week: 'Week 1', users: 500 },
    { week: 'Week 2', users: 550 },
    { week: 'Week 3', users: 520 },
    { week: 'Week 4', users: 600 },
];
const weeklyActiveUsersConfig = {
    users: { label: "Active Users", color: "hsl(var(--chart-3))" },
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
            <CardTitle className="font-headline">Command Volume Over Time</CardTitle>
            <CardDescription>Monthly command volume from different clients.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={commandVolumeConfig} className="min-h-[300px] w-full">
              <BarChart data={commandVolumeData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend />
                <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Device Activation Rate</CardTitle>
            <CardDescription>Daily new device activations.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={deviceActivationConfig} className="min-h-[300px] w-full">
              <LineChart data={deviceActivationData}>
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
            <CardTitle className="font-headline">First-Use Warranty Triggers</CardTitle>
            <CardDescription>Monthly count of warranty triggers on first device use.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={warrantyTriggersConfig} className="min-h-[300px] w-full">
                <BarChart data={warrantyTriggersData}>
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
            <CardDescription>Number of unique active users per week.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={weeklyActiveUsersConfig} className="min-h-[300px] w-full">
              <LineChart data={weeklyActiveUsersData}>
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
