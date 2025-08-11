

'use client';

import { z } from 'zod';
import { columns, deviceMasterColumns } from './columns';
import { DataTable } from './data-table';
import { deviceSchema, deviceMasterSchema, Device, DeviceMaster } from './schema';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as React from 'react';

// Mock data fetching
async function getDevices(): Promise<Device[]> {
  // In a real app, you'd fetch this from your database.
  const data = [
    { id: "DEV001", deviceName: "Living Room Wheel", macAddress: "00:1A:2B:3C:4D:5E", deviceType: "OorjaWheel v2", userId: 'USR001', passcode: "123456", status: "active" },
    { id: "DEV002", deviceName: "Bedroom Wheel", macAddress: "00:1A:2B:3C:4D:5F", deviceType: "OorjaWheel v2", userId: 'USR002', passcode: "654321", status: "active" },
    { id: "DEV003", deviceName: "Kitchen Light", macAddress: "00:1A:2B:3C:4D:6A", deviceType: "OorjaLight", userId: null, passcode: "789012", status: "never_used" },
    { id: "DEV004", deviceName: "Old Study Wheel", macAddress: "00:1A:2B:3C:4D:6B", deviceType: "OorjaWheel v1", userId: 'USR004', passcode: "210987", status: "disabled" },
  ];
  return z.array(deviceSchema).parse(data);
}

async function getDeviceMasters(): Promise<DeviceMaster[]> {
    const data = [
        { id: "DM001", deviceType: "OorjaWheel v2", btServe: "Wheel-Service-A", btChar: "Wheel-Char-A", soundBtName: "OorjaAudioV2", status: "active" },
        { id: "DM002", deviceType: "OorjaLight", btServe: "Light-Service-B", btChar: "Light-Char-B", soundBtName: "N/A", status: "active" },
        { id: "DM003", deviceType: "OorjaWheel v1", btServe: "Wheel-Service-Old", btChar: "Wheel-Char-Old", soundBtName: "OorjaAudioV1", status: "inactive" },
    ]
    return z.array(deviceMasterSchema).parse(data);
}

const modals = [
    { id: 'modal01', title: 'OorjaWheel v2', image: 'https://placehold.co/400x400.png', dataAiHint: 'modern wheel' },
    { id: 'modal02', title: 'OorjaLight', image: 'https://placehold.co/400x400.png', dataAiHint: 'smart light' },
    { id: 'modal03', title: 'OorjaSound', image: 'https://placehold.co/400x400.png', dataAiHint: 'smart speaker' },
]

export default function DevicesPage() {
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [deviceMasters, setDeviceMasters] = React.useState<DeviceMaster[]>([]);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isMasterSheetOpen, setIsMasterSheetOpen] = React.useState(false);
  const [selectedDevice, setSelectedDevice] = React.useState<Device | null>(null);
  const [selectedMaster, setSelectedMaster] = React.useState<DeviceMaster | null>(null);
  const [macAddress, setMacAddress] = React.useState('');
  const [passcode, setPasscode] = React.useState('Auto-generated');


  React.useEffect(() => {
    getDevices().then(setDevices);
    getDeviceMasters().then(setDeviceMasters);
  }, []);

  const handleEditDevice = (device: Device) => {
    setSelectedDevice(device);
    setIsSheetOpen(true);
  }

  const handleEditMaster = (master: DeviceMaster) => {
      setSelectedMaster(master);
      setIsMasterSheetOpen(true);
  }
  
  React.useEffect(() => {
    if (macAddress) {
        const cleanedMac = macAddress.replace(/:/g, '');
        if (cleanedMac.length >= 6) {
            setPasscode(cleanedMac.slice(-6).toUpperCase());
        } else {
            setPasscode('Invalid MAC');
        }
    } else {
        setPasscode('Auto-generated');
    }
  }, [macAddress]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline">Device Management</h1>
          <p className="text-muted-foreground">
            Manage device masters and individual device settings.
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="devices" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="master">Device Master</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>
        <TabsContent value="master">
            <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Device Master List</CardTitle>
                        <CardDescription>Manage device types, services, and firmware.</CardDescription>
                    </div>
                    <Button onClick={() => { setSelectedMaster(null); setIsMasterSheetOpen(true); }}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Device Type
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable columns={deviceMasterColumns(handleEditMaster)} data={deviceMasters} filterColumnId='deviceType' filterPlaceholder='Filter by device type...'/>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="devices">
             <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <CardTitle>All Devices</CardTitle>
                    <Button onClick={() => { setSelectedDevice(null); setIsSheetOpen(true); }}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Device
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns(handleEditDevice)} data={devices} filterColumnId='deviceName' filterPlaceholder='Filter by device name...' />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={isMasterSheetOpen} onOpenChange={setIsMasterSheetOpen}>
          <SheetContent>
              <SheetHeader>
                  <SheetTitle>{selectedMaster ? 'Edit Device Type' : 'Add New Device Type'}</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-full">
                  <div className="grid gap-4 px-6 py-4">
                      <div className="space-y-2">
                          <Label htmlFor="device-type-name">Name</Label>
                          <Input id="device-type-name" placeholder="e.g., OorjaWheel v3" defaultValue={selectedMaster?.deviceType}/>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="bt-serve">BT Serve</Label>
                          <Input id="bt-serve" placeholder="Service UUID" defaultValue={selectedMaster?.btServe}/>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="bt-char">BT Char</Label>
                          <Input id="bt-char" placeholder="Characteristic UUID" defaultValue={selectedMaster?.btChar}/>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="sound-bt-name">Sound BT Name</Label>
                          <Input id="sound-bt-name" placeholder="e.g., OorjaAudioV3" defaultValue={selectedMaster?.soundBtName}/>
                      </div>
                      <Button>{selectedMaster ? 'Save Changes' : 'Save Device Type'}</Button>
                  </div>
              </ScrollArea>
          </SheetContent>
      </Sheet>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent>
              <SheetHeader>
                  <SheetTitle>{selectedDevice ? 'Edit Device' : 'Create New Device'}</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-4">
                      <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Select Modal</h3>
                          <div className="grid grid-cols-2 gap-4">
                              {modals.map(modal => (
                                  <Card key={modal.id} className="cursor-pointer hover:border-primary">
                                      <CardContent className="p-4 space-y-2">
                                          <Image src={modal.image} alt={modal.title} width={200} height={200} className="rounded-md w-full" data-ai-hint={modal.dataAiHint} />
                                          <h4 className="font-semibold text-center">{modal.title}</h4>
                                      </CardContent>
                                  </Card>
                              ))}
                          </div>
                      </div>
                      <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Device Details</h3>
                          <div className="space-y-2">
                              <Label htmlFor="user-id">User ID</Label>
                              <Input id="user-id" placeholder="Assign a user ID" defaultValue={selectedDevice?.userId || ''} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="device-type">Device Type</Label>
                              <Select defaultValue={selectedDevice?.deviceType}>
                                  <SelectTrigger id="device-type">
                                      <SelectValue placeholder="Select a device type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {deviceMasters.map(master => (
                                          <SelectItem key={master.id} value={master.deviceType}>{master.deviceType}</SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="mac-address">MAC Address</Label>
                              <Input 
                                id="mac-address" 
                                placeholder="00:1A:2B:3C:4D:5E" 
                                defaultValue={selectedDevice?.macAddress} 
                                value={macAddress}
                                onChange={(e) => setMacAddress(e.target.value)}
                              />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="device-name">Device Name</Label>
                              <Input id="device-name" placeholder="e.g., Living Room Wheel" defaultValue={selectedDevice?.deviceName} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="passcode">Passcode</Label>
                              <Input id="passcode" value={passcode} readOnly />
                          </div>
                          <Button className="w-full">{selectedDevice ? 'Update Device' : 'Create Device'}</Button>
                      </div>
                  </div>
              </ScrollArea>
          </SheetContent>
      </Sheet>

    </div>
  );
}
