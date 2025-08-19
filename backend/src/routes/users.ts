import { Router } from "express";
import pool from "../config/db.js";
import bcrypt from "bcryptjs";

const router = Router();

// GET /users
router.get("/", async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const page = Number(req.query.page || "1");
    const limit = Number(req.query.limit || "50");
    const offset = (page - 1) * limit;

    let query = `SELECT SQL_CALC_FOUND_ROWS 
      u.id, u.fullName, u.email, u.contactNumber, u.address, u.country, u.status, u.first_login_at
      FROM users u WHERE 1=1`;
    const params: any[] = [];
    if (status) {
      query += " AND u.status = ?";
      params.push(status);
    }
    if (search) {
      query += " AND (u.fullName LIKE ? OR u.email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    query += " ORDER BY u.created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(query, params);
      const [countRows] = await conn.query("SELECT FOUND_ROWS() as total");
      const total = (countRows as any[])[0]?.total ?? 0;
      res.json({ data: rows, page, limit, total });
    } finally {
      conn.release();
    }
  } catch (e) {
    next(e);
  }
});

// POST /users
router.post("/", async (req, res, next) => {
  try {
    const b = req.body;
    const conn = await pool.getConnection();
    try {
      const [existing] = await conn.execute(
        "SELECT id FROM users WHERE email = ?",
        [b.email]
      );
      if ((existing as any[]).length > 0)
        return res.status(409).json({ error: "Email exists" });

      let passwordHash: string | null = null;
      if (b.password) {
        const salt = await bcrypt.genSalt(10);
        passwordHash = await bcrypt.hash(b.password, salt);
      } else if (b.password_hash) {
        passwordHash = b.password_hash;
      }

      const [result] = await conn.execute(
        "INSERT INTO users (fullName, email, contactNumber, address, country, status, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
        [
          b.fullName,
          b.email,
          b.contactNumber,
          b.address,
          b.country,
          b.status || "active",
          passwordHash,
        ]
      );
      res
        .status(201)
        .json({ message: "Created", id: (result as any).insertId });
    } finally {
      conn.release();
    }
  } catch (e) {
    next(e);
  }
});

// GET /users/:id
router.get("/:id", async (req, res, next) => {
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute("SELECT * FROM users WHERE id = ?", [
        req.params.id,
      ]);
      if ((rows as any[]).length === 0)
        return res.status(404).json({ error: "Not found" });
      res.json((rows as any[])[0]);
    } finally {
      conn.release();
    }
  } catch (e) {
    next(e);
  }
});

// PUT /users/:id
router.put("/:id", async (req, res, next) => {
  try {
    const b = req.body;
    const conn = await pool.getConnection();
    try {
      let query =
        "UPDATE users SET fullName = ?, email = ?, contactNumber = ?, address = ?, country = ?, status = ?";
      const params: any[] = [
        b.fullName,
        b.email,
        b.contactNumber,
        b.address,
        b.country,
        b.status || "active",
      ];
      if (b.password) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(b.password, salt);
        query += ", password_hash = ?";
        params.push(hashed);
      } else if (b.password_hash) {
        query += ", password_hash = ?";
        params.push(b.password_hash);
      }
      query += " WHERE id = ?";
      params.push(req.params.id);
      await conn.execute(query, params);
      res.json({ message: "Updated" });
    } finally {
      conn.release();
    }
  } catch (e) {
    next(e);
  }
});

// DELETE /users/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const conn = await pool.getConnection();
    try {
      await conn.execute("DELETE FROM users WHERE id = ?", [req.params.id]);
      res.json({ message: "Deleted" });
    } finally {
      conn.release();
    }
  } catch (e) {
    next(e);
  }
});

export default router;
