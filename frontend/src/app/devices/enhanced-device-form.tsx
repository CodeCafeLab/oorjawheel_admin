"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { addDevice, updateDevice } from "@/actions/devices";
import { fetchUsers } from "@/actions/users";
import { useToast } from "@/hooks/use-toast";
import { Device } from "@/app/devices/schema";
import type { User } from "@/app/users/schema";

interface EnhancedDeviceFormProps {
  device?: any;
  deviceMasters: any[];
  onSubmit: (data: Device) => void
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EnhancedDeviceForm({
  device,
  deviceMasters,
  onSuccess,
  onCancel,
}: EnhancedDeviceFormProps) {
  const [formData, setFormData] = useState({
    deviceName: device?.device_name || device?.deviceName || "",
    macAddress: device?.mac_address || device?.macAddress || "",
    deviceType: device?.device_type || device?.deviceType || "",
    userId: device?.user_id || device?.userId || "unassigned",
    passcode: device?.passcode || "",
    status: device?.status || "never_used",
    btName: device?.bt_name || device?.btName || "",
    warrantyStart: device?.warranty_start || device?.warrantyStart || "",
    defaultCmd: device?.default_cmd || device?.defaultCmd || "",
    firstConnectedAt: device?.first_connected_at || device?.firstConnectedAt || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const { toast } = useToast();

  // Fetch users for the dropdown
  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const usersData = await fetchUsers();
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load users for assignment",
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, [toast]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Clean the form data - convert empty strings to null for optional fields
      // Note: warrantyStart and firstConnectedAt are read-only and managed by mobile app
      const cleanedFormData = {
        ...formData,
        userId: formData.userId === "unassigned" ? null : formData.userId || null,
        btName: formData.btName || null,
        defaultCmd: formData.defaultCmd || null,
        // Don't send warranty and first connected data as they're managed by mobile app
        warrantyStart: null,
        firstConnectedAt: null,
      };

      const result = device
        ? await updateDevice(device.id, cleanedFormData)
        : await addDevice(cleanedFormData);

      if (result.success) {
        toast({
          title: device ? "Device Updated" : "Device Created",
          description: result.message,
        });
        onSuccess();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePasscode = () => {
    const cleanedMac = formData.macAddress.replace(/[^A-Fa-f0-9]/g, "");
    if (cleanedMac.length >= 6) {
      setFormData((prev) => ({
        ...prev,
        passcode: cleanedMac.slice(-6).toUpperCase(),
      }));
    }
  };

  const defaultCommands = [
    "POWER_ON",
    "POWER_OFF",
    "LIGHT_ON",
    "LIGHT_OFF",
    "VOLUME_UP",
    "VOLUME_DOWN",
    "CONNECT",
    "DISCONNECT",
    "RESET",
    "SYNC",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>

          <div className="space-y-2">
            <Label htmlFor="deviceName">Device Name *</Label>
            <Input
              id="deviceName"
              value={formData.deviceName}
              onChange={(e) => handleChange("deviceName", e.target.value)}
              placeholder="e.g., Living Room Wheel"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="macAddress">MAC Address *</Label>
            <Input
              id="macAddress"
              value={formData.macAddress}
              onChange={(e) => handleChange("macAddress", e.target.value)}
              placeholder="00:1A:2B:3C:4D:5E"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deviceType">Device Type *</Label>
            <Select
              value={formData.deviceType}
              onValueChange={(value) => handleChange("deviceType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                {deviceMasters
                  .filter((dm) => dm.status === "active")
                  .map((master) => (
                    <SelectItem key={master.id} value={master.deviceType}>
                      {master.deviceType}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userId">User ID (Optional)</Label>
            <Select
              value={formData.userId}
              onValueChange={(value) => handleChange("userId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingUsers ? "Loading users..." : "Select a user"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span>{user.fullName || user.email}</span>
                      <span className="text-muted-foreground text-sm">({user.email})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="passcode">Passcode *</Label>
            <div className="flex gap-2">
              <Input
                id="passcode"
                value={formData.passcode}
                onChange={(e) => handleChange("passcode", e.target.value)}
                placeholder="Auto-generated from MAC"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={generatePasscode}
              >
                Generate
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never_used">Never Used</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Advanced Information</h3>

          <div className="space-y-2">
            <Label htmlFor="btName">Bluetooth Name</Label>
            <Input
              id="btName"
              value={formData.btName}
              onChange={(e) => handleChange("btName", e.target.value)}
              placeholder="e.g., OorjaWheel-Living"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="warrantyStart">Warranty Start Date</Label>
            <div className="flex items-center gap-2">
              <Input
                id="warrantyStart"
                value={formData.warrantyStart ? format(new Date(formData.warrantyStart), "PPP") : "Not started"}
                readOnly
                className="bg-muted"
                placeholder="Auto-updated when user logs in"
              />
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              This field is automatically updated when the assigned user logs in through the mobile app
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultCmd">Default Command</Label>
            <Select
              value={formData.defaultCmd}
              onValueChange={(value) => handleChange("defaultCmd", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default command" />
              </SelectTrigger>
              <SelectContent>
                {defaultCommands.map((cmd) => (
                  <SelectItem key={cmd} value={cmd}>
                    {cmd}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstConnectedAt">First Connected At</Label>
            <div className="flex items-center gap-2">
              <Input
                id="firstConnectedAt"
                value={formData.firstConnectedAt ? format(new Date(formData.firstConnectedAt), "PPP 'at' p") : "Not connected"}
                readOnly
                className="bg-muted"
                placeholder="Auto-updated when user connects"
              />
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              This field is automatically updated when the user first connects through the mobile app
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : device ? "Update Device" : "Create Device"}
        </Button>
      </div>
    </form>
  );
}
