import { getDeviceEvents, createDeviceEvent, getDeviceEventById, getDeviceEventsByDevice, deleteDeviceEvent } from '../models/deviceEventModel.js';
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
    }
    catch (err) {
        console.error("Error in listDeviceEvents:", err);
        next(err);
    }
}
export async function addDeviceEvent(req, res, next) {
    try {
        console.log('Received request body:', req.body);
        const { deviceId, event } = req.body;
        if (deviceId === undefined || event === undefined) {
            console.error('Missing required fields. DeviceId:', deviceId, 'Event:', event);
            return res.status(400).json({
                success: false,
                message: 'deviceId and event are required',
                received: { deviceId, event }
            });
        }
        if (!['connect', 'disconnect', 'scan_fail'].includes(event)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid event type. Must be one of: connect, disconnect, scan_fail',
                received: event
            });
        }
        // Ensure deviceId is a number
        const deviceIdNum = Number(deviceId);
        if (isNaN(deviceIdNum)) {
            return res.status(400).json({
                success: false,
                message: 'deviceId must be a number',
                received: deviceId
            });
        }
        console.log('Creating event with:', { deviceId: deviceIdNum, event });
        const result = await createDeviceEvent({
            deviceId: deviceIdNum,
            event
        });
        console.log('Event created successfully:', result);
        res.status(201).json({
            success: true,
            message: 'Event created',
            data: { id: result.id }
        });
    }
    catch (err) {
        console.error('Error in addDeviceEvent:', {
            message: err.message,
            stack: err.stack,
            name: err.name,
            ...(err.code && { code: err.code }),
            ...(err.sqlMessage && { sqlMessage: err.sqlMessage }),
            ...(err.sql && { sql: err.sql })
        });
        // Handle device not found error
        if (err.code === 'DEVICE_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                message: err.message,
                code: 'DEVICE_NOT_FOUND'
            });
        }
        // Handle foreign key constraint errors
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                success: false,
                message: 'Device not found. Please check the device ID and try again.',
                code: 'INVALID_DEVICE_ID'
            });
        }
        // Generic error response
        res.status(500).json({
            success: false,
            message: 'Failed to create device event',
            error: process.env.NODE_ENV === 'development' ? {
                message: err.message,
                ...(err.code && { code: err.code }),
                ...(err.sqlMessage && { sqlMessage: err.sqlMessage })
            } : undefined
        });
    }
}
export async function getDeviceEvent(req, res, next) {
    try {
        const event = await getDeviceEventById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(event);
    }
    catch (err) {
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
    }
    catch (err) {
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
    }
    catch (err) {
        next(err);
    }
}
