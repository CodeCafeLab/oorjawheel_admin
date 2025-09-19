import { Router } from 'express';
import { listDeviceEvents, addDeviceEvent, getDeviceEvent, getEventsByDevice, removeDeviceEvent } from '../controllers/deviceEventController.js';
const router = Router();
// Get all device events with optional filters
router.get('/', listDeviceEvents);
// Create a new device event
router.post('/', addDeviceEvent);
// Get a specific device event by ID
router.get('/:id', getDeviceEvent);
// Get all events for a specific device
router.get('/device/:deviceId', getEventsByDevice);
// Delete a device event
router.delete('/:id', removeDeviceEvent);
export default router;
