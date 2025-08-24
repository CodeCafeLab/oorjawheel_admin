import {
  getDeviceEvents,
  createDeviceEvent,
  getDeviceEventById,
  getDeviceEventsByDevice,
  deleteDeviceEvent
} from '../models/deviceEventModel.js';

export async function listDeviceEvents(req, res, next) {
  try {
    const { deviceId, event, startDate, endDate } = req.query;

    const filters = {
      deviceId: deviceId || null,
      event: event || null,
      startDate: startDate || null,
      endDate: endDate || null
    };

    const events = await getDeviceEvents(filters);

    res.json({ data: events }); // ✅ always return data array
  } catch (err) {
    console.error("Error in listDeviceEvents:", err);
    next(err);
  }
}


export async function addDeviceEvent(req, res, next) {
  try {
    const { deviceId, event } = req.body;
    
    if (!deviceId || !event) {
      return res.status(400).json({ error: 'deviceId and event are required' });
    }

    if (!['connect', 'disconnect', 'scan_fail'].includes(event)) {
      return res.status(400).json({ error: 'Invalid event type' });
    }

    const result = await createDeviceEvent({ deviceId, event });
    res.status(201).json({ message: 'Event created', id: result.id });
  } catch (err) {
    next(err);
  }
}

export async function getDeviceEvent(req, res, next) {
  try {
    const event = await getDeviceEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    next(err);
  }
}

export async function getEventsByDevice(req, res, next) {
  try {
    const { deviceId } = req.params;
    const { limit = 50 } = req.query;
    
    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    const events = await getDeviceEventsByDevice(deviceId, limit);
    res.json(events);
  } catch (err) {
    next(err);
  }
}

export async function removeDeviceEvent(req, res, next) {
  try {
    const { id } = req.params;
    const result = await deleteDeviceEvent(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    next(err);
  }
}
