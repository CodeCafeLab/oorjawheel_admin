import { Router } from "express";
import { addUser, updateUserPublic, assignDeviceToUserPublic, publicUserLogin, getUserPublic } from "../controllers/userController.js";

const router = Router();

// Public endpoint to create a user (no authentication)
router.post("/", addUser);
router.get("/:id", getUserPublic);
router.put("/:id", updateUserPublic);
router.post("/:id/assign-device", assignDeviceToUserPublic);
router.post("/login", publicUserLogin);

export default router;


