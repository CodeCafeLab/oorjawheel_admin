
"use client"

import { useState, useEffect } from "react"
import { getMessagingToken } from "@/firebase"
import { Button } from "@/components/ui/button"
import { PlusCircle, Bell, Users, Send, Clock } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { NotificationForm } from "./notification-form"
import { Notification, User } from "./schema"
import {
  getNotifications,
  getUsers,
  getNotificationStats,
  createNotification,
  updateNotification,
  deleteNotification,
  sendNotification,
  bulkDeleteNotifications,
} from "@/actions/notifications"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fcmToken, setFcmToken] = useState<string>('')
  const { toast } = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      const [notificationsData, usersData, statsData] = await Promise.all([
        getNotifications({ page: 1, limit: 1000 }),
        getUsers(),
        getNotificationStats(),
      ])
      
      setNotifications(notificationsData.data)
      setUsers(usersData)
      setStats(statsData)
    } catch (error) {
      console.error("Failed to load data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load notifications data",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    
    // Get FCM token for sending notifications
    const getToken = async () => {
      try {
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        if (vapidKey) {
          const token = await getMessagingToken(vapidKey)
          if (token) {
            setFcmToken(token)
          }
        }
      } catch (error) {
        console.error('Failed to get FCM token:', error)
      }
    }
    
    getToken()
  }, [])

  const handleEdit = (notification: Notification) => {
    setSelectedNotification(notification)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteNotification(id)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        loadData()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete notification",
      })
    }
  }

  const handleSend = async (id: string) => {
    try {
      if (!fcmToken) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "FCM token not available. Please refresh the page and allow notifications.",
        })
        return
      }
      
      const result = await sendNotification(id, fcmToken)
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        loadData()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        })
      }
    } catch (error) {
      console.error('Send notification error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send notification",
      })
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const result = await bulkDeleteNotifications(ids)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        loadData()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete notifications",
      })
    }
  }

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true)
      const result = selectedNotification
        ? await updateNotification(selectedNotification.id, data, fcmToken)
        : await createNotification(data, fcmToken)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        setIsFormOpen(false)
        setSelectedNotification(null)
        loadData()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save notification",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setSelectedNotification(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline">Notifications</h1>
          <p className="text-muted-foreground">
            Manage and send notifications to users.
          </p>
        </div>
        <Sheet open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen)
          if (!isOpen) {
            setSelectedNotification(null)
          }
        }}>
          <SheetTrigger asChild>
            <Button onClick={() => setSelectedNotification(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Notification
            </Button>
          </SheetTrigger>
          <SheetContent className="md:max-w-2xl">
            <SheetHeader>
              <SheetTitle>
                {selectedNotification ? "Edit Notification" : "Create New Notification"}
              </SheetTitle>
              <SheetDescription>
                {selectedNotification 
                  ? "Update the notification details below."
                  : "Fill in the details to create a new notification."
                }
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-full">
              <div className="p-6">
                <NotificationForm
                  notification={selectedNotification}
                  users={users}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                  isLoading={isSubmitting}
                />
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scheduled}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draft}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>
            Manage your notifications and their delivery status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <DataTable
              columns={columns({ onEdit: handleEdit, onDelete: handleDelete, onSend: handleSend })}
              data={notifications}
              onBulkDelete={handleBulkDelete}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
              <p className="text-muted-foreground text-center mb-4">
                Get started by creating your first notification.
              </p>
              <Button onClick={() => setIsFormOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Notification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
