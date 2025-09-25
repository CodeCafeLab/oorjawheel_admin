import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
// Error middlewares
import { errorHandler, notFound } from "./middleware/error.js";
// Authentication middleware
import { authMiddleware } from "./utils/jwt.js";
import authRoutes from "./routes/authRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import deviceMasterRoutes from "./routes/deviceMasterRoutes.js";
import pagesRoutes from "./routes/pageRoutes.js";
import sectionsRoutes from "./routes/sectionRoutes.js";
import elementsRoutes from "./routes/elementRoutes.js";
import deviceEventsRoutes from "./routes/deviceEventRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import usersRoutes from "./routes/userRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import commandLogRoutes from "./routes/commandLogRoutes.js";
import cmsRoutes from "./routes/cmsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import publicUserRoutes from "./routes/publicUserRoutes.js";
import publicDeviceRoutes from "./routes/publicDeviceRoutes.js";
import publicCommandRoutes from "./routes/publicCommandRoutes.js";
import userSettingsRoutes from "./routes/userSettingsRoutes.js";
const app = express();
const allowedOrigins = [
    'http://localhost:9002',
    'https://ow.codecafelab.in',
    'https://6000-firebase-studio-1754361228920.cluster-sumfw3zmzzhzkx4mpvz3ogth4y.cloudworkstations.dev',
    'https://ow.codecafelab.in',
    ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()) : [])
].filter(Boolean);
// Log allowed origins for debugging
console.log('Allowed CORS origins:', allowedOrigins);
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.some(allowedOrigin => origin === allowedOrigin ||
            origin.startsWith(allowedOrigin.replace('https://', 'http://')) ||
            origin.startsWith(allowedOrigin.replace('http://', 'https://')))) {
            callback(null, true);
        }
        else {
            console.log('CORS blocked for origin:', origin);
            callback(new Error(`Not allowed by CORS. Origin ${origin} not in allowed origins`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
// ---------------- Middlewares ----------------
app.use(express.json({ limit: "1mb", strict: false }));
app.use(morgan("dev"));
// JSON parse error handler (returns clear 400 message)
app.use((err, req, res, next) => {
    if (err && err.type === 'entity.parse.failed') {
        return res.status(400).json({ success: false, message: 'Invalid JSON body' });
    }
    next(err);
});
// ---------------- Routes ----------------
// Public routes (no authentication required)
app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/public/users", publicUserRoutes);
app.use("/api/public/devices", publicDeviceRoutes);
app.use("/api/public/commands", publicCommandRoutes);
app.use("/api/user-settings", userSettingsRoutes);
// Protected routes (authentication required)
app.use("/api/devices", authMiddleware, deviceRoutes);
app.use("/api/device-masters", authMiddleware, deviceMasterRoutes);
app.use("/api/pages", authMiddleware, pagesRoutes);
app.use("/api/sections", authMiddleware, sectionsRoutes);
app.use("/api/elements", authMiddleware, elementsRoutes);
app.use("/api/device-events", authMiddleware, deviceEventsRoutes);
app.use("/api/analytics", authMiddleware, analyticsRoutes);
app.use("/api/users", authMiddleware, usersRoutes);
app.use("/api/command-logs", authMiddleware, commandLogRoutes);
app.use("/api/cms", authMiddleware, cmsRoutes);
app.use("/api/notifications", authMiddleware, notificationRoutes);
// Settings routes
app.use('/api/settings', authMiddleware, settingsRoutes);
// ---------------- Error handlers ----------------
app.use(notFound);
app.use(errorHandler);
// ---------------- Server start ----------------
const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
    console.log(`🚀 Backend listening on http://localhost:${port}`);
});
