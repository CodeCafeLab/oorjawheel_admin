import {
  getAll,
  getById,
  create,
  update,
  remove,
} from "../models/commandLogModel.js";

export const getAllCommandLogs = async (req, res, next) => {
  try {
    const logs = await getAll();
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

export const getCommandLogById = async (req, res, next) => {
  try {
    const log = await getById(req.params.id);
    if (!log) return res.status(404).json({ message: "Not found" });
    res.json(log);
  } catch (err) {
    next(err);
  }
};

export const createCommandLog = async (req, res, next) => {
  try {
    const log = await create(req.body);
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
};

export const updateCommandLog = async (req, res, next) => {
  try {
    const log = await update(req.params.id, req.body);
    res.json(log);
  } catch (err) {
    next(err);
  }
};

export const deleteCommandLog = async (req, res, next) => {
  try {
    await remove(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};
