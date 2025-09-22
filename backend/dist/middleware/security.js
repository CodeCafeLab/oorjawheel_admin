import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
// Rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        success: false,
        error: 'Too many login attempts',
        message: 'Please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// General API rate limiting
export const apiRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests',
        message: 'Please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Security headers middleware
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
});
// HTTPS enforcement middleware
export const enforceHTTPS = (req, res, next) => {
    // Skip HTTPS enforcement in development
    if (process.env.NODE_ENV === 'development') {
        return next();
    }
    // Check if request is secure (HTTPS)
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
        return next();
    }
    // Redirect to HTTPS
    const httpsUrl = `https://${req.get('host')}${req.url}`;
    return res.redirect(301, httpsUrl);
};
// Request validation middleware
export const validateRequest = (req, res, next) => {
    // Check for suspicious patterns
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /union\s+select/i,
        /drop\s+table/i,
        /delete\s+from/i,
        /insert\s+into/i,
        /update\s+set/i
    ];
    const bodyString = JSON.stringify(req.body);
    const queryString = JSON.stringify(req.query);
    const paramsString = JSON.stringify(req.params);
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(bodyString) || pattern.test(queryString) || pattern.test(paramsString)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request',
                message: 'Request contains potentially malicious content'
            });
        }
    }
    next();
};
// CORS security middleware
export const corsSecurity = (req, res, next) => {
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
};
// Request size limiting
export const requestSizeLimit = (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (contentLength > maxSize) {
        return res.status(413).json({
            success: false,
            error: 'Request too large',
            message: 'Request size exceeds 10MB limit'
        });
    }
    next();
};
