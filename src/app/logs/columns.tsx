"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  ArrowUpDown,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { CommandLog, DeviceEvent } from "./schema";

export const commandColumns: ColumnDef<CommandLog>[] = [
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
    accessorKey: "device",
    header: "Device",
  },
  {
    accessorKey: "user",
    header: "User",
  },
  {
    accessorKey: "command",
    header: "Command",
    cell: ({ row }) => {
      return (
        <code className="font-mono text-sm">{row.getValue("command")}</code>
      );
    },
  },
  {
    accessorKey: "sentAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Sent At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("sentAt"));
      return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    },
  },
  {
    accessorKey: "result",
    header: "Result",
    cell: ({ row }) => {
      const result = row.getValue("result") as string;
      const isOk = result === "OK";
      return (
        <Badge
          variant={isOk ? "default" : "destructive"}
          className="capitalize items-center gap-1"
        >
          {isOk ? (
            <ShieldCheck className="h-3 w-3" />
          ) : (
            <ShieldX className="h-3 w-3" />
          )}
          {result}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: () => {
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>View Device Details</DropdownMenuItem>
              <DropdownMenuItem>View User Profile</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export const eventColumns: ColumnDef<DeviceEvent>[] = [
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
    accessorKey: "device",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Device
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const deviceName = row.original.device;
      const deviceId = row.original.deviceId;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{deviceName}</span>
          <span className="text-xs text-muted-foreground">ID: {deviceId}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "event",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Event Type
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const event = row.getValue("event") as string;
      const variant = {
        connect: "default",
        disconnect: "destructive",
        scan_fail: "outline",
      }[event] as
        | "default"
        | "destructive"
        | "outline"
        | "secondary"
        | null
        | undefined;

      const eventLabels = {
        connect: "Connected",
        disconnect: "Disconnected",
        scan_fail: "Scan Failed",
      };

      return (
        <Badge variant={variant} className="capitalize">
          {eventLabels[event as keyof typeof eventLabels] || event}
        </Badge>
      );
    },
    filterFn: (row: any, id: string, value: string[]) => {
      const rowValue = row.getValue(id) as string;
      return value.includes(rowValue);
    },
  },
  {
    accessorKey: "rawTimestamp",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Timestamp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const event = row.original;
      const timestamp = new Date(event.timestamp);
      const now = new Date();
      const diffInMs = now.getTime() - timestamp.getTime();
      const diffInMins = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMins / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      let timeAgo = "";
      if (diffInDays > 0) {
        timeAgo = `${diffInDays}d ago`;
      } else if (diffInHours > 0) {
        timeAgo = `${diffInHours}h ago`;
      } else {
        timeAgo = `${Math.max(1, diffInMins)}m ago`;
      }

      return (
        <div className="flex flex-col">
          <span>{timeAgo}</span>
          <span className="text-xs text-muted-foreground">
            {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
              timestamp
            )}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const event = row.original;
      // @ts-ignore - meta is not in the type definition
      const { handleEdit, handleDelete } = table.options.meta || {};

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(event.id)}
              >
                Copy Event ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleEdit?.(event.id, event)}
              >
                Edit Event
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete this event?')) {
                    await handleDelete?.(event.id);
                  }
                }}
              >
                Delete Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
