
'use client';

import * a as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Device, DeviceMaster } from './schema';
import { useToast } from '@/hooks/use-toast';
import {
  addDevice,
  updateDevice,
  addDeviceMaster,
  updateDeviceMaster,
} from '@/actions/devices';

const modals = [
  {
    id: 'modal01',
    title: 'OorjaWheel v2',
    image: 'https://placehold.co/400x400.png',
    dataAiHint: 'modern wheel',
  },
  {
    id: 'modal02',
    title: 'OorjaLight',
    image: 'https://placehold.co/400x400.png',
    dataAiHint: 'smart light',
  },
  {
    id: 'modal03',
    title: 'OorjaSound',
    image: 'https://placehold.co/400x400.png',
    dataAiHint: 'smart speaker',
  },
];

interface DeviceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device | null;
  deviceMasters: DeviceMaster[];
  onSuccess: () => void;
}

export function DeviceSheet({
  open,
  onOpenChange,
  device,
  deviceMasters,
  onSuccess,
}: DeviceSheetProps) {
  const { toast } = useToast();
  const [macAddress, setMacAddress] = React.useState(device?.macAddress || '');
  const [passcode, setPasscode] = React.useState(device?.passcode || 'Auto-generated');

  React.useEffect(() => {
    if (open) {
      setMacAddress(device?.macAddress || '');
      setPasscode(device?.passcode || 'Auto-generated');
    }
  }, [open, device]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const deviceData = {
      deviceName: formData.get('device-name') as string,
      macAddress: formData.get('mac-address') as string,
      deviceType: formData.get('device-type') as string,
      userId: (formData.get('user-id') as string) || null,
      passcode: passcode,
      status: (formData.get('status') as
        | 'never_used'
        | 'active'
        | 'disabled') || (device?.status || 'never_used'),
    };

    const result = device
      ? await updateDevice(device.id, deviceData)
      : await addDevice(deviceData);

    if (result.success) {
      toast({
        title: device ? 'Device Updated' : 'Device Created',
        description: result.message,
      });
      onSuccess();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="md:max-w-4xl">
        <SheetHeader>
          <SheetTitle>{device ? 'Edit Device' : 'Create New Device'}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-full">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Select Modal</h3>
                <div className="grid grid-cols-2 gap-4">
                  {modals.map((modal) => (
                    <Card
                      key={modal.id}
                      className="cursor-pointer hover:border-primary"
                    >
                      <CardContent className="p-4 space-y-2">
                        <Image
                          src={modal.image}
                          alt={modal.title}
                          width={200}
                          height={200}
                          className="rounded-md w-full"
                          data-ai-hint={modal.dataAiHint}
                        />
                        <h4 className="font-semibold text-center">
                          {modal.title}
                        </h4>
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
                    defaultValue={device?.userId || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="device-type">Device Type</Label>
                  <Select name="device-type" defaultValue={device?.deviceType}>
                    <SelectTrigger id="device-type">
                      <SelectValue placeholder="Select a device type" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceMasters
                        .filter((dm) => dm.status === 'active')
                        .map((master) => (
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="device-name">Device Name</Label>
                  <Input
                    name="device-name"
                    id="device-name"
                    placeholder="e.g., Living Room Wheel"
                    defaultValue={device?.deviceName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passcode">Passcode</Label>
                  <Input name="passcode" id="passcode" value={passcode} readOnly />
                </div>
                {device && (
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={device?.status}>
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
                  {device ? 'Update Device' : 'Create Device'}
                </Button>
              </div>
            </div>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}


interface DeviceMasterSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    master: DeviceMaster | null;
    onSuccess: () => void;
  }
  
  export function DeviceMasterSheet({ open, onOpenChange, master, onSuccess }: DeviceMasterSheetProps) {
    const { toast } = useToast();
  
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const masterData = {
        deviceType: formData.get('device-type-name') as string,
        btServe: formData.get('bt-serve') as string,
        btChar: formData.get('bt-char') as string,
        soundBtName: formData.get('sound-bt-name') as string,
        status: (formData.get('status') as 'active' | 'inactive') || (master?.status || 'active'),
      };
  
      const result = master
        ? await updateDeviceMaster(master.id, masterData)
        : await addDeviceMaster(masterData);
  
      if (result.success) {
        toast({
          title: master ? 'Device Type Updated' : 'Device Type Created',
          description: result.message,
        });
        onSuccess();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    };
  
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="md:max-w-xl">
          <SheetHeader>
            <SheetTitle>
              {master ? 'Edit Device Type' : 'Add New Device Type'}
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-full">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 px-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="device-type-name">Name</Label>
                  <Input
                    name="device-type-name"
                    id="device-type-name"
                    placeholder="e.g., OorjaWheel v3"
                    defaultValue={master?.deviceType}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bt-serve">BT Serve</Label>
                  <Input
                    name="bt-serve"
                    id="bt-serve"
                    placeholder="Service UUID"
                    defaultValue={master?.btServe}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bt-char">BT Char</Label>
                  <Input
                    name="bt-char"
                    id="bt-char"
                    placeholder="Characteristic UUID"
                    defaultValue={master?.btChar}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sound-bt-name">Sound BT Name</Label>
                  <Input
                    name="sound-bt-name"
                    id="sound-bt-name"
                    placeholder="e.g., OorjaAudioV3"
                    defaultValue={master?.soundBtName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={master?.status}>
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
                  {master ? 'Save Changes' : 'Save Device Type'}
                </Button>
              </div>
            </form>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }
