import { Router } from "express";
import { createCommandLog } from "../controllers/commandLogController.js";

const router = Router();

// Public endpoint to create command logs (manual or auto)
router.post("/", createCommandLog);

export default router;


