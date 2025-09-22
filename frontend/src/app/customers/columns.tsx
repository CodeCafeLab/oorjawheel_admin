
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
import { StatusSwitch } from "@/components/ui/status-switch"
import { Customer } from "./schema"
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

const CustomerActions = ({ customer, onEdit, onDelete }: { customer: Customer, onEdit: (customer: Customer) => void, onDelete: (id: string) => void }) => {

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
                <DropdownMenuItem onClick={() => onEdit(customer)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the customer "{customer.name}".
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(customer.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export const columns = (onEdit: (customer: Customer) => void, onDelete: (id: string) => void): ColumnDef<Customer>[] => [
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
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
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
            labelMap={{ active: 'Active', inactive: 'Inactive' }}
            onStatusChange={async (customerId, checked) => {
              try {
                const { updateData } = await import("@/lib/api-utils")
                const newStatus = checked ? "active" : "inactive"
                await updateData(`/customers/${customerId}`, { status: newStatus })
                return { success: true, message: `Customer status set to ${newStatus}` }
              } catch (e: any) {
                return { success: false, message: e?.message || "Failed to update customer status" }
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
    accessorKey: "totalSpent",
    header: ({ column }) => {
        return (
          <div className="text-right">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Total Spent
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
    },
    cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalSpent"))
        const formatted = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(amount)
   
        return <div className="text-right font-medium">{formatted}</div>
      },
  },
  {
    accessorKey: "orders",
    header: () => <div className="text-right">Orders</div>,
    cell: ({ row }) => {
      return <div className="text-right">{row.getValue("orders")}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
        return <CustomerActions customer={row.original} onEdit={onEdit} onDelete={onDelete} />
    },
  },
]
