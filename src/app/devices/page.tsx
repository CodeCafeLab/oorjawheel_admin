import { z } from 'zod';
import { columns } from './columns';
import { DataTable } from './data-table';
import { deviceSchema } from './schema';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Mock data fetching
async function getDevices() {
  // In a real app, you'd fetch this from your database.
  const data = [
    { id: "DEV001", btName: "OorjaWheel-A1B2", macAddress: "00:1A:2B:3C:4D:5E", warrantyStart: "2024-01-15", defaultCommand: "S20", firstConnected: "2024-01-20T10:00:00Z", status: "active" },
    { id: "DEV002", btName: "OorjaWheel-F3G4", macAddress: "00:1A:2B:3C:4D:5F", warrantyStart: "2024-02-10", defaultCommand: "B80", firstConnected: "2024-02-15T11:30:00Z", status: "active" },
    { id: "DEV003", btName: "OorjaWheel-H5J6", macAddress: "00:1A:2B:3C:4D:6A", warrantyStart: "2024-03-01", defaultCommand: "L255,0,0", firstConnected: null, status: "never_used" },
    { id: "DEV004", btName: "OorjaWheel-K7L8", macAddress: "00:1A:2B:3C:4D:6B", warrantyStart: "2023-12-05", defaultCommand: "S20", firstConnected: "2023-12-10T09:00:00Z", status: "disabled" },
    { id: "DEV005", btName: "OorjaWheel-M9N1", macAddress: "00:1A:2B:3C:4D:6C", warrantyStart: "2024-05-20", defaultCommand: "S20", firstConnected: null, status: "never_used" },
  ];
  return z.array(deviceSchema).parse(data);
}

export default async function DevicesPage() {
  const devices = await getDevices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline">Device Management</h1>
          <p className="text-muted-foreground">
            Add, edit, and manage device settings.
          </p>
        </div>
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Device
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Device</DialogTitle>
                    <DialogDescription>
                        Fill in the details to register a new device.
                    </DialogDescription>
                </DialogHeader>
                 {/* Form would go here */}
                 <p className="text-center text-muted-foreground py-8">Device form will be here.</p>
            </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={devices} />
    </div>
  );
}
