
'use client';

import { z } from 'zod';
import * as React from 'react';
import { commandColumns, eventColumns } from './columns';
import { DataTable } from './data-table';
import { CommandLog, DeviceEvent } from './schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import pool from '@/lib/db';

async function getCommandLogs(): Promise<CommandLog[]> {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`
        SELECT 
            cl.id, 
            d.device_name as device, 
            u.fullName as user, 
            cl.command, 
            cl.sent_at, 
            cl.result 
        FROM command_logs cl
        LEFT JOIN devices d ON cl.device_id = d.id
        LEFT JOIN users u ON cl.user_id = u.id
        ORDER BY cl.sent_at DESC
    `);
    connection.release();
    
    const logs = (rows as any[]).map(r => ({
        id: r.id.toString(),
        device: r.device,
        user: r.user,
        command: r.command,
        sentAt: new Date(r.sent_at).toISOString(),
        result: r.result,
    }));

    return z.array(commandLogSchema.partial()).parse(logs);
  } catch (e) {
    console.error("Failed to fetch command logs", e);
    return [];
  }
}

async function getDeviceEvents(): Promise<DeviceEvent[]> {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(`
        SELECT 
            de.id,
            d.device_name as device,
            de.event,
            de.timestamp
        FROM device_events de
        LEFT JOIN devices d ON de.device_id = d.id
        ORDER BY de.timestamp DESC
      `);
      connection.release();
      const events = (rows as any[]).map(r => ({
          id: r.id.toString(),
          device: r.device,
          event: r.event,
          timestamp: new Date(r.timestamp).toISOString(),
      }));
      return z.array(deviceEventSchema.partial()).parse(events);
    } catch(e) {
        console.error("Failed to fetch device events", e);
        return [];
    }
  }

export default function LogsPage() {
  const [commandLogs, setCommandLogs] = React.useState<CommandLog[]>([]);
  const [deviceEvents, setDeviceEvents] = React.useState<DeviceEvent[]>([]);

  React.useEffect(() => {
    getCommandLogs().then(setCommandLogs);
    getDeviceEvents().then(setDeviceEvents);
  }, []);

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline">Command & Event Logs</h1>
          <p className="text-muted-foreground">
            Review device commands and connection events.
          </p>
        </div>
      </div>
      <Tabs defaultValue="commands" className="w-full">
        <TabsList>
          <TabsTrigger value="commands">Command Logs</TabsTrigger>
          <TabsTrigger value="events">Device Events</TabsTrigger>
        </TabsList>
        <TabsContent value="commands">
            <Card>
                <CardHeader>
                    <CardTitle>Command Log</CardTitle>
                    <CardDescription>History of all commands sent to devices.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable 
                        columns={commandColumns} 
                        data={commandLogs} 
                        filterColumnId="device"
                        filterPlaceholder="Filter by device..."
                    />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="events">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
