"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, Send, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Notification } from "./schema"
import { format, formatDistanceToNow } from "date-fns"
import { toZonedTime, fromZonedTime } from "date-fns-tz"

interface ColumnProps {
  onEdit: (notification: Notification) => void;
  onDelete: (id: string) => void;
  onSend: (id: string) => void;
}

export const columns = ({ onEdit, onDelete, onSend }: ColumnProps): ColumnDef<Notification>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const title = row.getValue("title") as string
      return (
        <div className="font-medium max-w-[200px] truncate" title={title}>
          {title}
        </div>
      )
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      const typeColors = {
        info: "bg-blue-100 text-blue-800",
        alert: "bg-red-100 text-red-800",
        promotion: "bg-purple-100 text-purple-800",
        warning: "bg-yellow-100 text-yellow-800",
        success: "bg-green-100 text-green-800",
      }
      return (
        <Badge className={typeColors[type as keyof typeof typeColors] || "bg-gray-100 text-gray-800"}>
          {type}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const statusColors = {
        draft: "bg-gray-100 text-gray-800",
        scheduled: "bg-blue-100 text-blue-800",
        sent: "bg-green-100 text-green-800",
        failed: "bg-red-100 text-red-800",
      }
      return (
        <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "user_name",
    header: "User",
    cell: ({ row }) => {
      const userName = row.getValue("user_name") as string
      const userEmail = row.original.user_email
      return (
        <div className="max-w-[150px]">
          {userName ? (
            <div>
              <div className="font-medium truncate" title={userName}>
                {userName}
              </div>
              {userEmail && (
                <div className="text-sm text-muted-foreground truncate" title={userEmail}>
                  {userEmail}
                </div>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">All Users</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "scheduled_at",
    header: "Scheduled",
    cell: ({ row }) => {
      const scheduledAt = row.getValue("scheduled_at") as string
      const status = row.original.status
      
      // For sent notifications without scheduled_at, show current IST time as "Immediate"
      if (!scheduledAt && status === 'sent') {
        const now = new Date()
        // Get current IST time properly
        const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}))
        
        return (
          <div className="text-sm">
            <div className="font-medium text-green-600">Immediate</div>
            <div className="text-muted-foreground">
              {format(istTime, "MMM dd, yyyy hh:mm a")} IST
            </div>
          </div>
        )
      }
      
      if (!scheduledAt) return <span className="text-muted-foreground">-</span>
      
      try {
        const date = new Date(scheduledAt)
        // Check if date is valid
        if (isNaN(date.getTime())) {
          return <span className="text-muted-foreground">Invalid date</span>
        }
        
        // Format in IST timezone
        const istDate = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}))
        
        return (
          <div className="text-sm">
            <div className="font-medium">
              {format(istDate, "MMM dd, yyyy")}
            </div>
            <div className="text-muted-foreground">
              {format(istDate, "hh:mm a")} IST
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {date > new Date() ? `in ${formatDistanceToNow(date)}` : `${formatDistanceToNow(date)} ago`}
            </div>
          </div>
        )
      } catch (error) {
        console.error("Date formatting error:", error, "Original value:", scheduledAt)
        return <span className="text-muted-foreground">Invalid date</span>
      }
    },
  },
  {
    accessorKey: "sent_at",
    header: "Sent At",
    cell: ({ row }) => {
      const sentAt = row.getValue("sent_at") as string
      if (!sentAt) return <span className="text-muted-foreground">-</span>
      
      try {
        const date = new Date(sentAt)
        if (isNaN(date.getTime())) {
          return <span className="text-muted-foreground">Invalid date</span>
        }
        
        // Format in IST timezone
        const istDate = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}))
        
        return (
          <div className="text-sm">
            <div className="font-medium">
              {format(istDate, "MMM dd, yyyy")}
            </div>
            <div className="text-muted-foreground">
              {format(istDate, "hh:mm a")} IST
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(date)} ago
            </div>
          </div>
        )
      } catch (error) {
        console.error("Sent date formatting error:", error, "Original value:", sentAt)
        return <span className="text-muted-foreground">Invalid date</span>
      }
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at") as string
      try {
        const date = new Date(createdAt)
        if (isNaN(date.getTime())) {
          return <span className="text-muted-foreground">Invalid date</span>
        }
        
        // Format in IST timezone
        const istDate = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}))
        
        return (
          <div className="text-sm">
            <div className="font-medium">
              {format(istDate, "MMM dd, yyyy")}
            </div>
            <div className="text-muted-foreground">
              {format(istDate, "hh:mm a")} IST
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(date)} ago
            </div>
          </div>
        )
      } catch (error) {
        console.error("Created date formatting error:", error, "Original value:", createdAt)
        return <span className="text-muted-foreground">Invalid date</span>
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const notification = row.original

      return (
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
              onClick={() => navigator.clipboard.writeText(notification.id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(notification)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {notification.status !== 'sent' && (
              <DropdownMenuItem onClick={() => onSend(notification.id)}>
                <Send className="mr-2 h-4 w-4" />
                Send
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(notification.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
