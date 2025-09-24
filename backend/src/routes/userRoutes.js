import { Router } from "express";
import {
  getUsers,
  addUser,
  getUser,
  editUser,
  removeUser,
  getUserDevices,
} from "../controllers/userController.js";

const router = Router();

router.get("/", getUsers);
router.post("/", addUser);
router.get("/:id", getUser);
router.put("/:id", editUser);
router.delete("/:id", removeUser);
router.get("/:id/devices", getUserDevices);

export default router;
