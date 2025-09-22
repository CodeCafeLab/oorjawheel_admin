import bcrypt from 'bcryptjs';
import { findUserByEmail, findAdminByEmail, createAdmin } from '../models/authModel.js';
import { generateToken } from '../utils/jwt.js';
export async function login(req, res, next) {
    try {
        const { email, password, redirectUrl } = req.body;
        // Only allow admin users to login
        const user = await findAdminByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        // Check if user is active
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Your account is not active. Please contact administrator.'
            });
        }
        const passwordOk = await bcrypt.compare(password, user.password_hash || '');
        if (!passwordOk) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        // Update last login
        const { updateAdmin } = await import('../models/authModel.js');
        await updateAdmin(user.id, { last_login: new Date() });
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
                    name: user.name,
                    role: user.role || 'admin',
                    status: user.status
                },
                token,
                redirectUrl: redirectUrl || '/'
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
        // Get fresh user data from database
        const { findAdminById } = await import('../models/authModel.js');
        const user = await findAdminById(req.user.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    status: user.status,
                    last_login: user.last_login,
                    created_at: user.created_at
                }
            }
        });
    }
    catch (err) {
        next(err);
    }
}
export async function logout(req, res, next) {
    try {
        // In a stateless JWT system, logout is handled client-side
        // by removing the token. For enhanced security, you could
        // implement a token blacklist here.
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (err) {
        next(err);
    }
}
