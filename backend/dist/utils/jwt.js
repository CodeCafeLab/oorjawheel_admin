import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
export function generateToken(user) {
    return jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role || 'admin',
        status: user.status || 'active' // Add status with a default value
    }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
}
export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    // Debug: Log the authorization header
    console.log('Auth Middleware Debug:', {
        url: req.url,
        method: req.method,
        authHeader: authHeader,
        allHeaders: req.headers
    });
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'No token provided',
            message: 'Authentication required'
        });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token',
            message: 'Please login again'
        });
    }
    // Check if user is active
    if (decoded.status !== 'active') {
        return res.status(403).json({
            success: false,
            error: 'Account inactive',
            message: 'Your account is not active'
        });
    }
    req.user = decoded;
    next();
}
export function adminMiddleware(req, res, next) {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
        return next();
    }
    return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Admin access required'
    });
}
// Middleware to check if user is admin (for login restriction)
export function requireAdminOnly(req, res, next) {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
        return next();
    }
    return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Only admin users can access this system'
    });
}
