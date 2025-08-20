"use client";

import { useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { addDevice, updateDevice } from "@/actions/devices";
import { useToast } from "@/hooks/use-toast";
import { Device } from "@/app/devices/schema";

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
    userId: device?.user_id || device?.userId || "",
    passcode: device?.passcode || "",
    status: device?.status || "never_used",
    btName: device?.bt_name || device?.btName || "",
    warrantyStart: device?.warranty_start || device?.warrantyStart || "",
    defaultCmd: device?.default_cmd || device?.defaultCmd || "",
    firstConnectedAt: device?.first_connected_at || device?.firstConnectedAt || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    device?.warranty_start || device?.warrantyStart ? new Date(device.warranty_start || device.warrantyStart) : undefined
  );
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = device
        ? await updateDevice(device.id, formData)
        : await addDevice(formData);

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
            <Input
              id="userId"
              value={formData.userId}
              onChange={(e) => handleChange("userId", e.target.value)}
              placeholder="Assign to user"
            />
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    handleChange(
                      "warrantyStart",
                      newDate ? format(newDate, "yyyy-MM-dd") : ""
                    );
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
            <Input
              id="firstConnectedAt"
              type="datetime-local"
              value={formData.firstConnectedAt ? format(new Date(formData.firstConnectedAt), "yyyy-MM-dd'T'HH:mm") : ""}
              onChange={(e) => handleChange("firstConnectedAt", e.target.value)}
            />
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
