import {
  getDevices,
  createDevice,
  getDeviceById,
  updateDevice,
  deleteDevice,
} from "../models/deviceModel.js";

export async function listDevices(req, res, next) {
  try {
    const status = req.query.status;
    const device_type = req.query.deviceType || req.query.device_type;
    const search = req.query.search;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 50);

    const result = await getDevices({
      status,
      device_type,
      search,
      page,
      limit,
    });
    
    // Return data in the expected format
    res.json({
      data: result,
      total: result.length,
      page,
      limit
    });
  } catch (err) {
    next(err);
  }
}

export async function addDevice(req, res, next) {
  try {
    const body = req.body;

    if (!body.device_name && !body.deviceName) {
      return res.status(400).json({ error: "device_name is required" });
    }

    const result = await createDevice({
      device_name: body.device_name || body.deviceName,
      mac_address: body.mac_address || body.macAddress,
      device_type: body.device_type || body.deviceType,
      user_id: body.user_id || body.userId || null,
      passcode: body.passcode ?? null,
      status: body.status ?? null,
      bt_name: body.bt_name ?? body.btName ?? null,
      warranty_start: body.warranty_start ?? body.warrantyStart ?? null,
      default_cmd: body.default_cmd ?? body.defaultCmd ?? null,
      first_connected_at:
        body.first_connected_at ?? body.firstConnectedAt ?? null,
    });

    res.status(201).json({ message: "Created", id: result.id });
  } catch (err) {
    next(err);
  }
}

export async function getDevice(req, res, next) {
  try {
    const device = await getDeviceById(req.params.id);
    if (!device) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(device);
  } catch (err) {
    next(err);
  }
}

export async function editDevice(req, res, next) {
  try {
    const body = req.body;

    await updateDevice(req.params.id, {
      device_name: body.device_name || body.deviceName,
      mac_address: body.mac_address || body.macAddress,
      device_type: body.device_type || body.deviceType,
      user_id: body.user_id || body.userId,
      passcode: body.passcode,
      status: body.status,
      bt_name: body.bt_name ?? body.btName ?? "",
      warranty_start: body.warranty_start || body.warrantyStart || null,
      default_cmd: body.default_cmd || body.defaultCmd || null,
      first_connected_at:
        body.first_connected_at || body.firstConnectedAt || null,
    });

    res.json({ message: "Updated" });
  } catch (err) {
    next(err);
  }
}

export async function removeDevice(req, res, next) {
  try {
    await deleteDevice(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
}

// Public: Activate device by setting warranty_start and first_connected_at
export async function activateDevicePublic(req, res, next) {
  try {
    const deviceId = Number(req.params.id);
    const body = req.body || {};

    const device = await getDeviceById(deviceId);
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    // Determine timestamps: prefer provided values, else preserve existing, else now
    const nowIso = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const warrantyStart = body.warranty_start || body.warrantyStart || device.warranty_start || nowIso;
    const firstConnectedAt = body.first_connected_at || body.firstConnectedAt || device.first_connected_at || nowIso;

    await updateDevice(device.id, {
      device_name: device.device_name,
      mac_address: device.mac_address,
      device_type: device.device_type,
      user_id: device.user_id,
      passcode: device.passcode,
      status: device.status,
      bt_name: device.bt_name,
      warranty_start: warrantyStart,
      default_cmd: device.default_cmd,
      first_connected_at: firstConnectedAt,
    });

    res.json({ message: "Activated", warranty_start: warrantyStart, first_connected_at: firstConnectedAt });
  } catch (err) {
    next(err);
  }
}