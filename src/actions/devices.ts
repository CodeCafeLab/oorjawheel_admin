"use server";

import { z } from "zod";

const DeviceFormSchema = z.object({
  deviceName: z.string().min(1, "Device name is required"),
  macAddress: z
    .string()
    .regex(
      /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
      "Invalid MAC address format. Use format: 00:1A:2B:3C:4D:5E"
    ),
  deviceType: z.string().min(1, "Device type is required"),
  userId: z.string().optional().nullable(),
  passcode: z.string().min(6, "Passcode must be at least 6 characters"),
  status: z.enum(["never_used", "active", "disabled"]).default("never_used"),
  btName: z.string().optional(),
  warrantyStart: z.string().optional().nullable(),
  defaultCmd: z.string().optional(),
  firstConnectedAt: z.string().optional().nullable(),
});

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  total?: number;
}

interface PaginatedResponse<T> extends Omit<ApiResponse<T[]>, "data"> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

function isPaginatedResponse<T>(data: any): data is PaginatedResponse<T> {
  return (
    data &&
    Array.isArray(data.data) &&
    typeof data.total === "number" &&
    typeof data.page === "number" &&
    typeof data.limit === "number"
  );
}

function isApiResponse(data: any): data is ApiResponse {
  return (
    data &&
    (data.data !== undefined ||
      data.error !== undefined ||
      data.total !== undefined)
  );
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

  try {
    const response = await fetch(`${apiBase}${endpoint}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return { data, total: data.total };
  } catch (error: any) {
    console.error(`API request to ${endpoint} failed:`, error);
    return { error: error.message || "An error occurred" };
  }
}

export async function addDevice(values: z.infer<typeof DeviceFormSchema>) {
  try {
    const { data, error } = await apiRequest("/devices", {
      method: "POST",
      body: JSON.stringify(values),
    });

    if (error) {
      throw new Error(error);
    }

    return {
      success: true,
      message: "Device added successfully.",
      data,
    };
  } catch (error: any) {
    console.error("Add device error:", error);
    return {
      success: false,
      message: error.message || "Failed to add device. Please try again.",
    };
  }
}

export async function updateDevice(
  id: string,
  values: z.infer<typeof DeviceFormSchema>
) {
  try {
    const { data, error } = await apiRequest(`/devices/${id}`, {
      method: "PUT",
      body: JSON.stringify(values),
    });

    if (error) {
      throw new Error(error);
    }

    return {
      success: true,
      message: "Device updated successfully.",
      data,
    };
  } catch (error: any) {
    console.error("Update device error:", error);
    return {
      success: false,
      message: error.message || "Failed to update device. Please try again.",
    };
  }
}

export async function deleteDevice(id: string | number) {
  try {
    const { error } = await apiRequest(`/devices/${id}`, {
      method: "DELETE",
    });

    if (error) {
      throw new Error(error);
    }

    return {
      success: true,
      message: "Device deleted successfully.",
    };
  } catch (error: any) {
    console.error("Delete device error:", error);
    return {
      success: false,
      message: error.message || "Failed to delete device. Please try again.",
    };
  }
}

export async function fetchDevices(
  filters: {
    status?: string;
    deviceType?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  try {
    const queryParams = new URLSearchParams();

    if (filters.status) queryParams.append("status", filters.status);
    if (filters.deviceType)
      queryParams.append("deviceType", filters.deviceType);
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());

    const { data, error } = await apiRequest(
      `/devices?${queryParams.toString()}`
    );

    if (error) {
      throw new Error(error);
    }

    if (Array.isArray(data)) return data;
    if (isPaginatedResponse(data)) return data.data;
    if (isApiResponse(data) && Array.isArray(data.data)) return data.data;
    return [];
  } catch (error) {
    console.error("Fetch devices error:", error);
    return [];
  }
}

interface DeviceFilters {
  status?: string;
  deviceType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getTotalDeviceCount(filters: DeviceFilters = {}) {
  try {
    const queryParams = new URLSearchParams();

    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.deviceType)
      queryParams.append("deviceType", filters.deviceType);
    if (filters?.search) queryParams.append("search", filters.search);
    queryParams.append("page", "1");
    queryParams.append("limit", "1");

    const { data, error } = await apiRequest(
      `/devices?${queryParams.toString()}`
    );

    if (error) {
      throw new Error(error);
    }

    if (isPaginatedResponse(data)) return data.total;
    if (isApiResponse(data) && typeof data.total === "number")
      return data.total;
    return 0;
  } catch (error) {
    console.error("Get device count error:", error);
    return 0;
  }
}

// ---- Device Masters ----

const DeviceMasterFormSchema = z.object({
  deviceType: z.string().min(1, "Device type is required"),
  btServe: z.string().min(1, "Bluetooth service UUID is required"),
  btChar: z.string().min(1, "Bluetooth characteristic UUID is required"),
  soundBtName: z.string().min(1, "Bluetooth name is required"),
  status: z.enum(["active", "inactive"]).default("active"),
});

export async function fetchDeviceMasters(
  filters: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  try {
    const queryParams = new URLSearchParams();

    if (filters.status) queryParams.append("status", filters.status);
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());

    const { data, error } = await apiRequest(
      `/device-masters?${queryParams.toString()}`
    );

    if (error) {
      throw new Error(error);
    }

    if (Array.isArray(data)) return data;
    if (isPaginatedResponse(data)) return data.data;
    if (isApiResponse(data) && Array.isArray(data.data)) return data.data;
    return [];
  } catch (error) {
    console.error("Fetch device masters error:", error);
    return [];
  }
}

export async function addDeviceMaster(
  values: z.infer<typeof DeviceMasterFormSchema>
) {
  try {
    const { data, error } = await apiRequest("/device-masters", {
      method: "POST",
      body: JSON.stringify(values),
    });

    if (error) {
      throw new Error(error);
    }

    return {
      success: true,
      message: "Device type added successfully.",
      data,
    };
  } catch (error: any) {
    console.error("Add device master error:", error);
    return {
      success: false,
      message: error.message || "Failed to add device type. Please try again.",
    };
  }
}

export async function updateDeviceMaster(
  id: string | number,
  values: z.infer<typeof DeviceMasterFormSchema>
) {
  try {
    const { data, error } = await apiRequest(`/device-masters/${id}`, {
      method: "PUT",
      body: JSON.stringify(values),
    });

    if (error) {
      throw new Error(error);
    }

    return {
      success: true,
      message: "Device type updated successfully.",
      data,
    };
  } catch (error: any) {
    console.error("Update device master error:", error);
    return {
      success: false,
      message:
        error.message || "Failed to update device type. Please try again.",
    };
  }
}

export async function deleteDeviceMaster(id: string | number) {
  try {
    const { error } = await apiRequest(`/device-masters/${id}`, {
      method: "DELETE",
    });

    if (error) {
      throw new Error(error);
    }

    return {
      success: true,
      message: "Device type deleted successfully.",
    };
  } catch (error: any) {
    console.error("Delete device master error:", error);
    return {
      success: false,
      message:
        error.message || "Failed to delete device type. Please try again.",
    };
  }
}

// ---- Bulk helpers ----

export async function bulkDeleteDevices(ids: string[]) {
  try {
    const { error } = await apiRequest("/devices/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    });

    if (error) {
      throw new Error(error);
    }

    return {
      success: true,
      message: "Selected devices deleted successfully.",
    };
  } catch (error: any) {
    console.error("Bulk delete devices error:", error);
    return {
      success: false,
      message:
        error.message || "Failed to delete selected devices. Please try again.",
    };
  }
}

export async function bulkDeleteDeviceMasters(ids: string[]) {
  try {
    const { error } = await apiRequest("/device-masters/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    });

    if (error) {
      throw new Error(error);
    }

    return {
      success: true,
      message: "Selected device types deleted successfully.",
    };
  } catch (error: any) {
    console.error("Bulk delete device masters error:", error);
    return {
      success: false,
      message:
        error.message ||
        "Failed to delete selected device types. Please try again.",
    };
  }
}
