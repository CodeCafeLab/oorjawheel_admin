import bcrypt from "bcryptjs";
import { listUsers, findUserByEmail, createUser, getUserById, updateUser, deleteUser, } from "../models/userModel.js";
export async function getUsers(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const status = req.query.status || undefined;
        const search = req.query.search || undefined;
        const users = await listUsers({ status, search, limit, offset, page });
        res.json(users);
    }
    catch (err) {
        console.error("Error in getUsers:", err);
        next(err);
    }
}
export async function addUser(req, res, next) {
    try {
        const body = req.body;
        const existing = await findUserByEmail(body.email);
        if (existing)
            return res.status(409).json({ error: "Email exists" });
        let passwordHash = null;
        if (body.password) {
            const salt = await bcrypt.genSalt(10);
            passwordHash = await bcrypt.hash(body.password, salt);
        }
        else if (body.password_hash) {
            passwordHash = body.password_hash;
        }
        const result = await createUser(body, passwordHash);
        res.status(201).json({ message: "Created", id: result.id });
    }
    catch (err) {
        next(err);
    }
}
export async function getUser(req, res, next) {
    try {
        const user = await getUserById(req.params.id);
        if (!user)
            return res.status(404).json({ error: "Not found" });
        res.json(user);
    }
    catch (err) {
        next(err);
    }
}
export async function editUser(req, res, next) {
    try {
        const body = req.body;
        let passwordHash = null;
        if (body.password) {
            const salt = await bcrypt.genSalt(10);
            passwordHash = await bcrypt.hash(body.password, salt);
        }
        else if (body.password_hash) {
            passwordHash = body.password_hash;
        }
        await updateUser(req.params.id, body, passwordHash);
        res.json({ message: "Updated" });
    }
    catch (err) {
        next(err);
    }
}
export async function removeUser(req, res, next) {
    try {
        await deleteUser(req.params.id);
        res.json({ message: "Deleted" });
    }
    catch (err) {
        next(err);
    }
}
