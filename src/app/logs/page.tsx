
'use client';

import { z } from 'zod';
import * as React from 'react';
import { eventColumns } from './columns';
import { DataTable } from './data-table';
import { DeviceEvent, deviceEventSchema } from './schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

async function getDeviceEvents(): Promise<DeviceEvent[]> {
  try {
    const res = await fetch('/api/device-events');
    const data = await res.json();
    const events = (data.data || []).map((r: any) => ({
      id: String(r.id),
      device: r.device,
      event: r.event,
      timestamp: new Date(r.timestamp).toISOString(),
    }));
    return z.array(deviceEventSchema.partial()).parse(events);
  } catch (e) {
    console.error('Failed to fetch device events', e);
    return [];
  }
}

export default function LogsPage() {
  const [deviceEvents, setDeviceEvents] = React.useState<DeviceEvent[]>([]);

  React.useEffect(() => {
    getDeviceEvents().then(setDeviceEvents);
  }, []);

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline">Command & Event Logs</h1>
          <p className="text-muted-foreground">
            Review device connection and scanning events.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Device Events</CardTitle>
            <CardDescription>Connection and scanning event history.</CardDescription>
        </CardHeader>
        <CardContent>
            <DataTable 
                columns={eventColumns} 
                data={deviceEvents}
                filterColumnId="device"
                filterPlaceholder="Filter by device..."
            />
        </CardContent>
      </Card>
    </div>
  );
}
