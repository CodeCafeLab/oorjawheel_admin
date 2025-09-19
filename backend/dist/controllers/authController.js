import bcrypt from 'bcryptjs';
import { findUserByEmail, findAdminByEmail, createAdmin } from '../models/authModel.js';
import { generateToken } from '../utils/jwt.js';
export async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        // First check admin table
        let user = await findAdminByEmail(email);
        // If not admin, check users table
        if (!user) {
            user = await findUserByEmail(email);
        }
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        const passwordOk = await bcrypt.compare(password, user.password_hash || '');
        if (!passwordOk) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        // Generate JWT token
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role || 'admin',
            status: user.status
        });
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role || 'admin',
                    status: user.status
                },
                token
            }
        });
    }
    catch (err) {
        console.error('Login error:', err);
        next(err);
    }
}
export async function registerAdmin(req, res, next) {
    try {
        const { name, email, password } = req.body;
        // Check if admin already exists
        const existingAdmin = await findAdminByEmail(email);
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin with this email already exists'
            });
        }
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Create admin
        const admin = await createAdmin({
            name,
            email,
            password_hash: hashedPassword,
            role: 'admin',
            status: 'active'
        });
        // Generate token
        const token = generateToken({
            id: admin.id,
            email: admin.email,
            role: 'admin',
            status: 'active'
        });
        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: {
                user: {
                    id: admin.id,
                    email: admin.email,
                    name: admin.name,
                    role: 'admin',
                    status: 'active'
                },
                token
            }
        });
    }
    catch (err) {
        console.error('Admin registration error:', err);
        next(err);
    }
}
export async function getCurrentUser(req, res, next) {
    try {
        // User is set by authMiddleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        res.json({
            success: true,
            data: {
                user: req.user
            }
        });
    }
    catch (err) {
        next(err);
    }
}
