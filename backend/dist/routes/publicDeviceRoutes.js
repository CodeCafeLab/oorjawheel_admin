import { Router } from "express";
import { activateDevicePublic } from "../controllers/deviceController.js";
const router = Router();
// Public activation endpoint
router.post("/:id/activate", activateDevicePublic);
export default router;
