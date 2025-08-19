import { getDeviceEvents, createDeviceEvent } from '../models/deviceEventModel.js';

export async function listDeviceEvents(req, res, next) {
  try {
    const deviceId = req.query.device_id;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 100);

    const result = await getDeviceEvents({ deviceId, page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function addDeviceEvent(req, res, next) {
  try {
    const { device_id, event, timestamp } = req.body;

    if (!device_id || !event) {
      return res.status(400).json({ error: 'device_id and event are required' });
    }

    const result = await createDeviceEvent({ device_id, event, timestamp });
    res.status(201).json({ message: 'Created', id: result.id });
  } catch (err) {
    next(err);
  }
}
