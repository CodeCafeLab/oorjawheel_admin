"use client";

import { z } from "zod";
import { columns, deviceMasterColumns } from "./columns";
import { DataTable } from "./data-table";
import {
  deviceSchema,
  deviceMasterSchema,
  Device,
  DeviceMaster,
} from "./schema";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import EnhancedDeviceForm from "./enhanced-device-form";

// --- API helper ---
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // Get token from localStorage - check multiple possible keys
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('auth_token') || 
            localStorage.getItem('authToken') || 
            localStorage.getItem('token');
  }
  
  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }
  
  
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || `${window.location.origin}/api`;
  const url = `${baseURL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  
  let response: Response;
  
  if (options?.method === 'POST') {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: options.body,
    });
  } else if (options?.method === 'PUT') {
    response = await fetch(url, {
      method: 'PUT',
      headers,
      body: options.body,
    });
  } else if (options?.method === 'DELETE') {
    response = await fetch(url, {
      method: 'DELETE',
      headers,
    });
  } else {
    response = await fetch(url, {
      method: 'GET',
      headers,
    });
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }
  
  const data = await response.json();
  return data;
}

export default function DevicesPage() {
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [deviceMasters, setDeviceMasters] = React.useState<DeviceMaster[]>([]);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isMasterSheetOpen, setIsMasterSheetOpen] = React.useState(false);
  const [selectedDevice, setSelectedDevice] = React.useState<Device | null>(
    null
  );
  const [selectedMaster, setSelectedMaster] =
    React.useState<DeviceMaster | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  // --- Refresh ---
  const refreshData = async () => {
    setLoading(true);
    try {
      const [devicesJson, mastersJson] = await Promise.all([
        apiRequest<{ data: any[] }>("/devices"),
        apiRequest<{ data: any[] }>("/device-masters"),
      ]);

      const parsedDevices = z.array(deviceSchema).parse(
        (Array.isArray(devicesJson) ? devicesJson : devicesJson.data ?? []).map(
          (d: any) => ({
            id: d.id.toString(),
            deviceName: d.device_name,
            macAddress: d.mac_address,
            deviceType: d.device_type,
            userId: d.user_id,
            passcode: d.passcode,
            status: d.status,
            btName: d.bt_name,
            warrantyStart: d.warranty_start,
            defaultCmd: d.default_cmd,
            firstConnectedAt: d.first_connected_at,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          })
        )
      );

      const parsedMasters = z.array(deviceMasterSchema).parse(
        (Array.isArray(mastersJson) ? mastersJson : mastersJson.data ?? []).map(
          (m: any) => ({
            id: m.id.toString(),
            deviceType: m.deviceType || m.device_type,
            btServe: m.btServe || m.bt_serve,
            btChar: m.btChar || m.bt_char,
            soundBtName: m.soundBtName || m.sound_bt_name,
            status: m.status,
            createdAt: m.createdAt || m.created_at,
            updatedAt: m.updatedAt || m.updated_at,
          })
        )
      );

      setDevices(parsedDevices);
      setDeviceMasters(parsedMasters);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to refresh device data.",
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    refreshData();
  }, []);

  // --- Generic CRUD wrapper ---
  const handleAction = async (
    fn: () => Promise<any>,
    successMsg: string,
    closeSheets = true
  ) => {
    setLoading(true);
    try {
      const result = await fn();
      toast({ title: successMsg, description: result.message });
      refreshData();
      if (closeSheets) {
        setIsSheetOpen(false);
        setIsMasterSheetOpen(false);
        setSelectedDevice(null);
        setSelectedMaster(null);
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Device Handlers ---
  const handleDeviceSubmit = (data: Device) =>
    handleAction(
      () =>
        selectedDevice
          ? apiRequest(`/devices/${selectedDevice.id}`, {
              method: "PUT",
              body: JSON.stringify({
                device_name: data.deviceName,
                mac_address: data.macAddress,
                device_type: data.deviceType,
                user_id: data.userId,
                passcode: data.passcode,
                status: data.status,
                bt_name: data.btName ?? "",
                warranty_start: data.warrantyStart || null,
                default_cmd: data.defaultCmd || null,
                first_connected_at: data.firstConnectedAt || null,
              }),
            })
          : apiRequest(`/devices`, {
              method: "POST",
              body: JSON.stringify({
                device_name: data.deviceName,
                mac_address: data.macAddress,
                device_type: data.deviceType,
                user_id: data.userId,
                passcode: data.passcode,
                status: data.status,
                bt_name: data.btName ?? "",
                warranty_start: data.warrantyStart || null,
                default_cmd: data.defaultCmd || null,
                first_connected_at: data.firstConnectedAt || null,
              }),
            }),
      selectedDevice ? "Device Updated" : "Device Added"
    );

  const handleDeleteDevice = (id: string) =>
    handleAction(
      () => apiRequest(`/devices/${id}`, { method: "DELETE" }),
      "Device Deleted",
      false
    );

  const handleBulkDeleteDevices = (ids: string[]) =>
    handleAction(
      () =>
        apiRequest(`/devices/bulk-delete`, {
          method: "POST",
          body: JSON.stringify({ ids }),
        }),
      "Devices Deleted",
      false
    );

  // --- Device Master Handlers ---
  const handleMasterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const masterData = {
      deviceType: formData.get("device-type-name") as string, // <-- changed
      btServe: formData.get("bt-serve") as string, // <-- changed
      btChar: formData.get("bt-char") as string, // <-- changed
      soundBtName: formData.get("sound-bt-name") as string, // <-- changed
      status:
        (formData.get("status") as "active" | "inactive") ||
        selectedMaster?.status ||
        "active",
    };

    handleAction(
      () =>
        selectedMaster
          ? apiRequest(`/device-masters/${selectedMaster.id}`, {
              method: "PUT",
              body: JSON.stringify(masterData),
            })
          : apiRequest(`/device-masters`, {
              method: "POST",
              body: JSON.stringify(masterData),
            }),
      selectedMaster ? "Device Type Updated" : "Device Type Created"
    );
  };

  const handleDeleteMaster = (id: string) =>
    handleAction(
      () => apiRequest(`/device-masters/${id}`, { method: "DELETE" }),
      "Device Type Deleted",
      false
    );

  const handleBulkDeleteMasters = (ids: string[]) =>
    handleAction(
      () =>
        apiRequest(`/device-masters/bulk-delete`, {
          method: "POST",
          body: JSON.stringify({ ids }),
        }),
      "Device Types Deleted",
      false
    );

  // --- UI ---
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
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          {loading ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      <Tabs defaultValue="devices" className="w-full">
        {/* === Device Masters === */}
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="master">Device Master</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="master">
          <div className="space-y-4">
            {/* Add Master Button */}
            <div className="flex justify-end">
              <Sheet
                open={isMasterSheetOpen}
                onOpenChange={(isOpen) => {
                  setIsMasterSheetOpen(isOpen);
                  if (!isOpen) setSelectedMaster(null);
                }}
              >
                <SheetTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Device Type
                  </Button>
                </SheetTrigger>
                <SheetContent className="md:max-w-xl">
                  <SheetHeader>
                    <SheetTitle>
                      {selectedMaster
                        ? "Edit Device Type"
                        : "Add New Device Type"}
                    </SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-full">
                    <form onSubmit={handleMasterSubmit}>
                      <div className="grid gap-4 px-6 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="device-type-name">Name</Label>
                          <Input
                            name="device-type-name"
                            defaultValue={selectedMaster?.deviceType}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bt-serve">BT Serve</Label>
                          <Input
                            name="bt-serve"
                            defaultValue={selectedMaster?.btServe}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bt-char">BT Char</Label>
                          <Input
                            name="bt-char"
                            defaultValue={selectedMaster?.btChar}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sound-bt-name">Sound BT Name</Label>
                          <Input
                            name="sound-bt-name"
                            defaultValue={selectedMaster?.soundBtName}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            name="status"
                            defaultValue={selectedMaster?.status || "active"}
                          >
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
                          {selectedMaster ? "Save Changes" : "Save Device Type"}
                        </Button>
                      </div>
                    </form>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>

            {/* Master Table */}
            {deviceMasters.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Device Master List</CardTitle>
                  <CardDescription>
                    Manage device types, services, and firmware.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={deviceMasterColumns((m) => {
                      setSelectedMaster(m);
                      setIsMasterSheetOpen(true);
                    }, handleDeleteMaster)}
                    data={deviceMasters}
                    filterColumnId="deviceType"
                    filterPlaceholder="Filter by device type..."
                    onDelete={handleDeleteMaster}
                    onDeleteSelected={handleBulkDeleteMasters}
                    exportFileName="device-masters"
                    filters={[
                      {
                        id: "status",
                        title: "Status",
                        options: [
                          { value: "active", label: "Active" },
                          { value: "inactive", label: "Inactive" },
                        ],
                      },
                    ]}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="flex flex-col items-center justify-center py-20">
                <CardHeader>
                  <CardTitle className="text-xl font-headline">
                    No Device Types Found
                  </CardTitle>
                  <CardDescription>
                    Create a device type to get started.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    size="lg"
                    onClick={() => {
                      setSelectedMaster(null);
                      setIsMasterSheetOpen(true);
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Your First Device Type
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* === Devices === */}
        <TabsContent value="devices">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Sheet
                open={isSheetOpen}
                onOpenChange={(isOpen) => {
                  setIsSheetOpen(isOpen);
                  if (!isOpen) setSelectedDevice(null);
                }}
              >
                <SheetTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Device
                  </Button>
                </SheetTrigger>
                <SheetContent className="md:max-w-4xl">
                  <SheetHeader>
                    <SheetTitle>
                      {selectedDevice ? "Edit Device" : "Create New Device"}
                    </SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-8rem)]">
                    <div className="px-6 py-4">
                      <EnhancedDeviceForm
                        device={selectedDevice}
                        deviceMasters={deviceMasters}
                        onSubmit={handleDeviceSubmit}
                        onSuccess={() => {
                          setIsSheetOpen(false);
                          setSelectedDevice(null);
                        }}
                        onCancel={() => setIsSheetOpen(false)}
                      />
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>

            {/* Device Table */}
            {devices.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>All Devices</CardTitle>
                  <CardDescription>
                    Manage all provisioned devices.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns((d) => {
                      setSelectedDevice(d);
                      setIsSheetOpen(true);
                    }, handleDeleteDevice)}
                    data={devices}
                    filterColumnId="deviceName"
                    filterPlaceholder="Filter by device name..."
                    onDelete={handleDeleteDevice}
                    onDeleteSelected={handleBulkDeleteDevices}
                    exportFileName="devices"
                    filters={[
                      {
                        id: "status",
                        title: "Status",
                        options: [
                          { value: "active", label: "Active" },
                          { value: "never_used", label: "Never Used" },
                          { value: "disabled", label: "Disabled" },
                        ],
                      },
                      {
                        id: "deviceType",
                        title: "Type",
                        options: deviceMasters.map((dm) => ({
                          value: dm.deviceType,
                          label: dm.deviceType,
                        })),
                      },
                    ]}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="flex flex-col items-center justify-center py-20">
                <CardHeader>
                  <CardTitle className="text-xl font-headline">
                    No Devices Found
                  </CardTitle>
                  <CardDescription>
                    Get started by adding your first device.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    size="lg"
                    onClick={() => {
                      setSelectedDevice(null);
                      setIsSheetOpen(true);
                    }}
                  >
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
