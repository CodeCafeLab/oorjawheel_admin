'use client';

import { z } from 'zod';
import { columns, deviceMasterColumns } from './columns';
import { DataTable } from './data-table';
import { deviceSchema, deviceMasterSchema, Device, DeviceMaster } from './schema';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
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
} from "@/components/ui/select";
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
    addDevice, 
    updateDevice, 
    deleteDevice, 
    addDeviceMaster, 
    updateDeviceMaster, 
    deleteDeviceMaster,
    fetchDevices,
    fetchDeviceMasters
} from '@/actions/devices-enhanced';

// Enhanced modal data with proper device types
const modals = [
    { id: 'modal01', title: 'OorjaWheel v2', image: 'https://placehold.co/400x400.png', type: 'OorjaWheel v2' },
    { id: 'modal02', title: 'OorjaLight', image: 'https://placehold.co/400x400.png', type: 'OorjaLight' },
    { id: 'modal03', title: 'OorjaSound', image: 'https://placehold.co/400x400.png', type: 'OorjaSound' },
    { id: 'modal04', title: 'OorjaHub', image: 'https://placehold.co/400x400.png', type: 'OorjaHub' },
    { id: 'modal05', title: 'OorjaSensor', image: 'https://placehold.co/400x400.png', type: 'OorjaSensor' },
];

export default function EnhancedDevicesPage() {
    const [devices, setDevices] = React.useState<Device[]>([]);
    const [deviceMasters, setDeviceMasters] = React.useState<DeviceMaster[]>([]);
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);
    const [isMasterSheetOpen, setIsMasterSheetOpen] = React.useState(false);
    const [selectedDevice, setSelectedDevice] = React.useState<Device | null>(null);
    const [selectedMaster, setSelectedMaster] = React.useState<DeviceMaster | null>(null);
    const [macAddress, setMacAddress] = React.useState('');
    const [passcode, setPasscode] = React.useState('Auto-generated');
    const [loading, setLoading] = React.useState(false);
    const { toast } = useToast();

    const refreshData = async () => {
        setLoading(true);
        try {
            const [devicesData, mastersData] = await Promise.all([
                fetchDevices(),
                fetchDeviceMasters()
            ]);
            setDevices(devicesData);
            setDeviceMasters(mastersData);
        } catch (error) {
            console.error('Error refreshing data:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to refresh device data'
            });
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        refreshData();
    }, []);

    const handleEditDevice = (device: Device) => {
        setSelectedDevice(device);
        setMacAddress(device.macAddress);
        setPasscode(device.passcode);
        setIsSheetOpen(true);
    };

    const handleEditMaster = (master: DeviceMaster) => {
        setSelectedMaster(master);
        setIsMasterSheetOpen(true);
    };

    const handleDeleteDevice = async (id: string) => {
        const response = await fetch('/api/devices', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        const result = await response.json();
        if (response.ok && !result.error) {
            toast({ title: 'Device Deleted', description: result.message });
            refreshData();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to delete device.' });
        }
    };

    const handleDeleteMaster = async (id: string) => {
        const result = await deleteDeviceMaster(id);
        if (result.success) {
            toast({ title: 'Device Type Deleted', description: result.message });
            refreshData();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
    };

    const handleDeleteSelectedDevices = (ids: string[]) => {
        Promise.all(ids.map(id => deleteDevice(id))).then(() => {
            toast({ title: 'Devices Deleted', description: `${ids.length} devices have been deleted.` });
            refreshData();
        });
    };

    const handleDeleteSelectedMasters = (ids: string[]) => {
        Promise.all(ids.map(id => deleteDeviceMaster(id))).then(() => {
            toast({ title: 'Device Types Deleted', description: `${ids.length} device types have been deleted.` });
            refreshData();
        });
    };

    React.useEffect(() => {
        if (isSheetOpen) {
            setMacAddress(selectedDevice?.macAddress || '');
            setPasscode(selectedDevice?.passcode || 'Auto-generated');
        } else {
            setMacAddress('');
            setPasscode('Auto-generated');
            setSelectedDevice(null);
        }
    }, [isSheetOpen, selectedDevice]);

    React.useEffect(() => {
        if (!isMasterSheetOpen) {
            setSelectedMaster(null);
        }
    }, [isMasterSheetOpen]);

    React.useEffect(() => {
        if (macAddress) {
            const cleanedMac = macAddress.replace(/[^A-Fa-f0-9]/g, '');
            if (cleanedMac.length >= 6) {
                setPasscode(cleanedMac.slice(-6).toUpperCase());
            } else {
                setPasscode('Invalid MAC');
            }
        } else {
            setPasscode('Auto-generated');
        }
    }, [macAddress]);

    const handleDeviceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const deviceData = {
            deviceName: formData.get('device-name') as string,
            macAddress: formData.get('mac-address') as string,
            deviceType: formData.get('device-type') as string,
            userId: (formData.get('user-id') as string) || null,
            passcode: passcode,
            status: (formData.get('status') as 'never_used' | 'active' | 'disabled') || (selectedDevice?.status || 'never_used'),
        };

        const apiUrl = '/api/devices';
        let response;
        if (selectedDevice) {
            response = await fetch(apiUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedDevice.id, ...deviceData }),
            });
        } else {
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(deviceData),
            });
        }
        const result = await response.json();

        if (response.ok && !result.error) {
            toast({ title: selectedDevice ? 'Device Updated' : 'Device Created', description: result.message });
            refreshData();
            setIsSheetOpen(false);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to save device.' });
        }
    };

    const handleMasterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const masterData = {
            deviceType: formData.get('device-type-name') as string,
            btServe: formData.get('bt-serve') as string,
            btChar: formData.get('bt-char') as string,
            soundBtName: formData.get('sound-bt-name') as string,
            status: (formData.get('status') as 'active' | 'inactive') || (selectedMaster?.status || 'active'),
        };

        const result = selectedMaster
            ? await updateDeviceMaster(selectedMaster.id, masterData)
            : await addDeviceMaster(masterData);

        if (result.success) {
            toast({ title: selectedMaster ? 'Device Type Updated' : 'Device Type Created', description: result.message });
            refreshData();
            setIsMasterSheetOpen(false);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-headline">Device Management</h1>
                    <p className="text-muted-foreground">
                        Manage device masters and individual device settings.
                    </p>
                </div>
                <Button onClick={refreshData} disabled={loading} variant="outline">
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Loading...' : 'Refresh'}
                </Button>
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
                            <Sheet open={isMasterSheetOpen} onOpenChange={setIsMasterSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button onClick={() => { setSelectedMaster(null); setIsMasterSheetOpen(true); }}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Device Type
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className='md:max-w-xl'>
                                    <SheetHeader>
                                        <SheetTitle>{selectedMaster ? 'Edit Device Type' : 'Add New Device Type'}</SheetTitle>
                                    </SheetHeader>
                                    <ScrollArea className="h-full">
                                        <form onSubmit={handleMasterSubmit}>
                                            <div className="grid gap-4 px-6 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="device-type-name">Name</Label>
                                                    <Input 
                                                        name="device-type-name" 
                                                        id="device-type-name" 
                                                        placeholder="e.g., OorjaWheel v3" 
                                                        defaultValue={selectedMaster?.deviceType}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="bt-serve">BT Serve</Label>
                                                    <Input 
                                                        name="bt-serve" 
                                                        id="bt-serve" 
                                                        placeholder="Service UUID" 
                                                        defaultValue={selectedMaster?.btServe}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="bt-char">BT Char</Label>
                                                    <Input 
                                                        name="bt-char" 
                                                        id="bt-char" 
                                                        placeholder="Characteristic UUID" 
                                                        defaultValue={selectedMaster?.btChar}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="sound-bt-name">Sound BT Name</Label>
                                                    <Input 
                                                        name="sound-bt-name" 
                                                        id="sound-bt-name" 
                                                        placeholder="e.g., OorjaAudioV3" 
                                                        defaultValue={selectedMaster?.soundBtName}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="status">Status</Label>
                                                    <Select name="status" defaultValue={selectedMaster?.status || 'active'}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="active">Active</SelectItem>
                                                            <SelectItem value="inactive">Inactive</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Button type="submit">
                                                    {selectedMaster ? 'Save Changes' : 'Save Device Type'}
                                                </Button>
                                            </div>
                                        </form>
                                    </ScrollArea>
                                </SheetContent>
                            </Sheet>
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
                            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button onClick={() => { setSelectedDevice(null); setIsSheetOpen(true); }}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Device
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className='md:max-w-4xl'>
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
                                                            <Card key={modal.id} className="cursor-pointer hover:border-primary transition-colors">
                                                                <CardContent className="p-4 space-y-2">
                                                                    <Image 
                                                                        src={modal.image} 
                                                                        alt={modal.title} 
                                                                        width={200} 
                                                                        height={200} 
                                                                        className="rounded-md w-full" 
                                                                    />
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
                                                        <Input 
                                                            name="user-id" 
                                                            id="user-id" 
                                                            placeholder="Assign a user ID" 
                                                            defaultValue={selectedDevice?.userId || ''}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="device-type">Device Type</Label>
                                                        <Select name="device-type" defaultValue={selectedDevice?.deviceType}>
                                                            <SelectTrigger id="device-type">
                                                                <SelectValue placeholder="Select a device type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {deviceMasters.filter(dm => dm.status === 'active').map(master => (
                                                                    <SelectItem key={master.id} value={master.deviceType}>
                                                                        {master.deviceType}
                                                                    </SelectItem>
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
                                                            value={macAddress}
                                                            onChange={(e) => setMacAddress(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="device-name">Device Name</Label>
                                                        <Input 
                                                            name="device-name" 
                                                            id="device-name" 
                                                            placeholder="e.g., Living Room Wheel" 
                                                            defaultValue={selectedDevice?.deviceName}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="passcode">Passcode</Label>
                                                        <Input 
                                                            name="passcode" 
                                                            id="passcode" 
                                                            value={passcode} 
                                                            readOnly 
                                                        />
                                                    </div>
                                                    {selectedDevice && (
                                                        <div className="space-y-2">
                                                            <Label htmlFor="status">Status</Label>
                                                            <Select name="status" defaultValue={selectedDevice?.status}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select Status" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="never_used">Never Used</SelectItem>
                                                                    <SelectItem value="active">Active</SelectItem>
                                                                    <SelectItem value="disabled">Disabled</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}
                                                    <Button type="submit" className="w-full">
                                                        {selectedDevice ? 'Update Device' : 'Create Device'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </form>
                                    </ScrollArea>
                                </SheetContent>
                            </Sheet>
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
        </div>
    );
}
