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
    res.json(result);
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
