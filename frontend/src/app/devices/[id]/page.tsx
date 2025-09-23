"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type DeviceDetails = {
  id: string | number
  deviceName?: string | null
  macAddress?: string | null
  deviceType?: string | null
  userId?: string | null
  passcode?: string | null
  status?: string | null
  btName?: string | null
  warrantyStart?: string | null
  defaultCmd?: string | null
  firstConnectedAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export default function DeviceDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [device, setDevice] = React.useState<DeviceDetails | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const load = async () => {
      try {
        const token =
          typeof window !== 'undefined'
            ? (localStorage.getItem('auth_token') || localStorage.getItem('authToken') || localStorage.getItem('token'))
            : null
        if (!token) throw new Error('No auth token found')

        const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || `${window.location.origin}/api`
        const res = await fetch(`${baseURL}/devices/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        if (!res.ok) throw new Error(`Failed to fetch device: ${res.status}`)
        const data = await res.json()
        const d = Array.isArray(data?.data) ? data.data[0] : (data?.data ?? data)
        setDevice({
          id: d.id,
          deviceName: d.device_name ?? d.deviceName ?? null,
          macAddress: d.mac_address ?? d.macAddress ?? null,
          deviceType: d.device_type ?? d.deviceType ?? null,
          userId: d.user_id ?? d.userId ?? null,
          passcode: d.passcode ?? null,
          status: d.status ?? null,
          btName: d.bt_name ?? d.btName ?? null,
          warrantyStart: d.warranty_start ?? d.warrantyStart ?? null,
          defaultCmd: d.default_cmd ?? d.defaultCmd ?? null,
          firstConnectedAt: d.first_connected_at ?? d.firstConnectedAt ?? null,
          createdAt: d.created_at ?? d.createdAt ?? null,
          updatedAt: d.updated_at ?? d.updatedAt ?? null,
        })
      } catch (e: any) {
        setError(e?.message || 'Failed to load device')
      } finally {
        setLoading(false)
      }
    }
    if (params?.id) load()
  }, [params?.id])

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!device) return <div className="p-6">Not found</div>

  return (
    <div className="p-6 space-y-4">
      <Button variant="ghost" onClick={() => router.back()}>&larr; Back</Button>
      <Card>
        <CardHeader>
          <CardTitle>Device #{String(device.id)} — {device.deviceName || 'Unnamed'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="MAC Address" value={device.macAddress} />
            <Field label="Device Type" value={device.deviceType} />
            <Field label="User ID" value={device.userId ? '•••••••' : 'Unassigned'} />
            <Field label="Passcode" value={device.passcode ?? '-'} />
            <Field label="Status" value={device.status} />
            <Field label="BT Name" value={device.btName} />
            <Field label="Warranty Start" value={device.warrantyStart} />
            <Field label="Default Command" value={device.defaultCmd} />
            <Field label="First Connected" value={device.firstConnectedAt} />
            <Field label="Created At" value={device.createdAt} />
            <Field label="Updated At" value={device.updatedAt} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-medium">{value ?? '-'}</div>
    </div>
  )
}


