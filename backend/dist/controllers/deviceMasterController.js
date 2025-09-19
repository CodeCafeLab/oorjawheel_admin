import { getDeviceMasters, createDeviceMaster, getDeviceMasterById, updateDeviceMaster, deleteDeviceMaster } from '../models/deviceMasterModel.js';
export async function listDeviceMasters(req, res, next) {
    try {
        const status = req.query.status;
        const search = req.query.search;
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 50);
        const result = await getDeviceMasters({ status, search, page, limit });
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
export async function addDeviceMaster(req, res, next) {
    try {
        const { deviceType, btServe, btChar, soundBtName, status } = req.body;
        if (!deviceType) {
            return res.status(400).json({ error: 'deviceType is required' });
        }
        const result = await createDeviceMaster({ deviceType, btServe, btChar, soundBtName, status });
        res.status(201).json({ message: 'Created', id: result.id });
    }
    catch (err) {
        next(err);
    }
}
export async function getDeviceMaster(req, res, next) {
    try {
        const deviceMaster = await getDeviceMasterById(req.params.id);
        if (!deviceMaster) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.json(deviceMaster);
    }
    catch (err) {
        next(err);
    }
}
export async function editDeviceMaster(req, res, next) {
    try {
        const { deviceType, btServe, btChar, soundBtName, status } = req.body;
        await updateDeviceMaster(req.params.id, { deviceType, btServe, btChar, soundBtName, status });
        res.json({ message: 'Updated' });
    }
    catch (err) {
        next(err);
    }
}
export async function removeDeviceMaster(req, res, next) {
    try {
        await deleteDeviceMaster(req.params.id);
        res.json({ message: 'Deleted' });
    }
    catch (err) {
        next(err);
    }
}
