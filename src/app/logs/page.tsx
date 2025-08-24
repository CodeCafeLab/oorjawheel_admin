"use client";

import * as React from "react";
import { eventColumns } from "./columns";
import { DataTable } from "./data-table";
import { api } from "@/lib/api-client";
import { DeviceEvent } from "./schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "./../../hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  const fetchDeviceEvents = async () => {
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
      console.log("API Response:", response);

      // Check if response.data exists and is an array
      if (!response.data || !Array.isArray(response.data)) {
        console.error(
          "Invalid response format - data is not an array:",
          response
        );
        throw new Error("Invalid response format from server");
      }

      // Transform data to match the DeviceEvent schema
      const transformedData = response.data.map((event: any) => {
        const transformed = {
          id: event.id.toString(),
          deviceId: event.device_id.toString(),
          device: `Device ${event.device_id}`,
          event: event.event,
          timestamp: event.timestamp,
          rawTimestamp: formatDate(event.timestamp),
        };
        console.log("Transformed event:", transformed);
        return transformed;
      });

      console.log("Setting device events:", transformedData);
      setDeviceEvents(transformedData);
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

  React.useEffect(() => {
    fetchDeviceEvents();
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDeviceEvents();
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/device-events/${id}`); // ✅ fixed endpoint
      await fetchDeviceEvents();
      return { success: true, data: { id } };
    } catch (error) {
      console.error("Error deleting event:", error);
      return { success: false, error };
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Device Events</CardTitle>
              <CardDescription>
                View and manage device connection events
              </CardDescription>
            </div>
            <form onSubmit={handleSearch} className="flex space-x-2">
              <Input
                placeholder="Search by device ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button type="submit" disabled={loading}>
                Search
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : (
            <DataTable<DeviceEvent, unknown>
              columns={eventColumns}
              data={deviceEvents}
              filterColumnId="device"
              filterPlaceholder="Search by device ID..."
              loading={loading}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
