
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
    fetchDeviceMasters,
    bulkDeleteDevices,
    bulkDeleteDeviceMasters
} from '@/actions/devices';
import EnhancedDeviceForm from './enhanced-device-form';

export default function DevicesPage() {
    const [devices, setDevices] = React.useState<Device[]>([]);
    const [deviceMasters, setDeviceMasters] = React.useState<DeviceMaster[]>([]);
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);
    const [isMasterSheetOpen, setIsMasterSheetOpen] = React.useState(false);
    const [selectedDevice, setSelectedDevice] = React.useState<Device | null>(null);
    const [selectedMaster, setSelectedMaster] = React.useState<DeviceMaster | null>(null);
    const [loading, setLoading] = React.useState(false);
    const { toast } = useToast();

    const refreshData = async () => {
        setLoading(true);
        try {
            const [devicesData, mastersData] = await Promise.all([
                fetchDevices(),
                fetchDeviceMasters()
            ]);
            setDevices(z.array(deviceSchema.partial()).parse(devicesData));
            setDeviceMasters(z.array(deviceMasterSchema).parse(mastersData));
        } catch (error) {
            console.error('Data validation/fetching error:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to refresh or validate device data.'
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
        setIsSheetOpen(true);
    };

    const handleEditMaster = (master: DeviceMaster) => {
        setSelectedMaster(master);
        setIsMasterSheetOpen(true);
    };

    const handleDeleteDevice = async (id: string) => {
        const result = await deleteDevice(id);
        if (result.success) {
            toast({ title: 'Device Deleted', description: result.message });
            refreshData();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
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

    const handleBulkDeleteDevices = async (ids: string[]) => {
        const result = await bulkDeleteDevices(ids);
        if (result.success) {
          toast({ title: 'Devices Deleted', description: result.message });
          refreshData();
        } else {
          toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
      };
    
      const handleBulkDeleteMasters = async (ids: string[]) => {
        const result = await bulkDeleteDeviceMasters(ids);
        if (result.success) {
          toast({ title: 'Device Types Deleted', description: result.message });
          refreshData();
        } else {
          toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
      };
      

    const handleFormSuccess = () => {
        refreshData();
        setIsSheetOpen(false);
        setIsMasterSheetOpen(false)
        setSelectedDevice(null);
        setSelectedMaster(null);
    }
    
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
            ? await updateDeviceMaster(selectedMaster.id.toString(), masterData)
            : await addDeviceMaster(masterData);

        if (result.success) {
            toast({ title: selectedMaster ? 'Device Type Updated' : 'Device Type Created', description: result.message });
            handleFormSuccess();
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
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                </Button>
            </div>
            
            <Tabs defaultValue="devices" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                    <TabsTrigger value="master">Device Master</TabsTrigger>
                    <TabsTrigger value="devices">Devices</TabsTrigger>
                </TabsList>
                
                <TabsContent value="master">
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Sheet open={isMasterSheetOpen} onOpenChange={(isOpen) => {
                                setIsMasterSheetOpen(isOpen)
                                if (!isOpen) setSelectedMaster(null)
                            }}>
                                <SheetTrigger asChild>
                                    <Button>
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
                        </div>
                        {deviceMasters.length > 0 ? (
                             <Card>
                                <CardHeader>
                                    <CardTitle>Device Master List</CardTitle>
                                    <CardDescription>Manage device types, services, and firmware.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DataTable 
                                        columns={deviceMasterColumns(handleEditMaster, handleDeleteMaster)} 
                                        data={deviceMasters} 
                                        filterColumnId='deviceType' 
                                        filterPlaceholder='Filter by device type...'
                                        onDelete={handleDeleteMaster}
                                        onDeleteSelected={handleBulkDeleteMasters}
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
                        ) : (
                            <Card className="flex flex-col items-center justify-center py-20">
                                <CardHeader>
                                    <CardTitle className="text-xl font-headline">No Device Types Found</CardTitle>
                                    <CardDescription>
                                    Create a device type to get started.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button size="lg" onClick={() => { setSelectedMaster(null); setIsMasterSheetOpen(true);}}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Your First Device Type
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>
                
                <TabsContent value="devices">
                     <div className="space-y-4">
                        <div className="flex justify-end">
                            <Sheet open={isSheetOpen} onOpenChange={(isOpen) => {
                                setIsSheetOpen(isOpen);
                                if (!isOpen) setSelectedDevice(null);
                            }}>
                                <SheetTrigger asChild>
                                    <Button>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Device
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className='md:max-w-4xl'>
                                    <SheetHeader>
                                        <SheetTitle>{selectedDevice ? 'Edit Device' : 'Create New Device'}</SheetTitle>
                                    </SheetHeader>
                                    <ScrollArea className="h-[calc(100vh-8rem)]">
                                        <div className="px-6 py-4">
                                            <EnhancedDeviceForm 
                                                device={selectedDevice}
                                                deviceMasters={deviceMasters}
                                                onSuccess={handleFormSuccess}
                                                onCancel={() => setIsSheetOpen(false)}
                                            />
                                        </div>
                                    </ScrollArea>
                                </SheetContent>
                            </Sheet>
                        </div>
                        {devices.length > 0 ? (
                             <Card>
                                <CardHeader>
                                    <CardTitle>All Devices</CardTitle>
                                    <CardDescription>Manage all provisioned devices.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DataTable 
                                        columns={columns(handleEditDevice, handleDeleteDevice)} 
                                        data={devices} 
                                        filterColumnId='deviceName' 
                                        filterPlaceholder='Filter by device name...'
                                        onDelete={handleDeleteDevice}
                                        onDeleteSelected={handleBulkDeleteDevices}
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
                        ) : (
                             <Card className="flex flex-col items-center justify-center py-20">
                                <CardHeader>
                                    <CardTitle className="text-xl font-headline">No Devices Found</CardTitle>
                                    <CardDescription>
                                        Get started by adding your first device.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                     <Button size="lg" onClick={() => { setSelectedDevice(null); setIsSheetOpen(true); }}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Your First Device
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
