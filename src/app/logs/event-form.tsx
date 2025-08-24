
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import * as React from "react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { addDeviceEvent, updateDeviceEvent } from "@/actions/events"
import { DeviceEvent } from "./schema"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  deviceId: z.string().min(1, "Device ID is required."),
  device: z.string().min(1, "Device name is required."),
  event: z.enum(["connect", "disconnect", "scan_fail"]),
  timestamp: z.string().min(1, "Timestamp is required."),
});

type EventFormProps = {
    onFormSuccess: () => void;
    event?: DeviceEvent | null;
}

export function EventForm({ onFormSuccess, event }: EventFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const isEditMode = !!event;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceId: "",
      device: "Device ", // Default prefix for device name
      event: "connect",
      timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  })

  React.useEffect(() => {
    if (isEditMode && event) {
      form.reset({
        deviceId: event.deviceId,
        device: event.device,
        event: event.event,
        timestamp: format(new Date(event.timestamp), "yyyy-MM-dd'T'HH:mm"),
      });
    } else {
      form.reset({
        deviceId: "",
        device: "",
        event: "connect",
        timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      });
    }
  }, [event, isEditMode, form]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    console.log('=== Form Submitted ===');
    console.log('Form data:', JSON.stringify(data, null, 2));
    
    // Validate form data before proceeding
    if (!data.deviceId || !data.event) {
      console.error('Validation failed - missing required fields');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setLoading(true);
    console.log('Form validation passed, making API call...');

    try {
      // Ensure device name has the correct format
      const formData = {
        ...data,
        deviceId: data.deviceId.toString().trim(),
        device: data.device.startsWith('Device ') ? data.device : `Device ${data.deviceId}`,
      };

      console.log('Prepared form data:', JSON.stringify(formData, null, 2));
      console.log(isEditMode ? 'Updating event...' : 'Creating new event...');
      
      const apiCall = isEditMode && event
        ? updateDeviceEvent(event.id.toString(), formData)
        : addDeviceEvent(formData);
      
      console.log('API call initiated...');
      const result = await apiCall;
      console.log('API Response:', result);

      if (result?.success) {
        console.log('Event operation successful');
        toast({
          title: isEditMode ? "Event Updated" : "Event Added",
          description: `The device event has been ${isEditMode ? 'updated' : 'created'} successfully.`,
        });
        onFormSuccess();
      } else {
        const errorMessage = result?.message || 'Unknown error occurred';
        console.error('API Error:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to process the request',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="deviceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Device ID *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter device ID" 
                    {...field} 
                    disabled={loading} 
                    onChange={(e) => {
                      // Update device name when device ID changes
                      field.onChange(e);
                      if (!isEditMode) {
                        form.setValue('device', `Device ${e.target.value}`, { shouldValidate: true });
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="device"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Device Name *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter device name" 
                    {...field} 
                    disabled={loading} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="event"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Type *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="connect">Connect</SelectItem>
                  <SelectItem value="disconnect">Disconnect</SelectItem>
                  <SelectItem value="scan_fail">Scan Fail</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="timestamp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timestamp *</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Update Event' : 'Create Event'}
        </Button>
      </form>
    </Form>
  )
}
