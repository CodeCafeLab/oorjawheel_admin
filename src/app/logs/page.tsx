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

// Define a local interface for creating/updating an event
interface DeviceEventData {
  id?: string;
  device: string;
  event: "connect" | "disconnect" | "scan_fail";
  timestamp: string;
}

// Generic fetcher
async function getDeviceEvents(
  action: "GET" | "POST" | "PUT" = "GET",
  eventData?: DeviceEventData
): Promise<DeviceEvent[]> {
  const apiUrl = "/api/device-events";
  let response;

  try {
    if (action === "PUT" && eventData?.id) {
      response = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
    } else if (action === "POST" && eventData) {
      response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
    } else {
      response = await fetch(apiUrl, { method: "GET" });
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (e) {
    console.error("Failed to fetch device events", e);
    return [];
  }
}

export default function DeviceEventsPage() {
  const [deviceEvents, setDeviceEvents] = React.useState<DeviceEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setError(null);
      try {
        const events = await getDeviceEvents("GET");
        setDeviceEvents(events);
      } catch {
        setError("Unable to load device events.");
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline">Command & Event Logs</h1>
          <p className="text-muted-foreground">
            Review device connection and scanning events.
          </p>
        </div>
      </div>

      {/* Device Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Device Events</CardTitle>
          <CardDescription>
            Connection and scanning event history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <p className="text-muted-foreground">Loading events...</p>
          )}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <DataTable
              columns={eventColumns}
              data={deviceEvents}
              filterColumnId="device"
              filterPlaceholder="Filter by device..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
