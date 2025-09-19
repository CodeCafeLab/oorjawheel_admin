import { getAll, getById, create, update, remove, } from "../models/commandLogModel.js";
export const getAllCommandLogs = async (req, res, next) => {
    try {
        const logs = await getAll();
        res.json(logs);
    }
    catch (err) {
        next(err);
    }
};
export const getCommandLogById = async (req, res, next) => {
    try {
        const log = await getById(req.params.id);
        if (!log)
            return res.status(404).json({ message: "Not found" });
        res.json(log);
    }
    catch (err) {
        next(err);
    }
};
export const createCommandLog = async (req, res, next) => {
    try {
        console.log('Controller received body:', JSON.stringify(req.body, null, 2));
        const log = await create(req.body);
        console.log('Successfully created log:', log);
        res.status(201).json(log);
    }
    catch (err) {
        console.error('Error in createCommandLog:', err.message);
        console.error('Stack trace:', err.stack);
        // Send detailed error response for debugging
        res.status(500).json({
            error: 'Internal Server Error',
            message: err.message,
            details: err.stack
        });
    }
};
export const updateCommandLog = async (req, res, next) => {
    try {
        const log = await update(req.params.id, req.body);
        res.json(log);
    }
    catch (err) {
        next(err);
    }
};
export const deleteCommandLog = async (req, res, next) => {
    try {
        await remove(req.params.id);
        res.json({ message: "Deleted" });
    }
    catch (err) {
        next(err);
    }
};
