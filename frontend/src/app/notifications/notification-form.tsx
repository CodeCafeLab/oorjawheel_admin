"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { toZonedTime } from "date-fns-tz"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Notification, User } from "./schema"
import { useToast } from "@/hooks/use-toast"

interface NotificationFormProps {
  notification?: Notification | null
  users: User[]
  onSubmit: (data: any) => void
  onCancel: () => void
  isLoading?: boolean
}

export function NotificationForm({ 
  notification, 
  users, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: NotificationFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    user_id: "all",
    image_url: "",
    type: "info" as 'info' | 'alert' | 'promotion' | 'warning' | 'success',
    status: "draft" as 'draft' | 'scheduled' | 'sent' | 'failed',
    scheduled_at: "",
    schedule_immediately: false,
  })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (notification) {
      const scheduledDate = notification.scheduled_at ? new Date(notification.scheduled_at) : undefined
      setFormData({
        title: notification.title || "",
        description: notification.description || "",
        user_id: notification.user_id ? notification.user_id.toString() : "all",
        image_url: notification.image_url || "",
        type: (notification.type as 'info' | 'alert' | 'promotion' | 'warning' | 'success') || "info",
        status: (notification.status as 'draft' | 'scheduled' | 'sent' | 'failed') || "draft",
        scheduled_at: notification.scheduled_at || "",
        schedule_immediately: !notification.scheduled_at && notification.status === 'sent',
      })
      setSelectedDate(scheduledDate)
      setSelectedTime(scheduledDate ? format(scheduledDate, "HH:mm") : "")
    } else {
      // Reset form for new notification
      setFormData({
        title: "",
        description: "",
        user_id: "all",
        image_url: "",
        type: "info",
        status: "draft",
        scheduled_at: "",
        schedule_immediately: false,
      })
      setSelectedDate(undefined)
      setSelectedTime("")
    }
  }, [notification])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Title is required",
      })
      return
    }

    // Combine date and time for scheduled_at
    let scheduledDateTime = undefined
    if (!formData.schedule_immediately && selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':')
      const combinedDate = new Date(selectedDate)
      combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      scheduledDateTime = combinedDate.toISOString()
    }

    // Prepare the data for submission
    const submitData = {
      title: formData.title.trim(),
      description: formData.description?.trim() || null,
      user_id: formData.user_id && formData.user_id !== "all" ? parseInt(formData.user_id) : null,
      image_url: formData.image_url?.trim() || null,
      type: formData.type || 'info',
      status: formData.schedule_immediately ? 'sent' : (scheduledDateTime ? 'scheduled' : 'draft'),
      scheduled_at: formData.schedule_immediately ? null : scheduledDateTime,
    }

    onSubmit(submitData)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {notification ? "Edit Notification" : "Create New Notification"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter notification title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                  <SelectItem value="promotion">Promotion</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter notification description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user_id">Target User</Label>
              <Select
                value={formData.user_id}
                onValueChange={(value) => handleInputChange("user_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.fullName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => handleInputChange("image_url", e.target.value)}
              placeholder="Enter image URL (optional)"
              type="url"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="schedule_immediately"
                checked={formData.schedule_immediately}
                onCheckedChange={(checked) => {
                  handleInputChange("schedule_immediately", !!checked);
                  if (checked) {
                    setSelectedDate(undefined);
                    setSelectedTime("");
                  }
                }}
              />
              <Label htmlFor="schedule_immediately" className="text-sm font-medium">
                Send immediately
              </Label>
            </div>

            {!formData.schedule_immediately && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Schedule Date & Time</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date Picker */}
                    <div className="space-y-2">
                      <Label htmlFor="date-picker" className="text-sm font-medium">
                        Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              setSelectedDate(date)
                            }}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Time Picker */}
                    <div className="space-y-2">
                      <Label htmlFor="time-picker" className="text-sm font-medium">
                        Time
                      </Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="time-picker"
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="pl-10"
                          placeholder="Select time"
                        />
                      </div>
                      {/* Quick time options */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const now = new Date();
                            setSelectedTime(format(now, "HH:mm"));
                          }}
                          className="text-xs"
                        >
                          Now
                        </Button>
                        {['09:00', '12:00', '15:00', '18:00', '21:00'].map((time) => (
                          <Button
                            key={time}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTime(time)}
                            className={`text-xs ${selectedTime === time ? 'bg-primary text-primary-foreground' : ''}`}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                 {/* Preview and Clear */}
                 {selectedDate && selectedTime && (
                   <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                     <div className="flex items-center justify-between">
                       <p className="text-sm text-green-800">
                         <strong>Scheduled for:</strong> {format(selectedDate, "PPP")} at {(() => {
                           try {
                             const [hours, minutes] = selectedTime.split(':')
                             const hour = parseInt(hours)
                             const minute = parseInt(minutes)
                             const date = new Date(selectedDate)
                             date.setHours(hour, minute)
                             const istDate = toZonedTime(date, 'Asia/Kolkata')
                             return format(istDate, "hh:mm a") + " IST"
                           } catch {
                             return selectedTime + " IST"
                           }
                         })()}
                       </p>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => {
                           setSelectedDate(undefined);
                           setSelectedTime("");
                         }}
                         className="text-green-600 hover:text-green-800"
                       >
                         Clear
                       </Button>
                     </div>
                   </div>
                 )}

                <p className="text-xs text-muted-foreground">
                  Leave date and time empty to save as draft
                </p>
              </div>
            )}

            {formData.schedule_immediately && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  This notification will be sent immediately upon creation.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : notification ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
