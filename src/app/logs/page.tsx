"use client";

import * as React from "react";
import { eventColumns } from "./columns";
import { DataTable } from "./data-table";
import { DeviceEvent } from "./schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, RefreshCw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { EventForm } from "./event-form";
import {
  deleteDeviceEvent,
  addDeviceEvent,
  fetchDeviceEvent,
  updateDeviceEvent,
} from "@/actions/events";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

// Helper to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

export default function DeviceEventsPage() {
  const [deviceEvents, setDeviceEvents] = React.useState<DeviceEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isSheetOpen, setSheetOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<DeviceEvent | null>(
    null
  );

  const fetchDeviceEvents = async (): Promise<DeviceEvent[] | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${API_BASE}/device-events`);

      if (searchTerm) {
        url.searchParams.append("deviceId", searchTerm);
      }

      const res = await fetch(url.toString(), {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch device events");
      }

      const response = await res.json();

      const eventsData = Array.isArray(response) ? response : response.data;

      if (!Array.isArray(eventsData)) {
        console.error("Invalid response format - expected an array:", response);
        throw new Error(
          "Invalid response format from server - expected an array of events"
        );
      }

      const transformedData = eventsData.map((event: any) => ({
        id: event.id.toString(),
        deviceId: event.device_id?.toString() || "unknown",
        device: `Device ${event.device_id || "unknown"}`,
        event: event.event || "unknown",
        timestamp: event.timestamp || new Date().toISOString(),
        rawTimestamp: formatDate(event.timestamp || new Date().toISOString()),
      }));

      setDeviceEvents(transformedData);
      return transformedData;
    } catch (err) {
      console.error("Error fetching device events:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      toast({
        title: "Error",
        description: "Failed to load device events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const events = await fetchDeviceEvents();
      if (events) {
        setDeviceEvents(events);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: "Failed to load device events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    refreshEvents();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refreshEvents();
  };

  const handleEdit = (eventToEdit: DeviceEvent) => {
    setSelectedEvent(eventToEdit);
    setSheetOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    try {
      const result = await deleteDeviceEvent(id);
      if (result.success) {
        toast({
          title: "Event Deleted",
          description: result.message || "The device event has been deleted.",
        });
        await refreshEvents();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to delete the device event.",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const handleFormSuccess = () => {
    setSheetOpen(false);
    setSelectedEvent(null);
    refreshEvents();
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-headline">Device Events</h1>
                <p className="text-muted-foreground">
                  View and manage device connection events.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <form onSubmit={handleSearch} className="flex space-x-2 flex-grow">
                  <Input
                    placeholder="Search by device ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm flex-grow"
                  />
                  <Button type="submit" disabled={loading} variant="secondary">
                    Search
                  </Button>
                </form>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={refreshEvents}
                    disabled={loading}
                    variant="outline"
                  >
                    <RefreshCw
                      className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                    {loading ? "Refreshing..." : "Refresh"}
                  </Button>
                  <Sheet
                    open={isSheetOpen}
                    onOpenChange={(isOpen) => {
                      setSheetOpen(isOpen);
                      if (!isOpen) setSelectedEvent(null);
                    }}
                  >
                    <SheetTrigger asChild>
                      <Button
                        onClick={() => {
                          setSelectedEvent(null);
                          setSheetOpen(true);
                        }}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Event
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>
                          {selectedEvent
                            ? "Edit Device Event"
                            : "Add New Device Event"}
                        </SheetTitle>
                        <SheetDescription>
                          Fill in the details for the device event.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-4">
                        <EventForm
                          onFormSuccess={handleFormSuccess}
                          event={selectedEvent}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-500 text-center py-4">
              <p>Error loading device events: {error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={refreshEvents}
                disabled={loading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Retrying..." : "Retry"}
              </Button>
            </div>
          ) : !loading && deviceEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No device events found.
              </p>
              <Button variant="outline" onClick={refreshEvents}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          ) : (
            <DataTable<DeviceEvent, unknown>
              columns={eventColumns}
              data={deviceEvents}
              onEdit={handleEdit}
              onDelete={handleDelete}
              filterColumnId="device"
              filterPlaceholder="Search by device ID..."
              loading={loading}
              enablePagination={true}
              pageSizeOptions={[5, 10, 20]}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}