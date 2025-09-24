
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Trash2, Edit, Printer, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { StatusSwitch } from "@/components/ui/status-switch"
import { Device, DeviceMaster } from "./schema"
import { useRouter } from "next/navigation"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

const DeviceMasterActions = ({ deviceMaster, onEdit, onDelete }: { deviceMaster: DeviceMaster, onEdit: (master: DeviceMaster) => void, onDelete: (id: string) => void }) => {

    return (
        <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(deviceMaster)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the device type {deviceMaster.deviceType}.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(String(deviceMaster.id))} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

const DeviceActions = ({ device, onEdit, onDelete, onPrintWelcomeKit }: { 
    device: Device, 
    onEdit: (device: Device) => void, 
    onDelete: (id: string) => void,
    onPrintWelcomeKit?: (device: Device) => void
}) => {
    const router = useRouter()

    const handlePrint = () => {
        if (onPrintWelcomeKit) {
            onPrintWelcomeKit(device);
        } else {
            window.print();
        }
    }

    return (
        <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(`/devices/${device.id}`)}><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(device)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print Welcome Kit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the device {device.deviceName}.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(String(device.id))} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}


export const deviceMasterColumns = (onEdit: (master: DeviceMaster) => void, onDelete: (id: string) => void, onRefresh?: () => void): ColumnDef<DeviceMaster>[] => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "deviceType",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Device Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
        accessorKey: "btServe",
        header: "BT Serve"
    },
    {
        accessorKey: "btChar",
        header: "BT Char"
    },
    {
        accessorKey: "soundBtName",
        header: "Sound BT Name"
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const id = String(row.original.id)
            return (
              <StatusSwitch
                id={id}
                initialStatus={status as any}
                activeValue="active"
                inactiveValue="inactive"
                labelMap={{ active: 'Enabled', inactive: 'Disabled' }}
                onStatusChange={async (deviceMasterId, checked) => {
                  try {
                    const { updateData } = await import("@/lib/api-utils")
                    const newStatus = checked ? "active" : "inactive"
                    const m = row.original
                    await updateData(`/device-masters/${deviceMasterId}`, {
                      deviceType: m.deviceType,
                      btServe: m.btServe,
                      btChar: m.btChar,
                      soundBtName: m.soundBtName,
                      status: newStatus,
                    })
                    // Trigger refresh after successful update
                    if (onRefresh) {
                      onRefresh()
                    }
                    return { success: true, message: `Type status set to ${newStatus}` }
                  } catch (e: any) {
                    return { success: false, message: e?.message || "Failed to update status" }
                  }
                }}
              onLocalUpdate={(checked) => {
                row.original.status = checked ? 'active' as any : 'inactive' as any
              }}
              />
            )
        }
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          return (
            <div className="text-right">
                <DeviceMasterActions deviceMaster={row.original} onEdit={onEdit} onDelete={onDelete} />
            </div>
          )
        },
      },
]


export const columns = (onEdit: (device: Device) => void, onDelete: (id: string) => void, onRefresh?: () => void, onPrintWelcomeKit?: (device: Device) => void): ColumnDef<Device>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "deviceName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Device Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "userId",
    header: "User ID/Password",
    cell: ({ row }) => {
        const userId = row.getValue("userId") as string;
        const userName = (row.original as any).userName;
        const userEmail = (row.original as any).userEmail;
        
        if (!userId || userId === 'unassigned' || userId === 'null') {
            return (
                <div className="flex items-center">
                    <span className="text-muted-foreground">Unassigned</span>
                </div>
            );
        }
        
        return (
            <div className="flex flex-col">
                <span className="font-medium">{userName || 'Unknown User'}</span>
                <span className="text-sm text-muted-foreground">{userEmail || `ID: ${userId}`}</span>
            </div>
        );
    }
  },
  {
    accessorKey: "deviceType",
    header: "Device Type"
  },
  {
    accessorKey: "macAddress",
    header: "MAC Address",
  },
  {
    accessorKey: "passcode",
    header: "Passcode"
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const id = String(row.original.id)
        return (
          <StatusSwitch
            id={id}
            initialStatus={status as any}
            activeValue="active"
            inactiveValue="disabled"
            labelMap={{ active: 'Enabled', disabled: 'Disabled' }}
            onStatusChange={async (deviceId, checked) => {
              try {
                const { updateData } = await import("@/lib/api-utils")
                const newStatus = checked ? "active" : "disabled"
                // Send full payload to satisfy backend update expectations
                const d = row.original
                await updateData(`/devices/${deviceId}`, {
                  device_name: d.deviceName ?? null,
                  mac_address: d.macAddress ?? null,
                  device_type: d.deviceType ?? null,
                  user_id: d.userId ?? null,
                  passcode: d.passcode ?? null,
                  status: newStatus,
                  bt_name: (d as any).btName ?? null,
                  warranty_start: (d as any).warrantyStart ?? null,
                  default_cmd: (d as any).defaultCmd ?? null,
                  first_connected_at: (d as any).firstConnectedAt ?? null,
                })
                // Trigger refresh after successful update
                if (onRefresh) {
                  onRefresh()
                }
                return { success: true, message: `Device status set to ${newStatus}` }
              } catch (e: any) {
                return { success: false, message: e?.message || "Failed to update device status" }
              }
            }}
          onLocalUpdate={(checked) => {
            row.original.status = checked ? 'active' as any : 'disabled' as any
          }}
          />
        )
    }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div className="text-right">
            <DeviceActions 
                device={row.original} 
                onEdit={onEdit} 
                onDelete={onDelete} 
                onPrintWelcomeKit={onPrintWelcomeKit}
            />
        </div>
      )
    },
  },
]
