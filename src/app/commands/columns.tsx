
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Command } from "./schema"
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

const CommandActions = ({ command, onEdit, onDelete }: { command: Command, onEdit: (command: Command) => void, onDelete: (id: string) => void }) => {
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
                    <DropdownMenuItem onClick={() => onEdit(command)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                    </AlertDialogTrigger>
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the command {command.id}.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(command.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export const columns = (onEdit: (command: Command) => void, onDelete: (id: string) => void): ColumnDef<Command>[] => [
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
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          ID
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      return (
        <div className="max-w-[80px] lg:max-w-[120px] truncate font-mono text-xs" title={id}>
          {id}
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: "device_id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          <span className="hidden sm:inline">Device ID</span>
          <span className="sm:hidden">Device</span>
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const deviceId = row.getValue("device_id") as string;
      return (
        <div className="max-w-[70px] lg:max-w-[100px] truncate font-mono text-xs" title={deviceId}>
          {deviceId}
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "command",
    header: "Command",
    cell: ({ row }) => {
      const command = row.getValue("command") as string;
      return (
        <div className="max-w-[120px] sm:max-w-[180px] lg:max-w-[250px] truncate font-mono text-xs" title={command}>
          {command}
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return <Badge variant={'outline'} className="capitalize text-xs px-1 py-0">{type}</Badge>
    },
    size: 80,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === 'active' ? 'default' : 'secondary';
        return <Badge variant={variant} className="capitalize text-xs px-1 py-0">{status}</Badge>
    },
    size: 80,
  },
  {
    accessorKey: "user_id",
    header: ({ column }) => {
      return (
        <div className="text-center">
          <span className="hidden lg:inline">User ID</span>
          <span className="lg:hidden">User</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const userId = row.getValue("user_id") as number | null;
      return (
        <div className="text-center text-xs">
          {userId ? userId.toString() : "—"}
        </div>
      );
    },
    size: 60,
  },
  {
    accessorKey: "sent_at",
    header: ({ column }) => {
      return (
        <div className="hidden md:block">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            <span className="hidden lg:inline">Sent At</span>
            <span className="lg:hidden">Date</span>
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const sentAt = row.getValue("sent_at") as string | null;
      return (
        <div className="hidden md:block max-w-[100px] lg:max-w-[140px] truncate text-xs" title={sentAt ? new Date(sentAt).toLocaleString() : "Not sent"}>
          {sentAt ? new Date(sentAt).toLocaleDateString() : "Not sent"}
        </div>
      );
    },
    size: 120,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      return (
        <div className="text-right">
            <CommandActions command={row.original} onEdit={onEdit} onDelete={onDelete} />
        </div>
      )
    },
    size: 70,
    enableSorting: false,
    enableHiding: false,
  },
]
