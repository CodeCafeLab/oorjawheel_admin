
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Mail, MessageSquare, List, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { User } from "./schema"
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
import { deleteUser } from "@/actions/users"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const UserActions = ({ user, onEdit }: { user: User; onEdit: (user: User) => void }) => {
    const { toast } = useToast()
    const router = useRouter()
  
    const handleDelete = async () => {
      const result = await deleteUser(user.id.toString())
      if (result.success) {
        toast({
          title: "User Deleted",
          description: `User ${user.email} has been deleted.`,
        })
        router.refresh() // Refresh the page to show the updated list
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        })
      }
    }

    const handleSendEmail = () => {
        window.location.href = `mailto:${user.email}`;
    }

    const handleSendWhatsapp = () => {
        if (user.contactNumber) {
            // Basic cleanup of phone number
            const phoneNumber = user.contactNumber.replace(/[^0-9]/g, '');
            window.open(`https://wa.me/${phoneNumber}`, '_blank');
        } else {
            toast({
                variant: "destructive",
                title: "No Contact Number",
                description: "This user does not have a contact number.",
            })
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
            <DropdownMenuItem onClick={() => onEdit(user)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSendEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </DropdownMenuItem>
             <DropdownMenuItem onClick={handleSendWhatsapp}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Whatsapp
            </DropdownMenuItem>
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <List className="mr-2 h-4 w-4" />
                    Manage OW
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        {user.devicesAssigned && user.devicesAssigned.length > 0 ? (
                             user.devicesAssigned.map(device => <DropdownMenuItem key={device}>{device}</DropdownMenuItem>)
                        ): (
                            <DropdownMenuItem disabled>No devices assigned</DropdownMenuItem>
                        )}
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
             <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
             </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              for <span className="font-bold">{user.email}</span> and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

export const columns = (onEdit: (user: User) => void): ColumnDef<User>[] => [
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
    accessorKey: "fullName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Full Name
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
    accessorKey: "contactNumber",
    header: "Contact Number",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <Badge variant={status === 'active' ? 'default' : 'destructive'}>{status}</Badge>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <UserActions user={row.original} onEdit={onEdit} />
    },
  },
]
