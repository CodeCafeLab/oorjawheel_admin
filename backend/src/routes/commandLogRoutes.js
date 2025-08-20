import express from "express";
import {
  getAllCommandLogs,
  getCommandLogById,
  createCommandLog,
  updateCommandLog,
  deleteCommandLog,
} from "../controllers/commandLogController.js";

const router = express.Router();

router.get("/", getAllCommandLogs);
router.get("/:id", getCommandLogById);
router.post("/", createCommandLog);
router.put("/:id", updateCommandLog);
router.delete("/:id", deleteCommandLog);

export default router;
