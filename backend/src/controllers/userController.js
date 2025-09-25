import bcrypt from "bcryptjs";
import {
  listUsers,
  findUserByEmail,
  getUserByEmail,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} from "../models/userModel.js";
import { getDevicesByUserId, getDeviceById, getDeviceByPasscode, updateDevice } from "../models/deviceModel.js";

export async function getUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status || undefined;
    const search = req.query.search || undefined;

    const users = await listUsers({ status, search, limit, offset, page });
    res.json(users);
  } catch (err) {
    console.error("Error in getUsers:", err);
    next(err);
  }
}

export async function addUser(req, res, next) {
  try {
    const body = req.body;

    const existing = await findUserByEmail(body.email);
    if (existing) return res.status(409).json({ error: "Email exists" });

    let passwordHash = null;
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(body.password, salt);
    } else if (body.password_hash) {
      passwordHash = body.password_hash;
    }

    const result = await createUser(body, passwordHash);
    res.status(201).json({ message: "Created", id: result.id });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// Public-safe user fetch: limited fields only
export async function getUserPublic(req, res, next) {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    const { id, fullName, email, contactNumber, address, country, status, created_at, first_login_at } = user;
    res.json({ id, fullName, email, contactNumber, address, country, status, created_at, first_login_at });
  } catch (err) {
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
    } else if (body.password_hash) {
      passwordHash = body.password_hash;
    }

    await updateUser(req.params.id, body, passwordHash);
    res.json({ message: "Updated" });
  } catch (err) {
    next(err);
  }
}

// Public-safe update: prevents changing email
export async function updateUserPublic(req, res, next) {
  try {
    const userId = req.params.id;
    const body = req.body || {};

    const existing = await getUserById(userId);
    if (!existing) return res.status(404).json({ error: "Not found" });

    // Disallow changing email explicitly
    if (typeof body.email !== "undefined" && body.email !== existing.email) {
      return res.status(400).json({ error: "Email cannot be changed" });
    }

    // Build a complete updates object to avoid undefined bind params
    const updates = {
      fullName: typeof body.fullName !== "undefined" ? body.fullName : existing.fullName,
      email: existing.email,
      contactNumber: typeof body.contactNumber !== "undefined" ? body.contactNumber : existing.contactNumber,
      address: typeof body.address !== "undefined" ? body.address : existing.address,
      country: typeof body.country !== "undefined" ? body.country : existing.country,
      status: typeof body.status !== "undefined" ? body.status : (existing.status || "active"),
    };

    let passwordHash = null;
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(body.password, salt);
    } else if (body.password_hash) {
      passwordHash = body.password_hash;
    }

    await updateUser(userId, updates, passwordHash);
    res.json({ message: "Updated" });
  } catch (err) {
    next(err);
  }
}

// Assign a device to a user (public endpoint)
export async function assignDeviceToUserPublic(req, res, next) {
  try {
    const userId = Number(req.params.id);
    const { deviceId, passcode } = req.body || {};
    if (!deviceId && !passcode) {
      return res.status(400).json({ error: "passcode is required" });
    }

    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const device = deviceId ? await getDeviceById(deviceId) : await getDeviceByPasscode(passcode);
    if (!device) return res.status(404).json({ error: "Device not found" });

    // If already assigned to this user, respond idempotently
    const currentAssignedUserId = Number(device.user_id) || null;
    if (currentAssignedUserId === userId) {
      return res.json({ message: "Already assigned" });
    }

    // If assigned to another user, block re-assignment by default
    if (currentAssignedUserId && currentAssignedUserId !== userId) {
      return res.status(409).json({ error: "Device already assigned to another user" });
    }

    // Update device with same fields but new user_id
    await updateDevice(device.id, {
      device_name: device.device_name,
      mac_address: device.mac_address,
      device_type: device.device_type,
      user_id: userId,
      passcode: device.passcode,
      status: device.status,
      bt_name: device.bt_name,
      warranty_start: device.warranty_start,
      default_cmd: device.default_cmd,
      first_connected_at: device.first_connected_at,
    });

    res.json({ message: "Assigned" });
  } catch (err) {
    next(err);
  }
}

export async function removeUser(req, res, next) {
  try {
    await deleteUser(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
}

export async function getUserDevices(req, res, next) {
  try {
    const userId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || undefined;
    const deviceType = req.query.deviceType || undefined;
    const search = req.query.search || undefined;

    // Ensure user exists (optional but helpful)
    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const result = await getDevicesByUserId(userId, {
      status,
      deviceType,
      search,
      page,
      limit,
    });

    res.json({
      success: true,
      user: { id: user.id, fullName: user.fullName, email: user.email },
      ...result,
    });
  } catch (err) {
    console.error("Error in getUserDevices:", err);
    next(err);
  }
}

// Public user login: authenticates against users table
export async function publicUserLogin(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (user.status && user.status !== 'active') {
      return res.status(403).json({ success: false, message: "Your account is not active" });
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash || '');
    if (!passwordOk) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Issue JWT with role 'user'
    const { generateToken } = await import('../utils/jwt.js');
    const token = generateToken({ id: user.id, email: user.email, role: 'user', status: user.status || 'active' });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          status: user.status || 'active'
        },
        token
      }
    });
  } catch (err) {
    next(err);
  }
}
