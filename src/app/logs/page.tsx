import { z } from 'zod';
import { commandColumns, eventColumns } from './columns';
import { DataTable } from './data-table';
import { commandLogSchema, deviceEventSchema } from './schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data fetching
async function getCommandLogs() {
  const data = [
    { id: 'CMD001', device: 'OorjaWheel-A1B2', user: 'super.admin@oorja.com', command: 'S20', sentAt: '2024-07-21T10:00:00Z', result: 'OK' },
    { id: 'CMD002', device: 'OorjaWheel-F3G4', user: 'operator1@oorja.com', command: 'B80', sentAt: '2024-07-21T10:01:00Z', result: 'OK' },
    { id: 'CMD003', device: 'OorjaWheel-K7L8', user: 'operator2@oorja.com', command: 'L255,0,0', sentAt: '2024-07-21T10:02:00Z', result: 'ERR:501' },
    { id: 'CMD004', device: 'OorjaWheel-A1B2', user: 'super.admin@oorja.com', command: 'S10', sentAt: '2024-07-21T10:05:00Z', result: 'OK' },
  ];
  return z.array(commandLogSchema).parse(data);
}

async function getDeviceEvents() {
    const data = [
      { id: 'EVT001', device: 'OorjaWheel-A1B2', event: 'connect', timestamp: '2024-07-21T09:59:00Z' },
      { id: 'EVT002', device: 'OorjaWheel-F3G4', event: 'connect', timestamp: '2024-07-21T10:00:30Z' },
      { id: 'EVT003', device: 'OorjaWheel-A1B2', event: 'disconnect', timestamp: '2024-07-21T10:10:00Z' },
      { id: 'EVT004', device: 'OorjaWheel-Z9Y8', event: 'scan_fail', timestamp: '2024-07-21T10:11:00Z' },
    ];
    return z.array(deviceEventSchema).parse(data);
  }

export default async function LogsPage() {
  const commandLogs = await getCommandLogs();
  const deviceEvents = await getDeviceEvents();

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
