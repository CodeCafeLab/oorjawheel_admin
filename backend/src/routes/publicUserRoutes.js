import { Router } from "express";
import { addUser, updateUserPublic, assignDeviceToUserPublic } from "../controllers/userController.js";

const router = Router();

// Public endpoint to create a user (no authentication)
router.post("/", addUser);
router.put("/:id", updateUserPublic);
router.post("/:id/assign-device", assignDeviceToUserPublic);

export default router;


