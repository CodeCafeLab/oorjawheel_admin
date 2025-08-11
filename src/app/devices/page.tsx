

'use client';

import { z } from 'zod';
import { columns, deviceMasterColumns } from './columns';
import { DataTable } from './data-table';
import { deviceSchema, deviceMasterSchema, Device, DeviceMaster } from './schema';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();


  const fetchDevices = () => getDevices().then(setDevices);
  const fetchDeviceMasters = () => getDeviceMasters().then(setDeviceMasters);

  React.useEffect(() => {
    fetchDevices();
    fetchDeviceMasters();
  }, []);

  const handleEditDevice = (device: Device) => {
    setSelectedDevice(device);
    setMacAddress(device.macAddress);
    setIsSheetOpen(true);
  }

  const handleEditMaster = (master: DeviceMaster) => {
      setSelectedMaster(master);
      setIsMasterSheetOpen(true);
  }

  const handleDeleteDevice = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
    toast({ title: 'Device Deleted', description: `Device with ID ${id} has been deleted.` });
  }

  const handleDeleteMaster = (id: string) => {
      setDeviceMasters(prev => prev.filter(m => m.id !== id));
      toast({ title: 'Device Type Deleted', description: `Device Type with ID ${id} has been deleted.` });
  }

  const handleDeleteSelectedDevices = (ids: string[]) => {
    setDevices(prev => prev.filter(d => !ids.includes(d.id)));
    toast({ title: 'Devices Deleted', description: `${ids.length} devices have been deleted.` });
  }

  const handleDeleteSelectedMasters = (ids: string[]) => {
      setDeviceMasters(prev => prev.filter(m => !ids.includes(m.id)));
      toast({ title: 'Device Types Deleted', description: `${ids.length} device types have been deleted.` });
  }
  
  React.useEffect(() => {
    if (!isSheetOpen) {
        setMacAddress('');
    }
  }, [isSheetOpen]);

  React.useEffect(() => {
    if (macAddress) {
        const cleanedMac = macAddress.replace(/[^A-Za-z0-9]/g, '');
        if (cleanedMac.length >= 6) {
            setPasscode(cleanedMac.slice(-6).toUpperCase());
        } else {
            setPasscode('Invalid MAC');
        }
    } else {
        setPasscode('Auto-generated');
    }
  }, [macAddress]);

  const handleDeviceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedDevice = {
        id: selectedDevice?.id || `DEV${Date.now()}`,
        deviceName: formData.get('device-name') as string,
        macAddress: formData.get('mac-address') as string,
        deviceType: formData.get('device-type') as string,
        userId: formData.get('user-id') as string,
        passcode: passcode,
        status: selectedDevice?.status || 'never_used',
    } as Device;

    if (selectedDevice) {
        setDevices(prev => prev.map(d => d.id === selectedDevice.id ? updatedDevice : d));
        toast({ title: 'Device Updated', description: 'Device details have been updated.' });
    } else {
        setDevices(prev => [...prev, updatedDevice]);
        toast({ title: 'Device Created', description: 'New device has been created.' });
    }
    setIsSheetOpen(false);
    setSelectedDevice(null);
  }

  const handleMasterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedMaster = {
        id: selectedMaster?.id || `DM${Date.now()}`,
        deviceType: formData.get('device-type-name') as string,
        btServe: formData.get('bt-serve') as string,
        btChar: formData.get('bt-char') as string,
        soundBtName: formData.get('sound-bt-name') as string,
        status: selectedMaster?.status || 'active',
    } as DeviceMaster;

    if (selectedMaster) {
        setDeviceMasters(prev => prev.map(m => m.id === selectedMaster.id ? updatedMaster : m));
        toast({ title: 'Device Type Updated', description: 'Device type details have been updated.' });
    } else {
        setDeviceMasters(prev => [...prev, updatedMaster]);
        toast({ title: 'Device Type Created', description: 'New device type has been created.' });
    }
    setIsMasterSheetOpen(false);
    setSelectedMaster(null);
  }


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
                    <DataTable 
                        columns={deviceMasterColumns(handleEditMaster, handleDeleteMaster)} 
                        data={deviceMasters} 
                        filterColumnId='deviceType' 
                        filterPlaceholder='Filter by device type...'
                        onDelete={handleDeleteMaster}
                        onDeleteSelected={handleDeleteSelectedMasters}
                        exportFileName='device-masters'
                        filters={[{
                            id: 'status',
                            title: 'Status',
                            options: [
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                            ]
                        }]}
                    />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="devices">
             <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>All Devices</CardTitle>
                        <CardDescription>Manage all provisioned devices.</CardDescription>
                    </div>
                    <Button onClick={() => { setSelectedDevice(null); setIsSheetOpen(true); }}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Device
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable 
                        columns={columns(handleEditDevice, handleDeleteDevice)} 
                        data={devices} 
                        filterColumnId='deviceName' 
                        filterPlaceholder='Filter by device name...'
                        onDelete={handleDeleteDevice}
                        onDeleteSelected={handleDeleteSelectedDevices}
                        exportFileName='devices'
                        filters={[
                            {
                                id: 'status',
                                title: 'Status',
                                options: [
                                    { value: 'active', label: 'Active' },
                                    { value: 'never_used', label: 'Never Used' },
                                    { value: 'disabled', label: 'Disabled' },
                                ]
                            },
                            {
                                id: 'deviceType',
                                title: 'Type',
                                options: deviceMasters.map(dm => ({ value: dm.deviceType, label: dm.deviceType }))
                            }
                        ]}
                    />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={isMasterSheetOpen} onOpenChange={(isOpen) => {
            setIsMasterSheetOpen(isOpen);
            if (!isOpen) setSelectedMaster(null);
      }}>
          <SheetContent>
              <SheetHeader>
                  <SheetTitle>{selectedMaster ? 'Edit Device Type' : 'Add New Device Type'}</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-full">
                <form onSubmit={handleMasterSubmit}>
                  <div className="grid gap-4 px-6 py-4">
                      <div className="space-y-2">
                          <Label htmlFor="device-type-name">Name</Label>
                          <Input name="device-type-name" id="device-type-name" placeholder="e.g., OorjaWheel v3" defaultValue={selectedMaster?.deviceType}/>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="bt-serve">BT Serve</Label>
                          <Input name="bt-serve" id="bt-serve" placeholder="Service UUID" defaultValue={selectedMaster?.btServe}/>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="bt-char">BT Char</Label>
                          <Input name="bt-char" id="bt-char" placeholder="Characteristic UUID" defaultValue={selectedMaster?.btChar}/>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="sound-bt-name">Sound BT Name</Label>
                          <Input name="sound-bt-name" id="sound-bt-name" placeholder="e.g., OorjaAudioV3" defaultValue={selectedMaster?.soundBtName}/>
                      </div>
                      <Button type="submit">{selectedMaster ? 'Save Changes' : 'Save Device Type'}</Button>
                  </div>
                </form>
              </ScrollArea>
          </SheetContent>
      </Sheet>

      <Sheet open={isSheetOpen} onOpenChange={(isOpen) => {
          setIsSheetOpen(isOpen);
          if (!isOpen) setSelectedDevice(null);
      }}>
          <SheetContent>
              <SheetHeader>
                  <SheetTitle>{selectedDevice ? 'Edit Device' : 'Create New Device'}</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-full">
                <form onSubmit={handleDeviceSubmit}>
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
                              <Input name="user-id" id="user-id" placeholder="Assign a user ID" defaultValue={selectedDevice?.userId || ''} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="device-type">Device Type</Label>
                              <Select name="device-type" defaultValue={selectedDevice?.deviceType}>
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
                                name="mac-address"
                                id="mac-address" 
                                placeholder="00:1A:2B:3C:4D:5E" 
                                defaultValue={selectedDevice?.macAddress} 
                                value={macAddress}
                                onChange={(e) => setMacAddress(e.target.value)}
                              />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="device-name">Device Name</Label>
                              <Input name="device-name" id="device-name" placeholder="e.g., Living Room Wheel" defaultValue={selectedDevice?.deviceName} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="passcode">Passcode</Label>
                              <Input name="passcode" id="passcode" value={passcode} readOnly />
                          </div>
                          <Button type="submit" className="w-full">{selectedDevice ? 'Update Device' : 'Create Device'}</Button>
                      </div>
                  </div>
                </form>
              </ScrollArea>
          </SheetContent>
      </Sheet>

    </div>
  );
}
