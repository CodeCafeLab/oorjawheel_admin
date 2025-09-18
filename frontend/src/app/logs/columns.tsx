"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, ShieldCheck, ShieldX } from "lucide-react"
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
import { CommandLog, DeviceEvent } from "./schema"

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
        return <code className="font-mono text-sm">{row.getValue("command")}</code>
    }
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
      return new Intl.DateTimeFormat("en-IN", { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    },
  },
  {
    accessorKey: "result",
    header: "Result",
    cell: ({ row }) => {
        const result = row.getValue("result") as string;
        const isOk = result === 'OK';
        return <Badge variant={isOk ? 'default' : 'destructive'} className="capitalize items-center gap-1">
            {isOk ? <ShieldCheck className="h-3 w-3" /> : <ShieldX className="h-3 w-3" />}
            {result}
        </Badge>
    }
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
      )
    },
  },
]

export const eventColumns: ColumnDef<DeviceEvent>[] = [
    {
      accessorKey: "device",
      header: "Device",
    },
    {
      accessorKey: "event",
      header: "Event",
      cell: ({ row }) => {
        const event = row.getValue("event") as string;
        const variant: "default" | "secondary" | "destructive" = 
            event === 'connect' ? 'default' :
            event === 'disconnect' ? 'secondary' :
            'destructive';
        return <Badge variant={variant} className="capitalize">{event.replace('_', ' ')}</Badge>
    }
    },
    {
      accessorKey: "timestamp",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Timestamp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("timestamp"));
        return <div className="text-left">{new Intl.DateTimeFormat("en-IN", { dateStyle: 'medium', timeStyle: 'short' }).format(date)}</div>;
      },
    },
  ]
