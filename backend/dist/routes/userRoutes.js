import { Router } from "express";
import { getUsers, addUser, getUser, editUser, removeUser, } from "../controllers/userController.js";
const router = Router();
router.get("/", getUsers);
router.post("/", addUser);
router.get("/:id", getUser);
router.put("/:id", editUser);
router.delete("/:id", removeUser);
export default router;
